const express = require('express');

const { Pool } = require('pg');

const path = require('path');

const app = express();

const pool = new Pool({

  connectionString: process.env.DATABASE_URL

});

app.use(express.json({ limit: '10mb' }));
const AGENT_API_KEY = process.env.AGENT_API_KEY;
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
function requireAgentKey(req,res,next){if(!AGENT_API_KEY||req.get('x-agent-key')!==AGENT_API_KEY)return res.status(401).json({error:'Unauthorized'});next();}
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
app.post('/api/test-save', requireAgentKey, async (req, res) => {

  try {

    await pool.query(

      'INSERT INTO agent_data (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',

      [999999, JSON.stringify({ test: 'Ali Agent OK' })]

    );

    res.json({ status: 'ok' });

  } catch (err) {

    res.status(500).json({ status: 'error' });

  }

});

app.get('/api/test-read', requireAgentKey, async (req, res) => {

  try {

    const result = await pool.query(

      'SELECT data FROM agent_data WHERE id = $1',

      [999999]

    );

    res.json(result.rows[0]?.data || {});

  } catch (err) {

    res.status(500).json({ status: 'error' });

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
