import { useState, useEffect } from 'react';

function App() {
  // ---- MÜŞTERİ ----
  const [musteriler, setMusteriler] = useState([]);
  const [form, setForm] = useState({
    isim: '',
    soyisim: '',
    unvan: '',
    adres: '',
    telefon: '',
    e_posta: '',
    tc_kimlik_no: '',
  });

  const musterileriGetir = () => {
    fetch('http://localhost:5001/musteriler')
      .then((res) => res.json())
      .then((data) => setMusteriler(data))
      .catch((err) => console.error('Hata:', err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tc_kimlik_no') {
      const sadeceRakam = value.replace(/[^0-9]/g, '').slice(0, 11);
      setForm({ ...form, tc_kimlik_no: sadeceRakam });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:5001/musteriler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then(() => {
        musterileriGetir();
        setForm({
          isim: '',
          soyisim: '',
          unvan: '',
          adres: '',
          telefon: '',
          e_posta: '',
          tc_kimlik_no: '',
        });
      })
      .catch((err) => console.error('Hata:', err));
  };

  // ---- TERMİNAL ----
  const [terminaller, setTerminaller] = useState([]);
  const [terminalForm, setTerminalForm] = useState({
    merchant_id: '',
    device_model: '',
    install_date: '',
    status: '1',
    kapanma_nedeni: '',
    kullanim_tipi: '',
    model_kodu: '',
    servis_firmasi: '',
    seri_no: '',
  });

  const terminalleriGetir = () => {
    fetch('http://localhost:5001/terminaller')
      .then((res) => res.json())
      .then((data) => setTerminaller(data))
      .catch((err) => console.error('Hata:', err));
  };

  const handleTerminalChange = (e) => {
    const { name, value } = e.target;
    setTerminalForm({ ...terminalForm, [name]: value });
  };

  const handleTerminalSubmit = (e) => {
    e.preventDefault();

    fetch('http://localhost:5001/terminaller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(terminalForm),
    })
      .then((res) => res.json())
      .then(() => {
        terminalleriGetir();
        setTerminalForm({
          merchant_id: '',
          device_model: '',
          install_date: '',
          status: 'Active',
          kapanma_nedeni: '',
          kullanim_tipi: '',
          model_kodu: '',
          servis_firmasi: '',
          seri_no: '',
        });
      })
      .catch((err) => console.error('Hata:', err));
  };

  // ---- SAYFA AÇILINCA İKİSİNİ DE ÇEK ----
  useEffect(() => {
    musterileriGetir();
    terminalleriGetir();
  }, []);

  // ---- EKRANA ÇİZİLECEK KISIM ----
  return (
    <div>
      <h1>Müşteri Ekle</h1>
      <form onSubmit={handleSubmit}>
        <input name="isim" placeholder="İsim" value={form.isim} onChange={handleChange} />
        <input name="soyisim" placeholder="Soyisim" value={form.soyisim} onChange={handleChange} />
        <input name="unvan" placeholder="Unvan" value={form.unvan} onChange={handleChange} />
        <input name="adres" placeholder="Adres" value={form.adres} onChange={handleChange} />
        <input name="telefon" placeholder="Telefon" value={form.telefon} onChange={handleChange} />
        <input name="e_posta" placeholder="E-posta" value={form.e_posta} onChange={handleChange} />
        <input
          name="tc_kimlik_no"
          placeholder="TC Kimlik No"
          value={form.tc_kimlik_no}
          onChange={handleChange}
          maxLength={11}
        />
        <button type="submit">Müşteri Ekle</button>
      </form>

      <h1>Müşteri Listesi</h1>
      <ul>
        {musteriler.map((musteri) => (
          <li key={musteri.musteri_no}>
            {musteri.isim} {musteri.soyisim}
          </li>
        ))}
      </ul>

      <h1>Terminal Ekle</h1>
      <form onSubmit={handleTerminalSubmit}>
        <input name="merchant_id" placeholder="Merchant ID" value={terminalForm.merchant_id} onChange={handleTerminalChange} />
        <input name="device_model" placeholder="Cihaz Modeli" value={terminalForm.device_model} onChange={handleTerminalChange} />
        <input name="install_date" type="date" value={terminalForm.install_date} onChange={handleTerminalChange} />

        <select name="status" value={terminalForm.status} onChange={handleTerminalChange}>
          <option value="Active">Açık</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Inactive">Kapalı</option>
        </select>

        {terminalForm.status === 'Inactive' && (
          <input
            name="kapanma_nedeni"
            placeholder="Kapanma Nedeni (zorunlu)"
            value={terminalForm.kapanma_nedeni}
            onChange={handleTerminalChange}
            required
          />
        )}

        <input name="kullanim_tipi" placeholder="Kullanım Tipi" value={terminalForm.kullanim_tipi} onChange={handleTerminalChange} />
        <input name="model_kodu" placeholder="Model Kodu" value={terminalForm.model_kodu} onChange={handleTerminalChange} />
        <input name="servis_firmasi" placeholder="Servis Firması" value={terminalForm.servis_firmasi} onChange={handleTerminalChange} />
        <input name="seri_no" placeholder="Seri No" value={terminalForm.seri_no} onChange={handleTerminalChange} />

        <button type="submit">Terminal Ekle</button>
      </form>

      <h1>Terminal Listesi</h1>
      <ul>
        {terminaller.map((terminal) => (
          <li key={terminal.terminal_id}>
            {terminal.device_model} — {terminal.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;