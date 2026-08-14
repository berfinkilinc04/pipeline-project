from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy import create_engine


default_args = {
    'owner': 'berfin',
    'depends_on_past': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=1),
}


def extract_pos_data(**kwargs):
    engine = create_engine('postgresql://berfinkilinc@localhost/pos_db')

    # Ana veri: daily_transactions + pos_terminals + merchants JOIN
    # sector, device_model, terminal status gibi bilgiler feature_engineering
    # aşamasında lazım olacağı için burada satırlara ekliyoruz.
    query = """
        SELECT
            dt.transaction_date,
            dt.terminal_id,
            dt.total_transaction_count,
            dt.total_amount,
            dt.failed_transaction_count,
            pt.merchant_id,
            pt.device_model,
            pt.install_date,
            pt.status AS terminal_status,
            m.merchant_name,
            m.sector,
            m.city,
            m.registration_date
        FROM daily_transactions dt
        JOIN pos_terminals pt ON dt.terminal_id = pt.terminal_id
        JOIN merchants m ON pt.merchant_id = m.merchant_id
    """
    df = pd.read_sql_query(query, engine)
    df.to_csv('/tmp/pos_raw_data.csv', index=False)
    print(f"PostgreSQL'den günlük işlemler (merchant/terminal bilgileriyle) "
          f"başarıyla çekildi. Satır sayısı: {len(df)}")

    # device_logs event-bazlı (log_date) bir tablo olduğu için ana tabloyla
    # aynı granülaritede değil -> ayrı çekip feature_engineering'de,
    # kendi mantığıyla (son N gün faulty var mı) özetleyip birleştireceğiz.
    device_query = """
        SELECT log_id, terminal_id, log_date, error_code, is_faulty
        FROM device_logs
    """
    device_df = pd.read_sql_query(device_query, engine)
    device_df.to_csv('/tmp/device_logs_raw.csv', index=False)
    print(f"Device logs başarıyla çekildi. Satır sayısı: {len(device_df)}")


def transform_and_clean_data(**kwargs):
    df = pd.read_csv('/tmp/pos_raw_data.csv')
    # Eksik verileri temizleme ve tip dönüşümleri

    df["transaction_date"]= pd.to_datetime(df["transaction_date"])
    df["total_amount"] = pd.to_numeric(df["total_amount"], errors="coerce")
    df["total_transaction_count"] = pd.to_numeric(df["total_transaction_count"], errors="coerce")
    df["failed_transaction_count"] = pd.to_numeric(df["failed_transaction_count"], errors="coerce")
    df = df.dropna(subset=["terminal_id", "total_amount"])
    df.to_csv("/tmp/pos_transformed_data.csv", index=False)
    print("Transform tamamlandı.")


    device_df = pd.read_csv('/tmp/device_logs_raw.csv')
    device_df["log_date"]=pd.to_datetime(device_df["log_date"])
    device_df= device_df.dropna(subset=["terminal_id"])
    device_df.to_csv("/tmp/device_logs_transformed.csv", index=False)
    print("Device logs tranform tamamlandı.")



def feature_engineering(**kwargs):
    df = pd.read_csv('/tmp/pos_transformed_data.csv')
    df["transaction_date"]=pd.to_datetime(df["transaction_date"])
    device_df = pd.read_csv('/tmp/device_logs_transformed.csv')
    device_df["log_date"]=pd.to_datetime(device_df["log_date"])

        # ---- 1) Temel terminal özetleri  ----
    terminal_features = df.groupby("terminal_id").agg(
        sector=("sector", "first"),
        total_days=("transaction_date", "count"),
        overall_volume= ("total_amount","sum"),
        avg_daily_volume= ("total_amount", "mean"),
        total_transactions=('total_transaction_count', 'sum'),
        total_failed_tx=("failed_transaction_count","sum")
    
    ).reset_index()

    terminal_features["failure_ratio"] = terminal_features["total_failed_tx"]/(terminal_features["total_transactions"] + 1)


         # ---- 2) Sektörel Eşikler (Sector-Aware Thresholds) ----
    sector_stats = terminal_features.groupby("sector")["avg_daily_volume"].agg(
        sector_avg="mean", sector_std="std"
    ).reset_index()
    terminal_features = terminal_features.merge(sector_stats, on="sector", how="left")
    terminal_features["sector_std"] = terminal_features["sector_std"].fillna(0)

    terminal_features["sector_deviation"] = (
        (terminal_features["avg_daily_volume"] - terminal_features["sector_avg"])
        / terminal_features["sector_std"].replace(0, np.nan)
    )
    terminal_features["sector_deviation"] = terminal_features["sector_deviation"].fillna(0)

    # Kendi sektör ortalamasının 1.5 std altında olan terminaller riskli
    low_sector_volume_flag = terminal_features["sector_deviation"] < -1.5



         # ---- 3) device_logs Entegrasyonu ----
    # Son 7 günde donanımsal/iletişimsel hata (is_faulty) üreten terminaller
    # ciroya bakılmaksızın doğrudan riskli sayılır.
    recent_cutoff = device_df["log_date"].max() - pd.Timedelta(days=7)
    recent_faults = (
        device_df[device_df["log_date"] >= recent_cutoff]
        .groupby("terminal_id")["is_faulty"]
        .max()
        .rename("recent_device_fault")
    )
    terminal_features = terminal_features.merge(recent_faults, on="terminal_id", how="left")
    terminal_features["recent_device_fault"] = terminal_features["recent_device_fault"].fillna(0).astype(int)

    # ---- 4) Nihai risk_flag  ----

    terminal_features["risk_flag"] = np.where(
        (terminal_features["recent_device_fault"] == 1)
        | low_sector_volume_flag,
        1, 0
    )

    terminal_features.to_csv("/tmp/pos_terminal_features.csv", index=False)
    print("Feature Engineering tamamlandı.")

def load_features_to_db(**kwargs):
    # 1. PostgreSQL bağlantı motorunu oluşturuyoruz
    engine = create_engine('postgresql://berfinkilinc@localhost/pos_db')
    
    # 2. Feature engineering adımında kaydedilen CSV dosyasını okuyoruz
    df = pd.read_csv('/tmp/pos_terminal_features.csv')
    
    # 3. Veriyi PostgreSQL veritabanına tablo olarak yazıyoruz
    # if_exists='replace' her çalıştırmada tabloyu günceller, index=False tabloya Pandas index'ini yazmaz
    df.to_sql('pos_terminal_features', engine, if_exists='replace', index=False)
    
    print(f"Başarılı! {len(df)} terminalin özellikleri PostgreSQL'deki 'pos_terminal_features' tablosuna yüklendi.")

with DAG(
    dag_id='pos_otomatik_etl_pipeline',
    default_args=default_args,
    description='POS ve Merchant işlemleri için Otomatik ETL ve Feature Engineering',
    start_date=datetime(2026, 8, 1),
    schedule_interval='@daily',
    catchup=False
) as dag:

    t1 = PythonOperator(
        task_id='extract_data',
        python_callable=extract_pos_data,
    )

    t2 = PythonOperator(
        task_id='transform_data',
        python_callable=transform_and_clean_data,
    )

    t3 = PythonOperator(
        task_id='feature_engineering',
        python_callable=feature_engineering,
    )

    t4 = PythonOperator(
    task_id='load_data',
    python_callable=load_features_to_db,
    )

    # Extract -> Transform -> Feature Engineering -> load
    t1 >> t2 >> t3 >> t4