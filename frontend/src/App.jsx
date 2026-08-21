import { useState, useEffect } from 'react';

function App() {
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

  useEffect(() => {
    musterileriGetir();
  }, []);

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
    </div>
  );
}

export default App;