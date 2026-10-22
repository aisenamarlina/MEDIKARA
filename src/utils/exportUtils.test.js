import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportTableToCSV } from './exportUtils';

describe('exportUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportTableToCSV', () => {
    it('harus memunculkan alert jika data array kosong', () => {
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      exportTableToCSV([]);
      expect(alertMock).toHaveBeenCalledWith('Tidak ada data untuk diekspor!');

      exportTableToCSV(null);
      expect(alertMock).toHaveBeenCalledTimes(2);
    });

    it('harus membuat download link dan mentrigger klik saat ada data', () => {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test');
      
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const mockData = [
        { id: 1, nama_aset: 'Laptop Dell', kategori: 'Elektronik' },
        { id: 2, nama_aset: 'Meja Kerja', kategori: 'Furnitur' }
      ];

      exportTableToCSV(mockData, 'data_aset.csv');

      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
