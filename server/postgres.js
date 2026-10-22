import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
let isConnected = false;

export const isPgConnected = () => isConnected;

export const initPostgres = async (allKeys = [], defaultData = {}, dataDir = path.join(__dirname, 'data')) => {
  if (!databaseUrl || databaseUrl.includes('[YOUR-') || databaseUrl === 'your_postgresql_url_here') {
    console.log('[PostgreSQL] DATABASE_URL belum diatur atau masih placeholder di .env. Menggunakan local disk storage sebagai primary storage.');
    return false;
  }

  try {
    const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1');
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      max: 10
    });

    // Test connection
    const client = await pool.connect();
    console.log('[PostgreSQL] Berhasil terhubung ke database PostgreSQL!');
    isConnected = true;

    // Create app_storage table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_storage (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_app_storage_key ON app_storage(key);
    `);

    // Check existing rows in PostgreSQL
    const res = await client.query('SELECT key FROM app_storage');
    const existingKeys = new Set(res.rows.map(r => r.key));

    // Auto-migrate from local disk JSON files if PostgreSQL is empty or missing keys
    let migratedCount = 0;
    for (const key of allKeys) {
      if (!existingKeys.has(key)) {
        let initialVal = defaultData[key] !== undefined ? defaultData[key] : [];
        const localFile = path.join(dataDir, `${key}.json`);
        if (fs.existsSync(localFile)) {
          try {
            initialVal = JSON.parse(fs.readFileSync(localFile, 'utf8'));
          } catch {
            // use defaultVal
          }
        }

        await client.query(
          `INSERT INTO app_storage (key, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO NOTHING`,
          [key, JSON.stringify(initialVal)]
        );
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`[PostgreSQL] Berhasil migrasi/seeding awal ${migratedCount} koleksi ke tabel PostgreSQL.`);
    }

    client.release();
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Gagal terhubung ke PostgreSQL:', err.message);
    isConnected = false;
    return false;
  }
};

export const getStoreFromPg = async (key) => {
  if (!isConnected || !pool) return null;
  try {
    const res = await pool.query('SELECT data FROM app_storage WHERE key = $1 LIMIT 1', [key]);
    if (res.rows.length > 0) {
      return res.rows[0].data;
    }
    return null;
  } catch (err) {
    console.error(`[PostgreSQL] Gagal mengambil data "${key}":`, err.message);
    return null;
  }
};

export const getAllStoresFromPg = async (allKeys = []) => {
  if (!isConnected || !pool) return null;
  try {
    const res = await pool.query('SELECT key, data FROM app_storage');
    const map = {};
    for (const row of res.rows) {
      map[row.key] = row.data;
    }
    return map;
  } catch (err) {
    console.error('[PostgreSQL] Gagal mengambil all stores:', err.message);
    return null;
  }
};

export const setStoreToPg = async (key, data) => {
  if (!isConnected || !pool) return false;
  try {
    await pool.query(
      `INSERT INTO app_storage (key, data, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE
       SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(data)]
    );
    return true;
  } catch (err) {
    console.error(`[PostgreSQL] Gagal menyimpan data "${key}":`, err.message);
    return false;
  }
};

export const setBulkStoresToPg = async (entries) => {
  if (!isConnected || !pool) return false;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(entries)) {
      await client.query(
        `INSERT INTO app_storage (key, data, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(value)]
      );
    }
    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[PostgreSQL] Gagal bulk save ke PostgreSQL:', err.message);
    return false;
  } finally {
    client.release();
  }
};
