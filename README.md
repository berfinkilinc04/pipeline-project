Proje Planı :

1. DB (PostgreSQL) Tarafı

    customers (Müşteri No (Otomatik), Ad, Soyad, Ünvan, Kayıt Tarihi (Otomatik), Adres, Telefon, E-posta),
    accounts (Müşteri No, Kayıt Tarihi, Durum (Açık/Kapalı), Hesap Adı, Döviz Kodu (USD, EUR, TRY vb.), Bakiye, Bloke Tutar, Faiz Oranı, IBAN) tabloları sıfırdan modellenmeli. Basit olması için sistemde sadece 'Gerçek' müşteriler olacak.

    Mevcuttaki merchants ve pos_terminals tablolarına yeni kolonlar (pos_terminals için Kapanma Nedeni, Kullanım Tipi, Model Kodu, Servis Firması, Seri No- merchants için (İşyeri No, Ad, Kayıt Tarihi, Durum, Ortaklar, Yönetici, Adres Bilgileri, Vergi/TC No, İşyeri Tipi (Normal/Sanal)).
    Bunlar için bir migration script hazırlayıp ALTER ile tabloları güncellenmeli.

3. Backend (Node.js & Express) İskeleti

    Express projesi ayağa kaldırılır. pg (Postgres driver), cors gibi standart paketleri kurup DB connection pool yapısı bir oturtulur.

4. REST API & Endpoint'ler

    Müşteri Yönetimi: Standart CRUD operasyonlarını (GET, POST, PUT, DELETE) yazılmalı. TC Kimlik doğrulama işini (klasik mod 10 olayı) her yere copy-paste yapmamak için ayrı bir middleware veya ortak bir service olarak araya kaynatılabilir.

    İşyeri ve POS API'leri: Cihaz kapanıyorsa (status=0 ise) "kapanma nedeni" zorunlu olacak. Hem frontend hem backendde kontrolü yapılırsa iyi olur.

    Risk API'si: Risk yönetimi için pos_terminal_features tablosuna bakıp risk_flag=1 olan cihazları dönecek ayrı bir endpoint çıkarılabilir.

5. Frontend (React) Kurulumu

    React kullanılacak.

6. UI (Frontend) Geliştirmeleri

    Müşteri Formu: Tüm müşteri alanları input alınmalı. TC maskeleme gibi input formatları halledilmeli.

    Terminal ve İşyeri Formu: Kapanma durumu seçildiğinde UI'da kapanma nedeni alanını zorunlu yapıp ekranda göstereceğiz.

    Global Search: Tablodaki entity'ler (müşteri, hesap, pos vs.) tek bir yerden aranabilmeli.

    Dashboard: Anasayfaya tepede özet istatistik kartları (toplam müşteri, aktif terminal sayısı vs.) olsun. Altına da bizim Risk endpoint'tinden beslenen "Riskli Terminaller" grid'ini ekleyebilirsin. Tasarımı sana kalmış.
