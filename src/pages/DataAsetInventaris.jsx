import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { 
  FileText, Search, Plus, Trash2, 
  Edit3, Save, RotateCcw, Database, 
  Printer, Wrench, Wallet, Image as ImageIcon, X, Eye, Calendar
} from 'lucide-react';
import { db } from '../db';

const PREDEFINED_LOCATIONS = [
  "BANGUNAN KLINIK (GEDUNG LAMA)",
  "BANGUNAN RB (LORONG GENSET)",
  "GUDANG APOTEK (RB)",
  "GUDANG PERKAKAS",
  "HALAMAN DEPAN GEDUNG KLINIK",
  "HALAMAN DEPAN GEDUNG RB (X)",
  "HALAMAN TENGAH",
  "JEMBATAN KLINIK - RB",
  "KANTIN",
  "LORONG LT 2 GEDUNG LAMA",
  "LORONG LT 2 RB ATAS",
  "LORONG LT BAWAH GEDUNG RB",
  "LORONG MANAJEMEN",
  "MASJID AL BURHAN",
  "MOBIL AMBULANCE",
  "NURSES STATION 1",
  "NURSES STATION 2",
  "PENAMPUNGAN SEMENTARA LB3",
  "POS SATPAM",
  "REKAM MEDIK",
  "RESEPSIONIS",
  "RUANG VK RB",
  "RUANG AA SETIAWAN BURHAN",
  "RUANG APOTEK",
  "RUANG ARPAH",
  "RUANG ARSIP KLINIK LT.2",
  "RUANG ASMAN ADUM DAN KERUMAH TANGGAAN",
  "RUANG ASMAN KEUANGAN",
  "RUANG ASMAN PENUNJANG MEDIS",
  "RUANG ASMAN SDM"
];

const PREDEFINED_OFFICERS = [
  "NANANG ALAMSYAH, ST",
  "Andriana",
  "Dr. H. Ahmad Fauzi, M.Kes",
  "Ns. Hendra",
  "Andi (Sarpras)",
  "Admin Gudang",
  "Linda (Apotek)",
  "Siti (Administrasi)"
];

const ASSET_TYPES = [
  "Tanah Hak Milik",
  "Tanah HGB",
  "Bangunan Layanan",
  "Bangunan Pendukung",
  "Alat Medis",
  "Alat Kesehatan",
  "Peralatan Kantor",
  "Peralatan Perkakas",
  "Elektronik & IT",
  "Furniture",
  "Kendaraan Operasional"
];

const UNITS = ["Unit", "M2", "Pcs", "Box", "Set", "Rim", "Lot"];


// Helper to compress image before saving to localStorage
const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!file.type.startsWith('image/')) {
        // Not an image (e.g. PDF), just return the base64 string
        resolve(event.target.result);
        return;
      }
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    };
  });
};

