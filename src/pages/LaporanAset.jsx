import React, { useState } from 'react';
import { Printer, Download, Image as ImageIcon, X } from 'lucide-react';
import { exportTableToCSV, exportTableToPDF } from '../utils/exportUtils';

const LaporanAset = ({ settings = {}, assets = [], locations = [], types = [], initialTab = "all_assets" }) => {
  const [activeReportTab, setActiveReportTab] = useState(initialTab); // "all_assets" | "with_images" | "by_type"
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveReportTab(initialTab);
  }
  const [filterLokasi, setFilterLokasi] = useState("Semua");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKondisi, setFilterKondisi] = useState("Semua");
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null);

  // Pengaturan dinamis tanda tangan & tanggal cetak
  const [signeeCount, setSigneeCount] = useState(3); // 1, 2, or 3
  const [reportDate, setReportDate] = useState(`Garut, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  
  // Tanda Tangan Kiri (Kepala Klinik)
  const [signeeLeftTitle, setSigneeLeftTitle] = useState("Kepala Klinik");
  const [signeeLeftName, setSigneeLeftName] = useState("dr. H. Asep Maryaman");
  const [signeeLeftNik, setSigneeLeftNik] = useState("1.21.1");

  // Tanda Tangan Tengah (KASUBID Umum)
  const [signeeMiddleTitle, setSigneeMiddleTitle] = useState("KASUBID Umum");
  const [signeeMiddleName, setSigneeMiddleName] = useState("NANANG ALAMSYAH, ST");
  const [signeeMiddleNik, setSigneeMiddleNik] = useState("23.10.1");

  // Tanda Tangan Kanan (Penanggung Jawab)
  const [signeeRightTitle, setSigneeRightTitle] = useState("Penanggung Jawab");
  const [signeeRightName, setSigneeRightName] = useState("Andriana");
  const [signeeRightNik, setSigneeRightNik] = useState("");
  const [useDigitalSignature, setUseDigitalSignature] = useState(false);
  const [useDigitalStamp, setUseDigitalStamp] = useState(false);
  // Filter assets
  const baseBarangAssets = (assets || []).filter(a => !a.category || a.category === "Barang/Benda");
  const barangAssets = baseBarangAssets.filter(a => {
    const matchLokasi = filterLokasi === "Semua" || a.lokasi === filterLokasi;
    const matchJenis = filterJenis === "Semua" || a.jenisAset === filterJenis;
    const matchKondisi = filterKondisi === "Semua" || a.kondisi === filterKondisi;
    const matchPhoto = !onlyWithPhotos || (activeReportTab === "with_images" ? Boolean(a.fotoAset) : true);
    return matchLokasi && matchJenis && matchKondisi && matchPhoto;
  });

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Get total cost including details
  const getAssetTotalValue = (asset) => {
    const baseValue = parseFloat(asset.hargaPerUnit || 0);
    const detailsValue = (asset.biayaRincian || []).reduce((sum, item) => sum + parseFloat(item.biaya || 0), 0);
    return detailsValue > 0 ? detailsValue : baseValue;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Print styles style block to ensure print only targets the report print-area */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            background: #fff;
            color: #000;
          }
          /* Hide tabs, sidebars, print buttons, headers */
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header, Export & Filter Toolbar in ONE Unified Card (No wasteful gaps or spaces) */}
      <div className="elegant-card no-print" style={{ 
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        padding: '1.25rem 1.5rem', borderRadius: '12px' 
      }}>
        {/* Row 1: Title, Subtitle, & Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Laporan Rekapitulasi Aset
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'rgba(30,74,53,0.08)', padding: '0.15rem 0.55rem', borderRadius: '12px' }}>
                {barangAssets.length} Aset
              </span>
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>Pratinjau layout cetak dan ekspor rekapitulasi aset resmi.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              onClick={() => {
                let dataToExport = [];
                if (activeReportTab === "all_assets") {
                  dataToExport = barangAssets.map(a => ({ "Kode Aset": a.id, "Nama": a.namaAset, "Kategori": a.jenisAset, "Lokasi": a.lokasi, "Status": a.kondisi }));
                } else if (activeReportTab === "with_images") {
                  dataToExport = barangAssets.map(a => ({ "Kode Aset": a.id, "Nama": a.namaAset, "Merk": a.merk || "-", "Kategori": a.jenisAset, "Lokasi": a.lokasi, "Status": a.kondisi, "Status Foto": a.fotoAset ? "Tersedia" : "Tidak Ada" }));
                } else if (activeReportTab === "by_type") {
                  dataToExport = (types || []).map(type => {
                    const typeName = typeof type === 'object' ? (type.name || type.id) : type;
                    const total = barangAssets.filter(a => a.jenisAset === typeName).length;
                    const baik = barangAssets.filter(a => a.jenisAset === typeName && a.kondisi === "Baik").length;
                    return { "Kategori Aset": typeName, "Total Aset": total, "Aset Baik": baik };
                  });
                }
                exportTableToCSV(dataToExport, `Laporan_Aset_${activeReportTab}.csv`);
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', backgroundColor: 'var(--success)', whiteSpace: 'nowrap', borderRadius: '6px' }}
            >
              <Download size={13} /> Excel
            </button>
            
            <button 
              onClick={() => {
                let dataToExport = [];
                if (activeReportTab === "all_assets") {
                  dataToExport = barangAssets.map(a => ({ "Kode Aset": a.id, "Nama": a.namaAset, "Kategori": a.jenisAset, "Lokasi": a.lokasi, "Status": a.kondisi }));
                } else if (activeReportTab === "with_images") {
                  dataToExport = barangAssets.map(a => ({ "Kode Aset": a.id, "Nama": a.namaAset, "Merk": a.merk || "-", "Kategori": a.jenisAset, "Lokasi": a.lokasi, "Status": a.kondisi, "Status Foto": a.fotoAset ? "Tersedia" : "Tidak Ada" }));
                } else if (activeReportTab === "by_type") {
                  dataToExport = (types || []).map(type => {
                    const typeName = typeof type === 'object' ? (type.name || type.id) : type;
                    const total = barangAssets.filter(a => a.jenisAset === typeName).length;
                    const baik = barangAssets.filter(a => a.jenisAset === typeName && a.kondisi === "Baik").length;
                    return { "Kategori Aset": typeName, "Total Aset": total, "Aset Baik": baik };
                  });
                }
                exportTableToPDF(dataToExport, `Laporan_Aset_${activeReportTab}.pdf`, "Laporan Aset");
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', backgroundColor: '#1e3a5f', whiteSpace: 'nowrap', borderRadius: '6px' }}
            >
              <Download size={13} /> PDF
            </button>
            <button 
              onClick={handlePrint}
              type="button"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', fontSize: '0.78rem', backgroundColor: '#0284c7', whiteSpace: 'nowrap', borderRadius: '6px' }}
              title="Cetak laporan langsung"
            >
              <Printer size={13} /> Cetak
            </button>
          </div>
        </div>

        {/* Row 2: Full-width Segmented Tabs (No empty space on right, 3 equal columns) */}
        <div className="laporan-segmented-tabs" style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          backgroundColor: '#e2e8f0',
          padding: '3px',
          borderRadius: '8px',
          gap: '3px',
          boxSizing: 'border-box'
        }}>
          <button 
            type="button"
            onClick={() => setActiveReportTab("all_assets")}
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeReportTab === "all_assets" ? '#fff' : 'transparent',
              color: activeReportTab === "all_assets" ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeReportTab === "all_assets" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            Data Fixed Asset &amp; Inventaris
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveReportTab("with_images")}
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeReportTab === "with_images" ? '#fff' : 'transparent',
              color: activeReportTab === "with_images" ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeReportTab === "with_images" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            <ImageIcon size={14} /> Laporan Bergambar (Foto)
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveReportTab("by_type")}
            style={{
              padding: '0.5rem 0.75rem',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              backgroundColor: activeReportTab === "by_type" ? '#fff' : 'transparent',
              color: activeReportTab === "by_type" ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: activeReportTab === "by_type" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              whiteSpace: 'nowrap'
            }}
          >
            Laporan Keuangan
          </button>
        </div>

        {/* Row 3: Compact Inline Filter Bar */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-main)',
          padding: '0.45rem 0.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border-light)',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Lokasi:</span>
              <select 
                value={filterLokasi} 
                onChange={e => setFilterLokasi(e.target.value)}
                className="input-field" 
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px', minWidth: '130px' }}
              >
                <option value="Semua">Semua Lokasi</option>
                {locations.map(loc => typeof loc === 'object' ? <option key={loc.id || loc.name} value={loc.name || loc.id}>{loc.name || loc.id}</option> : <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Jenis:</span>
              <select 
                value={filterJenis} 
                onChange={e => setFilterJenis(e.target.value)} 
                className="input-field" 
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px', minWidth: '130px' }}
              >
                <option value="Semua">Semua Jenis</option>
                {types.map(t => typeof t === 'object' ? <option key={t.id || t.name} value={t.name || t.id}>{t.name || t.id}</option> : <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Kondisi:</span>
              <select 
                value={filterKondisi} 
                onChange={e => setFilterKondisi(e.target.value)} 
                className="input-field" 
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', height: '28px', minWidth: '100px' }}
              >
                <option value="Semua">Semua</option>
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
            </div>

            {activeReportTab === "with_images" && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer', userSelect: 'none', backgroundColor: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <input 
                  type="checkbox" 
                  checked={onlyWithPhotos} 
                  onChange={e => setOnlyWithPhotos(e.target.checked)} 
                  style={{ width: '13px', height: '13px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                Ada Foto
              </label>
            )}
          </div>

          {/* Right side summary badge to balance the filter row */}
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Menampilkan: <strong style={{ color: 'var(--primary)' }}>{barangAssets.length}</strong> data
          </div>
        </div>
      </div>      {/* Tanda Tangan & Tanggal Setting Panel (Selalu Terbuka / Tanpa Fitur Hide) */}
      <div className="no-print elegant-card" style={{ padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.65rem', borderRadius: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>Pengaturan Tanda Tangan:</span>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)', gap: '2px' }}>
              {[
                { count: 1, label: "1 TTD (Kanan)" },
                { count: 2, label: "2 TTD (Kiri & Kanan)" },
                { count: 3, label: "3 TTD (Lengkap)" }
              ].map(opt => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => setSigneeCount(opt.count)}
                  style={{
                    padding: '0.2rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: signeeCount === opt.count ? 700 : 500,
                    backgroundColor: signeeCount === opt.count ? 'var(--primary)' : 'transparent',
                    color: signeeCount === opt.count ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', margin: 0 }}>
              <input type="checkbox" checked={useDigitalSignature} onChange={e => setUseDigitalSignature(e.target.checked)} style={{ cursor: 'pointer' }} />
              ✍️ Pakai TTD Digital
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', margin: 0 }}>
              <input type="checkbox" checked={useDigitalStamp} onChange={e => setUseDigitalStamp(e.target.checked)} style={{ cursor: 'pointer' }} />
              💮 Pakai Stempel Resmi
            </label>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: signeeCount === 1 ? '1fr 1.5fr' : signeeCount === 2 ? '1fr 1.2fr 1.2fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
          {/* Tanggal & Tempat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dark)' }}>Tempat & Tanggal:</label>
            <input 
              type="text" 
              value={reportDate} 
              onChange={e => setReportDate(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', height: '28px', fontSize: '0.75rem', padding: '0.2rem 0.5rem', boxSizing: 'border-box' }}
              placeholder="Garut, 11 September 2026"
            />
          </div>

          {/* TTD Kiri (Jika 2 atau 3 TTD) */}
          {signeeCount >= 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>TTD Kiri ({signeeCount === 3 ? "Kepala Klinik" : "Pimpinan"}):</label>
              <input 
                type="text" 
                placeholder="Jabatan" 
                value={signeeLeftTitle} 
                onChange={e => setSigneeLeftTitle(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                value={signeeLeftName} 
                onChange={e => setSigneeLeftName(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="NIK (Boleh Kosong)" 
                value={signeeLeftNik} 
                onChange={e => setSigneeLeftNik(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
            </div>
          )}

          {/* TTD Tengah (Jika 3 TTD) */}
          {signeeCount === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>TTD Tengah (KASUBID Umum):</label>
              <input 
                type="text" 
                placeholder="Jabatan" 
                value={signeeMiddleTitle} 
                onChange={e => setSigneeMiddleTitle(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="Nama Lengkap" 
                value={signeeMiddleName} 
                onChange={e => setSigneeMiddleName(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
              <input 
                type="text" 
                placeholder="NIK (Boleh Kosong)" 
                value={signeeMiddleNik} 
                onChange={e => setSigneeMiddleNik(e.target.value)} 
                className="input-field" 
                style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
              />
            </div>
          )}

          {/* TTD Kanan (Selalu Ada) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>
              {signeeCount === 1 ? "TTD (Penanggung Jawab):" : "TTD Kanan:"}
            </label>
            <input 
              type="text" 
              placeholder="Jabatan" 
              value={signeeRightTitle} 
              onChange={e => setSigneeRightTitle(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
            />
            <input 
              type="text" 
              placeholder="Nama Lengkap" 
              value={signeeRightName} 
              onChange={e => setSigneeRightName(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
            />
            <input 
              type="text" 
              placeholder="NIK (Boleh Kosong)" 
              value={signeeRightNik} 
              onChange={e => setSigneeRightNik(e.target.value)} 
              className="input-field" 
              style={{ width: '100%', height: '26px', fontSize: '0.72rem', padding: '0.15rem 0.45rem', boxSizing: 'border-box' }} 
            />
          </div>
        </div>
      </div>

      {/* Print Document Area */}
      <div className="print-preview-wrapper" style={{ width: '100%', maxWidth: '100%' }}>
        <div id="print-area" className="elegant-card" style={{ 
        padding: '2.5rem', 
        minHeight: '800px', 
        backgroundColor: '#fff', 
        border: '1px solid var(--border)', 
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
        fontFamily: 'Times New Roman, serif',
        color: '#000'
      }}>
        
        {/* Kop Surat Resmi Klinik */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
            {/* Logo Klinik */}
            <img 
              src={settings?.logo || "/logo.png"} 
              alt="Logo Klinik Baiturrahman" 
              style={{ width: '85px', height: 'auto', marginBottom: '4px' }} 
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>
              KLINIK BAITURRAHMAN
            </h1>
            <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
            <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>
              {(() => {
                const addr = (settings?.address || 'Jl. Merdeka No. 217, Tarogong Kidul-Garut').replace(/,+$/, '').trim();
                const ph = (settings?.phone || 'Telp. (0262) 234754, HP. 0813-2124-3303').trim();
                return ph ? `${addr}, ${ph}` : addr;
              })()}
            </p>
            <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
              Email: <span style={{ textDecoration: 'underline' }}>{settings?.email || 'klinikbaiturrahman@rocketmail.com'}</span>
            </p>
          </div>
          {/* Thick line and thin line */}
          <div style={{ borderTop: '3px solid black', marginTop: '2px', width: '100%' }}></div>
          <div style={{ borderTop: '1px solid black', marginTop: '1px', width: '100%' }}></div>
        </div>

        {/* Judul Laporan */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', textDecoration: 'underline', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            {activeReportTab === "all_assets" && "DATA FIXED ASSET & INVENTARIS"}
            {activeReportTab === "with_images" && "LAPORAN DOKUMENTASI FISIK & FOTO ASET INVENTARIS"}
            {activeReportTab === "by_type" && "LAPORAN KEUANGAN INVENTARIS ASET BARANG & BENDA"}
          </h2>
          <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            Periode Laporan: Per Tanggal {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Content Table */}
        {activeReportTab === "all_assets" && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1.5rem', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', border: '1px solid #000', fontWeight: 700 }}>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '40px' }}>No</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '120px' }}>Kode</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left' }}>Nama</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '100px' }}>Jenis</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '280px' }}>Lokasi</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '90px' }}>Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {barangAssets.map((asset, idx) => (
                <tr key={asset.id} style={{ border: '1px solid #000' }}>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>{asset.id}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', fontWeight: 600 }}>{asset.namaAset}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>
                    {asset.jenisAset || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>{asset.lokasi}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'center' }}>{asset.kondisi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Content Table Laporan Bergambar */}
        {activeReportTab === "with_images" && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1.5rem', color: '#000', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6', border: '1px solid #000', fontWeight: 700 }}>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '35px' }}>No</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '95px' }}>Foto Fisik</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '110px' }}>Kode</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left' }}>Nama Barang & Spesifikasi</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '110px' }}>Jenis</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '180px' }}>Lokasi</th>
                <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '85px' }}>Kondisi</th>
              </tr>
            </thead>
            <tbody>
              {barangAssets.map((asset, idx) => (
                <tr key={asset.id} style={{ border: '1px solid #000', pageBreakInside: 'avoid' }}>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    {asset.fotoAset ? (
                      <div 
                        onClick={() => setPreviewImageModal({ src: asset.fotoAset, title: asset.namaAset })}
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                        title="Klik untuk memperbesar foto"
                      >
                        <img 
                          src={asset.fotoAset} 
                          alt={asset.namaAset} 
                          style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #999', display: 'block', margin: '0 auto', backgroundColor: '#fff' }} 
                        />
                      </div>
                    ) : (
                      <div style={{ width: '65px', height: '65px', borderRadius: '4px', border: '1px dashed #aaa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', margin: '0 auto', color: '#9ca3af', fontSize: '0.65rem' }}>
                        <ImageIcon size={18} style={{ marginBottom: '2px', opacity: 0.6 }} />
                        <span>Tanpa Foto</span>
                      </div>
                    )}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle', fontWeight: 600 }}>{asset.id}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{asset.namaAset}</div>
                    {asset.merk && <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>Merk: {asset.merk}</div>}
                    {asset.spesifikasi && <div style={{ fontSize: '0.72rem', color: '#6b7280', fontStyle: 'italic', marginTop: '1px' }}>{asset.spesifikasi}</div>}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle' }}>
                    {asset.jenisAset || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle' }}>{asset.lokasi}</td>
                  <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.15rem 0.45rem', 
                      borderRadius: '4px', 
                      fontWeight: 700, 
                      fontSize: '0.72rem',
                      border: '1px solid #000',
                      backgroundColor: asset.kondisi === "Baik" ? '#f0fdf4' : asset.kondisi === "Rusak Ringan" ? '#fefce8' : '#fef2f2'
                    }}>
                      {asset.kondisi}
                    </span>
                  </td>
                </tr>
              ))}
              {barangAssets.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', border: '1px solid #000', color: '#666' }}>
                    Tidak ada data aset untuk ditampilkan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeReportTab === "by_type" && (() => {
          const typeList = types.map(t => typeof t === 'object' ? t.name || t.id : t).filter(type => barangAssets.some(a => a.jenisAset === type));
          const grandTotal = barangAssets.reduce((sum, a) => sum + getAssetTotalValue(a), 0);
          let globalIdx = 0;

          return (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', marginBottom: '1.5rem', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', border: '1px solid #000', fontWeight: 700 }}>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '35px' }}>No</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '100px' }}>Kode</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left' }}>Nama Barang / Benda</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '90px' }}>Jenis</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'left', width: '280px' }}>Lokasi</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'center', width: '70px' }}>Kondisi</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'right', width: '110px' }}>Harga Satuan (Rp)</th>
                    <th style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'right', width: '110px' }}>Total Nilai (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  {typeList.map(type => {
                    const typeAssets = barangAssets.filter(a => a.jenisAset === type);

                    return (
                      <React.Fragment key={type}>
                        {/* Baris Header Kategori (Dihapus sesuai permintaan) */}
                        {/* Baris Data Aset */}
                        {typeAssets.map(asset => {
                          globalIdx++;
                          const hargaSatuan = parseFloat(asset.hargaPerUnit || 0);
                          const totalNilai = getAssetTotalValue(asset);
                          return (
                            <tr key={asset.id} style={{ border: '1px solid #000' }}>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'center' }}>{globalIdx}</td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>{asset.id}</td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', fontWeight: 600 }}>{asset.namaAset}</td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>
                                {asset.jenisAset || '-'}
                              </td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top' }}>{asset.lokasi}</td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'center' }}>{asset.kondisi}</td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'right' }}>
                                {hargaSatuan > 0 ? formatCurrency(hargaSatuan) : '-'}
                              </td>
                              <td style={{ border: '1px solid #000', padding: '0.45rem 0.6rem', verticalAlign: 'top', textAlign: 'right' }}>
                                {totalNilai > 0 ? formatCurrency(totalNilai) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Baris Subtotal Kategori (Dihapus sesuai permintaan) */}
                      </React.Fragment>
                    );
                  })}
                  {/* Baris Grand Total */}
                  <tr>
                    <td colSpan={7} style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 800, backgroundColor: '#f3f4f6', textTransform: 'uppercase' }}>
                      Grand Total Nilai Inventaris ({barangAssets.length} Item):
                    </td>
                    <td style={{ border: '1px solid #000', padding: '0.5rem 0.6rem', textAlign: 'right', fontWeight: 800, backgroundColor: '#f3f4f6' }}>
                      {formatCurrency(grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}



        {/* Tanda Tangan Laporan */}
        <div style={{ 
          display: 'flex', 
          justifyContent: signeeCount === 1 ? 'flex-end' : 'space-between', 
          marginTop: '3.5rem', 
          pageBreakInside: 'avoid', 
          fontSize: '0.85rem', 
          color: '#000', 
          fontFamily: 'Arial, sans-serif' 
        }}>
          {signeeCount >= 2 && (
            <div style={{ textAlign: 'center', width: '200px' }}>
              <p style={{ margin: 0 }}>Mengetahui,</p>
              <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{signeeLeftTitle || "\u00A0"},</p>
              <div style={{ height: '60px' }} />
              <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{signeeLeftName || "\u00A0"}</p>
              {signeeLeftNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {signeeLeftNik}</p>}
            </div>
          )}

          {signeeCount === 3 && (
            <div style={{ textAlign: 'center', width: '200px' }}>
              <p style={{ margin: 0 }}>&nbsp;</p>
              <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{signeeMiddleTitle || "\u00A0"},</p>
              <div style={{ height: '60px' }} />
              <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{signeeMiddleName || "\u00A0"}</p>
              {signeeMiddleNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {signeeMiddleNik}</p>}
            </div>
          )}

          <div style={{ textAlign: 'center', width: '200px' }}>
            <p style={{ margin: 0 }}>{reportDate || "\u00A0"}</p>
            <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{signeeRightTitle || "\u00A0"},</p>
            
            {((useDigitalSignature && settings?.signature) || (useDigitalStamp && settings?.stamp)) ? (
              <div style={{ height: '120px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {useDigitalStamp && settings?.stamp && (
                  <img src={settings.stamp} alt="Stamp" style={{ position: 'absolute', width: '80px', height: 'auto', opacity: 0.8, left: '20%' }} />
                )}
                {useDigitalSignature && settings?.signature && (
                  <img src={settings.signature} alt="Signature" style={{ position: 'relative', width: '100px', height: 'auto', zIndex: 2 }} />
                )}
              </div>
            ) : (
              <div style={{ height: '70px' }} />
            )}
            
            <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{signeeRightName || "\u00A0"}</p>
            {signeeRightNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {signeeRightNik}</p>}
          </div>
        </div>

      </div>
      </div>

      {/* Modal Zoom Foto Aset */}
      {previewImageModal && (
        <div 
          onClick={() => setPreviewImageModal(null)}
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '1.25rem',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{previewImageModal.title}</h3>
              <button 
                type="button"
                onClick={() => setPreviewImageModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}
              >
                <X size={20} />
              </button>
            </div>
            <img 
              src={previewImageModal.src} 
              alt={previewImageModal.title} 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border)' }} 
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default LaporanAset;

