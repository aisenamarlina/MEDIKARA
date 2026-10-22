// ============================================================
// fileStorage.js — IndexedDB Storage for MEDIKARA Digital Files
// Solves localStorage 5MB quota limit for PDF, Docs, and Images
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
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error('[MEDIKARA fileStorage] IndexedDB open error:', event.target.error);
        reject(event.target.error);
      };
    });
  }
  return dbPromise;
};

/**
 * Simpan data berkas (dataURL / base64) ke IndexedDB
 * @param {string} id - Unique document ID (cth: "AR-123456789")
 * @param {string} fileData - Base64 Data URL string
 * @param {string} fileName - Nama file original
 */
export const saveFileToStorage = async (id, fileData, fileName = '') => {
  if (!id || !fileData) return false;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id,
        fileData,
        fileName,
        updatedAt: Date.now()
      });
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('[MEDIKARA fileStorage] Failed to save file to IndexedDB:', err);
    return false;
  }
};

/**
 * Ambil data berkas (dataURL / base64) dari IndexedDB berdasarkan ID
 * @param {string} id - Unique document ID
 * @returns {Promise<string|null>} Data URL string atau null jika tidak ada
 */
export const getFileFromStorage = async (id) => {
  if (!id) return null;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.fileData) {
          resolve(req.result.fileData);
        } else {
          resolve(null);
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('[MEDIKARA fileStorage] Failed to get file from IndexedDB:', err);
    return null;
  }
};

/**
 * Hapus data berkas dari IndexedDB
 * @param {string} id - Unique document ID
 */
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
    // Popup diblokir, buat fallback iframe/anchor
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
 * Hapus data berkas dari IndexedDB
 * @param {string} id - Unique document ID
 */
export const deleteFileFromStorage = async (id) => {
  if (!id) return false;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.error('[MEDIKARA fileStorage] Failed to delete file from IndexedDB:', err);
    return false;
  }
};

/**
 * Cek apakah berkas tersimpan di IndexedDB
 * @param {string} id - Unique document ID
 */
export const hasFileInStorage = async (id) => {
  if (!id) return false;
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count(id);
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
};