const DataAsetInventaris = ({ 
  assets, 
  onSaveAssets, 
  openConfirm,
  locations = PREDEFINED_LOCATIONS,
  types = ASSET_TYPES,
  units = UNITS,
  officers = PREDEFINED_OFFICERS,
  arsipRef
}) => {
  const filteredTypes = types.filter(t => 
    !t.toLowerCase().includes("tanah") && 
    !t.toLowerCase().includes("bangunan") && 
    !t.toLowerCase().includes("gedung")
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterKondisi, setFilterKondisi] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Form states
  const [formMode, setFormMode] = useState("view"); // "view" | "edit" | "new"
  const [formData, setFormData] = useState({
    id: "",
    category: "Barang/Benda",
    jenisAset: "Alat Medis",
    namaAset: "",
    satuan: "Unit",
    tanggalPerolehan: new Date().toISOString().split('T')[0],
    portability: [], // e.g. ["Mudah dibawa", "Bergerak"]
    kondisi: "Baik",
    hargaPerUnit: 0,
    lokasi: locations[0],
    pemegang: officers[0],
    keterangan: "",
    biayaRincian: [], // cost breakdown details
    umurEkonomis: 5,
    satuanUmurEkonomis: "Tahun",
    nilaiResidu: 0,
    fotoAset: null
  });

  const [customJenisAset, setCustomJenisAset] = useState("");
  const [customSatuan, setCustomSatuan] = useState("");
  const [customLokasi, setCustomLokasi] = useState("");
  const [customPemegang, setCustomPemegang] = useState("");
  const [imageViewerModal, setImageViewerModal] = useState({ isOpen: false, imageUrl: "" });
  const [detailModalAsset, setDetailModalAsset] = useState(null);

  // QR Code State
  const [showQrModal, setShowQrModal] = useState(false);

  // Maintenance Log State
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    date: new Date().toISOString().split('T')[0],
    cost: 0,
    notes: "",
    officer: ""
  });

  const generateNewId = () => {
    const year = new Date().getFullYear();
    const prefix = `AST-${year}-`;
    const matching = assets.filter(a => a.id && a.id.startsWith(prefix));
    if (matching.length === 0) {
      return `${prefix}001`;
    }
    const numbers = matching.map(a => {
      const parts = a.id.split('-');
      const numStr = parts[parts.length - 1];
      return parseInt(numStr) || 0;
    });
    const maxNum = Math.max(...numbers);
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(3, '0')}`;
  };

  // Load maintenance logs helper
  const loadMaintenanceLogs = (assetId) => {
    if (assetId) {
      const allMaintenance = db.get("asset_maintenance") || [];
      const assetLogs = allMaintenance.filter(m => m.assetId === assetId);
      setMaintenanceLogs(assetLogs);
      setShowMaintenanceForm(false);
      setNewMaintenance({
        date: new Date().toISOString().split('T')[0],
        cost: 0,
        notes: "",
        officer: ""
      });
    } else {
      setMaintenanceLogs([]);
    }
  };

  // List assets (filtered by search query for name/id, condition, and category)
  const filteredAssets = assets
    .filter(a => a.namaAset.toLowerCase().includes(searchQuery.toLowerCase()) || a.id.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(a => filterKondisi === "Semua" || a.kondisi === filterKondisi)
    .filter(a => filterKategori === "Semua" || (a.jenisAset && a.jenisAset.toLowerCase() === filterKategori.toLowerCase()));

  // Load selected asset into form
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    loadMaintenanceLogs(asset?.id);
    setFormData({
      id: asset.id,
      category: asset.category,
      jenisAset: asset.jenisAset || "",
      namaAset: asset.namaAset || "",
      satuan: asset.satuan || "Unit",
      tanggalPerolehan: asset.tanggalPerolehan || "",
      portability: asset.portability || [],
      kondisi: asset.kondisi || "Baik",
      hargaPerUnit: asset.hargaPerUnit || 0,
      lokasi: asset.lokasi || locations[0],
      pemegang: asset.pemegang || officers[0],
      keterangan: asset.keterangan || "",
      biayaRincian: asset.biayaRincian || [],
      umurEkonomis: asset.umurEkonomis !== undefined ? asset.umurEkonomis : 5,
      satuanUmurEkonomis: asset.satuanUmurEkonomis || "Tahun",
      nilaiResidu: asset.nilaiResidu || 0,
      fotoAset: asset.fotoAset || null
    });
    
    setCustomJenisAset("");
    setCustomSatuan("");
    setCustomLokasi("");
    setCustomPemegang("");
    setFormMode("view");
  };

  // Checkbox portability toggling
  const handlePortabilityChange = (value) => {
    if (formMode === "view") return;
    setFormData(prev => {
      const current = [...prev.portability];
      const index = current.indexOf(value);
      if (index > -1) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }
      return { ...prev, portability: current };
    });
  };

  // Form actions
  const handleNew = () => {
    setFormMode("new");
    setSelectedAsset(null);
    setMaintenanceLogs([]);
    setShowMaintenanceForm(false);
    setFormData({
      id: generateNewId(),
      category: "Barang/Benda",
      jenisAset: filteredTypes[0] || "Alat Medis",
      namaAset: "",
      satuan: units[0] || "Unit",
      tanggalPerolehan: new Date().toISOString().split('T')[0],
      portability: [],
      kondisi: "Baik",
      hargaPerUnit: 0,
      lokasi: locations[0] || "",
      pemegang: officers[0] || "",
      keterangan: "",
      biayaRincian: [],
      umurEkonomis: 5,
      satuanUmurEkonomis: "Tahun",
      nilaiResidu: 0,
      fotoAset: null
    });
    setCustomJenisAset("");
    setCustomSatuan("");
    setCustomLokasi("");
    setCustomPemegang("");
  };

  const handleEdit = () => {
    if (!selectedAsset) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Pilih aset dari menu pohon terlebih dahulu!", type: 'error' } 
      }));
      return;
    }
    setFormMode("edit");
  };

  const handleCancel = () => {
    setCustomJenisAset("");
    setCustomSatuan("");
    setCustomLokasi("");
    setCustomPemegang("");
    if (selectedAsset) {
      handleSelectAsset(selectedAsset);
    } else {
      setFormMode("view");
      // Clear data
      setFormData({
        id: "",
        category: "Barang/Benda",
        jenisAset: "Alat Medis",
        namaAset: "",
        satuan: "Unit",
        tanggalPerolehan: "",
        portability: [],
        kondisi: "Baik",
        hargaPerUnit: 0,
        lokasi: locations[0],
        pemegang: officers[0],
        keterangan: "",
        biayaRincian: [],
        umurEkonomis: 5,
        satuanUmurEkonomis: "Tahun",
        nilaiResidu: 0,
        fotoAset: null
      });
    }
  };

  const handleSaveMaintenance = (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    const allMaintenance = db.get("asset_maintenance");
    const id = `MN-${Date.now()}`;
    const entry = {
      id,
      assetId: selectedAsset.id,
      date: newMaintenance.date,
      cost: Number(newMaintenance.cost),
      notes: newMaintenance.notes,
      officer: newMaintenance.officer
    };

    const newAll = [entry, ...allMaintenance];
    db.set("asset_maintenance", newAll);
    
    // Update local state
    setMaintenanceLogs([entry, ...maintenanceLogs]);
    
    // Reset form
    setNewMaintenance({
      date: new Date().toISOString().split('T')[0],
      cost: 0,
      notes: "",
      officer: ""
    });
    setShowMaintenanceForm(false);

    window.dispatchEvent(new CustomEvent('app-toast', { 
      detail: { message: "Log perawatan berhasil disimpan!", type: 'success' } 
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Ukuran file terlalu besar (Maks 5MB)", type: "error" } }));
        return;
      }
      const compressedBase64 = await compressImage(file);
      setFormData(prev => ({ ...prev, fotoAset: compressedBase64 }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.namaAset.trim()) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Nama aset wajib diisi!", type: 'error' } 
      }));
      return;
    }

    const finalData = { 
      ...formData,
      hargaPerUnit: parseFloat(formData.hargaPerUnit) || 0,
      nilaiResidu: parseFloat(formData.nilaiResidu) || 0,
      umurEkonomis: parseFloat(formData.umurEkonomis) || 0
    };
    let listNeedsRefresh = false;

    if (formData.jenisAset === "Other") {
      if (!customJenisAset.trim()) {
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: "Harap ketik Jenis Aset baru!", type: 'error' } 
        }));
        return;
      }
      const val = customJenisAset.trim();
      finalData.jenisAset = val;
      
      const stored = JSON.parse(localStorage.getItem("kbr_db_asset_types") || "[]");
      if (!stored.includes(val)) {
        stored.push(val);
        localStorage.setItem("kbr_db_asset_types", JSON.stringify(stored));
        listNeedsRefresh = true;
      }
    }

    if (formData.satuan === "Other") {
      if (!customSatuan.trim()) {
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: "Harap ketik Satuan baru!", type: 'error' } 
        }));
        return;
      }
      const val = customSatuan.trim();
      finalData.satuan = val;
      
      const stored = JSON.parse(localStorage.getItem("kbr_db_asset_units") || "[]");
      if (!stored.includes(val)) {
        stored.push(val);
        localStorage.setItem("kbr_db_asset_units", JSON.stringify(stored));
        listNeedsRefresh = true;
      }
    }

    if (formData.lokasi === "Other") {
      if (!customLokasi.trim()) {
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: "Harap ketik Lokasi baru!", type: 'error' } 
        }));
        return;
      }
      const val = customLokasi.trim();
      finalData.lokasi = val;
      
      const stored = JSON.parse(localStorage.getItem("kbr_db_asset_locations") || "[]");
      if (!stored.includes(val)) {
        stored.push(val);
        localStorage.setItem("kbr_db_asset_locations", JSON.stringify(stored));
        listNeedsRefresh = true;
      }
    }

    if (formData.pemegang === "Other") {
      if (!customPemegang.trim()) {
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: "Harap ketik Penanggung Jawab baru!", type: 'error' } 
        }));
        return;
      }
      const val = customPemegang.trim();
      finalData.pemegang = val;
    }

    const confirmMsg = formMode === "new" 
      ? "Apakah Anda yakin ingin menyimpan aset inventaris baru ini?" 
      : "Apakah Anda yakin ingin menyimpan perubahan data aset ini?";

    openConfirm(confirmMsg, () => {
      let updatedAssets = [];
      if (formMode === "new") {
        updatedAssets = [...assets, finalData];
      } else {
        updatedAssets = assets.map(a => a.id === finalData.id ? finalData : a);
      }

      onSaveAssets(updatedAssets);
      setFormMode("view");
      setSelectedAsset(finalData);
      loadMaintenanceLogs(finalData.id);
      
      // Dispatch database refresh if new master option added
      if (listNeedsRefresh) {
        window.dispatchEvent(new CustomEvent('app-db-refresh'));
      }

      // Dispatch log & toast
      const logAction = formMode === "new" ? "Tambah Aset Baru" : "Ubah Data Aset";
      const logDetails = `Aset: ${finalData.namaAset}, Kategori: ${finalData.category}, Lokasi: ${finalData.lokasi}`;
      window.dispatchEvent(new CustomEvent('app-save-log', { 
        detail: { action: logAction, module: "Gudang & Aset", details: logDetails } 
      }));

      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `Aset "${finalData.namaAset}" berhasil disimpan!`, type: 'success' } 
      }));

      // Reset custom inputs
      setCustomJenisAset("");
      setCustomSatuan("");
      setCustomLokasi("");
      setCustomPemegang("");
    });
  };

  const handleDelete = () => {
    if (!selectedAsset) {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Pilih aset yang ingin dihapus!", type: 'error' } 
      }));
      return;
    }

    openConfirm(`Apakah Anda yakin ingin menghapus aset "${selectedAsset.namaAset}"?`, () => {
      const updatedAssets = assets.filter(a => a.id !== selectedAsset.id);
      onSaveAssets(updatedAssets);
      
      // Reset form
      setSelectedAsset(null);
      setFormMode("view");
      setFormData({
        id: "",
        category: "Barang/Benda",
        jenisAset: "Alat Medis",
        namaAset: "",
        satuan: "Unit",
        tanggalPerolehan: "",
        portability: [],
        kondisi: "Baik",
        hargaPerUnit: 0,
        lokasi: locations[0],
        pemegang: officers[0],
        keterangan: "",
        biayaRincian: [],
        umurEkonomis: 5,
        satuanUmurEkonomis: "Tahun",
        nilaiResidu: 0,
        fotoAset: null
      });

      // Dispatch log & toast
      window.dispatchEvent(new CustomEvent('app-save-log', { 
        detail: { action: "Hapus Aset", module: "Gudang & Aset", details: `Menghapus aset: ${selectedAsset.namaAset}` } 
      }));

      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Aset berhasil dihapus dari database.", type: 'success' } 
      }));
    });
  };

  const handleImportMock = () => {
    openConfirm("Apakah Anda yakin ingin memuat data aset demo ke dalam sistem?", () => {
      const mockAssets = [
        {
          id: "AST-MOCK-003",
          category: "Barang/Benda",
          jenisAset: "Alat Medis",
          namaAset: "Nebulizer Omron NE-C28",
          satuan: "Unit",
          tanggalPerolehan: "2024-05-15",
          portability: ["Mudah dibawa", "Bergerak"],
          kondisi: "Baik",
          hargaPerUnit: 850000,
          lokasi: "RUANG APOTEK",
          pemegang: "Ns. Hendra",
          keterangan: "Alat Nebulizer Apotek",
          biayaRincian: [{ tanggal: "2024-05-15", noBukti: "INV-MED-04", keterangan: "Pembelian unit Nebulizer", biaya: 850000 }]
        },
        {
          id: "AST-MOCK-004",
          category: "Barang/Benda",
          jenisAset: "Peralatan Kantor",
          namaAset: "AC Split Daikin 1.5 PK",
          satuan: "Unit",
          tanggalPerolehan: "2023-08-11",
          portability: ["Tidak mudah dibawa", "Tidak Bergerak"],
          kondisi: "Baik",
          hargaPerUnit: 5200000,
          lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
          pemegang: "Admin",
          keterangan: "AC Ruang Administrasi",
          biayaRincian: [
            { tanggal: "2023-08-11", noBukti: "INV-DK-11", keterangan: "Pembelian AC Daikin", biaya: 4700000 },
            { tanggal: "2023-08-12", noBukti: "INV-DK-INST", keterangan: "Biaya Pemasangan", biaya: 500000 }
          ]
        }
      ];

      // Add only non-existent mock assets
      const uniqueMock = mockAssets.filter(ma => !assets.some(a => a.id === ma.id));
      if (uniqueMock.length === 0) {
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: "Data demo sudah ter-import sebelumnya!", type: 'error' } 
        }));
        return;
      }

      const merged = [...assets, ...uniqueMock];
      onSaveAssets(merged);
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `Berhasil mengimpor ${uniqueMock.length} data aset demo!`, type: 'success' } 
      }));
    });
  };

  // Format currency helper
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 2
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease' }}>
      
      {/* Title Header wrapped in card container */}
      <div className="elegant-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.75rem', borderRadius: '12px', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>Data Aset &amp; Inventaris Klinik</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', marginBottom: 0 }}>Pencatatan, pengelompokan lokasi, dan monitoring biaya perolehan aset sistematis.</p>
        </div>
        <button 
          onClick={handleImportMock}
          type="button"
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', padding: '0.6rem 1.2rem', backgroundColor: '#3b82f6', borderRadius: '8px', cursor: 'pointer' }}
        >
          <Database size={16} /> Import Data Demo
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem'
      }}>
        
        {/* =============================================================== */}
        {/* FORM CONTAINER CARD (Acts as Modal in Edit Mode) */}
        {/* =============================================================== */}
        {formMode === 'edit' && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
        )}
        <div 
          className={formMode === 'edit' ? "" : "elegant-card"}
          style={formMode === 'edit' ? {
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '800px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', zIndex: 9999,
            display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 10px 25px rgba(0,0,0,0.4)', border: '1px solid var(--border-light)'
          } : { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          
          {/* Header Form */}
          <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', paddingBottom: '0.6rem', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>Formulir Detail Aset Gudang</span>
            {/* Form Status indicator */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {formMode === "view" && (
                <button 
                  type="button" 
                  onClick={handleNew}
                  className="btn-primary"
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', height: '28px', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <Plus size={12} /> Tambah Baru
                </button>
              )}
              <span style={{ 
                padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                backgroundColor: formMode === "new" ? '#3b82f6' : formMode === "edit" ? '#eab308' : 'var(--primary-light)',
                color: formMode === "new" ? '#fff' : formMode === "edit" ? '#854d0e' : 'var(--primary)'
              }}>
                Mode: {formMode === "new" ? " Input Baru" : formMode === "edit" ? " Edit Data" : " Lihat Aset"}
              </span>
            </div>
          </div>



          {/* Aset Main Form */}
          <form onSubmit={handleSave} className="form-grid-2col">
            
            {/* ID ASET */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                ID Aset <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Kode unik untuk setiap aset. Format: <em>AST-TAHUN-NOMOR</em> (contoh: AST-2026-005)
              </p>
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                disabled={formMode === "view"} 
                className="input-field" 
                placeholder="Contoh: AST-2026-005"
                required
              />
            </div>

            {/* JENIS ASET */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Jenis Aset <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Pilih kategori aset. Jika tidak ada yang sesuai, pilih "Pilihan Lainnya" lalu ketik sendiri.
              </p>
              <select 
                value={formData.jenisAset} 
                onChange={e => setFormData({ ...formData, jenisAset: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              >
                {filteredTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
                <option value="Other"> Pilihan Lainnya (Ketik Manual)...</option>
              </select>
              {formData.jenisAset === "Other" && (
                <input 
                  type="text" 
                  value={customJenisAset}
                  onChange={e => setCustomJenisAset(e.target.value)}
                  disabled={formMode === "view"}
                  className="input-field"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Ketik jenis aset baru di sini, contoh: Kendaraan Roda Dua"
                  required
                />
              )}
            </div>

            {/* NAMA ASET */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Nama Aset <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Tulis nama lengkap aset termasuk merek/tipe jika ada. Contoh: <em>Compressor Nebulizer Omron NE-C28</em>
              </p>
              <input 
                type="text" 
                value={formData.namaAset} 
                onChange={e => setFormData({ ...formData, namaAset: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field" 
                placeholder="Contoh: Compressor Nebulizer Omron"
                required
              />
            </div>

            {/* SATUAN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Satuan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Satuan hitung aset. Contoh: <em>Unit</em> untuk peralatan, <em>Set</em> untuk perlengkapan yang terdiri dari beberapa bagian.
              </p>
              <select 
                value={formData.satuan} 
                onChange={e => setFormData({ ...formData, satuan: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              >
                {units.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="Other"> Pilihan Lainnya (Ketik Manual)...</option>
              </select>
              {formData.satuan === "Other" && (
                <input 
                  type="text" 
                  value={customSatuan}
                  onChange={e => setCustomSatuan(e.target.value)}
                  disabled={formMode === "view"}
                  className="input-field"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Ketik satuan baru, contoh: Lembar, Buah, Pasang"
                  required
                />
              )}
            </div>

            {/* TANGGAL PEROLEHAN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Tanggal Perolehan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Tanggal aset ini dibeli atau diterima oleh klinik. Klik ikon kalender untuk memilih tanggal.
              </p>
              <input 
                type="date" 
                value={formData.tanggalPerolehan} 
                onChange={e => setFormData({ ...formData, tanggalPerolehan: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              />
            </div>

            {/* PORTABILITY (MOBILITAS) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Portabilitas (Mobilitas Aset)
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Centang pilihan yang sesuai. Contoh: alat suntik = "Mudah dibawa", mesin besar = "Tidak Bergerak".
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '1rem', 
                padding: '0.75rem 1rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-sm)',
                backgroundColor: formMode === "view" ? 'var(--bg-main)' : '#fff',
                minHeight: '44px',
                alignItems: 'center'
              }}>
                {["Mudah dibawa", "Tidak mudah dibawa", "Bergerak", "Tidak Bergerak"].map(option => {
                  const checked = formData.portability.includes(option);
                  return (
                    <label key={option} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: formMode === "view" ? 'default' : 'pointer', padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: checked ? 'var(--primary-light)' : 'transparent', transition: 'background 0.2s' }}>
                      <input 
                        type="checkbox" 
                        checked={checked}
                        onChange={() => handlePortabilityChange(option)}
                        disabled={formMode === "view"}
                        style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                      />
                      <span style={{ color: checked ? 'var(--primary)' : 'var(--text-dark)', fontWeight: checked ? 600 : 400 }}>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* KONDISI ASET */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Kondisi Aset <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Pilih kondisi aset saat ini. Pilih <em>"Rusak Ringan"</em> jika masih bisa dipakai walau ada kerusakan kecil.
              </p>
              <select 
                value={formData.kondisi} 
                onChange={e => setFormData({ ...formData, kondisi: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              >
                <option value="Baik"> Baik / Layak Pakai</option>
                <option value="Rusak Ringan"> Rusak Ringan</option>
                <option value="Rusak Berat"> Rusak Berat</option>
              </select>
            </div>

            {/* HARGA PER UNIT */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Harga Per Unit (Rp) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Isi harga beli satu unit aset dalam Rupiah. Jika harga tidak diketahui, isi angka <em>0</em>.
              </p>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rp</span>
                <input 
                  type="text"
                  inputMode="numeric" 
                  value={formData.hargaPerUnit === '' || formData.hargaPerUnit === undefined || formData.hargaPerUnit === null ? '' : (typeof formData.hargaPerUnit === 'number' ? formData.hargaPerUnit.toLocaleString('id-ID') : formData.hargaPerUnit)} 
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, hargaPerUnit: raw === '' ? '' : parseInt(raw, 10) });
                  }} 
                  disabled={formMode === "view"}
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', fontWeight: 600, backgroundColor: formMode === 'view' ? '#f8fafc' : '#fff' }}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* UMUR EKONOMIS */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Umur Ekonomis <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Masa pakai aset yang diharapkan. Pilih satuan: Tahun, Bulan, atau Hari.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                  type="text"
                  inputMode="numeric" 
                  value={formData.umurEkonomis === '' || formData.umurEkonomis === undefined || formData.umurEkonomis === null ? '' : formData.umurEkonomis} 
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, umurEkonomis: raw === '' ? '' : parseInt(raw, 10) });
                  }} 
                  disabled={formMode === "view"}
                  className="input-field" 
                  style={{ flex: 1, fontWeight: 600, backgroundColor: formMode === 'view' ? '#f8fafc' : '#fff' }}
                  placeholder="5"
                  required
                />
                <select
                  value={formData.satuanUmurEkonomis || "Tahun"}
                  onChange={e => setFormData({ ...formData, satuanUmurEkonomis: e.target.value })}
                  disabled={formMode === "view"}
                  className="input-field"
                  style={{ width: '110px', fontWeight: 600, backgroundColor: formMode === "view" ? '#f8fafc' : '#fff', cursor: formMode === "view" ? 'default' : 'pointer' }}
                >
                  <option value="Tahun">Tahun</option>
                  <option value="Bulan">Bulan</option>
                  <option value="Hari">Hari</option>
                </select>
              </div>
            </div>

            {/* NILAI RESIDU */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Nilai Residu (Rp)
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Perkiraan nilai jual/sisa aset setelah umur ekonomis habis. Jika tidak ada, isi <em>0</em>.
              </p>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rp</span>
                <input 
                  type="text"
                  inputMode="numeric" 
                  value={formData.nilaiResidu === '' || formData.nilaiResidu === undefined || formData.nilaiResidu === null ? '' : (typeof formData.nilaiResidu === 'number' ? formData.nilaiResidu.toLocaleString('id-ID') : formData.nilaiResidu)} 
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, nilaiResidu: raw === '' ? '' : parseInt(raw, 10) });
                  }} 
                  disabled={formMode === "view"}
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', fontWeight: 600, backgroundColor: formMode === 'view' ? '#f8fafc' : '#fff' }}
                  placeholder="0"
                />
              </div>
            </div>

            {/* LOKASI PENEMPATAN */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Lokasi Penempatan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Pilih ruangan atau area tempat aset ini disimpan/digunakan. Jika tidak ada, pilih "Pilihan Lainnya".
              </p>
              <select 
                value={formData.lokasi} 
                onChange={e => setFormData({ ...formData, lokasi: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other"> Pilihan Lainnya (Ketik Manual)...</option>
              </select>
              {formData.lokasi === "Other" && (
                <input 
                  type="text" 
                  value={customLokasi}
                  onChange={e => setCustomLokasi(e.target.value)}
                  disabled={formMode === "view"}
                  className="input-field"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Ketik nama lokasi baru, contoh: Ruang Dokter Lantai 2"
                  required
                />
              )}
            </div>

            {/* PENANGGUNG JAWAB (PEMEGANG) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Penanggung Jawab / Pemegang <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Pilih nama staf yang bertanggung jawab atas aset ini. Jika belum ada, pilih "Pilihan Lainnya".
              </p>
              <select 
                value={formData.pemegang} 
                onChange={e => setFormData({ ...formData, pemegang: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field"
                required
              >
                {officers.map(off => (
                  <option key={off} value={off}>{off}</option>
                ))}
                <option value="Other"> Pilihan Lainnya (Ketik Manual)...</option>
              </select>
              {formData.pemegang === "Other" && (
                <input 
                  type="text" 
                  value={customPemegang}
                  onChange={e => setCustomPemegang(e.target.value)}
                  disabled={formMode === "view"}
                  className="input-field"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Ketik nama penanggung jawab baru, contoh: Budi Santoso, S.Kep"
                  required
                />
              )}
            </div>

            {/* KETERANGAN TAMBAHAN */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>
                Keterangan Tambahan <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>(opsional)</span>
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.4rem' }}>
                Isi dengan informasi tambahan seperti warna, nomor seri, merk, atau catatan khusus lainnya.
              </p>
              <textarea 
                value={formData.keterangan} 
                onChange={e => setFormData({ ...formData, keterangan: e.target.value })} 
                disabled={formMode === "view"}
                className="input-field" 
                style={{ height: '70px', resize: 'vertical' }}
                placeholder="Contoh: Warna putih, Merk Omron, No. Seri NEB-20261105, Garansi s/d 2027"
              />
            </div>

            {/* UNGGAH DOKUMEN / FOTO */}
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ImageIcon size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Unggah Foto / Dokumen Aset</h3>
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Upload Berkas Aset</label>
                  {formMode !== "view" && (
                    <>
                      <input 
                        type="file" 
                        accept="image/*,application/pdf"
                        onChange={handleImageUpload}
                        style={{ 
                          display: 'block', width: '100%', padding: '0.5rem', fontSize: '0.85rem',
                          border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer',
                          backgroundColor: '#fff'
                        }} 
                      />
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format didukung: JPG, PNG, PDF. (Maks 5MB). Gambar akan dikompresi otomatis.</p>
                    </>
                  )}
                </div>
                
                {formData.fotoAset && (
                  <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', flexShrink: 0, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.fotoAset.startsWith('data:image') ? (
                      <img src={formData.fotoAset} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <FileText size={32} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>Dokumen PDF</div>
                      </div>
                    )}
                    
                    {formMode !== "view" && (
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, fotoAset: null }))}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
                {!formData.fotoAset && formMode === "view" && (
                  <div style={{ width: '120px', height: '120px', borderRadius: '8px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', flexShrink: 0 }}>
                    Tidak ada berkas
                  </div>
                )}
              </div>
            </div>

            {/* =============================================================== */}
            {/* FORM ACTIONS TOOLBAR (BOTTOM BAR) */}
            {/* =============================================================== */}
            <div style={{ 
              gridColumn: '1 / -1',
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '0.75rem', 
              marginTop: '1rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.25rem',
              flexWrap: 'wrap'
            }}>
              
              <button 
                type="submit" 
                disabled={formMode === "view"}
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.65rem 1.4rem', backgroundColor: formMode !== 'view' ? 'var(--primary)' : '#9ca3af', color: '#fff', cursor: formMode === "view" ? 'not-allowed' : 'pointer', opacity: formMode === "view" ? 0.6 : 1, boxShadow: formMode !== 'view' ? '0 2px 8px rgba(0,128,96,0.25)' : 'none' }}
                title="Simpan data aset ke sistem"
              >
                <Save size={15} /> Simpan
              </button>

              {formMode === "view" && (
                <button 
                  type="button" 
                  onClick={handleEdit} 
                  disabled={!selectedAsset}
                  className="btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.65rem 1.4rem', backgroundColor: '#fdf4ff', color: '#a21caf', border: '1px solid #f0abfc', cursor: !selectedAsset ? 'not-allowed' : 'pointer', opacity: !selectedAsset ? 0.6 : 1 }}
                  title={!selectedAsset ? 'Pilih aset dari tabel di bawah terlebih dahulu' : 'Edit data aset yang dipilih'}
                >
                  <Edit3 size={15} /> Ubah
                </button>
              )}

              {formMode === "view" && selectedAsset && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  className="btn-primary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.65rem 1.4rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', cursor: 'pointer' }}
                  title="Hapus data aset yang dipilih"
                >
                  <Trash2 size={15} /> Hapus
                </button>
              )}

              <button 
                type="button" 
                onClick={handleCancel} 
                disabled={formMode === "view"}
                className="btn-primary" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.65rem 1.4rem', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', border: '1px solid var(--border)', cursor: formMode === "view" ? 'not-allowed' : 'pointer', opacity: formMode === "view" ? 0.6 : 1 }}
                title="Batalkan perubahan dan kembali ke mode lihat"
              >
                <RotateCcw size={15} /> Batal
              </button>

            </div>
          </form>

          {/* =============================================================== */}
          {/* SECTION: INFORMASI FINANSIAL & DEPRESIASI */}
          {/* =============================================================== */}
          {selectedAsset && formMode === 'view' && (
            <div style={{ marginTop: '2rem', borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Wallet size={18} style={{ color: 'var(--primary)' }} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Informasi Finansial & Penyusutan</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {(() => {
                  const hargaPerolehan = (formData.hargaPerUnit || 0) + (formData.biayaRincian ? formData.biayaRincian.reduce((sum, r) => sum + (parseFloat(r.biaya) || 0), 0) : 0);
                  const nilaiResidu = formData.nilaiResidu || 0;
                  const umurEkonomis = formData.umurEkonomis || 1;
                  const satuanUmur = formData.satuanUmurEkonomis || "Tahun";
                  
                  const tglBeli = formData.tanggalPerolehan ? new Date(formData.tanggalPerolehan) : new Date();
                  const tglSekarang = new Date();
                  
                  let umurBerjalan = 0;
                  let penyusutanPerSatuan = 0;
                  
                  if (satuanUmur === "Hari") {
                    const diffTime = Math.max(0, tglSekarang.getTime() - tglBeli.getTime());
                    umurBerjalan = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    if (umurBerjalan > umurEkonomis) umurBerjalan = umurEkonomis;
                    penyusutanPerSatuan = umurEkonomis > 0 ? (hargaPerolehan - nilaiResidu) / umurEkonomis : 0;
                  } else if (satuanUmur === "Bulan") {
                    const diffMonths = (tglSekarang.getFullYear() - tglBeli.getFullYear()) * 12 + (tglSekarang.getMonth() - tglBeli.getMonth());
                    umurBerjalan = Math.max(0, diffMonths);
                    if (umurBerjalan > umurEkonomis) umurBerjalan = umurEkonomis;
                    penyusutanPerSatuan = umurEkonomis > 0 ? (hargaPerolehan - nilaiResidu) / umurEkonomis : 0;
                  } else {
                    // Tahun
                    const thnPerolehan = tglBeli.getFullYear();
                    const thnSekarang = tglSekarang.getFullYear();
                    umurBerjalan = Math.max(0, thnSekarang - thnPerolehan);
                    if (umurBerjalan > umurEkonomis) umurBerjalan = umurEkonomis;
                    penyusutanPerSatuan = umurEkonomis > 0 ? (hargaPerolehan - nilaiResidu) / umurEkonomis : 0;
                  }

                  const akumulasiPenyusutan = Math.min(hargaPerolehan - nilaiResidu, Math.round(penyusutanPerSatuan * umurBerjalan));
                  const nilaiBuku = Math.max(nilaiResidu, hargaPerolehan - akumulasiPenyusutan);

                  return (
                    <>
                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Harga Perolehan Total</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Rp {hargaPerolehan.toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Umur Berjalan</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{umurBerjalan} / {umurEkonomis} {satuanUmur}</div>
                      </div>
                      <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.2rem' }}>Akumulasi Penyusutan</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991b1b' }}>Rp {akumulasiPenyusutan.toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.2rem' }}>Nilai Buku Saat Ini</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#166534' }}>Rp {nilaiBuku.toLocaleString('id-ID')}</div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* =============================================================== */}
          {/* SECTION: RIWAYAT PERAWATAN (MAINTENANCE LOG) */}
          {/* =============================================================== */}
          {selectedAsset && formMode === 'view' && (
            <div style={{ marginTop: '2rem', borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={18} style={{ color: 'var(--primary)' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Riwayat Perawatan</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowMaintenanceForm(!showMaintenanceForm)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', fontSize: '0.78rem' }}
                >
                  {showMaintenanceForm ? 'Batal Tambah' : '+ Tambah Log Perawatan'}
                </button>
              </div>

              {showMaintenanceForm && (
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-dark)' }}>Form Tambah Log Perawatan</h4>
                  <form onSubmit={handleSaveMaintenance} className="form-grid-2col">
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Tanggal Servis</label>
                      <input 
                        type="date" 
                        value={newMaintenance.date}
                        onChange={e => setNewMaintenance({...newMaintenance, date: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Biaya Perbaikan (Rp)</label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '12px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rp</span>
                        <input 
                          type="text"
                          inputMode="numeric"
                          value={newMaintenance.cost === '' || newMaintenance.cost === undefined || newMaintenance.cost === null ? '' : (typeof newMaintenance.cost === 'number' ? newMaintenance.cost.toLocaleString('id-ID') : newMaintenance.cost)}
                          onChange={e => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            setNewMaintenance({...newMaintenance, cost: raw === '' ? '' : parseInt(raw, 10)});
                          }}
                          className="input-field"
                          style={{ paddingLeft: '2.5rem', fontWeight: 600 }}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Penanggung Jawab / Teknisi</label>
                      <input 
                        type="text" 
                        value={newMaintenance.officer}
                        onChange={e => setNewMaintenance({...newMaintenance, officer: e.target.value})}
                        className="input-field"
                        placeholder="Nama Teknisi"
                        required
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Keterangan / Detail Perbaikan</label>
                      <textarea 
                        rows="2"
                        value={newMaintenance.notes}
                        onChange={e => setNewMaintenance({...newMaintenance, notes: e.target.value})}
                        className="input-field"
                        placeholder="Contoh: Ganti oli, ganti freon, dll."
                        style={{ resize: 'none' }}
                        required
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.8rem' }}>
                        Simpan Log
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {maintenanceLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', border: '1px dashed var(--border)' }}>
                  Belum ada riwayat perawatan untuk aset ini.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Tanggal</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Keterangan Servis</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Teknisi/PJ</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>Biaya</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map(log => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-card)' }}>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dark)', fontWeight: 600 }}>
                            {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dark)' }}>{log.notes}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dark)' }}>{log.officer}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: 'var(--text-dark)', fontWeight: 600 }}>
                            Rp {log.cost.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

        {/* =============================================================== */}
        {/* SECTION: TABLE LIST OF ASSETS */}
        {/* =============================================================== */}
        <div ref={arsipRef} className="elegant-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} style={{ color: 'var(--primary)' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Daftar Aset Saat Ini</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.1rem 0 0' }}> Klik tombol <strong>"Pilih"</strong> pada baris tabel untuk menampilkan detail aset di form atas, lalu gunakan tombol <strong>" Ubah"</strong> untuk mengeditnya.</p>
              </div>
            </div>
            <div className="filter-controls-row" style={{ display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '100%' }}>
              <select 
                value={filterKategori}
                onChange={e => setFilterKategori(e.target.value)}
                className="input-field filter-control-item"
                style={{ padding: '0.35rem 0.75rem', height: '38px', minHeight: '38px', fontSize: '0.84rem', flex: '1 1 180px', boxSizing: 'border-box' }}
              >
                <option value="Semua">Semua Kategori</option>
                {filteredTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select 
                value={filterKondisi}
                onChange={e => setFilterKondisi(e.target.value)}
                className="input-field filter-control-item"
                style={{ padding: '0.35rem 0.75rem', height: '38px', minHeight: '38px', fontSize: '0.84rem', flex: '1 1 180px', boxSizing: 'border-box' }}
              >
                <option value="Semua">Semua Kondisi</option>
                <option value="Baik"> Baik / Layak Pakai</option>
                <option value="Rusak Ringan"> Rusak Ringan</option>
                <option value="Rusak Berat"> Rusak Berat</option>
              </select>

              <div className="filter-control-item" style={{ position: 'relative', flex: '1 1 200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Cari kode/nama aset..." 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="input-field" 
                  style={{ paddingLeft: '1.8rem', height: '38px', minHeight: '38px', fontSize: '0.84rem', width: '100%', boxSizing: 'border-box' }} 
                />
              </div>
            </div>
          </div>
          <div className="elegant-table-container" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
            <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>ID Aset</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>Nama Aset</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>Tgl Perolehan</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>Jenis Aset</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: 600 }}>Kondisi</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'left', fontWeight: 600 }}>Lokasi</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>Total Nilai</th>
                  <th style={{ padding: '0.5rem 1rem', textAlign: 'center', fontWeight: 600, width: '120px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      Tidak ada aset yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map(asset => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const totalVal = asset.biayaRincian?.reduce((sum, item) => sum + parseFloat(item.biaya || 0), 0) || asset.hargaPerUnit || 0;
                    
                    return (
                      <tr 
                        key={asset.id} 
                        style={{ 
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-card)', 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)', 
                          borderRadius: '8px',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectAsset(asset)}
                      >
                        <td style={{ padding: '0.85rem 1rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                          {asset.id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: isSelected ? 'var(--primary)' : 'var(--text-dark)' }}>
                          {asset.namaAset}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.75rem' }}>
                            <Calendar size={12} />
                            <span>{asset.tanggalPerolehan ? new Date(asset.tanggalPerolehan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                          {asset.jenisAset}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.2rem 0.6rem', 
                            borderRadius: '12px', 
                            fontSize: '0.72rem', 
                            fontWeight: 700,
                            backgroundColor: asset.kondisi === "Baik" ? '#dcfce7' : asset.kondisi === "Rusak Ringan" ? '#fef9c3' : '#fee2fee2',
                            color: asset.kondisi === "Baik" ? '#15803d' : asset.kondisi === "Rusak Ringan" ? '#854d0e' : '#b91c1c'
                          }}>
                            {asset.kondisi}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                          {asset.lokasi}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', textAlign: 'right', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                          {formatRupiah(totalVal)}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button 
                              type="button"
                              title="Lihat Detail Aset"
                              onClick={() => {
                                handleSelectAsset(asset);
                                setDetailModalAsset(asset);
                              }}
                              style={{ 
                                padding: '0.35rem 0.65rem', 
                                fontSize: '0.75rem', 
                                backgroundColor: '#eff6ff', 
                                color: '#1d4ed8', 
                                border: '1px solid #bfdbfe', 
                                borderRadius: '6px', 
                                cursor: 'pointer', 
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Eye size={13} />
                              Lihat
                            </button>
                            <button
                              type="button"
                              title="Edit Aset"
                              onClick={() => {
                                handleSelectAsset(asset);
                                setTimeout(() => setFormMode('edit'), 0);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fbbf24', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              title="Hapus Aset"
                              onClick={() => {
                                setSelectedAsset(asset);
                                openConfirm(`Apakah Anda yakin ingin menghapus aset "${asset.namaAset}"?`, () => {
                                  const updatedAssets = assets.filter(a => a.id !== asset.id);
                                  onSaveAssets(updatedAssets);
                                  setSelectedAsset(null);
                                  setFormMode('view');
                                  window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Aset "${asset.namaAset}" berhasil dihapus!`, type: 'success' } }));
                                  window.dispatchEvent(new CustomEvent('app-save-log', { detail: { action: 'Hapus Aset', module: 'Gudang & Aset', details: `Aset: ${asset.namaAset}, ID: ${asset.id}` } }));
                                });
                              }}
                              style={{ padding: '0.3rem 0.45rem', fontSize: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* =============================================================== */}
      {/* SECTION: QR CODE PRINT MODAL */}
      {/* =============================================================== */}
      {showQrModal && selectedAsset && (
        <div 
          className="modal-overlay no-print" 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9998,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <div className="modal-content" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', textAlign: 'center', fontSize: '1.2rem', color: 'var(--text-dark)' }}>Pratinjau Label QR Code</h3>
            
            <div id="qr-print-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', border: '2px dashed var(--border)', borderRadius: '8px', backgroundColor: '#fff', color: '#000' }}>
              <div style={{ marginBottom: '0.5rem', fontWeight: 800, fontSize: '0.9rem', textAlign: 'center', color: '#000' }}>
                KLINIK BAITURRAHMAN
              </div>
              <QRCode value={`medikara://asset/${selectedAsset.id}`} size={150} level="H" />
              <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#000' }}>{selectedAsset.id}</div>
                <div style={{ fontSize: '0.75rem', color: '#4b5563', textTransform: 'uppercase' }}>{selectedAsset.namaAset}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                onClick={() => setShowQrModal(false)}
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', cursor: 'pointer', fontWeight: 600 }}
              >
                Tutup
              </button>
              <button 
                type="button" 
                onClick={() => {
                  window.print();
                  setShowQrModal(false);
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} /> Cetak Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled JSX for layout animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

          {/* Image Viewer Modal */}
      {imageViewerModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }} onClick={() => setImageViewerModal({ isOpen: false, imageUrl: "" })}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', width: imageViewerModal.imageUrl.startsWith('data:application/pdf') ? '80vw' : 'auto', height: imageViewerModal.imageUrl.startsWith('data:application/pdf') ? '80vh' : 'auto' }} onClick={e => e.stopPropagation()}>
            {imageViewerModal.imageUrl.startsWith('data:application/pdf') ? (
               <iframe src={imageViewerModal.imageUrl} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px', backgroundColor: '#fff' }} title="PDF Viewer" />
            ) : (
               <img src={imageViewerModal.imageUrl} alt="Aset" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} />
            )}
            
            <button 
              onClick={() => setImageViewerModal({ isOpen: false, imageUrl: "" })}
              style={{ position: 'absolute', top: '-15px', right: '-15px', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', color: '#000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      {/* Modal Detail Informasi Aset (Fitur Lihat) */}
      {detailModalAsset && (
        <div 
          onClick={() => setDetailModalAsset(null)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(3px)',
            zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '16px',
              width: '780px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid var(--border-light)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8' }}>
                  <Eye size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>Detail Informasi Aset</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kode Registrasi: <strong style={{ color: 'var(--primary)' }}>{detailModalAsset.id}</strong></p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setDetailModalAsset(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)', borderRadius: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem' }}>
                {/* Kolom Kiri: Foto Aset & Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {detailModalAsset.fotoAset ? (
                      detailModalAsset.fotoAset.startsWith('data:image') ? (
                        <img 
                          src={detailModalAsset.fotoAset} 
                          alt={detailModalAsset.namaAset} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => setImageViewerModal({ isOpen: true, imageUrl: detailModalAsset.fotoAset })}
                          title="Klik untuk memperbesar foto"
                        />
                      ) : (
                        <div style={{ textAlign: 'center', padding: '1rem' }}>
                          <FileText size={48} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dokumen Terlampir</div>
                          <button 
                            type="button" 
                            onClick={() => setImageViewerModal({ isOpen: true, imageUrl: detailModalAsset.fotoAset })} 
                            style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', border: '1px solid var(--primary)', backgroundColor: 'var(--bg-main)', color: 'var(--primary)', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Buka Berkas
                          </button>
                        </div>
                      )
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                        <ImageIcon size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>Belum ada foto fisik</p>
                      </div>
                    )}
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Kondisi:</span>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                        backgroundColor: detailModalAsset.kondisi === "Baik" ? '#dcfce7' : detailModalAsset.kondisi === "Rusak Ringan" ? '#fef9c3' : '#fee2e2',
                        color: detailModalAsset.kondisi === "Baik" ? '#15803d' : detailModalAsset.kondisi === "Rusak Ringan" ? '#854d0e' : '#b91c1c'
                      }}>
                        {detailModalAsset.kondisi}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Satuan:</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>{detailModalAsset.satuan || 'Unit'}</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Rincian Lengkap */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>{detailModalAsset.jenisAset || 'Aset'}</span>
                    <h2 style={{ margin: '2px 0 0', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)' }}>{detailModalAsset.namaAset}</h2>
                    {detailModalAsset.merk && <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Merk / Tipe: <strong>{detailModalAsset.merk}</strong></p>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.85rem', backgroundColor: 'var(--bg-main)', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Lokasi Penempatan</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{detailModalAsset.lokasi}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Penanggung Jawab / Pemegang</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{detailModalAsset.pemegang || '-'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Tanggal Perolehan</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{detailModalAsset.tanggalPerolehan ? new Date(detailModalAsset.tanggalPerolehan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Total Nilai Buku</span>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 800 }}>
                        {formatRupiah(parseFloat(detailModalAsset.hargaPerUnit || 0) + (detailModalAsset.biayaRincian ? detailModalAsset.biayaRincian.reduce((acc, b) => acc + parseFloat(b.biaya || 0), 0) : 0))}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Umur Ekonomis</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{detailModalAsset.umurEkonomis || 5} {detailModalAsset.satuanUmurEkonomis || 'Tahun'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Nilai Residu</span>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{formatRupiah(detailModalAsset.nilaiResidu || 0)}</strong>
                    </div>
                  </div>

                  {/* Portabilitas */}
                  {detailModalAsset.portability && detailModalAsset.portability.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Karakteristik & Portabilitas:</span>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {detailModalAsset.portability.map((p, idx) => (
                          <span key={idx} style={{ padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-dark)' }}>
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keterangan & Spesifikasi */}
                  {(detailModalAsset.keterangan || detailModalAsset.spesifikasi) && (
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>Keterangan Tambahan:</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>
                        {detailModalAsset.keterangan || detailModalAsset.spesifikasi || '-'}
                      </p>
                    </div>
                  )}

                  {/* Rincian Biaya jika ada */}
                  {detailModalAsset.biayaRincian && detailModalAsset.biayaRincian.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Rincian Biaya Tambahan:</span>
                      <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                          <tbody>
                            {detailModalAsset.biayaRincian.map((b, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <td style={{ padding: '0.35rem 0.5rem' }}>{b.keterangan}</td>
                                <td style={{ padding: '0.35rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>{formatRupiah(b.biaya)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--bg-main)' }}>
              <button 
                type="button" 
                onClick={() => setDetailModalAsset(null)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Tutup
              </button>
              <button 
                type="button" 
                onClick={() => {
                  const toEdit = detailModalAsset;
                  setDetailModalAsset(null);
                  handleSelectAsset(toEdit);
                  setTimeout(() => setFormMode('edit'), 0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Edit3 size={14} /> Edit Aset Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataAsetInventaris;
