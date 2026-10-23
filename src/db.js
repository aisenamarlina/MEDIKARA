// ============================================================
// db.js — Database & Persistence Layer MEDIKARA
// Primary Database: PostgreSQL (Neon / Supabase / Cloud PG)
// Client Cache: localStorage & IndexedDB for fast instant UI & offline resilience
// ============================================================

import {
  defaultSettings,
  defaultSequences,
  defaultOutgoingLetters,
  defaultCertificates,
  defaultIncomingLetters,
  defaultWarehouseItems,
  defaultStockIn,
  defaultStockOut,
  defaultBorrowings,
  defaultAssetsInventaris,
  defaultAssetLocations,
  defaultAssetTypes,
  defaultAssetUnits,
  defaultDigitalArchive,
  defaultUsers
} from './defaultData';

const LS_PREFIX = 'kbr_db_';

const ARRAY_COLLECTIONS = new Set([
  'outgoing_letters',
  'incoming_letters',
  'certificates',
  'digital_archive',
  'warehouse_items',
  'stock_in',
  'stock_out',
  'borrowings',
  'assets_inventaris',
  'asset_locations',
  'asset_types',
  'asset_units',
  'asset_relocations',
  'asset_opnames',
  'activity_logs',
  'users',
  'asset_maintenance',
  'inventory',
  'assets'
]);

// ── Multi-tab / Multi-window Synchronization Bus ──
const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('medikara_sync_bus')
  : null;

const notifySync = (key, data) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app-db-sync', { detail: { key, data } }));
  }
  if (syncChannel) {
    try {
      syncChannel.postMessage({ key, data });
    } catch {
      // Data format not cloneable, ignore
    }
  }
};

if (syncChannel) {
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.key) {
      const { key, data } = event.data;
      try {
        if (data !== undefined && data !== null) {
          lsSet(key, data, true);
        }
      } catch (err) {
        console.warn(`[MEDIKARA] Error syncing key "${key}" from channel:`, err);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app-db-sync', { detail: { key, data } }));
      }
    }
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith(LS_PREFIX)) {
      const key = e.key.replace(LS_PREFIX, '');
      let parsed = null;
      try { parsed = JSON.parse(e.newValue); } catch { parsed = e.newValue; }
      window.dispatchEvent(new CustomEvent('app-db-sync', { detail: { key, data: parsed } }));
    }
  });
}

// ── Sanitize payload: strip undefined and extract heavy fileData for storage & Firebase ──
export const cleanForStorageAndFirebase = (data) => {
  if (data === undefined || data === null) return null;

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined && item !== null)
      .map(item => cleanForStorageAndFirebase(item));
  }

  if (typeof data === 'object') {
    const cleaned = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) {
        cleaned[k] = null;
      } else if (k === 'fileData' && typeof v === 'string' && v.length > 300) {
        // Heavy base64 string is stored safely in IndexedDB, keep metadata in localStorage & cloud
        cleaned[k] = null;
        cleaned['hasStoredFile'] = true;
      } else if (typeof v === 'object' && v !== null) {
        cleaned[k] = cleanForStorageAndFirebase(v);
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned;
  }

  return data;
};

// ── Normalisasi koleksi agar selalu mengembalikan Array jika tipe koleksi adalah array ──
export const normalizeCollection = (key, rawData, defaultVal = null) => {
  const isArrayType = ARRAY_COLLECTIONS.has(key) || Array.isArray(defaultVal);

  if (isArrayType) {
    if (rawData === null || rawData === undefined) {
      return Array.isArray(defaultVal) ? defaultVal : [];
    }
    if (Array.isArray(rawData)) {
      return rawData.filter(item => item !== null && item !== undefined);
    }
    if (typeof rawData === 'object') {
      // Firebase RTD numeric object map { "0": item0, "1": item1 }
      return Object.values(rawData).filter(item => item !== null && item !== undefined);
    }
    return Array.isArray(defaultVal) ? defaultVal : [];
  }

  // Object types (settings, sequences, etc.)
  if (rawData === null || rawData === undefined) {
    return defaultVal !== null ? defaultVal : {};
  }
  if (typeof rawData === 'object') {
    return rawData;
  }
  return defaultVal !== null ? defaultVal : {};
};

