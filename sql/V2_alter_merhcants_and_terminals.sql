ALTER TABLE merchants
add column is_yeri_no varchar(20),
add column ad varchar(50),
add column kayit_tarihi timestamp,
add column durum varchar(20),
add column ortaklar varchar(100),
add column yonetici varchar(50),
add column adres_bilgileri varchar(100),
add column vergi_tc_no varchar(20),
add column işyeri_tipi varchar(20);

ALTER TABLE pos_terminals
add column kapanma_nedeni varchar(50),
add column kullanım_tipi varchar(20),
add column model_kodu varchar(20),
add column servis_firması varchar(50),
add column seri_no varchar(30);

