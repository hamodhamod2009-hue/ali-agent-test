const express = require('express');

const { Pool } = require('pg');

const path = require('path');

const app = express();

const pool = new Pool({

  connectionString: process.env.DATABASE_URL

});

app.use(express.json({ limit: '10mb' }));

async function initDB() {

  await pool.query(`

    CREATE TABLE IF NOT EXISTS agent_data (

      id INTEGER PRIMARY KEY,

      data JSONB NOT NULL,

      updated_at TIMESTAMPTZ DEFAULT NOW()

    )

  `);

  console.log('agent_data table ready');

}

app.get('/api/health', async (req, res) => {

  try {

    await pool.query('SELECT 1');

    res.json({ status: 'ok', database: 'connected' });

  } catch (err) {

    res.status(503).json({

      status: 'error',

      database: 'disconnected'

    });

  }

});

app.get('/', (req, res) => {

  res.sendFile(path.join(__dirname, 'index.html'));

});

initDB().then(() => {

  app.listen(process.env.PORT || 8080, '0.0.0.0');

}).catch(err => {

  console.error('Database initialization failed', err.message);

  process.exit(1);

});