export const sanitizeUsers = (users) => {
  const normalized = normalizeCollection('users', users, defaultUsers);
  if (!Array.isArray(normalized) || normalized.length === 0) return { list: defaultUsers, changed: true };
  let changed = false;
  let list = normalized.map(u => {
    if (u.username === 'admin') {
      return {
        ...u,
        id: u.id || 'usr-001',
        username: 'admin',
        password: u.password || 'admin',
        name: u.name || 'Admin',
        role: u.role || 'Administrator',
        department: u.department || 'Unit IT',
        email: u.email || 'kbaiturrahmangarut@gmail.com',
        avatarColor: u.avatarColor || '#0d9488'
      };
    }
    if (u.username === 'allisa') {
      changed = true;
      return {
        ...u,
        id: 'usr-001',
        username: 'admin',
        password: 'admin',
        name: 'Admin',
        role: 'Administrator',
        department: 'Unit IT',
        email: 'kbaiturrahmangarut@gmail.com',
        avatarColor: '#0d9488'
      };
    }
    return u;
  });

  if (!list.some(u => u.username === 'direktur')) {
    changed = true;
    list.push({
      id: 'usr-002',
      username: 'direktur',
      password: 'direktur',
      name: 'Dr. H. Ahmad Fauzi, M.Kes',
      role: 'Direktur Utama',
      department: 'Pimpinan & Direksi',
      email: 'direktur@klinikbaiturrahman.com',
      avatarColor: '#1e4a35'
    });
  }

  return { list, changed };
};

// ── localStorage helpers ────────────────────────────────────
const lsGet = (key, defaultVal = null) => {
  if (typeof window === 'undefined') return defaultVal;
  const fallback = defaultVal !== null ? defaultVal : (ARRAY_COLLECTIONS.has(key) ? [] : {});
  const data = localStorage.getItem(LS_PREFIX + key);
  if (data === null || data === undefined) return fallback;
  try {
    const val = JSON.parse(data);
    if (key === 'users') {
      const sanitized = sanitizeUsers(val);
      if (sanitized.changed) {
        localStorage.setItem(LS_PREFIX + 'users', JSON.stringify(sanitized.list));
      }
      return sanitized.list;
    }
    if (key === 'digital_archive') {
      const normalizedArc = normalizeCollection(key, val, defaultDigitalArchive)
        .filter(item => !['AR-2026-001', 'AR-2026-002', 'AR-2026-003', 'AR-2026-004'].includes(item.id));
      if (!Array.isArray(normalizedArc) || normalizedArc.length === 0 || !normalizedArc.some(d => d.id === 'AR-2023-001' || (d.title && d.title.includes('Tata Naskah')))) {
        return mergeCollections('digital_archive', normalizedArc, defaultDigitalArchive);
      }
      return normalizedArc;
    }
    return normalizeCollection(key, val, fallback);
  } catch {
    return fallback;
  }
};

const lsSet = (key, data, skipBroadcast = false) => {
  if (typeof window === 'undefined') return;
  const cleaned = cleanForStorageAndFirebase(data);
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(cleaned));
  } catch (e) {
    console.warn(`[MEDIKARA] localStorage quota reached for key "${key}", performing emergency storage cleanup...`, e);
    try {
      // Clear out obsolete heavy keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) {
          const raw = localStorage.getItem(k);
          if (raw && raw.includes('data:')) {
            try {
              const parsed = JSON.parse(raw);
              const sanitizedItem = cleanForStorageAndFirebase(parsed);
              localStorage.setItem(k, JSON.stringify(sanitizedItem));
            } catch {
              // ignore
            }
          }
        }
      }
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(cleaned));
    } catch (innerErr) {
      console.error(`[MEDIKARA] Failed to save key "${key}" to localStorage:`, innerErr);
    }
  }
  if (!skipBroadcast) {
    notifySync(key, data);
  }
};

