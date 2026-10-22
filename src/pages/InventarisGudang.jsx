import React, { useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Database, Search } from 'lucide-react';

const InventarisGudang = ({
  warehouseItems,
  stockInForm,
  setStockInForm,
  handleStockIn,
  stockOutForm,
  setStockOutForm,
  handleStockOut
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [activeFormTab, setActiveFormTab] = useState("masuk");

  const categories = [...new Set(warehouseItems.map(i => i.category))];
  return (
    <div>


      <div className="elegant-card elegant-table-container" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
        <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.35rem', borderRadius: '8px', gap: '0.35rem', margin: '1.5rem 1.5rem 0', overflowX: 'auto' }}>
          <button 
            type="button" 
            onClick={() => setActiveFormTab("masuk")} 
            style={{ 
              flex: 1, height: '34px', padding: '0 0.65rem', border: activeFormTab === "masuk" ? '1px solid var(--border-light)' : '1px solid transparent', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
              backgroundColor: activeFormTab === "masuk" ? 'var(--bg-card)' : 'transparent',
              color: activeFormTab === "masuk" ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeFormTab === "masuk" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Penerimaan Barang Masuk
          </button>
          <button 
            type="button" 
            onClick={() => setActiveFormTab("keluar")} 
            style={{ 
              flex: 1, height: '34px', padding: '0 0.65rem', border: activeFormTab === "keluar" ? '1px solid var(--border-light)' : '1px solid transparent', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
              backgroundColor: activeFormTab === "keluar" ? 'var(--bg-card)' : 'transparent',
              color: activeFormTab === "keluar" ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeFormTab === "keluar" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Barang Keluar Stok
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeFormTab === "masuk" && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Penerimaan Barang Masuk (Restock)</h3>
              <form onSubmit={handleStockIn} className="form-grid-2col">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Pilih Barang (atau Ketik Baru)</label>
                  <input type="text" list="warehouse-items-list" value={stockInForm.itemName} onChange={e => setStockInForm({ ...stockInForm, itemName: e.target.value })} required className="input-field" placeholder="-- Pilih barang yang sudah ada atau ketik nama barang baru --" />
                  <datalist id="warehouse-items-list">
                    {warehouseItems.map(item => (
                      <option key={item.code} value={item.name} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Jumlah / Quantity</label>
                  <input type="number" value={stockInForm.qty} onChange={e => setStockInForm({ ...stockInForm, qty: e.target.value })} required className="input-field" placeholder="Contoh: 10" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Petugas Penerima</label>
                  <input type="text" value={stockInForm.officer} onChange={e => setStockInForm({ ...stockInForm, officer: e.target.value })} required className="input-field" placeholder="Admin" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Sumber / Supplier Barang (Opsional)</label>
                  <input type="text" value={stockInForm.source} onChange={e => setStockInForm({ ...stockInForm, source: e.target.value })} className="input-field" placeholder="Contoh: CV. Medika Sejahtera" />
                </div>
                <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', padding: '0.85rem', marginTop: '0.5rem', width: '100%', borderRadius: '6px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', backgroundColor: 'var(--primary)' }}>
                  + Simpan Barang Masuk
                </button>
              </form>
            </div>
          )}

          {activeFormTab === "keluar" && (
            <div>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Pengeluaran Barang Stok (Habis Pakai)</h3>
              <form onSubmit={handleStockOut} className="form-grid-2col">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Pilih Barang Gudang</label>
                  <select value={stockOutForm.itemCode} onChange={e => setStockOutForm({ ...stockOutForm, itemCode: e.target.value })} required className="input-field">
                    <option value="">-- Pilih Barang --</option>
                    {warehouseItems.map(item => (
                      <option key={item.code} value={item.code}>{item.name} (Stok: {item.currentStock} {item.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Jumlah / Quantity</label>
                  <input type="number" value={stockOutForm.qty} onChange={e => setStockOutForm({ ...stockOutForm, qty: e.target.value })} required className="input-field" placeholder="1" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Petugas Peminta</label>
                  <input type="text" value={stockOutForm.officer} onChange={e => setStockOutForm({ ...stockOutForm, officer: e.target.value })} required className="input-field" placeholder="Admin" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Tujuan Unit / Poli Peminta</label>
                  <input type="text" value={stockOutForm.destination} onChange={e => setStockOutForm({ ...stockOutForm, destination: e.target.value })} required className="input-field" placeholder="Contoh: Poli Anak / Ruang Rawat Inap" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Catatan / Perihal</label>
                  <input type="text" className="input-field" placeholder="Contoh: Kebutuhan medis & resep" />
                </div>
                <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1', padding: '0.85rem', marginTop: '0.5rem', width: '100%', borderRadius: '6px', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', backgroundColor: 'var(--primary)' }}>
                  + Simpan Barang Keluar
                </button>
              </form>
            </div>
          )}
        </div>
      </div>      {/* General stock items list */}
      <div className="elegant-card elegant-table-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Stok Saat Ini</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', flexWrap: 'nowrap', alignItems: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
            <select 
              value={filterKategori}
              onChange={e => setFilterKategori(e.target.value)}
              className="input-field"
              style={{ padding: '0.4rem 0.75rem', height: '32px', fontSize: '0.75rem', width: '200px', minWidth: '200px', flexShrink: 0 }}
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-field"
              style={{ padding: '0.4rem 0.75rem', height: '32px', fontSize: '0.75rem', width: '200px', minWidth: '200px', flexShrink: 0 }}
            >
              <option value="Semua">Semua Status</option>
              <option value="Aman"> Stok Aman</option>
              <option value="Menipis"> Stok Menipis</option>
            </select>

            <div style={{ position: 'relative', width: '200px', minWidth: '200px', flexShrink: 0 }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Cari barang..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '1.8rem', height: '32px', fontSize: '0.8rem', width: '180px' }}
              />
            </div>
          </div>
        </div>
        <div className="elegant-table-container" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
        <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Kode & Nama Barang</th>
              <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Kategori</th>
              <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Sisa Stok</th>
              <th style={{ padding: '0 1rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {warehouseItems
              .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.code.toLowerCase().includes(searchQuery.toLowerCase()))
              .filter(item => filterKategori === "Semua" || item.category === filterKategori)
              .filter(item => {
                if (filterStatus === "Semua") return true;
                const isLow = item.currentStock <= item.minStock;
                return filterStatus === "Aman" ? !isLow : isLow;
              })
              .map(item => {
              const isLow = item.currentStock <= item.minStock;
              return (
                <tr key={item.code} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                  <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                        <Package size={14} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'inline-flex', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', fontSize: '0.75rem', fontWeight: 500 }}>
                      {item.category}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: isLow ? '#dc2626' : 'var(--text-dark)' }}>
                      {item.currentStock} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{item.unit}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                      backgroundColor: isLow ? '#fef2f2' : '#ecfdf5',
                      color: isLow ? '#b91c1c' : '#047857',
                      padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600
                    }}>
                      {isLow ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                      {isLow ? "Stok Menipis" : "Stok Cukup"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default InventarisGudang;


