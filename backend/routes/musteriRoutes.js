const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) =>{
    try{
        const result = await pool.query("SELECT * FROM customers")
        res.json(result.rows);
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
});

// müşteri ekleme endpoint'i
router.post("/", async (req, res) => {
    const { isim, soyisim, unvan, adres, telefon, e_posta, tc_kimlik_no } = req.body;

    try {
        const result = await pool.query(
            "INSERT INTO customers (isim, soyisim, unvan, adres, telefon, e_posta, tc_kimlik_no, kayit_tarihi) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *",
            [isim, soyisim, unvan, adres, telefon, e_posta, tc_kimlik_no]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
});

// müşteri güncelleme endpoint'i
router.put("/:müsteri_no", async (req, res)=>{
    const { musteri_no } = req.params;
    const {isim,soyisim,unvan,adres, telefon, e_posta, tc_kimlik_no} = req.body;

    try{ 
        const result =  await pool.query(
            "UPDATE customers SET isim= $1, soyisim=$2, unvan=$3, adres=$4,telefon=$5, e_posta=$6, tc_kimlik_no=$7 WHERE musteri_no=$8 RETURNING *",
            [isim, soyisim, unvan, adres, telefon, e_posta, tc_kimlik_no, musteri_no]
        );
    if (result.rows.length === 0){
        return res.status(404).send("müşteri bulunamadı.");
    
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "Veritabanı hatası" });
}
});

// müşteri silme endpoint'i
router.delete("/:musteri_no", async(req, res)=>{
    const { musteri_no} = req.params;
    try{
        const result = await pool.query(
            "DELETER FROM customers WHERE musteri_no= $1 RETURNING *",
            [musteri_no]
        );
        if (result.rows.length === 0){
            return res.status(404).send("müşteri bulunamadı.");    
        }

     res.json({ mesaj: 'Müşteri silindi.', silinen: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Müşteri silinemedi.');
  }
});


module.exports = router;