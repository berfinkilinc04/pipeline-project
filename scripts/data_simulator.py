import random
from datetime import datetime, timedelta
import pandas as pd
from sqlalchemy import create_engine

# 1. Veritabanı Bağlantısı (Kullanıcı adına göre güncellendi)
engine = create_engine('postgresql://berfinkilinc@localhost:5432/pos_db')

print("Veri simülasyonu başlatılıyor...")

# 2. Üye İşyerleri (Merchants) Üretimi (1,000 adet)
sectors = ['Market', 'Restoran', 'Akaryakıt', 'Giyim', 'Elektronik', 'Sağlık']
cities = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']

merchants_data = []
for i in range(1, 1001):
    merchants_data.append({
        'merchant_id': i,
        'merchant_name': f'Isyeri_{i}',
        'sector': random.choice(sectors),
        'city': random.choice(cities),
        'registration_date': datetime.now() - timedelta(days=random.randint(30, 730))
    })
df_merchants = pd.DataFrame(merchants_data)

# 3. POS Terminalleri Üretimi (Her işyerine rastgele 1 veya 2 terminal)
terminals_data = []
terminal_id_counter = 1
device_models = ['Model_A', 'Model_B', 'Model_C']
statuses = ['Active', 'Active', 'Active', 'Maintenance']

for _, merchant in df_merchants.iterrows():
    num_terminals = random.choice([1, 2])
    for _ in range(num_terminals):
        terminals_data.append({
            'terminal_id': terminal_id_counter,
            'merchant_id': merchant['merchant_id'],
            'device_model': random.choice(device_models),
            'install_date': merchant['registration_date'] + timedelta(days=random.randint(1, 10)),
            'status': random.choice(statuses)
        })
        terminal_id_counter += 1
        
df_terminals = pd.DataFrame(terminals_data)

# 4. Günlük İşlem Özetleri ve Cihaz Hata Logları (Son 90 gün)
transactions_data = []
logs_data = []
error_codes = ['ERR_CONN', 'ERR_PRINTER', 'TIMEOUT', 'AUTH_FAIL']

end_date = datetime.now().date()
start_date = end_date - timedelta(days=90)
date_list = pd.date_range(start=start_date, end=end_date, freq='D')

for _, terminal in df_terminals.iterrows():
    t_id = terminal['terminal_id']
    for single_date in date_list:
        # Günlük işlem ve hata simülasyonu
        tx_count = random.randint(5, 150)
        failed_count = int(tx_count * random.uniform(0.0, 0.08)) # %0-8 arası hata oranı
        total_amount = tx_count * random.uniform(100.0, 1500.0)
        
        transactions_data.append({
            'transaction_date': single_date.date(),
            'terminal_id': t_id,
            'total_transaction_count': tx_count,
            'total_amount': round(total_amount, 2),
            'failed_transaction_count': failed_count
        })
        
        # Risk analizi için belirli aralıklarla hata logları üretelim
        if failed_count > 5 or random.random() < 0.03:
            logs_data.append({
                'terminal_id': t_id,
                'log_date': datetime.combine(single_date, datetime.min.time()) + timedelta(hours=random.randint(8, 20)),
                'error_code': random.choice(error_codes),
                'is_faulty': 1 if random.random() < 0.25 else 0
            })

df_transactions = pd.DataFrame(transactions_data)
df_logs = pd.DataFrame(logs_data)

print(f"📊 Üretilen Veri Özeti:")
print(f"   - {len(df_merchants)} Üye İşyeri")
print(f"   - {len(df_terminals)} POS Terminali")
print(f"   - {len(df_transactions)} Günlük İşlem Kaydı")
print(f"   - {len(df_logs)} Cihaz Hata Logu")

# 5. Veritabanına Sıralı Aktarım (Foreign Key kısıtları nedeniyle önce ana tablolar)
print("Veritabanına aktarılıyor...")
df_merchants.to_sql('merchants', engine, if_exists='append', index=False)
df_terminals.to_sql('pos_terminals', engine, if_exists='append', index=False)
df_transactions.to_sql('daily_transactions', engine, if_exists='append', index=False)
if not df_logs.empty:
    df_logs.to_sql('device_logs', engine, if_exists='append', index=False)

print("Tüm veriler PostgreSQL'e aktarıldı!")