import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl || dbUrl.includes('[YOUR-') || dbUrl === 'your_postgresql_url_here') {
  console.error('❌ Error: DATABASE_URL belum diatur dengan benar di file .env.');
  console.error('Contoh: DATABASE_URL=postgresql://postgres.xxx:mypassword@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres');
  process.exit(1);
}

const dataDir = path.join(__dirname, '../server/data');
if (!fs.existsSync(dataDir)) {
  console.error('❌ Error: Folder server/data tidak ditemukan.');
  process.exit(1);
}

const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocalhost ? false : { rejectUnauthorized: false }
});

async function runMigration() {
  console.log('🚀 Memulai migrasi data ke PostgreSQL...');
  console.log(`📡 Menghubungkan ke: ${dbUrl.split('@')[1] ? '***@' + dbUrl.split('@')[1] : dbUrl}`);

  let client;
  try {
    client = await pool.connect();
    console.log('✅ Koneksi PostgreSQL berhasil!');

    // Buat tabel jika belum ada
    console.log('📦 Menyiapkan tabel app_storage di PostgreSQL...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_storage (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_app_storage_key ON app_storage(key);
    `);

    // Baca semua file JSON di server/data/
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'initialized.json');
    console.log(`📁 Menemukan ${files.length} file data lokal yang siap dipindahkan:`);

    await client.query('BEGIN');
    let totalItems = 0;

    for (const file of files) {
      const key = file.replace('.json', '');
      const raw = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const data = JSON.parse(raw);
      const itemCount = Array.isArray(data) ? data.length : Object.keys(data).length;

      await client.query(
        `INSERT INTO app_storage (key, data, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET data = EXCLUDED.data, updated_at = CURRENT_TIMESTAMP`,
        [key, JSON.stringify(data)]
      );

      console.log(`  ✓ [${key}] -> ${itemCount} ${Array.isArray(data) ? 'records' : 'fields'} berhasil disimpan ke PostgreSQL`);
      totalItems += Array.isArray(data) ? itemCount : 1;
    }

    await client.query('COMMIT');

    console.log('\n🎉 ========================================================');
    console.log(`🎉 MIGRASI SUKSES! Total ${files.length} koleksi (${totalItems} item) telah tersimpan di PostgreSQL!`);
    console.log('🎉 Semua data lama Anda telah 100% aman dan siap digunakan.');
    console.log('========================================================\n');
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('❌ Gagal melakukan migrasi ke PostgreSQL:', err.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runMigration();
