const express = require("express");
const router = express.Router();
const pool = require("../db");

// tüm terminaller

router.get("/", async(req, res) =>{
    try{
        const result = await pool.query("SELECT * FROM pos_terminals");
        res.json(result.rows);    
    }
    catch (err){
        console.error(err);
        res.status(500).send("terminaller getirilemedi.");      
    }
});

// yeni terminal

router.post("/", async(req,res)=> {
    const { merchant_id, device_model, install_date, status, kapanma_nedeni, kullanim_tipi, model_kodu,servis_firması, seri_no} = req.body;

    // status "0" ise kapanma_nedeni zorunlu
    if(String(status) === "0" && (!kapanma_nedeni || kapanma_nedeni.trim()=="")){
        return req.status(400).json({hata: "cihaz kapalıysa kapanma nedeni zorunludur."})

    }
    try {
        const result = await pool.query(
            "INSERT INTO pos_terminals (merchant_id, device_model, install_date, status, kapanma_nedeni, kullanim_tipi, model_kodu, servis_firmasi, seri_no) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
            [merchant_id,device_model, install_date, status, kapanma_nedeni, kullanim_tipi, model_kodu, servis_firması, seri_no]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Yeni terminal oluşturulamadı.");
    }
});

// Terminal güncelle
router.put('/:terminal_id', async (req, res) => {
  const { terminal_id } = req.params;
  const { merchant_id, device_model, install_date, status, kapanma_nedeni, kullanim_tipi, model_kodu, servis_firmasi, seri_no } = req.body;

  if (String(status) === '0' && (!kapanma_nedeni || kapanma_nedeni.trim() === '')) {
    return res.status(400).json({ hata: 'Cihaz kapalıysa kapanma nedeni zorunludur' });
  }

  try {
    const result = await pool.query(
      `UPDATE pos_terminals SET merchant_id=$1, device_model=$2, install_date=$3, status=$4,
       kapanma_nedeni=$5, kullanim_tipi=$6, model_kodu=$7, servis_firmasi=$8, seri_no=$9
       WHERE terminal_id=$10 RETURNING *`,
      [merchant_id, device_model, install_date, status, kapanma_nedeni, kullanim_tipi, model_kodu, servis_firmasi, seri_no, terminal_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Terminal bulunamadı');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Terminal güncellenemedi');
  }
});

// Terminal sil
router.delete('/:terminal_id', async (req, res) => {
  const { terminal_id } = req.params;
  try {
    const result = await pool.query('DELETE FROM pos_terminals WHERE terminal_id = $1 RETURNING *', [terminal_id]);
    if (result.rows.length === 0) {
      return res.status(404).send('Terminal bulunamadı');
    }
    res.json({ mesaj: 'Terminal silindi', silinen: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Terminal silinemedi');
  }
});

module.exports = router;
