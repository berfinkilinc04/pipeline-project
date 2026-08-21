const express = require("express");
const router = express.Router();
const pool= require("../db");

router.get("/", async(req, res)=>
{
    const { q } = req.query;

  if (!q || q.trim() === '') {
    return res.json({ customers: [], merchants: [], terminals: [] });
  }

  const arama = `%${q}%`;

  try {
    const musteriSonuc = await pool.query(
      `SELECT * FROM customers WHERE isim ILIKE $1 OR soyisim ILIKE $1 OR e_posta ILIKE $1`,
      [arama]
    );

    const merchantSonuc = await pool.query(
      `SELECT * FROM merchants WHERE merchant_name ILIKE $1 OR city ILIKE $1`,
      [arama]
    );

    const terminalSonuc = await pool.query(
      `SELECT * FROM pos_terminals WHERE device_model ILIKE $1 OR seri_no ILIKE $1`,
      [arama]
    );

    res.json({
      customers: musteriSonuc.rows,
      merchants: merchantSonuc.rows,
      terminals: terminalSonuc.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Arama sırasında hata oluştu');
  }
});

module.exports = router;
