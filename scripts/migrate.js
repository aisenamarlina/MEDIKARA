import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('File .env tidak ditemukan. Silakan buat file .env terlebih dahulu.');
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const dbUrl = env.VITE_FIREBASE_DATABASE_URL;
if (!dbUrl || dbUrl === 'your_database_url_here') {
  console.error('VITE_FIREBASE_DATABASE_URL belum diatur di file .env.');
  process.exit(1);
}

const dataDir = path.join(__dirname, '../server/data');
if (!fs.existsSync(dataDir)) {
  console.error('Folder server/data tidak ditemukan.');
  process.exit(1);
}

const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'initialized.json');

console.log(`Menemukan ${files.length} file data lokal untuk dimigrasikan...`);

const payload = {};
for (const file of files) {
  const key = file.replace('.json', '');
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  payload[key] = data;
}

// REST URL: VITE_FIREBASE_DATABASE_URL/.json
let cleanUrl = dbUrl;
if (!cleanUrl.endsWith('/')) {
  cleanUrl += '/';
}
const requestUrl = `${cleanUrl}.json`;

console.log(`Mengirim data ke Firebase Realtime Database: ${requestUrl}`);

try {
  const response = await fetch(requestUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (response.ok) {
    console.log('✓ Migrasi database lokal ke Firebase Cloud BERHASIL!');
  } else {
    const errorText = await response.text();
    console.error(`✗ Gagal melakukan migrasi. Server merespon dengan status ${response.status}:`, errorText);
  }
} catch (error) {
  console.error('✗ Terjadi error saat melakukan koneksi ke Firebase:', error.message);
}
