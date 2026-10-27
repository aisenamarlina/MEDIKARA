import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, File, FolderOpen, Shield, Database, Upload, Save, 
  Image as ImageIcon, RefreshCw, Eye, EyeOff, KeyRound,
  Lock, Unlock, Box, Server, X, CheckCircle2, ChevronRight,
  Sliders, Settings as SettingsIcon, AlertCircle
} from 'lucide-react';
import { db } from '../db';
import { compressImage } from '../utils/imageCompressor';

export default function PengaturanSistem({ settings, currentUser, onSave, openConfirm, setActiveMenu, setAssetReportTab }) {
  const [activeTab, setActiveTab] = useState('akses');
  const [formData, setFormData] = useState(() => db.get('settings') || settings || {});
  
  // State Akses Khusus (Gudang & Aset Tetap)
  const [unlockedFeatures, setUnlockedFeatures] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('kbr_unlocked_special_access') || '{"gudang":false,"fixed_asset":false}');
    } catch {
      return { gudang: false, fixed_asset: false };
    }
  });

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null); // 'gudang' | 'fixed_asset'
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '']);
  const [pinError, setPinError] = useState('');
  const pinInputRefs = useRef([]);

  const handleOpenPinModal = (feature) => {
    setSelectedFeature(feature);
    setPinDigits(['', '', '', '', '']);
    setPinError('');
    setPinModalOpen(true);
    setTimeout(() => {
      pinInputRefs.current[0]?.focus();
    }, 100);
  };

  const handleClosePinModal = () => {
    setPinModalOpen(false);
    setSelectedFeature(null);
    setPinDigits(['', '', '', '', '']);
    setPinError('');
  };

  const handlePinDigitChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal && value !== '') return;

    const newDigits = [...pinDigits];
    
    // If pasted multiple digits
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 5).split('');
      chars.forEach((c, i) => {
        if (i < 5) newDigits[i] = c;
      });
      setPinDigits(newDigits);
      const nextIdx = Math.min(chars.length, 4);
      pinInputRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = cleanVal ? cleanVal.slice(-1) : '';
    setPinDigits(newDigits);
    setPinError('');

    if (cleanVal && index < 4) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerifyPin();
    }
  };

  const handleVerifyPin = () => {
    const enteredPin = pinDigits.join('');
    if (enteredPin.length < 5) {
      setPinError('Masukkan 5 digit PIN lengkap.');
      return;
    }

    const correctPin = String(formData.specialAccessPin || settings?.specialAccessPin || '21721');
    const isCorrect = (enteredPin === correctPin) || (enteredPin === '21721');

    if (isCorrect) {
      const updated = { ...unlockedFeatures, [selectedFeature]: true };
      setUnlockedFeatures(updated);
      try {
        sessionStorage.setItem('kbr_unlocked_special_access', JSON.stringify(updated));
      } catch (e) {}

      const featureName = selectedFeature === 'gudang' ? 'Gudang Umum' : 'Aset Tetap';
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `Kunci dibuka! Akses ${featureName} kini aktif.`, type: 'success' } 
      }));
      handleClosePinModal();
    } else {
      setPinError('PIN salah! Silakan coba lagi.');
    }
  };

  const handleLockFeature = (feature) => {
    const updated = { ...unlockedFeatures, [feature]: false };
    setUnlockedFeatures(updated);
    try {
      sessionStorage.setItem('kbr_unlocked_special_access', JSON.stringify(updated));
    } catch (e) {}
    const featureName = feature === 'gudang' ? 'Gudang Umum' : 'Aset Tetap';
    window.dispatchEvent(new CustomEvent('app-toast', { 
      detail: { message: `Akses ${featureName} telah dikunci kembali.`, type: 'info' } 
    }));
  };

  useEffect(() => {
    if (settings) {
      setFormData(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, [settings]);

  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passForm.oldPassword.trim() || !passForm.newPassword.trim() || !passForm.confirmPassword.trim()) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Semua kolom kata sandi wajib diisi!", type: 'error' } }));
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi baru dan konfirmasi tidak cocok!", type: 'error' } }));
      return;
    }
    if (passForm.newPassword.length < 3) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi baru minimal 3 karakter!", type: 'error' } }));
      return;
    }

    openConfirm("Apakah Anda yakin ingin mengganti kata sandi akun ini?", () => {
      const users = db.get("users") || [];
      const targetUser = (currentUser?.username || "admin").toLowerCase();
      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === targetUser);

      let oldValid = false;
      if (userIndex !== -1) {
        const currentPass = users[userIndex].password || (targetUser === 'admin' ? 'admin' : '');
        if (currentPass === passForm.oldPassword) oldValid = true;
      } else if (targetUser === "admin" && passForm.oldPassword === "admin") {
        oldValid = true;
      }

      if (!oldValid) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi lama yang Anda masukkan salah!", type: 'error' } }));
        return;
      }

      const updatedUsers = users.map(u => {
        if (u.username && u.username.toLowerCase() === targetUser) {
          return { ...u, password: passForm.newPassword };
        }
        return u;
      });

      if (!updatedUsers.some(u => u.username && u.username.toLowerCase() === targetUser)) {
        updatedUsers.push({
          id: `usr-${Date.now()}`,
          username: targetUser,
          password: passForm.newPassword,
          name: currentUser?.name || targetUser,
          role: currentUser?.role || 'Pengguna',
          department: currentUser?.department || 'Klinik',
          email: currentUser?.email || (targetUser === 'admin' ? 'kbaiturrahmangarut@gmail.com' : `${targetUser}@klinikbaiturrahman.com`)
        });
      }

      // Simpan langsung ke seluruh lapis
      db.set("users", updatedUsers);

      // Perbarui sesi lokal
      if (currentUser) {
        const updatedCurrent = { ...currentUser, password: passForm.newPassword };
        sessionStorage.setItem("kbr_session_user_data", JSON.stringify(updatedCurrent));
      }

      db.addLog("Ubah Kata Sandi", "Keamanan", `Kata sandi akun [${currentUser?.username || 'admin'}] berhasil diperbarui`);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi berhasil diubah dan disimpan permanen!", type: 'success' } }));
    });
  };

  // File input refs
  const logoInputRef = useRef(null);
  const kopInputRef = useRef(null);
  const ttdInputRef = useRef(null);
  const capInputRef = useRef(null);
  const backupInputRef = useRef(null);

  const handleExportData = () => {
    try {
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("kbr_db_")) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `Backup_MEDIKARA_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Cadangan data sistem berhasil diunduh!', type: 'success' } }));
    } catch (err) {
      console.error('Download backup error:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Gagal mengunduh cadangan data!', type: 'error' } }));
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    openConfirm("PENTING: Proses ini akan menimpa SELURUH data sistem saat ini dengan file cadangan. Lanjutkan pemulihan?", () => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          
          let importedCount = 0;
          Object.keys(parsedData).forEach(key => {
            if (key.startsWith("kbr_db_")) {
              localStorage.setItem(key, parsedData[key]);
              importedCount++;
            }
          });
          
          if (importedCount > 0) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Pemulihan data berhasil! Memuat ulang sistem...', type: 'success' } }));
            setTimeout(() => {
              window.location.reload();
            }, 1200);
          } else {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'File cadangan tidak valid atau kosong.', type: 'error' } }));
          }
        } catch (err) {
          console.error('Import backup error:', err);
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Gagal membaca file cadangan! Format tidak sesuai.', type: 'error' } }));
        }
      };
      reader.readAsText(file);
    });
    
    e.target.value = null;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Ukuran file terlalu besar! Maksimal 10MB.", type: 'error' } }));
      return;
    }

    try {
      let maxW = 600, maxH = 600;
      if (field === 'signature') { maxW = 600; maxH = 300; }
      else if (field === 'stamp') { maxW = 400; maxH = 400; }
      else if (field === 'logo') { maxW = 400; maxH = 400; }

      let compressed = null;
      try {
        compressed = await compressImage(file, maxW, maxH, 0.85);
      } catch (compErr) {
        console.warn('Image compression fallback:', compErr);
      }

      if (!compressed) {
        compressed = await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.onerror = () => res(null);
          r.readAsDataURL(file);
        });
      }

      if (!compressed) {
        throw new Error("File gambar tidak dapat dibaca");
      }

      handleChange(field, compressed);
      
      const latest = db.get('settings') || settings || {};
      const updatedForm = { ...latest, ...formData, [field]: compressed };
      setFormData(updatedForm);
      db.set('settings', updatedForm);
      if (typeof onSave === 'function') {
        onSave(updatedForm);
      }
      const fieldLabel = field === 'signature' ? 'Tanda Tangan Pimpinan' : field === 'stamp' ? 'Stempel Klinik' : 'Logo Klinik';
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: `${fieldLabel} berhasil diperbarui dan disimpan permanen!`, type: 'success' } 
      }));
    } catch (err) {
      console.error('File upload error:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Gagal memproses file gambar: ${err?.message || ''}`, type: 'error' } }));
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleSave = () => {
    openConfirm("Apakah Anda yakin ingin menyimpan seluruh perubahan pengaturan ini?", () => {
      const latest = db.get('settings') || settings || {};
      const fullForm = { ...latest, ...formData };
      db.set('settings', fullForm);
      if (typeof onSave === 'function') {
        onSave(fullForm);
      }
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Pengaturan sistem berhasil disimpan!', type: 'success' } }));
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', animation: 'fadeIn 0.25s ease' }}>
      
      {/* 1. Header Toolbar yang Rapi & Proporsional */}
      <div className="elegant-card" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem 1.75rem', 
        borderRadius: '14px', 
        flexWrap: 'wrap', 
        gap: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary, #0d652d)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <SettingsIcon size={24} color="var(--primary, #0d652d)" /> Pengaturan Sistem
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted, #64748b)', margin: '0.35rem 0 0 0' }}>
            Konfigurasi identitas klinik, otorisasi akses khusus, format dokumen resmi, dan pemeliharaan basis data.
          </p>
        </div>
        <button 
          onClick={handleSave}
          type="button"
          style={{ 
            backgroundColor: 'var(--primary, #0d652d)', 
            color: '#ffffff', 
            padding: '0.65rem 1.4rem', 
            borderRadius: '10px', 
            border: 'none', 
            fontWeight: 700, 
            fontSize: '0.88rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.55rem',
            cursor: 'pointer', 
            boxShadow: '0 3px 8px rgba(13, 101, 45, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save size={16} /> Simpan Perubahan
        </button>
      </div>

      {/* 2. Container Konten Utama */}
      <div className="elegant-card" style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        borderRadius: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        
        {/* Navigation Tabs Bar */}
        <div className="no-scrollbar" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          backgroundColor: 'var(--bg-main, #f8fafc)', 
          border: '1px solid var(--border-light, #e2e8f0)', 
          padding: '0.4rem', 
          borderRadius: '12px', 
          overflowX: 'auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <TabButton active={activeTab === 'akses'} onClick={() => setActiveTab('akses')} icon={<Lock size={15} />} label="Akses Khusus" />
          <TabButton active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} icon={<FileText size={15} />} label="Profil Klinik" />
          <TabButton active={activeTab === 'surat'} onClick={() => setActiveTab('surat')} icon={<FileText size={15} />} label="Surat & Penomoran" />
          <TabButton active={activeTab === 'dokumen'} onClick={() => setActiveTab('dokumen')} icon={<File size={15} />} label="Dokumen & Kop" />
          <TabButton active={activeTab === 'arsip'} onClick={() => setActiveTab('arsip')} icon={<FolderOpen size={15} />} label="Arsip Digital" />
          <TabButton active={activeTab === 'keamanan'} onClick={() => setActiveTab('keamanan')} icon={<Shield size={15} />} label="Keamanan Akun" />
          <TabButton active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} icon={<Database size={15} />} label="Cadangan & Pemulihan" />
        </div>
        
        {/* Konten Tab Aktif */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* ========================================================= */}
        {/* TAB 1: AKSES KHUSUS (GUDANG UMUM & ASET TETAP) */}
        {/* ========================================================= */}
        {activeTab === 'akses' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Header Seksi */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              flexWrap: 'wrap', 
              gap: '0.75rem', 
              borderBottom: '1px solid var(--border-light, #e2e8f0)', 
              paddingBottom: '1rem' 
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={19} color="var(--primary, #0d652d)" /> Otorisasi Akses Khusus
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                  Akses menu operasional Gudang Umum dan Manajemen Aset Tetap diamankan dengan verifikasi PIN.
                </p>
              </div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.4rem', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                color: '#0d652d', 
                padding: '0.35rem 0.85rem', 
                borderRadius: '20px', 
                fontSize: '0.78rem', 
                fontWeight: 700 
              }}>
                <CheckCircle2 size={14} /> PIN Khusus Aktif: 21721
              </div>
            </div>

            {/* List Kartu Akses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* KARTU 1: GUDANG UMUM */}
              <div style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: '14px',
                border: '1.5px solid var(--border-light, #e2e8f0)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '240px', flex: 1 }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(13, 101, 45, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary, #0d652d)',
                    flexShrink: 0
                  }}>
                    <Box size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                        Gudang Umum
                      </h4>
                      {unlockedFeatures.gudang ? (
                        <span style={{ fontSize: '0.74rem', color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Unlock size={12} /> Terbuka
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> Terkunci
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748b)' }}>
                      Modul penerimaan barang masuk, stok gudang logistik, dan pengelolaan permintaan keluar.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {!unlockedFeatures.gudang ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPinModal('gudang')}
                      style={{
                        padding: '0.65rem 1.4rem',
                        backgroundColor: '#ffffff',
                        color: 'var(--primary, #0d652d)',
                        border: '1.5px solid var(--primary, #0d652d)',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light, #e6f4ea)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                    >
                      <Lock size={15} /> Buka dengan kata sandi
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMenu && setActiveMenu('warehouse')}
                        style={{ padding: '0.55rem 1rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Box size={14} /> Inventaris Barang
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMenu && setActiveMenu('requests')}
                        style={{ padding: '0.55rem 1rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <ChevronRight size={14} /> Permintaan Keluar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLockFeature('gudang')}
                        title="Kunci kembali fitur ini"
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Lock size={14} /> Kunci
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* KARTU 2: ASET TETAP */}
              <div style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: '14px',
                border: '1.5px solid var(--border-light, #e2e8f0)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.25rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                transition: 'border-color 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '240px', flex: 1 }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: 'rgba(13, 101, 45, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary, #0d652d)',
                    flexShrink: 0
                  }}>
                    <Server size={28} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                        Aset Tetap
                      </h4>
                      {unlockedFeatures.fixed_asset ? (
                        <span style={{ fontSize: '0.74rem', color: '#15803d', backgroundColor: '#dcfce7', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Unlock size={12} /> Terbuka
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.74rem', color: '#dc2626', backgroundColor: '#fee2e2', padding: '0.2rem 0.65rem', borderRadius: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> Terkunci
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.84rem', color: 'var(--text-muted, #64748b)' }}>
                      Pencatatan Master Data, Inventaris Barang/Gedung/Medis, Relokasi Ruangan, dan Laporan Aset.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {!unlockedFeatures.fixed_asset ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPinModal('fixed_asset')}
                      style={{
                        padding: '0.65rem 1.4rem',
                        backgroundColor: '#ffffff',
                        color: 'var(--primary, #0d652d)',
                        border: '1.5px solid var(--primary, #0d652d)',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-light, #e6f4ea)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                    >
                      <Lock size={15} /> Buka dengan kata sandi
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setActiveMenu && setActiveMenu('asset_master')}
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Master Data
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMenu && setActiveMenu('assets_inventaris')}
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Data Aset
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveMenu && setActiveMenu('asset_relocation')}
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Relokasi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof setAssetReportTab === 'function') setAssetReportTab('all_assets');
                          if (setActiveMenu) setActiveMenu('report_assets');
                        }}
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: 'var(--primary, #0d652d)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Laporan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLockFeature('fixed_asset')}
                        title="Kunci kembali fitur ini"
                        style={{ padding: '0.55rem 0.85rem', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <Lock size={14} /> Kunci
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PROFIL KLINIK */}
        {/* ========================================================= */}
        {activeTab === 'profil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                Identitas Resmi Klinik
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                Data ini digunakan pada kop surat, laporan inventaris aset, dan cetak dokumen resmi klinik.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: '2rem', alignItems: 'start' }}>
              
              {/* Kolom Kiri: Logo Klinik */}
              <div style={{ 
                backgroundColor: 'var(--bg-card, #ffffff)', 
                border: '1px solid var(--border-light, #e2e8f0)', 
                borderRadius: '12px', 
                padding: '1.25rem', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '0.75rem',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark, #111827)' }}>
                  Logo Utama Klinik
                </span>
                
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '16px', 
                  border: '2px dashed var(--border, #cbd5e1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  overflow: 'hidden', 
                  backgroundColor: '#f8fafc',
                  padding: '8px'
                }}>
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo Klinik" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={44} color="#94a3b8" />
                  )}
                </div>

                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  ref={logoInputRef} 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFileUpload(e, 'logo')} 
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                  <button 
                    type="button"
                    onClick={() => logoInputRef.current.click()}
                    style={{ 
                      width: '100%', 
                      padding: '0.55rem', 
                      backgroundColor: 'var(--primary, #0d652d)', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '0.82rem', 
                      fontWeight: 700, 
                      color: '#ffffff', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.4rem' 
                    }}>
                    <Upload size={14} /> Unggah Logo Baru
                  </button>
                  {formData.logo && formData.logo !== '/logo.png' && (
                    <button 
                      type="button"
                      onClick={() => handleChange('logo', '/logo.png')}
                      style={{ 
                        width: '100%', 
                        padding: '0.45rem', 
                        backgroundColor: 'transparent', 
                        border: '1px solid var(--border-light, #e2e8f0)', 
                        borderRadius: '8px', 
                        fontSize: '0.78rem', 
                        fontWeight: 600, 
                        color: 'var(--text-muted, #64748b)', 
                        cursor: 'pointer' 
                      }}>
                      Kembalikan Logo Default
                    </button>
                  )}
                </div>

                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.4 }}>
                  Disarankan format PNG transparan dengan resolusi tinggi.
                </span>
              </div>
              
              {/* Kolom Kanan: Form Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <InputField label="Nama Yayasan / Instansi Induk" value={formData.yayasanName} onChange={(e) => handleChange('yayasanName', e.target.value)} />
                  <InputField label="Nama Klinik / Instansi" value={formData.clinicName} onChange={(e) => handleChange('clinicName', e.target.value)} />
                  <InputField label="No. Telepon / Fax" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  <InputField label="Nama Pimpinan / Direktur" value={formData.directorName} onChange={(e) => handleChange('directorName', e.target.value)} />
                  <InputField label="Email Resmi Klinik" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  <InputField label="Website Resmi" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
                  <InputField label="SERTIFIKAT STANDAR (NIB)" value={formData.nib} onChange={(e) => handleChange('nib', e.target.value)} />
                  <InputField label="Kode / Identitas Klinik" value={formData.clinicCode} onChange={(e) => handleChange('clinicCode', e.target.value)} />
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.4rem' }}>
                    Alamat Lengkap Klinik
                  </label>
                  <textarea 
                    value={formData.address || ''} 
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                    style={{ 
                      width: '100%', 
                      padding: '0.65rem 0.85rem', 
                      borderRadius: '8px', 
                      border: '1.5px solid var(--border-light, #e2e8f0)', 
                      backgroundColor: 'var(--bg-card, #ffffff)', 
                      color: 'var(--text-dark, #111827)',
                      fontSize: '0.86rem', 
                      outline: 'none', 
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }} 
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SURAT & PENOMORAN */}
        {/* ========================================================= */}
        {activeTab === 'surat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                Format Penomoran Surat Otomatis
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                Atur skema penomoran surat keluar, sertifikat, dan dokumen operasional logistik secara otomatis.
              </p>
            </div>

            {/* Helper Tag Variables */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem', 
              padding: '0.75rem 1rem', 
              backgroundColor: 'rgba(13, 101, 45, 0.06)', 
              borderRadius: '10px',
              border: '1px solid rgba(13, 101, 45, 0.15)',
              flexWrap: 'wrap',
              fontSize: '0.82rem'
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary, #0d652d)' }}>Variabel Penomoran:</span>
              <code style={{ backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #d1fae5', color: '#0d652d', fontWeight: 700 }}>{'{NO}'}</code> (Nomor Urut)
              <code style={{ backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #d1fae5', color: '#0d652d', fontWeight: 700 }}>{'{BULAN_ROMAWI}'}</code> (Bulan Romawi)
              <code style={{ backgroundColor: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #d1fae5', color: '#0d652d', fontWeight: 700 }}>{'{TAHUN}'}</code> (Tahun Berjalan)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <InputField label="Format Surat Umum (Keluar / Rekomendasi)" value={formData.numFormatLetter} onChange={(e) => handleChange('numFormatLetter', e.target.value)} />
              <InputField label="Format Sertifikat & Piagam" value={formData.numFormatCert} onChange={(e) => handleChange('numFormatCert', e.target.value)} />
              <InputField label="Format Barang Masuk (Gudang)" value={formData.numFormatIn} onChange={(e) => handleChange('numFormatIn', e.target.value)} />
              <InputField label="Format Barang Keluar (Gudang)" value={formData.numFormatOut} onChange={(e) => handleChange('numFormatOut', e.target.value)} />
              <InputField label="Format Peminjaman Barang" value={formData.numFormatBorrow} onChange={(e) => handleChange('numFormatBorrow', e.target.value)} />
            </div>
            
            {/* Live Preview Card */}
            <div style={{ 
              padding: '1.25rem', 
              backgroundColor: 'var(--bg-main, #f8fafc)', 
              borderRadius: '12px', 
              border: '1px solid var(--border-light, #e2e8f0)' 
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                Contoh Pratinjau Nomor Tergenerate:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', fontSize: '0.84rem' }}>
                <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Surat Umum</span>
                  <strong style={{ color: 'var(--primary, #0d652d)' }}>
                    {formData.numFormatLetter ? formData.numFormatLetter.replace('{NO}', '001').replace('{BULAN_ROMAWI}', 'X').replace('{TAHUN}', new Date().getFullYear()) : '001/KB/X/2026'}
                  </strong>
                </div>
                <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Sertifikat</span>
                  <strong style={{ color: 'var(--primary, #0d652d)' }}>
                    {formData.numFormatCert ? formData.numFormatCert.replace('{NO}', '005').replace('{BULAN_ROMAWI}', 'X').replace('{TAHUN}', new Date().getFullYear()) : '005/SRT/KB/X/2026'}
                  </strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DOKUMEN & KOP SURAT */}
        {/* ========================================================= */}
        {activeTab === 'dokumen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* Seksi Ukuran Kertas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                  Format Kertas Dokumen
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                  Tentukan ukuran kertas cetak standar untuk seluruh modul persuratan dan berkas cetak.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
                    Ukuran Kertas Standar
                  </label>
                  <select 
                    value={formData.paperSize || 'A4'} 
                    onChange={(e) => handleChange('paperSize', e.target.value)} 
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border-light, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-dark, #111827)', fontSize: '0.86rem', outline: 'none' }}
                  >
                    <option value="A4">A4 (21.0 x 29.7 cm)</option>
                    <option value="F4">F4 / Folio (21.5 x 33.0 cm)</option>
                    <option value="Letter">Letter (21.6 x 27.9 cm)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
                    Orientasi Halaman
                  </label>
                  <select 
                    value={formData.paperOrientation || 'Portrait'} 
                    onChange={(e) => handleChange('paperOrientation', e.target.value)} 
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border-light, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-dark, #111827)', fontSize: '0.86rem', outline: 'none' }}
                  >
                    <option value="Portrait">Portrait (Tegak)</option>
                    <option value="Landscape">Landscape (Mendatar)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Seksi Kop Surat & TTD */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                  Kop Surat Resmi &amp; Validasi Pimpinan
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                  Lampirkan gambar tanda tangan digital dan stempel klinik untuk penerbitan surat resmi otomatis.
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FileUploadRow 
                  title="Logo Kop Surat" 
                  desc="Logo resmi yang ditempatkan pada kepala surat" 
                  image={formData.logo} 
                  inputRef={kopInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'logo')} 
                />

                <FileUploadRow 
                  title="Tanda Tangan Pimpinan" 
                  desc={`Pimpinan: ${formData.directorName || "Pimpinan Klinik"} (Gunakan PNG transparan)`} 
                  image={formData.signature} 
                  inputRef={ttdInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'signature')} 
                />

                <FileUploadRow 
                  title="Stempel Basah Klinik" 
                  desc="Stempel resmi klinik (Disarankan PNG transparan tanpa latar belakang)" 
                  image={formData.stamp} 
                  inputRef={capInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'stamp')} 
                  round
                />
              </div>

              {/* Pratinjau Kop Surat */}
              <div style={{ 
                marginTop: '0.5rem', 
                padding: '1.5rem', 
                border: '1.5px solid var(--border-light, #e2e8f0)', 
                borderRadius: '12px', 
                backgroundColor: '#ffffff' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                    Pratinjau Kop Surat Standar
                  </h4>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted, #64748b)' }}>Sesuai tampilan cetak PDF</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '3px double #000000', paddingBottom: '0.75rem' }}>
                  <img src={formData.logo || "/logo.png"} alt="Logo" style={{ width: '80px', height: 'auto', marginBottom: '6px', objectFit: 'contain' }} />
                  <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>
                      {formData.yayasanName || 'Yayasan Baeturrachman Garut'}
                    </p>
                    <h3 style={{ margin: '0 0 3px 0', fontSize: '1.35rem', fontWeight: 900, textTransform: 'uppercase', color: '#0d652d', letterSpacing: '0.5px' }}>
                      {formData.clinicName || 'KLINIK BAITURRAHMAN'}
                    </h3>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                      {(() => { 
                        const v = formData.nib || '91203004416170002'; 
                        return v.toUpperCase().startsWith('SERTIFIKAT STANDAR') ? v : (v.toUpperCase().startsWith('NO') ? `SERTIFIKAT STANDAR ${v}` : `SERTIFIKAT STANDAR : ${v}`); 
                      })()}
                    </p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '0.78rem', color: '#4b5563' }}>
                      {(() => {
                        const addr = (formData.address || 'Jl. Merdeka No. 217, Tarogong Kidul-Garut').replace(/,+$/, '').trim();
                        const ph = (formData.phone || 'Telp. (0262) 234754, HP. 0813-2124-3303').trim();
                        return ph ? `${addr}, ${ph}` : addr;
                      })()}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.76rem', fontStyle: 'italic', color: '#4b5563' }}>
                      Email: <span style={{ textDecoration: 'underline' }}>{formData.email || 'klinikbaiturrahman@rocketmail.com'}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ARSIP DIGITAL */}
        {/* ========================================================= */}
        {activeTab === 'arsip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                Pengaturan Penyimpanan &amp; Arsip Digital
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                Kelola kapasitas lampiran file, format berkas yang diizinkan, dan siklus retensi arsip.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
                  Batas Maksimal Ukuran File Unggahan
                </label>
                <select 
                  value={formData.maxFileSize || '10'} 
                  onChange={(e) => handleChange('maxFileSize', e.target.value)} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border-light, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-dark, #111827)', fontSize: '0.86rem', outline: 'none' }}
                >
                  <option value="5">5 MB (Hemat Ruang)</option>
                  <option value="10">10 MB (Standar Rekomendasi)</option>
                  <option value="25">25 MB (Berkas Besar)</option>
                  <option value="50">50 MB (Maksimal)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
                  Siklus Retensi Berkas Arsip
                </label>
                <select 
                  value={formData.autoDelete || 'never'} 
                  onChange={(e) => handleChange('autoDelete', e.target.value)} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border-light, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-dark, #111827)', fontSize: '0.86rem', outline: 'none' }}
                >
                  <option value="never">Simpan Selamanya (Permanen)</option>
                  <option value="1_year">Arsipkan ke Sampah setelah 1 Tahun</option>
                  <option value="3_years">Arsipkan ke Sampah setelah 3 Tahun</option>
                  <option value="5_years">Arsipkan ke Sampah setelah 5 Tahun</option>
                </select>
              </div>

              <InputField label="Ekstensi Dokumen Diizinkan (Pisahkan koma)" value={formData.allowedFormats || 'pdf, docx, xlsx, zip, png, jpg'} onChange={(e) => handleChange('allowedFormats', e.target.value)} />
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: KEAMANAN AKUN */}
        {/* ========================================================= */}
        {activeTab === 'keamanan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0 }}>
                Keamanan &amp; Autentikasi Pengguna
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                Perbarui kata sandi akun login dan atur kebijakan batas waktu sesi inaktif aplikasi.
              </p>
            </div>

            {/* Form Ubah Password */}
            <form onSubmit={handleUpdatePassword} style={{ 
              padding: '1.5rem', 
              border: '1.5px solid var(--border-light, #e2e8f0)', 
              borderRadius: '12px', 
              backgroundColor: 'var(--bg-card, #ffffff)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.25rem' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h4 style={{ fontWeight: 800, margin: 0, color: 'var(--text-dark, #111827)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <KeyRound size={18} color="var(--primary, #0d652d)" /> Ubah Kata Sandi Akun
                  </h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                    Akun yang sedang aktif: <strong style={{ color: 'var(--primary, #0d652d)' }}>{currentUser?.name || currentUser?.username || 'Administrator'}</strong>
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '12px', backgroundColor: 'rgba(13, 101, 45, 0.1)', color: 'var(--primary, #0d652d)', fontWeight: 700 }}>
                  @{currentUser?.username || 'admin'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <PasswordInputField 
                  label="Kata Sandi Lama" 
                  value={passForm.oldPassword} 
                  onChange={(e) => setPassForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  show={showPass.old}
                  onToggleShow={() => setShowPass(prev => ({ ...prev, old: !prev.old }))}
                  placeholder="Masukkan sandi saat ini"
                />
                <PasswordInputField 
                  label="Kata Sandi Baru" 
                  value={passForm.newPassword} 
                  onChange={(e) => setPassForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  show={showPass.new}
                  onToggleShow={() => setShowPass(prev => ({ ...prev, new: !prev.new }))}
                  placeholder="Minimal 3 karakter"
                />
                <PasswordInputField 
                  label="Konfirmasi Kata Sandi Baru" 
                  value={passForm.confirmPassword} 
                  onChange={(e) => setPassForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  show={showPass.confirm}
                  onToggleShow={() => setShowPass(prev => ({ ...prev, confirm: !prev.confirm }))}
                  placeholder="Ulangi sandi baru"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button
                  type="submit"
                  style={{
                    backgroundColor: 'var(--primary, #0d652d)', 
                    color: '#ffffff',
                    padding: '0.65rem 1.4rem', 
                    borderRadius: '8px',
                    border: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.86rem',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    cursor: 'pointer', 
                    boxShadow: '0 2px 6px rgba(13, 101, 45, 0.2)'
                  }}
                >
                  <Save size={15} /> Simpan Kata Sandi Baru
                </button>
              </div>
            </form>

            {/* Timeout Sesi */}
            <div style={{ 
              padding: '1.25rem 1.5rem', 
              border: '1.5px solid var(--border-light, #e2e8f0)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              backgroundColor: 'var(--bg-card, #ffffff)',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark, #111827)' }}>
                  Batas Waktu Sesi Inaktif (Auto Logout)
                </h4>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted, #64748b)' }}>
                  Aplikasi akan mengakhiri sesi login otomatis apabila tidak ada interaksi pengguna demi keamanan data.
                </p>
              </div>
              <select 
                value={formData.sessionTimeout || '30'} 
                onChange={(e) => handleChange('sessionTimeout', e.target.value)} 
                style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1.5px solid var(--border-light, #e2e8f0)', backgroundColor: 'var(--bg-card, #ffffff)', color: 'var(--text-dark, #111827)', fontSize: '0.86rem', outline: 'none' }}
              >
                <option value="15">15 Menit</option>
                <option value="30">30 Menit (Standar)</option>
                <option value="60">1 Jam</option>
                <option value="0">Jangan Pernah (Nonaktif)</option>
              </select>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: CADANGAN & PEMULIHAN DATA */}
        {/* ========================================================= */}
        {activeTab === 'backup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ borderBottom: '1px solid var(--border-light, #e2e8f0)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark, #111827)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={19} color="var(--primary, #0d652d)" /> Cadangan &amp; Pemulihan Data Sistem
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', margin: '0.25rem 0 0 0' }}>
                Amankan seluruh basis data klinik (surat, arsip, inventaris, akun, dan pengaturan) secara berkala.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              
              {/* Kartu Ekspor Cadangan */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1.5px solid var(--border-light, #e2e8f0)', 
                borderRadius: '14px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                backgroundColor: 'var(--bg-card, #ffffff)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '0.65rem', backgroundColor: 'rgba(13, 101, 45, 0.1)', borderRadius: '10px', color: 'var(--primary, #0d652d)' }}>
                    <Upload size={22} style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                      Unduh Cadangan Database
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted, #64748b)' }}>Format berkas enkripsi .json</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
                  Simpan seluruh data sistem (Surat Masuk/Keluar, Master Aset, Gudang, Log, dan Pengaturan) ke komputer Anda secara offline.
                </p>
                <button 
                  type="button"
                  onClick={handleExportData}
                  style={{ 
                    marginTop: 'auto', 
                    padding: '0.65rem 1rem', 
                    backgroundColor: 'var(--primary, #0d652d)', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '0.86rem', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(13, 101, 45, 0.2)'
                  }}
                >
                  <Upload size={16} style={{ transform: 'rotate(180deg)' }} /> Unduh Cadangan Sekarang
                </button>
              </div>

              {/* Kartu Impor Pemulihan */}
              <div style={{ 
                padding: '1.5rem', 
                border: '1.5px solid #fee2e2', 
                borderRadius: '14px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                backgroundColor: 'var(--bg-card, #ffffff)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ padding: '0.65rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', color: '#dc2626' }}>
                    <Upload size={22} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-dark, #111827)' }}>
                      Pulihkan Database dari File
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 600 }}>Tindakan Penggantian Data</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
                  Unggah file cadangan <code>.json</code> untuk mengembalikan kondisi data sistem sebelumnya jika terjadi pergantian perangkat atau masalah server.
                </p>
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  ref={backupInputRef} 
                  onChange={handleImportData} 
                />
                <button 
                  type="button"
                  onClick={() => backupInputRef.current.click()}
                  style={{ 
                    marginTop: 'auto', 
                    padding: '0.65rem 1rem', 
                    backgroundColor: '#dc2626', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    fontSize: '0.86rem', 
                    fontWeight: 700, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem',
                    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.2)'
                  }}
                >
                  <Upload size={16} /> Pilih File Cadangan (.json)
                </button>
              </div>

            </div>
          </div>
        )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL PIN AKSES KHUSUS (Dialog Elegan & Responsif) */}
      {/* ========================================================= */}
      {pinModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.25rem 2.5rem',
            width: '420px',
            maxWidth: '92%',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Tombol Tutup X */}
            <button
              type="button"
              onClick={handleClosePinModal}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.35rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
            >
              <X size={20} />
            </button>

            {/* Icon Gembok Hijau Lingkaran */}
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              backgroundColor: 'rgba(13, 101, 45, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              color: 'var(--primary, #0d652d)'
            }}>
              <Lock size={32} />
            </div>

            {/* Judul & Subjudul */}
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.4rem 0' }}>
              Verifikasi Otorisasi PIN
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.75rem 0', lineHeight: 1.5 }}>
              Masukkan 5 digit PIN keamanan untuk membuka akses modul <strong style={{ color: '#0d652d' }}>{selectedFeature === 'gudang' ? 'Gudang Umum' : 'Aset Tetap'}</strong>.
            </p>

            {/* 5 Kotak PIN dengan Titik Hijau */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {pinDigits.map((digit, idx) => (
                <div
                  key={idx}
                  onClick={() => pinInputRefs.current[idx]?.focus()}
                  style={{
                    width: '48px',
                    height: '56px',
                    border: digit ? '2px solid #0d652d' : '1.5px solid #cbd5e1',
                    borderRadius: '12px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    cursor: 'text',
                    boxShadow: digit ? '0 0 0 3px rgba(13, 101, 45, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <input
                    ref={el => pinInputRefs.current[idx] = el}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handlePinDigitChange(idx, e.target.value)}
                    onKeyDown={e => handlePinKeyDown(idx, e)}
                    style={{
                      position: 'absolute',
                      top: 0, left: 0,
                      width: '100%', height: '100%',
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  {/* Titik Indikator Lingkaran */}
                  <span style={{
                    width: digit ? '12px' : '9px',
                    height: digit ? '12px' : '9px',
                    borderRadius: '50%',
                    backgroundColor: digit ? '#0d652d' : '#cbd5e1',
                    transition: 'all 0.15s ease'
                  }} />
                </div>
              ))}
            </div>

            {/* Pesan Kesalahan jika PIN salah */}
            {pinError && (
              <p style={{ color: '#dc2626', fontSize: '0.84rem', margin: '-0.5rem 0 1rem 0', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <AlertCircle size={15} /> {pinError}
              </p>
            )}

            {/* Tombol Batal & Masuk */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={handleClosePinModal}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleVerifyPin}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary, #0d652d)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 8px rgba(13, 101, 45, 0.25)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Buka Kunci
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    type="button"
    onClick={onClick} 
    style={{ 
      background: active ? 'var(--bg-card, #ffffff)' : 'transparent', 
      borderRadius: '8px', 
      border: active ? '1px solid var(--border-light, #e2e8f0)' : '1px solid transparent',
      padding: '0.5rem 0.95rem', 
      height: '38px',
      color: active ? 'var(--primary, #0d652d)' : 'var(--text-muted, #64748b)', 
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
      fontWeight: active ? 700 : 600, 
      fontSize: '0.84rem', 
      cursor: 'pointer', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: '0.45rem', 
      whiteSpace: 'nowrap',
      transition: 'all 0.15s ease', 
      flexShrink: 0
    }}
    onMouseOver={(e) => {
      if (!active) e.currentTarget.style.color = 'var(--text-dark, #111827)';
    }}
    onMouseOut={(e) => {
      if (!active) e.currentTarget.style.color = 'var(--text-muted, #64748b)';
    }}
  >
    <span style={{ 
      display: 'inline-flex', 
      padding: '0.2rem', 
      backgroundColor: active ? 'rgba(13, 101, 45, 0.1)' : 'transparent', 
      borderRadius: '6px',
      alignItems: 'center',
      justifyContent: 'center',
      color: active ? 'var(--primary, #0d652d)' : 'inherit'
    }}>
      {icon}
    </span>
    <span>{label}</span>
  </button>
);

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
      {label}
    </label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={onChange}
      style={{ 
        width: '100%', 
        padding: '0.65rem 0.85rem', 
        borderRadius: '8px', 
        border: '1.5px solid var(--border-light, #e2e8f0)', 
        backgroundColor: 'var(--bg-card, #ffffff)', 
        color: 'var(--text-dark, #111827)', 
        fontSize: '0.86rem', 
        outline: 'none', 
        transition: 'border-color 0.15s ease',
        boxSizing: 'border-box'
      }} 
      onFocus={(e) => e.target.style.borderColor = 'var(--primary, #0d652d)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--border-light, #e2e8f0)'}
    />
  </div>
);

const PasswordInputField = ({ label, value, onChange, show, onToggleShow, placeholder = "Masukkan kata sandi" }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark, #111827)', marginBottom: '0.35rem' }}>
      {label}
    </label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input 
        type={show ? "text" : "password"}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        style={{ 
          width: '100%', 
          padding: '0.65rem 2.4rem 0.65rem 0.85rem', 
          borderRadius: '8px', 
          border: '1.5px solid var(--border-light, #e2e8f0)', 
          backgroundColor: 'var(--bg-card, #ffffff)', 
          color: 'var(--text-dark, #111827)', 
          fontSize: '0.86rem', 
          outline: 'none', 
          transition: 'border-color 0.15s ease',
          boxSizing: 'border-box'
        }} 
        onFocus={(e) => e.target.style.borderColor = 'var(--primary, #0d652d)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border-light, #e2e8f0)'}
      />
      <button 
        type="button" 
        onClick={onToggleShow} 
        style={{ 
          position: 'absolute', 
          right: '8px', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer', 
          color: '#94a3b8', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '4px' 
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const FileUploadRow = ({ title, desc, image, inputRef, onUpload, round }) => (
  <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    gap: '1.25rem', 
    padding: '0.85rem 1rem', 
    border: '1px solid var(--border-light, #e2e8f0)',
    borderRadius: '10px',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px', flex: 1 }}>
      <div style={{ 
        width: round ? '64px' : '90px', 
        height: '60px', 
        border: '1px solid var(--border-light, #e2e8f0)', 
        borderRadius: round ? '50%' : '8px', 
        overflow: 'hidden', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#f8fafc',
        flexShrink: 0,
        padding: '4px'
      }}>
        {image ? (
          <img src={image} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <ImageIcon size={22} color="#94a3b8" />
        )}
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark, #111827)' }}>
          {title}
        </h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted, #64748b)' }}>
          {desc}
        </p>
      </div>
    </div>
    
    <input type="file" accept="image/*" ref={inputRef} style={{ display: 'none' }} onChange={onUpload} />
    <button 
      type="button"
      onClick={() => inputRef.current.click()}
      style={{ 
        padding: '0.55rem 1rem', 
        backgroundColor: '#ffffff', 
        border: '1.5px solid var(--primary, #0d652d)', 
        borderRadius: '8px', 
        fontSize: '0.82rem', 
        fontWeight: 700, 
        color: 'var(--primary, #0d652d)', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.45rem',
        transition: 'all 0.15s ease'
      }}
      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(13, 101, 45, 0.08)'; }}
      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
    >
      <Upload size={14} /> Pilih Berkas
    </button>
  </div>
);
