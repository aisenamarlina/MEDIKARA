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

const defaultAssetUnits = [
  "Unit",
  "M2",
  "Pcs",
  "Box",
  "Set",
  "Rim",
  "Lot"
];

const defaultAssetTypes = [
  "Tanah Hak Milik",
  "Tanah HGB",
  "Bangunan Layanan",
  "Bangunan Pendukung",
  "Alat Medis",
  "Alat Kesehatan",
  "Peralatan Kantor",
  "Peralatan Perkakas",
  "Elektronik & IT",
  "Furniture",
  "Kendaraan Operasional",
  "Non-Medis"
];

const defaultAssetLocations = [
  "BANGUNAN KLINIK (GEDUNG LAMA)",
  "BANGUNAN RB (LORONG GENSET)",
  "GUDANG APOTEK (RB)",
  "HALAMAN DEPAN GEDUNG KLINIK",
  "HALAMAN DEPAN GEDUNG RB (X)",
  "HALAMAN TENGAH",
  "JEMBATAN KLINIK - RB",
  "LORONG LT 2 GEDUNG LAMA",
  "LORONG LT 2 RB ATAS",
  "LORONG LT BAWAH GEDUNG RB",
  "LORONG MANAJEMEN",
  "MASJID AL BURHAN",
  "MOBIL AMBULANCE",
  "NURSES STATION 1",
  "NURSES STATION 2",
  "PENAMPUNGAN SEMENTARA LB3",
  "POS SATPAM",
  "REKAM MEDIK",
  "RESEPSIONIS",
  "RUANG VK RB",
  "RUANG AA SETIAWAN BURHAN",
  "RUANG APOTEK",
  "RUANG ARPAH",
  "RUANG ARSIP KLINIK LT.2",
  "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
  "RUANG ASMAN KEUANGAN",
  "RUANG ASMAN PENUNJANG MEDIS",
  "RUANG ASMAN SDM",
  "GUDANG PERKAKAS",
  "KANTIN"
];

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
    const result = await p.query("SELECT key, data FROM app_storage WHERE key NOT LIKE 'file_%' AND key NOT LIKE 'file:%'");
    const map = {};
    for (const row of result.rows) {
      map[row.key] = row.data;
    }

    // Pastikan master data aset tidak kosong
    const criticalDefaults = {
      asset_units: defaultAssetUnits,
      asset_types: defaultAssetTypes,
      asset_locations: defaultAssetLocations
    };

    for (const [key, defaultVal] of Object.entries(criticalDefaults)) {
      if (!map[key] || !Array.isArray(map[key]) || map[key].length === 0) {
        map[key] = defaultVal;
        p.query(
          "INSERT INTO app_storage (key, data, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP) ON CONFLICT (key) DO UPDATE SET data = $2",
          [key, JSON.stringify(defaultVal)]
        ).catch(() => {});
      }
    }

    return res.status(200).json(map);
  } catch (err) {
    console.error('Error in /api/all:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
