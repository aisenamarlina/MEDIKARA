import React, { useState } from 'react';
import { Send, FileText, Calendar, User, MapPin, Clipboard } from 'lucide-react';

const RelokasiAset = ({ 
  assets, onSaveAssets,
  locations,
  relocations, onSaveRelocations,
  openConfirm
}) => {
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [destLocation, setDestLocation] = useState("");
  const [relocDate, setRelocDate] = useState(new Date().toISOString().split('T')[0]);
  const [officer, setOfficer] = useState("Admin Gudang");
  const [notes, setNotes] = useState("");

  // Only relocatable assets (Barang/Benda)
  const relocatableAssets = assets.filter(a => a.category === "Barang/Benda");
  const selectedAsset = relocatableAssets.find(a => a.id === selectedAssetId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !destLocation) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Pilih barang dan lokasi tujuan relokasi!", type: 'error' } 
      }));
      return;
    }

    if (selectedAsset.lokasi === destLocation) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Lokasi tujuan tidak boleh sama dengan lokasi asal!", type: 'error' } 
      }));
      return;
    }

    openConfirm(`Apakah Anda yakin ingin memindahkan "${selectedAsset.namaAset}" dari "${selectedAsset.lokasi}" ke "${destLocation}"?`, () => {
      // 1. Log relocation transaction
      const newRelocation = {
        id: "REL-" + Date.now(),
        date: relocDate,
        assetId: selectedAsset.id,
        assetName: selectedAsset.namaAset,
        sourceLocation: selectedAsset.lokasi,
        destLocation: destLocation,
        officer: officer,
        notes: notes
      };

      // 2. Update asset's location
      const updatedAssets = assets.map(a => {
        if (a.id === selectedAsset.id) {
          return { ...a, lokasi: destLocation };
        }
        return a;
      });

      // 3. Save states
      onSaveAssets(updatedAssets);
      onSaveRelocations([newRelocation, ...relocations]);

      // 4. Reset form
      setSelectedAssetId("");
      setDestLocation("");
      setNotes("");

      // 5. Toast & Logs
      window.dispatchEvent(new CustomEvent('app-save-log', { 
        detail: { 
          action: "Relokasi Aset", 
          module: "Gudang & Aset", 
          details: `Memindahkan ${newRelocation.assetName} ke ${newRelocation.destLocation}` 
        } 
      }));

      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Relokasi aset berhasil disimpan dan lokasi ter-update!", type: 'success' } 
      }));
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Title wrapped in elegant-card */}
      <div className="elegant-card" style={{ padding: '1.25rem 1.75rem', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Relokasi &amp; Mutasi Aset</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>Pindahkan lokasi penempatan barang/benda inventaris dan catat riwayat mutasinya.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Form Relokasi */}
        <div className="elegant-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Form Relokasi Baru</h3>
          </div>
 
          <form onSubmit={handleSubmit} className="form-grid-2col">
            
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>PILIH BARANG / BENDA :</label>
              <select 
                value={selectedAssetId}
                onChange={e => setSelectedAssetId(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Pilih Barang --</option>
                {relocatableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.namaAset} ({a.lokasi})</option>
                ))}
              </select>
            </div>
 
            {selectedAsset && (
              <div style={{ gridColumn: '1 / -1', backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>ID Aset:</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{selectedAsset.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Kondisi Saat Ini:</span>
                  <span style={{ fontWeight: 600, color: selectedAsset.kondisi === "Baik" ? 'green' : 'orange' }}>{selectedAsset.kondisi}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lokasi Asal:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedAsset.lokasi}</span>
                </div>
              </div>
            )}
 
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>LOKASI TUJUAN BARU :</label>
              <select 
                value={destLocation}
                onChange={e => setDestLocation(e.target.value)}
                className="input-field"
                required
              >
                <option value="">-- Pilih Lokasi Tujuan --</option>
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
 
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>TANGGAL PINDAH :</label>
              <input 
                type="date"
                value={relocDate}
                onChange={e => setRelocDate(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>PETUGAS PIC :</label>
              <input 
                type="text"
                value={officer}
                onChange={e => setOfficer(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>KETERANGAN / ALASAN :</label>
              <textarea 
                rows="3"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field"
                placeholder="Contoh: Dipindahkan untuk penggantian inventaris UGD..."
                style={{ resize: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              <Send size={15} /> Simpan Relokasi
            </button>

          </form>
        </div>

        {/* Tabel Riwayat Relokasi */}
        <div className="elegant-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
            <Clipboard size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Riwayat Mutasi & Relokasi</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>
              Total: {relocations.length} Mutasi
            </span>
          </div>

          <div className="elegant-table-container" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem', fontSize: '0.82rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Aset</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Asal (Pohon)</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>Tujuan Baru</th>
                  <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left' }}>PIC</th>
                </tr>
              </thead>
              <tbody>
                {relocations.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic' }}>
                      Belum ada riwayat relokasi.
                    </td>
                  </tr>
                ) : (
                  relocations.map(r => (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                          {r.date}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{r.assetName}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 500 }}>ID: {r.assetId}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{r.sourceLocation}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.destLocation}</td>
                      <td style={{ color: 'var(--text-dark)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{r.officer}</span>
                          {r.notes && <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Ket: {r.notes}</span>}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default RelokasiAset;
