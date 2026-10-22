import pg from 'pg';

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
function getPool() {
  if (!pool && dbUrl) {
    const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
    pool = new Pool({
      connectionString: dbUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      max: 5
    });
  }
  return pool;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const p = getPool();
  if (!p) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  try {
    const result = await p.query('SELECT key, data FROM app_storage');
    const map = {};
    for (const row of result.rows) {
      map[row.key] = row.data;
    }
    return res.status(200).json(map);
  } catch (err) {
    console.error('Error in /api/all:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
