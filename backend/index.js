require("dotenv").config();
const express = require("express");
const cors =  require("cors");
const pool = require('./db');
const musteriRoutes = require("./routes/musteriRoutes");
const riskRoutes = require('./routes/riskRoutes');
const posTerminalRoutes = require("./routes/posTerminalRoutes");
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());
app.use("/musteriler", musteriRoutes);
app.use('/riskli-cihazlar', riskRoutes);
app.use('/ara', searchRoutes);
app.use("/terminaller", posTerminalRoutes);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Veritabanı bağlantı hatası');
  }
});

app.listen(port, () => {
    console.log(`sunucu http://localhost:${port}/test-db adersinde çalışıyor.`)
});