// ── Simpan ke Server Backend (PostgreSQL Neon) ──
const pushToServer = async (key, data) => {
  try {
    const cleaned = cleanForStorageAndFirebase(data);
    const res = await fetch(`/api/store/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleaned)
    });
    if (!res.ok) {
      console.warn(`[MEDIKARA] pushToServer("${key}") returned HTTP status: ${res.status}`);
    }
  } catch (err) {
    // Mode offline / server backend sedang starting
  }
};

const seedInitialDataIfEmpty = () => {
  const isInitialized = localStorage.getItem(LS_PREFIX + '__system_initialized');
  if (isInitialized) {
    return;
  }

  const seedIfEmpty = (key, defaultData) => {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (raw === null || raw === undefined) {
      lsSet(key, defaultData);
      pushToServer(key, defaultData);
    }
  };

  seedIfEmpty('settings', defaultSettings);
  seedIfEmpty('sequences', defaultSequences);
  seedIfEmpty('outgoing_letters', defaultOutgoingLetters);
  seedIfEmpty('certificates', defaultCertificates);
  seedIfEmpty('incoming_letters', defaultIncomingLetters);
  seedIfEmpty('warehouse_items', defaultWarehouseItems);
  seedIfEmpty('stock_in', defaultStockIn);
  seedIfEmpty('stock_out', defaultStockOut);
  seedIfEmpty('borrowings', defaultBorrowings);
  seedIfEmpty('assets_inventaris', defaultAssetsInventaris);
  seedIfEmpty('asset_locations', defaultAssetLocations);
  seedIfEmpty('asset_types', defaultAssetTypes);
  seedIfEmpty('asset_units', defaultAssetUnits);
  seedIfEmpty('digital_archive', defaultDigitalArchive);
  seedIfEmpty('users', defaultUsers);

  // Tandai bahwa sistem sudah diinisialisasi
  localStorage.setItem(LS_PREFIX + '__system_initialized', 'true');
};

// ── Merge helper: gabungkan data cloud PostgreSQL dengan data lokal ──
const mergeCollections = (key, localData, cloudData) => {
  if (!ARRAY_COLLECTIONS.has(key)) {
    return cloudData || localData;
  }

  const localArray = normalizeCollection(key, localData, []);
  const cloudArray = normalizeCollection(key, cloudData, []);

  if (localArray.length === 0) return cloudArray;
  if (cloudArray.length === 0) return localArray;

  // Gabungkan berdasarkan unique ID
  const map = new Map();
  cloudArray.forEach(item => {
    if (item && item.id) map.set(item.id, item);
    else if (item && item.docNo) map.set(item.docNo, item);
  });
  localArray.forEach(item => {
    if (item && item.id) map.set(item.id, item);
    else if (item && item.docNo) map.set(item.docNo, item);
  });

  return Array.from(map.values());
};

// ── initDB: dipanggil di App.jsx, await sebelum render ─────
export const initDB = async () => {
  // 1. Ambil data terbaru langsung dari PostgreSQL (via Server API /api/all)
  try {
    const res = await fetch('/api/all');
    if (res.ok) {
      const serverData = await res.json();
      for (const [k, v] of Object.entries(serverData)) {
        if (v !== undefined && v !== null) {
          if (k === 'settings') {
            const localSettings = lsGet('settings', defaultSettings);
            const mergedSettings = {
              ...defaultSettings,
              ...localSettings,
              ...v,
              signature: v.signature || localSettings.signature || defaultSettings.signature,
              stamp: v.stamp || localSettings.stamp || defaultSettings.stamp,
              logo: v.logo || localSettings.logo || defaultSettings.logo || '/logo.png'
            };
            lsSet('settings', mergedSettings, true);
            if (!v.signature || !v.stamp) {
              pushToServer('settings', mergedSettings);
            }
          } else {
            const normalized = normalizeCollection(k, v);
            lsSet(k, normalized, true);
          }
        }
      }
      console.log('[MEDIKARA] Data berhasil dimuat langsung dari PostgreSQL (Neon Database)');
    }
  } catch {
    console.log('[MEDIKARA] Server backend belum aktif, menggunakan cache lokal');
  }

  // 2. Selalu pastikan data awal/bawaan terisi jika storage masih baru pertama kali dibuka
  seedInitialDataIfEmpty();

  // 3. Pastikan skema akun admin dan direktur termutakhirkan
  const existingUsers = lsGet('users', defaultUsers);
  if (Array.isArray(existingUsers) && existingUsers.length > 0) {
    const sanitized = sanitizeUsers(existingUsers);
    if (sanitized.changed) {
      lsSet('users', sanitized.list);
      pushToServer('users', sanitized.list);
    }
    const sessionUserData = lsGet('kbr_session_user_data');
    if (sessionUserData && sessionUserData.username === 'admin' && sessionUserData.role !== 'Administrator') {
      sessionUserData.role = 'Administrator';
      lsSet('kbr_session_user_data', sessionUserData);
    }
  }

  // 4. Pastikan logo selalu menggunakan PNG transparan (/logo.png) & email resmi terupdate
  const currentSettings = lsGet('settings', defaultSettings);
  let settingsChanged = false;
  const isOldOrJpgLogo = !currentSettings.logo || 
    currentSettings.logo.includes('logo-klinik') || 
    currentSettings.logo.endsWith('.jpg') || 
    currentSettings.logo.endsWith('.jpeg') || 
    currentSettings.logo.startsWith('data:image/jpeg');
  if (currentSettings && isOldOrJpgLogo) {
    currentSettings.logo = '/logo.png';
    settingsChanged = true;
  }
  if (currentSettings && (!currentSettings.email || currentSettings.email === 'kbaiturrahmangarut@gmail.com' || currentSettings.email === 'klinik_baiturrahman@rocketmail.com')) {
    currentSettings.email = 'klinikbaiturrahman@rocketmail.com';
    settingsChanged = true;
  }
  if (currentSettings && (!currentSettings.address || currentSettings.address.includes('Jayaraga') || currentSettings.address.includes('Kabupaten Garut') || currentSettings.address.includes('Tarogong Kidul-Garut') || currentSettings.address.endsWith(','))) {
    currentSettings.address = 'Jl. Merdeka No. 217 Tarogong Kidul - Garut';
    settingsChanged = true;
  }
  if (currentSettings && (!currentSettings.phone || currentSettings.phone.includes('WhatsApp') || currentSettings.phone.includes('HP.  ') || currentSettings.phone.includes('(0262)'))) {
    currentSettings.phone = 'Telp. 0262-234754, HP. 0813-2124-3303';
    settingsChanged = true;
  }
  if (settingsChanged) {
    lsSet('settings', currentSettings);
    pushToServer('settings', currentSettings);
  }

  // 5. Pastikan Arsip Digital bersih dari berkas demo lama dan selalu memuat Pedoman Tata Naskah
  const currentArchive = lsGet('digital_archive', defaultDigitalArchive);
  const cleanedArchive = (Array.isArray(currentArchive) ? currentArchive : [])
    .filter(item => !['AR-2026-001', 'AR-2026-002', 'AR-2026-003', 'AR-2026-004'].includes(item.id));
  if (!cleanedArchive.some(d => d.id === 'AR-2023-001' || (d.title && d.title.includes('Tata Naskah')))) {
    cleanedArchive.unshift(defaultDigitalArchive[0]);
  }
  lsSet('digital_archive', cleanedArchive);
  pushToServer('digital_archive', cleanedArchive);

  // Notifikasi seluruh modul UI bahwa database lokal & PostgreSQL telah sinkron penuh
  notifySync('__all__', null);
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[MEDIKARA] Koneksi online kembali, menyinkronkan data tertunda...');
    const dirtyKeys = lsGet('__dirty_keys', []);
    if (dirtyKeys.length > 0) {
      for (const key of dirtyKeys) {
        const val = lsGet(key);
        if (val !== undefined && val !== null) {
          await pushToServer(key, val);
        }
      }
      localStorage.removeItem(LS_PREFIX + '__dirty_keys');
      console.log('[MEDIKARA] Sinkronisasi offline selesai.');
    }
  });
}

// ── db object (API publik) ──────────────────────────────────
export const db = {
  get: (key, defaultVal = null) => lsGet(key, defaultVal),

  set: (key, data) => {
    lsSet(key, data);
    pushToServer(key, data);
  },

  addLog: (activity, module, notes) => {
    const logs = lsGet('activity_logs', []);
    logs.unshift({
      time: new Date().toISOString(),
      activity,
      module,
      notes
    });
    
    if (logs.length > 500) logs.splice(500);
    
    lsSet('activity_logs', logs);
    pushToServer('activity_logs', logs);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `${activity}`, type: 'success' } 
      }));
    }
  },

  generateDocNo: (type) => {
    const sequences = lsGet('sequences', {});
    const settings = lsGet('settings', {});
    const currentNum = (sequences[type] || 0) + 1;
    
    sequences[type] = currentNum;
    lsSet('sequences', sequences);
    pushToServer('sequences', sequences);

    const numStr = String(currentNum).padStart(3, "0");
    const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    const now = new Date();
    const romanMonth = romanMonths[now.getMonth()];
    const year = now.getFullYear();

    let template = "";
    if (type === "letter") template = settings.numFormatLetter || "{NO}/KBR/ADM/{BULAN_ROMAWI}/{TAHUN}";
    else if (type === "cert") template = settings.numFormatCert || "{NO}/SERT/KBR/{BULAN_ROMAWI}/{TAHUN}";
    else if (type === "stock_in") template = settings.numFormatIn || "BM-{NO}/{BULAN_ROMAWI}/{TAHUN}";
    else if (type === "stock_out") template = settings.numFormatOut || "BK-{NO}/{BULAN_ROMAWI}/{TAHUN}";
    else if (type === "borrow") template = settings.numFormatBorrow || "PMJ-{NO}/{BULAN_ROMAWI}/{TAHUN}";

    return template
      .replace("{NO}", numStr)
      .replace("{BULAN_ROMAWI}", romanMonth)
      .replace("{TAHUN}", year);
  },

  resetToDemoData: () => {
    lsSet('settings', defaultSettings);
    lsSet('sequences', defaultSequences);
    lsSet('outgoing_letters', defaultOutgoingLetters);
    lsSet('certificates', defaultCertificates);
    lsSet('incoming_letters', defaultIncomingLetters);
    lsSet('warehouse_items', defaultWarehouseItems);
    lsSet('stock_in', defaultStockIn);
    lsSet('stock_out', defaultStockOut);
    lsSet('borrowings', defaultBorrowings);
    lsSet('assets_inventaris', defaultAssetsInventaris);
    lsSet('asset_locations', defaultAssetLocations);
    lsSet('asset_types', defaultAssetTypes);
    lsSet('asset_units', defaultAssetUnits);
    lsSet('digital_archive', defaultDigitalArchive);

    pushToServer('settings', defaultSettings);
    pushToServer('sequences', defaultSequences);
    pushToServer('outgoing_letters', defaultOutgoingLetters);
    pushToServer('certificates', defaultCertificates);
    pushToServer('incoming_letters', defaultIncomingLetters);
    pushToServer('warehouse_items', defaultWarehouseItems);
    pushToServer('assets_inventaris', defaultAssetsInventaris);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: 'Data contoh (demo) berhasil dimuat ulang!', type: 'success' } 
      }));
    }
  }
};

export default db;
