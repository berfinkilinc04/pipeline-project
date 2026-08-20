const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pos_terminal_features WHERE risk_flag = 1');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Riskli cihazlar getirilemedi');
  }
});

module.exports = router;