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

