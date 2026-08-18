-- 1. Üye İşyeri (Merchant) Tablosu
CREATE TABLE merchants (
    merchant_id SERIAL PRIMARY KEY,
    merchant_name VARCHAR(100),
    sector VARCHAR(50),            
    city VARCHAR(50),
    registration_date TIMESTAMP
);

-- 2. POS Cihazları (Terminals) Tablosu
CREATE TABLE pos_terminals (
    terminal_id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES merchants(merchant_id),
    device_model VARCHAR(50),
    install_date TIMESTAMP,
    status VARCHAR(20)              -- Active, Inactive, Maintenance
);

-- 3. Günlük İşlem Özetleri (Daily Transactions) Tablosu
CREATE TABLE daily_transactions (
    transaction_date DATE,
    terminal_id INT REFERENCES pos_terminals(terminal_id),
    total_transaction_count INT,
    total_amount DECIMAL(12,2),
    failed_transaction_count INT
);

-- 4. Cihaz Hata ve Log Tablosu (Arıza Tahmini için kritik)
CREATE TABLE device_logs (
    log_id SERIAL PRIMARY KEY,
    terminal_id INT REFERENCES pos_terminals(terminal_id),
    log_date TIMESTAMP,
    error_code VARCHAR(20),         
    is_faulty INT                   -- 0: Normal, 1: Arıza / Bakım Gerekiyor
);

-- 5. Customers 
CREATE TABLE customers(
    musteri_no SERIAL primary key,
    isim VARCHAR(50),
    soyisim VARCHAR(50),
    unvan VARCHAR(20),
    kayit_tarihi timestamp,
    adres VARCHAR(100),
    telefon VARCHAR(20),
    e_posta VARCHAR(30)
    
);

--- 6.Accounts
CREATE TABLE accounts(
    musteri_no int references customers(musteri_no),
    kayit_tarihi timestamp,
    durum VARCHAR(10),
    hesap_adi VARCHAR(40),
    doviz_kodu VARCHAR(10),
    bakiye NUMERIC(12,2),
    bloke_tutar NUMERIC(12,2),
    faiz_orani_baz_puan INT,
    iban VARCHAR(30)

);
