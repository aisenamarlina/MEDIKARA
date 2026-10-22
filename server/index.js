import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  initPostgres,
  isPgConnected,
  getStoreFromPg,
  getAllStoresFromPg,
  setStoreToPg,
  setBulkStoresToPg
} from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Helper Local Disk Storage ──────────────────────────────────────────────────
const readStore = (key, defaultVal = []) => {
  const file = path.join(DATA_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return defaultVal;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return defaultVal; }
};

const writeStore = (key, data) => {
  const file = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// ── ALL KEYS DEFINITION ───────────────────────────────────────────────────────
const ALL_KEYS = [
  'settings', 'sequences', 'users', 'incoming_letters', 'outgoing_letters',
  'certificates', 'warehouse_items', 'stock_in', 'stock_out', 'borrowings',
  'activity_logs', 'digital_archive', 'kop_simpan_pinjam', 'kop_gizi',
  'kop_kantin_items', 'kop_kantin_trx', 'asset_locations', 'asset_types',
  'asset_units', 'assets_inventaris', 'asset_maintenance', 'asset_relocations',
  'asset_opnames', 'inventory'
];

const defaults = {
  settings: {
    clinicName: "KLINIK BAITURRAHMAN GARUT", logo: "",
    address: "Jl. Merdeka No. 217, Jayaraga, Kec. Tarogong Kidul, Kabupaten Garut, Jawa Barat 44151",
    phone: "Telp. (0262) 234754 | HP/WhatsApp: 0813-2124-3303",
    email: "kbaiturrahmangarut@gmail.com", website: "",
    directorName: "Dr. H. Ahmad Fauzi, M.Kes", directorTitle: "Direktur Utama", city: "Garut",
    numFormatLetter: "{NO}/KBR/ADM/{BULAN_ROMAWI}/{TAHUN}",
    numFormatCert: "{NO}/SERT/KBR/{BULAN_ROMAWI}/{TAHUN}",
    numFormatIn: "BM-{NO}/{BULAN_ROMAWI}/{TAHUN}",
    numFormatOut: "BK-{NO}/{BULAN_ROMAWI}/{TAHUN}",
    numFormatBorrow: "PMJ-{NO}/{BULAN_ROMAWI}/{TAHUN}"
  },
  sequences: { letter: 25, cert: 5, stock_in: 8, stock_out: 4, borrow: 3 },
  users: [{ username: "admin", passwordHash: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918" }],
  asset_locations: [
    "BANGUNAN KLINIK (GEDUNG LAMA)", "BANGUNAN RB (LORONG GENSET)", "GUDANG APOTEK (RB)", "GUDANG PERKAKAS",
    "HALAMAN DEPAN GEDUNG KLINIK", "HALAMAN DEPAN GEDUNG RB (X)", "HALAMAN TENGAH", "JEMBATAN KLINIK - RB",
    "KANTIN", "LORONG LT 2 GEDUNG LAMA", "LORONG LT 2 RB ATAS", "LORONG LT BAWAH GEDUNG RB",
    "LORONG MANAJEMEN", "MASJID AL BURHAN", "MOBIL AMBULANCE", "NURSES STATION 1", "NURSES STATION 2",
    "PENAMPUNGAN SEMENTARA LB3", "POS SATPAM", "REKAM MEDIK", "RESEPSIONIS", "RUANG VK RB",
    "RUANG AA SETIAWAN BURHAN", "RUANG APOTEK", "RUANG ARPAH", "RUANG ARSIP KLINIK LT.2",
    "RUANG ASMAN ADUM DAN KERUMAH TANGGAAN", "RUANG ASMAN KEUANGAN", "RUANG ASMAN PENUNJANG MEDIS", "RUANG ASMAN SDM"
  ],
  asset_types: ["Tanah Hak Milik","Tanah HGB","Bangunan Layanan","Bangunan Pendukung","Alat Medis","Alat Kesehatan","Peralatan Kantor","Peralatan Perkakas","Elektronik & IT","Furniture","Kendaraan Operasional"],
  asset_units: ["Unit","M2","Pcs","Box","Set","Rim","Lot"],
  assets_inventaris: [
    { id: "3-3-16-106-2", category: "Barang/Benda", jenisAset: "Peralatan Kantor", namaAset: "Jam dinding + Kaligrafi", satuan: "Pcs", tanggalPerolehan: "2023-12-31", portability: ["Mudah dibawa"], kondisi: "Baik", hargaPerUnit: 150000, lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGAAN", pemegang: "NANANG ALAMSYAH, ST", keterangan: "Inventaris", biayaRincian: [], umurEkonomis: 5, nilaiResidu: 0 },
    { id: "3-2-12-106-2", category: "Barang/Benda", jenisAset: "Furniture", namaAset: "Kursi chitose-1", satuan: "Unit", tanggalPerolehan: "2023-12-31", portability: ["Tidak mudah dibawa"], kondisi: "Baik", hargaPerUnit: 350000, lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGAAN", pemegang: "NANANG ALAMSYAH, ST", keterangan: "MEUBEL", biayaRincian: [], umurEkonomis: 5, nilaiResidu: 0 }
  ],
  warehouse_items: [
    { code: "B-001", name: "Kertas A4 Sinar Dunia", category: "ATK", unit: "Rim", minStock: 10, currentStock: 25, location: "Rak ATK A1", condition: "Baik", notes: "" }
  ]
};

// ── SEED LOCAL DISK IF NEEDED ──────────────────────────────────────────────────
const seedIfNeeded = () => {
  for (const key of ALL_KEYS) {
    const file = path.join(DATA_DIR, `${key}.json`);
    if (!fs.existsSync(file)) {
      writeStore(key, defaults[key] !== undefined ? defaults[key] : []);
    }
  }
};

seedIfNeeded();

// Inisialisasi PostgreSQL saat server startup
initPostgres(ALL_KEYS, defaults, DATA_DIR).catch(err => {
  console.warn('[PostgreSQL] Inisialisasi tertunda:', err.message);
});

// ── API ENDPOINTS ──────────────────────────────────────────────────────────────

// GET semua data sekaligus (untuk hydration)
app.get('/api/all', async (req, res) => {
  try {
    const result = {};

    // 1. Coba ambil dari PostgreSQL jika terhubung
    let pgStores = null;
    if (isPgConnected()) {
      pgStores = await getAllStoresFromPg(ALL_KEYS);
    }

    // 2. Gabungkan dengan local files (fallback untuk key yang belum ada di DB)
    for (const key of ALL_KEYS) {
      if (pgStores && pgStores[key] !== undefined && pgStores[key] !== null) {
        result[key] = pgStores[key];
      } else {
        result[key] = readStore(key);
      }
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET satu key
app.get('/api/store/:key', async (req, res) => {
  const { key } = req.params;
  try {
    if (isPgConnected()) {
      const pgData = await getStoreFromPg(key);
      if (pgData !== null) {
        return res.json(pgData);
      }
    }

    const localData = readStore(key, null);
    if (localData === null) return res.status(404).json({ error: 'Not found' });
    res.json(localData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST simpan satu key (simpan ke PostgreSQL + backup ke local file)
app.post('/api/store/:key', async (req, res) => {
  const { key } = req.params;
  try {
    // 1. Simpan ke local disk backup
    writeStore(key, req.body);

    // 2. Simpan ke PostgreSQL jika terhubung
    if (isPgConnected()) {
      await setStoreToPg(key, req.body);
    }

    res.json({ ok: true, storage: isPgConnected() ? 'postgresql+local' : 'local_disk' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST simpan banyak key sekaligus (bulk write)
app.post('/api/bulk', async (req, res) => {
  try {
    const entries = req.body; // { key: value, ... }

    // 1. Simpan ke local disk files
    for (const [key, value] of Object.entries(entries)) {
      writeStore(key, value);
    }

    // 2. Simpan ke PostgreSQL jika terhubung
    if (isPgConnected()) {
      await setBulkStoresToPg(entries);
    }

    res.json({ ok: true, count: Object.keys(entries).length, storage: isPgConnected() ? 'postgresql+local' : 'local_disk' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    database: isPgConnected() ? 'PostgreSQL' : 'Local Disk Storage',
    postgresqlConnected: isPgConnected(),
    dataDir: DATA_DIR,
    time: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`SIBAKTI Server aktif di http://localhost:${PORT}`);
  console.log(`Database engine: ${isPgConnected() ? 'PostgreSQL' : 'Local Disk (server/data)'}`);
});
