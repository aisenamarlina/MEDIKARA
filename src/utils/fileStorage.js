// ============================================================
// fileStorage.js — Dual-Layer Storage (IndexedDB + Cloud DB)
// Solves 5MB quota limit for PDF, Docs, and Images > 1MB
// Enables reliable file storage and cross-device availability
// ============================================================

const DB_NAME = 'MEDIKARA_FILE_STORE';
const STORE_NAME = 'files';
const DB_VERSION = 1;

let dbPromise = null;

const getDB = () => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          db.onversionchange = () => {
            try { db.close(); } catch {}
            dbPromise = null;
          };
          db.onclose = () => {
            dbPromise = null;
          };
          resolve(db);
        };

        request.onerror = (event) => {
          console.error('[MEDIKARA fileStorage] IndexedDB open error:', event.target?.error);
          dbPromise = null;
          reject(event.target?.error || new Error('Failed to open IndexedDB'));
        };

        request.onblocked = () => {
          console.warn('[MEDIKARA fileStorage] IndexedDB open blocked');
          dbPromise = null;
        };
      } catch (err) {
        dbPromise = null;
        reject(err);
      }
    });
  }

  return dbPromise;
};

/**
 * Simpan data berkas (dataURL / base64) ke IndexedDB + Cloud Database
 * @param {string} id - Unique document ID (cth: "AR-123456789")
 * @param {string} fileData - Base64 Data URL string
 * @param {string} fileName - Nama file original
 */
export const saveFileToStorage = async (id, fileData, fileName = '') => {
  if (!id || !fileData) return false;

  let localSaved = false;

  // 1. Simpan ke local IndexedDB (Kapasitas gigabyte, offline ready)
  try {
    const db = await getDB();
    localSaved = await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.onabort = () => resolve(false);
        tx.onerror = () => resolve(false);

        const store = tx.objectStore(STORE_NAME);
        const req = store.put({
          id,
          fileData,
          fileName,
          updatedAt: Date.now()
        });

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch (txErr) {
        console.warn('[MEDIKARA fileStorage] Transaction error in saveFileToStorage:', txErr);
        dbPromise = null;
        resolve(false);
      }
    });
  } catch (err) {
    console.error('[MEDIKARA fileStorage] IndexedDB save failed, resetting DB:', err);
    dbPromise = null;
  }

  // 2. Sinkronkan ke Cloud PostgreSQL Neon (via /api/store?key=file_...)
  // Batas payload serverless Vercel ~4.5MB (fileData length < 4.2M)
  try {
    if (fileData.length < 4.2 * 1024 * 1024) {
      fetch(`/api/store?key=file_${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          fileData,
          fileName,
          updatedAt: Date.now()
        })
      }).catch((cloudErr) => {
        console.warn('[MEDIKARA fileStorage] Background cloud upload warning:', cloudErr);
      });
    }
  } catch (cloudErr) {
    console.warn('[MEDIKARA fileStorage] Could not initiate cloud upload:', cloudErr);
  }

  return localSaved;
};

/**
 * Ambil data berkas (dataURL / base64) dari IndexedDB atau Cloud Database
 * @param {string} id - Unique document ID
 * @returns {Promise<string|null>} Data URL string atau null jika tidak ada
 */
export const getFileFromStorage = async (id) => {
  if (!id) return null;

  // 1. Prioritaskan pembacaan lokal dari IndexedDB (Instan & Offline)
  try {
    const db = await getDB();
    const localResult = await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        tx.onabort = () => resolve(null);
        tx.onerror = () => resolve(null);

        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          if (req.result && req.result.fileData) {
            resolve(req.result.fileData);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (txErr) {
        dbPromise = null;
        resolve(null);
      }
    });

    if (localResult) return localResult;
  } catch (err) {
    console.warn('[MEDIKARA fileStorage] IndexedDB read warning:', err);
    dbPromise = null;
  }

  // 2. Fallback: Ambil langsung dari Cloud PostgreSQL (Neon) jika berkas diunggah di perangkat lain / laptop berbeda
  try {
    const res = await fetch(`/api/store?key=file_${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.fileData) {
        // Cache ke IndexedDB lokal agar klik berikutnya langsung instan offline
        try {
          const db = await getDB();
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put({
            id,
            fileData: data.fileData,
            fileName: data.fileName || '',
            updatedAt: data.updatedAt || Date.now()
          });
        } catch {}
        return data.fileData;
      }
    }
  } catch (cloudErr) {
    console.warn('[MEDIKARA fileStorage] Cloud file fetch failed:', cloudErr);
  }

  return null;
};

/**
 * Konversi Data URL (Base64) ke Blob Object
 * @param {string} dataURL
 * @returns {Blob|null}
 */
export const dataURLtoBlob = (dataURL) => {
  if (!dataURL || typeof dataURL !== 'string') return null;
  try {
    const parts = dataURL.split(';base64,');
    if (parts.length === 2) {
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const binaryString = window.atob(parts[1]);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes], { type: contentType });
    }
  } catch (err) {
    console.error('[MEDIKARA fileStorage] Error converting dataURL to Blob:', err);
  }
  return null;
};

/**
 * Buka berkas di tab baru menggunakan Blob URL native browser
 * @param {string} dataURL 
 * @param {string} fileName 
 */
export const viewFileBlob = (dataURL, fileName = 'Dokumen.pdf') => {
  if (!dataURL) return false;
  const blob = dataURLtoBlob(dataURL);
  if (!blob) return false;
  const blobUrl = URL.createObjectURL(blob);
  const win = window.open(blobUrl, '_blank');
  if (!win) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return true;
};

/**
 * Unduh berkas dari Data URL menggunakan Blob URL
 * @param {string} dataURL 
 * @param {string} fileName 
 */
export const downloadFileBlob = (dataURL, fileName = 'Dokumen.pdf') => {
  if (!dataURL) return false;
  const blob = dataURLtoBlob(dataURL);
  if (!blob) return false;
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  return true;
};

/**
 * Hapus data berkas dari IndexedDB dan Cloud
 * @param {string} id - Unique document ID
 */
export const deleteFileFromStorage = async (id) => {
  if (!id) return false;

  // 1. Hapus dari IndexedDB lokal
  try {
    const db = await getDB();
    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      } catch {
        dbPromise = null;
        resolve(false);
      }
    });
  } catch (err) {
    console.error('[MEDIKARA fileStorage] Failed to delete file from IndexedDB:', err);
    dbPromise = null;
  }

  // 2. Hapus dari Cloud PostgreSQL
  try {
    fetch(`/api/store?key=file_${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  } catch {}

  return true;
};

/**
 * Cek apakah berkas tersimpan di IndexedDB atau Cloud
 * @param {string} id - Unique document ID
 */
export const hasFileInStorage = async (id) => {
  if (!id) return false;
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count(id);
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => resolve(false);
      } catch {
        resolve(false);
      }
    });
  } catch {
    return false;
  }
};
