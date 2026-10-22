import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dataURLtoBlob, viewFileBlob, downloadFileBlob } from './fileStorage';

describe('fileStorage utils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('dataURLtoBlob', () => {
    it('harus mengembalikan null jika dataURL tidak valid atau kosong', () => {
      expect(dataURLtoBlob('')).toBeNull();
      expect(dataURLtoBlob(null)).toBeNull();
      expect(dataURLtoBlob(undefined)).toBeNull();
      expect(dataURLtoBlob('invalid-data-string')).toBeNull();
    });

    it('harus mengonversi base64 dataURL valid menjadi Blob object', () => {
      // Base64 untuk teks sederhana "Hello"
      const sampleDataURL = 'data:text/plain;base64,SGVsbG8=';
      const blob = dataURLtoBlob(sampleDataURL);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });

    it('harus mengonversi dataURL PDF menjadi Blob application/pdf', () => {
      const samplePdfDataURL = 'data:application/pdf;base64,JVBERi0xLjQK';
      const blob = dataURLtoBlob(samplePdfDataURL);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });
  });

  describe('viewFileBlob & downloadFileBlob', () => {
    it('harus mengembalikan false jika dataURL kosong pada viewFileBlob', () => {
      expect(viewFileBlob(null)).toBe(false);
    });

    it('harus mengembalikan false jika dataURL kosong pada downloadFileBlob', () => {
      expect(downloadFileBlob(null)).toBe(false);
    });

    it('harus membuat link download saat downloadFileBlob dipanggil dengan dataURL valid', () => {
      window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob');
      window.URL.revokeObjectURL = vi.fn();

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const sampleDataURL = 'data:text/plain;base64,SGVsbG8=';
      const result = downloadFileBlob(sampleDataURL, 'test_surat.pdf');

      expect(result).toBe(true);
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
