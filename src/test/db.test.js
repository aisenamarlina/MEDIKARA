import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db';

describe('Database Layer (db.js)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('harus dapat menyimpan dan mengambil data (db.set & db.get)', () => {
    const mockAssets = [
      { id: 'AST-001', name: 'Tensimeter Digital', kategori: 'Medis' },
      { id: 'AST-002', name: 'Kursi Roda', kategori: 'Non-Medis' }
    ];

    db.set('assets', mockAssets);
    const retrieved = db.get('assets');

    expect(retrieved).toEqual(mockAssets);
    expect(retrieved.length).toBe(2);
  });

  it('harus mengembalikan default value jika key tidak ditemukan di db.get', () => {
    const result = db.get('key_yang_tidak_ada', []);
    expect(result).toEqual([]);

    const resultObject = db.get('non_existent_key', { status: 'empty' });
    expect(resultObject).toEqual({ status: 'empty' });
  });

  it('harus menambahkan log aktivitas saat db.addLog dipanggil', () => {
    db.addLog('Menambah Data Aset', 'Master Aset', 'Aset baru berhasil disimpan');

    const logs = db.get('activity_logs', []);
    expect(logs.length).toBe(1);
    expect(logs[0].activity).toBe('Menambah Data Aset');
    expect(logs[0].module).toBe('Master Aset');
    expect(logs[0].notes).toBe('Aset baru berhasil disimpan');
  });

  it('harus menghasilkan format nomor dokumen otomatis pada db.generateDocNo', () => {
    const docNoLetter = db.generateDocNo('letter');
    expect(docNoLetter).toBeDefined();
    expect(typeof docNoLetter).toBe('string');
    expect(docNoLetter).toContain('001');

    const docNoStockIn = db.generateDocNo('stock_in');
    expect(docNoStockIn).toBeDefined();
    expect(docNoStockIn).toContain('BM-001');
  });
});
