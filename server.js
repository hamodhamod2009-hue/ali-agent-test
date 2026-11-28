const express = require('express');

const { Pool } = require('pg');

const path = require('path');

const app = express();

const pool = new Pool({

  connectionString: process.env.DATABASE_URL

});

app.get('/api/health', async (req, res) => {

  try {

    await pool.query('SELECT 1');

    res.json({ status: 'ok', database: 'connected' });

  } catch (err) {

    res.status(503).json({ status: 'error', database: 'disconnected' });

  }

});

app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'index.html'));

});

app.listen(process.env.PORT || 8080, '0.0.0.0');
