import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, RotateCcw, Database, Tag, MapPin, Award } from 'lucide-react';

const MasterAset = ({ 
  types, onSaveTypes,
  locations, onSaveLocations,
  units, onSaveUnits,
  openConfirm
}) => {
  const [activeSubTab, setActiveSubTab] = useState("locations"); // "types" | "locations" | "units"
  
  // Edit & New Form States
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;

    let list = [];
    let saveFunc = null;
    let nameLabel = "";

    if (activeSubTab === "types") {
      list = types;
      saveFunc = onSaveTypes;
      nameLabel = "Jenis Aset";
    } else if (activeSubTab === "locations") {
      list = locations;
      saveFunc = onSaveLocations;
      nameLabel = "Lokasi Aset";
    } else {
      list = units;
      saveFunc = onSaveUnits;
      nameLabel = "Satuan";
    }

    if (list.some(item => item.toLowerCase() === newValue.trim().toLowerCase())) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `${nameLabel} "${newValue.trim()}" sudah terdaftar!`, type: 'error' } 
      }));
      return;
    }

    const updatedList = [...list, newValue.trim()];
    saveFunc(updatedList);
    setNewValue("");
    
    window.dispatchEvent(new CustomEvent('app-toast', { 
      detail: { message: `Berhasil menambahkan ${nameLabel} baru.`, type: 'success' } 
    }));
  };

  const handleStartEdit = (index, value) => {
    setEditIndex(index);
    setEditValue(value);
  };

  const handleSaveEdit = (index) => {
    if (!editValue.trim()) return;

    let list = [];
    let saveFunc = null;
    let nameLabel = "";

    if (activeSubTab === "types") {
      list = types;
      saveFunc = onSaveTypes;
      nameLabel = "Jenis Aset";
    } else if (activeSubTab === "locations") {
      list = locations;
      saveFunc = onSaveLocations;
      nameLabel = "Lokasi Aset";
    } else {
      list = units;
      saveFunc = onSaveUnits;
      nameLabel = "Satuan";
    }

    // Check duplication (excluding itself)
    if (list.some((item, idx) => idx !== index && item.toLowerCase() === editValue.trim().toLowerCase())) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `${nameLabel} "${editValue.trim()}" sudah ada!`, type: 'error' } 
      }));
      return;
    }

    const updatedList = list.map((item, idx) => idx === index ? editValue.trim() : item);
    saveFunc(updatedList);
    setEditIndex(null);
    setEditValue("");

    window.dispatchEvent(new CustomEvent('app-toast', { 
      detail: { message: `Berhasil memperbarui ${nameLabel}.`, type: 'success' } 
    }));
  };

  const handleDelete = (index, value) => {
    let list = [];
    let saveFunc = null;
    let nameLabel = "";

    if (activeSubTab === "types") {
      list = types;
      saveFunc = onSaveTypes;
      nameLabel = "Jenis Aset";
    } else if (activeSubTab === "locations") {
      list = locations;
      saveFunc = onSaveLocations;
      nameLabel = "Lokasi Aset";
    } else {
      list = units;
      saveFunc = onSaveUnits;
      nameLabel = "Satuan";
    }

    openConfirm(`Apakah Anda yakin ingin menghapus ${nameLabel} "${value}"?`, () => {
      const updatedList = list.filter((_, idx) => idx !== index);
      saveFunc(updatedList);
      
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `${nameLabel} berhasil dihapus.`, type: 'success' } 
      }));
    });
  };

  const renderActiveList = () => {
    let list = [];
    let title = "";
    let icon = null;

    if (activeSubTab === "types") {
      list = types;
      title = "Daftar Jenis Aset (Fixed Asset Types)";
      icon = <Tag size={18} style={{ color: 'var(--primary)' }} />;
    } else if (activeSubTab === "locations") {
      list = locations;
      title = "Daftar Lokasi Penempatan Aset (Asset Locations)";
      icon = <MapPin size={18} style={{ color: 'var(--primary)' }} />;
    } else {
      list = units;
      title = "Daftar Satuan Perolehan Aset (Asset Units)";
      icon = <Award size={18} style={{ color: 'var(--primary)' }} />;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Title Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          {icon}
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>{title}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>
            Total: {list.length} Item
          </span>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="master-data-form" style={{ display: 'flex', gap: '0.65rem', alignItems: 'stretch', flexWrap: 'wrap', width: '100%' }}>
          <input 
            type="text" 
            placeholder={`Masukkan nama ${activeSubTab === "types" ? "jenis baru..." : activeSubTab === "locations" ? "lokasi baru..." : "satuan baru..."}`} 
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            className="input-field master-data-input"
            style={{ flex: '1 1 200px', minWidth: '150px', padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
            required
          />
          <button 
            type="submit" 
            className="btn-primary master-data-btn" 
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', fontSize: '0.84rem', fontWeight: 600, whiteSpace: 'nowrap', flex: '0 0 auto', borderRadius: '8px' }}
          >
            <Plus size={16} /> Tambah Data
          </button>
        </form>

        {/* Data Table - Fit neatly on all devices */}
        <div className="master-table-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
          <table className="master-data-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.4rem', fontSize: '0.85rem', tableLayout: 'auto' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center', fontWeight: 700, width: '40px' }}>No</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700 }}>Nama Item</th>
                <th style={{ padding: '0.5rem 0.5rem', textAlign: 'right', fontWeight: 700, width: '80px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-light)', fontStyle: 'italic', background: 'var(--bg-sidebar)', borderRadius: '8px' }}>
                    Belum ada data terdaftar.
                  </td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr key={index} className="master-data-row" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                    <td style={{ padding: '0.6rem 0.4rem', textAlign: 'center', color: 'var(--text-light)', fontWeight: 600, borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                      {editIndex === index ? (
                        <input 
                          type="text" 
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="input-field"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
                          required
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', borderTopRightRadius: '8px', borderBottomRightRadius: '8px' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {editIndex === index ? (
                          <>
                            <button 
                              type="button" 
                              onClick={() => handleSaveEdit(index)}
                              style={{ border: 'none', background: 'rgba(46, 125, 98, 0.1)', color: 'var(--primary)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
                              title="Simpan"
                            >
                              <Save size={15} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditIndex(null)}
                              style={{ border: 'none', background: 'rgba(100, 116, 139, 0.1)', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
                              title="Batal"
                            >
                              <RotateCcw size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              type="button" 
                              onClick={() => handleStartEdit(index, item)}
                              style={{ border: 'none', background: 'rgba(202, 138, 4, 0.1)', color: '#b45309', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
                              title="Ubah"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDelete(index, item)}
                              style={{ border: 'none', background: 'rgba(220, 38, 38, 0.08)', color: 'var(--danger)', cursor: 'pointer', padding: '0.35rem', borderRadius: '6px' }}
                              title="Hapus"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Title Header wrapped in elegant-card */}
      <div className="elegant-card" style={{ padding: '1.25rem 1.75rem', borderRadius: '12px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Konfigurasi Master Data Aset</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>Kelola daftar jenis kategori aset, lokasi penyimpanan ruangan, dan satuan unit yang digunakan.</p>
      </div>

      <div className="elegant-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
        
        {/* Navigation Tabs */}
        <div className="no-scrollbar segmented-control-tabs" style={{ 
          display: 'flex', 
          alignItems: 'center',
          backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.35rem', borderRadius: '8px', gap: '0.35rem',
          borderBottom: 'none',
          overflowX: 'auto'
        }}>
          <button 
            type="button"
            onClick={() => { setActiveSubTab("locations"); setEditIndex(null); setNewValue(""); }}
            style={{
              display: 'flex', flex: 1, justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              height: '34px',
              padding: '0 1.2rem',
              border: activeSubTab === "locations" ? '1px solid var(--border-light)' : '1px solid transparent',
              borderRadius: '6px',
              backgroundColor: activeSubTab === "locations" ? 'var(--bg-card)' : 'transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeSubTab === "locations" ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === "locations" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <MapPin size={16} /> Lokasi Penempatan
          </button>

          <button 
            type="button"
            onClick={() => { setActiveSubTab("types"); setEditIndex(null); setNewValue(""); }}
            style={{
              display: 'flex', flex: 1, justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              height: '34px',
              padding: '0 1.2rem',
              border: activeSubTab === "types" ? '1px solid var(--border-light)' : '1px solid transparent',
              borderRadius: '6px',
              backgroundColor: activeSubTab === "types" ? 'var(--bg-card)' : 'transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeSubTab === "types" ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === "types" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Tag size={16} /> Jenis Kategori
          </button>

          <button 
            type="button"
            onClick={() => { setActiveSubTab("units"); setEditIndex(null); setNewValue(""); }}
            style={{
              display: 'flex', flex: 1, justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              height: '34px',
              padding: '0 1.2rem',
              border: activeSubTab === "units" ? '1px solid var(--border-light)' : '1px solid transparent',
              borderRadius: '6px',
              backgroundColor: activeSubTab === "units" ? 'var(--bg-card)' : 'transparent',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeSubTab === "units" ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              boxShadow: activeSubTab === "units" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Database size={16} /> Satuan Unit
          </button>
        </div>

        {/* Content list rendering */}
        {renderActiveList()}

      </div>

    </div>
  );
};

export default MasterAset;
