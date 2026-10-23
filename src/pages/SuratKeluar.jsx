import React, { useState } from 'react';
import { Eye, Download, Printer, Edit3, Trash2, Send, Search, FileText, Calendar } from 'lucide-react';
import { getTemplateData } from '../App';
import { compressImage } from '../utils/imageCompressor';


const SuratKeluar = ({
  letterForm,
  setLetterForm,
  letterReportFilter,
  setLetterReportFilter,
  outgoingLetters,
  previewJSPDFReport,
  generateJSPDFReport,
  generateWordReport,
  printJSPDFReport,
  handleCreateLetter,
  setCurrentPrintDoc,
  setCurrentPrintType,
  setLetterModal,
  handleDeleteOutgoingLetter,
  letterTypes,
  unitCodes,
  arsipRef
}) => {
  const [dynamicFields, setDynamicFields] = useState({});
  const [searchQuery, setSearchQuery] = useState('');


  const handleDynamicFieldChange = (key, value) => {
    setDynamicFields(prev => ({ ...prev, [key]: value }));
  };

  const formatDateIndo = (dateStr, id) => {
    if (dateStr) {
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch {}
    }
    if (id && id.startsWith('SU-')) {
      try {
        const ts = parseInt(id.replace('SU-', ''));
        if (!isNaN(ts)) {
          return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch {}
    }
    return '-';
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    let finalContent = letterForm.content;
    let extraFields = {};

    if (letterForm.typeCode === "SKet") {
      extraFields = {
        namaTtd: dynamicFields.namaTtd || '',
        jabatanTtd: dynamicFields.jabatanTtd || '',
        namaDiterangkan: dynamicFields.namaDiterangkan || '',
        jabatanDiterangkan: dynamicFields.jabatanDiterangkan || '',
        keperluan: dynamicFields.keperluan || '',
        harapan: dynamicFields.harapan || ''
      };
      finalContent = ''; // SKet has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SK") {
        extraFields = {
          namaPemberi: dynamicFields.namaPemberi || '',
          alamatPemberi: dynamicFields.alamatPemberi || '',
          jabatanPemberi: dynamicFields.jabatanPemberi || 'Direktur Klinik Baiturrahman',
          ktpPemberi: dynamicFields.ktpPemberi || '',
          namaPenerima: dynamicFields.namaPenerima || '',
          alamatPenerima: dynamicFields.alamatPenerima || '',
          jabatanPenerima: dynamicFields.jabatanPenerima || '',
          ktpPenerima: dynamicFields.ktpPenerima || '',
          bertindakSelaku: dynamicFields.bertindakSelaku || '',
          tindakan: dynamicFields.tindakan || ''
        };
        finalContent = ''; // SK has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SP") {
        extraFields = {
          namaPegawai: dynamicFields.namaPegawai || '',
          nikPegawai: dynamicFields.nikPegawai || '',
          jabatanPegawai: dynamicFields.jabatanPegawai || '',
          isiPeringatan: dynamicFields.isiPeringatan || ''
        };
        finalContent = ''; // SP has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SIK") {
        extraFields = {
          lampiranSIK: dynamicFields.lampiranSIK || '-',
          penerimaSIK: dynamicFields.penerimaSIK || '',
          namaKegiatan: dynamicFields.namaKegiatan || '',
          hariKegiatan: dynamicFields.hariKegiatan || '',
          tanggalKegiatan: dynamicFields.tanggalKegiatan || '',
          pukulKegiatan: dynamicFields.pukulKegiatan || '',
          tempatKegiatan: dynamicFields.tempatKegiatan || '',
          selakuPemohon: dynamicFields.selakuPemohon || '',
        };
        finalContent = ''; // SIK has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SU") {
        extraFields = {
          sifatSU: dynamicFields.sifatSU || '-',
          lampiranSU: dynamicFields.lampiranSU || '-',
          penerimaSU: dynamicFields.penerimaSU || '',
          pembukaSU: dynamicFields.pembukaSU || '',
          hariSU: dynamicFields.hariSU || '',
          tanggalSU: dynamicFields.tanggalSU || '',
          pukulSU: dynamicFields.pukulSU || '',
          tempatSU: dynamicFields.tempatSU || '',
          acaraSU: dynamicFields.acaraSU || '',
          penutupSU: dynamicFields.penutupSU || ''
        };
        finalContent = ''; // SU has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SPer") {
        extraFields = {
          namaPemberiSPer: dynamicFields.namaPemberiSPer || '',
          jabatanPemberiSPer: dynamicFields.jabatanPemberiSPer || '',
          namaPenerimaSPer: dynamicFields.namaPenerimaSPer || '',
          jabatanPenerimaSPer: dynamicFields.jabatanPenerimaSPer || '',
          untukSPer: dynamicFields.untukSPer || ''
        };
        finalContent = ''; // SPer has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SPem") {
        extraFields = {
          lampiranSPem: dynamicFields.lampiranSPem || '-',
          perihalSPem: dynamicFields.perihalSPem || '',
          penerimaSPem: dynamicFields.penerimaSPem || '',
          isiSPem: dynamicFields.isiSPem || ''
        };
        finalContent = ''; // SPem has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SPm") {
        extraFields = {
          lampiranSPm: dynamicFields.lampiranSPm || '-',
          perihalSPm: dynamicFields.perihalSPm || '',
          penerimaSPm: dynamicFields.penerimaSPm || '',
          isiSPm: dynamicFields.isiSPm || ''
        };
        finalContent = ''; // SPm has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SBal") {
        const showPeserta = dynamicFields.showPesertaSBal !== false;
        const pesertaList = showPeserta && dynamicFields.pesertaSBal && dynamicFields.pesertaSBal.length > 0
          ? dynamicFields.pesertaSBal
          : (showPeserta && letterForm.sbalData?.peserta && letterForm.sbalData.peserta.length > 0 
              ? letterForm.sbalData.peserta 
              : [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }]);
        
        extraFields = {
          lampiranSBal: dynamicFields.lampiranSBal || '-',
          perihalSBal: dynamicFields.perihalSBal || letterForm.subject || 'Balasan Permohonan Kerja Praktik',
          penerimaSBal: dynamicFields.penerimaSBal || letterForm.recipientName || '',
          noSuratAsal: dynamicFields.noSuratAsal || '',
          tglSuratAsal: dynamicFields.tglSuratAsal || '',
          namaKegiatanSBal: dynamicFields.namaKegiatanSBal || 'Kerja Praktik (KP) / PKL',
          periodeSBal: dynamicFields.periodeSBal || '',
          penempatanSBal: dynamicFields.penempatanSBal || '',
          catatanSBal: dynamicFields.catatanSBal || '',
          showPesertaSBal: showPeserta,
          sbalData: {
            peserta: showPeserta ? pesertaList : [],
            showPeserta: showPeserta,
            periode: dynamicFields.periodeSBal || '',
            penempatan: dynamicFields.penempatanSBal || '',
            catatan: dynamicFields.catatanSBal || ''
          }
        };
        finalContent = ''; // SBal has a specific structured layout with table in App.jsx
    } else if (letterForm.typeCode === "SPD") {
        extraFields = {
            ppkSPD: dynamicFields.ppkSPD || '',
            pelaksanaSPD: dynamicFields.pelaksanaSPD || '',
            pangkatSPD: dynamicFields.pangkatSPD || '',
            jabatanInstansiSPD: dynamicFields.jabatanInstansiSPD || '',
            tingkatBiayaSPD: dynamicFields.tingkatBiayaSPD || '',
            maksudSPD: dynamicFields.maksudSPD || '',
            alatAngkutSPD: dynamicFields.alatAngkutSPD || '',
            tempatBerangkatSPD: dynamicFields.tempatBerangkatSPD || '',
            tempatTujuanSPD: dynamicFields.tempatTujuanSPD || '',
            lamaPerjalananSPD: dynamicFields.lamaPerjalananSPD || '',
            tglBerangkatSPD: dynamicFields.tglBerangkatSPD || '',
            tglKembaliSPD: dynamicFields.tglKembaliSPD || '',
            pengikutSPD: dynamicFields.pengikutSPD || [],
            instansiAnggaranSPD: dynamicFields.instansiAnggaranSPD !== undefined ? dynamicFields.instansiAnggaranSPD : 'Belanja Perjalanan Dinas',
            kodeAnggaranSPD: dynamicFields.kodeAnggaranSPD || '',
            keteranganSPD: dynamicFields.keteranganSPD || ''
        };
        finalContent = ''; // SPD has a specific layout in App.jsx
    } else if (letterForm.typeCode === "SRkm") {
        extraFields = {
          titleSRkm: dynamicFields.titleSRkm || '',
          dasarSRkm: dynamicFields.dasarSRkm || '',
          menimbangSRkm: dynamicFields.menimbangSRkm || '',
          namaPenerimaSRkm: dynamicFields.namaPenerimaSRkm || '',
          jabatanPenerimaSRkm: dynamicFields.jabatanPenerimaSRkm || '',
          untukSRkm: dynamicFields.untukSRkm || ''
        };
        finalContent = ''; // SRkm has specific layout
    } else if (letterForm.typeCode === "SPgl") {
        extraFields = {
          sifatSPgl: dynamicFields.sifatSPgl || '',
          lampiranSPgl: dynamicFields.lampiranSPgl || '-',
          penerimaSPgl: dynamicFields.penerimaSPgl || '',
          alasanSPgl: dynamicFields.alasanSPgl || '',
          hariSPgl: dynamicFields.hariSPgl || '',
          tanggalSPgl: dynamicFields.tanggalSPgl || '',
          pukulSPgl: dynamicFields.pukulSPgl || '',
          tempatSPgl: dynamicFields.tempatSPgl || '',
          menghadapSPgl: dynamicFields.menghadapSPgl || '',
          alamatSPgl: dynamicFields.alamatSPgl || '',
          untukSPgl: dynamicFields.untukSPgl || ''
        };
        finalContent = ''; // SPgl has specific layout
    } else if (letterForm.typeCode === "Mem") {
        extraFields = {
          dariMem: dynamicFields.dariMem || '',
          kepadaMem: dynamicFields.kepadaMem || '',
          isiMem: dynamicFields.isiMem || ''
        };
        finalContent = ''; // Mem has specific layout
    } else if (letterForm.typeCode === "Nd") {
        extraFields = {
          kepadaNd: dynamicFields.kepadaNd || '',
          dariNd: dynamicFields.dariNd || '',
          tembusanNd: dynamicFields.tembusanNd || '',
          sifatNd: dynamicFields.sifatNd || '',
          lampiranNd: dynamicFields.lampiranNd || '-',
          perihalNd: dynamicFields.perihalNd || '',
          isiNd: dynamicFields.isiNd || ''
        };
        finalContent = ''; // Nd has specific layout
    } else if (letterForm.typeCode === "Peng") {
        extraFields = {
          tentangPeng: dynamicFields.tentangPeng || '',
          isiPeng: dynamicFields.isiPeng || ''
        };
        finalContent = ''; // Peng has specific layout
    } else if (letterForm.typeCode === "TS") {
        extraFields = {
          kepadaTS: dynamicFields.kepadaTS || '',
          dariTS: dynamicFields.dariTS || '',
          sifatTS: dynamicFields.sifatTS || '',
          lampiranTS: dynamicFields.lampiranTS || '-',
          perihalTS: dynamicFields.perihalTS || '',
          persoalanTS: dynamicFields.persoalanTS || '',
          praanggapanTS: dynamicFields.praanggapanTS || '',
          faktaTS: dynamicFields.faktaTS || '',
          analisisTS: dynamicFields.analisisTS || '',
          kesimpulanTS: dynamicFields.kesimpulanTS || '',
          saranTS: dynamicFields.saranTS || ''
        };
        finalContent = ''; // TS has specific layout
    } else if (letterForm.typeCode === "Lap") {
        extraFields = {
          judulLap: dynamicFields.judulLap || '',
          latarBelakangLap: dynamicFields.latarBelakangLap || '',
          landasanHukumLap: dynamicFields.landasanHukumLap || '',
          maksudTujuanLap: dynamicFields.maksudTujuanLap || '',
          kegiatanLap: dynamicFields.kegiatanLap || '',
          hasilLap: dynamicFields.hasilLap || '',
          kesimpulanSaranLap: dynamicFields.kesimpulanSaranLap || '',
          penutupLap: dynamicFields.penutupLap || ''
        };
        finalContent = ''; // Lap has specific layout
    } else if (letterForm.typeCode === "BA") {
        extraFields = {
          namaPihak1BA: dynamicFields.namaPihak1BA || '',
          jabatanPihak1BA: dynamicFields.jabatanPihak1BA || '',
          kedudukanPihak1BA: dynamicFields.kedudukanPihak1BA || '',
          namaPihak2BA: dynamicFields.namaPihak2BA || '',
          jabatanPihak2BA: dynamicFields.jabatanPihak2BA || '',
          kedudukanPihak2BA: dynamicFields.kedudukanPihak2BA || '',
          isiBA: dynamicFields.isiBA || '',
          namaPengesahBA: dynamicFields.namaPengesahBA || '',
          jabatanPengesahBA: dynamicFields.jabatanPengesahBA || '',
          nikPihak1BA: dynamicFields.nikPihak1BA || '',
          nikPihak2BA: dynamicFields.nikPihak2BA || '',
          nikPengesahBA: dynamicFields.nikPengesahBA || ''
        };
        finalContent = ''; // BA has specific layout
    } else if (letterForm.typeCode === "Ntl") {
        extraFields = {
          acaraNtl: dynamicFields.acaraNtl || '',
          waktuNtl: dynamicFields.waktuNtl || '',
          tempatNtl: dynamicFields.tempatNtl || '',
          isiNtl: dynamicFields.isiNtl || '',
          namaModeratorNtl: dynamicFields.namaModeratorNtl || '',
          namaNotulisNtl: dynamicFields.namaNotulisNtl || '',
          namaPengesahNtl: dynamicFields.namaPengesahNtl || '',
          jabatanPengesahNtl: dynamicFields.jabatanPengesahNtl || '',
          nikPengesahNtl: dynamicFields.nikPengesahNtl || ''
        };
        finalContent = ''; // Ntl has specific layout
    } else if (letterForm.typeCode === "Dh") {
        extraFields = {
          acaraDh: dynamicFields.acaraDh || '',
          waktuDh: dynamicFields.waktuDh || '',
          tempatDh: dynamicFields.tempatDh || '',
          jmlBarisDh: dynamicFields.jmlBarisDh || '15',
          namaPengesahDh: dynamicFields.namaPengesahDh || '',
          jabatanPengesahDh: dynamicFields.jabatanPengesahDh || '',
          nikPengesahDh: dynamicFields.nikPengesahDh || ''
        };
        finalContent = ''; // Dh has specific layout
    } else if (letterForm.typeCode === "Disp") {
        extraFields = {
          kepadaDisp: dynamicFields.kepadaDisp || '',
          dariDisp: dynamicFields.dariDisp || '',
          isInformasiDisp: dynamicFields.isInformasiDisp || false,
          isAksiDisp: dynamicFields.isAksiDisp || false,
          isDisetujuiDisp: dynamicFields.isDisetujuiDisp || false,
          jmlBarisDisp: dynamicFields.jmlBarisDisp || '15',
          namaPenyampaiDisp: dynamicFields.namaPenyampaiDisp || ''
        };
        finalContent = ''; // Disp has specific layout
    }

    const syntheticEvent = { ...e, preventDefault: () => e.preventDefault() };
    setLetterForm(prev => {
      const updated = { ...prev, content: finalContent, ...extraFields };
      setTimeout(() => { handleCreateLetter(syntheticEvent, updated); }, 0);
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Card Laporan Bulanan */}
      <div className="laporan-persuratan-card">
        <div className="laporan-persuratan-header">
          <h3 className="laporan-persuratan-title">
            <FileText size={17} /> Laporan Bulanan Persuratan
          </h3>
          <p className="laporan-persuratan-subtitle">Cetak rekapitulasi data surat masuk dan keluar</p>
        </div>
        <div className="laporan-persuratan-controls">
          <div className="laporan-persuratan-fields">
            <div className="laporan-persuratan-field">
              <label className="laporan-persuratan-label">Bulan</label>
              <select value={letterReportFilter.month} onChange={e => setLetterReportFilter({ ...letterReportFilter, month: e.target.value })} className="input-field" style={{ width: '100%' }}>
                <option value="01">Januari</option><option value="02">Februari</option><option value="03">Maret</option>
                <option value="04">April</option><option value="05">Mei</option><option value="06">Juni</option>
                <option value="07">Juli</option><option value="08">Agustus</option><option value="09">September</option>
                <option value="10">Oktober</option><option value="11">November</option><option value="12">Desember</option>
              </select>
            </div>
            <div className="laporan-persuratan-field">
              <label className="laporan-persuratan-label">Tahun</label>
              <select value={letterReportFilter.year} onChange={e => setLetterReportFilter({ ...letterReportFilter, year: e.target.value })} className="input-field" style={{ width: '100%' }}>
                <option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option>
              </select>
            </div>
            <div className="laporan-persuratan-field field-full">
              <label className="laporan-persuratan-label">Jenis Surat</label>
              <select value={letterReportFilter.type} onChange={e => setLetterReportFilter({ ...letterReportFilter, type: e.target.value })} className="input-field" style={{ width: '100%' }}>
                <option value="all">Semua (Masuk & Keluar)</option><option value="in">Surat Masuk</option><option value="out">Surat Keluar</option>
              </select>
            </div>
          </div>
          <div className="laporan-persuratan-actions">
            <button type="button" onClick={() => previewJSPDFReport(letterReportFilter.month, letterReportFilter.year, letterReportFilter.type)} className="laporan-persuratan-btn-lihat"><Eye size={14} /> Lihat</button>
            <button type="button" onClick={() => { generateJSPDFReport(letterReportFilter.month, letterReportFilter.year, letterReportFilter.type); }} className="laporan-persuratan-btn-pdf"><Download size={14} /> PDF</button>
            <button type="button" onClick={() => { generateWordReport(letterReportFilter.month, letterReportFilter.year, letterReportFilter.type); }} className="laporan-persuratan-btn-lihat" style={{ borderColor: '#2563eb', color: '#2563eb' }}><FileText size={14} /> Word</button>
            <button type="button" onClick={() => { printJSPDFReport(letterReportFilter.month, letterReportFilter.year, letterReportFilter.type); }} className="laporan-persuratan-btn-print"><Printer size={14} /> Cetak</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Form Buat Surat */}
        <div id="form-buat-surat" className="elegant-card elegant-table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem', borderBottom: letterForm.id ? '2px solid var(--primary)' : 'none', paddingBottom: letterForm.id ? '0.75rem' : '0' }}>
            <div>
              <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--primary)' }}>
                {letterForm.id ? `✏️ Edit Dokumen: ${letterForm.docNo}` : 'Buat Surat Resmi (Smart Form)'}
              </h3>
              {letterForm.id && (
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Perihal: <strong>{letterForm.subject || letterForm.sopData?.judulSop || '-'}</strong> (Mengedit dokumen di form utama)
                </p>
              )}
            </div>
            {letterForm.id && (
              <button
                type="button"
                onClick={() => {
                  const initialTemplate = getTemplateData("SKet");
                  setLetterForm({
                    docNo: "",
                    typeCode: "SKet",
                    unitCode: "01-10.0",
                    destination: "",
                    recipientName: "",
                    subject: initialTemplate.subject,
                    content: initialTemplate.content,
                    attachments: "-",
                    signatory: "",
                    title: "",
                    tembusan: [""],
                    leftSignatoryName: "",
                    leftSignatoryTitle: "",
                    signeeCount: 1,
                    kopType: "direktur",
                    date: new Date().toISOString().split('T')[0],
                    useDigitalSignature: true,
                    useDigitalStamp: true,
                    skData: { tentang: "", menimbang: [""], mengingat: [""], menetapkan: "", keputusan: [{ key: "KESATU", value: "" }] },
                    pedomanData: { lampiranNomor: "", lampiranTentang: "", babs: [{ title: "PENDAHULUAN", points: ["Latar Belakang\n...", "Maksud dan Tujuan\n...", "Sasaran\n...", "Asas\n...", "Ruang Lingkup\n...", "Pengertian Umum\n..."] }] },
                    sopData: { judulSop: "", noDokumen: "", noRevisi: "", tanggalTerbit: "", halaman: "", pengertian: "", tujuan: "", kebijakan: "", referensi: "", langkahLangkah: [""], baganAlir: [""], halDiperhatikan: "", unitTerkait: "", dokumenTerkait: "", rekamHistoris: [{ no: "1", yangDiubah: "", isiPerubahan: "", tanggalMulai: "" }] },
                    kakData: { judulProgram: "", nomor: "", pendahuluan: "", latarBelakang: "", tujuanUmum: "", tujuanKhusus: "", kegiatanPokok: [{ pokok: "", rincian: [""] }], caraMelaksanakan: "", sasaran: "", jadwal: [{ kegiatan: "", bulan: Array(12).fill(false) }], evaluasi: "", pencatatan: "", pembiayaan: "" }
                  });
                  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Mode edit dibatalkan, kembali ke form baru.", type: 'info' } }));
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '6px',
                  border: '1px solid #f87171',
                  backgroundColor: '#fef2f2',
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ✕ Batal Edit &amp; Buat Dokumen Baru
              </button>
            )}
          </div>
          <form onSubmit={onFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Jenis Surat + Unit Pengeluar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Jenis Surat</label>
                <select className="input-field" value={letterForm.typeCode} onChange={e => {
                  const newType = e.target.value;
                  const templateData = getTemplateData(newType);
                  setDynamicFields({});
                  setLetterForm({ ...letterForm, typeCode: newType, subject: templateData.subject, content: templateData.content });
                }} required>
                  {letterTypes.map(t => (<option key={t.code} value={t.code}>{t.name} ({t.code})</option>))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Unit Pengeluar</label>
                <select className="input-field" value={letterForm.unitCode} onChange={e => setLetterForm({ ...letterForm, unitCode: e.target.value })} required>
                  {unitCodes.map(u => (<option key={u.code} value={u.code}>{u.name} ({u.code})</option>))}
                </select>
              </div>
            </div>

            {/* Nomor Dokumen + Perihal */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nomor Dokumen Resmi</label>
                <input type="text" className="input-field" value={letterForm.docNo} onChange={e => setLetterForm({ ...letterForm, docNo: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Perihal (Subject)</label>
                <input type="text" value={letterForm.subject} onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })} required className="input-field" />
              </div>
            </div>

            {/* Instansi + Nama Penerima (disembunyikan untuk SOP) */}
            {letterForm.typeCode !== "SOP" && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Instansi / Tujuan Surat</label>
                  <input type="text" value={letterForm.destination} onChange={e => setLetterForm({ ...letterForm, destination: e.target.value })} required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nama Penerima</label>
                  <input type="text" value={letterForm.recipientName} onChange={e => setLetterForm({ ...letterForm, recipientName: e.target.value })} required className="input-field" />
                </div>
              </div>
            )}

            {/* Tipe Kop Surat (disembunyikan untuk SOP) */}
            {letterForm.typeCode !== "SOP" && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Tipe Kop Surat</label>
                <select className="input-field" value={letterForm.kopType || "direktur"} onChange={e => setLetterForm({ ...letterForm, kopType: e.target.value })} required>
                  <option value="direktur">Kop Direktur / Laporan (Rata Tengah)</option>
                  <option value="non-direktur">Kop Selain Direktur (Logo Kiri)</option>
                </select>
              </div>
            )}

            {/* Tanda Tangan (disembunyikan untuk SOP) */}
            {letterForm.typeCode !== "SOP" && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Pengaturan Tanda Tangan Surat</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pilih jumlah tanda tangan yang ingin dicantumkan di surat</span>
                  </div>
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)', gap: '4px' }}>
                    <button type="button" onClick={() => setLetterForm({ ...letterForm, signeeCount: 1, leftSignatoryTitle: "", leftSignatoryName: "" })}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: (letterForm.signeeCount || 1) === 1 ? 700 : 500, backgroundColor: (letterForm.signeeCount || 1) === 1 ? 'var(--primary)' : 'transparent', color: (letterForm.signeeCount || 1) === 1 ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                      1 TTD (Kanan)
                    </button>
                    <button type="button" onClick={() => setLetterForm({ ...letterForm, signeeCount: 2 })}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: letterForm.signeeCount === 2 ? 700 : 500, backgroundColor: letterForm.signeeCount === 2 ? 'var(--primary)' : 'transparent', color: letterForm.signeeCount === 2 ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                      2 TTD (Kiri & Kanan)
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: letterForm.signeeCount === 2 ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                  {letterForm.signeeCount === 2 && (
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 0.75rem 0' }}>Tanda Tangan Kiri (Pihak Kedua / Pengirim)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan Penandatangan Kiri</label><input type="text" placeholder="Contoh: Penanggung Jawab / Pembuat Komitmen" value={letterForm.leftSignatoryTitle || ""} onChange={e => setLetterForm({ ...letterForm, leftSignatoryTitle: e.target.value })} className="input-field" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Penandatangan Kiri</label><input type="text" placeholder="Kosongkan jika tanda tangan manual" value={letterForm.leftSignatoryName || ""} onChange={e => setLetterForm({ ...letterForm, leftSignatoryName: e.target.value })} className="input-field" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} /></div>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', margin: '0 0 0.75rem 0' }}>Tanda Tangan Kanan (Direktur / Pimpinan)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan Penandatangan Kanan</label><input type="text" placeholder="Default: Direktur Utama" value={letterForm.title || ""} onChange={e => setLetterForm({ ...letterForm, title: e.target.value })} className="input-field" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} /></div>
                      <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama Direktur / Penandatangan</label><input type="text" placeholder="Kosongkan jika diisi otomatis / manual" value={letterForm.signatory || ""} onChange={e => setLetterForm({ ...letterForm, signatory: e.target.value })} className="input-field" style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem' }} /></div>
                      <div style={{ marginTop: '0.25rem', padding: '0.6rem 0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Opsi Pengesahan Digital:</span>
                        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', margin: 0 }}>
                            <input type="checkbox" checked={letterForm.useDigitalSignature !== false} onChange={e => setLetterForm({ ...letterForm, useDigitalSignature: e.target.checked })} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                            ✍️ Pakai Tanda Tangan Digital
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', margin: 0 }}>
                            <input type="checkbox" checked={letterForm.useDigitalStamp !== false} onChange={e => setLetterForm({ ...letterForm, useDigitalStamp: e.target.checked })} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                            💮 Pakai Stempel Resmi
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data Spesifik untuk selain SOP dan SKep */}
            {letterForm.typeCode !== "SOP" && letterForm.typeCode !== "SKep" && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--primary)' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', margin: '0 0 1rem 0' }}>Data Spesifik ({letterForm.typeCode})</h4>

                {letterForm.typeCode === "SKet" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Yang bertandatangan dibawah ini :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">a. Nama</label><input type="text" className="input-field" value={dynamicFields.namaTtd || ''} onChange={e => handleDynamicFieldChange('namaTtd', e.target.value)} required /></div>
                        <div><label className="form-label">b. Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanTtd || ''} onChange={e => handleDynamicFieldChange('jabatanTtd', e.target.value)} required /></div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>dengan ini menerangkan bahwa :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">a. Nama</label><input type="text" className="input-field" value={dynamicFields.namaDiterangkan || ''} onChange={e => handleDynamicFieldChange('namaDiterangkan', e.target.value)} required /></div>
                        <div><label className="form-label">b. Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanDiterangkan || ''} onChange={e => handleDynamicFieldChange('jabatanDiterangkan', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Untuk Keperluan</label><textarea className="input-field" value={dynamicFields.keperluan || ''} onChange={e => handleDynamicFieldChange('keperluan', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                      <div><label className="form-label">Harapan (pihak berwenang dapat...)</label><textarea className="input-field" value={dynamicFields.harapan || ''} onChange={e => handleDynamicFieldChange('harapan', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SK" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>PEMBERI KUASA (Yang bertandatangan dibawah ini) :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama</label><input type="text" className="input-field" value={dynamicFields.namaPemberi || ''} onChange={e => handleDynamicFieldChange('namaPemberi', e.target.value)} required /></div>
                        <div><label className="form-label">Alamat</label><input type="text" className="input-field" value={dynamicFields.alamatPemberi || ''} onChange={e => handleDynamicFieldChange('alamatPemberi', e.target.value)} required /></div>
                        <div><label className="form-label">Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPemberi || ''} onChange={e => handleDynamicFieldChange('jabatanPemberi', e.target.value)} required placeholder="Misal: Direktur Klinik Baiturrahman" /></div>
                        <div><label className="form-label">No KTP</label><input type="text" className="input-field" value={dynamicFields.ktpPemberi || ''} onChange={e => handleDynamicFieldChange('ktpPemberi', e.target.value)} required /></div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>PENERIMA KUASA (Dengan ini memberikan kuasa kepada) :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama</label><input type="text" className="input-field" value={dynamicFields.namaPenerima || ''} onChange={e => handleDynamicFieldChange('namaPenerima', e.target.value)} required /></div>
                        <div><label className="form-label">Alamat</label><input type="text" className="input-field" value={dynamicFields.alamatPenerima || ''} onChange={e => handleDynamicFieldChange('alamatPenerima', e.target.value)} required /></div>
                        <div><label className="form-label">Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPenerima || ''} onChange={e => handleDynamicFieldChange('jabatanPenerima', e.target.value)} /></div>
                        <div><label className="form-label">No KTP</label><input type="text" className="input-field" value={dynamicFields.ktpPenerima || ''} onChange={e => handleDynamicFieldChange('ktpPenerima', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                      <div><label className="form-label">Bertindak untuk dan atas nama pemberi kuasa selaku... dalam...</label><textarea className="input-field" value={dynamicFields.bertindakSelaku || ''} onChange={e => handleDynamicFieldChange('bertindakSelaku', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                      <div><label className="form-label">...berhak dan melakukan tindakan yang dipandang perlu untuk...</label><textarea className="input-field" value={dynamicFields.tindakan || ''} onChange={e => handleDynamicFieldChange('tindakan', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SP" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Penerima Peringatan :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama</label><input type="text" className="input-field" value={dynamicFields.namaPegawai || ''} onChange={e => handleDynamicFieldChange('namaPegawai', e.target.value)} required /></div>
                        <div><label className="form-label">NIK</label><input type="text" className="input-field" value={dynamicFields.nikPegawai || ''} onChange={e => handleDynamicFieldChange('nikPegawai', e.target.value)} required /></div>
                        <div><label className="form-label">Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPegawai || ''} onChange={e => handleDynamicFieldChange('jabatanPegawai', e.target.value)} required /></div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Isi Surat Peringatan</label>
                      <textarea className="input-field" value={dynamicFields.isiPeringatan || ''} onChange={e => handleDynamicFieldChange('isiPeringatan', e.target.value)} required style={{ height: '100px', resize: 'vertical' }} />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SIK" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSIK || ''} onChange={e => handleDynamicFieldChange('lampiranSIK', e.target.value)} required placeholder="Misal: 1 (satu) Berkas" /></div>
                      <div><label className="form-label">Ditujukan Kepada (Yth.)</label><textarea className="input-field" value={dynamicFields.penerimaSIK || ''} onChange={e => handleDynamicFieldChange('penerimaSIK', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Bapak/Ibu Pimpinan..." /></div>
                    </div>
                    
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Kegiatan :</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Nama Kegiatan</label><input type="text" className="input-field" value={dynamicFields.namaKegiatan || ''} onChange={e => handleDynamicFieldChange('namaKegiatan', e.target.value)} required /></div>
                        <div><label className="form-label">Hari</label><input type="text" className="input-field" value={dynamicFields.hariKegiatan || ''} onChange={e => handleDynamicFieldChange('hariKegiatan', e.target.value)} required /></div>
                        <div><label className="form-label">Tanggal</label><input type="text" className="input-field" value={dynamicFields.tanggalKegiatan || ''} onChange={e => handleDynamicFieldChange('tanggalKegiatan', e.target.value)} required /></div>
                        <div><label className="form-label">Pukul</label><input type="text" className="input-field" value={dynamicFields.pukulKegiatan || ''} onChange={e => handleDynamicFieldChange('pukulKegiatan', e.target.value)} required /></div>
                        <div><label className="form-label">Tempat</label><input type="text" className="input-field" value={dynamicFields.tempatKegiatan || ''} onChange={e => handleDynamicFieldChange('tempatKegiatan', e.target.value)} required /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Maka kami selaku... (Selaku Pemohon)</label><input type="text" className="input-field" value={dynamicFields.selakuPemohon || ''} onChange={e => handleDynamicFieldChange('selakuPemohon', e.target.value)} required /></div>
                      </div>
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SPn" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label className="form-label">Tentang / Judul Perjanjian</label>
                      <input type="text" className="input-field" value={dynamicFields.judulPerjanjian || ''} onChange={e => handleDynamicFieldChange('judulPerjanjian', e.target.value)} required />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Hari</label><input type="text" className="input-field" value={dynamicFields.hariPerjanjian || ''} onChange={e => handleDynamicFieldChange('hariPerjanjian', e.target.value)} required /></div>
                      <div><label className="form-label">Tanggal (Misal: 12)</label><input type="text" className="input-field" value={dynamicFields.tanggalPerjanjian || ''} onChange={e => handleDynamicFieldChange('tanggalPerjanjian', e.target.value)} required /></div>
                      <div><label className="form-label">Bulan & Tahun</label><input type="text" className="input-field" value={dynamicFields.bulanTahunPerjanjian || ''} onChange={e => handleDynamicFieldChange('bulanTahunPerjanjian', e.target.value)} required /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Bertempat di</label><input type="text" className="input-field" value={dynamicFields.tempatPerjanjian || ''} onChange={e => handleDynamicFieldChange('tempatPerjanjian', e.target.value)} required /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Pihak Ke-I (Pertama)</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama</label><input type="text" className="input-field" value={dynamicFields.namaPihak1 || ''} onChange={e => handleDynamicFieldChange('namaPihak1', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Alamat</label><input type="text" className="input-field" value={dynamicFields.alamatPihak1 || ''} onChange={e => handleDynamicFieldChange('alamatPihak1', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPihak1 || ''} onChange={e => handleDynamicFieldChange('jabatanPihak1', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>No KTP / NIK</label><input type="text" className="input-field" value={dynamicFields.ktpPihak1 || ''} onChange={e => handleDynamicFieldChange('ktpPihak1', e.target.value)} required /></div>
                        </div>
                      </div>
                      <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                        <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Pihak Ke-II (Kedua)</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama</label><input type="text" className="input-field" value={dynamicFields.namaPihak2 || ''} onChange={e => handleDynamicFieldChange('namaPihak2', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Alamat</label><input type="text" className="input-field" value={dynamicFields.alamatPihak2 || ''} onChange={e => handleDynamicFieldChange('alamatPihak2', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPihak2 || ''} onChange={e => handleDynamicFieldChange('jabatanPihak2', e.target.value)} required /></div>
                          <div><label className="form-label" style={{ fontSize: '0.75rem' }}>No KTP / NIK</label><input type="text" className="input-field" value={dynamicFields.ktpPihak2 || ''} onChange={e => handleDynamicFieldChange('ktpPihak2', e.target.value)} required /></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Isi Perjanjian (Pasal-pasal)</label>
                      <textarea className="input-field" value={dynamicFields.isiPerjanjian || ''} onChange={e => handleDynamicFieldChange('isiPerjanjian', e.target.value)} required style={{ height: '150px', resize: 'vertical' }} placeholder="Pasal 1...&#10;Pasal 2..." />
                    </div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Saksi-saksi (Opsional)</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Saksi 1</label><input type="text" className="input-field" value={dynamicFields.saksi1 || ''} onChange={e => handleDynamicFieldChange('saksi1', e.target.value)} /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Saksi 2</label><input type="text" className="input-field" value={dynamicFields.saksi2 || ''} onChange={e => handleDynamicFieldChange('saksi2', e.target.value)} /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Saksi 3</label><input type="text" className="input-field" value={dynamicFields.saksi3 || ''} onChange={e => handleDynamicFieldChange('saksi3', e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "ST" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label className="form-label">Dasar Surat</label>
                      <textarea className="input-field" value={letterForm.stData?.dasar || ''} onChange={e => setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, dasar: e.target.value } }))} required style={{ height: '60px', resize: 'vertical' }} placeholder="Contoh: Surat Perintah dari ... No ..." />
                    </div>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <p style={{ fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>MENUGASKAN Kepada:</p>
                      {(() => {
                        const pegawaiArr = letterForm.stData?.pegawai || [{ nama: '', nik: '', jabatan: '' }];
                        return pegawaiArr.map((peg, pIdx) => (
                          <div key={pIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Nama</label>
                              <input type="text" className="input-field" value={peg.nama} onChange={e => { const arr = [...pegawaiArr]; arr[pIdx].nama = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, pegawai: arr } })); }} required />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>NIK</label>
                              <input type="text" className="input-field" value={peg.nik} onChange={e => { const arr = [...pegawaiArr]; arr[pIdx].nik = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, pegawai: arr } })); }} required />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Jabatan</label>
                              <input type="text" className="input-field" value={peg.jabatan} onChange={e => { const arr = [...pegawaiArr]; arr[pIdx].jabatan = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, pegawai: arr } })); }} required />
                            </div>
                            {pegawaiArr.length > 1 && (
                              <button type="button" onClick={() => { const arr = pegawaiArr.filter((_, i) => i !== pIdx); setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, pegawai: arr } })); }} style={{ padding: '0.6rem 0.8rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', marginBottom: '1px' }}>Hapus</button>
                            )}
                          </div>
                        ));
                      })()}
                      <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, pegawai: [...(prev.stData?.pegawai || [{ nama: '', nik: '', jabatan: '' }]), { nama: '', nik: '', jabatan: '' }] } }))} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 600 }}>+ Tambah Pegawai</button>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <p style={{ fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>Untuk Melaksanakan Tugas:</p>
                      {(() => {
                        const tugasArr = letterForm.stData?.tugas || [''];
                        return tugasArr.map((tgs, tIdx) => (
                          <div key={tIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <span style={{ paddingTop: '0.5rem', fontWeight: 600 }}>{tIdx + 1}.</span>
                            <input type="text" className="input-field" value={tgs} onChange={e => { const arr = [...tugasArr]; arr[tIdx] = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, tugas: arr } })); }} required style={{ flex: 1 }} />
                            {tugasArr.length > 1 && (
                              <button type="button" onClick={() => { const arr = tugasArr.filter((_, i) => i !== tIdx); setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, tugas: arr } })); }} style={{ padding: '0 0.8rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer' }}>✕</button>
                            )}
                          </div>
                        ));
                      })()}
                      <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, tugas: [...(prev.stData?.tugas || ['']), ''] } }))} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 600 }}>+ Tambah Tugas</button>
                    </div>
                  </div>
                )}


                {letterForm.typeCode === "SU" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Sifat</label><input type="text" className="input-field" value={dynamicFields.sifatSU || ''} onChange={e => handleDynamicFieldChange('sifatSU', e.target.value)} required placeholder="Misal: Penting" /></div>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSU || ''} onChange={e => handleDynamicFieldChange('lampiranSU', e.target.value)} required placeholder="Misal: 1 Berkas" /></div>
                    </div>
                    <div><label className="form-label">Ditujukan Kepada (Yth.)</label><textarea className="input-field" value={dynamicFields.penerimaSU || ''} onChange={e => handleDynamicFieldChange('penerimaSU', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Bapak/Ibu..." /></div>
                    <div><label className="form-label">Kalimat Pembuka (Opsional)</label><textarea className="input-field" value={dynamicFields.pembukaSU || ''} onChange={e => handleDynamicFieldChange('pembukaSU', e.target.value)} style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Dengan hormat, bersama ini kami..." /></div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Acara / Kegiatan</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Hari</label><input type="text" className="input-field" value={dynamicFields.hariSU || ''} onChange={e => handleDynamicFieldChange('hariSU', e.target.value)} required /></div>
                        <div><label className="form-label">Tanggal</label><input type="text" className="input-field" value={dynamicFields.tanggalSU || ''} onChange={e => handleDynamicFieldChange('tanggalSU', e.target.value)} required /></div>
                        <div><label className="form-label">Pukul</label><input type="text" className="input-field" value={dynamicFields.pukulSU || ''} onChange={e => handleDynamicFieldChange('pukulSU', e.target.value)} required /></div>
                        <div><label className="form-label">Tempat</label><input type="text" className="input-field" value={dynamicFields.tempatSU || ''} onChange={e => handleDynamicFieldChange('tempatSU', e.target.value)} required /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Acara</label><input type="text" className="input-field" value={dynamicFields.acaraSU || ''} onChange={e => handleDynamicFieldChange('acaraSU', e.target.value)} required /></div>
                      </div>
                    </div>
                    <div><label className="form-label">Kalimat Penutup (Opsional)</label><textarea className="input-field" value={dynamicFields.penutupSU || ''} onChange={e => handleDynamicFieldChange('penutupSU', e.target.value)} style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Demikian undangan ini..." /></div>
                  </div>
                )}                {letterForm.typeCode === "SPer" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Pemberi Perintah</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama</label><input type="text" className="input-field" value={dynamicFields.namaPemberiSPer || ''} onChange={e => handleDynamicFieldChange('namaPemberiSPer', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPemberiSPer || ''} onChange={e => handleDynamicFieldChange('jabatanPemberiSPer', e.target.value)} required /></div>
                      </div>
                    </div>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Data Penerima Perintah</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Nama</label><input type="text" className="input-field" value={dynamicFields.namaPenerimaSPer || ''} onChange={e => handleDynamicFieldChange('namaPenerimaSPer', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPenerimaSPer || ''} onChange={e => handleDynamicFieldChange('jabatanPenerimaSPer', e.target.value)} required /></div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Untuk (Isi Perintah)</label>
                      <textarea className="input-field" value={dynamicFields.untukSPer || ''} onChange={e => handleDynamicFieldChange('untukSPer', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} placeholder="Melaksanakan..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SPem" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSPem || ''} onChange={e => handleDynamicFieldChange('lampiranSPem', e.target.value)} required placeholder="Misal: -" /></div>
                      <div><label className="form-label">Perihal (Setelah kata 'Pemberitahuan')</label><input type="text" className="input-field" value={dynamicFields.perihalSPem || ''} onChange={e => handleDynamicFieldChange('perihalSPem', e.target.value)} required placeholder="Misal: Cuti Bersama" /></div>
                    </div>
                    <div>
                      <label className="form-label">Ditujukan Kepada (Yth,)</label>
                      <textarea className="input-field" value={dynamicFields.penerimaSPem || ''} onChange={e => handleDynamicFieldChange('penerimaSPem', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Seluruh Staff Klinik..." />
                    </div>
                    <div>
                      <label className="form-label">Isi Pemberitahuan</label>
                      <textarea className="input-field" value={dynamicFields.isiSPem || ''} onChange={e => handleDynamicFieldChange('isiSPem', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} placeholder="Tuliskan isi surat di sini. Kata 'Dengan Hormat,' dan kalimat penutup sudah disediakan secara otomatis..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SPm" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSPm || ''} onChange={e => handleDynamicFieldChange('lampiranSPm', e.target.value)} required placeholder="Misal: -" /></div>
                      <div><label className="form-label">Perihal (Setelah kata 'Permohonan')</label><input type="text" className="input-field" value={dynamicFields.perihalSPm || ''} onChange={e => handleDynamicFieldChange('perihalSPm', e.target.value)} required placeholder="Misal: Izin Kegiatan" /></div>
                    </div>
                    <div>
                      <label className="form-label">Ditujukan Kepada (Yth,)</label>
                      <textarea className="input-field" value={dynamicFields.penerimaSPm || ''} onChange={e => handleDynamicFieldChange('penerimaSPm', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Kepala Dinas Kesehatan..." />
                    </div>
                    <div>
                      <label className="form-label">Isi Permohonan</label>
                      <textarea className="input-field" value={dynamicFields.isiSPm || ''} onChange={e => handleDynamicFieldChange('isiSPm', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} placeholder="Tuliskan isi surat di sini. Kata 'Dengan Hormat,' dan kalimat penutup sudah disediakan secara otomatis..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SBal" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSBal !== undefined ? dynamicFields.lampiranSBal : '-'} onChange={e => handleDynamicFieldChange('lampiranSBal', e.target.value)} required placeholder="Misal: -" /></div>
                      <div><label className="form-label">Perihal</label><input type="text" className="input-field" value={dynamicFields.perihalSBal !== undefined ? dynamicFields.perihalSBal : (letterForm.subject || 'Balasan Permohonan Kerja Praktik')} onChange={e => handleDynamicFieldChange('perihalSBal', e.target.value)} required /></div>
                    </div>

                    <div style={{ padding: '0.85rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-main)' }}>
                      <h5 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)', fontWeight: 700 }}>Referensi Surat Masuk / Permohonan</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nomor Surat Asal</label><input type="text" className="input-field" value={dynamicFields.noSuratAsal || ''} onChange={e => handleDynamicFieldChange('noSuratAsal', e.target.value)} placeholder="Misal: 045/UNIGA/VIII/2026" /></div>
                        <div><label className="form-label">Tanggal Surat Asal</label><input type="date" className="input-field" value={dynamicFields.tglSuratAsal || ''} onChange={e => handleDynamicFieldChange('tglSuratAsal', e.target.value)} /></div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Nama / Jenis Kegiatan</label><input type="text" className="input-field" value={dynamicFields.namaKegiatanSBal !== undefined ? dynamicFields.namaKegiatanSBal : 'Kerja Praktik (KP) / PKL'} onChange={e => handleDynamicFieldChange('namaKegiatanSBal', e.target.value)} placeholder="Kerja Praktik / PKL / Magang" /></div>
                      <div><label className="form-label">Waktu / Periode Pelaksanaan</label><input type="text" className="input-field" value={dynamicFields.periodeSBal || ''} onChange={e => handleDynamicFieldChange('periodeSBal', e.target.value)} placeholder="Misal: 01 Okt 2026 s.d. 30 Nov 2026" /></div>
                      <div><label className="form-label">Unit / Bagian Penempatan</label><input type="text" className="input-field" value={dynamicFields.penempatanSBal || ''} onChange={e => handleDynamicFieldChange('penempatanSBal', e.target.value)} placeholder="Misal: Instalasi Farmasi & Rawat Jalan" /></div>
                    </div>

                    {/* Tabel Daftar Mahasiswa / Peserta - Opsional */}
                    <div style={{ border: '1.5px solid var(--primary-light)', borderRadius: '8px', backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
                      {/* Header toggle */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: dynamicFields.showPesertaSBal !== false ? '1px solid var(--primary-light)' : 'none', backgroundColor: 'var(--bg-card)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={dynamicFields.showPesertaSBal !== false}
                              onChange={e => handleDynamicFieldChange('showPesertaSBal', e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                            />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                              Daftar Mahasiswa / Siswa yang Diterima
                            </span>
                          </label>
                          <span style={{ fontSize: '0.72rem', color: dynamicFields.showPesertaSBal !== false ? '#15803d' : 'var(--text-muted)', fontWeight: 600, backgroundColor: dynamicFields.showPesertaSBal !== false ? '#dcfce7' : 'var(--bg-main)', padding: '0.15rem 0.5rem', borderRadius: '999px', border: `1px solid ${dynamicFields.showPesertaSBal !== false ? '#86efac' : 'var(--border)'}` }}>
                            {dynamicFields.showPesertaSBal !== false ? 'Aktif' : 'Tidak digunakan'}
                          </span>
                        </div>
                        {dynamicFields.showPesertaSBal !== false && (
                          <button 
                            type="button" 
                            onClick={() => {
                              const list = dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }];
                              handleDynamicFieldChange('pesertaSBal', [...list, { nama: '', nim: '', prodi: '' }]);
                            }} 
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            + Tambah Mahasiswa
                          </button>
                        )}
                      </div>

                      {/* Konten tabel - hanya tampil jika diaktifkan */}
                      {dynamicFields.showPesertaSBal !== false ? (
                        <div style={{ padding: '0.75rem 1rem' }}>
                          <p style={{ margin: '0 0 0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tambahkan data mahasiswa/siswa yang akan dicantumkan dalam tabel surat balasan</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }]).map((mhs, mIdx) => (
                              <div key={mIdx} style={{ display: 'grid', gridTemplateColumns: '30px 1.5fr 1fr 1.2fr 40px', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '0.5rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', textAlign: 'center', color: 'var(--text-muted)' }}>{mIdx + 1}.</span>
                                <div>
                                  <input 
                                    type="text" 
                                    className="input-field" 
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} 
                                    placeholder="Nama Mahasiswa / Siswa" 
                                    value={mhs.nama} 
                                    onChange={e => {
                                      const list = [...(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }])];
                                      list[mIdx].nama = e.target.value;
                                      handleDynamicFieldChange('pesertaSBal', list);
                                    }} 
                                  />
                                </div>
                                <div>
                                  <input 
                                    type="text" 
                                    className="input-field" 
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} 
                                    placeholder="NIM / NIS" 
                                    value={mhs.nim} 
                                    onChange={e => {
                                      const list = [...(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }])];
                                      list[mIdx].nim = e.target.value;
                                      handleDynamicFieldChange('pesertaSBal', list);
                                    }} 
                                  />
                                </div>
                                <div>
                                  <input 
                                    type="text" 
                                    className="input-field" 
                                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }} 
                                    placeholder="Program Studi / Jurusan" 
                                    value={mhs.prodi} 
                                    onChange={e => {
                                      const list = [...(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }])];
                                      list[mIdx].prodi = e.target.value;
                                      handleDynamicFieldChange('pesertaSBal', list);
                                    }} 
                                  />
                                </div>
                                <div>
                                  {(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }]).length > 1 ? (
                                    <button 
                                      type="button" 
                                      title="Hapus baris" 
                                      onClick={() => {
                                        const list = [...(dynamicFields.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }])];
                                        list.splice(mIdx, 1);
                                        handleDynamicFieldChange('pesertaSBal', list);
                                      }} 
                                      style={{ padding: '0.4rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
                                    >
                                      ✕
                                    </button>
                                  ) : <div></div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            ☑ Centang kotak di atas untuk menampilkan tabel daftar mahasiswa/siswa
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="form-label">Catatan / Ketentuan Tambahan (Opsional)</label>
                      <textarea className="input-field" value={dynamicFields.catatanSBal || ''} onChange={e => handleDynamicFieldChange('catatanSBal', e.target.value)} style={{ height: '70px', resize: 'vertical' }} placeholder="Misal: Mahasiswa diwajibkan mematuhi tata tertib dan protokol keselamatan klinik..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SPD" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>1. Pejabat Pembuat Komitmen</h5>
                      <input type="text" className="input-field" value={dynamicFields.ppkSPD || ''} onChange={e => handleDynamicFieldChange('ppkSPD', e.target.value)} required />
                    </div>
                    
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>2. Pegawai yang melaksanakan Perjalanan Dinas</h5>
                      <input type="text" className="input-field" value={dynamicFields.pelaksanaSPD || ''} onChange={e => handleDynamicFieldChange('pelaksanaSPD', e.target.value)} placeholder="Nama / NIK" required />
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>3. Atribut Pegawai</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>a. Pangkat dan Golongan</label><input type="text" className="input-field" value={dynamicFields.pangkatSPD || ''} onChange={e => handleDynamicFieldChange('pangkatSPD', e.target.value)} /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>b. Jabatan / Instansi</label><input type="text" className="input-field" value={dynamicFields.jabatanInstansiSPD || ''} onChange={e => handleDynamicFieldChange('jabatanInstansiSPD', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>c. Tingkat Biaya Perjalanan</label><input type="text" className="input-field" value={dynamicFields.tingkatBiayaSPD || ''} onChange={e => handleDynamicFieldChange('tingkatBiayaSPD', e.target.value)} /></div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>4. Maksud Perjalanan Dinas</h5>
                      <textarea className="input-field" value={dynamicFields.maksudSPD || ''} onChange={e => handleDynamicFieldChange('maksudSPD', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} />
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>5. Alat Angkut</h5>
                      <input type="text" className="input-field" value={dynamicFields.alatAngkutSPD || ''} onChange={e => handleDynamicFieldChange('alatAngkutSPD', e.target.value)} placeholder="Misal: Kendaraan Dinas / Umum" required />
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>6. Rute Perjalanan</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>a. Tempat Berangkat</label><input type="text" className="input-field" value={dynamicFields.tempatBerangkatSPD || ''} onChange={e => handleDynamicFieldChange('tempatBerangkatSPD', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>b. Tempat Tujuan</label><input type="text" className="input-field" value={dynamicFields.tempatTujuanSPD || ''} onChange={e => handleDynamicFieldChange('tempatTujuanSPD', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>7. Waktu Perjalanan</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>a. Lamanya (Hari)</label><input type="text" className="input-field" value={dynamicFields.lamaPerjalananSPD || ''} onChange={e => handleDynamicFieldChange('lamaPerjalananSPD', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>b. Tanggal Berangkat</label><input type="date" className="input-field" value={dynamicFields.tglBerangkatSPD || ''} onChange={e => handleDynamicFieldChange('tglBerangkatSPD', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>c. Tanggal Harus Kembali</label><input type="date" className="input-field" value={dynamicFields.tglKembaliSPD || ''} onChange={e => handleDynamicFieldChange('tglKembaliSPD', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h5 style={{ margin: 0 }}>8. Pengikut</h5>
                        <button type="button" onClick={() => {
                          const list = dynamicFields.pengikutSPD || [];
                          handleDynamicFieldChange('pengikutSPD', [...list, { nama: '', tglLahir: '', ket: '' }]);
                        }} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Tambah</button>
                      </div>
                      {(dynamicFields.pengikutSPD || []).map((p, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 30px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <input type="text" className="input-field" value={p.nama} onChange={e => {
                            const list = [...(dynamicFields.pengikutSPD || [])];
                            list[i].nama = e.target.value;
                            handleDynamicFieldChange('pengikutSPD', list);
                          }} placeholder="Nama" />
                          <input type="date" className="input-field" value={p.tglLahir} onChange={e => {
                            const list = [...(dynamicFields.pengikutSPD || [])];
                            list[i].tglLahir = e.target.value;
                            handleDynamicFieldChange('pengikutSPD', list);
                          }} placeholder="Tgl Lahir" />
                          <input type="text" className="input-field" value={p.ket} onChange={e => {
                            const list = [...(dynamicFields.pengikutSPD || [])];
                            list[i].ket = e.target.value;
                            handleDynamicFieldChange('pengikutSPD', list);
                          }} placeholder="Keterangan" />
                          <button type="button" onClick={() => {
                            const list = [...(dynamicFields.pengikutSPD || [])];
                            list.splice(i, 1);
                            handleDynamicFieldChange('pengikutSPD', list);
                          }} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                        </div>
                      ))}
                      {(!dynamicFields.pengikutSPD || dynamicFields.pengikutSPD.length === 0) && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Tidak ada pengikut. Klik + Tambah jika ada.</p>
                      )}
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>9. Pembebanan Anggaran</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>a. Instansi</label><input type="text" className="input-field" value={dynamicFields.instansiAnggaranSPD !== undefined ? dynamicFields.instansiAnggaranSPD : 'Belanja Perjalanan Dinas'} onChange={e => handleDynamicFieldChange('instansiAnggaranSPD', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>b. Kode Mata Anggaran</label><input type="text" className="input-field" value={dynamicFields.kodeAnggaranSPD || ''} onChange={e => handleDynamicFieldChange('kodeAnggaranSPD', e.target.value)} /></div>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>10. Keterangan lain-lain</h5>
                      <input type="text" className="input-field" value={dynamicFields.keteranganSPD || ''} onChange={e => handleDynamicFieldChange('keteranganSPD', e.target.value)} />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SRkm" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="form-label">Judul Rekomendasi (setelah kata "REKOMENDASI")</label>
                      <input type="text" className="input-field" value={dynamicFields.titleSRkm || ''} onChange={e => handleDynamicFieldChange('titleSRkm', e.target.value)} required placeholder="Misal: IZIN BELAJAR" />
                    </div>
                    <div>
                      <label className="form-label">a. Dasar</label>
                      <textarea className="input-field" value={dynamicFields.dasarSRkm || ''} onChange={e => handleDynamicFieldChange('dasarSRkm', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} />
                    </div>
                    <div>
                      <label className="form-label">b. Menimbang</label>
                      <textarea className="input-field" value={dynamicFields.menimbangSRkm || ''} onChange={e => handleDynamicFieldChange('menimbangSRkm', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="form-label">Nama (Diberikan Rekomendasi Kepada)</label>
                        <input type="text" className="input-field" value={dynamicFields.namaPenerimaSRkm || ''} onChange={e => handleDynamicFieldChange('namaPenerimaSRkm', e.target.value)} required />
                      </div>
                      <div>
                        <label className="form-label">Jabatan</label>
                        <input type="text" className="input-field" value={dynamicFields.jabatanPenerimaSRkm || ''} onChange={e => handleDynamicFieldChange('jabatanPenerimaSRkm', e.target.value)} required />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Untuk</label>
                      <textarea className="input-field" value={dynamicFields.untukSRkm || ''} onChange={e => handleDynamicFieldChange('untukSRkm', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "SPgl" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Sifat</label><input type="text" className="input-field" value={dynamicFields.sifatSPgl || ''} onChange={e => handleDynamicFieldChange('sifatSPgl', e.target.value)} required placeholder="Misal: Penting" /></div>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranSPgl || ''} onChange={e => handleDynamicFieldChange('lampiranSPgl', e.target.value)} required placeholder="Misal: -" /></div>
                    </div>
                    <div>
                      <label className="form-label">Yth, (Penerima Panggilan)</label>
                      <textarea className="input-field" value={dynamicFields.penerimaSPgl || ''} onChange={e => handleDynamicFieldChange('penerimaSPgl', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} placeholder="Misal: Sdr. Budi Santoso..." />
                    </div>
                    <div>
                      <label className="form-label">Kalimat Pengantar (Diminta kedatangan Saudara di...)</label>
                      <input type="text" className="input-field" value={dynamicFields.alasanSPgl || ''} onChange={e => handleDynamicFieldChange('alasanSPgl', e.target.value)} required placeholder="Misal: Ruang Rapat Lt.2" />
                    </div>
                    
                    <div style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Detail Waktu & Tempat</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Hari</label><input type="text" className="input-field" value={dynamicFields.hariSPgl || ''} onChange={e => handleDynamicFieldChange('hariSPgl', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Tanggal</label><input type="date" className="input-field" value={dynamicFields.tanggalSPgl || ''} onChange={e => handleDynamicFieldChange('tanggalSPgl', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Pukul</label><input type="time" className="input-field" value={dynamicFields.pukulSPgl || ''} onChange={e => handleDynamicFieldChange('pukulSPgl', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Tempat</label><input type="text" className="input-field" value={dynamicFields.tempatSPgl || ''} onChange={e => handleDynamicFieldChange('tempatSPgl', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Menghadap kepada</label><input type="text" className="input-field" value={dynamicFields.menghadapSPgl || ''} onChange={e => handleDynamicFieldChange('menghadapSPgl', e.target.value)} required /></div>
                        <div><label className="form-label" style={{ fontSize: '0.75rem' }}>Alamat</label><input type="text" className="input-field" value={dynamicFields.alamatSPgl || ''} onChange={e => handleDynamicFieldChange('alamatSPgl', e.target.value)} required /></div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Untuk (Keperluan)</label>
                      <textarea className="input-field" value={dynamicFields.untukSPgl || ''} onChange={e => handleDynamicFieldChange('untukSPgl', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "Mem" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label className="form-label">Dari</label>
                        <input type="text" className="input-field" value={dynamicFields.dariMem || ''} onChange={e => handleDynamicFieldChange('dariMem', e.target.value)} required placeholder="Misal: Direktur" />
                      </div>
                      <div>
                        <label className="form-label">Kepada</label>
                        <input type="text" className="input-field" value={dynamicFields.kepadaMem || ''} onChange={e => handleDynamicFieldChange('kepadaMem', e.target.value)} required placeholder="Misal: Kepala Bagian Keuangan" />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Isi Memo</label>
                      <textarea className="input-field" value={dynamicFields.isiMem || ''} onChange={e => handleDynamicFieldChange('isiMem', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} placeholder="Tuliskan isi memo di sini..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "Nd" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Kepada</label><input type="text" className="input-field" value={dynamicFields.kepadaNd || ''} onChange={e => handleDynamicFieldChange('kepadaNd', e.target.value)} required /></div>
                      <div><label className="form-label">Dari</label><input type="text" className="input-field" value={dynamicFields.dariNd || ''} onChange={e => handleDynamicFieldChange('dariNd', e.target.value)} required /></div>
                      <div><label className="form-label">Tembusan (Opsional)</label><input type="text" className="input-field" value={dynamicFields.tembusanNd || ''} onChange={e => handleDynamicFieldChange('tembusanNd', e.target.value)} /></div>
                      <div><label className="form-label">Sifat</label><input type="text" className="input-field" value={dynamicFields.sifatNd || ''} onChange={e => handleDynamicFieldChange('sifatNd', e.target.value)} required /></div>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranNd || ''} onChange={e => handleDynamicFieldChange('lampiranNd', e.target.value)} required /></div>
                      <div><label className="form-label">Perihal</label><input type="text" className="input-field" value={dynamicFields.perihalNd || ''} onChange={e => handleDynamicFieldChange('perihalNd', e.target.value)} required /></div>
                    </div>
                    <div>
                      <label className="form-label">Isi Nota Dinas</label>
                      <textarea className="input-field" value={dynamicFields.isiNd || ''} onChange={e => handleDynamicFieldChange('isiNd', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} placeholder="Tuliskan isi nota dinas di sini..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "Peng" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label className="form-label">Tentang / Judul Pengumuman</label>
                      <input type="text" className="input-field" value={dynamicFields.tentangPeng || ''} onChange={e => handleDynamicFieldChange('tentangPeng', e.target.value)} required placeholder="Misal: HARI LIBUR NASIONAL" />
                    </div>
                    <div>
                      <label className="form-label">Isi Pengumuman</label>
                      <textarea className="input-field" value={dynamicFields.isiPeng || ''} onChange={e => handleDynamicFieldChange('isiPeng', e.target.value)} required style={{ height: '150px', resize: 'vertical' }} placeholder="Tuliskan isi pengumuman di sini..." />
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "TS" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label className="form-label">Kepada</label><input type="text" className="input-field" value={dynamicFields.kepadaTS || ''} onChange={e => handleDynamicFieldChange('kepadaTS', e.target.value)} required /></div>
                      <div><label className="form-label">Dari</label><input type="text" className="input-field" value={dynamicFields.dariTS || ''} onChange={e => handleDynamicFieldChange('dariTS', e.target.value)} required /></div>
                      <div><label className="form-label">Sifat</label><input type="text" className="input-field" value={dynamicFields.sifatTS || ''} onChange={e => handleDynamicFieldChange('sifatTS', e.target.value)} required /></div>
                      <div><label className="form-label">Lampiran</label><input type="text" className="input-field" value={dynamicFields.lampiranTS || ''} onChange={e => handleDynamicFieldChange('lampiranTS', e.target.value)} required /></div>
                      <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Perihal</label><input type="text" className="input-field" value={dynamicFields.perihalTS || ''} onChange={e => handleDynamicFieldChange('perihalTS', e.target.value)} required /></div>
                    </div>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Isi Telaahan Staf</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="form-label">I. Persoalan</label><textarea className="input-field" value={dynamicFields.persoalanTS || ''} onChange={e => handleDynamicFieldChange('persoalanTS', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">II. Praanggapan</label><textarea className="input-field" value={dynamicFields.praanggapanTS || ''} onChange={e => handleDynamicFieldChange('praanggapanTS', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">III. Fakta-fakta yang mempengaruhi</label><textarea className="input-field" value={dynamicFields.faktaTS || ''} onChange={e => handleDynamicFieldChange('faktaTS', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">IV. Analisis</label><textarea className="input-field" value={dynamicFields.analisisTS || ''} onChange={e => handleDynamicFieldChange('analisisTS', e.target.value)} required style={{ height: '100px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">V. Kesimpulan</label><textarea className="input-field" value={dynamicFields.kesimpulanTS || ''} onChange={e => handleDynamicFieldChange('kesimpulanTS', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">VI. Saran</label><textarea className="input-field" value={dynamicFields.saranTS || ''} onChange={e => handleDynamicFieldChange('saranTS', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {letterForm.typeCode === "Lap" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <label className="form-label">Tentang / Judul Laporan</label>
                      <input type="text" className="input-field" value={dynamicFields.judulLap || ''} onChange={e => handleDynamicFieldChange('judulLap', e.target.value)} required placeholder="Misal: PELAKSANAAN KEGIATAN X..." />
                    </div>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>A. PENDAHULUAN</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div><label className="form-label">1. Latar Belakang</label><textarea className="input-field" value={dynamicFields.latarBelakangLap || ''} onChange={e => handleDynamicFieldChange('latarBelakangLap', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">2. Landasan Hukum</label><textarea className="input-field" value={dynamicFields.landasanHukumLap || ''} onChange={e => handleDynamicFieldChange('landasanHukumLap', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                        <div><label className="form-label">3. Maksud dan Tujuan</label><textarea className="input-field" value={dynamicFields.maksudTujuanLap || ''} onChange={e => handleDynamicFieldChange('maksudTujuanLap', e.target.value)} required style={{ height: '60px', resize: 'vertical' }} /></div>
                      </div>
                    </div>

                    <div><label className="form-label">B. KEGIATAN YANG DILAKSANAKAN</label><textarea className="input-field" value={dynamicFields.kegiatanLap || ''} onChange={e => handleDynamicFieldChange('kegiatanLap', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} /></div>
                    <div><label className="form-label">C. HASIL YANG DICAPAI</label><textarea className="input-field" value={dynamicFields.hasilLap || ''} onChange={e => handleDynamicFieldChange('hasilLap', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} /></div>
                    <div><label className="form-label">D. KESIMPULAN DAN SARAN</label><textarea className="input-field" value={dynamicFields.kesimpulanSaranLap || ''} onChange={e => handleDynamicFieldChange('kesimpulanSaranLap', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} /></div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>E. RENCANA TINDAK LANJUT</h5>
                      {(() => {
                        const rtlArr = letterForm.stData?.rencanaTL || [{ masalah: '', rencana: '', tindakLanjut: '', evaluasi: '', keterangan: '' }];
                        return rtlArr.map((rtl, rIdx) => (
                          <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: rIdx < rtlArr.length - 1 ? '1px dashed var(--border)' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Baris {rIdx + 1}</span>
                              {rtlArr.length > 1 && (
                                <button type="button" onClick={() => { const arr = rtlArr.filter((_, i) => i !== rIdx); setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} style={{ padding: '0.2rem 0.6rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', fontSize: '0.75rem' }}>Hapus</button>
                              )}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <div><label style={{ fontSize: '0.75rem' }}>Masalah</label><input type="text" className="input-field" value={rtl.masalah} onChange={e => { const arr = [...rtlArr]; arr[rIdx].masalah = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} /></div>
                              <div><label style={{ fontSize: '0.75rem' }}>Rencana Tindak Lanjut</label><input type="text" className="input-field" value={rtl.rencana} onChange={e => { const arr = [...rtlArr]; arr[rIdx].rencana = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} /></div>
                              <div><label style={{ fontSize: '0.75rem' }}>Tindak Lanjut</label><input type="text" className="input-field" value={rtl.tindakLanjut} onChange={e => { const arr = [...rtlArr]; arr[rIdx].tindakLanjut = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} /></div>
                              <div><label style={{ fontSize: '0.75rem' }}>Evaluasi</label><input type="text" className="input-field" value={rtl.evaluasi} onChange={e => { const arr = [...rtlArr]; arr[rIdx].evaluasi = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} /></div>
                              <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '0.75rem' }}>Keterangan</label><input type="text" className="input-field" value={rtl.keterangan} onChange={e => { const arr = [...rtlArr]; arr[rIdx].keterangan = e.target.value; setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: arr } })); }} /></div>
                            </div>
                          </div>
                        ));
                      })()}
                      <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, stData: { ...prev.stData, rencanaTL: [...(prev.stData?.rencanaTL || [{ masalah: '', rencana: '', tindakLanjut: '', evaluasi: '', keterangan: '' }]), { masalah: '', rencana: '', tindakLanjut: '', evaluasi: '', keterangan: '' }] } }))} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontWeight: 600 }}>+ Tambah Baris Tindak Lanjut</button>
                    </div>

                    <div><label className="form-label">F. PENUTUP</label><textarea className="input-field" value={dynamicFields.penutupLap || ''} onChange={e => handleDynamicFieldChange('penutupLap', e.target.value)} required style={{ height: '80px', resize: 'vertical' }} /></div>
                  </div>
                )}

                {letterForm.typeCode === "BA" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Pihak Pertama</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama</label><input type="text" className="input-field" value={dynamicFields.namaPihak1BA || ''} onChange={e => handleDynamicFieldChange('namaPihak1BA', e.target.value)} required /></div>
                        <div><label className="form-label">NIK</label><input type="text" className="input-field" value={dynamicFields.nikPihak1BA || ''} onChange={e => handleDynamicFieldChange('nikPihak1BA', e.target.value)} required /></div>
                        <div><label className="form-label">Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPihak1BA || ''} onChange={e => handleDynamicFieldChange('jabatanPihak1BA', e.target.value)} required /></div>
                        <div><label className="form-label">Kedudukan</label><input type="text" className="input-field" value={dynamicFields.kedudukanPihak1BA || ''} onChange={e => handleDynamicFieldChange('kedudukanPihak1BA', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Pihak Kedua</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama</label><input type="text" className="input-field" value={dynamicFields.namaPihak2BA || ''} onChange={e => handleDynamicFieldChange('namaPihak2BA', e.target.value)} required /></div>
                        <div><label className="form-label">NIK</label><input type="text" className="input-field" value={dynamicFields.nikPihak2BA || ''} onChange={e => handleDynamicFieldChange('nikPihak2BA', e.target.value)} required /></div>
                        <div><label className="form-label">Jabatan</label><input type="text" className="input-field" value={dynamicFields.jabatanPihak2BA || ''} onChange={e => handleDynamicFieldChange('jabatanPihak2BA', e.target.value)} required /></div>
                        <div><label className="form-label">Kedudukan</label><input type="text" className="input-field" value={dynamicFields.kedudukanPihak2BA || ''} onChange={e => handleDynamicFieldChange('kedudukanPihak2BA', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Isi Berita Acara</label>
                      <textarea className="input-field" value={dynamicFields.isiBA || ''} onChange={e => handleDynamicFieldChange('isiBA', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} />
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Mengetahui / Mengesahkan</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama Pengesah</label><input type="text" className="input-field" value={dynamicFields.namaPengesahBA || ''} onChange={e => handleDynamicFieldChange('namaPengesahBA', e.target.value)} required /></div>
                        <div><label className="form-label">NIK Pengesah</label><input type="text" className="input-field" value={dynamicFields.nikPengesahBA || ''} onChange={e => handleDynamicFieldChange('nikPengesahBA', e.target.value)} required /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Jabatan Pengesah</label><input type="text" className="input-field" value={dynamicFields.jabatanPengesahBA || ''} onChange={e => handleDynamicFieldChange('jabatanPengesahBA', e.target.value)} required /></div>
                      </div>
                    </div>

                  </div>
                )}

                {letterForm.typeCode === "Ntl" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Informasi Acara</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div><label className="form-label">Acara</label><input type="text" className="input-field" value={dynamicFields.acaraNtl || ''} onChange={e => handleDynamicFieldChange('acaraNtl', e.target.value)} required /></div>
                        <div><label className="form-label">Waktu</label><input type="text" className="input-field" value={dynamicFields.waktuNtl || ''} onChange={e => handleDynamicFieldChange('waktuNtl', e.target.value)} required placeholder="Contoh: 09:00 WIB - Selesai" /></div>
                        <div><label className="form-label">Tempat</label><input type="text" className="input-field" value={dynamicFields.tempatNtl || ''} onChange={e => handleDynamicFieldChange('tempatNtl', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Isi Notulen</label>
                      <textarea className="input-field" value={dynamicFields.isiNtl || ''} onChange={e => handleDynamicFieldChange('isiNtl', e.target.value)} required style={{ height: '120px', resize: 'vertical' }} />
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Petugas Acara</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama Moderator</label><input type="text" className="input-field" value={dynamicFields.namaModeratorNtl || ''} onChange={e => handleDynamicFieldChange('namaModeratorNtl', e.target.value)} required /></div>
                        <div><label className="form-label">Nama Notulen (Notulis)</label><input type="text" className="input-field" value={dynamicFields.namaNotulisNtl || ''} onChange={e => handleDynamicFieldChange('namaNotulisNtl', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Mengetahui</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama Pengesah</label><input type="text" className="input-field" value={dynamicFields.namaPengesahNtl || ''} onChange={e => handleDynamicFieldChange('namaPengesahNtl', e.target.value)} required /></div>
                        <div><label className="form-label">NIK Pengesah</label><input type="text" className="input-field" value={dynamicFields.nikPengesahNtl || ''} onChange={e => handleDynamicFieldChange('nikPengesahNtl', e.target.value)} required /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Jabatan Pengesah</label><input type="text" className="input-field" value={dynamicFields.jabatanPengesahNtl || ''} onChange={e => handleDynamicFieldChange('jabatanPengesahNtl', e.target.value)} required /></div>
                      </div>
                    </div>

                  </div>
                )}

                {letterForm.typeCode === "Dh" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Informasi Acara (Daftar Hadir)</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div><label className="form-label">Acara</label><input type="text" className="input-field" value={dynamicFields.acaraDh || ''} onChange={e => handleDynamicFieldChange('acaraDh', e.target.value)} required /></div>
                        <div><label className="form-label">Waktu</label><input type="text" className="input-field" value={dynamicFields.waktuDh || ''} onChange={e => handleDynamicFieldChange('waktuDh', e.target.value)} required placeholder="Contoh: 09:00 WIB - Selesai" /></div>
                        <div><label className="form-label">Tempat</label><input type="text" className="input-field" value={dynamicFields.tempatDh || ''} onChange={e => handleDynamicFieldChange('tempatDh', e.target.value)} required /></div>
                        <div><label className="form-label">Jumlah Baris Kosong (Untuk dicetak)</label><input type="number" min="1" max="100" className="input-field" value={dynamicFields.jmlBarisDh || '15'} onChange={e => handleDynamicFieldChange('jmlBarisDh', e.target.value)} required /></div>
                      </div>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Mengetahui</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Nama Pengesah</label><input type="text" className="input-field" value={dynamicFields.namaPengesahDh || ''} onChange={e => handleDynamicFieldChange('namaPengesahDh', e.target.value)} required /></div>
                        <div><label className="form-label">NIK Pengesah</label><input type="text" className="input-field" value={dynamicFields.nikPengesahDh || ''} onChange={e => handleDynamicFieldChange('nikPengesahDh', e.target.value)} required /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Jabatan Pengesah</label><input type="text" className="input-field" value={dynamicFields.jabatanPengesahDh || ''} onChange={e => handleDynamicFieldChange('jabatanPengesahDh', e.target.value)} required /></div>
                      </div>
                    </div>

                  </div>
                )}

                {letterForm.typeCode === "Disp" && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Informasi Disposisi</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div><label className="form-label">Kepada</label><input type="text" className="input-field" value={dynamicFields.kepadaDisp || ''} onChange={e => handleDynamicFieldChange('kepadaDisp', e.target.value)} required /></div>
                        <div><label className="form-label">Dari</label><input type="text" className="input-field" value={dynamicFields.dariDisp || ''} onChange={e => handleDynamicFieldChange('dariDisp', e.target.value)} required /></div>
                      </div>
                      
                      <h5 style={{ margin: '1.5rem 0 0.5rem 0' }}>Sifat Disposisi (Centang yang sesuai)</h5>
                      <div style={{ display: 'flex', gap: '2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={dynamicFields.isInformasiDisp || false} onChange={e => handleDynamicFieldChange('isInformasiDisp', e.target.checked)} />
                          Informasi
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={dynamicFields.isAksiDisp || false} onChange={e => handleDynamicFieldChange('isAksiDisp', e.target.checked)} />
                          Aksi
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={dynamicFields.isDisetujuiDisp || false} onChange={e => handleDynamicFieldChange('isDisetujuiDisp', e.target.checked)} />
                          Disetujui
                        </label>
                      </div>

                      <div style={{ marginTop: '1.5rem' }}>
                        <label className="form-label">Jumlah Baris Catatan Kosong</label>
                        <input type="number" min="1" max="50" className="input-field" value={dynamicFields.jmlBarisDisp || '14'} onChange={e => handleDynamicFieldChange('jmlBarisDisp', e.target.value)} required />
                        <small style={{ color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>Untuk dicetak sebagai area isian manual (standarnya 14 baris)</small>
                      </div>
                    </div>

                    <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: '#f9fafb' }}>
                      <h5 style={{ margin: '0 0 1rem 0' }}>Penyampai Disposisi</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div><label className="form-label">Disampaikan Oleh (Nama)</label><input type="text" className="input-field" value={dynamicFields.namaPenyampaiDisp || ''} onChange={e => handleDynamicFieldChange('namaPenyampaiDisp', e.target.value)} required /></div>
                      </div>
                    </div>

                  </div>
                )}

                {["SKet", "ST", "SU", "SPer", "SK", "SP", "SIK", "SPn", "SPem", "SPm", "SPD", "SRkm", "SPgl", "Mem", "Nd", "Peng", "TS", "Lap", "BA", "Ntl", "Dh", "Disp"].indexOf(letterForm.typeCode) === -1 && (
                  <div>
                    <label className="form-label">Isi Utama Surat</label>
                    <textarea value={letterForm.content} onChange={e => setLetterForm({ ...letterForm, content: e.target.value })} required className="input-field" style={{ height: '120px', resize: 'vertical' }} />
                  </div>
                )}
              </div>
            )}

            {/* Form khusus SOP - berdiri sendiri */}
            {letterForm.typeCode === "SOP" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                {/* Header SOP */}
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(20,83,45,0.06)', borderRadius: '8px', border: '1px solid var(--primary)', width: '100%', boxSizing: 'border-box' }}>
                  <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>📋 Informasi Header SOP</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Judul SOP</label>
                      <input type="text" className="input-field" placeholder="Contoh: Pemantauan Lingkungan Fisik" value={letterForm.sopData?.judulSop || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, judulSop: e.target.value } })} />
                    </div>
                    <div><label className="form-label">No. Dokumen</label><input type="text" className="input-field" placeholder="Contoh: 012/SOP/01-10.0/VK-BTR/2023" value={letterForm.sopData?.noDokumen || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, noDokumen: e.target.value } })} /></div>
                    <div><label className="form-label">No. Revisi</label><input type="text" className="input-field" placeholder="Contoh: 01" value={letterForm.sopData?.noRevisi || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, noRevisi: e.target.value } })} /></div>
                    <div><label className="form-label">Tanggal Terbit</label><input type="date" className="input-field" value={letterForm.sopData?.tanggalTerbit || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, tanggalTerbit: e.target.value } })} /></div>
                    <div><label className="form-label">Halaman</label><input type="text" className="input-field" placeholder="Otomatis (atau ketik manual)" value={letterForm.sopData?.halaman || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, halaman: e.target.value } })} /></div>
                    <div><label className="form-label">Nama Penandatangan</label><input type="text" className="input-field" placeholder="Nama lengkap & gelar" value={letterForm.sopData?.namaDirektur || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, namaDirektur: e.target.value } })} /></div>
                    <div><label className="form-label">NIK Penandatangan</label><input type="text" className="input-field" placeholder="NIK" value={letterForm.sopData?.nikDirektur || ''} onChange={e => setLetterForm({ ...letterForm, sopData: { ...letterForm.sopData, nikDirektur: e.target.value } })} /></div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem', padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)' }}>Opsi Pengesahan Kotak SOP:</span>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={letterForm.useDigitalSignature !== false} onChange={e => setLetterForm({ ...letterForm, useDigitalSignature: e.target.checked })} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                          ✍️ Pakai TTD Digital pada Kotak SOP
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', margin: 0 }}>
                          <input type="checkbox" checked={letterForm.useDigitalStamp !== false} onChange={e => setLetterForm({ ...letterForm, useDigitalStamp: e.target.checked })} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                          💮 Pakai Stempel Resmi pada Kotak SOP
                        </label>
                      </div>
                      {letterForm.useDigitalSignature !== false && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload TTD Custom Khusus SOP:</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImage(file, 600, 300, 0.85);
                                    if (compressed) {
                                      setLetterForm(prev => ({ ...prev, signature: compressed, sopData: { ...prev.sopData, signature: compressed } }));
                                    }
                                  } catch (err) {
                                    console.error('Compress signature error:', err);
                                  }
                                }
                              }} 
                              style={{ fontSize: '0.72rem' }} 
                            />
                          </div>
                          {(letterForm.signature || letterForm.sopData?.signature) && (
                            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ TTD Terpasang</span>
                          )}
                        </div>
                      )}
                      {letterForm.useDigitalStamp !== false && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload Stempel Custom Khusus SOP:</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const compressed = await compressImage(file, 400, 400, 0.85);
                                    if (compressed) {
                                      setLetterForm(prev => ({ ...prev, stamp: compressed, sopData: { ...prev.sopData, stamp: compressed } }));
                                    }
                                  } catch (err) {
                                    console.error('Compress stamp error:', err);
                                  }
                                }
                              }} 
                              style={{ fontSize: '0.72rem' }} 
                            />
                          </div>
                          {(letterForm.stamp || letterForm.sopData?.stamp) && (
                            <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>✓ Stempel Terpasang</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Isi SOP (Dinamis) */}
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(20,83,45,0.03)', borderRadius: '8px', border: '1px dashed var(--border-light)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>📝 Isi SOP</h5>
                  
                  {/* Dynamic Sections Loop */}
                  {(letterForm.sopData?.sections || [
                    { title: "Pengertian", items: [""] },
                    { title: "Tujuan", items: [""] },
                    { title: "Kebijakan", items: [""] },
                    { title: "Referensi", items: [""] },
                    { title: "Prosedur / Langkah-Langkah", items: [""] },
                    { title: "Hal-Hal yang Perlu Diperhatikan", items: [""] },
                    { title: "Unit Terkait", items: [""] },
                    { title: "Dokumen Terkait", items: [""] }
                  ]).map((section, sIdx, sectionsArray) => (
                    <div key={sIdx} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{sIdx + 1}.</span>
                          <input type="text" className="input-field" value={section.title} placeholder="Judul Bagian..." 
                            onChange={e => {
                              const newSections = [...sectionsArray];
                              newSections[sIdx] = { ...newSections[sIdx], title: e.target.value };
                              setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: newSections } }));
                            }} 
                            style={{ fontWeight: 600, padding: '0.3rem 0.5rem', border: '1px solid transparent', borderBottom: '1px dashed #cbd5e1', borderRadius: 0, backgroundColor: 'transparent' }} 
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => {
                            const newSections = [...sectionsArray];
                            newSections[sIdx] = { ...newSections[sIdx], items: [...newSections[sIdx].items, ""] };
                            setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: newSections } }));
                          }} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '4px', cursor: 'pointer' }}>+ Tambah Baris</button>
                          
                          {sectionsArray.length > 1 && (
                            <button type="button" onClick={() => {
                              const newSections = sectionsArray.filter((_, i) => i !== sIdx);
                              setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: newSections } }));
                            }} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer' }}>Hapus Bagian</button>
                          )}
                        </div>
                      </div>
                      
                      {/* Items loop for this section */}
                      <div style={{ paddingLeft: '1rem', width: '100%', boxSizing: 'border-box' }}>
                        {section.items.map((item, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', gap: '0.4rem', alignItems: 'flex-start', marginBottom: '0.4rem', width: '100%', minWidth: 0 }}>
                            <span style={{ minWidth: '18px', flexShrink: 0, fontWeight: 500, fontSize: '0.85rem', paddingTop: '0.4rem', color: 'var(--text-muted)' }}>{iIdx + 1}.</span>
                            <textarea className="input-field" rows={1} placeholder={`Isi baris ke-${iIdx + 1}...`} value={item} 
                              onChange={e => {
                                const newSections = [...sectionsArray];
                                newSections[sIdx].items[iIdx] = e.target.value;
                                setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: newSections } }));
                              }} 
                              style={{ flex: 1, resize: 'vertical', minHeight: '36px', minWidth: 0, width: '100%', boxSizing: 'border-box' }} 
                            />
                            {section.items.length > 1 && (
                              <button type="button" onClick={() => {
                                const newSections = [...sectionsArray];
                                newSections[sIdx].items = newSections[sIdx].items.filter((_, i) => i !== iIdx);
                                setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: newSections } }));
                              }} style={{ flexShrink: 0, padding: '0.2rem 0.4rem', backgroundColor: 'transparent', color: '#b91c1c', border: 'none', cursor: 'pointer', fontSize: '0.8rem', marginTop: '4px' }}>✕</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={() => {
                    const currentSections = letterForm.sopData?.sections || [
                      { title: "Pengertian", items: [""] }, { title: "Tujuan", items: [""] }, { title: "Kebijakan", items: [""] },
                      { title: "Referensi", items: [""] }, { title: "Prosedur / Langkah-Langkah", items: [""] },
                      { title: "Hal-Hal yang Perlu Diperhatikan", items: [""] }, { title: "Unit Terkait", items: [""] }, { title: "Dokumen Terkait", items: [""] }
                    ];
                    setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, sections: [...currentSections, { title: "Bagian Baru", items: [""] }] } }));
                  }} style={{ padding: '0.5rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>+ Tambah Bagian Baru</button>

                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                    <label className="form-label">🖼️ Bagan Alir (Upload Gambar)</label>
                    <input type="file" accept="image/*" className="input-field" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const compressed = await compressImage(file, 800, 800, 0.8);
                          if (compressed) {
                            setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, baganAlirImage: compressed } }));
                          }
                        } catch (err) {
                          console.error('Compress flowchart error:', err);
                        }
                      }
                    }} style={{ padding: '0.4rem', cursor: 'pointer' }} />
                    {letterForm.sopData?.baganAlirImage && (
                      <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                        <img src={letterForm.sopData.baganAlirImage} alt="Preview Bagan Alir" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, baganAlirImage: null } }))}
                          style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer' }}>✕</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rekam Historis */}
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(20,83,45,0.03)', borderRadius: '8px', border: '1px dashed var(--border-light)', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>10. Rekam Historis Perubahan</h5>
                    <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, rekamHistoris: [...(prev.sopData?.rekamHistoris || []), { yangDiubah: '', isiPerubahan: '', tanggalMulai: '' }] } }))}
                      style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>+ Tambah Baris</button>
                  </div>
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.78rem', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '32px' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '36%' }} />
                      <col style={{ width: '28%' }} />
                      <col style={{ width: '28px' }} />
                    </colgroup>
                    <thead><tr style={{ backgroundColor: 'var(--bg-main)' }}>
                      <th style={{ border: '1px solid var(--border)', padding: '0.3rem 0.2rem', textAlign: 'center', fontWeight: 600 }}>No</th>
                      <th style={{ border: '1px solid var(--border)', padding: '0.3rem 0.4rem', textAlign: 'left', fontWeight: 600 }}>Yang Diubah</th>
                      <th style={{ border: '1px solid var(--border)', padding: '0.3rem 0.4rem', textAlign: 'left', fontWeight: 600 }}>Isi Perubahan</th>
                      <th style={{ border: '1px solid var(--border)', padding: '0.3rem 0.2rem', textAlign: 'center', fontWeight: 600 }}>Tgl Mulai</th>
                      <th style={{ border: '1px solid var(--border)', padding: '0.3rem 0.2rem' }}></th>
                    </tr></thead>
                    <tbody>
                      {(letterForm.sopData?.rekamHistoris || [{ yangDiubah: '', isiPerubahan: '', tanggalMulai: '' }]).map((rh, idx) => (
                        <tr key={idx}>
                          <td style={{ border: '1px solid var(--border)', padding: '0.2rem', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid var(--border)', padding: '0.2rem' }}><input type="text" value={rh.yangDiubah || ''} onChange={e => { const u = [...(letterForm.sopData?.rekamHistoris || [])]; u[idx] = { ...u[idx], yangDiubah: e.target.value }; setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, rekamHistoris: u } })); }} style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem', border: 'none', background: 'transparent', width: '100%', boxSizing: 'border-box' }} /></td>
                          <td style={{ border: '1px solid var(--border)', padding: '0.2rem' }}><input type="text" value={rh.isiPerubahan || ''} onChange={e => { const u = [...(letterForm.sopData?.rekamHistoris || [])]; u[idx] = { ...u[idx], isiPerubahan: e.target.value }; setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, rekamHistoris: u } })); }} style={{ padding: '0.2rem 0.3rem', fontSize: '0.75rem', border: 'none', background: 'transparent', width: '100%', boxSizing: 'border-box' }} /></td>
                          <td style={{ border: '1px solid var(--border)', padding: '0.2rem' }}><input type="date" value={rh.tanggalMulai || ''} onChange={e => { const u = [...(letterForm.sopData?.rekamHistoris || [])]; u[idx] = { ...u[idx], tanggalMulai: e.target.value }; setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, rekamHistoris: u } })); }} style={{ padding: '0.2rem 0.2rem', fontSize: '0.72rem', border: 'none', background: 'transparent', width: '100%', boxSizing: 'border-box' }} /></td>
                          <td style={{ border: '1px solid var(--border)', padding: '0.2rem', textAlign: 'center' }}>
                            {(letterForm.sopData?.rekamHistoris || []).length > 1 && (
                              <button type="button" onClick={() => { const u = (letterForm.sopData?.rekamHistoris || []).filter((_, i) => i !== idx); setLetterForm(prev => ({ ...prev, sopData: { ...prev.sopData, rekamHistoris: u } })); }} style={{ padding: '0.1rem 0.3rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.68rem' }}>✕</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* Form khusus Surat Keputusan (SKep) */}
            {letterForm.typeCode === "SKep" && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                  <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>1. Judul & Header Keputusan</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">TENTANG (Judul Keputusan)</label>
                      <input type="text" className="input-field" placeholder="Contoh: KEBIJAKAN PELAYANAN KLINIS" value={letterForm.skData?.judulSK || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, judulSK: e.target.value } })} />
                    </div>
                    <div>
                      <label className="form-label">Nomor Surat</label>
                      <input type="text" className="input-field" placeholder="Contoh: 001/SK/BTR/2026" value={letterForm.skData?.noSK || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, noSK: e.target.value } })} />
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>2. Konsiderans (Menimbang)</h5>
                    <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, menimbang: [...(prev.skData?.menimbang || ['']), ''] } }))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah Baris</button>
                  </div>
                  {(letterForm.skData?.menimbang || ['']).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                      <span style={{ paddingTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>{String.fromCharCode(97 + idx)}. bahwa</span>
                      <textarea className="input-field" rows={1} value={item} onChange={e => { const arr = [...(letterForm.skData?.menimbang || [''])]; arr[idx] = e.target.value; setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, menimbang: arr } })); }} style={{ flex: 1, resize: 'vertical', minHeight: '36px' }} />
                      {(letterForm.skData?.menimbang || ['']).length > 1 && <button type="button" onClick={() => { const arr = (letterForm.skData?.menimbang || ['']).filter((_, i) => i !== idx); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, menimbang: arr } })); }} style={{ padding: '0.2rem', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700 }}>3. Dasar Hukum (Mengingat)</h5>
                    <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, mengingat: [...(prev.skData?.mengingat || ['']), ''] } }))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah Baris</button>
                  </div>
                  {(letterForm.skData?.mengingat || ['']).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                      <span style={{ paddingTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>{idx + 1}.</span>
                      <textarea className="input-field" rows={1} value={item} onChange={e => { const arr = [...(letterForm.skData?.mengingat || [''])]; arr[idx] = e.target.value; setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, mengingat: arr } })); }} style={{ flex: 1, resize: 'vertical', minHeight: '36px' }} />
                      {(letterForm.skData?.mengingat || ['']).length > 1 && <button type="button" onClick={() => { const arr = (letterForm.skData?.mengingat || ['']).filter((_, i) => i !== idx); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, mengingat: arr } })); }} style={{ padding: '0.2rem', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                  <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700 }}>4. Diktum Keputusan (Menetapkan)</h5>
                  <div style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Menetapkan: Keputusan Direktur Klinik Baiturrahman Tentang...</label>
                    <input type="text" className="input-field" value={letterForm.skData?.menetapkan || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, menetapkan: e.target.value } })} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Isi Putusan (KESATU, KEDUA, dst)</label>
                    <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, diktum: [...(prev.skData?.diktum || ['']), ''] } }))} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah Putusan</button>
                  </div>
                  {(letterForm.skData?.diktum || ['']).map((item, idx) => {
                    const numberWords = ["KESATU", "KEDUA", "KETIGA", "KEEMPAT", "KELIMA", "KEENAM", "KETUJUH", "KEDELAPAN", "KESEMBILAN", "KESEPULUH"];
                    return (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'flex-start' }}>
                        <span style={{ paddingTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600, width: '70px' }}>{numberWords[idx] || `KE-${idx+1}`}</span>
                        <textarea className="input-field" rows={1} value={item} onChange={e => { const arr = [...(letterForm.skData?.diktum || [''])]; arr[idx] = e.target.value; setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, diktum: arr } })); }} style={{ flex: 1, resize: 'vertical', minHeight: '36px' }} />
                        {(letterForm.skData?.diktum || ['']).length > 1 && <button type="button" onClick={() => { const arr = (letterForm.skData?.diktum || ['']).filter((_, i) => i !== idx); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, diktum: arr } })); }} style={{ padding: '0.2rem', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>}
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                  <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700 }}>5. Penandatanganan</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div><label className="form-label">Ditetapkan di</label><input type="text" className="input-field" placeholder="Garut" value={letterForm.skData?.ditetapkanDi || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, ditetapkanDi: e.target.value } })} /></div>
                    <div><label className="form-label">Pada Tanggal</label><input type="date" className="input-field" value={letterForm.skData?.tanggalSK || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, tanggalSK: e.target.value } })} /></div>
                    <div><label className="form-label">Nama Direktur</label><input type="text" className="input-field" placeholder="Dr. H. Ahmad Fauzi, M.Kes" value={letterForm.skData?.namaDirektur || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, namaDirektur: e.target.value } })} /></div>
                    <div><label className="form-label">NIK Direktur</label><input type="text" className="input-field" value={letterForm.skData?.nikDirektur || ''} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, nikDirektur: e.target.value } })} /></div>
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: (letterForm.skData?.gunakanLampiran ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-main)'), borderRadius: '8px', border: (letterForm.skData?.gunakanLampiran ? '1px solid #10b981' : '1px dashed var(--border-light)') }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: letterForm.skData?.gunakanLampiran ? '1rem' : 0 }}>
                    <input type="checkbox" id="chkLampiran" checked={letterForm.skData?.gunakanLampiran || false} onChange={e => setLetterForm({ ...letterForm, skData: { ...letterForm.skData, gunakanLampiran: e.target.checked } })} />
                    <label htmlFor="chkLampiran" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Gunakan Halaman Lampiran SK</label>
                  </div>
                  
                  {letterForm.skData?.gunakanLampiran && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {(() => {
                        const defaultLampiran = [
                          { title: "BAB I\nPENDAHULUAN", items: ["Latar Belakang", "Maksud dan Tujuan", "Sasaran", "Asas", "Ruang Lingkup", "Pengertian Umum"] },
                          { title: "BAB II\n..................................", items: ["", "", "Dst........"] },
                          { title: "BAB III\n..................................", items: ["", "", "Dst........"] },
                          { title: "BAB IV\nPENUTUP", items: ["", "", "Dst........"] }
                        ];
                        const lampiranArr = letterForm.skData?.lampiran || defaultLampiran;
                        return lampiranArr.map((bab, bIdx) => (
                          <div key={bIdx} style={{ padding: '0.5rem', border: '1px solid var(--border-light)', borderRadius: '6px', backgroundColor: 'var(--bg-card)' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <textarea className="input-field" placeholder="Judul BAB (Misal: BAB I\nPENDAHULUAN)" value={bab.title} onChange={e => { const arr = [...lampiranArr]; arr[bIdx].title = e.target.value; setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: arr } })); }} style={{ fontWeight: 600, resize: 'vertical', minHeight: '40px', flex: 1 }} />
                              {lampiranArr.length > 1 && <button type="button" onClick={() => { const arr = lampiranArr.filter((_, i) => i !== bIdx); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: arr } })); }} style={{ padding: '0 0.5rem', color: '#b91c1c', border: '1px solid #fca5a5', borderRadius: '4px', background: '#fee2e2', cursor: 'pointer', fontSize: '0.75rem' }}>Hapus BAB</button>}
                            </div>
                            
                            <div style={{ paddingLeft: '1rem' }}>
                              {bab.items.map((item, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.3rem', alignItems: 'flex-start' }}>
                                  <span style={{ paddingTop: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>{String.fromCharCode(65 + iIdx)}.</span>
                                  <input type="text" className="input-field" value={item} onChange={e => { const arr = [...lampiranArr]; arr[bIdx].items[iIdx] = e.target.value; setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: arr } })); }} />
                                  {bab.items.length > 1 && <button type="button" onClick={() => { const arr = [...lampiranArr]; arr[bIdx].items = arr[bIdx].items.filter((_, i) => i !== iIdx); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: arr } })); }} style={{ padding: '0.2rem', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer' }}>✕</button>}
                                </div>
                              ))}
                              <button type="button" onClick={() => { const arr = [...lampiranArr]; arr[bIdx].items.push(''); setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: arr } })); }} style={{ fontSize: '0.7rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' }}>+ Tambah Sub-item</button>
                            </div>
                          </div>
                        ));
                      })()}
                      <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, skData: { ...prev.skData, lampiran: [...(prev.skData?.lampiran || []), { title: 'BAB BARU', items: [''] }] } }))} style={{ padding: '0.5rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, alignSelf: 'flex-start' }}>+ Tambah BAB</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {letterForm.typeCode !== "SOP" && letterForm.typeCode !== "SKep" && (
              <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label className="form-label" style={{ margin: 0, color: 'var(--text-dark)' }}>Tembusan (Opsional)</label>
                  <button type="button" onClick={() => setLetterForm(prev => ({ ...prev, tembusan: [...(prev.tembusan || []), ''] }))} style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>+ Tambah Tembusan</button>
                </div>
                {(letterForm.tembusan || []).map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{idx + 1}.</span>
                    <input type="text" className="input-field" value={t} onChange={e => {
                      const arr = [...(letterForm.tembusan || [])];
                      arr[idx] = e.target.value;
                      setLetterForm(prev => ({ ...prev, tembusan: arr }));
                    }} style={{ padding: '0.45rem 0.6rem', fontSize: '0.85rem', flex: 1 }} placeholder="Nama institusi / orang..." />
                    <button type="button" onClick={() => {
                      const arr = (letterForm.tembusan || []).filter((_, i) => i !== idx);
                      setLetterForm(prev => ({ ...prev, tembusan: arr }));
                    }} style={{ padding: '0.2rem', color: '#b91c1c', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem' }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ 
                padding: '0.85rem', 
                marginTop: '0.5rem', 
                backgroundColor: letterForm.id ? '#15803d' : undefined,
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {letterForm.id ? `💾 Simpan Perubahan Dokumen (${letterForm.docNo})` : 'Buat & Lihat Dokumen PDF'}
            </button>
          </form>
        </div>

        {/* Tabel Arsip Surat Keluar */}
        <div ref={arsipRef} className="elegant-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Arsip Surat Keluar</h3>
            </div>
            <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Cari surat..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="input-field" style={{ paddingLeft: '1.8rem', height: '32px', fontSize: '0.8rem', width: '100%' }} />
            </div>
          </div>
          <div className="elegant-table-container" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
          <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
            <thead>
              <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Nomor Dokumen</th>
                <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tanggal Input</th>
                <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Perihal</th>
                <th style={{ padding: '0 1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {outgoingLetters
                .filter(l => l.docNo.toLowerCase().includes(searchQuery.toLowerCase()) || l.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(l => (
                <tr key={l.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                  <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{l.docNo}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', color: 'var(--primary)', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem' }}>
                      <Calendar size={13} style={{ color: 'var(--primary)' }} />
                      <span>{formatDateIndo(l.date || l.createdAt, l.id)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-dark)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>{l.subject}</td>
                  <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button title="Preview Surat" onClick={() => { setCurrentPrintDoc(l); setCurrentPrintType("letter"); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#d1fae5'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}><Eye size={14} /></button>
                      <button title="Download / Cetak PDF" onClick={() => { setCurrentPrintDoc(l); setCurrentPrintType("letter"); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}><Download size={14} /></button>
                      <button 
                        title="Edit Dokumen di Form Utama" 
                        onClick={() => {
                          setLetterForm({ ...l });
                          const formEl = document.getElementById('form-buat-surat');
                          if (formEl) {
                            formEl.scrollIntoView({ behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                          window.dispatchEvent(new CustomEvent('app-toast', { 
                            detail: { message: `Memuat [${l.docNo}] ke form utama untuk diedit`, type: 'info' } 
                          }));
                        }} 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'var(--border-light)', color: 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--border-light)'}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button title="Hapus Surat" onClick={() => handleDeleteOutgoingLetter(l.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#fee2e2'}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {outgoingLetters.length === 0 && (
                <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data surat keluar.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `.form-label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.4rem; color: var(--text-dark); }`}} />
    </div>
  );
};

export default SuratKeluar;
