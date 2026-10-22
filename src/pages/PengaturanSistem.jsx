import React, { useState, useRef } from 'react';
import { FileText, File, FolderOpen, Shield, Database, Upload, Save, Image as ImageIcon, RefreshCw, Eye, EyeOff, KeyRound } from 'lucide-react';
import { db } from '../db';

export default function PengaturanSistem({ settings, currentUser, onSave, openConfirm }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [formData, setFormData] = useState(settings || {});
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setFormData(settings || {});
  }
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
      const users = db.get("users") || defaultUsers;
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

      // Simpan langsung ke seluruh lapis (LocalStorage, Disk Server, Firebase)
      db.set("users", updatedUsers);

      // Perbarui sesi lokal
      if (currentUser) {
        const updatedCurrent = { ...currentUser, password: passForm.newPassword };
        localStorage.setItem("kbr_session_user_data", JSON.stringify(updatedCurrent));
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
      
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Data berhasil diunduh!', type: 'success' } }));
    } catch (err) {
      console.error('Download backup error:', err);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Gagal mengunduh data!', type: 'error' } }));
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    openConfirm("PENTING: Proses ini akan menghapus dan menimpa SELURUH data sistem saat ini dengan data dari file backup. Apakah Anda yakin ingin melanjutkan?", () => {
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
            }, 1500);
          } else {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'File backup tidak valid atau kosong.', type: 'error' } }));
          }
        } catch (err) {
          console.error('Import backup error:', err);
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Gagal membaca file backup! Format tidak sesuai.', type: 'error' } }));
        }
      };
      reader.readAsText(file);
    });
    
    // Reset file input
    e.target.value = null;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Ukuran file terlalu besar! Maksimal 2MB.", type: 'error' } }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange(field, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    openConfirm("Apakah Anda yakin ingin menyimpan perubahan pengaturan ini?", () => {
      onSave(formData);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Pengaturan berhasil disimpan!', type: 'success' } }));
    });
  };

  return (
    <div style={{ flex: 1, padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Compact Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>Pengaturan Sistem</span>
        <button 
          onClick={handleSave}
          style={{ 
            backgroundColor: 'var(--primary)', color: '#fff', 
            padding: '0.35rem 1rem', borderRadius: '7px', 
            border: 'none', fontWeight: 600, fontSize: '0.83rem',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            cursor: 'pointer', boxShadow: 'var(--shadow-sm)', height: '34px'
          }}
        >
          <Save size={15} /> Simpan Perubahan
        </button>
      </div>

      <div className="elegant-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
        {/* Tabs */}
        <div className="no-scrollbar" style={{ display: 'flex', alignItems: 'center', height: '40px', boxSizing: 'border-box', gap: '0.35rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.3rem', borderRadius: '8px', overflowX: 'auto', marginBottom: '1rem' }}>
          <TabButton active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} icon={<FileText size={15} />} label="Profil Klinik" />
          <TabButton active={activeTab === 'surat'} onClick={() => setActiveTab('surat')} icon={<FileText size={15} />} label="Surat & Penomoran" />
          <TabButton active={activeTab === 'dokumen'} onClick={() => setActiveTab('dokumen')} icon={<File size={15} />} label="Dokumen" />
          <TabButton active={activeTab === 'arsip'} onClick={() => setActiveTab('arsip')} icon={<FolderOpen size={15} />} label="Arsip" />
          <TabButton active={activeTab === 'keamanan'} onClick={() => setActiveTab('keamanan')} icon={<Shield size={15} />} label="Keamanan" />
          <TabButton active={activeTab === 'backup'} onClick={() => setActiveTab('backup')} icon={<Database size={15} />} label="Backup" />
        </div>
        
        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* TAB: PROFIL KLINIK */}
        {activeTab === 'profil' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 0.75rem 0', color: 'var(--text-dark)', fontSize: '0.95rem' }}>Identitas Klinik</h3>
            
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              {/* Logo Section */}
              <div style={{ width: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', alignSelf: 'flex-start' }}>Logo Klinik</p>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '12px', border: '2px dashed var(--border)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', 
                  backgroundColor: 'var(--bg-card)' 
                }}>
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <ImageIcon size={40} color="var(--border-light)" />
                  )}
                </div>
                <input 
                  type="file" accept="image/png, image/jpeg" 
                  ref={logoInputRef} style={{ display: 'none' }} 
                  onChange={(e) => handleFileUpload(e, 'logo')} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
                  <button 
                    onClick={() => logoInputRef.current.click()}
                    style={{ width: '100%', padding: '0.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <Upload size={14} /> Pilih Logo
                  </button>
                  {formData.logo && formData.logo !== '/logo.png' && (
                    <button 
                      onClick={() => handleChange('logo', '/logo.png')}
                      style={{ width: '100%', padding: '0.4rem', backgroundColor: 'transparent', border: '1px dashed var(--border)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer' }}>
                      Reset ke PNG Default
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Format: PNG (Transparan disarankan)<br/>Maks. 2MB</p>
              </div>
              
              {/* Form Section */}
              <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  <InputField label="Nama Yayasan / Instansi Induk" value={formData.yayasanName} onChange={(e) => handleChange('yayasanName', e.target.value)} />
                  <InputField label="Nama Klinik / Instansi" value={formData.clinicName} onChange={(e) => handleChange('clinicName', e.target.value)} />
                  <InputField label="No. Telepon" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                  <InputField label="Nama Pimpinan / Direktur" value={formData.directorName} onChange={(e) => handleChange('directorName', e.target.value)} />
                  <InputField label="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>Alamat Lengkap</label>
                  <textarea 
                    value={formData.address || ''} 
                    onChange={(e) => handleChange('address', e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', minHeight: '80px' }} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  <InputField label="Website" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
                  <InputField label="SERTIFIKAT STANDAR" value={formData.nib} onChange={(e) => handleChange('nib', e.target.value)} />
                  <InputField label="Kode / Identitas Klinik" value={formData.clinicCode} onChange={(e) => handleChange('clinicCode', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DOKUMEN (Includes Kop & TTD) */}
        {activeTab === 'dokumen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--text-dark)', fontSize: '1.05rem' }}>Pengaturan Ukuran Kertas</h3>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>Ukuran Kertas</label>
                  <select value={formData.paperSize || 'A4'} onChange={(e) => handleChange('paperSize', e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', fontSize: '0.85rem', outline: 'none' }}>
                    <option value="A4">A4 (21 x 29.7 cm)</option>
                    <option value="F4">F4 (21.5 x 33 cm)</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>Orientasi</label>
                  <select value={formData.paperOrientation || 'Portrait'} onChange={(e) => handleChange('paperOrientation', e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', fontSize: '0.85rem', outline: 'none' }}>
                    <option value="Portrait">Portrait</option>
                    <option value="Landscape">Landscape</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--text-dark)', fontSize: '1.05rem' }}>Kop Surat & Tanda Tangan</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <FileUploadRow 
                  title="Logo Kop Surat" 
                  desc="Upload logo resmi untuk Kop Surat" 
                  image={formData.logo} 
                  inputRef={kopInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'logo')} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                  <h4 style={{ margin: '0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>Edit Data Kop Surat</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <InputField label="Nama Yayasan / Induk" value={formData.yayasanName} onChange={(e) => handleChange('yayasanName', e.target.value)} />
                    <InputField label="Nama Klinik" value={formData.clinicName} onChange={(e) => handleChange('clinicName', e.target.value)} />
                    <InputField label="SERTIFIKAT STANDAR" value={formData.nib} onChange={(e) => handleChange('nib', e.target.value)} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>Alamat Lengkap</label>
                    <textarea 
                      value={formData.address || ''} 
                      onChange={(e) => handleChange('address', e.target.value)}
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', minHeight: '60px' }} 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <InputField label="No. Telepon / HP" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    <InputField label="Email Klinik" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} />
                  </div>
                </div>
                <FileUploadRow 
                  title="Tanda Tangan Pimpinan" 
                  desc={formData.directorName || "Pimpinan Klinik"} 
                  image={formData.signature} 
                  inputRef={ttdInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'signature')} 
                />
                <FileUploadRow 
                  title="Stempel Klinik" 
                  desc="Upload stempel resmi klinik (PNG Transparan disarankan)" 
                  image={formData.stamp} 
                  inputRef={capInputRef} 
                  onUpload={(e) => handleFileUpload(e, 'stamp')} 
                  round
                />
                
                <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', backgroundColor: 'var(--bg-card)' }}>
                  <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>Preview Kop Surat Standard</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.5rem', marginBottom: '2px' }}>
                    <img src={formData.logo || "/logo.png"} alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px', objectFit: 'contain' }} />
                    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ margin: '0 0 1px 0', fontSize: '0.85rem', fontWeight: 500, color: '#000' }}>{formData.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                      <h4 style={{ margin: '0 0 3px 0', fontSize: '1.45rem', fontWeight: 800, textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{formData.clinicName || 'KLINIK BAITURRAHMAN'}</h4>
                      <p style={{ margin: '0 0 1px 0', fontSize: '0.85rem', fontWeight: 400, color: '#000' }}>{(() => { const v = formData.nib || '91203004416170002'; return v.toUpperCase().startsWith('SERTIFIKAT STANDAR') ? v : (v.toUpperCase().startsWith('NO') ? `SERTIFIKAT STANDAR ${v}` : `SERTIFIKAT STANDAR : ${v}`); })()}</p>
                      <p style={{ margin: '0 0 1px 0', fontSize: '0.78rem', color: '#000' }}>
                        {(() => {
                          const addr = (formData.address || 'Jl. Merdeka No. 217, Tarogong Kidul-Garut').replace(/,+$/, '').trim();
                          const ph = (formData.phone || 'Telp. (0262) 234754, HP. 0813-2124-3303').trim();
                          return ph ? `${addr}, ${ph}` : addr;
                        })()}
                      </p>
                      <p style={{ margin: '0', fontSize: '0.75rem', fontStyle: 'italic', color: '#000' }}>Email: <span style={{ textDecoration: 'underline' }}>{formData.email || 'klinikbaiturrahman@rocketmail.com'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SURAT & PENOMORAN */}
        {activeTab === 'surat' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '1.05rem' }}>Format Penomoran Otomatis</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Gunakan placeholder berikut untuk format otomatis: <strong style={{ color: 'var(--primary)'}}>{'{NO}'}</strong> (Nomor urut), <strong style={{ color: 'var(--primary)'}}>{'{BULAN_ROMAWI}'}</strong> (Bulan dalam Romawi), <strong style={{ color: 'var(--primary)'}}>{'{TAHUN}'}</strong> (Tahun).</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <InputField label="Format Surat Umum (Keluar / Keterangan)" value={formData.numFormatLetter} onChange={(e) => handleChange('numFormatLetter', e.target.value)} />
              <InputField label="Format Sertifikat & Piagam" value={formData.numFormatCert} onChange={(e) => handleChange('numFormatCert', e.target.value)} />
              <InputField label="Format Barang Masuk (Gudang)" value={formData.numFormatIn} onChange={(e) => handleChange('numFormatIn', e.target.value)} />
              <InputField label="Format Barang Keluar (Gudang)" value={formData.numFormatOut} onChange={(e) => handleChange('numFormatOut', e.target.value)} />
              <InputField label="Format Peminjaman Barang" value={formData.numFormatBorrow} onChange={(e) => handleChange('numFormatBorrow', e.target.value)} />
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--primary-dark)' }}>Contoh Hasil:</h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-dark)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <li><strong>Surat Umum:</strong> {formData.numFormatLetter ? formData.numFormatLetter.replace('{NO}', '001').replace('{BULAN_ROMAWI}', 'VIII').replace('{TAHUN}', new Date().getFullYear()) : ''}</li>
                <li><strong>Sertifikat:</strong> {formData.numFormatCert ? formData.numFormatCert.replace('{NO}', '005').replace('{BULAN_ROMAWI}', 'VIII').replace('{TAHUN}', new Date().getFullYear()) : ''}</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: BACKUP */}
        {activeTab === 'backup' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-dark)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} color="var(--primary)" /> Backup & Pemulihan Data
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Amankan data sistem Anda dengan melakukan pencadangan secara berkala.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              
              {/* Export Data */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px' }}>
                    <Upload size={20} color="var(--primary)" style={{ transform: 'rotate(180deg)' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Export Database</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Format .json</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Unduh seluruh data sistem (Inventaris, Surat, Pengaturan) ke perangkat Anda sebagai cadangan.</p>
                <button 
                  onClick={handleExportData}
                  style={{ marginTop: 'auto', padding: '0.6rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Upload size={16} style={{ transform: 'rotate(180deg)' }} /> Unduh Cadangan Data
                </button>
              </div>

              {/* Import Data */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                    <Upload size={20} color="#ef4444" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Pulihkan Data</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload file .json</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pulihkan data dari file cadangan sebelumnya. Perhatian: Proses ini akan menimpa data saat ini.</p>
                <input 
                  type="file" 
                  accept=".json" 
                  style={{ display: 'none' }} 
                  ref={backupInputRef} 
                  onChange={handleImportData} 
                />
                <button 
                  onClick={() => backupInputRef.current.click()}
                  style={{ marginTop: 'auto', padding: '0.6rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Upload size={16} /> Pilih File Cadangan
                </button>
              </div>

              {/* Reset to Demo Data */}
              <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px' }}>
                    <RefreshCw size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Muat Data Contoh (Demo)</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Surat, Sertifikat, Aset & Gudang</span>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Isi kembali sistem dengan data contoh lengkap (Surat Keluar/Masuk, Sertifikat Magang, Inventaris Gudang, dan Aset Tetap).</p>
                <button 
                  onClick={() => {
                    openConfirm("Apakah Anda yakin ingin memuat ulang seluruh data contoh bawaan sistem? Data Surat, Sertifikat, Gudang, dan Aset akan diisi dengan data demo.", () => {
                      db.resetToDemoData();
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    });
                  }}
                  style={{ marginTop: 'auto', padding: '0.6rem', backgroundColor: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <RefreshCw size={16} /> Muat Ulang Data Contoh
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: ARSIP */}
        {activeTab === 'arsip' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, margin: '0 0 1.25rem 0', color: 'var(--text-dark)', fontSize: '1.05rem' }}>Pengaturan Arsip Digital</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Batas Maksimal Ukuran File (MB)</label>
                <select value={formData.maxFileSize || '10'} onChange={(e) => handleChange('maxFileSize', e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.85rem', outline: 'none' }}>
                  <option value="5">5 MB</option>
                  <option value="10">10 MB</option>
                  <option value="25">25 MB</option>
                  <option value="50">50 MB</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)' }}>Otomatis Pindahkan ke Sampah</label>
                <select value={formData.autoDelete || 'never'} onChange={(e) => handleChange('autoDelete', e.target.value)} style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.85rem', outline: 'none' }}>
                  <option value="never">Tidak Pernah (Simpan Selamanya)</option>
                  <option value="1_year">Setelah 1 Tahun</option>
                  <option value="3_years">Setelah 3 Tahun</option>
                  <option value="5_years">Setelah 5 Tahun</option>
                </select>
              </div>
              <InputField label="Format Tambahan yang Diizinkan (Koma)" value={formData.allowedFormats || 'pdf, docx, xlsx, zip'} onChange={(e) => handleChange('allowedFormats', e.target.value)} />
            </div>
          </div>
        )}

        {/* TAB: KEAMANAN */}
        {activeTab === 'keamanan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Ubah Password Form */}
            <form onSubmit={handleUpdatePassword} style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '10px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <KeyRound size={18} color="var(--primary)" /> Ubah Kata Sandi Akun
                  </h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Mengganti kata sandi untuk akun aktif: <strong style={{ color: 'var(--primary)' }}>{currentUser?.name || currentUser?.username || 'Administrator'}</strong>
                  </p>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '12px', backgroundColor: 'rgba(13, 148, 136, 0.1)', color: 'var(--primary)', fontWeight: 600 }}>
                  User: @{currentUser?.username || 'admin'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
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
                    backgroundColor: 'var(--primary)', color: '#fff',
                    padding: '0.6rem 1.25rem', borderRadius: '7px',
                    border: 'none', fontWeight: 600, fontSize: '0.85rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    cursor: 'pointer', boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Save size={16} /> Simpan Kata Sandi Baru
                </button>
              </div>
            </form>

            {/* Timeout Sesi */}
            <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-card)' }}>
              <div>
                <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>Timeout Sesi Inaktif</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logout otomatis jika tidak ada interaksi pada aplikasi</p>
              </div>
              <select value={formData.sessionTimeout || '30'} onChange={(e) => handleChange('sessionTimeout', e.target.value)} style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.85rem' }}>
                <option value="15">15 Menit</option>
                <option value="30">30 Menit</option>
                <option value="60">1 Jam</option>
                <option value="0">Jangan Pernah</option>
              </select>
            </div>


          </div>
        )}
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <div 
    onClick={onClick} 
    style={{ 
      background: active ? 'var(--bg-card)' : 'transparent', 
      borderRadius: '6px', 
      border: active ? '1px solid var(--border-light)' : '1px solid transparent',
      padding: '0 1rem', 
      height: '34px',
      color: active ? 'var(--primary)' : 'var(--text-muted)', 
      boxShadow: active ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
      fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap',
      transition: 'all 0.2s ease', flexShrink: 0, flex: 1,
      margin: 0,
      boxSizing: 'border-box'
    }}
  >
    <span style={{ 
      display: 'inline-flex', padding: '0.25rem', 
      backgroundColor: active ? 'var(--primary-light)' : 'transparent', 
      borderRadius: '6px',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {icon}
    </span>
    <span style={{ display: 'inline-flex', alignItems: 'center', height: '100%', lineHeight: 1 }}>
      {label}
    </span>
  </div>
);

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>{label}</label>
    <input 
      type={type} 
      value={value || ''} 
      onChange={onChange}
      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s' }} 
      onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
      onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
);

const PasswordInputField = ({ label, value, onChange, show, onToggleShow, placeholder = "Masukkan kata sandi" }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.35rem' }}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input 
        type={show ? "text" : "password"}
        value={value || ''} 
        onChange={onChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: '0.6rem 2.4rem 0.6rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.2s' }} 
        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
      />
      <button 
        type="button" 
        onClick={onToggleShow} 
        style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const FileUploadRow = ({ title, desc, image, inputRef, onUpload, round }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
    <div style={{ 
      width: '100px', height: '60px', 
      border: '1px solid var(--border)', borderRadius: round ? '30px' : '6px', 
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      backgroundColor: 'var(--bg-card)' 
    }}>
      {image ? (
        <img src={image} alt={title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      ) : (
        <ImageIcon size={24} color="var(--border-light)" />
      )}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</p>
    </div>
    <input type="file" accept="image/png, image/jpeg" ref={inputRef} style={{ display: 'none' }} onChange={onUpload} />
    <button 
      onClick={() => inputRef.current.click()}
      style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <Upload size={14} /> Pilih File
    </button>
  </div>
);
