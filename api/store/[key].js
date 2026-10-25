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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Missing key parameter' });
  }

  const p = getPool();
  if (!p) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  if (req.method === 'GET') {
    try {
      const result = await p.query('SELECT data FROM app_storage WHERE key = $1 LIMIT 1', [key]);
      if (result.rows.length > 0) {
        return res.status(200).json(result.rows[0].data);
      }
      return res.status(404).json({ error: 'Not found' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const payload = req.body;
      await p.query(
        `INSERT INTO app_storage (key, data, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(payload)]
      );
      return res.status(200).json({ ok: true, key });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await p.query('DELETE FROM app_storage WHERE key = $1', [key]);
      return res.status(200).json({ ok: true, deleted: key });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
