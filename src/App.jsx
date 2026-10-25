import React, { useState, useEffect, useRef, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { exportTableToCSV, exportTableToPDF, exportTableToWord } from './utils/exportUtils';
import { saveFileToStorage, getFileFromStorage, deleteFileFromStorage, dataURLtoBlob, viewFileBlob, downloadFileBlob } from './utils/fileStorage';

import { 
  initDB, db 
} from './db';
import {
  LayoutDashboard, Users, PiggyBank, HeartPulse, ShoppingCart, 
  Mail, FileText, Award, FolderArchive, FileBarChart2, 
  Warehouse, ClipboardList, LogOut, ChevronLeft, ChevronRight, ChevronDown,
  Search, Plus, Eye, Download, Printer, ShieldAlert, CheckCircle2,
  Trash2, Edit3, Settings, Bell, Clock, RefreshCw, Save,
  Wallet, Utensils, Store, Sun, Moon, Bookmark,
  File, FolderOpen, Shield, Database, Upload, Info, Lock,
  Calendar, Activity, CheckCircle, Inbox, Send, FileBadge, User, Key, EyeOff, FileDown, Image as ImageIcon, Briefcase, Edit, Menu, ArrowLeft, AlertCircle,
  ExternalLink, X, Sliders, MapPin, TrendingUp, Building2, Home, Folder,
  CircleDot, MinusCircle
} from 'lucide-react';
import InventarisGudang from './pages/InventarisGudang';
import DataAsetInventaris from './pages/DataAsetInventaris';
import MasterAset from './pages/MasterAset';
import RelokasiAset from './pages/RelokasiAset';
import LaporanAset from './pages/LaporanAset';
import SuratKeluar from './pages/SuratKeluar';
import PengaturanSistem from './pages/PengaturanSistem';
import { defaultUsers, defaultDirectorSignature, defaultClinicStamp, defaultSettings } from './defaultData';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import confetti from 'canvas-confetti';

// Initialization — async, terhubung ke server backend
initDB().then(() => {
  console.log('MEDIKARA DB ready');
}).catch(e => {
  console.warn('DB init warning:', e);
});

export const formatDateIndo = (dateStr, id = '') => {
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch {}
  }
  if (id && typeof id === 'string') {
    const parts = id.split('-');
    if (parts.length > 1) {
      const ts = parseInt(parts[1]);
      if (!isNaN(ts) && ts > 1000000000000) {
        return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
  }
  return '-';
};

const BreadcrumbHeader = ({ parent, current, onBack }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
    <button type="button" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.9rem' }}>
      <ArrowLeft size={16} /> Kembali
    </button>
    <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border)' }}></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 600 }}>
      {parent && (
        <>
          <span style={{ color: 'var(--text-muted)' }}>{parent}</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </>
      )}
      <span style={{ color: 'var(--primary)' }}>{current}</span>
    </div>
  </div>
);



// Master Data Klinik Baiturrahman
const letterTypes = [
  { name: "Surat Keputusan", code: "SKep" },
  { name: "Surat Keterangan", code: "SKet" },
  { name: "Surat Edaran", code: "SEd" },
  { name: "Surat Tugas", code: "ST" },
  { name: "Surat Kuasa", code: "SK" },
  { name: "Surat Peringatan", code: "SP" },
  { name: "Surat Ijin Kegiatan", code: "SIK" },
  { name: "Surat Perjanjian", code: "SPn" },
  { name: "Surat Undangan", code: "Und" },
  { name: "Surat Ketetapan", code: "STap" },
  { name: "Surat Perintah", code: "SPer" },
  { name: "Surat Tagihan", code: "STag" },
  { name: "Surat Pemberitahuan", code: "SPem" },
  { name: "Surat Balasan", code: "SBal" },
  { name: "Surat Permohonan", code: "SPm" },
  { name: "Surat Perjalanan Dinas", code: "SPD" },
  { name: "Surat Rekomendasi", code: "SRkm" },
  { name: "Surat Panggilan", code: "SPgl" },
  { name: "Surat Lain-lain", code: "SLL" },
  { name: "Memorandum", code: "Mem" },
  { name: "Nota Dinas", code: "Nd" },
  { name: "Pengumuman", code: "Peng" },
  { name: "Telaahan Staf", code: "TS" },
  { name: "Laporan", code: "Lap" },
  { name: "Berita Acara", code: "BA" },
  { name: "Notula", code: "Ntl" },
  { name: "Daftar Hadir", code: "Dh" },
  { name: "Disposisi Surat", code: "Disp" },
  { name: "Sertifikat", code: "Stk" },
  { name: "Piagam", code: "Pgm" },
  { name: "SOP", code: "SOP" },
  { name: "Kerangka Acuan Kegiatan (KAK)", code: "KAK" },
  { name: "Pedoman", code: "Pdm" },
  { name: "Surat Biasa", code: "SB" },
];

const unitCodes = [
  { name: "Direktur", code: "01-10.0" },
  { name: "Manager Adum dan Keuangan", code: "02-11.0" },
  { name: "Manager Pelayanan", code: "02-12.0" },
  { name: "Ketua Komite Medik", code: "02-13.0" },
  { name: "Ketua Komite Perawat", code: "02-14.0" },
  { name: "Asisten Manager Adum Dan Kerumah Tanggaan", code: "03-11.0" },
  { name: "Asisten Manager SDM", code: "03-12.0" },
  { name: "Asisten Manager Keuangan", code: "03-13.0" },
  { name: "Asisten Manager Instalasi Farmasi", code: "03-21.0" },
  { name: "Asisten Manager Pelayanan Medis", code: "03-22.0" },
  { name: "Asisten Manager Penunjang Medis", code: "03-23.0" },
  { name: "Asisten Manager Keperawatan", code: "03-24.0" },
  { name: "Kasi Adum dan Kerumah Tanggaan", code: "04-11.1" },
  { name: "Kasi Data dan SIM", code: "04-11.2" },
  { name: "Kasi SDM", code: "04-12.1" },
  { name: "Kasi Humas dan Hukum", code: "04-12.2" },
  { name: "Kasi Anggaran Dan Perbendaharaan", code: "04-13.1" },
  { name: "Kasi Akuntansi Dan Perpajakan", code: "04-13.2" },
  { name: "Kasi Pelayanan Apotek Dan Administrasi", code: "04-21.1" },
  { name: "Kasi Perbekalan Farmasi", code: "04-21.2" },
  { name: "Kasi Pelayanan IGD", code: "04-22.1" },
  { name: "Kasi Pelayanan Rawat Jalan", code: "04-22.2" },
  { name: "Kasi Pelayanan Rawat Inap", code: "04-22.3" },
  { name: "Kasi Pelayanan KIA", code: "04-22.4" },
  { name: "Kasi Pelayanan Laboratorium", code: "04-23.1" },
  { name: "Kasi Pelayanan Rontgen", code: "04-23.2" },
  { name: "Kasi Pelayanan Gizi", code: "04-23.3" },
  { name: "Kasi Pelayanan Rekam Medik", code: "04-23.4" },
  { name: "Kasi Pelayanan Asuhan Keperawatan", code: "04-24.1" },
  { name: "Kasi Pelayanan Home Care", code: "04-24.2" }
];

function toRoman(num) {
  const roman = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[num] || "";
}

function generateSuratNumber(sequence, typeCode, unitCode, dateStr) {
  if (!typeCode || !unitCode || !dateStr) return "";
  const d = new Date(dateStr);
  const monthRoman = toRoman(d.getMonth() + 1);
  const year = d.getFullYear();
  const seqStr = String(sequence).padStart(3, '0');
  return `${seqStr}/${typeCode}/${unitCode}/${monthRoman}/K-BTR/${year}`;
}

export function getTemplateData(typeCode) {
  switch (typeCode) {
    case "SKep": return { 
      subject: "Keputusan Direktur", 
      content: "Menimbang:\na. Bahwa untuk kelancaran pelayanan, diperlukan pengangkatan pegawai yang memenuhi syarat.\nb. Bahwa yang bersangkutan telah memenuhi persyaratan yang ditetapkan.\n\nMengingat:\n1. UU No. 36 Tahun 2009 tentang Kesehatan.\n2. Permenkes No. 9 Tahun 2014 tentang Klinik.\n\nMEMUTUSKAN\nMenetapkan:\nKESATU: Mengangkat Sdr/i .............. sebagai .............. terhitung mulai ................\nKEDUA: Segala biaya dibebankan pada anggaran Klinik Baiturrahman.\nKETIGA: Keputusan ini berlaku sejak tanggal ditetapkan." 
    };
    
    case "SKet": return { 
      subject: "Surat Keterangan", 
      content: "Yang bertandatangan dibawah ini :\n\na. Nama          : \nb. Jabatan       : \n\ndengan ini menerangkan bahwa :\n\na. Nama          : \nb. Jabatan       : \n\nSurat keterangan ini diberikan untuk keperluan .......................................................................... dengan harapan pihak yang berwenang dapat .......................................................................... dan surat ini dapat dipergunakan seperlunya." 
    };
    
    case "SEd": return { 
      subject: "Surat Edaran", 
      content: "Dengan hormat,\nSehubungan dengan .............., dengan ini disampaikan hal-hal berikut:\n1. ..............\n2. ..............\nDemikian surat edaran ini disampaikan untuk dipedomani dan dilaksanakan." 
    };
    
    case "ST": return { 
      subject: "Surat Tugas", 
      content: "Direktur Klinik Baiturrahman menugaskan:\nNama: \nNIP/NIK: \nJabatan: \n\nUntuk: ..............\nWaktu: \nTempat: \n\nDemikian surat tugas ini diberikan untuk dilaksanakan dengan penuh tanggung jawab." 
    };
    
    case "SK": return { 
      subject: "Surat Kuasa", 
      content: "Pemberi Kuasa:\nNama: \nNIK: \n\nMemberikan kuasa kepada:\nNama: \nNIK: \n\nUntuk mengambil .............. milik Pemberi Kuasa serta menandatangani dokumen terkait.\nDemikian surat kuasa ini dibuat untuk dipergunakan sebagaimana mestinya." 
    };
    
    case "SP": return { 
      subject: "Surat Peringatan", 
      content: "Surat Peringatan ke-... diberikan kepada:\nNama: \nNIK: \nJabatan: \n\nSehubungan dengan pelanggaran .............. pada .............. Apabila mengulangi pelanggaran, akan dikenakan sanksi lebih berat.\nDemikian surat peringatan ini disampaikan." 
    };

    case "SIK": return { 
      subject: "Surat Ijin Kegiatan", 
      content: "Berdasarkan permohonan dari .............., diberikan ijin kegiatan:\nKegiatan: \nWaktu: \nTempat: \n\nKetentuan: Tidak mengganggu operasional klinik dan penyelenggara bertanggung jawab atas ketertiban.\nDemikian surat ijin ini diberikan." 
    };

    case "SPn": return { 
      subject: "Surat Perjanjian Kerjasama", 
      content: "Pada hari ini, .............., PIHAK PERTAMA (..............) dan PIHAK KEDUA (..............) sepakat mengadakan perjanjian kerjasama mengenai .............. dengan ketentuan:\n\nPASAL 1: RUANG LINGKUP\n..............\n\nPASAL 2: JANGKA WAKTU\nBerlaku sejak .............. s.d. ..............\n\nDemikian perjanjian ini dibuat rangkap 2 (dua)." 
    };

    case "Und": return { 
      subject: "Surat Undangan Rapat", 
      content: "Dengan hormat,\nDengan ini mengundang Bapak/Ibu untuk hadir pada:\nHari/Tanggal: \nWaktu: \nTempat: Ruang Rapat Klinik Baiturrahman\nAgenda: ..............\n\nAtas perhatian dan kehadirannya kami ucapkan terima kasih." 
    };

    case "STap": return { 
      subject: "Surat Ketetapan", 
      content: "Berdasarkan Rapat Pimpinan tanggal .............., ditetapkan:\nPERTAMA: Menetapkan .............. terlampir.\nKEDUA: Berlaku efektif sejak ..............\nKETIGA: Ketetapan ini berlaku sejak tanggal ditetapkan.\nDemikian untuk dilaksanakan sebagaimana mestinya." 
    };

    case "SPer": return { 
      subject: "Surat Perintah", 
      content: "Diperintahkan kepada:\nNama: \nJabatan: \n\nUntuk melaksanakan tugas: ..............\nWaktu: ..............\n\nHasil pelaksanaan dilaporkan maksimal 1x24 jam setelah selesai. Demikian untuk dilaksanakan dengan penuh tanggung jawab." 
    };

    case "STag": return { 
      subject: "Surat Tagihan", 
      content: "Dengan hormat,\nBersama ini kami sampaikan tagihan pelayanan kesehatan periode ..............\nNo. Invoice: \nTotal Tagihan: Rp ..............\n\nPembayaran mohon ditransfer ke Bank: .............., No. Rekening: .............., Atas Nama: Klinik Baiturrahman selambatnya tanggal ..............\nAtas kerjasamanya kami ucapkan terima kasih." 
    };

    case "SPem": return { 
      subject: "Surat Pemberitahuan", 
      content: "Dengan hormat,\nDiberitahukan bahwa ..............\nRincian:\n1. ..............\n2. ..............\n\nDemikian pemberitahuan ini disampaikan. Atas perhatiannya kami ucapkan terima kasih." 
    };

    case "SBal": return { 
      subject: "Surat Balasan", 
      content: "Dengan hormat,\nMembalas surat Nomor .............. tanggal .............. perihal .............., dengan ini kami sampaikan bahwa:\n..............\n\nDemikian surat balasan ini disampaikan. Atas perhatiannya diucapkan terima kasih." 
    };

    case "SPm": return { 
      subject: "Surat Permohonan", 
      content: "Dengan hormat,\nBersama ini kami mengajukan permohonan .............. sehubungan dengan ..............\nWaktu: \nTempat: \n\nSebagai bahan pertimbangan, terlampir proposal kegiatan. Atas kebijaksanaan Bapak/Ibu kami ucapkan terima kasih." 
    };

    case "SPD": return { 
      subject: "Surat Perjalanan Dinas", 
      content: "Berdasarkan Surat Tugas Nomor: ..............\nNama: \nNIP: \nJabatan: \n\nMaksud: ..............\nTujuan: \nBerangkat: \nKembali: \n\nBiaya dibebankan pada anggaran Klinik Baiturrahman. Demikian untuk dilaksanakan." 
    };

    case "SRkm": return { 
      subject: "Surat Rekomendasi", 
      content: "Direktur Klinik Baiturrahman memberikan rekomendasi kepada:\nNama: \nNIP: \nJabatan: \n\nUntuk mengikuti ..............\nYang bersangkutan memiliki dedikasi dan kinerja yang baik.\nDemikian surat rekomendasi ini dibuat untuk dipergunakan sebagaimana mestinya." 
    };

    case "SPgl": return { 
      subject: "Surat Panggilan", 
      content: "Dengan hormat,\nMeminta kehadiran Saudara/i:\nNama: \nJabatan: \n\nUntuk menghadap pada:\nWaktu: \nTempat: \nKeperluan: ..............\n\nDemikian surat panggilan ini disampaikan. Atas perhatiannya diucapkan terima kasih." 
    };

    case "SLL": return { 
      subject: "Surat Lain-lain", 
      content: "Dengan hormat,\nBersama ini kami sampaikan hal-hal berikut:\n1. ..............\n2. ..............\n\nDemikian untuk dapat ditindaklanjuti. Atas perhatiannya kami ucapkan terima kasih." 
    };

    case "Mem": return { 
      subject: "Memorandum Internal", 
      content: "Kepada: \nDari: \nPerihal: \n\nDiinstruksikan hal-hal berikut:\n1. ..............\n2. ..............\n\nMemorandum ini bersifat segera. Demikian untuk dilaksanakan dengan penuh tanggung jawab." 
    };

    case "Nd": return { 
      subject: "Nota Dinas", 
      content: "Kepada Yth.: Direktur Klinik Baiturrahman\nDari: \nPerihal: \nSifat: \n\nDiajukan permohonan pengadaan:\n1. .............. - .............. unit - Rp ..............\n2. .............. - .............. unit - Rp ..............\nTotal: Rp ..............\n\nDemikian nota dinas ini disampaikan atas persetujuannya diucapkan terima kasih." 
    };

    case "Peng": return { 
      subject: "Pengumuman", 
      content: "Diberitahukan kepada seluruh Karyawan dan Staf Klinik Baiturrahman bahwa:\n1. ..............\n2. ..............\n\nDemikian pengumuman ini disampaikan agar menjadi maklum.\nKlinik Baiturrahman" 
    };

    case "BA": return { 
      subject: "Berita Acara", 
      content: "Pada hari ini .............., bertempat di .............., telah dilakukan .............. dengan keterangan:\n\nPihak Pertama:\nNama: \n\nPihak Kedua:\nNama: \n\nTelah diserahterimakan: .............. sejumlah .............. dalam kondisi ..............\nDemikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya." 
    };

    case "Ntl": return { 
      subject: "Notula Rapat", 
      content: "Agenda: \nHari/Tanggal: \nWaktu: \nTempat: Klinik Baiturrahman\nPimpinan: \n\nHasil Pembahasan:\n1. ..............\n\nTindak Lanjut:\n1. ..............\nDemikian notula ini dibuat dengan sebenarnya." 
    };

    case "Dh": return { 
      subject: "Daftar Hadir", 
      content: "Kegiatan: \nHari/Tanggal: \nTempat: \n\n1. Nama: .............., TTD: ..............\n2. Nama: .............., TTD: ..............\n3. Nama: .............., TTD: ..............\n\nDaftar hadir ini dibuat sebagai bukti kehadiran." 
    };

    case "Stk": return { 
      subject: "Sertifikat", 
      content: "Diberikan kepada:\nNama: \nNIP/NIK: \n\nAtas partisipasinya sebagai Peserta/Panitia/Narasumber dalam .............. pada ..............\nSemoga bermanfaat dalam meningkatkan kualitas pelayanan kesehatan." 
    };

    case "Pgm": return { 
      subject: "Piagam Penghargaan", 
      content: "Diberikan kepada:\nNama: \nJabatan: \n\nSebagai KARYAWAN TERBAIK Periode .............. atas dedikasi dan prestasi kerjanya.\nSemoga menjadi motivasi untuk terus memberikan pelayanan terbaik." 
    };

    case "SOP": return { 
      subject: "Standar Operasional Prosedur", 
      content: "Nomor: \nJudul SOP: \nRevisi: \n\n1. PENGERTIAN: ..............\n2. TUJUAN: ..............\n3. PROSEDUR: ..............\n4. UNIT TERKAIT: ..............\n\nDemikian SOP ini disahkan untuk dipedomani." 
    };

    case "SB": return {
      subject: "Surat Biasa",
      content: "....................................................................................\n....................................................................................\n..................................\n....................................................................................\n....................................................................................\n..................................\n....................................................................................\n..................................\nDemikian surat ini kami sampaikan atas perhatian dan kerja sama kami ucapkan terima kasih."
    };

    default: return { 
      subject: "Surat Pemberitahuan", 
      content: "Dengan hormat,\nBersama ini kami sampaikan hal-hal berikut:\n1. ..............\n2. ..............\n\nDemikian disampaikan. Atas perhatiannya kami ucapkan terima kasih." 
    };
  }
}


const renderFormattedContent = (content) => {
  if (!content) return null;
  return content.split('\n').map((line, idx) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 40 && !line.trim().endsWith('?')) {
      const key = line.substring(0, colonIdx).trim();
      const val = line.substring(colonIdx + 1).trim();
      if (key.length > 0 && key.length <= 35 && !key.includes('?')) {
        return (
          <div key={idx} style={{ display: 'flex', marginBottom: '0.15rem' }}>
            <div style={{ width: '130px', flexShrink: 0 }}>{key}</div>
            <div style={{ marginRight: '0.5rem' }}>:</div>
            <div style={{ flex: 1, whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{val || ' '}</div>
          </div>
        );
      }
    }
    return <div key={idx} style={{ marginBottom: '0.15rem', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{line === '' ? <br /> : line}</div>;
  });
};

export default function App() {
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  // Authentication states - Session-only (resets when browser is closed or laptop turned off)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      localStorage.removeItem("kbr_session");
      localStorage.removeItem("kbr_session_user");
      localStorage.removeItem("kbr_session_user_data");
    } catch (e) {}
    return sessionStorage.getItem("kbr_session") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const isSessionActive = sessionStorage.getItem("kbr_session") === "true";
      if (!isSessionActive) {
        return null;
      }
      const savedUserJson = sessionStorage.getItem("kbr_session_user_data");
      const savedUsername = (sessionStorage.getItem("kbr_session_user") || "").toLowerCase();
      
      let parsed = null;
      if (savedUserJson) {
        try { parsed = JSON.parse(savedUserJson); } catch (e) {}
      }

      if (parsed) {
        if (parsed.username === "direktur") {
          return {
            id: "usr-001",
            username: "admin",
            password: "admin",
            name: "Admin",
            role: "Administrator",
            department: "Unit IT",
            email: "kbaiturrahmangarut@gmail.com",
            avatarColor: "#0d9488"
          };
        }
        return parsed;
      }

      if (savedUsername) {
        const users = db.get("users") || defaultUsers;
        const found = users.find(u => u.username && u.username.toLowerCase() === savedUsername);
        if (found) return found;
      }
    } catch (e) {
      console.warn("User session load error:", e);
    }
    return null;
  });

  useEffect(() => {
    if (currentUser?.username === "direktur" || currentUser?.role === "Direktur Utama") {
      const users = db.get("users") || defaultUsers;
      const savedAdmin = users.find(u => u.username && u.username.toLowerCase() === "admin") || defaultUsers[0];
      const adminUser = {
        id: "usr-001",
        username: "admin",
        password: savedAdmin?.password || "admin",
        name: "Admin",
        role: "Administrator",
        department: "Unit IT",
        email: "kbaiturrahmangarut@gmail.com",
        avatarColor: "#0d9488"
      };
      setCurrentUser(adminUser);
      sessionStorage.setItem("kbr_session", "true");
      sessionStorage.setItem("kbr_session_user", "admin");
      sessionStorage.setItem("kbr_session_user_data", JSON.stringify(adminUser));
    }
  }, [currentUser]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Navigation states
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [heroSlide, setHeroSlide] = useState(0); // 0 = welcome banner, 1 = clinic photo
  const [dashboardRange, setDashboardRange] = useState("7d"); // "7d" | "30d" | "3m"
  const [dashboardChartTab, setDashboardChartTab] = useState("surat"); // "surat" | "stok" | "aset"
  const [dashboardTimeFilter, setDashboardTimeFilter] = useState("tahun_ini"); // "6_bulan" | "12_bulan" | "tahun_ini"
  const [assetReportTab, setAssetReportTab] = useState("all_assets"); // "all_assets" | "with_images" | "by_type"
  const [activeSettingsTab, setActiveSettingsTab] = useState("profil");
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSuratNavPopup, setShowSuratNavPopup] = useState(false);

  // Scroll-to-arsip state & refs
  const [scrollToSection, setScrollToSection] = useState(null);
  const arsipSuratMasukRef = useRef(null);
  const arsipSuratKeluarRef = useRef(null);
  const arsipAsetRef = useRef(null);

  useEffect(() => {
    if (!scrollToSection) return;
    const timer = setTimeout(() => {
      let ref = null;
      if (scrollToSection === 'arsip_surat_masuk') ref = arsipSuratMasukRef;
      else if (scrollToSection === 'arsip_surat_keluar') ref = arsipSuratKeluarRef;
      else if (scrollToSection === 'arsip_aset') ref = arsipAsetRef;
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setScrollToSection(null);
    }, 150);
    return () => clearTimeout(timer);
  }, [scrollToSection, activeMenu]);

  // Reset scroll to top on menu navigation
  useEffect(() => {
    document.getElementById('main-content-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeMenu]);
  
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem("kbr_theme") || "light");

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("kbr_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  // Auto-rotate hero banner every 5 seconds when on dashboard
  useEffect(() => {
    if (activeMenu !== 'dashboard') return;
    const timer = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeMenu]);

  // Global Search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [openSystems, setOpenSystems] = useState({
    surat: true,
    gudang: false,
    fixed_asset: false
  });

  const toggleSystem = (sys) => {
    setOpenSystems(prev => ({ ...prev, [sys]: !prev[sys] }));
  };

  // DB States
  const [settings, setSettings] = useState(() => db.get("settings"));

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Custom Confirm Modal State
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: "", onConfirm: null });

  // Pull-to-Refresh State for Mobile
  const [pullDistance, setPullDistance] = useState(0);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = (e) => {
    const mainEl = document.getElementById('main-content-scroll');
    if (mainEl && mainEl.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current) return;
    const mainEl = document.getElementById('main-content-scroll');
    if (mainEl && mainEl.scrollTop > 0) {
      isPulling.current = false;
      setPullDistance(0);
      return;
    }
    const currentY = e.touches[0].clientY;
    const dist = currentY - touchStartY.current;
    if (dist > 0) {
      const pull = Math.min(dist * 0.45, 80);
      setPullDistance(pull);
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 45) {
      setIsPullRefreshing(true);
      setPullDistance(50);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      setPullDistance(0);
    }
    isPulling.current = false;
  };

  const openConfirm = (message, onConfirm) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  useEffect(() => {
    const handleToast = (e) => {
      setToast({ show: true, message: e.detail.message, type: e.detail.type || 'success' });
      setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
    };
    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  useEffect(() => {
    const handleSaveLog = (e) => {
      db.addLog(e.detail.action, e.detail.module, e.detail.details);
      setActivityLogs(db.get("activity_logs"));
    };
    window.addEventListener('app-save-log', handleSaveLog);
    return () => window.removeEventListener('app-save-log', handleSaveLog);
  }, []);

  useEffect(() => {
    const handleDbSync = (e) => {
      const key = e?.detail?.key;
      if (!key || key === '__all__' || key === 'settings') setSettings(db.get("settings"));
      if (!key || key === '__all__' || key === 'incoming_letters') setIncomingLetters(db.get("incoming_letters") || []);
      if (!key || key === '__all__' || key === 'outgoing_letters') setOutgoingLetters(db.get("outgoing_letters") || []);
      if (!key || key === '__all__' || key === 'certificates') setCertificates(db.get("certificates") || []);
      if (!key || key === '__all__' || key === 'warehouse_items') setWarehouseItems(db.get("warehouse_items") || []);
      if (!key || key === '__all__' || key === 'stock_in') setStockInList(db.get("stock_in") || []);
      if (!key || key === '__all__' || key === 'stock_out') setStockOutList(db.get("stock_out") || []);
      if (!key || key === '__all__' || key === 'borrowings') setBorrowings(db.get("borrowings") || []);
      if (!key || key === '__all__' || key === 'inventory') setInventoryList(db.get("inventory") || []);
      if (!key || key === '__all__' || key === 'assets_inventaris') setAssetsInventaris(db.get("assets_inventaris") || []);
      if (!key || key === '__all__' || key === 'asset_types') setAssetTypes(db.get("asset_types") || []);
      if (!key || key === '__all__' || key === 'asset_locations') setAssetLocations(db.get("asset_locations") || []);
      if (!key || key === '__all__' || key === 'asset_units') setAssetUnits(db.get("asset_units") || []);
      if (!key || key === '__all__' || key === 'asset_relocations') setAssetRelocations(db.get("asset_relocations") || []);
      if (!key || key === '__all__' || key === 'asset_opnames') setAssetOpnames(db.get("asset_opnames") || []);
      if (!key || key === '__all__' || key === 'activity_logs') setActivityLogs(db.get("activity_logs") || []);
      if (!key || key === '__all__' || key === 'digital_archive') setDigitalArchive(db.get("digital_archive") || []);
    };
    window.addEventListener('app-db-sync', handleDbSync);
    window.addEventListener('app-db-refresh', handleDbSync);
    return () => {
      window.removeEventListener('app-db-sync', handleDbSync);
      window.removeEventListener('app-db-refresh', handleDbSync);
    };
  }, []);

  useEffect(() => {
    // Sinkronkan data dari cloud saat App mount
    initDB().then(() => {
      setSettings(db.get("settings"));
      setIncomingLetters(db.get("incoming_letters") || []);
      setOutgoingLetters(db.get("outgoing_letters") || []);
      setCertificates(db.get("certificates") || []);
      setWarehouseItems(db.get("warehouse_items") || []);
      setAssetsInventaris(db.get("assets_inventaris") || []);
      setDigitalArchive(db.get("digital_archive") || []);
    });

    const handleWindowFocus = () => {
      initDB().then(() => {
        setSettings(db.get("settings"));
        setOutgoingLetters(db.get("outgoing_letters") || []);
      });
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, []);

  useEffect(() => {
    // Pastikan seluruh properti default (terutama signature dan stamp) lengkap pada state UI
    if (!settings || !settings.clinicName || !settings.signature || !settings.stamp) {
      const fullSettings = {
        ...defaultSettings,
        ...(settings || {}),
        signature: settings?.signature || defaultDirectorSignature,
        stamp: settings?.stamp || defaultClinicStamp,
        logo: settings?.logo || defaultSettings.logo || "/logo.png"
      };
      setSettings(fullSettings);
    }
  }, [settings]);

  const handleSaveSettings = (newSettings) => {
    // Cek apakah ada request ganti password
    if (newSettings.oldPassword || newSettings.newPassword || newSettings.confirmPassword) {
      if (newSettings.newPassword !== newSettings.confirmPassword) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi baru dan konfirmasi tidak cocok!", type: 'error' } }));
        return; // Batal simpan
      }
      
      const sessionUsername = (currentUser?.username || sessionStorage.getItem("kbr_session_user") || "admin").toLowerCase();
      const users = db.get("users") || defaultUsers;
      const userIndex = users.findIndex(u => u.username && u.username.toLowerCase() === sessionUsername);
      
      // Validasi password lama
      let oldIsCorrect = false;
      if (userIndex !== -1) {
        const currentPass = users[userIndex].password || (sessionUsername === "admin" ? "admin" : "");
        if (currentPass === newSettings.oldPassword) {
          oldIsCorrect = true;
        }
      } else if (sessionUsername === "admin" && newSettings.oldPassword === "admin") {
        oldIsCorrect = true;
      }

      if (!oldIsCorrect) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi lama yang Anda masukkan salah!", type: 'error' } }));
        return; // Batal simpan
      }

      // Simpan password baru
      let updatedUsers = [...users];
      if (userIndex !== -1) {
        updatedUsers[userIndex] = { ...updatedUsers[userIndex], password: newSettings.newPassword };
      } else {
        updatedUsers.push({ id: `usr-${Date.now()}`, username: sessionUsername, password: newSettings.newPassword, name: sessionUsername, role: 'Pengguna' });
      }
      db.set("users", updatedUsers);

      if (currentUser) {
        const updatedCurrent = { ...currentUser, password: newSettings.newPassword };
        setCurrentUser(updatedCurrent);
        sessionStorage.setItem("kbr_session_user_data", JSON.stringify(updatedCurrent));
      }

      db.addLog("Ubah Kata Sandi", "Keamanan", `Kata sandi akun [${sessionUsername}] berhasil diperbarui`);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Kata sandi berhasil diubah!", type: 'success' } }));
    }

    // Hapus field password agar tidak ikut masuk ke tabel pengaturan
    const finalSettings = {
      ...defaultSettings,
      ...settings,
      ...newSettings
    };
    delete finalSettings.oldPassword;
    delete finalSettings.newPassword;
    delete finalSettings.confirmPassword;

    setSettings(finalSettings);
    db.set("settings", finalSettings);
  };

  const [incomingLetters, setIncomingLetters] = useState(() => db.get("incoming_letters") || []);
  const [outgoingLetters, setOutgoingLetters] = useState(() => {
    const list = db.get("outgoing_letters") || [];
    return list.map(l => {
      if ((l.typeCode === "SKep" || l.templateType === "Surat Keputusan" || l.templateType === "SKep") && (!l.skData || l.skData.gunakanLampiran === undefined)) {
        return {
          ...l,
          skData: {
            ...(l.skData || {}),
            judulSK: l.skData?.judulSK || l.subject,
            noSK: l.skData?.noSK || l.docNo,
            gunakanLampiran: true
          }
        };
      }
      return l;
    });
  });
  const [certificates, setCertificates] = useState(() => db.get("certificates") || []);

  // ── Dynamic Dashboard Metrics & Chart Data (Aktivitas Surat) ──
  const activityChartData = useMemo(() => {
    const incoming = incomingLetters || [];
    const outgoing = outgoingLetters || [];

    const formatYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const parseLetterDateKey = (rawDate) => {
      if (!rawDate) return null;
      if (typeof rawDate === 'string' && rawDate.length >= 10 && rawDate.charAt(4) === '-' && rawDate.charAt(7) === '-') {
        return rawDate.slice(0, 10);
      }
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return null;
      return formatYMD(d);
    };

    const inMap = new Map();
    incoming.forEach(l => {
      const key = parseLetterDateKey(l.date || l.createdAt);
      if (key) inMap.set(key, (inMap.get(key) || 0) + 1);
    });

    const outMap = new Map();
    outgoing.forEach(l => {
      const key = parseLetterDateKey(l.date || l.createdAt);
      if (key) outMap.set(key, (outMap.get(key) || 0) + 1);
    });

    const indonesianMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const today = new Date();

    if (dashboardRange === '7d') {
      const result = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = formatYMD(d);
        const label = `${d.getDate()} ${indonesianMonths[d.getMonth()]}`;
        result.push({
          date: label,
          fullDate: key,
          Masuk: inMap.get(key) || 0,
          Keluar: outMap.get(key) || 0
        });
      }
      return result;
    }

    if (dashboardRange === '30d') {
      const result = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = formatYMD(d);
        const label = `${d.getDate()} ${indonesianMonths[d.getMonth()]}`;
        result.push({
          date: label,
          fullDate: key,
          Masuk: inMap.get(key) || 0,
          Keluar: outMap.get(key) || 0
        });
      }
      return result;
    }

    if (dashboardRange === '3m') {
      const result = [];
      const numWeeks = 12;
      for (let i = numWeeks - 1; i >= 0; i--) {
        const endD = new Date(today);
        endD.setDate(today.getDate() - (i * 7));
        const startD = new Date(today);
        startD.setDate(today.getDate() - ((i + 1) * 7 - 1));

        let sumMasuk = 0;
        let sumKeluar = 0;
        for (let cur = new Date(startD); cur <= endD; cur.setDate(cur.getDate() + 1)) {
          const key = formatYMD(cur);
          sumMasuk += inMap.get(key) || 0;
          sumKeluar += outMap.get(key) || 0;
        }

        const label = `${startD.getDate()} ${indonesianMonths[startD.getMonth()]}`;
        const rangeLabel = `${startD.getDate()} ${indonesianMonths[startD.getMonth()]} - ${endD.getDate()} ${indonesianMonths[endD.getMonth()]}`;
        result.push({
          date: label,
          rangeLabel,
          Masuk: sumMasuk,
          Keluar: sumKeluar
        });
      }
      return result;
    }

    return [];
  }, [incomingLetters, outgoingLetters, dashboardRange]);

  const maxChartValue = useMemo(() => {
    let max = 0;
    (activityChartData || []).forEach(d => {
      if (d.Masuk > max) max = d.Masuk;
      if (d.Keluar > max) max = d.Keluar;
    });
    return Math.max(max + 1, 5);
  }, [activityChartData]);

  // ── Dynamic Jenis Surat (Masuk vs Keluar) ──
  const letterTypeDistribution = useMemo(() => {
    const inCount = incomingLetters?.length || 0;
    const outCount = outgoingLetters?.length || 0;
    const total = inCount + outCount;
    const inPercent = total > 0 ? Math.round((inCount / total) * 100) : 0;
    const outPercent = total > 0 ? (100 - inPercent) : 0;
    return {
      total,
      inCount,
      outCount,
      inPercent,
      outPercent
    };
  }, [incomingLetters, outgoingLetters]);

  // ── Dynamic Kategori Surat (Breakdown by Category) ──
  const letterCategoriesDistribution = useMemo(() => {
    const outgoing = outgoingLetters || [];
    const incoming = incomingLetters || [];
    const total = (outgoing.length + incoming.length) || 1;

    const counts = {
      sop: 0,
      skep: 0,
      und: 0,
      st: 0,
      sket: 0,
      dinas: 0,
      lainnya: 0
    };

    outgoing.forEach(l => {
      const code = (l.typeCode || '').toUpperCase();
      const tName = (l.templateTypeName || l.templateType || '').toLowerCase();
      if (code === 'SOP' || tName.includes('sop') || tName.includes('operasional')) counts.sop++;
      else if (code === 'SKEP' || tName.includes('keputusan')) counts.skep++;
      else if (code === 'UND' || tName.includes('undangan')) counts.und++;
      else if (code === 'ST' || tName.includes('tugas')) counts.st++;
      else if (code === 'SKET' || tName.includes('keterangan')) counts.sket++;
      else if (code === 'SB' || tName.includes('biasa') || tName.includes('dinas')) counts.dinas++;
      else counts.lainnya++;
    });

    const list = [
      { label: 'Surat SOP', icon: FileBadge, count: counts.sop },
      { label: 'Surat Keputusan', icon: Building2, count: counts.skep },
      { label: 'Surat Undangan', icon: Mail, count: counts.und },
      { label: 'Surat Tugas', icon: FileText, count: counts.st },
      { label: 'Surat Keterangan', icon: ClipboardList, count: counts.sket },
      { label: 'Surat Dinas', icon: Send, count: counts.dinas },
      { label: 'Surat Masuk', icon: Inbox, count: incoming.length },
      { label: 'Lainnya', icon: FolderArchive, count: counts.lainnya }
    ]
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(item => ({
      ...item,
      percent: Math.round((item.count / total) * 100)
    }));

    if (list.length === 0) {
      return [
        { label: 'Belum Ada Surat', icon: FileText, count: 0, percent: 0 }
      ];
    }

    return list;
  }, [outgoingLetters, incomingLetters]);

  // Global search filtering logic (helper)
  const getSearchResults = () => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    let results = [];
    
    const menus = [
      { id: "dashboard", label: "Dashboard", category: "Menu" },
      { id: "letters_in", label: "Surat Masuk", category: "Menu" },
      { id: "letters_out", label: "Surat Keluar", category: "Menu" },
      { id: "certificates", label: "Sertifikat", category: "Menu" },
      { id: "archive", label: "Arsip Digital", category: "Menu" },
      { id: "warehouse", label: "Inventaris Barang Gudang", category: "Menu" },
      { id: "assets_inventaris", label: "Data Aset & Inventaris", category: "Menu" },
      { id: "requests", label: "Permintaan Keluar & Peminjaman", category: "Menu" },
      { id: "reports", label: "Laporan Bulanan", category: "Menu" },
      { id: "settings", label: "Pengaturan Sistem", category: "Menu" }
    ];
    menus.forEach(m => {
      if (m.label.toLowerCase().includes(q)) results.push({ ...m, type: "menu" });
    });

    (warehouseItems || []).forEach(item => {
      if (item?.name?.toLowerCase().includes(q) || item?.code?.toLowerCase().includes(q)) {
        results.push({ id: item.code, label: item.name, category: `Stok: ${item.currentStock || 0} ${item.unit || ''}`, type: "warehouse" });
      }
    });

    (incomingLetters || []).forEach(l => {
      if (l?.subject?.toLowerCase().includes(q) || l?.sender?.toLowerCase().includes(q)) {
        results.push({ id: l.id, label: l.subject, category: `Surat Masuk - ${l.sender || ''}`, type: "inbox" });
      }
    });
    
    (outgoingLetters || []).forEach(l => {
      if (l?.subject?.toLowerCase().includes(q) || l?.recipient?.toLowerCase().includes(q)) {
        results.push({ id: l.id, label: l.subject, category: `Surat Keluar - ${l.recipient || ''}`, type: "outbox" });
      }
    });

    (assetsInventaris || []).forEach(asset => {
      if (asset?.namaAset?.toLowerCase().includes(q) || asset?.id?.toLowerCase().includes(q)) {
        results.push({ id: asset.id, label: asset.namaAset, category: `Aset: ${asset.category || ''} (${asset.lokasi || ''})`, type: "assets_inventaris" });
      }
    });

    return results.slice(0, 8);
  };

  const handleSearchResultClick = (res) => {
    if (res.type === "menu") setActiveMenu(res.id);
    else if (res.type === "warehouse") setActiveMenu("warehouse");
    else if (res.type === "assets_inventaris") setActiveMenu("assets_inventaris");
    else if (res.type === "inbox") setActiveMenu("letters_in");
    else if (res.type === "outbox") setActiveMenu("letters_out");
    
    setGlobalSearchQuery("");
    setIsSearchFocused(false);
  };
  const [warehouseItems, setWarehouseItems] = useState(() => db.get("warehouse_items") || []);
  const [stockInList, setStockInList] = useState(() => db.get("stock_in") || []);
  const [stockOutList, setStockOutList] = useState(() => db.get("stock_out") || []);
  const [borrowings, setBorrowings] = useState(() => db.get("borrowings") || []);
  const [inventoryList, setInventoryList] = useState(() => db.get("inventory") || []);
  const [assetsInventaris, setAssetsInventaris] = useState(() => db.get("assets_inventaris") || []);
  const [assetTypes, setAssetTypes] = useState(() => db.get("asset_types") || []);
  const [assetLocations, setAssetLocations] = useState(() => db.get("asset_locations") || []);
  const [assetUnits, setAssetUnits] = useState(() => db.get("asset_units") || []);
  const [assetRelocations, setAssetRelocations] = useState(() => db.get("asset_relocations") || []);
  const [assetOpnames, setAssetOpnames] = useState(() => db.get("asset_opnames") || []);
  const [activityLogs, setActivityLogs] = useState(() => db.get("activity_logs") || []);



  // Digital Archive State & File Upload
  const [digitalArchive, setDigitalArchive] = useState(() => {
    const data = db.get("digital_archive");
    if (data && data.length > 0) {
      return data.filter(item => !['AR-2026-001', 'AR-2026-002', 'AR-2026-003', 'AR-2026-004'].includes(item.id));
    }
    return [
      { id: "AR-2023-001", docNo: "002/SKep/01-10.0/III/K-BTR/2023", title: "Pedoman Tata Naskah di Lingkungan Klinik Baiturrahman", category: "SOP & Regulasi", date: "2023-03-06", size: "3.45 MB", access: "Internal", fileName: "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf", notes: "Keputusan Direktur Klinik Baiturrahman No. 002/SKep/01-10.0/III/K-BTR/2023 tentang Pedoman Tata Naskah Dinas di Lingkungan Klinik Baiturrahman (dr. H. Asep Maryaman - NIK 1.21.1)" }
    ];
  });
  const [archiveForm, setArchiveForm] = useState({ 
    docNo: "", 
    title: "", 
    category: "Dokumen & Surat", 
    date: new Date().toISOString().split('T')[0], 
    access: "Internal",
    notes: "",
    fileData: null,
    fileName: "",
    fileSize: ""
  });
  const [inboxSearch, setInboxSearch] = useState("");
  const [archiveSearch, setArchiveSearch] = useState("");
  const [archiveCategoryFilter, setArchiveCategoryFilter] = useState("Semua");

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setArchiveForm(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        fileData: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleIncomingFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setIncomingForm(prev => ({
        ...prev,
        fileName: file.name,
        fileSize: `${sizeMb} MB`,
        fileData: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const [docViewerModal, setDocViewerModal] = useState({ isOpen: false, title: "", fileName: "", blobUrl: null, dataUrl: null });
  const [selectedIncomingDetail, setSelectedIncomingDetail] = useState(null);

  const handleViewArchiveDoc = async (item) => {
    let dataUrl = item.fileData;
    if (!dataUrl) {
      dataUrl = await getFileFromStorage(item.id);
    }
    if (dataUrl) {
      const blob = dataURLtoBlob(dataUrl);
      const blobUrl = blob ? URL.createObjectURL(blob) : dataUrl;
      setDocViewerModal({
        isOpen: true,
        title: item.title,
        fileName: item.fileName || `${item.title}.pdf`,
        blobUrl: blobUrl,
        dataUrl: dataUrl
      });
    } else if (item.fileName === "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf" || item.id === "AR-2023-001" || (item.title && item.title.includes("Tata Naskah"))) {
      const staticPdfUrl = "/Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf";
      setDocViewerModal({
        isOpen: true,
        title: item.title,
        fileName: "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf",
        blobUrl: staticPdfUrl,
        dataUrl: null
      });
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Berkas untuk "${item.title}" adalah data arsip bawaan. Silakan unggah dokumen PDF baru untuk pratinjau lengkap.`, type: 'info' } }));
    }
  };

  const handleDownloadArchiveDoc = async (item) => {
    let dataUrl = item.fileData;
    if (!dataUrl) {
      dataUrl = await getFileFromStorage(item.id);
    }
    if (dataUrl) {
      downloadFileBlob(dataUrl, item.fileName || `${item.title}.pdf`);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Memulai unduhan berkas: ${item.fileName || item.title}`, type: 'success' } }));
    } else if (item.fileName === "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf" || item.id === "AR-2023-001" || (item.title && item.title.includes("Tata Naskah"))) {
      const link = document.createElement('a');
      link.href = "/Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf";
      link.download = "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Memulai unduhan berkas Pedoman Tata Naskah`, type: 'success' } }));
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Berkas untuk "${item.title}" tidak ditemukan di memori browser.`, type: 'error' } }));
    }
  };

  const handleAddArchive = (e) => {
    e.preventDefault();
    if (!archiveForm.title) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Harap isi judul dokumen!", type: 'error' } }));
      return;
    }
    openConfirm("Apakah Anda yakin ingin mengunggah dan menyimpan dokumen ini?", async () => {
      const docId = "AR-" + Date.now();
      const fileData = archiveForm.fileData || null;

      if (fileData) {
        try {
          await saveFileToStorage(docId, fileData, archiveForm.fileName || `${archiveForm.title}.pdf`);
        } catch (err) {
          console.error('[MEDIKARA] Gagal simpan file ke IndexedDB:', err);
        }
      }

      const newDoc = {
        id: docId,
        docNo: archiveForm.docNo || `DOC/KBR/${Date.now().toString().slice(-4)}`,
        title: archiveForm.title,
        category: archiveForm.category,
        date: archiveForm.date,
        size: archiveForm.fileSize || "1.2 MB",
        access: archiveForm.access,
        notes: archiveForm.notes,
        fileName: archiveForm.fileName || `${archiveForm.title}.pdf`,
        fileData: fileData
      };
      const updated = [newDoc, ...digitalArchive];
      updateDBState("digital_archive", updated, setDigitalArchive);
      db.addLog("Unggah Arsip Digital", "Persuratan", `Judul: ${archiveForm.title}, Berkas: ${newDoc.fileName}`);
      setActivityLogs(db.get("activity_logs"));
      setArchiveForm({ 
        docNo: "", title: "", category: "Dokumen & Surat", 
        date: new Date().toISOString().split('T')[0], access: "Internal", 
        notes: "", fileData: null, fileName: "", fileSize: "" 
      });
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Berkas dokumen berhasil diunggah dan disimpan ke Arsip Digital!", type: 'success' } }));
    });
  };

  const handleDeleteArchive = (id) => {
    openConfirm("Apakah Anda yakin ingin menghapus dokumen ini dari arsip digital?", async () => {
      const updated = digitalArchive.filter(item => item.id !== id);
      updateDBState("digital_archive", updated, setDigitalArchive);
      try {
        await deleteFileFromStorage(id);
      } catch (err) {
        console.error('[MEDIKARA] Gagal hapus file dari IndexedDB:', err);
      }
      db.addLog("Hapus Arsip Digital", "Persuratan", `Dokumen ID: ${id} berhasil dihapus`);
      setActivityLogs(db.get("activity_logs"));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Dokumen berhasil dihapus dari arsip.", type: 'success' } }));
    });
  };

  const [archiveEditModal, setArchiveEditModal] = useState({ isOpen: false, data: null });

  const handleOpenEditArchive = async (item) => {
    let fileData = item.fileData;
    if (!fileData) {
      fileData = await getFileFromStorage(item.id);
    }
    setArchiveEditModal({
      isOpen: true,
      data: {
        ...item,
        fileData: fileData || null
      }
    });
  };

  const handleEditArchiveSubmit = async (e) => {
    e.preventDefault();
    if (!archiveEditModal.data || !archiveEditModal.data.title) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Harap isi judul dokumen!", type: 'error' } }));
      return;
    }

    const updatedDoc = { ...archiveEditModal.data };

    if (updatedDoc.fileData) {
      try {
        await saveFileToStorage(updatedDoc.id, updatedDoc.fileData, updatedDoc.fileName || `${updatedDoc.title}.pdf`);
      } catch (err) {
        console.error('[MEDIKARA] Gagal simpan pembaruan berkas ke IndexedDB:', err);
      }
    }

    const updated = digitalArchive.map(item => item.id === updatedDoc.id ? updatedDoc : item);
    updateDBState("digital_archive", updated, setDigitalArchive);
    db.addLog("Edit Arsip Digital", "Persuratan", `Dokumen: ${updatedDoc.title} (No: ${updatedDoc.docNo || '-'})`);
    setActivityLogs(db.get("activity_logs"));
    setArchiveEditModal({ isOpen: false, data: null });
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Data dokumen arsip berhasil diperbarui!", type: 'success' } }));
  };

  // Modals / Detail viewing / Print previews / Header menus / Gudang Request Tab / Letter Reports
  const [requestFormType, setRequestFormType] = useState("out"); // "out" | "borrow"
  const [requestFilterTab, setRequestFilterTab] = useState("all"); // "all" | "out" | "borrow"
  const [letterReportFilter, setLetterReportFilter] = useState({ month: "08", year: "2026", type: "all", unit: "all" });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentPrintDoc, setCurrentPrintDoc] = useState(null);
  const [currentPrintType, setCurrentPrintType] = useState(null); // 'letter', 'cert', 'report', 'report_letters'
  const [previewPageCount, setPreviewPageCount] = useState(1);
  const [previewPages, setPreviewPages] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const cachedPdfResultRef = useRef(null);

  // Generate lembar pratinjau dokumen (A4 dengan sekat visual antar halaman) & hitung jumlah halaman akurat
  useEffect(() => {
    if (!currentPrintDoc) {
      setPreviewPages([]);
      setIsPreviewLoading(false);
      cachedPdfResultRef.current = null;
      setPreviewPageCount(1);
      return;
    }

    if (currentPrintType === "cert") {
      setPreviewPageCount(1);
    }

    let isMounted = true;
    setIsPreviewLoading(true);
    setPreviewPages([]);
    cachedPdfResultRef.current = null;

    const timer = setTimeout(async () => {
      const printArea = document.querySelector('.print-area');
      if (!printArea || !isMounted) return;

      try {
        const pdf = await generateDocPdf(printArea);
        if (isMounted && pdf) {
          cachedPdfResultRef.current = pdf;
          if (pdf.pageDataUrls && pdf.pageDataUrls.length > 0) {
            setPreviewPages(pdf.pageDataUrls);
            setPreviewPageCount(pdf.totalPagesCount || pdf.pageDataUrls.length);
          }
        }
      } catch (err) {
        console.error('Error generating document preview pages:', err);
      } finally {
        if (isMounted) {
          setIsPreviewLoading(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [currentPrintDoc, currentPrintType]);
  const [selectedReportPeriod, setSelectedReportPeriod] = useState({ month: "08", year: "2026", type: "all" });
  const [reportFilters, setReportFilters] = useState({
    suratMasuk: true,
    suratKeluar: true,
    sertifikat: true,
    barangMasuk: true,
    barangKeluar: true,
    peminjaman: true,
    aset: true
  });

  // Pengaturan Tanda Tangan Laporan Bulanan (Dapat diedit instan dan tersimpan permanen)
  const savedReportConfig = db.get("report_signature_config") || {};
  const [reportSigneeCount, setReportSigneeCount] = useState(() => savedReportConfig.count ?? 3);
  const [reportDate, setReportDate] = useState(() => savedReportConfig.date || `Garut, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  const [reportSigneeLeftTitle, setReportSigneeLeftTitle] = useState(() => savedReportConfig.leftTitle || "Kepala Klinik");
  const [reportSigneeLeftName, setReportSigneeLeftName] = useState(() => savedReportConfig.leftName || "dr. H. Asep Maryaman");
  const [reportSigneeLeftNik, setReportSigneeLeftNik] = useState(() => savedReportConfig.leftNik || "1.21.1");

  const [reportSigneeMiddleTitle, setReportSigneeMiddleTitle] = useState(() => savedReportConfig.middleTitle || "KASUBID Umum");
  const [reportSigneeMiddleName, setReportSigneeMiddleName] = useState(() => savedReportConfig.middleName || "NANANG ALAMSYAH, ST");
  const [reportSigneeMiddleNik, setReportSigneeMiddleNik] = useState(() => savedReportConfig.middleNik || "23.10.1");

  const [reportSigneeRightTitle, setReportSigneeRightTitle] = useState(() => savedReportConfig.rightTitle || "Penanggung Jawab");
  const [reportSigneeRightName, setReportSigneeRightName] = useState(() => savedReportConfig.rightName || "Andriana");
  const [reportSigneeRightNik, setReportSigneeRightNik] = useState(() => savedReportConfig.rightNik || "");
  const [showReportTTD, setShowReportTTD] = useState(() => Boolean(savedReportConfig.showTTD));

  // Sync perubahan tanda tangan laporan otomatis ke storage
  useEffect(() => {
    db.set("report_signature_config", {
      count: reportSigneeCount,
      date: reportDate,
      leftTitle: reportSigneeLeftTitle,
      leftName: reportSigneeLeftName,
      leftNik: reportSigneeLeftNik,
      middleTitle: reportSigneeMiddleTitle,
      middleName: reportSigneeMiddleName,
      middleNik: reportSigneeMiddleNik,
      rightTitle: reportSigneeRightTitle,
      rightName: reportSigneeRightName,
      rightNik: reportSigneeRightNik,
      showTTD: showReportTTD
    });
  }, [
    reportSigneeCount, reportDate,
    reportSigneeLeftTitle, reportSigneeLeftName, reportSigneeLeftNik,
    reportSigneeMiddleTitle, reportSigneeMiddleName, reportSigneeMiddleNik,
    reportSigneeRightTitle, reportSigneeRightName, reportSigneeRightNik,
    showReportTTD
  ]);

  
  const buildLetterReportDoc = (month, year, type, unit = "all") => {
    const doc = new jsPDF();
    const clinicName = settings.clinicName || "KLINIK BAITURRAHMAN GARUT";
    
    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(clinicName, 105, 15, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(settings.address || "", 105, 21, { align: "center" });
    doc.text((settings.phone || "") + " | Email: " + (settings.email || ""), 105, 26, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(14, 30, 196, 30);
    doc.setLineWidth(0.2);
    doc.line(14, 31, 196, 31);
    
    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const unitObj = unit !== 'all' ? unitCodes.find(u => u.code === unit || u.name === unit) : null;
    const unitTitle = unitObj ? ` - UNIT ${unitObj.name.toUpperCase()}` : '';
    const titleType = (type === 'in' ? 'SURAT MASUK' : type === 'out' ? 'SURAT KELUAR' : 'PERSURATAN (MASUK & KELUAR)') + unitTitle;
    doc.text(`LAPORAN REKAPITULASI ${titleType}`, 105, 40, { align: "center" });
    
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = months[parseInt(month, 10) - 1] || "Agustus";
    doc.setFontSize(10);
    doc.text(`PERIODE BULAN: ${monthName.toUpperCase()} ${year}`, 105, 46, { align: "center" });
    
    // Get Data
    const reportData = getFilteredLetterReport(month, year, type, unit);
    const tableData = reportData.map((row, index) => [
      index + 1,
      row.noSurat,
      row.perihal + "\n" + row.tujuan,
      row.namaTtd,
      row.keterangan
    ]);
    
    // AutoTable
    autoTable(doc, {
      startY: 55,
      head: [['NO', 'NO SURAT', 'URAIAN (TUJUAN SURAT)', 'NAMA / TTD', 'KETERANGAN']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [243, 244, 246], textColor: 0, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8.5, cellPadding: 2.5, textColor: 0, overflow: 'linebreak' },
      columnStyles: { 0: { halign: 'center', cellWidth: 12 }, 1: { cellWidth: 38 }, 3: { cellWidth: 38 } },
      margin: { top: 55, right: 14, bottom: 15, left: 14 },
      tableWidth: 'auto'
    });

    return { doc, titleType, monthName };
  };

  const generateJSPDFReport = (month, year, type, unit = "all") => {
    const { doc, titleType, monthName } = buildLetterReportDoc(month, year, type, unit);
    doc.save(`Laporan_${titleType.replace(/ /g, '_')}_${monthName}_${year}.pdf`);
  };

  const generateWordReport = (month, year, type, unit = "all") => {
    const unitObj = unit !== 'all' ? unitCodes.find(u => u.code === unit || u.name === unit) : null;
    const unitTitle = unitObj ? ` - UNIT ${unitObj.name.toUpperCase()}` : '';
    const titleType = (type === 'in' ? 'SURAT MASUK' : type === 'out' ? 'SURAT KELUAR' : 'PERSURATAN (MASUK & KELUAR)') + unitTitle;
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const monthName = months[parseInt(month, 10) - 1] || "Agustus";
    const reportData = getFilteredLetterReport(month, year, type, unit);
    
    let tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%;">`;
    tableHTML += `<thead><tr>`;
    ['NO', 'NO SURAT', 'URAIAN (TUJUAN SURAT)', 'NAMA / TTD', 'KETERANGAN'].forEach(h => {
      tableHTML += `<th style="background-color: #f2f2f2; padding: 8px;">${h}</th>`;
    });
    tableHTML += `</tr></thead><tbody>`;
    
    reportData.forEach((row, index) => {
      tableHTML += `<tr>`;
      tableHTML += `<td style="padding: 8px; text-align: center;">${index + 1}</td>`;
      tableHTML += `<td style="padding: 8px;">${row.noSurat || ''}</td>`;
      tableHTML += `<td style="padding: 8px;">${(row.perihal || '') + " - " + (row.tujuan || '')}</td>`;
      tableHTML += `<td style="padding: 8px;">${row.namaTtd || ''}</td>`;
      tableHTML += `<td style="padding: 8px;">${row.keterangan || ''}</td>`;
      tableHTML += `</tr>`;
    });
    tableHTML += `</tbody></table>`;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Laporan</title>
      </head>
      <body>
        <h2 style="text-align: center;">LAPORAN REKAPITULASI ${titleType}</h2>
        <h4 style="text-align: center;">PERIODE BULAN: ${monthName.toUpperCase()} ${year}</h4>
        <br/>
        ${tableHTML}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Laporan_${titleType.replace(/ /g, '_')}_${monthName}_${year}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const previewJSPDFReport = (month, year, type, unit = "all") => {
    const { doc, titleType, monthName } = buildLetterReportDoc(month, year, type, unit);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const fileName = `Laporan_${titleType.replace(/ /g, '_')}_${monthName}_${year}.pdf`;
    setDocViewerModal({
      isOpen: true,
      title: `Laporan Rekapitulasi ${titleType} (${monthName} ${year})`,
      fileName: fileName,
      blobUrl: url,
      dataUrl: null
    });
  };

  const printJSPDFReport = (month, year, type, unit = "all") => {
    const { doc } = buildLetterReportDoc(month, year, type, unit);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => { iframe.contentWindow.print(); };
  };

  const getFilteredLetterReport = (month = "08", year = "2026", type = "all", unit = "all") => {
    let list = [];
    const targetMonth = month || "08";
    const targetYear = year || "2026";
    const targetType = type || "all";
    const targetUnit = unit || "all";

    if (targetType === "all" || targetType === "in") {
      (incomingLetters || []).forEach(l => {
        if (!l) return;
        const d = l.date ? new Date(l.date) : null;
        const mStr = d && !isNaN(d.getTime()) ? String(d.getMonth() + 1).padStart(2, "0") : (l.date ? String(l.date).split('-')[1] : "08");
        const yStr = d && !isNaN(d.getTime()) ? String(d.getFullYear()) : (l.date ? String(l.date).split('-')[0] : "2026");
        const matchUnit = targetUnit === "all" || (l.disposition && l.disposition.toLowerCase().includes(targetUnit.toLowerCase()));
        if (mStr === targetMonth && yStr === targetYear && matchUnit) {
          list.push({
            type: "Surat Masuk",
            date: l.date || '-',
            noSurat: l.refNo || l.id || '-',
            tujuan: `Pengirim: ${l.sender || '-'}`,
            perihal: l.subject || '-',
            namaTtd: l.disposition || "Manajemen Klinik",
            keterangan: l.notes || "Surat Masuk Diterima"
          });
        }
      });
    }
    if (targetType === "all" || targetType === "out") {
      (outgoingLetters || []).forEach(l => {
        if (!l) return;
        const d = l.date ? new Date(l.date) : null;
        const mStr = d && !isNaN(d.getTime()) ? String(d.getMonth() + 1).padStart(2, "0") : (l.date ? String(l.date).split('-')[1] : "08");
        const yStr = d && !isNaN(d.getTime()) ? String(d.getFullYear()) : (l.date ? String(l.date).split('-')[0] : "2026");
        const matchUnit = targetUnit === "all" || l.unitCode === targetUnit || l.unit === targetUnit || (unitCodes.find(u => u.code === targetUnit)?.name === l.unit);
        if (mStr === targetMonth && yStr === targetYear && matchUnit) {
          list.push({
            type: "Surat Keluar",
            date: l.date || '-',
            noSurat: l.docNo || l.id || '-',
            tujuan: `Tujuan: ${l.destination || '-'} (${l.recipientName || '-'})`,
            perihal: l.subject || '-',
            namaTtd: l.signatory || settings?.directorName || "Dr. H. Ahmad Fauzi, M.Kes",
            keterangan: l.status || "Surat Keluar Selesai"
          });
        }
      });
    }
    // Fallback if list is empty for chosen filter so report preview is always readable
    if (list.length === 0) {
      if (targetType === "all" || targetType === "in") {
        (incomingLetters || []).forEach(l => {
          if (!l) return;
          const matchUnit = targetUnit === "all" || (l.disposition && l.disposition.toLowerCase().includes(targetUnit.toLowerCase()));
          if (!matchUnit) return;
          list.push({
            type: "Surat Masuk",
            date: l.date || '-',
            noSurat: l.refNo || l.id || '-',
            tujuan: `Pengirim: ${l.sender || '-'}`,
            perihal: l.subject || '-',
            namaTtd: l.disposition || "Manajemen Klinik",
            keterangan: l.notes || "Surat Masuk Diterima"
          });
        });
      }
      if (targetType === "all" || targetType === "out") {
        (outgoingLetters || []).forEach(l => {
          if (!l) return;
          const matchUnit = targetUnit === "all" || l.unitCode === targetUnit || l.unit === targetUnit || (unitCodes.find(u => u.code === targetUnit)?.name === l.unit);
          if (!matchUnit) return;
          list.push({
            type: "Surat Keluar",
            date: l.date || '-',
            noSurat: l.docNo || l.id || '-',
            tujuan: `Tujuan: ${l.destination || '-'} (${l.recipientName || '-'})`,
            perihal: l.subject || '-',
            namaTtd: l.signatory || settings?.directorName || "Dr. H. Ahmad Fauzi, M.Kes",
            keterangan: l.status || "Surat Keluar Selesai"
          });
        });
      }
    }
    return list;
  };

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);



  // Auth State
  const [regSuccessMsg, setRegSuccessMsg] = useState("");

  // UI state updates trigger saves
  const updateDBState = (key, data, setter) => {
    db.set(key, data);
    setter(data);
  };



  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError("");
    setRegSuccessMsg("");

    const registeredUsers = db.get("users") || defaultUsers;
    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const foundUser = registeredUsers.find(u => u.username && u.username.toLowerCase() === cleanUser);

    let loginSuccess = false;
    let loggedUser = null;

    if (foundUser) {
      if (foundUser.password === cleanPass || (!foundUser.password && cleanUser === "admin" && cleanPass === "admin")) {
        loginSuccess = true;
        loggedUser = foundUser;
      }
    } else if (cleanUser === "admin" && cleanPass === "admin") {
      loginSuccess = true;
      loggedUser = defaultUsers[0];
    }

    if (loginSuccess && loggedUser) {
      if (loggedUser.username === "admin") {
        loggedUser = {
          ...loggedUser,
          id: "usr-001",
          username: "admin",
          name: loggedUser.name || "Admin",
          role: loggedUser.role || "Administrator",
          department: loggedUser.department || "Unit IT",
          email: loggedUser.email || "kbaiturrahmangarut@gmail.com",
          avatarColor: loggedUser.avatarColor || "#0d9488"
        };
      }
      setIsLoggedIn(true);
      setCurrentUser(loggedUser);
      sessionStorage.setItem("kbr_session", "true");
      sessionStorage.setItem("kbr_session_user", loggedUser.username);
      sessionStorage.setItem("kbr_session_user_data", JSON.stringify(loggedUser));
      try {
        localStorage.removeItem("kbr_session");
        localStorage.removeItem("kbr_session_user");
        localStorage.removeItem("kbr_session_user_data");
      } catch (e) {}

      // Refresh semua state dari localStorage saat login ulang
      setSettings(db.get("settings"));
      setIncomingLetters(db.get("incoming_letters"));
      setOutgoingLetters(db.get("outgoing_letters"));
      setCertificates(db.get("certificates"));
      setWarehouseItems(db.get("warehouse_items"));
      setStockInList(db.get("stock_in"));
      setStockOutList(db.get("stock_out"));
      setBorrowings(db.get("borrowings"));
      setInventoryList(db.get("inventory"));
      setDigitalArchive(db.get("digital_archive"));
      const rawAssets = db.get("assets_inventaris") || [];
      setAssetsInventaris(rawAssets);
      setAssetTypes(db.get("asset_types") || []);
      setAssetLocations(db.get("asset_locations") || []);
      setAssetUnits(db.get("asset_units") || []);
      setAssetRelocations(db.get("asset_relocations") || []);
      setAssetOpnames(db.get("asset_opnames") || []);

      const displayName = loggedUser.name || loggedUser.username;
      db.addLog("Login Pengguna", "Autentikasi", `Pengguna [${displayName} - ${loggedUser.role || 'Staf'}] berhasil masuk ke dashboard`);
      setActivityLogs(db.get("activity_logs"));
    } else {
      setAuthError("Username atau password salah!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    sessionStorage.removeItem("kbr_session");
    sessionStorage.removeItem("kbr_session_user");
    sessionStorage.removeItem("kbr_session_user_data");
    try {
      localStorage.removeItem("kbr_session");
      localStorage.removeItem("kbr_session_user");
      localStorage.removeItem("kbr_session_user_data");
    } catch (e) {}
    db.addLog("Logout Pengguna", "Autentikasi", `Sesi login [${currentUser?.name || 'Pengguna'}] diakhiri`);
    setActivityLogs(db.get("activity_logs"));
  };

  // ----------------------------------------------------
  // BUSINESS FLOW LOGIC FUNCTIONS
  // ----------------------------------------------------



  // 2. Outgoing letter generation
  // Letter numbering states
  const initialTemplate = getTemplateData("SKet");
  const [letterForm, setLetterForm] = useState({ 
    docNo: "",
    typeCode: "SKet", 
    unitCode: "01-10.0", 
    unit: "Direktur",
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

  // Auto-generate docNo when typeCode, unitCode or date changes (hanya jika bukan mode edit)
  useEffect(() => {
    if (letterForm.id) return; // Mode edit surat: pertahankan nomor dokumen aslinya!
    const d = new Date(letterForm.date);
    const yearLetters = outgoingLetters.filter(l => new Date(l.date).getFullYear() === d.getFullYear());
    const nextSeq = yearLetters.length + 1;
    const generatedNo = generateSuratNumber(nextSeq, letterForm.typeCode, letterForm.unitCode, letterForm.date);
    setLetterForm(prev => ({ ...prev, docNo: generatedNo }));
  }, [letterForm.typeCode, letterForm.unitCode, letterForm.date, letterForm.id, outgoingLetters]);
  const romanize = (num) => {
    const lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let roman = '', i;
    for ( i in lookup ) {
      while ( num >= lookup[i] ) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  };
  const handleCreateLetter = (e, letterData = letterForm) => {
      e.preventDefault();
      const isEditing = Boolean(letterData.id && outgoingLetters.some(l => l.id === letterData.id));
      const confirmMsg = isEditing
        ? `Apakah Anda yakin ingin menyimpan perubahan pada dokumen [${letterData.docNo || 'Surat'}] ini?`
        : "Apakah Anda yakin ingin membuat Surat Keluar ini?";

      openConfirm(confirmMsg, () => {
        const typeObj = letterTypes.find(t => t.code === letterData.typeCode || t.name === letterData.typeCode || t.name === letterData.templateType);
        const templateType = typeObj ? typeObj.code : (letterData.typeCode || "SB");
        const templateTypeName = typeObj ? typeObj.name : (letterData.templateType || "Surat Keluar");
        const docNo = letterData.docNo;
        const letterId = isEditing ? letterData.id : ("SU-" + Date.now());

        const unitObj = unitCodes.find(u => u.code === letterData.unitCode || u.name === letterData.unit);
        const unitName = unitObj ? unitObj.name : (letterData.unit || "Direktur");
        const unitCode = unitObj ? unitObj.code : (letterData.unitCode || "01-10.0");

        const savedLetter = {
          ...letterData,
          id: letterId,
          docNo,
          unit: unitName,
          unitCode: unitCode,
          date: letterData.date || new Date().toISOString().split('T')[0],
          createdAt: letterData.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          typeCode: letterData.typeCode || (typeObj ? typeObj.code : "SB"),
          templateType,
          templateTypeName,
          destination: letterData.destination || "",
          recipientName: letterData.recipientName || "",
          subject: letterData.subject || "",
          content: letterData.content || "",
          skData: letterData.typeCode === "SKep" ? (letterData.skData || null) : null,
          lampiranData: letterData.lampiranData || (letterData.skData?.lampiran ? { gunakanLampiran: letterData.skData.gunakanLampiran, lampiran: letterData.skData.lampiran } : null),
          gunakanLampiran: letterData.gunakanLampiran || letterData.skData?.gunakanLampiran || false,
          pedomanData: letterData.typeCode === "Pdm" ? (letterData.pedomanData || null) : null,
          sopData: letterData.typeCode === "SOP" ? (letterData.sopData || null) : null,
          kakData: letterData.typeCode === "KAK" ? (letterData.kakData || null) : null,
          stData: letterData.typeCode === "ST" ? (letterData.stData || null) : null,
          sbalData: letterData.sbalData,
          namaTtd: letterData.namaTtd,
          jabatanTtd: letterData.jabatanTtd,
          namaDiterangkan: letterData.namaDiterangkan,
          jabatanDiterangkan: letterData.jabatanDiterangkan,
          keperluan: letterData.keperluan,
          harapan: letterData.harapan,
          signatory: letterData.signatory || "",
          title: letterData.title || "Direktur Utama",
          leftSignatoryName: letterData.leftSignatoryName || "",
          leftSignatoryTitle: letterData.leftSignatoryTitle || "",
          signeeCount: letterData.signeeCount || ((letterData.leftSignatoryName || letterData.leftSignatoryTitle) ? 2 : 1),
          kopType: letterData.kopType || "direktur",
          attachments: letterData.attachments || "-",
          useDigitalSignature: letterData.useDigitalSignature !== false,
          useDigitalStamp: letterData.useDigitalStamp !== false,
          status: "Selesai"
        };
        setOutgoingLetters(prev => {
          const updated = isEditing
            ? prev.map(l => l.id === letterId ? savedLetter : l)
            : [savedLetter, ...prev];
          db.set("outgoing_letters", updated);
          return updated;
        });
        db.addLog(isEditing ? `Ubah Surat Keluar` : `Membuat Surat Keluar`, "Persuratan", `No: ${docNo}, Perihal: ${letterData.subject}`);
        setActivityLogs(db.get("activity_logs"));
        setCurrentPrintDoc(savedLetter);
        setCurrentPrintType("letter");
        setLetterForm({ docNo: "", date: new Date().toISOString().split('T')[0], typeCode: "SB", unitCode: "01-10.0", unit: "Direktur", destination: "", subject: "", content: "", attachments: [], skData: null, pedomanData: null, sopData: null, kakData: null, stData: null });
        window.dispatchEvent(new CustomEvent('app-toast', { 
          detail: { message: isEditing ? `Perubahan dokumen [${docNo}] berhasil disimpan!` : "Surat keluar berhasil dibuat!", type: 'success' } 
        }));
      });
    };

  // 1. Incoming Letter Creation
  const [incomingForm, setIncomingForm] = useState({ refNo: "", sender: "", subject: "", disposition: "", date: new Date().toISOString().split('T')[0], fileName: "", fileSize: "", fileData: null });
  const handleAddIncomingLetter = (e) => {
    e.preventDefault();
    openConfirm("Apakah Anda yakin ingin menambahkan Surat Masuk ini?", async () => {
      const letterId = "SM-" + Date.now();
      const fileData = incomingForm.fileData || null;

      if (fileData) {
        try {
          await saveFileToStorage(letterId, fileData, incomingForm.fileName || "surat_masuk.pdf");
        } catch (err) {
          console.error('[MEDIKARA] Gagal simpan file surat masuk ke IndexedDB:', err);
        }
      }

      const newLetter = {
        id: letterId,
        refNo: incomingForm.refNo,
        sender: incomingForm.sender,
        subject: incomingForm.subject,
        disposition: incomingForm.disposition,
        date: incomingForm.date,
        fileName: incomingForm.fileName || "",
        fileSize: incomingForm.fileSize || "",
        fileData: fileData
      };
      setIncomingLetters(prev => {
        const updated = [newLetter, ...prev];
        db.set("incoming_letters", updated);
        return updated;
      });
      db.addLog(`Tambah Surat Masuk`, "Persuratan", `No: ${incomingForm.refNo}, Pengirim: ${incomingForm.sender}`);
      setActivityLogs(db.get("activity_logs"));
      setIncomingForm({ refNo: "", sender: "", subject: "", disposition: "", date: new Date().toISOString().split('T')[0], fileName: "", fileSize: "", fileData: null });
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Surat masuk berhasil ditambahkan!", type: 'success' } }));
    });
  };

  // 3. Certificate creation
  const [certForm, setCertForm] = useState({ 
    docNo: "", 
    name: "", 
    identityNo: "", 
    institution: "", 
    major: "", 
    activityType: "Magang / Praktik Kerja", 
    customActivityType: "", 
    startDate: "", 
    endDate: "", 
    notes: "Sangat Baik", 
    signatory: "", 
    title: "", 
    leftSignatoryName: "", 
    leftSignatoryTitle: "", 
    customBody: "", 
    useDigitalSignature: true,
    useDigitalStamp: true
  });
  const [prevAutoBody, setPrevAutoBody] = useState("");

  const generateCertBody = (form) => {
    const activity = form.activityType === "Other" ? (form.customActivityType || "Lainnya") : form.activityType;
    const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const fmtDate = (str) => {
      if (!str) return "______________";
      const d = new Date(str);
      if (isNaN(d.getTime())) return str;
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };
    const predikatPart = form.notes ? ` Selama melaksanakan kegiatan tersebut, yang bersangkutan telah menunjukkan kinerja dan dedikasi dengan predikat ${form.notes}.` : "";

    return `Yang bertanda tangan di bawah ini, Direktur Klinik Baiturrahman, dengan ini menerangkan bahwa yang bersangkutan telah selesai melaksanakan kegiatan ${activity} di ${form.institution ? 'lingkungan ' : ''}Klinik Baiturrahman, terhitung mulai tanggal ${fmtDate(form.startDate)} sampai dengan tanggal ${fmtDate(form.endDate)}.${predikatPart}\n\nSertifikat ini diberikan sebagai bentuk penghargaan atas partisipasi aktif dan kontribusi positif yang bersangkutan selama mengikuti kegiatan di Klinik Baiturrahman.\n\nDemikian sertifikat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.`;
  };

  useEffect(() => {
    const auto = generateCertBody(certForm);
    // Hanya update customBody jika belum diedit manual (isinya sama dengan teks auto sebelumnya, atau masih kosong)
    setCertForm(prev => {
      if (prev.customBody === "" || prev.customBody === prevAutoBody) {
        setPrevAutoBody(auto);
        return { ...prev, customBody: auto };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certForm.name, certForm.identityNo, certForm.institution, certForm.major, certForm.activityType, certForm.customActivityType, certForm.startDate, certForm.endDate, certForm.notes]);

  const handleCreateCert = (e) => {
    e.preventDefault();
    openConfirm("Apakah Anda yakin ingin membuat Sertifikat ini?", () => {
      const docNo = certForm.docNo || db.generateDocNo("cert");
          const newCert = {
            id: "CERT-" + Date.now(),
            docNo,
            name: certForm.name,
            identityNo: certForm.identityNo,
            institution: certForm.institution,
            major: certForm.major,
            activityType: certForm.activityType === "Other" ? (certForm.customActivityType || "Lainnya") : certForm.activityType,
            startDate: certForm.startDate,
            endDate: certForm.endDate,
            notes: certForm.notes,
            customBody: certForm.customBody || "",
            signatory: certForm.signatory || "",
            title: certForm.title || "Direktur Utama",
            leftSignatoryName: certForm.leftSignatoryName || "",
            leftSignatoryTitle: certForm.leftSignatoryTitle || "",
            useDigitalSignature: Boolean(certForm.useDigitalSignature),
            useDigitalStamp: Boolean(certForm.useDigitalStamp !== false)
          };
          setCertificates(prev => {
            const updated = [newCert, ...prev];
            db.set("certificates", updated);
            return updated;
          });
          db.addLog(`Membuat Sertifikat ${certForm.activityType}`, "Persuratan", `No: ${docNo}, Peserta: ${certForm.name}`);
          setActivityLogs(db.get("activity_logs"));
          setCurrentPrintDoc(newCert);
          setCurrentPrintType("cert");
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Sertifikat berhasil dibuat dengan nomor otomatis: ${docNo}`, type: 'success' } }));
    });
  };

  // 4. Warehouse stock in
  const [stockInForm, setStockInForm] = useState({ itemName: "", qty: "", source: "", price: "", officer: "Admin", notes: "" });
  const handleStockIn = (e) => {
    e.preventDefault();
    if (!stockInForm.itemName.trim()) { window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Nama barang harus diisi!", type: 'error' } })); return; }
    openConfirm("Apakah Anda yakin ingin mencatat stok masuk ini?", () => {
      const inputName = stockInForm.itemName.trim().toLowerCase();
          let item = warehouseItems.find(i => i.name.toLowerCase() === inputName);
          let itemCode = "";
          let updatedItems = [...warehouseItems];
      
          if (item) {
            itemCode = item.code;
            updatedItems = warehouseItems.map(i => {
              if (i.code === itemCode) {
                return { ...i, currentStock: i.currentStock + parseInt(stockInForm.qty) };
              }
              return i;
            });
          } else {
            itemCode = `B-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
            item = {
              code: itemCode,
              name: stockInForm.itemName.trim(),
              category: "Umum",
              unit: "Pcs",
              minStock: 5,
              currentStock: parseInt(stockInForm.qty),
              location: "Gudang Utama",
              condition: "Baik",
              notes: "Otomatis dari Barang Masuk"
            };
            updatedItems = [item, ...warehouseItems];
          }
          
          updateDBState("warehouse_items", updatedItems, setWarehouseItems);
          const transactionId = db.generateDocNo("stock_in");
      
          const newIn = {
            id: transactionId,
            date: new Date().toISOString().split('T')[0],
            itemCode: itemCode,
            itemName: item.name,
            qty: parseInt(stockInForm.qty),
            unit: item.unit,
            source: stockInForm.source,
            price: parseFloat(stockInForm.price || 0),
            officer: stockInForm.officer,
            notes: stockInForm.notes
          };
          setStockInList(prev => {
            const updatedStockIn = [newIn, ...prev];
            db.set("stock_in", updatedStockIn);
            return updatedStockIn;
          });
          
          db.addLog(`Barang Masuk`, "Gudang", `Barang: ${item.name}, Qty: ${stockInForm.qty}`);
          setActivityLogs(db.get("activity_logs"));
          setStockInForm({ itemName: "", qty: "", source: "", price: "", officer: "Admin", notes: "" });
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Transaksi berhasil! Stok ${item.name} bertambah.`, type: 'success' } }));
    });
  };

  // 5. Warehouse stock out
  const [stockOutForm, setStockOutForm] = useState({ itemCode: "", qty: "", destination: "", officer: "Admin", notes: "" });
  const handleStockOut = (e) => {
    e.preventDefault();
    const item = warehouseItems.find(i => i.code === stockOutForm.itemCode);
    if (!item) { window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Barang tidak ditemukan!", type: 'error' } })); return; }
    if (item.currentStock < parseInt(stockOutForm.qty)) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Stok barang tidak mencukupi!", type: 'error' } })); return;
    }
    openConfirm("Apakah Anda yakin ingin mencatat pengeluaran stok ini?", () => {
      const transactionId = db.generateDocNo("stock_out");
      
          // Decrement stock
          const updatedItems = warehouseItems.map(i => {
            if (i.code === stockOutForm.itemCode) {
              return { ...i, currentStock: i.currentStock - parseInt(stockOutForm.qty) };
            }
            return i;
          });
          updateDBState("warehouse_items", updatedItems, setWarehouseItems);
      
          const newOut = {
            id: transactionId,
            date: new Date().toISOString().split('T')[0],
            itemCode: stockOutForm.itemCode,
            itemName: item.name,
            qty: parseInt(stockOutForm.qty),
            unit: item.unit,
            destination: stockOutForm.destination,
            officer: stockOutForm.officer,
            notes: stockOutForm.notes,
            status: "Selesai" // default previous behavior
          };
          setStockOutList(prev => {
            const updatedStockOut = [newOut, ...prev];
            db.set("stock_out", updatedStockOut);
            return updatedStockOut;
          });
      
          db.addLog(`Barang Keluar`, "Gudang", `Barang: ${item.name}, Qty: ${stockOutForm.qty}`);
          setActivityLogs(db.get("activity_logs"));
          setStockOutForm({ itemCode: "", qty: "", destination: "", officer: "Admin", notes: "" });
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Transaksi berhasil! Stok ${item.name} berkurang.`, type: 'success' } }));
    });
  };

  // 6. Borrowing item
  const [borrowForm, setBorrowForm] = useState({ borrower: "", unit: "", itemName: "", qty: 1, dueDate: "", purpose: "" });
  const [requestModal, setRequestModal] = useState({ isOpen: false, type: "", action: "", data: null });
  const [letterModal, setLetterModal] = useState({ isOpen: false, type: "", action: "", data: null });
  const [certModal, setCertModal] = useState({ isOpen: false, data: null });
  const handleBorrowItem = (e) => {
    e.preventDefault();
    if (!borrowForm.itemName || !borrowForm.itemName.trim()) { window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Nama alat/barang harus diisi!", type: 'error' } })); return; }
    openConfirm("Apakah Anda yakin ingin mencatat peminjaman ini?", () => {
      const transactionId = db.generateDocNo("borrow");
      
          const newBorrow = {
            id: transactionId,
            date: new Date().toISOString().split('T')[0],
            borrower: borrowForm.borrower,
            unit: borrowForm.unit,
            itemCode: "-", 
            itemName: borrowForm.itemName,
            qty: parseInt(borrowForm.qty),
            conditionOut: "Baik",
            dueDate: borrowForm.dueDate,
            purpose: borrowForm.purpose,
            returnDate: "",
            conditionIn: "",
            status: "Dipinjam",
            notes: ""
          };
          setBorrowings(prev => {
            const updatedBorrowings = [newBorrow, ...prev];
            db.set("borrowings", updatedBorrowings);
            return updatedBorrowings;
          });
          db.addLog(`Peminjaman Alat`, "Operasional", `Alat: ${borrowForm.itemName}, Peminjam: ${borrowForm.borrower}`);
          setActivityLogs(db.get("activity_logs"));
          
          setBorrowForm({ borrower: "", unit: "", itemName: "", qty: 1, dueDate: "", purpose: "" });
          window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Peminjaman berhasil dicatat.", type: 'success' } }));
    });
  };

  // --- NEW CRUD HANDLERS FOR REQUESTS/BORROWS ---
  const handleDeleteRequest = (type, id) => {
    openConfirm("Yakin ingin menghapus data ini?", () => {
      if (type === "out") {
        setStockOutList(prevOut => {
          const outItem = prevOut.find(o => o.id === id);
          if (outItem && outItem.status !== "Ditolak" && outItem.status !== "Batal") {
            setWarehouseItems(prevWarehouse => {
              const updatedWarehouse = prevWarehouse.map(i => 
                i.code === outItem.itemCode ? { ...i, currentStock: i.currentStock + outItem.qty } : i
              );
              db.set("warehouse_items", updatedWarehouse);
              return updatedWarehouse;
            });
          }
          const updated = prevOut.filter(o => o.id !== id);
          db.set("stock_out", updated);
          return updated;
        });
        db.addLog("Hapus Data", "Gudang", `Menghapus permintaan keluar ${id}`);
      } else {
        setBorrowings(prevBorrowings => {
          const updated = prevBorrowings.filter(b => b.id !== id);
          db.set("borrowings", updated);
          return updated;
        });
        db.addLog("Hapus Data", "Gudang", `Menghapus peminjaman ${id}`);
      }
      setActivityLogs(db.get("activity_logs"));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Data berhasil dihapus.", type: 'success' } }));
    });
  };

  const handleStatusChange = (type, id, newStatus) => {
    if (type === "out") {
      const outItem = stockOutList.find(o => o.id === id);
      if (outItem) {
        if ((newStatus === "Ditolak" || newStatus === "Batal") && outItem.status !== "Ditolak" && outItem.status !== "Batal") {
          // Kembalikan stok karena dibatalkan/ditolak
          const updatedWarehouse = warehouseItems.map(i => 
            i.code === outItem.itemCode ? { ...i, currentStock: i.currentStock + outItem.qty } : i
          );
          updateDBState("warehouse_items", updatedWarehouse, setWarehouseItems);
        } else if ((outItem.status === "Ditolak" || outItem.status === "Batal") && newStatus !== "Ditolak" && newStatus !== "Batal") {
          // Mengembalikan ke status awal (contoh: Selesai), kurangi stok lagi
          const item = warehouseItems.find(i => i.code === outItem.itemCode);
          if (item && item.currentStock < outItem.qty) {
            window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Stok tidak mencukupi untuk mengubah status!", type: 'error' } })); return;
          }
          const updatedWarehouse = warehouseItems.map(i => 
            i.code === outItem.itemCode ? { ...i, currentStock: i.currentStock - outItem.qty } : i
          );
          updateDBState("warehouse_items", updatedWarehouse, setWarehouseItems);
        }
      }

      const updated = stockOutList.map(o => o.id === id ? { ...o, status: newStatus } : o);
      updateDBState("stock_out", updated, setStockOutList);
      db.addLog("Update Status", "Gudang", `Status barang keluar ${id} menjadi ${newStatus}`);
    } else {
      const updated = borrowings.map(b => b.id === id ? { ...b, status: newStatus, returnDate: (newStatus === "Selesai" || newStatus === "Dikembalikan") ? new Date().toISOString().split('T')[0] : (b.returnDate || "") } : b);
      updateDBState("borrowings", updated, setBorrowings);
      db.addLog("Update Status", "Gudang", `Status peminjaman ${id} menjadi ${newStatus}`);
    }
    setActivityLogs(db.get("activity_logs"));
  };

  const handleEditRequestSubmit = (e) => {
    e.preventDefault();
    const { type, data } = requestModal;
    if (type === "out") {
      const updated = stockOutList.map(o => o.id === data.id ? data : o);
      updateDBState("stock_out", updated, setStockOutList);
    } else {
      const updated = borrowings.map(b => b.id === data.id ? data : b);
      updateDBState("borrowings", updated, setBorrowings);
    }
    setRequestModal({ isOpen: false, type: "", action: "", data: null });
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Perubahan berhasil disimpan.", type: 'success' } }));
  };

  // --- LETTER CRUD HANDLERS ---
  const handleViewIncomingLetterFile = async (l) => {
    let dataUrl = l.fileData;
    if (!dataUrl) {
      dataUrl = await getFileFromStorage(l.id);
    }
    if (dataUrl) {
      const blob = dataURLtoBlob(dataUrl);
      const blobUrl = blob ? URL.createObjectURL(blob) : dataUrl;
      setDocViewerModal({
        isOpen: true,
        title: `Surat Masuk: ${l.refNo}`,
        fileName: l.fileName || `surat_masuk_${l.refNo}.pdf`,
        blobUrl: blobUrl,
        dataUrl: dataUrl
      });
    } else {
      setSelectedIncomingDetail(l);
    }
  };

  const handleDownloadIncomingLetterFile = async (l) => {
    let dataUrl = l.fileData;
    if (!dataUrl) {
      dataUrl = await getFileFromStorage(l.id);
    }
    if (dataUrl) {
      downloadFileBlob(dataUrl, l.fileName || `surat_masuk_${l.refNo}.pdf`);
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Memulai unduhan berkas: ${l.fileName || l.refNo}`, type: 'success' } }));
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Berkas untuk surat masuk ${l.refNo} tidak ditemukan di penyimpanan lokal.`, type: 'error' } }));
    }
  };

  const handleDeleteIncomingLetter = (id) => {
    openConfirm("Yakin ingin menghapus surat masuk ini?", async () => {
      setIncomingLetters(prev => {
        const updated = prev.filter(l => l.id !== id);
        db.set("incoming_letters", updated);
        return updated;
      });
      try {
        await deleteFileFromStorage(id);
      } catch (err) {
        console.error('[MEDIKARA] Gagal hapus file surat masuk dari IndexedDB:', err);
      }
      db.addLog("Hapus Surat Masuk", "Persuratan", `Menghapus surat masuk dengan ID ${id}`);
      setActivityLogs(db.get("activity_logs"));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Surat masuk berhasil dihapus.", type: 'success' } }));
    });
  };

  const handleDeleteOutgoingLetter = (id) => {
    openConfirm("Yakin ingin menghapus surat keluar ini?", () => {
      setOutgoingLetters(prev => {
        const updated = prev.filter(l => l.id !== id);
        db.set("outgoing_letters", updated);
        return updated;
      });
      db.addLog("Hapus Surat Keluar", "Persuratan", `Menghapus surat keluar dengan ID ${id}`);
      setActivityLogs(db.get("activity_logs"));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Surat keluar berhasil dihapus.", type: 'success' } }));
    });
  };

  const handleEditLetterSubmit = async (e) => {
    e.preventDefault();
    const { type, data } = letterModal;
    if (type === "in") {
      if (data.fileData) {
        try {
          await saveFileToStorage(data.id, data.fileData, data.fileName || "surat_masuk.pdf");
        } catch (err) {
          console.error('[MEDIKARA] Gagal simpan file edit surat masuk:', err);
        }
      }
      const updated = incomingLetters.map(l => l.id === data.id ? data : l);
      updateDBState("incoming_letters", updated, setIncomingLetters);
      db.addLog("Edit Surat Masuk", "Persuratan", `Mengubah data surat masuk ${data.refNo}`);
    } else {
      const updated = outgoingLetters.map(l => l.id === data.id ? data : l);
      updateDBState("outgoing_letters", updated, setOutgoingLetters);
      db.addLog("Edit Surat Keluar", "Persuratan", `Mengubah data surat keluar ${data.docNo}`);
    }
    setLetterModal({ isOpen: false, type: "", action: "", data: null });
    setActivityLogs(db.get("activity_logs"));
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Perubahan berhasil disimpan.", type: 'success' } }));
  };

  const handleDeleteCert = (id) => {
    openConfirm("Yakin ingin menghapus sertifikat ini dari arsip?", () => {
      setCertificates(prev => {
        const updated = prev.filter(c => c.id !== id);
        db.set("certificates", updated);
        return updated;
      });
      db.addLog("Hapus Sertifikat", "Persuratan", `Menghapus sertifikat dengan ID ${id}`);
      setActivityLogs(db.get("activity_logs"));
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Sertifikat berhasil dihapus.", type: 'success' } }));
    });
  };

  const handleEditCertSubmit = (e) => {
    e.preventDefault();
    const { data } = certModal;
    const updated = certificates.map(c => c.id === data.id ? data : c);
    updateDBState("certificates", updated, setCertificates);
    db.addLog("Edit Sertifikat", "Persuratan", `Mengubah data sertifikat ${data.docNo}`);
    setCertModal({ isOpen: false, data: null });
    setActivityLogs(db.get("activity_logs"));
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Perubahan sertifikat berhasil disimpan.", type: 'success' } }));
  };

  // 7. Returning item
  const handleReturnItem = (id, conditionIn, notes) => {
    const borrow = borrowings.find(b => b.id === id);
    if (!borrow) return;

    // Increment stock back
    const updatedItems = warehouseItems.map(i => {
      if (i.code === borrow.itemCode) {
        return { ...i, currentStock: i.currentStock + borrow.qty };
      }
      return i;
    });
    updateDBState("warehouse_items", updatedItems, setWarehouseItems);

    const updatedBorrowings = borrowings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          returnDate: new Date().toISOString().split('T')[0],
          conditionIn,
          notes,
          status: "Dikembalikan"
        };
      }
      return b;
    });
    updateDBState("borrowings", updatedBorrowings, setBorrowings);

    db.addLog(`Pengembalian Barang`, "Gudang", `Barang: ${borrow.itemName}, Peminjam: ${borrow.borrower}`);
    setActivityLogs(db.get("activity_logs"));
    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Barang berhasil dikembalikan!", type: 'success' } }));
  };

  // 8. Backup and Restore
  const handleBackup = () => {
    const allData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("kbr_db_")) {
        allData[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(allData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kbr_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    db.addLog("Backup Database", "Pengaturan", "Berhasil melakukan export data");
    setActivityLogs(db.get("activity_logs"));
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, data[key]);
        });
        db.addLog("Restore Database", "Pengaturan", "Berhasil memulihkan database");
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Database berhasil dipulihkan! Aplikasi akan dimuat ulang.", type: 'success' } }));
        window.location.reload();
      } catch (err) {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: "Gagal memulihkan database. Format file tidak valid.", type: 'error' } }));
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // SPLASH SCREEN & LOGIN RENDER
  // ----------------------------------------------------
  if (showSplash) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        height: '100vh', width: '100vw',
        background: '#ffffff',
        overflow: 'hidden', position: 'relative',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
      }}>

        {/* Soft radial glow behind logo */}
        <div style={{
          position: 'absolute',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,74,53,0.07) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo + Counter-rotating rings */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem',
          animation: 'splashReveal 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          opacity: 0
        }}>
          <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            {/* Ring 1 — clockwise, dashed, outer */}
            <div style={{
              position: 'absolute',
              width: '210px', height: '210px', borderRadius: '50%',
              border: '2.5px dashed #2f694e',
              opacity: 0.35,
              animation: 'spinCW 6s linear infinite'
            }} />

            {/* Ring 2 — counter-clockwise, solid segments, mid */}
            <div style={{
              position: 'absolute',
              width: '178px', height: '178px', borderRadius: '50%',
              border: '2px solid transparent',
              borderTop: '2.5px solid #1e4a35',
              borderRight: '2.5px solid #1e4a35',
              opacity: 0.55,
              animation: 'spinCCW 3.5s linear infinite'
            }} />

            {/* Ring 3 — clockwise, thin, inner */}
            <div style={{
              position: 'absolute',
              width: '150px', height: '150px', borderRadius: '50%',
              border: '1.5px dashed #4caf82',
              opacity: 0.3,
              animation: 'spinCW 9s linear infinite'
            }} />

            {/* Logo circle center */}
            <div style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: 'linear-gradient(145deg, #f0f9f4, #ffffff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 24px rgba(30,74,53,0.12), 0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(30,74,53,0.1)',
              zIndex: 2
            }}>
              <img src={settings?.logo || "/logo.png"} width="76" height="76"  alt="Logo" style={{ width: '76px', height: 'auto' }} />
            </div>
          </div>

          {/* Loading dots */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1e4a35', animation: 'dotBounce 1.2s ease-in-out infinite 0s' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1e4a35', animation: 'dotBounce 1.2s ease-in-out infinite 0.2s' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#1e4a35', animation: 'dotBounce 1.2s ease-in-out infinite 0.4s' }} />
          </div>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes splashReveal {
            0% { opacity: 0; transform: scale(0.88); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes spinCW {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes spinCCW {
            from { transform: rotate(0deg); }
            to   { transform: rotate(-360deg); }
          }
          @keyframes dotBounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
            40% { transform: translateY(-9px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', width: '100vw',
        backgroundColor: 'var(--bg-card)',
        position: 'relative', overflowY: 'auto', padding: '1.5rem 0'
      }}>

        {/* Center Card */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: '440px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '3rem 2.5rem 2.5rem',
          boxShadow: '0 20px 60px rgba(80,120,100,0.1), 0 4px 16px rgba(80,120,100,0.06)',
          border: '1px solid rgba(200,220,210,0.5)',
          margin: '1rem'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <img 
              src={settings?.logo || "/logo.png"} 
              alt="Logo Klinik" 
              style={{ 
                height: '75px', 
                width: 'auto', 
                maxWidth: '120px', 
                objectFit: 'contain',
                display: 'inline-block'
              }} 
            />
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.4rem', fontWeight: 400, letterSpacing: '0.18em',
              color: '#3a6b55', margin: '0 0 0.4rem 0',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}>MEDIKARA</h1>
            <p style={{
              fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.28em',
              textTransform: 'uppercase', color: '#8aaa98', margin: 0
            }}>Klinik Baiturrahman Garut</p>
          </div>

          {/* Success Message */}
          {regSuccessMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf0cd', color: '#3a8a5c', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={15} /> {regSuccessMsg}
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.7rem 1rem', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={15} /> {authError}
            </div>
          )}



          {/* ── LOGIN FORM ── */}
          {/* ── LOGIN FORM ── */}
          {(
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Username Field with Notched Legend */}
              <fieldset style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.35rem 0.85rem 0.45rem',
                margin: 0,
                position: 'relative',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}>
                <legend style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.6px',
                  padding: '0 0.35rem',
                  textTransform: 'uppercase'
                }}>
                  USERNAME:
                </legend>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <User size={18} fill="#1a4a38" color="#1a4a38" style={{ flexShrink: 0 }} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="username"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '0.92rem',
                      color: '#1e293b',
                      padding: '0.15rem 0'
                    }}
                  />
                </div>
              </fieldset>

              {/* Password Field with Notched Legend */}
              <fieldset style={{
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                padding: '0.35rem 0.85rem 0.45rem',
                margin: 0,
                position: 'relative',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}>
                <legend style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.6px',
                  padding: '0 0.35rem',
                  textTransform: 'uppercase'
                }}>
                  PASSWORD:
                </legend>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Lock size={18} fill="#1a4a38" color="#1a4a38" style={{ flexShrink: 0 }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••"
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      width: '100%',
                      fontSize: '0.92rem',
                      color: '#1e293b',
                      padding: '0.15rem 0'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </fieldset>

              {/* Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} style={{ accentColor: '#1a4a38', width: '15px', height: '15px' }} />
                  <label htmlFor="rememberMe" style={{ fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>Ingat Saya</label>
                </div>
              </div>

              {/* Submit Button (Matching User Design) */}
              <button
                type="submit"
                style={{
                  padding: '0.8rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  backgroundColor: '#9cb7ae',
                  color: '#133e2b',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#8ba89f';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#9cb7ae';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Masuk</span>
                <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center', fontWeight: 700 }}>➔]</span>
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Helper Format Sertifikat Standar Kop Surat
  const formatSertifikatStandar = (val) => {
    const v = val || '91203004416170002';
    const str = String(v).trim();
    if (str.toUpperCase().startsWith('SERTIFIKAT STANDAR')) return str;
    if (str.toUpperCase().startsWith('NO.') || str.toUpperCase().startsWith('NO :') || str.toUpperCase().startsWith('NO:')) {
      return `SERTIFIKAT STANDAR ${str}`;
    }
    return `SERTIFIKAT STANDAR : ${str}`;
  };

  // Helper Format Alamat & No Telp Kop Surat
  const formatKopAddress = (s) => {
    let addr = (s?.address || 'Jl. Merdeka No. 217 Tarogong Kidul - Garut').trim();
    let ph = (s?.phone || 'Telp. 0262-234754, HP. 0813-2124-3303').trim();

    // Sanitize any legacy bloated strings
    if (addr.includes('Jayaraga') || addr.includes('Kabupaten Garut') || addr.includes('HPAVhatsApp') || addr.includes('HP,WhatsApp') || addr.includes('rocketmail.com') || addr.includes('Tarogong Kidul-Garut')) {
      addr = 'Jl. Merdeka No. 217 Tarogong Kidul - Garut';
    }
    if (ph.includes('HPAVhatsApp') || ph.includes('Teig') || ph.includes('HP,WhatsApp') || ph.includes('rocketmail.com') || ph.includes('(0262)')) {
      ph = 'Telp. 0262-234754, HP. 0813-2124-3303';
    }

    if (addr.includes('Telp') || addr.includes('0262') || addr.includes('0813')) {
      return addr;
    }
    return ph ? `${addr}, ${ph}` : addr;
  };

  // FUNGSI GENERATE PDF RESMI (LEAF-ATOMIC SMART PAGINATION)
  // Digunakan bersama oleh tombol 'Lihat' (Pratinjau) dan 'Download PDF'
  const generateDocPdf = async (printArea) => {
    await new Promise(r => setTimeout(r, 80));

    const isLandscape = currentPrintType === 'cert';
    // Standar dimensi A4 dalam pixel (96 DPI): Portrait ~794px, Landscape ~1122px
    const targetW = isLandscape ? 1122 : 794;
    const printRect = printArea.getBoundingClientRect();
    const printW    = Math.max(printArea.scrollWidth, printArea.offsetWidth, targetW);

    let cloneLeafPositions = [];
    let cloneSopHalamanBoxMm = null;
    const SCALE = 2.5;

    // ── Capture printArea dengan html2canvas (Presisi Tinggi & Standar A4) ──
    const canvas = await html2canvas(printArea, {
      scale: SCALE,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (_cloneDoc, cloneEl) => {
        const rootCS = window.getComputedStyle(document.documentElement);
        const varNames = [
          '--primary','--primary-dark','--primary-light','--primary-hover',
          '--bg','--bg-card','--bg-sidebar','--text','--text-muted',
          '--border','--border-light','--success','--warning','--danger',
          '--accent','--accent-light',
        ];
        const s = _cloneDoc.createElement('style');
        s.textContent = `
          :root { ${varNames.map(v => `${v}: ${rootCS.getPropertyValue(v).trim() || 'initial'}`).join('; ')} }
          .sop-table { border-collapse: collapse !important; border-spacing: 0 !important; border: 0.5px solid #333333 !important; }
          .sop-table th, .sop-table td { border: 0.5px solid #333333 !important; border-width: 0.5px !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `;
        _cloneDoc.head.insertBefore(s, _cloneDoc.head.firstChild);

        // Pastikan dokumen klon memiliki ukuran desktop penuh sehingga tidak terpotong di HP
        _cloneDoc.documentElement.style.width = isLandscape ? '297mm' : '210mm';
        _cloneDoc.body.style.width = isLandscape ? '297mm' : '210mm';
        _cloneDoc.body.style.margin = '0';
        _cloneDoc.body.style.padding = '0';
        _cloneDoc.body.style.overflow = 'visible';

        // Sembunyikan elemen no-print yang bukan bagian dari cloneEl agar tidak menggeser offset
        _cloneDoc.querySelectorAll('.no-print').forEach(el => {
          if (!el.contains(cloneEl) && el !== cloneEl) {
            el.style.display = 'none';
          }
        });
        cloneEl.querySelectorAll('.screen-page-guide').forEach(el => el.remove());

        // Reset semua parent wrapper agar tidak membatasi overflow / terpotong
        let parent = cloneEl.parentElement;
        while (parent && parent !== _cloneDoc.body) {
          parent.style.overflow = 'visible';
          parent.style.width = 'auto';
          parent.style.maxWidth = 'none';
          parent.style.transform = 'none';
          parent.style.margin = '0';
          parent.style.padding = '0';
          parent = parent.parentElement;
        }

        cloneEl.style.position = 'relative';
        cloneEl.style.left = '0';
        cloneEl.style.top = '0';
        cloneEl.style.opacity = '1';
        cloneEl.style.display = 'block';
        cloneEl.style.width = isLandscape ? '297mm' : '210mm';
        cloneEl.style.minWidth = isLandscape ? '297mm' : '210mm';
        cloneEl.style.maxWidth = isLandscape ? '297mm' : '210mm';
        const isSOPDocInClone = cloneEl.querySelector('.sop-table') !== null;
        cloneEl.style.padding = isSOPDocInClone ? '12mm 14mm' : (isLandscape ? '0' : '20mm');
        if (isLandscape) {
          cloneEl.style.height = 'auto';
          cloneEl.style.minHeight = '210mm';
          cloneEl.style.maxHeight = 'none';
          cloneEl.style.overflow = 'visible';
        } else {
          cloneEl.style.overflow = 'visible';
        }
        cloneEl.style.transform = 'none';
        cloneEl.style.margin = '0';
        cloneEl.style.boxSizing = 'border-box';

        const origEls  = [printArea, ...printArea.querySelectorAll('*')];
        const cloneEls = [cloneEl,   ...cloneEl.querySelectorAll('*')];
        const keyProps = [
          'color','background-color',
          'border-top-color','border-right-color',
          'border-bottom-color','border-left-color',
        ];
        origEls.forEach((el, i) => {
          if (!cloneEls[i]) return;
          const cs = window.getComputedStyle(el);
          keyProps.forEach(p => {
            const v = cs.getPropertyValue(p);
            if (v && v !== 'rgba(0, 0, 0, 0)' && v !== 'transparent')
              cloneEls[i].style.setProperty(p, v, 'important');
          });
        });

        // Ambil koordinat atomik LANGSUNG dari elemen clone untuk akurasi pemotongan 100%
        const isSOPDoc = cloneEl.querySelector('.sop-table') !== null;
        const cRect = cloneEl.getBoundingClientRect();
        const detected = [];
        const rawAtomic = isSOPDoc
          ? cloneEl.querySelectorAll('.sop-table > tbody > tr, .sop-table > tr, .sop-atomic-row, .sop-item-step, .sop-table tr td > div')
          : cloneEl.querySelectorAll('.pdf-atomic, tr, img, p, h1, h2, h3, h4, h5, h6');

        rawAtomic.forEach(el => {
          const r = el.getBoundingClientRect();
          const top = (r.top - cRect.top) * SCALE;
          const bot = (r.bottom - cRect.top) * SCALE;
          if (bot > 0 && bot - top > 2) {
            detected.push({ top, bottom: bot, height: bot - top });
          }
        });
        detected.sort((a, b) => a.top - b.top);
        cloneLeafPositions = detected;

        // Rekam koordinat kotak teks Halaman di header SOP untuk diisi nomor halaman akurat
        const halEl = cloneEl.querySelector('.sop-halaman-val');
        if (halEl && cRect.width > 0) {
          const hr = halEl.getBoundingClientRect();
          const pdfDocWidth = isLandscape ? 297 : 210;
          cloneSopHalamanBoxMm = {
            x: (hr.left - cRect.left) * (pdfDocWidth / cRect.width),
            y: (hr.top - cRect.top) * (pdfDocWidth / cRect.width),
            w: hr.width * (pdfDocWidth / cRect.width),
            h: hr.height * (pdfDocWidth / cRect.width),
          };
        }
      },
    });

    // ── Setup PDF A4 & Parameter Margin ────────────────────────────
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pdfW = pdf.internal.pageSize.getWidth();   // 297 mm landscape, 210 mm portrait
    const pdfH = pdf.internal.pageSize.getHeight();  // 210 mm landscape, 297 mm portrait

    // Khusus Sertifikat: Selalu 1 Halaman Penuh Landscape A4 Presisi Tinggi Tanpa Slicing
    if (isLandscape) {
      const certDataUrl = canvas.toDataURL('image/png');
      pdf.addImage(certDataUrl, 'PNG', 0, 0, pdfW, pdfH);
      pdf.pageDataUrls = [certDataUrl];
      pdf.totalPagesCount = 1;
      return pdf;
    }

    const isSOPDocument = currentPrintDoc?.templateType === 'SOP' || currentPrintDoc?.typeCode === 'SOP' || currentPrintDoc?.sopData !== undefined;
    const fullPageHeightCanvas = (pdfH / pdfW) * canvas.width;
    const marginMm             = isSOPDocument ? 10 : 18;
    const marginCanvas         = Math.round((marginMm / pdfW) * canvas.width);
    const bottomMarginCanvas   = Math.round((marginMm / pdfH) * fullPageHeightCanvas);

    const leafPositions = cloneLeafPositions.length > 0 ? cloneLeafPositions : [
      { top: 0, bottom: canvas.height, height: canvas.height }
    ];

    // ── Scanner Celah Baris Bersih (Mencari spasi putih antar baris teks agar teks tidak terbelah di tengah huruf) ──
    const findCleanLineCut = (targetY, minY) => {
      try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const searchRange = Math.round(28 * SCALE);
        const searchTop = Math.max(Math.round(minY + (10 * SCALE)), Math.round(targetY - searchRange));
        const searchBot = Math.min(canvas.height - 1, Math.round(targetY));
        if (searchBot <= searchTop) return Math.round(targetY);

        const sampleX = Math.round(canvas.width * 0.15);
        const sampleW = Math.round(canvas.width * 0.70);

        let bestY = searchBot;
        let minDarkCount = Infinity;

        for (let y = searchBot; y >= searchTop; y--) {
          const rowData = ctx.getImageData(sampleX, y, sampleW, 1).data;
          let darkCount = 0;
          for (let i = 0; i < rowData.length; i += 4) {
            if (rowData[i] < 215 || rowData[i+1] < 215 || rowData[i+2] < 215) {
              darkCount++;
            }
          }
          // Jika baris ini benar-benar celah putih bersih antar baris teks
          if (darkCount === 0) {
            return y;
          }
          if (darkCount < minDarkCount) {
            minDarkCount = darkCount;
            bestY = y;
          }
        }
        return bestY;
      } catch (err) {
        console.warn('findCleanLineCut error, fallback to targetY', err);
        return Math.round(targetY);
      }
    };

    // ── Algoritma Pemotongan Halaman Cerdas Tanpa Potong Teks & Tanpa Halaman Kosong (Anti Ngegantung) ─────────
    const findSafeCutCanvas = (targetEnd, fromY) => {
      if (targetEnd >= canvas.height) return canvas.height;

      const pageUsableH = fullPageHeightCanvas - marginCanvas - bottomMarginCanvas;
      const maxWastedH  = 45 * SCALE; // Maksimal ruang kosong yang diizinkan sebelum beralih ke potong celah baris teks

      // 1. Cek apakah targetEnd membelah elemen atomik (top < targetEnd && bottom > targetEnd)
      for (let i = 0; i < leafPositions.length; i++) {
        const { top: lTop, bottom: lBot, height: lH } = leafPositions[i];
        if (lTop <= fromY) continue;
        if (lTop >= targetEnd) break;

        if (lBot > targetEnd) {
          const unusedIfPush = targetEnd - lTop;

          // Jika memotong di lTop akan membuang ruang berlebihan (> maxWastedH), JANGAN potong di lTop!
          // Karena jika dipotong di lTop, halaman akan kosong melompong (ngegantung).
          // Sebaliknya, potong bersih di celah antar baris teks mendekati targetEnd!
          if (unusedIfPush > maxWastedH || lH > pageUsableH) {
            return findCleanLineCut(targetEnd, lTop);
          }

          // Elemen ini baru saja mulai dekat batas bawah, aman dipotong di atasnya
          const safeCut = Math.round(lTop);
          if (safeCut > fromY + (30 * SCALE)) {
            return safeCut;
          }
          return findCleanLineCut(targetEnd, fromY);
        }
      }

      // 2. Jika tidak ada elemen yang membelah targetEnd, cari batas elemen terdekat
      let lastFitBot = fromY;
      for (let i = 0; i < leafPositions.length; i++) {
        const { top: lTop, bottom: lBot } = leafPositions[i];
        if (lTop <= fromY) continue;
        if (lTop >= targetEnd) break;
        if (lBot <= targetEnd && lBot > lastFitBot) {
          lastFitBot = lBot;
        }
      }

      if (lastFitBot > fromY + (30 * SCALE) && (targetEnd - lastFitBot) <= maxWastedH) {
        return Math.round(lastFitBot);
      }

      return findCleanLineCut(targetEnd, fromY);
    };

    // ── Generate Halaman-Halaman PDF ───────────────────────────────
    let currentY = 0;
    let pageIdx  = 0;
    const maxContentBottom = leafPositions.length > 0
      ? Math.max(...leafPositions.map(l => l.bottom))
      : canvas.height;

    const pageCanvases = [];

    while (currentY < canvas.height - 5 && pageIdx < 50) {
      const remainingH = canvas.height - currentY;
      if (pageIdx > 0 && (remainingH <= (25 * SCALE) || currentY >= maxContentBottom - (5 * SCALE))) {
        break; // Jika semua konten sudah masuk halaman sebelumnya, jangan buat halaman baru
      }

      let destY;
      let targetEnd;

      if (pageIdx === 0) {
        destY     = 0;
        targetEnd = fullPageHeightCanvas - bottomMarginCanvas;
      } else {
        destY = marginCanvas;
        const usableHeight = fullPageHeightCanvas - marginCanvas - bottomMarginCanvas;
        targetEnd = currentY + usableHeight;
      }

      const cutY = (targetEnd >= canvas.height || targetEnd >= maxContentBottom)
        ? canvas.height
        : findSafeCutCanvas(targetEnd, currentY);

      const sliceH = Math.ceil(cutY - currentY);
      if (sliceH <= 0) break;
      if (pageIdx > 0 && sliceH <= (15 * SCALE) && cutY >= canvas.height) break;

      const sl = document.createElement('canvas');
      sl.width  = canvas.width;
      sl.height = Math.round(fullPageHeightCanvas);
      const sc  = sl.getContext('2d');
      sc.fillStyle = '#ffffff';
      sc.fillRect(0, 0, sl.width, sl.height);

      // Gambar potongan konten dokumen alami
      sc.drawImage(canvas, 0, currentY, canvas.width, sliceH, 0, destY, canvas.width, sliceH);

      // Jika dokumen SOP dan terbelah antar halaman, tutup garis batas tabel agar rapi
      if (isSOPDocument) {
        const tableMarginX = Math.round((14 / pdfW) * canvas.width);
        const tableRightX  = canvas.width - tableMarginX;
        sc.strokeStyle = '#000000';
        sc.lineWidth = 1;
        // Tutup garis bawah tabel jika halaman ini bukan halaman terakhir
        if (cutY < canvas.height && cutY < maxContentBottom - (10 * SCALE)) {
          sc.beginPath();
          sc.moveTo(tableMarginX, destY + sliceH);
          sc.lineTo(tableRightX, destY + sliceH);
          sc.stroke();
        }
        // Beri garis penutup atas jika halaman lanjutan (pageIdx > 0)
        if (pageIdx > 0) {
          sc.beginPath();
          sc.moveTo(tableMarginX, destY);
          sc.lineTo(tableRightX, destY);
          sc.stroke();
        }
      }

      pageCanvases.push(sl);
      currentY = cutY;
      pageIdx++;
    }

    const totalPages = pageCanvases.length;

    // Perbarui nomor halaman di dalam Kotak Header SOP Halaman 1 agar dinamis sesuai total halaman asli
    if (isSOPDocument && cloneSopHalamanBoxMm && pageCanvases[0]) {
      try {
        const sc0 = pageCanvases[0].getContext('2d');
        const scaleMmToPx = canvas.width / pdfW;
        const boxX = cloneSopHalamanBoxMm.x * scaleMmToPx;
        const boxY = cloneSopHalamanBoxMm.y * scaleMmToPx;
        const boxW = Math.max(cloneSopHalamanBoxMm.w + 12, 22) * scaleMmToPx;
        const boxH = cloneSopHalamanBoxMm.h * scaleMmToPx;
        sc0.fillStyle = '#ffffff';
        sc0.fillRect(boxX - 2, boxY, boxW, boxH);
        sc0.font = `${Math.round(9.5 * SCALE * 1.33)}px Arial, Helvetica, sans-serif`;
        sc0.fillStyle = '#000000';
        sc0.textAlign = 'left';
        sc0.fillText(`1 dari ${totalPages}`, boxX, boxY + boxH - (1.2 * scaleMmToPx));

        pdf.setPage(1);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(cloneSopHalamanBoxMm.x - 0.5, cloneSopHalamanBoxMm.y, Math.max(cloneSopHalamanBoxMm.w + 12, 22), cloneSopHalamanBoxMm.h, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`1 dari ${totalPages}`, cloneSopHalamanBoxMm.x, cloneSopHalamanBoxMm.y + cloneSopHalamanBoxMm.h - 1.2);
      } catch (err) {
        console.warn('Gagal update header box canvas halaman SOP:', err);
      }
    }

    // Nomor Halaman Resmi di Bagian Bawah: langsung format "X dari Y" di canvas & tambahkan ke PDF
    const bottomOffsetPx = Math.round((5 / pdfH) * fullPageHeightCanvas);
    pageCanvases.forEach((sl, idx) => {
      const pageNum = idx + 1;
      const sc = sl.getContext('2d');
      sc.font = `${Math.round(8.5 * SCALE * 1.33)}px Arial, Helvetica, sans-serif`;
      sc.fillStyle = '#64748b';
      sc.textAlign = 'center';
      sc.fillText(`${pageNum} dari ${totalPages}`, sl.width / 2, sl.height - bottomOffsetPx);

      if (idx > 0) pdf.addPage();
      pdf.addImage(sl.toDataURL('image/png'), 'PNG', 0, 0, pdfW, pdfH);
    });

    pdf.pageDataUrls = pageCanvases.map(sl => sl.toDataURL('image/png'));
    pdf.totalPagesCount = totalPages;

    return pdf;
  };

  // PRINT AREA / VIEW DOCUMENT IF SET
  // ----------------------------------------------------
  if (currentPrintDoc && currentPrintType !== null) {
    const letterTypeMap = {
      "SM": "Surat Masuk",
      "SK": "Surat Kuasa",
      "SPm": "Surat Permohonan",
      "SOP": "Standar Operasional Prosedur (SOP)",
      "KAK": "Kerangka Acuan Kerja (KAK)",
      "Pdm": "Pedoman Tata Naskah",
      "Pedoman": "Pedoman Tata Naskah",
      "SKel": "Surat Keluar",
      "SIK": "Surat Ijin Kegiatan",
      "SPgl": "Surat Panggilan",
      "SPD": "Surat Perjalanan Dinas",
      "BA": "Berita Acara",
      "TS": "Telaahan Staf",
      "SP": "Surat Perjanjian",
      "SB": "Surat Balasan"
    };

    let printDocTitle = "Dokumen";
    let printDocSubtitle = "dokumen.pdf";

    if (currentPrintType === "cert") {
      printDocTitle = currentPrintDoc?.title || `Sertifikat ${currentPrintDoc?.activityType || 'Magang'} - ${currentPrintDoc?.name || 'Penerima'}`;
      printDocSubtitle = `${currentPrintDoc?.docNo ? String(currentPrintDoc.docNo).replace(/\//g, '_') : 'Sertifikat'}.pdf`;
    } else if (currentPrintType === "report_letters") {
      printDocTitle = `Laporan Rekapitulasi ${currentPrintDoc?.type === 'in' ? 'Surat Masuk' : currentPrintDoc?.type === 'out' ? 'Surat Keluar' : 'Persuratan'}`;
      printDocSubtitle = `Laporan_Persuratan_${currentPrintDoc?.month || '08'}_${currentPrintDoc?.year || '2026'}.pdf`;
    } else {
      const typeName = letterTypeMap[currentPrintDoc?.templateType || currentPrintDoc?.typeCode] || "Surat Keluar";
      const docSubject = currentPrintDoc?.sopData?.judulSop || currentPrintDoc?.skData?.judulSK || currentPrintDoc?.subject || currentPrintDoc?.perihal;
      printDocTitle = docSubject ? `${typeName}: ${docSubject}` : `${typeName} - ${currentPrintDoc?.docNo || ''}`;
      printDocSubtitle = `${currentPrintDoc?.docNo ? String(currentPrintDoc.docNo).replace(/\//g, '_') : 'Dokumen_Surat'}.pdf`;
    }

    const renderSafeDigitalSignature = (isLeft = false) => {
      const sigSrc = isLeft ? (currentPrintDoc?.leftSignature || null) : (currentPrintDoc?.signature || currentPrintDoc?.sopData?.signature || settings?.signature || defaultDirectorSignature);
      const stampSrc = currentPrintDoc?.stamp || currentPrintDoc?.sopData?.stamp || settings?.stamp || defaultClinicStamp;
      const showSig = (currentPrintDoc?.useDigitalSignature !== false) && (isLeft ? Boolean(currentPrintDoc?.leftSignature) : Boolean(sigSrc));
      const showStamp = !isLeft && (currentPrintDoc?.useDigitalStamp !== false) && Boolean(stampSrc);

      if (!showSig && !showStamp) {
        return (
          <div style={{ minHeight: '55px', maxHeight: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', width: '100%' }}>
            <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>&nbsp;</span>
          </div>
        );
      }

      return (
        <div style={{ minHeight: '55px', maxHeight: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0', width: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60px', width: '100%', maxWidth: '160px', overflow: 'hidden' }}>
            {showStamp && (
              <img src={stampSrc} alt="stempel" style={{ position: 'absolute', maxHeight: '56px', maxWidth: '56px', width: 'auto', height: 'auto', left: '0', opacity: 0.85, objectFit: 'contain', zIndex: 1 }} />
            )}
            {showSig && (
              <img src={sigSrc} alt="ttd" style={{ position: 'relative', maxWidth: '100%', maxHeight: '55px', width: 'auto', height: 'auto', objectFit: 'contain', zIndex: 2 }} />
            )}
          </div>
        </div>
      );
    };

    const renderLampiranDocument = (isSKep = true) => {
      const clinicUpper = (settings?.clinicName || 'KLINIK BAITURRAHMAN').replace(/ GARUT$/i, '').toUpperCase();
      const typeName = letterTypeMap[currentPrintDoc?.templateType || currentPrintDoc?.typeCode] || "Surat";
      const typeNameUpper = typeName.toUpperCase();
      
      const nomor = isSKep
        ? (currentPrintDoc.skData?.noSK || currentPrintDoc.docNo || '...../...../...../...../K-BTR/.......')
        : (currentPrintDoc.lampiranData?.nomor || currentPrintDoc.docNo || '...../...../...../...../K-BTR/.......');
        
      const tentang = isSKep
        ? (currentPrintDoc.skData?.judulSK || currentPrintDoc.subject || '.....................................................')
        : (currentPrintDoc.lampiranData?.tentang || currentPrintDoc.subject || '.....................................................');

      const kota = (isSKep ? currentPrintDoc.skData?.ditetapkanDi : currentPrintDoc.lampiranData?.ditetapkanDi) || settings?.city || 'Garut';
      const tgl = (isSKep ? currentPrintDoc.skData?.tanggalSK : currentPrintDoc.lampiranData?.tanggal) || currentPrintDoc.date;
      const namaDir = (isSKep ? currentPrintDoc.skData?.namaDirektur : currentPrintDoc.lampiranData?.namaDirektur) || currentPrintDoc.signatory || settings?.directorName || 'NAMA LENGKAP';
      const nikDir = (isSKep ? currentPrintDoc.skData?.nikDirektur : currentPrintDoc.lampiranData?.nikDirektur) || settings?.directorNik || settings?.nik || '...........................';

      const defaultBabs = [
        { 
          title: "BAB I\nPENDAHULUAN", 
          items: [
            { title: "Latar Belakang", content: "" },
            { title: "Maksud dan Tujuan", content: "" },
            { title: "Sasaran", content: "" },
            { title: "Asas", content: "" },
            { title: "Ruang Lingkup", content: "" },
            { title: "Pengertian Umum", content: "" }
          ],
          tables: [],
          images: []
        },
        { 
          title: "BAB II\n..................................", 
          items: [
            { title: "", content: "" },
            { title: "", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [],
          images: []
        },
        { 
          title: "BAB III\n..................................", 
          items: [
            { title: "", content: "" },
            { title: "", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [],
          images: []
        },
        { 
          title: "BAB IV\nPENUTUP", 
          items: [
            { title: "", content: "" },
            { title: "", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [],
          images: []
        }
      ];

      const rawBabs = isSKep 
        ? (currentPrintDoc.skData?.lampiran || defaultBabs)
        : (currentPrintDoc.lampiranData?.lampiran || currentPrintDoc.lampiran || defaultBabs);

      const babs = Array.isArray(rawBabs) ? rawBabs : defaultBabs;

      return (
        <div className="lampiran-page" style={{ pageBreakBefore: 'always', breakBefore: 'page', paddingTop: '2.5rem', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000' }}>
          {/* Header Top-Right Lampiran (Sesuai Naskah Dinas Resmi Klinik Baiturrahman) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
            <div style={{ width: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textTransform: 'uppercase', fontSize: '10pt', fontWeight: 'bold', lineHeight: '1.4' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '85px', verticalAlign: 'top', padding: '2px 0' }}>LAMPIRAN</td>
                    <td style={{ width: '15px', verticalAlign: 'top', textAlign: 'center', padding: '2px 0' }}>:</td>
                    <td style={{ verticalAlign: 'top', padding: '2px 0' }}>
                      {isSKep ? `KEPUTUSAN DIREKTUR ${clinicUpper}` : `${typeNameUpper} DIREKTUR ${clinicUpper}`}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'top', padding: '2px 0' }}>NOMOR</td>
                    <td style={{ verticalAlign: 'top', textAlign: 'center', padding: '2px 0' }}>:</td>
                    <td style={{ verticalAlign: 'top', padding: '2px 0' }}>
                      {nomor}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ verticalAlign: 'top', padding: '2px 0' }}>{isSKep ? 'TENTANG' : 'PERIHAL'}</td>
                    <td style={{ verticalAlign: 'top', textAlign: 'center', padding: '2px 0' }}>:</td>
                    <td style={{ verticalAlign: 'top', padding: '2px 0' }}>
                      {tentang}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Konten BAB-BAB Lampiran */}
          {babs.map((bab, bIdx) => (
            <div key={bIdx} style={{ marginBottom: '2.25rem' }}>
              {/* Judul BAB (Tengah & Huruf Tebal) */}
              <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1.25rem', fontSize: '11pt', lineHeight: '1.4' }}>
                {bab.title?.split('\n').map((line, l) => (
                  <div key={l} style={{ textTransform: 'uppercase' }}>{line}</div>
                )) || <div>BAB {bIdx + 1}</div>}
              </div>

              {/* Sub-item (A, B, C...) */}
              {bab.items && bab.items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: (bab.tables?.length || bab.images?.length) ? '1.5rem' : 0 }}>
                  {bab.items.map((rawItem, iIdx) => {
                    const itemTitle = typeof rawItem === 'string' ? rawItem : (rawItem?.title || '');
                    const itemContent = typeof rawItem === 'object' ? (rawItem?.content || '') : '';
                    
                    if (itemTitle.toLowerCase().startsWith('dst')) {
                      return (
                        <div key={iIdx} style={{ fontWeight: 'bold', paddingLeft: '28px', marginTop: '0.2rem' }}>
                          {itemTitle}
                        </div>
                      );
                    }

                    return (
                      <div key={iIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <div style={{ width: '22px', fontWeight: 'bold', flexShrink: 0 }}>
                          {String.fromCharCode(65 + iIdx)}.
                        </div>
                        <div style={{ flex: 1 }}>
                          {itemTitle && <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{itemTitle}</div>}
                          {itemContent ? (
                            <div style={{ textAlign: 'justify', lineHeight: '1.5', whiteSpace: 'pre-line' }}>{itemContent}</div>
                          ) : (
                            <div style={{ borderBottom: '1.5px dotted #000', marginTop: itemTitle ? '0.35rem' : '0.85rem', marginBottom: '0.2rem', width: '100%' }}></div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tabel yang ditambahkan di BAB ini */}
              {bab.tables && bab.tables.map((tbl, tIdx) => (
                <div key={tbl.id || tIdx} style={{ margin: '1.5rem 0' }}>
                  {tbl.title && (
                    <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '0.4rem', textAlign: 'left' }}>
                      {tbl.title}
                    </div>
                  )}
                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '9.5pt', lineHeight: '1.4' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        {(tbl.headers || ['No', 'Uraian', 'Keterangan']).map((h, hIdx) => (
                          <th key={hIdx} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: hIdx === 0 ? 'center' : 'left', fontWeight: 'bold', color: '#000' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(tbl.rows && tbl.rows.length > 0 ? tbl.rows : [['', '', '']]).map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ border: '1px solid #000', padding: '6px 8px', textAlign: cIdx === 0 ? 'center' : 'left', verticalAlign: 'top', color: '#000' }}>
                              {cell || '\u00A0'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Gambar yang ditambahkan di BAB ini */}
              {bab.images && bab.images.map((img, imgIdx) => (
                <div key={img.id || imgIdx} style={{ margin: '1.75rem 0', textAlign: 'center' }}>
                  {img.title && (
                    <div style={{ fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '0.5rem', textAlign: 'center' }}>
                      {img.title}
                    </div>
                  )}
                  {img.url ? (
                    <img 
                      src={img.url} 
                      alt={img.title || `Lampiran Gambar ${imgIdx + 1}`} 
                      style={{ 
                        maxWidth: img.width || '85%', 
                        maxHeight: '400px', 
                        objectFit: 'contain', 
                        border: '1px solid #999', 
                        borderRadius: '4px',
                        padding: '4px',
                        backgroundColor: '#fff',
                        display: 'inline-block'
                      }} 
                    />
                  ) : null}
                  {img.caption && (
                    <div style={{ fontStyle: 'italic', fontSize: '9pt', marginTop: '0.4rem', color: '#333' }}>
                      {img.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* Tanda Tangan Lampiran (Kanan Bawah Sesuai Gambar) */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3.5rem', pageBreakInside: 'avoid' }}>
            <div style={{ width: '300px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10pt', lineHeight: '1.4' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '105px' }}>Ditetapkan di</td>
                    <td>: {kota}</td>
                  </tr>
                  <tr>
                    <td>Pada tanggal</td>
                    <td>: {tgl ? new Date(tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '...........................'}</td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ marginTop: '1rem', fontWeight: 'bold', lineHeight: '1.3' }}>
                DIREKTUR<br />{clinicUpper},
              </div>

              {renderSafeDigitalSignature()}

              <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                {namaDir}
              </div>
              <div>NIK. {nikDir}</div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '0.5rem',
        boxSizing: 'border-box'
      }} className="no-print">
        {/* Modal Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1050px',
          height: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          border: '1px solid var(--border-light, #e2e8f0)',
          overflow: 'hidden'
        }}>
          {/* Modal Header */}
          <div style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-light, #e2e8f0)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
              {/* Left: Icon + Title + Subtitle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={20} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#064e3b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {printDocTitle}
                    </h3>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.2rem 0.65rem',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '20px',
                      color: '#047857',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap'
                    }}>
                      📄 Total: {previewPageCount} Lembar (A4)
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', marginTop: '2px' }}>
                    {printDocSubtitle}
                  </span>
                </div>
              </div>

              {/* Desktop Header Actions */}
              <div className="preview-header-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
                {currentPrintType === "letter" && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPrintDoc(prev => {
                        if (!prev) return prev;
                        const isSK = (prev.typeCode === "SKep" || prev.templateType === "Surat Keputusan" || prev.templateType === "SKep");
                        if (isSK) {
                          const currentVal = prev.skData?.gunakanLampiran !== false;
                          return {
                            ...prev,
                            skData: { ...(prev.skData || {}), gunakanLampiran: !currentVal }
                          };
                        } else {
                          const currentVal = Boolean(prev.gunakanLampiran || prev.lampiranData?.gunakanLampiran);
                          return {
                            ...prev,
                            gunakanLampiran: !currentVal,
                            lampiranData: { ...(prev.lampiranData || {}), gunakanLampiran: !currentVal }
                          };
                        }
                      });
                    }}
                    title="Klik untuk menyalakan/mematikan halaman lampiran pada pratinjau surat ini"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #10b981',
                      backgroundColor: ((currentPrintDoc.typeCode === "SKep" || currentPrintDoc.templateType === "Surat Keputusan" || currentPrintDoc.templateType === "SKep") ? (currentPrintDoc.skData?.gunakanLampiran !== false) : Boolean(currentPrintDoc.gunakanLampiran || currentPrintDoc.lampiranData?.gunakanLampiran || (currentPrintDoc.attachments && currentPrintDoc.attachments !== "-"))) ? '#ecfdf5' : '#ffffff',
                      color: '#047857',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📑 Lampiran: {((currentPrintDoc.typeCode === "SKep" || currentPrintDoc.templateType === "Surat Keputusan" || currentPrintDoc.templateType === "SKep") ? (currentPrintDoc.skData?.gunakanLampiran !== false) : Boolean(currentPrintDoc.gunakanLampiran || currentPrintDoc.lampiranData?.gunakanLampiran || (currentPrintDoc.attachments && currentPrintDoc.attachments !== "-"))) ? 'Aktif ✓' : 'Nonaktif'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={async (e) => {
                    const printArea = document.querySelector('.print-area');
                    if (!printArea) return;
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    const origHTML = btn.innerHTML;
                    btn.innerHTML = '⏳ Menyiapkan...';
                    try {
                      const pdf = cachedPdfResultRef.current || await generateDocPdf(printArea);
                      const blob = pdf.output('blob');
                      const blobUrl = URL.createObjectURL(blob);
                      window.open(blobUrl, '_blank');
                    } catch (err) {
                      console.error('Preview error:', err);
                      alert('Gagal membuka pratinjau dokumen: ' + err.message);
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = origHTML;
                    }
                  }}
                  title="Buka di Tab Baru"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <ExternalLink size={14} /> Buka di Tab Baru
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    const printArea = document.querySelector('.print-area');
                    if (!printArea) return;
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    const origHTML = btn.innerHTML;
                    btn.innerHTML = '⏳ Mengunduh...';
                    try {
                      const pdf = cachedPdfResultRef.current || await generateDocPdf(printArea);
                      pdf.save(`Dokumen_${currentPrintDoc?.docNo || currentPrintDoc?.id || 'MEDIKARA'}.pdf`);
                    } catch (err) {
                      console.error('PDF download error:', err);
                      alert('Gagal unduh PDF: ' + err.message);
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = origHTML;
                    }
                  }}
                  title="Unduh Berkas PDF"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 1.1rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#15803d',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Download size={14} /> Unduh
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPrintDoc(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                  title="Tutup"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Mobile Header Actions */}
            <div className="preview-header-mobile-actions" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={async (e) => {
                  const printArea = document.querySelector('.print-area');
                  if (!printArea) return;
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  const origHTML = btn.innerHTML;
                  btn.innerHTML = '⏳ Menyiapkan...';
                  try {
                    const pdf = cachedPdfResultRef.current || await generateDocPdf(printArea);
                    const blob = pdf.output('blob');
                    const blobUrl = URL.createObjectURL(blob);
                    window.open(blobUrl, '_blank');
                  } catch (err) {
                    console.error('Preview error:', err);
                    alert('Gagal membuka pratinjau dokumen: ' + err.message);
                  } finally {
                    btn.disabled = false;
                    btn.innerHTML = origHTML;
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <ExternalLink size={14} /> Buka di Tab Baru
              </button>
              <button
                type="button"
                onClick={async (e) => {
                  const printArea = document.querySelector('.print-area');
                  if (!printArea) return;
                  const btn = e.currentTarget;
                  btn.disabled = true;
                  const origHTML = btn.innerHTML;
                  btn.innerHTML = '⏳ Mengunduh...';
                  try {
                    const pdf = cachedPdfResultRef.current || await generateDocPdf(printArea);
                    pdf.save(`Dokumen_${currentPrintDoc?.docNo || currentPrintDoc?.id || 'MEDIKARA'}.pdf`);
                  } catch (err) {
                    console.error('PDF download error:', err);
                    alert('Gagal unduh PDF: ' + err.message);
                  } finally {
                    btn.disabled = false;
                    btn.innerHTML = origHTML;
                  }
                }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Download size={14} /> Unduh
              </button>
            </div>
          </div>

          {/* Modal Body: Document Paper Canvas */}
          <div style={{
            flex: 1,
            backgroundColor: '#525659',
            position: 'relative',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '1.5rem 0.5rem 3rem',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Scrollable Center Wrapper so document never gets negative left on mobile */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 'max-content',
              minWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {/* TAMPILAN LEMBAR-LEMBAR HALAMAN RESMI DENGAN SEKAT ANTAR HALAMAN (A4) */}
              {previewPages.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px', // ── SEKAT ANTAR LEMBAR PERSIS SEPERTI DI PDF VIEWER ──
                  boxSizing: 'border-box'
                }}>
                  {previewPages.map((pageImg, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: '#ffffff',
                        width: currentPrintType === 'cert' ? '297mm' : '210mm',
                        minWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                        maxWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                        height: 'auto',
                        aspectRatio: currentPrintType === 'cert' ? '297 / 210' : '210 / 297',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        boxSizing: 'border-box',
                        position: 'relative',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={pageImg}
                        alt={`Halaman ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  ))}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    borderRadius: '20px',
                    color: '#e2e8f0',
                    fontSize: '0.78rem',
                    marginTop: '0.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}>
                    <FileText size={13} style={{ color: '#34d399' }} />
                    <span>Dokumen Resmi Klinik Baiturrahman • Total {previewPages.length} Lembar (A4)</span>
                  </div>
                </div>
              )}

              {/* LOADING SKELETON LEMBAR A4 */}
              {isPreviewLoading && previewPages.length === 0 && (
                <div style={{
                  backgroundColor: '#ffffff',
                  width: currentPrintType === 'cert' ? '297mm' : '210mm',
                  minWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                  maxWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                  minHeight: currentPrintType === 'cert' ? '210mm' : '297mm',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3rem 1.5rem',
                  boxSizing: 'border-box',
                  color: '#475569',
                  borderRadius: '2px'
                }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    marginBottom: '1rem'
                  }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' }}>
                    Menyiapkan Pratinjau Lembar Dokumen A4...
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Menyusun tata letak lembar dokumen resmi dengan sekat halaman
                  </div>
                </div>
              )}

              {/* Real official printed output source (rendered for html2canvas to capture) */}
              <div style={{ 
                position: (previewPages.length > 0 || isPreviewLoading) ? 'fixed' : 'relative',
                left: (previewPages.length > 0 || isPreviewLoading) ? '-9999px' : 'auto',
                top: 0,
                opacity: (previewPages.length > 0 || isPreviewLoading) ? 0 : 1,
                pointerEvents: (previewPages.length > 0 || isPreviewLoading) ? 'none' : 'auto',
                zIndex: -1,
                backgroundColor: '#ffffff', 
                width: currentPrintType === 'cert' ? '297mm' : '210mm', 
                minWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                maxWidth: currentPrintType === 'cert' ? '297mm' : '210mm',
                height: 'auto',
                minHeight: currentPrintType === 'cert' ? '210mm' : '297mm',
                padding: currentPrintType === 'cert' ? '0' : (currentPrintDoc?.templateType === 'SOP' || currentPrintDoc?.typeCode === 'SOP') ? '12mm 14mm' : '20mm', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', 
                color: '#000', 
                fontFamily: currentPrintType === 'letter' ? 'Calibri, sans-serif' : 'serif',
                fontSize: currentPrintType === 'letter' ? '12pt' : 'inherit',
                boxSizing: 'border-box',
                flexShrink: 0,
                overflow: 'visible'
              }} className="print-area">
          
          {currentPrintType === "letter" && (
            <div style={{ lineHeight: '1.5', fontSize: '12pt' }}>
              {/* KONDISI KHUSUS SOP */}
              {(currentPrintDoc.templateType === "SOP" || currentPrintDoc.typeCode === "SOP") ? (
                <div style={{ lineHeight: '1.45', fontSize: '10.5pt', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000' }}>
                  {/* ===== TABEL SOP UTUH SESUAI FORMAT RESMI KLINIK ===== */}
                  <table className="sop-table" style={{ width: '100%', borderCollapse: 'collapse', border: '0.5px solid #000000', fontSize: '10pt', lineHeight: '1.45', tableLayout: 'fixed', backgroundColor: '#ffffff' }}>
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '35%' }} />
                      <col style={{ width: '30%' }} />
                    </colgroup>
                    <tbody>
                      {/* Baris 1: Logo (Col 1, rowspan 5) | Judul SOP (Col 2-4, colspan 3) */}
                      <tr className="pdf-atomic">
                        <td rowSpan="5" style={{ border: '0.5px solid #000000', textAlign: 'center', padding: '0.4rem', verticalAlign: 'middle' }}>
                          <img src={settings?.logo || "/logo.png"} width="95" height="95" alt="Logo" style={{ width: '90px', height: 'auto', maxHeight: '95px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
                        </td>
                        <td colSpan="3" style={{ border: '0.5px solid #000000', textAlign: 'center', padding: '0.5rem 0.6rem', fontWeight: 'bold', fontSize: '11pt', textTransform: 'uppercase', letterSpacing: '0.02em', verticalAlign: 'middle' }}>
                          {currentPrintDoc.sopData?.judulSop || currentPrintDoc.subject || 'JUDUL SOP'}
                        </td>
                      </tr>

                      {/* Baris 2: SOP (Col 2, rowspan 4) | No. Dokumen (Col 3-4, colspan 2) */}
                      <tr className="pdf-atomic">
                        <td rowSpan="4" style={{ border: '0.5px solid #000000', textAlign: 'center', fontWeight: 'bold', fontSize: '16pt', verticalAlign: 'middle', padding: '0.4rem' }}>
                          SOP
                        </td>
                        <td colSpan="2" style={{ border: '0.5px solid #000000', padding: '0.22rem 0.6rem', fontSize: '9.5pt' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '110px' }}>No. Dokumen</span>
                            <span>:&nbsp;&nbsp;</span>
                            <span>{currentPrintDoc.sopData?.noDokumen || ''}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Baris 3: No. Revisi (Col 3-4, colspan 2) */}
                      <tr className="pdf-atomic">
                        <td colSpan="2" style={{ border: '0.5px solid #000000', padding: '0.22rem 0.6rem', fontSize: '9.5pt' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '110px' }}>No. Revisi</span>
                            <span>:&nbsp;&nbsp;</span>
                            <span>{currentPrintDoc.sopData?.noRevisi || '-'}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Baris 4: Tanggal Terbit (Col 3-4, colspan 2) */}
                      <tr className="pdf-atomic">
                        <td colSpan="2" style={{ border: '0.5px solid #000000', padding: '0.22rem 0.6rem', fontSize: '9.5pt' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '110px' }}>Tanggal Terbit</span>
                            <span>:&nbsp;&nbsp;</span>
                            <span>{currentPrintDoc.sopData?.tanggalTerbit ? new Date(currentPrintDoc.sopData.tanggalTerbit).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Baris 5: Halaman (Col 3-4, colspan 2) */}
                      <tr className="pdf-atomic">
                        <td colSpan="2" style={{ border: '0.5px solid #000000', padding: '0.22rem 0.6rem', fontSize: '9.5pt' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ width: '110px' }}>Halaman</span>
                            <span>:&nbsp;&nbsp;</span>
                            <span className="sop-halaman-val">
                              {`1 dari ${previewPageCount || 1}`}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Baris 6: KLINIK BAITURRAHMAN (Col 1) | Direktur (Col 2-3) | Kotak Kanan TTD (Col 4) */}
                      <tr className="pdf-atomic">
                        <td style={{ border: '0.5px solid #000000', textAlign: 'center', padding: '0.45rem 0.3rem', fontWeight: 'bold', fontSize: '9.5pt', verticalAlign: 'middle', lineHeight: '1.25' }}>
                          KLINIK<br />BAITURRAHMAN
                        </td>
                        <td colSpan="2" style={{ border: '0.5px solid #000000', textAlign: 'center', padding: '0.25rem 0.4rem 0.3rem', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 'bold', textDecoration: 'underline', fontSize: '10.5pt', lineHeight: '1.15' }}>
                            {currentPrintDoc.sopData?.namaDirektur || currentPrintDoc.signatory || settings.directorName || 'dr. H. Asep Maryaman'}
                          </div>
                          <div style={{ fontWeight: 'bold', fontSize: '9pt', marginTop: '1px', lineHeight: '1.15' }}>
                            NIK : {currentPrintDoc.sopData?.nikDirektur || '1.21.2'}
                          </div>
                        </td>
                        <td style={{ border: '0.5px solid #000000', textAlign: 'center', padding: '0.2rem 0.4rem', verticalAlign: 'middle', height: '55px', overflow: 'hidden' }}>
                          {(() => {
                            const showSopSig = (currentPrintDoc?.useDigitalSignature !== false);
                            const showSopStamp = (currentPrintDoc?.useDigitalStamp !== false);
                            const sopStampSrc = currentPrintDoc?.sopData?.stamp || currentPrintDoc?.stamp || settings?.stamp || defaultClinicStamp;
                            const sopSigSrc = currentPrintDoc?.sopData?.signature || currentPrintDoc?.signature || settings?.signature || defaultDirectorSignature;

                            if (!showSopSig && !showSopStamp) {
                              return <span style={{ fontSize: '8pt', color: '#999', fontStyle: 'italic' }}>&nbsp;</span>;
                            }

                            return (
                              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50px', width: '100%', overflow: 'hidden' }}>
                                {showSopStamp && sopStampSrc && (
                                  <img 
                                    src={sopStampSrc} 
                                    alt="stempel" 
                                    style={{ position: 'absolute', maxHeight: '48px', maxWidth: '48px', width: 'auto', height: 'auto', left: '5%', opacity: 0.85, objectFit: 'contain', zIndex: 1 }} 
                                  />
                                )}
                                {showSopSig && sopSigSrc && (
                                  <img
                                    src={sopSigSrc}
                                    alt="TTD Digital"
                                    style={{
                                      maxWidth: '100%',
                                      maxHeight: '48px',
                                      width: 'auto',
                                      height: 'auto',
                                      objectFit: 'contain',
                                      zIndex: 2,
                                      display: 'block',
                                      margin: '0 auto'
                                    }}
                                  />
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>

                      {/* Dynamic Sections Loop - Satu baris utuh rapi per bagian tanpa pembagi garis horizontal atau teks lanjutan berulang (Sesuai Tampilan Resmi) */}
                      {(currentPrintDoc.sopData?.sections || [
                        { title: "Pengertian", items: [currentPrintDoc.sopData?.pengertian || ""] },
                        { title: "Tujuan", items: [currentPrintDoc.sopData?.tujuan || ""] },
                        { title: "Kebijakan", items: [currentPrintDoc.sopData?.kebijakan || ""] },
                        { title: "Referensi", items: [currentPrintDoc.sopData?.referensi || ""] },
                        { title: "Prosedur / Langkah-Langkah", items: currentPrintDoc.sopData?.langkahLangkah || [""] },
                        { title: "Hal-Hal yang Perlu Diperhatikan", items: [currentPrintDoc.sopData?.halDiperhatikan || ""] },
                        { title: "Unit Terkait", items: [currentPrintDoc.sopData?.unitTerkait || ""] },
                        { title: "Dokumen Terkait", items: [currentPrintDoc.sopData?.dokumenTerkait || ""] }
                      ]).map((section, idx) => {
                        if (!section.title && (!section.items || section.items.join('').trim() === '')) return null;
                        
                        return (
                          <tr key={idx} className="pdf-atomic">
                            <td style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem', verticalAlign: 'top', fontWeight: 'bold', fontSize: '10pt', color: '#000' }}>
                              {idx + 1}.&nbsp;&nbsp;{section.title}
                            </td>
                            <td colSpan="3" style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem', textAlign: 'justify', fontSize: '10pt', color: '#000' }}>
                              {section.items.map((item, iIdx) => (
                                <div key={iIdx} style={{ display: 'flex', gap: '0.45rem', marginBottom: section.items.length > 1 ? '0.35rem' : '0', alignItems: 'flex-start' }}>
                                  {section.items.length > 1 && <span style={{ minWidth: '18px', fontWeight: 'normal' }}>{iIdx + 1}.</span>}
                                  <span style={{ flex: 1, whiteSpace: 'pre-line', textAlign: 'justify' }}>{item}</span>
                                </div>
                              ))}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Bagan Alir (Image) */}
                      <tr className="pdf-atomic">
                        <td style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem', verticalAlign: 'top', fontWeight: 'bold', fontSize: '10pt', color: '#000' }}>
                          {(currentPrintDoc.sopData?.sections?.length || 8) + 1}.&nbsp;&nbsp;Bagan Alir
                        </td>
                        <td colSpan="3" style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem', textAlign: 'center' }}>
                          {currentPrintDoc.sopData?.baganAlirImage ? (
                            <img src={currentPrintDoc.sopData.baganAlirImage} width="500" alt="Bagan Alir" style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#888', fontStyle: 'italic', fontSize: '9pt' }}>(Bagan Alir)</span>
                          )}
                        </td>
                      </tr>

                      {/* Rekam Historis Perubahan */}
                      <tr className="pdf-atomic">
                        <td style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem', verticalAlign: 'top', fontWeight: 'bold', fontSize: '10pt', color: '#000' }}>
                          {(currentPrintDoc.sopData?.sections?.length || 8) + 2}.&nbsp;Rekam<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Historis<br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Perubahan
                        </td>
                        <td colSpan="3" style={{ border: '0.5px solid #000000', padding: '0.45rem 0.65rem' }}>
                          <table className="sop-table" style={{ width: '100%', borderCollapse: 'collapse', border: '0.5px solid #000000', fontSize: '9.5pt' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#ffffff' }}>
                                <th style={{ border: '0.5px solid #000000', padding: '0.3rem 0.4rem', textAlign: 'center', width: '35px', fontWeight: 'bold' }}>No</th>
                                <th style={{ border: '0.5px solid #000000', padding: '0.3rem 0.4rem', textAlign: 'center', fontWeight: 'bold' }}>Yang Diubah</th>
                                <th style={{ border: '0.5px solid #000000', padding: '0.3rem 0.4rem', textAlign: 'center', fontWeight: 'bold' }}>Isi Perubahan</th>
                                <th style={{ border: '0.5px solid #000000', padding: '0.3rem 0.4rem', textAlign: 'center', width: '130px', fontWeight: 'bold' }}>Tanggal Mulai Diberlakukan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentPrintDoc.sopData?.rekamHistoris?.map((rh, i) => (
                                <tr key={i}>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem', textAlign: 'center' }}>{rh.no || i + 1}</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem' }}>{rh.yangDiubah || ''}</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem' }}>{rh.isiPerubahan || ''}</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem', textAlign: 'center' }}>{rh.tanggalMulai ? new Date(rh.tanggalMulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}</td>
                                </tr>
                              ))}
                              {(!currentPrintDoc.sopData?.rekamHistoris || currentPrintDoc.sopData.rekamHistoris.length === 0) && (
                                <tr>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem', textAlign: 'center' }}>1</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem' }}>&nbsp;</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem' }}>&nbsp;</td>
                                  <td style={{ border: '0.5px solid #000000', padding: '0.25rem 0.4rem' }}>&nbsp;</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (currentPrintDoc.templateType === "SKep" || currentPrintDoc.typeCode === "SKep" || currentPrintDoc.templateType === "Surat Keputusan") ? (
                <div style={{ lineHeight: '1.5', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {/* Kop Surat SKep */}
                  <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '2px solid black', paddingBottom: '0.5rem' }}>
                    <img src={settings?.logo || "/logo.png"} width="80" height="80"  alt="Logo" style={{ width: '80px', height: 'auto', display: 'block', margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '11pt', marginBottom: '2px' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</div>
                    <div style={{ fontSize: '14pt', fontWeight: 'bold', marginBottom: '2px' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'}</div>
                    <div style={{ fontSize: '10pt', marginBottom: '2px' }}>{formatSertifikatStandar(settings?.nib)}</div>
                    <div style={{ fontSize: '9pt', fontStyle: 'italic', marginBottom: '2px' }}>{formatKopAddress(settings)}</div>
                    <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>{settings?.email ? `Email: ${settings.email}` : 'Email: klinikbaiturrahman@rocketmail.com'}</div>
                  </div>

                  {/* Judul Keputusan */}
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                    <div>KEPUTUSAN</div>
                    <div>DIREKTUR {settings?.clinicName || 'KLINIK BAITURRAHMAN'}</div>
                    <div>NOMOR : {currentPrintDoc.skData?.noSK || '...........................................'}</div>
                    <br />
                    <div>TENTANG</div>
                    <div style={{ textTransform: 'uppercase' }}>{currentPrintDoc.skData?.judulSK || '...........................................'}</div>
                    <br />
                    <div>DENGAN RAHMAT TUHAN YANG MAHA ESA</div>
                    <br />
                    <div>DIREKTUR {settings?.clinicName || 'KLINIK BAITURRAHMAN'},</div>
                  </div>

                  {/* Konsiderans */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '120px' }}>Menimbang</td>
                        <td style={{ verticalAlign: 'top', width: '20px', textAlign: 'center' }}>:</td>
                        <td style={{ verticalAlign: 'top' }}>
                          {(currentPrintDoc.skData?.menimbang || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex' }}>
                              <div style={{ width: '25px' }}>{String.fromCharCode(97 + idx)}.</div>
                              <div style={{ flex: 1, textAlign: 'justify' }}>bahwa {item || '....................................................................................'} ;</div>
                            </div>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '120px', paddingTop: '0.75rem' }}>Mengingat</td>
                        <td style={{ verticalAlign: 'top', width: '20px', textAlign: 'center', paddingTop: '0.75rem' }}>:</td>
                        <td style={{ verticalAlign: 'top', paddingTop: '0.75rem' }}>
                          {(currentPrintDoc.skData?.mengingat || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex' }}>
                              <div style={{ width: '25px' }}>{idx + 1}.</div>
                              <div style={{ flex: 1, textAlign: 'justify' }}>{item || '....................................................................................'} ;</div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Diktum */}
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '1rem' }}>MEMUTUSKAN :</div>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '120px' }}>Menetapkan</td>
                        <td style={{ verticalAlign: 'top', width: '20px', textAlign: 'center' }}>:</td>
                        <td style={{ verticalAlign: 'top' }}>Keputusan Direktur Klinik Baiturrahman Tentang {currentPrintDoc.skData?.menetapkan || '......................................'}</td>
                      </tr>
                      {(currentPrintDoc.skData?.diktum || []).map((item, idx) => {
                        const numberWords = ["KESATU", "KEDUA", "KETIGA", "KEEMPAT", "KELIMA", "KEENAM", "KETUJUH", "KEDELAPAN", "KESEMBILAN", "KESEPULUH"];
                        return (
                          <tr key={idx}>
                            <td style={{ verticalAlign: 'top', width: '120px', textTransform: 'uppercase', fontWeight: 'bold' }}>{numberWords[idx] || `KE-${idx+1}`}</td>
                            <td style={{ verticalAlign: 'top', width: '20px', textAlign: 'center' }}>:</td>
                            <td style={{ verticalAlign: 'top', textAlign: 'justify' }}>{item || '....................................................................................'} ;</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Tanda Tangan */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <div style={{ width: '300px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr><td style={{ width: '100px' }}>Ditetapkan di</td><td>: {currentPrintDoc.skData?.ditetapkanDi || '...........................'}</td></tr>
                          <tr><td style={{ width: '100px' }}>Pada tanggal</td><td>: {currentPrintDoc.skData?.tanggalSK ? new Date(currentPrintDoc.skData.tanggalSK).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '...........................'}</td></tr>
                        </tbody>
                      </table>
                      <div style={{ marginTop: '1rem', fontWeight: 'bold', lineHeight: '1.3' }}>
                        DIREKTUR<br />{settings?.clinicName || 'KLINIK BAITURRAHMAN'},
                      </div>
                      {renderSafeDigitalSignature()}
                      <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.skData?.namaDirektur || 'NAMA LENGKAP'}</div>
                      <div>NIK. {currentPrintDoc.skData?.nikDirektur || '...........................'}</div>
                    </div>
                  </div>

                  {/* Lampiran SKep (Sesuai Standar Tata Naskah & Tampilan Gambar) */}
                  {(currentPrintDoc.skData?.gunakanLampiran !== false) && (
                    renderLampiranDocument(true)
                  )}
                </div>
              ) : (currentPrintDoc.templateType === "Kerangka Acuan Kegiatan (KAK)" || currentPrintDoc.templateType === "KAK" || currentPrintDoc.typeCode === "KAK") ? (
                <div style={{ lineHeight: '1.5', fontSize: '12pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  {/* KAK Header Sama dengan KOP, maka kita render Kop Header standar dulu */}
                  <div style={{ marginBottom: '1rem', textAlign: 'center', color: '#000', lineHeight: '1.15' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                      <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                      <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{settings.clinicName.replace(/ GARUT$/i, '')}</h1>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'normal', margin: '0 0 1px 0', color: '#000' }}>{formatSertifikatStandar(settings?.nib)}</p>
                      <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                        Email: <span style={{ textDecoration: 'underline' }}>{settings?.email || 'klinikbaiturrahman@rocketmail.com'}</span>
                      </p>
                    </div>
                    <div style={{ borderBottom: '2px solid black' }}></div>
                  </div>

                  <div style={{ textAlign: 'center', margin: '2rem 0', fontWeight: 'bold' }}>
                    <h3 style={{ fontSize: '12pt', margin: '0 0 5px 0' }}>KERANGKA ACUAN KEGIATAN / PROGRAM {currentPrintDoc.kakData?.judulProgram?.toUpperCase()}</h3>
                    <p style={{ fontSize: '12pt', margin: 0 }}>NOMOR : {currentPrintDoc.kakData?.nomor}</p>
                  </div>

                  <div style={{ margin: '0 1rem', fontSize: '12pt' }}>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>A.</div><div><div style={{ fontWeight: 'bold' }}>PENDAHULUAN</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.pendahuluan}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>B.</div><div><div style={{ fontWeight: 'bold' }}>LATAR BELAKANG</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.latarBelakang}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>C.</div><div>
                        <div style={{ fontWeight: 'bold' }}>TUJUAN UMUM DAN TUJUAN KHUSUS</div>
                        <div style={{ marginLeft: '1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}><span>1.</span><span>Tujuan Umum: {currentPrintDoc.kakData?.tujuanUmum}</span></div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}><span>2.</span><span>Tujuan Khusus: {currentPrintDoc.kakData?.tujuanKhusus}</span></div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>D.</div><div style={{ width: '100%' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>KEGIATAN POKOK DAN RINCIAN KEGIATAN</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '1rem' }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid black', padding: '0.5rem', width: '40px' }}>No</th>
                              <th style={{ border: '1px solid black', padding: '0.5rem' }}>Kegiatan Pokok</th>
                              <th style={{ border: '1px solid black', padding: '0.5rem' }}>Rincian Kegiatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentPrintDoc.kakData?.kegiatanPokok?.map((kp, i) => (
                              <tr key={i}>
                                <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', verticalAlign: 'top' }}>{i+1}</td>
                                <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>{kp.pokok}</td>
                                <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                                  {kp.rincian.map((r, rIdx) => (
                                    <div key={rIdx} style={{ display: 'flex', gap: '0.5rem' }}><span>{rIdx+1}.</span><span>{r}</span></div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>E.</div><div><div style={{ fontWeight: 'bold' }}>CARA MELAKSANAKAN KEGIATAN</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.caraMelaksanakan}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>F.</div><div><div style={{ fontWeight: 'bold' }}>SASARAN</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.sasaran}</div></div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>G.</div><div style={{ width: '100%' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>JADWAL PELAKSANAAN KEGIATAN</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '1rem', fontSize: '9pt' }}>
                          <thead>
                            <tr>
                              <th rowSpan="2" style={{ border: '1px solid black', padding: '0.2rem', width: '30px' }}>No</th>
                              <th rowSpan="2" style={{ border: '1px solid black', padding: '0.2rem' }}>Kegiatan</th>
                              <th colSpan="12" style={{ border: '1px solid black', padding: '0.2rem', textAlign: 'center' }}>Bulan</th>
                            </tr>
                            <tr>
                              {['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'].map(m => (
                                <th key={m} style={{ border: '1px solid black', padding: '0.2rem', width: '25px', textAlign: 'center' }}>{m}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentPrintDoc.kakData?.jadwal?.map((j, i) => (
                              <tr key={i}>
                                <td style={{ border: '1px solid black', padding: '0.2rem', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ border: '1px solid black', padding: '0.2rem' }}>{j.kegiatan}</td>
                                {j.bulan.map((isTrue, bIdx) => (
                                  <td key={bIdx} style={{ border: '1px solid black', padding: '0.2rem', textAlign: 'center' }}>
                                    {isTrue ? '✔' : ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>H.</div><div><div style={{ fontWeight: 'bold' }}>EVALUASI PELAKSANAAN KEGIATAN DAN PELAPORAN</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.evaluasi}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>I.</div><div><div style={{ fontWeight: 'bold' }}>PENCATATAN, PELAPORAN DAN EVALUASI</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.pencatatan}</div></div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ fontWeight: 'bold' }}>J.</div><div><div style={{ fontWeight: 'bold' }}>RENCANA PEMBIAYAAN DAN ANGGARAN KEGIATAN</div><div style={{ textAlign: 'justify' }}>{currentPrintDoc.kakData?.pembiayaan}</div></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <div style={{ width: '250px' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div>Garut, {new Date(currentPrintDoc.date || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        <div style={{ fontWeight: 'bold' }}>DIREKTUR</div>
                        <div style={{ fontWeight: 'bold' }}>{settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()},</div>
                      </div>
                      {renderSafeDigitalSignature()}
                      <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.signatory || settings.directorName || "NAMA LENGKAP"}</div>
                      <div>NIK. ..............................</div>
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "Pedoman" || currentPrintDoc.templateType === "Pdm" || currentPrintDoc.typeCode === "Pdm") ? (
                <div style={{ lineHeight: '1.5' }}>
                  {/* Top Right Header */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem', fontSize: '10pt', fontWeight: 'bold' }}>
                    <div style={{ width: '380px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '70px 10px 1fr' }}>
                        <div>LAMPIRAN</div>
                        <div>:</div>
                        <div>KEPUTUSAN DIREKTUR {settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()}</div>
                        <div>NOMOR</div>
                        <div>:</div>
                        <div>{currentPrintDoc.pedomanData?.lampiranNomor || ".........................."}</div>
                        <div>TENTANG</div>
                        <div>:</div>
                        <div>{currentPrintDoc.pedomanData?.lampiranTentang || ".........................."}</div>
                      </div>
                    </div>
                  </div>

                  {/* Body Pedoman */}
                  <div style={{ margin: '0 1rem' }}>
                    {(currentPrintDoc.pedomanData?.babs || []).map((bab, bIdx) => (
                      <div key={bIdx} style={{ marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                          <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 2px 0' }}>BAB {romanize(bIdx + 1)}</h3>
                          <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0', textTransform: 'uppercase' }}>{bab.title}</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {bab.points.map((pt, pIdx) => {
                            // Split by newline so we can handle paragraphs inside a point if user pressed enter
                            const paras = pt.split('\n');
                            return (
                              <div key={pIdx} style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ fontWeight: 'bold', width: '25px', flexShrink: 0 }}>{String.fromCharCode(65 + pIdx)}.</div>
                                <div style={{ flex: 1, textAlign: 'justify' }}>
                                  {paras.map((p, i) => (
                                    <p key={i} style={{ margin: i === 0 ? '0' : '0.5rem 0 0 0' }}>{p}</p>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TTD Khusus (Kanan) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <div style={{ width: '250px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 10px 1fr', marginBottom: '1rem' }}>
                        <div>Ditetapkan di</div>
                        <div>:</div>
                        <div>{settings.city || 'Garut'}</div>
                        <div>Pada tanggal</div>
                        <div>:</div>
                        <div>{new Date(currentPrintDoc.date || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      
                      <p style={{ fontWeight: 'bold', margin: '0 0 2px' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 2px' }}>{settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()},</p>
                      
                      {renderSafeDigitalSignature()}
                      
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 2px' }}>{currentPrintDoc.signatory || settings.directorName || "NAMA LENGKAP"}</p>
                      <p style={{ margin: 0 }}>NIK. ..............................</p>
                    </div>
                  </div>
                </div>
              ) : currentPrintDoc.templateType === "Surat Keputusan" ? (
                <div style={{ lineHeight: '1.5' }}>
                  {/* Header Khusus SK */}
                  <div style={{ marginBottom: '1rem', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                      <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                      <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{settings.clinicName.replace(/ GARUT$/i, '')}</h1>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'normal', margin: '0 0 1px 0', color: '#000' }}>{formatSertifikatStandar(settings?.nib)}</p>
                      <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                        Email: <span style={{ textDecoration: 'underline' }}>{settings?.email || 'klinikbaiturrahman@rocketmail.com'}</span>
                      </p>
                    </div>
                    <div style={{ borderTop: '2px solid black', marginTop: '2px' }}></div>
                  </div>

                  {/* Judul SK */}
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 2px 0' }}>KEPUTUSAN</h3>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 2px 0' }}>DIREKTUR {settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()}</h3>
                    <p style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0' }}>NOMOR : {currentPrintDoc.docNo}</p>
                    
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '1rem 0 2px 0' }}>TENTANG</h3>
                    <p style={{ fontSize: '12pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>{currentPrintDoc.skData?.tentang || currentPrintDoc.subject}</p>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 1rem 0' }}>DENGAN RAHMAT TUHAN YANG MAHA ESA</h3>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0' }}>DIREKTUR {settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()},</h3>
                  </div>

                  {/* Body SK */}
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>Menimbang</div>
                    <div>:</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {(currentPrintDoc.skData?.menimbang || []).map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.25rem' }}>
                          <span style={{ width: '20px' }}>{String.fromCharCode(97 + idx)}.</span>
                          <span style={{ flex: 1, textAlign: 'justify' }}>bahwa {m};</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>Mengingat</div>
                    <div style={{ marginTop: '0.5rem' }}>:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}>
                      {(currentPrintDoc.skData?.mengingat || []).map((m, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.25rem' }}>
                          <span style={{ width: '20px' }}>{idx + 1}.</span>
                          <span style={{ flex: 1, textAlign: 'justify' }}>{m};</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0' }}>MEMUTUSKAN :</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 10px 1fr', gap: '0.5rem', marginBottom: '2rem' }}>
                    <div>Menetapkan</div>
                    <div>:</div>
                    <div>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{currentPrintDoc.skData?.menetapkan || "KEPUTUSAN DIREKTUR"}</span>
                    </div>

                    {(currentPrintDoc.skData?.keputusan || []).map((k, idx) => (
                      <React.Fragment key={idx}>
                        <div style={{ marginTop: '0.5rem' }}>{k.key}</div>
                        <div style={{ marginTop: '0.5rem' }}>:</div>
                        <div style={{ marginTop: '0.5rem', textAlign: 'justify' }}>{k.value};</div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* TTD Khusus SK (Kanan) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <div style={{ width: '300px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '100px 10px 1fr', marginBottom: '1rem' }}>
                        <div>Ditetapkan di</div>
                        <div>:</div>
                        <div>{settings.city || 'Garut'}</div>
                        <div>Pada tanggal</div>
                        <div>:</div>
                        <div>{new Date(currentPrintDoc.date || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                      </div>
                      
                      <p style={{ fontWeight: 'bold', margin: '0 0 2px' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 2px' }}>{settings.clinicName.replace(/ GARUT$/i, '').toUpperCase()},</p>
                      
                      {renderSafeDigitalSignature()}
                      
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: '0 0 2px' }}>{currentPrintDoc.signatory || settings.directorName || "NAMA LENGKAP"}</p>
                      <p style={{ margin: 0 }}>NIK. ..............................</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* Header Kop Surat based on Type */}
              {(!currentPrintDoc.kopType || currentPrintDoc.kopType === "direktur") ? (
                /* Header Kop Surat - Center Aligned & Compact */
                <div style={{ marginBottom: '1rem', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                    <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{settings.clinicName.replace(/ GARUT$/i, '')}</h1>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
                    <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                      Email: <span style={{ textDecoration: 'underline' }}>{settings.email}</span>
                    </p>
                  </div>
                  {/* Thick line and thin line */}
                  <div style={{ borderTop: '3px solid black', marginTop: '2px' }}></div>
                  <div style={{ borderTop: '1px solid black', marginTop: '1px' }}></div>
                </div>
              ) : (
                /* Header Kop Surat - Left Aligned & Compact */
                <div style={{ marginBottom: '1rem', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '0.5rem' }}>
                    <img src={settings?.logo || "/logo.png"} width="90" height="90"  alt="Logo" style={{ width: '90px', height: 'auto', flexShrink: 0 }} />
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                      <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{settings.clinicName.replace(/ GARUT$/i, '')}</h1>
                      <p style={{ fontSize: '0.85rem', fontWeight: 'normal', margin: '0 0 1px 0', color: '#000' }}>{formatSertifikatStandar(settings?.nib)}</p>
                      <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                      <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                        Email: <span style={{ textDecoration: 'underline' }}>{settings.email}</span>
                      </p>
                    </div>
                  </div>
                  {/* Thick line and thin line */}
                  <div style={{ borderTop: '3px solid black', marginTop: '2px' }}></div>
                  <div style={{ borderTop: '1px solid black', marginTop: '1px' }}></div>
                </div>
              )}

              {/* TUTUP KONDISI REGULAR LETTER */}
              
              <>
              {(currentPrintDoc.templateType === "SIK" || currentPrintDoc.typeCode === "SIK" || currentPrintDoc.templateType === "Surat Ijin Kegiatan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSIK || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>Ijin Kegiatan {currentPrintDoc.namaKegiatan || "............................."}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: 0 }}>Yth.</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSIK || "...........................\n..........................."}
                    </div>
                    <p style={{ margin: 0 }}>di Tempat</p>
                  </div>

                  <div style={{ margin: '2rem 0', textAlign: 'justify' }}>
                    <div style={{ borderBottom: '1px dotted black', marginBottom: '1.5rem', width: '100%' }}></div>
                    <p style={{ marginBottom: '1rem' }}>
                      Sehubungan dengan akan diadakan kegiatan <strong>{currentPrintDoc.namaKegiatan || "..................................................."}</strong> akan diselenggarakan pada :
                    </p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '1rem' }}>
                      <tbody>
                        <tr><td style={{ width: '100px', padding: '0.2rem 0' }}>Hari</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.hariKegiatan || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Tanggal</td><td>:</td><td>{currentPrintDoc.tanggalKegiatan || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Pukul</td><td>:</td><td>{currentPrintDoc.pukulKegiatan || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Tempat</td><td>:</td><td>{currentPrintDoc.tempatKegiatan || ".............................................."}</td></tr>
                      </tbody>
                    </table>
                    <p style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                      Maka kami selaku {currentPrintDoc.selakuPemohon || "..........................................................................."} bermaksud memohon ijin untuk mengadakan kegiatan tersebut.
                    </p>
                    <div style={{ borderBottom: '1px dotted black', marginBottom: '10px', width: '100%' }}></div>
                    <div style={{ borderBottom: '1px dotted black', width: '100%' }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SU" || currentPrintDoc.typeCode === "SU" || currentPrintDoc.templateType === "Surat Undangan" || currentPrintDoc.typeCode === "Und" || currentPrintDoc.templateType === "Und") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Sifat</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.sifatSU || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSU || currentPrintDoc.attachments || "-"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem', fontWeight: 'bold' }}>Undangan {currentPrintDoc.acaraSU ? `- ${currentPrintDoc.acaraSU}` : ''}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: 0 }}>Yth.</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSU || currentPrintDoc.recipientName || "...........................\n..........................."}
                    </div>
                    {currentPrintDoc.destination && <p style={{ margin: 0 }}>{currentPrintDoc.destination}</p>}
                  </div>

                  <div style={{ margin: '2rem 0', textAlign: 'justify' }}>
                    {currentPrintDoc.pembukaSU && (
                      <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{currentPrintDoc.pembukaSU}</p>
                    )}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '2rem' }}>
                      <tbody>
                        <tr><td style={{ width: '100px', padding: '0.2rem 0' }}>Hari</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.hariSU || "..........................................................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Tanggal</td><td>:</td><td>{currentPrintDoc.tanggalSU || "..........................................................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Pukul</td><td>:</td><td>{currentPrintDoc.pukulSU || "..........................................................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Tempat</td><td>:</td><td>{currentPrintDoc.tempatSU || "..........................................................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Acara</td><td style={{ verticalAlign: 'top' }}>:</td><td>{currentPrintDoc.acaraSU || "..........................................................................."}</td></tr>
                      </tbody>
                    </table>
                    {currentPrintDoc.penutupSU && (
                      <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{currentPrintDoc.penutupSU}</p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPem" || currentPrintDoc.typeCode === "SPem" || currentPrintDoc.templateType === "Surat Pemberitahuan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSPem || currentPrintDoc.attachments || "-"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>Pemberitahuan {currentPrintDoc.perihalSPem || currentPrintDoc.subject || "...................."}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: '0' }}>Yth,</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSPem || currentPrintDoc.recipientName || "......................................\n......................................\n......................................"}
                    </div>
                    {currentPrintDoc.destination && <p style={{ margin: '0' }}>{currentPrintDoc.destination}</p>}
                  </div>

                  <div style={{ margin: '2rem 0', textAlign: 'justify' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>Dengan Hormat,</p>
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                      {currentPrintDoc.isiSPem || renderFormattedContent(currentPrintDoc.content) || "................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................"}
                    </div>
                    <p style={{ margin: 0 }}>Demikian pemberitahuan ini kami sampaikan atas perhatian dan kerja sama kami ucapkan terima kasih.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPm" || currentPrintDoc.typeCode === "SPm" || currentPrintDoc.templateType === "Surat Permohonan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSPm || currentPrintDoc.attachments || "-"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>Permohonan {currentPrintDoc.perihalSPm || currentPrintDoc.subject || "...................."}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: '0' }}>Yth,</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSPm || currentPrintDoc.recipientName || "......................................\n......................................\n......................................"}
                    </div>
                    {currentPrintDoc.destination && <p style={{ margin: '0' }}>{currentPrintDoc.destination}</p>}
                  </div>

                  <div style={{ margin: '2rem 0', textAlign: 'justify' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>Dengan Hormat,</p>
                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1rem' }}>
                      {currentPrintDoc.isiSPm || renderFormattedContent(currentPrintDoc.content) || "................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................"}
                    </div>
                    <p style={{ margin: 0 }}>Demikian surat permohonan ini kami sampaikan atas perhatian kami ucapkan terima kasih.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPgl" || currentPrintDoc.typeCode === "SPgl" || currentPrintDoc.templateType === "Surat Panggilan" || currentPrintDoc.templateType === "Surat Pengadilan" || currentPrintDoc.typeCode === "Surat Pengadilan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Sifat</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.sifatSPgl || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSPgl || currentPrintDoc.attachments || "-"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>Panggilan</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: '0' }}>Yth,</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSPgl || currentPrintDoc.recipientName || "......................................\n......................................\n......................................"}
                    </div>
                    {currentPrintDoc.destination && <p style={{ margin: '0' }}>{currentPrintDoc.destination}</p>}
                  </div>

                  <div style={{ margin: '2rem 0', textAlign: 'justify' }}>
                    <p style={{ margin: '0 0 1rem 0' }}>Dengan Hormat</p>
                    <div style={{ marginBottom: '1rem' }}>
                      Dengan ini diminta kedatangan Saudara di {currentPrintDoc.alasanSPgl ? <span style={{ textDecoration: 'none' }}>{currentPrintDoc.alasanSPgl}</span> : "........................................................................"} pada :
                    </div>
                    
                    <table style={{ border: 'none', marginLeft: '2rem', marginBottom: '1rem' }}>
                      <tbody>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0', width: '120px' }}>Hari</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.hariSPgl || ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>Tanggal</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.tanggalSPgl ? new Date(currentPrintDoc.tanggalSPgl).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>Pukul</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.pukulSPgl || ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>Tempat</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.tempatSPgl || ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>Menghadap kepada</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.menghadapSPgl || ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0' }}>Alamat</td><td style={{ padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem' }}>{currentPrintDoc.alamatSPgl || ""}</td></tr>
                        <tr><td style={{ padding: '0.2rem 1rem 0.2rem 0', verticalAlign: 'top' }}>Untuk</td><td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>:</td><td style={{ padding: '0.2rem 0 0.2rem 0.5rem', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                          <span style={{ borderBottom: currentPrintDoc.untukSPgl ? 'none' : '1px dotted black', display: 'inline-block', minWidth: '300px' }}>{currentPrintDoc.untukSPgl || "\n\n"}</span>
                        </td></tr>
                      </tbody>
                    </table>

                    <p style={{ margin: 0 }}>Demikian untuk dilaksanakan dan menjadi perhatian sepenuhnya.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SBal" || currentPrintDoc.typeCode === "SBal" || currentPrintDoc.templateType === "Surat Balasan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.lampiranSBal || currentPrintDoc.attachments || "-"}</td></tr>
                          <tr><td style={{ padding: '0 1rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.perihalSBal || currentPrintDoc.subject || "Balasan Permohonan Kerja Praktik"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ margin: '0' }}>Yth,</p>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {currentPrintDoc.penerimaSBal || currentPrintDoc.recipientName || "......................................\n......................................"}
                    </div>
                    {currentPrintDoc.destination && <p style={{ margin: '0' }}>{currentPrintDoc.destination}</p>}
                    <p style={{ margin: '0' }}>di Tempat</p>
                  </div>

                  <div style={{ margin: '1.5rem 0', textAlign: 'justify' }}>
                    <p style={{ margin: '0 0 0.75rem 0' }}>Dengan Hormat,</p>
                    <p style={{ margin: '0 0 1rem 0', lineHeight: '1.6' }}>
                      {currentPrintDoc.pembukaSBal || (
                        (currentPrintDoc.showPesertaSBal === false || currentPrintDoc.sbalData?.showPeserta === false)
                          ? (currentPrintDoc.noSuratAsal
                              ? `Menindaklanjuti surat permohonan dari Saudara Nomor: ${currentPrintDoc.noSuratAsal} ${currentPrintDoc.tglSuratAsal ? `tertanggal ${new Date(currentPrintDoc.tglSuratAsal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''} perihal ${currentPrintDoc.namaKegiatanSBal || currentPrintDoc.subject || 'Permohonan Kerja Praktik / Magang'}, dengan ini kami sampaikan bahwa permohonan tersebut pada prinsipnya dapat kami terima dan setujui.`
                              : `Sehubungan dengan surat permohonan yang kami terima, dengan ini kami beritahukan bahwa pada prinsipnya Klinik Baiturrahman Garut dapat menerima permohonan ${currentPrintDoc.namaKegiatanSBal || 'Kerja Praktik / PKL / Penelitian'} dimaksud.`
                          )
                          : (currentPrintDoc.noSuratAsal 
                            ? `Menindaklanjuti surat permohonan dari Saudara Nomor: ${currentPrintDoc.noSuratAsal} ${currentPrintDoc.tglSuratAsal ? `tertanggal ${new Date(currentPrintDoc.tglSuratAsal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''} perihal ${currentPrintDoc.namaKegiatanSBal || currentPrintDoc.subject || 'Permohonan Kerja Praktik / Magang'}, dengan ini kami sampaikan bahwa pada prinsipnya Klinik Baiturrahman Garut MENERIMA / MENYETUJUI mahasiswa/siswa berikut di bawah ini:`
                            : `Sehubungan dengan surat permohonan yang kami terima, dengan ini kami beritahukan bahwa pada prinsipnya Klinik Baiturrahman Garut MENERIMA / MENYETUJUI mahasiswa/siswa tersebut di bawah ini untuk melaksanakan ${currentPrintDoc.namaKegiatanSBal || 'Kerja Praktik / PKL / Penelitian'}:`
                          )
                      )}
                    </p>

                    {/* Tabel Mahasiswa / Peserta - hanya tampil jika diaktifkan */}
                    {(currentPrintDoc.showPesertaSBal !== false && currentPrintDoc.sbalData?.showPeserta !== false) && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1rem 0', fontSize: '10.5pt' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc' }}>
                          <th style={{ border: '1px solid black', padding: '0.45rem 0.5rem', textAlign: 'center', width: '35px' }}>No</th>
                          <th style={{ border: '1px solid black', padding: '0.45rem 0.6rem', textAlign: 'left' }}>Nama Mahasiswa / Siswa</th>
                          <th style={{ border: '1px solid black', padding: '0.45rem 0.6rem', textAlign: 'left', width: '150px' }}>NIM / NIS</th>
                          <th style={{ border: '1px solid black', padding: '0.45rem 0.6rem', textAlign: 'left', width: '200px' }}>Program Studi / Jurusan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((currentPrintDoc.sbalData?.peserta && currentPrintDoc.sbalData.peserta.length > 0) 
                          ? currentPrintDoc.sbalData.peserta 
                          : (currentPrintDoc.pesertaSBal || [{ nama: '', nim: '', prodi: '' }, { nama: '', nim: '', prodi: '' }])
                        ).map((mhs, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid black', padding: '0.45rem 0.5rem', textAlign: 'center' }}>{idx + 1}.</td>
                            <td style={{ border: '1px solid black', padding: '0.45rem 0.6rem' }}>{mhs.nama || '...................................................'}</td>
                            <td style={{ border: '1px solid black', padding: '0.45rem 0.6rem' }}>{mhs.nim || '...................................'}</td>
                            <td style={{ border: '1px solid black', padding: '0.45rem 0.6rem' }}>{mhs.prodi || '...................................'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    )}

                    {/* Informasi Periode & Penempatan */}
                    {(currentPrintDoc.periodeSBal || currentPrintDoc.sbalData?.periode || currentPrintDoc.penempatanSBal || currentPrintDoc.sbalData?.penempatan) && (
                      <table style={{ border: 'none', margin: '1rem 0', marginLeft: '0.5rem' }}>
                        <tbody>
                          {(currentPrintDoc.periodeSBal || currentPrintDoc.sbalData?.periode) && (
                            <tr>
                              <td style={{ width: '160px', padding: '0.2rem 0' }}>Waktu Pelaksanaan</td>
                              <td style={{ width: '15px', padding: '0.2rem 0' }}>:</td>
                              <td style={{ padding: '0.2rem 0', fontWeight: 600 }}>{currentPrintDoc.periodeSBal || currentPrintDoc.sbalData?.periode}</td>
                            </tr>
                          )}
                          {(currentPrintDoc.penempatanSBal || currentPrintDoc.sbalData?.penempatan) && (
                            <tr>
                              <td style={{ width: '160px', padding: '0.2rem 0' }}>Unit Penempatan</td>
                              <td style={{ width: '15px', padding: '0.2rem 0' }}>:</td>
                              <td style={{ padding: '0.2rem 0', fontWeight: 600 }}>{currentPrintDoc.penempatanSBal || currentPrintDoc.sbalData?.penempatan}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {/* Catatan Tambahan jika ada */}
                    {(currentPrintDoc.catatanSBal || currentPrintDoc.sbalData?.catatan || (currentPrintDoc.content && currentPrintDoc.content.trim() && !currentPrintDoc.content.includes("Membalas surat Nomor ............."))) && (
                      <div style={{ margin: '1rem 0', whiteSpace: 'pre-wrap' }}>
                        {renderFormattedContent(currentPrintDoc.catatanSBal || currentPrintDoc.sbalData?.catatan || currentPrintDoc.content)}
                      </div>
                    )}

                    <p style={{ margin: '1.25rem 0 0 0' }}>
                      Demikian surat balasan ini kami sampaikan. Atas perhatian dan kerja sama yang baik, kami ucapkan terima kasih.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (["SB", "STag", "Surat Biasa", "Surat Tagihan"].includes(currentPrintDoc.templateType) || ["SB", "STag"].includes(currentPrintDoc.typeCode)) ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 0.5rem 0 0', verticalAlign: 'top' }}>Nomor</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.docNo || "................................"}</td></tr>
                          <tr><td style={{ padding: '0 0.5rem 0 0', verticalAlign: 'top' }}>Lampiran</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.attachments || currentPrintDoc.lampiran || "-"}</td></tr>
                          <tr><td style={{ padding: '0 0.5rem 0 0', verticalAlign: 'top' }}>Perihal</td><td style={{ padding: 0, verticalAlign: 'top' }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.subject || currentPrintDoc.perihal || "................................"}</td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0 }}>{settings.city || 'Garut'}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: '0' }}>Kepada Yth,</p>
                    {currentPrintDoc.recipientName ? (
                      <p style={{ margin: '0', fontWeight: 'bold' }}>{currentPrintDoc.recipientName}</p>
                    ) : (
                      <p style={{ margin: '0' }}>......................................</p>
                    )}
                    {currentPrintDoc.destination ? (
                      <p style={{ margin: '0' }}>{currentPrintDoc.destination}</p>
                    ) : (
                      <p style={{ margin: '0' }}>di Tempat</p>
                    )}
                  </div>

                  <div style={{ margin: '2rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {renderFormattedContent(currentPrintDoc.content)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || 'DIREKTUR'}</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p>
                    </div>
                  </div>


                </div>
              ) : (currentPrintDoc.templateType === "SEd" || currentPrintDoc.typeCode === "SEd" || currentPrintDoc.templateType === "Surat Edaran") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                    <div style={{ width: '250px' }}>
                      <p style={{ margin: 0 }}>Tanggal, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <span style={{ margin: 0 }}>Yth.</span>
                        {currentPrintDoc.recipientName ? (
                          <div style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{currentPrintDoc.recipientName}</div>
                        ) : (
                          <div style={{ flex: 1 }}>
                            <div style={{ borderBottom: '1px dotted black', height: '1.2rem', marginBottom: '0.5rem' }}></div>
                            <div style={{ borderBottom: '1px dotted black', height: '1.2rem' }}></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>SURAT EDARAN</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo}</p>
                    
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '1rem 0 0.25rem 0' }}>TENTANG</h3>
                    <p style={{ fontWeight: 'bold', margin: 0, whiteSpace: 'pre-wrap', textTransform: 'uppercase' }}>{currentPrintDoc.subject || "......................................................................"}</p>
                  </div>

                  <div style={{ margin: '2rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {renderFormattedContent(currentPrintDoc.content)}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || 'DIREKTUR'}</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>NIK. ..............................</p>
                    </div>
                  </div>


                </div>
              ) : (currentPrintDoc.templateType === "SKet" || currentPrintDoc.typeCode === "SKet" || currentPrintDoc.templateType === "Surat Keterangan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>SURAT KETERANGAN</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>NOMOR : {currentPrintDoc.docNo || '...........................................'}</p>
                  </div>

                  <div style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>
                    <p style={{ marginBottom: '0.5rem' }}>Yang bertandatangan dibawah ini :</p>
                    <table style={{ marginLeft: '2rem', marginBottom: '1rem', border: 'none', width: '100%' }}>
                      <tbody>
                        <tr><td style={{ width: '20px', padding: '0.2rem 0' }}>a.</td><td style={{ width: '80px', padding: '0.2rem 0' }}>Nama</td><td style={{ width: '10px', padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0' }}>{currentPrintDoc.namaTtd || '...........................................'}</td></tr>
                        <tr><td style={{ width: '20px', padding: '0.2rem 0' }}>b.</td><td style={{ width: '80px', padding: '0.2rem 0' }}>Jabatan</td><td style={{ width: '10px', padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0' }}>{currentPrintDoc.jabatanTtd || '...........................................'}</td></tr>
                      </tbody>
                    </table>

                    <p style={{ marginBottom: '0.5rem' }}>dengan ini menerangkan bahwa :</p>
                    <table style={{ marginLeft: '2rem', marginBottom: '1.5rem', border: 'none', width: '100%' }}>
                      <tbody>
                        <tr><td style={{ width: '20px', padding: '0.2rem 0' }}>a.</td><td style={{ width: '80px', padding: '0.2rem 0' }}>Nama</td><td style={{ width: '10px', padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0' }}>{currentPrintDoc.namaDiterangkan || '...........................................'}</td></tr>
                        <tr><td style={{ width: '20px', padding: '0.2rem 0' }}>b.</td><td style={{ width: '80px', padding: '0.2rem 0' }}>Jabatan</td><td style={{ width: '10px', padding: '0.2rem 0' }}>:</td><td style={{ padding: '0.2rem 0' }}>{currentPrintDoc.jabatanDiterangkan || '...........................................'}</td></tr>
                      </tbody>
                    </table>

                    <p style={{ lineHeight: '1.8' }}>
                      Surat keterangan ini diberikan untuk keperluan {currentPrintDoc.keperluan || '.....................................................'} dengan harapan pihak yang berwenang dapat {currentPrintDoc.harapan || '...................................'} dan surat ini dapat dipergunakan seperlunya.
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>Direktur</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>Klinik Baiturrahman,</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>NIK. ..............................</p>
                    </div>
                  </div>


                </div>
              ) : (currentPrintDoc.templateType === "ST" || currentPrintDoc.typeCode === "ST" || currentPrintDoc.templateType === "Surat Tugas") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', textTransform: 'uppercase' }}>SURAT TUGAS</h3>
                    <p style={{ margin: 0, fontSize: '1.1rem' }}>NOMOR : {currentPrintDoc.docNo || '...........................................'}</p>
                  </div>
                  
                  <table style={{ border: 'none', width: '100%', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '80px', verticalAlign: 'top', padding: '0.2rem 0' }}>Dasar</td>
                        <td style={{ width: '20px', verticalAlign: 'top', padding: '0.2rem 0' }}>:</td>
                        <td style={{ padding: '0.2rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>{currentPrintDoc.stData?.dasar || '..............................................................................................................................................................\n..............................................................................................................................................................'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                    MENUGASKAN :
                  </div>

                  <table style={{ border: 'none', width: '100%', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '80px', verticalAlign: 'top', padding: '0.2rem 0' }}>Kepada</td>
                        <td style={{ width: '20px', verticalAlign: 'top', padding: '0.2rem 0' }}>:</td>
                        <td style={{ padding: '0.2rem 0' }}>
                          {(currentPrintDoc.stData?.pegawai || [{ nama: '', nik: '', jabatan: '' }]).map((peg, i) => (
                            <table key={i} style={{ border: 'none', width: '100%', marginBottom: '0.5rem' }}>
                              <tbody>
                                <tr>
                                  <td style={{ width: '20px', verticalAlign: 'top' }}>{i + 1}.</td>
                                  <td style={{ width: '70px', verticalAlign: 'top' }}>Nama</td>
                                  <td style={{ width: '15px', verticalAlign: 'top' }}>:</td>
                                  <td>{peg.nama || '..............................................................................'}</td>
                                </tr>
                                <tr>
                                  <td></td>
                                  <td style={{ verticalAlign: 'top' }}>NIK</td>
                                  <td style={{ verticalAlign: 'top' }}>:</td>
                                  <td>{peg.nik || '..............................................................................'}</td>
                                </tr>
                                <tr>
                                  <td></td>
                                  <td style={{ verticalAlign: 'top' }}>Jabatan</td>
                                  <td style={{ verticalAlign: 'top' }}>:</td>
                                  <td>{peg.jabatan || '..............................................................................'}</td>
                                </tr>
                              </tbody>
                            </table>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '130px', verticalAlign: 'top', padding: '0.2rem 0' }}>Untuk melaksanakan</td>
                        <td style={{ width: '20px', verticalAlign: 'top', padding: '0.2rem 0' }}>:</td>
                        <td style={{ padding: '0.2rem 0' }}>
                          <ol style={{ margin: 0, paddingLeft: '1.2rem', textAlign: 'justify' }}>
                            {(currentPrintDoc.stData?.tugas || ['', '']).map((tgs, i) => (
                              <li key={i} style={{ paddingLeft: '0.5rem', marginBottom: '0.3rem' }}>{tgs || '.......................................................................................................'}</li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <table style={{ border: 'none', width: '100%', marginBottom: '1rem' }}>
                        <tbody>
                          <tr>
                            <td style={{ width: '90px', padding: 0 }}>Ditetapkan di</td>
                            <td style={{ width: '15px', padding: 0 }}>:</td>
                            <td style={{ padding: 0 }}>{settings.city}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 0 }}>Pada tanggal</td>
                            <td style={{ padding: 0 }}>:</td>
                            <td style={{ padding: 0 }}>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || 'DIREKTUR'}</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>NIK. ..............................</p>
                    </div>
                  </div>


                </div>
              ) : (currentPrintDoc.templateType === "SP" || currentPrintDoc.typeCode === "SP" || currentPrintDoc.templateType === "Surat Peringatan") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>SURAT PERINGATAN</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo || ".............................................."}</p>
                  </div>

                  <div style={{ margin: '0 0 1rem 0' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Surat peringatan ini diberikan kepada :</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '1rem' }}>
                      <tbody>
                        <tr><td style={{ width: '120px', padding: '0.2rem 0' }}>Nama</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.namaPegawai || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>NIK</td><td>:</td><td>{currentPrintDoc.nikPegawai || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Jabatan</td><td>:</td><td>{currentPrintDoc.jabatanPegawai || ".............................................."}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ margin: '1.5rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {currentPrintDoc.isiPeringatan || "................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................"}
                  </div>
                  
                  <div style={{ margin: '1.5rem 0', textAlign: 'justify' }}>
                    <p>Demikian surat peringatan ini dibuat agar dapat diperhatikan dan ditaati oleh yang bersangkutan.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPer" || currentPrintDoc.typeCode === "SPer" || currentPrintDoc.templateType === "Surat Perintah") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>SURAT PERINTAH</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo || ".............................................."}</p>
                  </div>

                  <div style={{ margin: '0 0 1rem 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '0rem' }}>
                      <tbody>
                        <tr><td style={{ width: '220px', padding: '0.2rem 0' }}>Nama (yang memberi perintah)</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.namaPemberiSPer || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Jabatan</td><td>:</td><td>{currentPrintDoc.jabatanPemberiSPer || ".............................................."}</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ textAlign: 'center', margin: '2rem 0 1.5rem 0' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>MEMERINTAHKAN :</h4>
                  </div>

                  <div style={{ margin: '0 0 1.5rem 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '0rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>Kepada</td>
                          <td style={{ width: '20px', verticalAlign: 'top' }}>:</td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <tbody>
                                <tr>
                                  <td style={{ width: '30px', padding: '0.2rem 0' }}>a.</td>
                                  <td style={{ width: '100px', padding: '0.2rem 0' }}>Nama</td>
                                  <td style={{ width: '20px' }}>:</td>
                                  <td>{currentPrintDoc.namaPenerimaSPer || ".............................................."}</td>
                                </tr>
                                <tr>
                                  <td style={{ padding: '0.2rem 0' }}>b.</td>
                                  <td style={{ padding: '0.2rem 0' }}>Jabatan</td>
                                  <td>:</td>
                                  <td>{currentPrintDoc.jabatanPenerimaSPer || ".............................................."}</td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ padding: '1rem 0 0.2rem 0', verticalAlign: 'top' }}>Untuk</td>
                          <td style={{ padding: '1rem 0 0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '1rem 0 0.2rem 0' }}>
                            <div style={{ whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                              {currentPrintDoc.untukSPer || "..............................................................................................................................................................................................................................................................................................................................................................................................................................................................."}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <tbody>
                          <tr><td style={{ width: '100px', padding: '0' }}>Ditetapkan di</td><td style={{ width: '15px' }}>:</td><td>{settings.city}</td></tr>
                          <tr><td style={{ padding: '0' }}>Pada tanggal</td><td>:</td><td>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                        </tbody>
                      </table>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings?.clinicName || 'KLINIK BAITURRAHMAN'},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SRkm" || currentPrintDoc.typeCode === "SRkm" || currentPrintDoc.templateType === "Surat Rekomendasi") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>REKOMENDASI {currentPrintDoc.titleSRkm || "......................................."}</h3>
                    <p style={{ margin: 0, textTransform: 'uppercase' }}>NOMOR : {currentPrintDoc.docNo || "......................................."}</p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>a.</td>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Dasar</td>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{currentPrintDoc.dasarSRkm || ""}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>b.</td>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Menimbang</td>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{currentPrintDoc.menimbangSRkm || ""}</td>
                      </tr>
                    </tbody>
                  </table>

                  <p style={{ margin: '0 0 1.5rem 0' }}>Direktur {settings.clinicName} , memberikan rekomendasi kepada :</p>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem', marginLeft: '2rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>a.</td>
                        <td style={{ width: '60px', padding: '0.2rem 0', verticalAlign: 'top' }}>Nama</td>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.namaPenerimaSRkm || ""}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>b.</td>
                        <td style={{ width: '60px', padding: '0.2rem 0', verticalAlign: 'top' }}>Jabatan</td>
                        <td style={{ width: '15px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.jabatanPenerimaSRkm || ""}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', marginBottom: '2rem' }}>
                    <div style={{ width: '70px' }}>Untuk :</div>
                    <div style={{ flex: 1, whiteSpace: 'pre-wrap', borderBottom: currentPrintDoc.untukSRkm ? 'none' : '1px dotted black' }}>
                      {currentPrintDoc.untukSRkm || "\n\n\n"}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 3rem 0' }}>Demikian rekomendasi ini dibuat untuk dipergunakan seperlunya.</p>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings.clinicName},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                  
                  {/* Tembusan will be handled by the global Tembusan block since it's inside the same div wrapper */}
                </div>
              ) : (currentPrintDoc.templateType === "Mem" || currentPrintDoc.typeCode === "Mem" || currentPrintDoc.templateType === "Memorandum") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>MEMO</h3>
                    <p style={{ margin: 0, textTransform: 'uppercase' }}>NOMOR : {currentPrintDoc.docNo || "......................................."}</p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '2rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '80px', padding: '0.4rem 0', verticalAlign: 'top' }}>Dari</td>
                        <td style={{ width: '20px', padding: '0.4rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.4rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.dariMem || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '80px', padding: '0.4rem 0', verticalAlign: 'top' }}>Kepada</td>
                        <td style={{ width: '20px', padding: '0.4rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.4rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.kepadaMem || "\u00A0"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', marginBottom: '3rem' }}>
                    <div style={{ width: '100px', paddingTop: '0.2rem' }}>ISI</div>
                    <div style={{ width: '20px', paddingTop: '0.2rem' }}>:</div>
                    <div style={{ flex: 1, whiteSpace: 'pre-wrap', lineHeight: '2' }}>
                      {currentPrintDoc.isiMem ? (
                        currentPrintDoc.isiMem.split('\n').map((line, idx) => (
                          <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem' }}>{line}</div>
                        ))
                      ) : (
                        Array(6).fill("").map((_, i) => (
                          <div key={i} style={{ borderBottom: '1px dotted black', height: '2rem', width: '100%' }}></div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings.clinicName},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "Nd" || currentPrintDoc.typeCode === "Nd" || currentPrintDoc.templateType === "Nota Dinas") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>NOTA DINAS</h3>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '2rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Kepada</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.kepadaNd || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Dari</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.dariNd || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tembusan</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.tembusanNd || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tanggal</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Nomor</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.docNo || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Sifat</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.sifatNd || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Lampiran</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.lampiranNd || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Perihal</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.perihalNd || "\u00A0"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ width: '100%', whiteSpace: 'pre-wrap', lineHeight: '2' }}>
                      {currentPrintDoc.isiNd ? (
                        currentPrintDoc.isiNd.split('\n').map((line, idx) => (
                          <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem' }}>{line}</div>
                        ))
                      ) : (
                        Array(6).fill("").map((_, i) => (
                          <div key={i} style={{ borderBottom: '1px dotted black', height: '2rem', width: '100%' }}></div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings.clinicName},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                  
                  {/* Avoid printing double Tembusan since we already handled it in header */}
                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "TS" || currentPrintDoc.typeCode === "TS" || currentPrintDoc.templateType === "Telaahan Staf") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>TELAAHAN STAF</h3>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '2rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Kepada</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.kepadaTS || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Dari</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.dariTS || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tanggal</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Nomor</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.docNo || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Sifat</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.sifatTS || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Lampiran</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.lampiranTS || "\u00A0"}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Perihal</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'inline-block', width: '100%', borderBottom: '1px dotted black' }}>{currentPrintDoc.perihalTS || "\u00A0"}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '3rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>I.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Persoalan</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.persoalanTS ? currentPrintDoc.persoalanTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>II.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Praanggapan</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.praanggapanTS ? currentPrintDoc.praanggapanTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>III.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Fakta-fakta yang mempengaruhi</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.faktaTS ? currentPrintDoc.faktaTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>IV.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Analisis</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.analisisTS ? currentPrintDoc.analisisTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>V.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Kesimpulan</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.kesimpulanTS ? currentPrintDoc.kesimpulanTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '30px', padding: '0.2rem 0', verticalAlign: 'top' }}>VI.</td>
                        <td style={{ width: '220px', padding: '0.2rem 0', verticalAlign: 'top' }}>Saran</td>
                        <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.saranTS ? currentPrintDoc.saranTS.split('\\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', marginBottom: '2rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || "NAMA JABATAN"},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                  
                </div>
              ) : (currentPrintDoc.templateType === "Lap" || currentPrintDoc.typeCode === "Lap" || currentPrintDoc.templateType === "Laporan") ? (
                <div style={{ lineHeight: '1.5', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>LAPORAN</h3>
                    <div style={{ display: 'inline-block', width: '300px', borderBottom: '1px dotted black', minHeight: '1.5rem', margin: '0 auto', whiteSpace: 'pre-wrap', paddingBottom: '0.2rem' }}>{currentPrintDoc.judulLap || "\u00A0"}</div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>A.</td>
                        <td colSpan="2" style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>PENDAHULUAN</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top' }}>1.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'block', marginBottom: '0.5rem' }}>Latar Belakang</span>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.latarBelakangLap ? currentPrintDoc.latarBelakangLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top' }}>2.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'block', marginBottom: '0.5rem' }}>Landasan Hukum</span>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.landasanHukumLap ? currentPrintDoc.landasanHukumLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top' }}>3.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <span style={{ display: 'block', marginBottom: '0.5rem' }}>Maksud dan Tujuan</span>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.maksudTujuanLap ? currentPrintDoc.maksudTujuanLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top' }}>4.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Dst.</td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>B.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>KEGIATAN YANG DILAKSANAKAN</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.kegiatanLap ? currentPrintDoc.kegiatanLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>C.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>HASIL YANG DICAPAI</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.hasilLap ? currentPrintDoc.hasilLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>D.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>KESIMPULAN DAN SARAN</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.kesimpulanSaranLap ? currentPrintDoc.kesimpulanSaranLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>E.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>RENCANA TINDAK LANJUT</td>
                      </tr>
                    </tbody>
                  </table>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none', marginBottom: '1.5rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25px', padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>F.</td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top', fontWeight: 'bold' }}>PENUTUP</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>
                          <div style={{ width: '100%', whiteSpace: 'pre-wrap' }}>
                            {currentPrintDoc.penutupLap ? currentPrintDoc.penutupLap.split('\n').map((line, idx) => (
                              <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                            )) : <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <tbody>
                          <tr><td style={{ width: '100px', padding: '0' }}>Dibuat di</td><td style={{ width: '15px' }}>:</td><td>{settings.city}</td></tr>
                          <tr><td style={{ padding: '0' }}>Pada tanggal</td><td>:</td><td>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                        </tbody>
                      </table>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || "NAMA JABATAN"},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>

                  <div style={{ pageBreakBefore: 'always', paddingTop: '1rem' }}>
                    {/* Header Kop Surat untuk halaman kedua Laporan */}
                    <div style={{ marginBottom: '1rem', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                        <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                        <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                        <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{settings.clinicName.replace(/ GARUT$/i, '')}</h1>
                        <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
                        <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                          Email: <span style={{ textDecoration: 'underline' }}>{settings.email}</span>
                        </p>
                      </div>
                      <div style={{ borderTop: '3px solid black', marginTop: '2px' }}></div>
                      <div style={{ borderTop: '1px solid black', marginTop: '1px' }}></div>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Tabel Rencana Tindak Lanjut</h4>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', marginBottom: '3rem' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center', width: '40px' }}>No</th>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>Masalah</th>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>Rencana Tindak<br/>Lanjut</th>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>Tindak Lanjut</th>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>Evaluasi</th>
                          <th style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(currentPrintDoc.stData?.rencanaTL && currentPrintDoc.stData.rencanaTL.length > 0) ? currentPrintDoc.stData.rencanaTL.map((row, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid black', padding: '0.4rem', textAlign: 'center' }}>{idx + 1}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{row.masalah || "\u00A0"}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{row.rencana || "\u00A0"}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{row.tindakLanjut || "\u00A0"}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{row.evaluasi || "\u00A0"}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{row.keterangan || "\u00A0"}</td>
                          </tr>
                        )) : (
                          <>
                            <tr><td style={{ border: '1px solid black', padding: '0.4rem', height: '1.5rem' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '0.4rem', height: '1.5rem' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td></tr>
                            <tr><td style={{ border: '1px solid black', padding: '0.4rem', height: '1.5rem' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td><td style={{ border: '1px solid black' }}></td></tr>
                          </>
                        )}
                      </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem' }}>
                      <div style={{ textAlign: 'left', width: '250px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                          <tbody>
                            <tr><td style={{ width: '100px', padding: '0' }}>Dibuat di</td><td style={{ width: '15px' }}>:</td><td>{settings.city}</td></tr>
                            <tr><td style={{ padding: '0' }}>Pada tanggal</td><td>:</td><td>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                          </tbody>
                        </table>
                        <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.title || "NAMA JABATAN"},</p>
                        {renderSafeDigitalSignature()}
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || "NAMA"}</p>
                        <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                      </div>
                    </div>
                  </div>

                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "BA" || currentPrintDoc.typeCode === "BA" || currentPrintDoc.templateType === "Berita Acara") ? (
                <div style={{ lineHeight: '1.5', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>BERITA ACARA</h3>
                    <p style={{ margin: 0, textTransform: 'uppercase' }}>NOMOR : {currentPrintDoc.docNo || "......................................."}</p>
                  </div>

                  <div style={{ marginBottom: '1.5rem', textAlign: 'justify' }}>
                    Pada hari ini ........................ Tanggal ........ Bulan ............ Tahun ............ kami masing-masing :
                  </div>

                  <div style={{ marginBottom: '1rem', paddingLeft: '1rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>1.</td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>a. Nama</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.namaPihak1BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>b. Jabatan</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.jabatanPihak1BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>c. Kedudukan</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.kedudukanPihak1BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan="3" style={{ padding: '0.2rem 0 1rem 0', verticalAlign: 'top' }}>Yang selanjutnya disebut pihak Pertama</td>
                        </tr>
                        
                        <tr>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>2.</td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>a. Nama</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.namaPihak2BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>b. Jabatan</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.jabatanPihak2BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>c. Kedudukan</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>{currentPrintDoc.kedudukanPihak2BA || ""}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan="3" style={{ padding: '0.2rem 0 1rem 0', verticalAlign: 'top' }}>Yang selanjutnya disebut pihak Kedua</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginBottom: '1.5rem', width: '100%', whiteSpace: 'pre-wrap' }}>
                    {currentPrintDoc.isiBA ? currentPrintDoc.isiBA.split('\n').map((line, idx) => (
                      <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                    )) : (
                      <>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>
                      </>
                    )}
                  </div>

                  <div style={{ marginBottom: '3rem', textAlign: 'justify', textIndent: '2rem' }}>
                    Berita acara ini dibuat dengan sesungguhnya dan dipergunakan sebagaimana mestinya.
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '300px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '0', width: '60px' }}>{settings.city}, </td>
                            <td style={{ padding: '0' }}>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>PIHAK PERTAMA,</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPihak1BA || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.nikPihak1BA || ""}</p> 
                    </div>
                    <div style={{ width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>PIHAK KEDUA,</p>
                      {renderSafeDigitalSignature(true)}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPihak2BA || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.nikPihak2BA || ""}</p> 
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', padding: '0 1rem', textAlign: 'center' }}>
                    <div style={{ width: '300px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>Mengetahui / Mengesahkan :</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.jabatanPengesahBA || "NAMA JABATAN"},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPengesahBA || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.nikPengesahBA || ""}</p> 
                    </div>
                  </div>

                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "Ntl" || currentPrintDoc.typeCode === "Ntl" || currentPrintDoc.templateType === "Notula") ? (
                <div style={{ lineHeight: '1.5', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>NOTULEN</h3>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Acara</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.acaraNtl || ""}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Hari/tanggal</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>
                            {currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Waktu</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.waktuNtl || ""}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '100px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tempat</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.tempatNtl || ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginBottom: '2rem', width: '100%', whiteSpace: 'pre-wrap' }}>
                    {currentPrintDoc.isiNtl ? currentPrintDoc.isiNtl.split('\n').map((line, idx) => (
                      <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem', marginBottom: '0.25rem' }}>{line}</div>
                    )) : (
                      <>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%', marginBottom: '0.25rem' }}></div>
                        <div style={{ borderBottom: '1px dotted black', height: '1.5rem', width: '100%' }}></div>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2rem', marginBottom: '2rem', textAlign: 'center' }}>
                    <div style={{ width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>MODERATOR,</p>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>(tanda tangan)</span>
                      </div>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaModeratorNtl || "NAMA"}</p>
                    </div>
                    <div style={{ width: '250px' }}>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>NOTULEN,</p>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>(tanda tangan)</span>
                      </div>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaNotulisNtl || "NAMA"}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', padding: '0 1rem', textAlign: 'center' }}>
                    <div style={{ width: '300px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>Mengetahui,</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.jabatanPengesahNtl || "JABATAN"}</p>
                      <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>(tanda tangan)</span>
                      </div>
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPengesahNtl || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.nikPengesahNtl || ""}</p> 
                    </div>
                  </div>

                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "Dh" || currentPrintDoc.typeCode === "Dh" || currentPrintDoc.templateType === "Daftar Hadir") ? (
                <div style={{ lineHeight: '1.5', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DAFTAR HADIR</h3>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Hari / Tanggal</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>
                            {currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ""}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Waktu</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.waktuDh || ""}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Acara</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.acaraDh || ""}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tempat</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.tempatDh || ""}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
                      <thead>
                        <tr>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', width: '40px' }}>NO</th>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>NAMA</th>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>NIK</th>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}>JABATAN</th>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', width: '100px' }}>TANDA<br/>TANGAN</th>
                          <th style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', width: '60px' }}>KET</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: parseInt(currentPrintDoc.jmlBarisDh || 15, 10) }).map((_, i) => (
                          <tr key={i}>
                            <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', height: '30px' }}>{i + 1}</td>
                            <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                            <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                            <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                            <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center' }}><span style={{ fontSize: '0.7rem', color: '#999', position: 'relative', top: (i % 2 === 0 ? '-5px' : '5px'), left: (i % 2 === 0 ? '-15px' : '15px') }}>{i + 1}................</span></td>
                            <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                          </tr>
                        ))}
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', textAlign: 'center', height: '30px' }}>dst</td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                          <td style={{ border: '1px solid black', padding: '0.5rem' }}></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 1rem', textAlign: 'center', marginTop: '2rem' }}>
                    <div style={{ width: '300px' }}>
                      <p style={{ margin: '0 0 0.25rem 0' }}>Mengetahui,</p>
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0', textTransform: 'uppercase' }}>{currentPrintDoc.jabatanPengesahDh || "POSISI JABATAN"},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPengesahDh || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.nikPengesahDh || ""}</p> 
                    </div>
                  </div>

                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "Disp" || currentPrintDoc.typeCode === "Disp" || currentPrintDoc.templateType === "Disposisi Surat") ? (
                <div style={{ lineHeight: '1.5', fontSize: '11pt', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DISPOSISI SURAT</h3>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: 'none' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>Kepada</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black', width: '35%' }}>{currentPrintDoc.kepadaDisp || ""}</td>
                          <td style={{ width: '60px', padding: '0.2rem 0 0.2rem 1rem', verticalAlign: 'top' }}>Dari</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>{currentPrintDoc.dariDisp || ""}</td>
                        </tr>
                        <tr>
                          <td style={{ width: '80px', padding: '0.2rem 0', verticalAlign: 'top' }}>Tanggal</td>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>:</td>
                          <td colSpan="4" style={{ padding: '0.2rem 0', verticalAlign: 'top', borderBottom: '1px dotted black' }}>
                            {currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ""}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', marginTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', border: '1px solid black', marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {currentPrintDoc.isInformasiDisp ? "✓" : ""}
                      </div>
                      <span style={{ fontWeight: 'bold' }}>Informasi</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', border: '1px solid black', marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {currentPrintDoc.isAksiDisp ? "✓" : ""}
                      </div>
                      <span style={{ fontWeight: 'bold' }}>Aksi</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '20px', height: '20px', border: '1px solid black', marginRight: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {currentPrintDoc.isDisetujuiDisp ? "✓" : ""}
                      </div>
                      <span style={{ fontWeight: 'bold' }}>Disetujui</span>
                    </div>
                  </div>

                  <div style={{ border: '2px solid black', padding: '0.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    Catatan :
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black' }}>
                      <tbody>
                        {Array.from({ length: parseInt(currentPrintDoc.jmlBarisDisp || 14, 10) }).map((_, i) => (
                          <tr key={i}>
                            <td style={{ border: '2px solid black', width: '40px', height: '30px' }}></td>
                            <td style={{ border: '2px solid black' }}></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <p style={{ margin: '0 0 3rem 0' }}>Disampaikan oleh :</p>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: '350px', borderBottom: '1px dotted black', textAlign: 'center', minHeight: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {currentPrintDoc.namaPenyampaiDisp || ""}
                      </div>
                    </div>
                  </div>

                  <style>{`
                    .tembusan-block { display: none !important; }
                  `}</style>
                </div>
              ) : (currentPrintDoc.templateType === "Peng" || currentPrintDoc.typeCode === "Peng" || currentPrintDoc.templateType === "Pengumuman") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>PENGUMUMAN</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo || "......................................."}</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '1rem 0 0.25rem 0' }}>TENTANG</h3>
                    <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>
                      <span style={{ borderBottom: currentPrintDoc.tentangPeng ? 'none' : '1px dotted black', display: 'inline-block', minWidth: '300px' }}>
                        {currentPrintDoc.tentangPeng || "\u00A0"}
                      </span>
                    </p>
                  </div>

                  <div style={{ marginBottom: '3rem' }}>
                    <div style={{ width: '100%', whiteSpace: 'pre-wrap', lineHeight: '2' }}>
                      {currentPrintDoc.isiPeng ? (
                        currentPrintDoc.isiPeng.split('\n').map((line, idx) => (
                          <div key={idx} style={{ borderBottom: '1px dotted black', minHeight: '1.5rem' }}>{line}</div>
                        ))
                      ) : (
                        Array(6).fill("").map((_, i) => (
                          <div key={i} style={{ borderBottom: '1px dotted black', height: '2rem', width: '100%' }}></div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                    <div style={{ textAlign: 'left', width: '250px' }}>
                      <table style={{ border: 'none', marginBottom: '1rem' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 0.5rem 0 0' }}>Ditetapkan di</td><td style={{ padding: 0 }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{settings.city}</td></tr>
                          <tr><td style={{ padding: '0 0.5rem 0 0' }}>Pada tanggal</td><td style={{ padding: 0 }}>:</td><td style={{ padding: '0 0 0 0.5rem' }}>{currentPrintDoc.date ? new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ""}</td></tr>
                        </tbody>
                      </table>
                      
                      <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem 0' }}>DIREKTUR</p>
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{settings.clinicName},</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. {currentPrintDoc.signatory ? "" : "..................."}</p> 
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SK" || currentPrintDoc.typeCode === "SK" || currentPrintDoc.templateType === "Surat Kuasa") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>SURAT KUASA</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo || ".............................................."}</p>
                  </div>

                  <div style={{ margin: '0 0 1rem 0' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Yang bertandatangan dibawah ini :</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr><td style={{ width: '150px', padding: '0.2rem 0' }}>Nama</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.namaPemberi || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Alamat</td><td>:</td><td>{currentPrintDoc.alamatPemberi || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Jabatan</td><td>:</td><td>{currentPrintDoc.jabatanPemberi || "Direktur Klinik Baiturrahman"}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>No KTP</td><td>:</td><td>{currentPrintDoc.ktpPemberi || ".............................................."}</td></tr>
                      </tbody>
                    </table>
                    <p style={{ margin: '0.5rem 0 0 0' }}>Selanjutnya disebut <strong>PEMBERI KUASA</strong></p>
                  </div>

                  <div style={{ margin: '1rem 0' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Dengan ini memberikan kuasa kepada :</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr><td style={{ width: '150px', padding: '0.2rem 0' }}>Nama</td><td style={{ width: '20px' }}>:</td><td>{currentPrintDoc.namaPenerima || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Alamat</td><td>:</td><td>{currentPrintDoc.alamatPenerima || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>Jabatan</td><td>:</td><td>{currentPrintDoc.jabatanPenerima || ".............................................."}</td></tr>
                        <tr><td style={{ padding: '0.2rem 0' }}>No KTP</td><td>:</td><td>{currentPrintDoc.ktpPenerima || ".............................................."}</td></tr>
                      </tbody>
                    </table>
                    <p style={{ margin: '0.5rem 0 0 0' }}>Selanjutnya disebut <strong>PENERIMA KUASA.</strong></p>
                  </div>

                  <div style={{ margin: '1.5rem 0', textAlign: 'justify' }}>
                    <p style={{ marginBottom: '0.5rem' }}>Bertindak untuk dan atas nama pemberi kuasa selaku {currentPrintDoc.bertindakSelaku || ".............................................."} dalam {currentPrintDoc.bertindakSelaku ? "" : ".............................................."}</p>
                    <p style={{ marginBottom: '0.5rem' }}>Untuk itu penerima kuasa baik bersama-sama atau sendiri-sendiri berhak dan melakukan tindakan-tindakan yang dipandang perlu untuk {currentPrintDoc.tindakan || ".............................................."}</p>
                    <p>Demikian Surat Kuasa ini dibuat untuk dapat dipergunakan seperlunya.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', width: '250px' }}>
                      <p style={{ visibility: 'hidden', margin: '0 0 1rem 0' }}>Spacer</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>Pemberi Kuasa</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPemberi || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK {currentPrintDoc.ktpPemberi ? "" : "..................."}</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '250px' }}>
                      <p style={{ margin: '0 0 1rem 0' }}>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>Penerima Kuasa</p>
                      {renderSafeDigitalSignature(true)}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPenerima || "NAMA"}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK {currentPrintDoc.ktpPenerima ? "" : "..................."}</p>
                    </div>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPn" || currentPrintDoc.typeCode === "SPn" || currentPrintDoc.templateType === "Surat Perjanjian") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>PERJANJIAN</h3>
                    <p style={{ margin: 0 }}>NOMOR : {currentPrintDoc.docNo || ".............................................."}</p>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '1rem 0 0.5rem 0' }}>TENTANG</h3>
                    <p style={{ fontWeight: 'bold', margin: 0 }}>{currentPrintDoc.judulPerjanjian || "......................................................................................................"}</p>
                  </div>

                  <div style={{ margin: '1rem 0', textAlign: 'justify' }}>
                    <p>
                      Pada hari {currentPrintDoc.hariPerjanjian || "............."} Tanggal {currentPrintDoc.tanggalPerjanjian || "............."} Bulan {currentPrintDoc.bulanTahunPerjanjian ? currentPrintDoc.bulanTahunPerjanjian.split(" ")[0] : "............."} Tahun {currentPrintDoc.bulanTahunPerjanjian ? currentPrintDoc.bulanTahunPerjanjian.split(" ")[1] || "............." : "............."}, bertempat di {currentPrintDoc.tempatPerjanjian || "........................................."}, kami yang bertanda tangan dibawah ini :
                    </p>
                  </div>

                  <div style={{ margin: '0 0 1rem 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '20px', padding: '0.2rem 0', verticalAlign: 'top' }}>1.</td>
                          <td style={{ width: '120px', padding: '0.2rem 0', verticalAlign: 'top' }}>Nama</td>
                          <td style={{ width: '20px', verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.namaPihak1 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Alamat</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.alamatPihak1 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Jabatan</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.jabatanPihak1 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>No KTP / NIK</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.ktpPihak1 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan="3" style={{ padding: '0.5rem 0 1rem 0', fontStyle: 'italic', textAlign: 'center' }}>
                            ...................................................................................................... <strong>PIHAK KE I</strong>
                          </td>
                        </tr>
                        
                        <tr>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>2.</td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Nama</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.namaPihak2 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Alamat</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.alamatPihak2 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>Jabatan</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.jabatanPihak2 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td style={{ padding: '0.2rem 0', verticalAlign: 'top' }}>No KTP / NIK</td>
                          <td style={{ verticalAlign: 'top' }}>:</td>
                          <td>{currentPrintDoc.ktpPihak2 || "......................................................................................................"}</td>
                        </tr>
                        <tr>
                          <td></td>
                          <td colSpan="3" style={{ padding: '0.5rem 0 1rem 0', fontStyle: 'italic', textAlign: 'center' }}>
                            ...................................................................................................... <strong>PIHAK KE II</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ margin: '1.5rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {currentPrintDoc.isiPerjanjian || "Pasal ............................\n\n................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................\n\nPasal ............................\n\n................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................"}
                  </div>

                  <div style={{ margin: '1.5rem 0', textAlign: 'justify' }}>
                    <p style={{ margin: 0 }}>Penutup</p>
                    <p style={{ margin: 0 }}>Surat perjanjian ini ditandatangani oleh kedua belah pihak, pada hari dan tanggal tersebut.</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', width: '220px' }}>
                      <p style={{ visibility: 'hidden', margin: '0 0 1rem 0' }}>Spacer</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>PIHAK KE II,</p>
                      {renderSafeDigitalSignature(true)}
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPihak2 || "NAMA"}</p>
                    </div>
                    <div style={{ textAlign: 'center', width: '220px' }}>
                      <p style={{ visibility: 'hidden', margin: '0 0 1rem 0' }}>Spacer</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>PIHAK KE I,</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', margin: 0, textTransform: 'uppercase' }}>{currentPrintDoc.namaPihak1 || "NAMA"}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Nama</p>
                    <p style={{ margin: '0 0 0.5rem 0' }}>Saksi-saksi</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginLeft: '1rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '30px', padding: '0.2rem 0' }}>1.</td>
                          <td style={{ width: '250px' }}>{currentPrintDoc.saksi1 || ".............................................."}</td>
                          <td>(tanda tangan)</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.2rem 0' }}>2.</td>
                          <td>{currentPrintDoc.saksi2 || ".............................................."}</td>
                          <td>(tanda tangan)</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.2rem 0' }}>3.</td>
                          <td>{currentPrintDoc.saksi3 || ".............................................."}</td>
                          <td>(tanda tangan)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (currentPrintDoc.templateType === "SPD" || currentPrintDoc.typeCode === "SPD" || currentPrintDoc.templateType === "Surat Perjalanan Dinas") ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 0.25rem 0' }}>SURAT PERJALANAN DINAS (SPD)</h3>
                    <p style={{ margin: 0 }}>Nomor : {currentPrintDoc.docNo || "..................................................."}</p>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '0.9rem' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '45%', border: '1px solid black', padding: '0.4rem' }}>1. Pejabat Pembuat komitmen</td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>{currentPrintDoc.ppkSPD}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>2. Nama / NIK Pegawai yang melaksanakan Perjalanan Dinas</td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>{currentPrintDoc.pelaksanaSPD}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>
                          3. a. Pangkat dan Golongan<br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>b. Jabatan / Instansi</span><br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>c. Tingkat biaya Perjalanan Dinas</span>
                        </td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>
                          a. {currentPrintDoc.pangkatSPD}<br/>
                          b. {currentPrintDoc.jabatanInstansiSPD}<br/>
                          c. {currentPrintDoc.tingkatBiayaSPD}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>4. Maksud Perjalan Dinas</td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>{currentPrintDoc.maksudSPD}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>5. Alat angkut yang dipergunakan</td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>{currentPrintDoc.alatAngkutSPD}</td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>
                          6. a. Tempat berangkat<br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>b. Tempat tujuan</span>
                        </td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>
                          a. {currentPrintDoc.tempatBerangkatSPD}<br/>
                          b. {currentPrintDoc.tempatTujuanSPD}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>
                          7. a. Lamanya Perjalanan Dinas<br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>b. Tanggal berangkat</span><br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>c. Tanggal harus kembali</span>
                        </td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>
                          a. {currentPrintDoc.lamaPerjalananSPD} Hari<br/>
                          b. {currentPrintDoc.tglBerangkatSPD ? new Date(currentPrintDoc.tglBerangkatSPD).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''}<br/>
                          c. {currentPrintDoc.tglKembaliSPD ? new Date(currentPrintDoc.tglKembaliSPD).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>8. Pengikut : Nama</td>
                        <td style={{ width: '25%', border: '1px solid black', padding: '0.4rem' }}>Tanggal Lahir</td>
                        <td style={{ width: '30%', border: '1px solid black', padding: '0.4rem' }}>Keterangan</td>
                      </tr>
                      {(currentPrintDoc.pengikutSPD || []).length > 0 ? (
                        (currentPrintDoc.pengikutSPD || []).map((p, idx) => (
                          <tr key={idx}>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}><span style={{ display: 'inline-block', marginLeft: '1rem', marginRight: '0.5rem' }}>{idx + 1}.</span> {p.nama}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{p.tglLahir ? new Date(p.tglLahir).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}) : ''}</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>{p.ket}</td>
                          </tr>
                        ))
                      ) : (
                          <tr>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}><span style={{ display: 'inline-block', marginLeft: '1rem', marginRight: '0.5rem' }}>1.</span> -</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>-</td>
                            <td style={{ border: '1px solid black', padding: '0.4rem' }}>-</td>
                          </tr>
                      )}
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>
                          9. Pembebanan Anggaran<br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>a. Instansi</span><br/>
                          <span style={{ display: 'inline-block', marginLeft: '1rem' }}>b. Kode Mata Anggaran</span>
                        </td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>
                          <br/>
                          a. {currentPrintDoc.instansiAnggaranSPD}<br/>
                          b. {currentPrintDoc.kodeAnggaranSPD}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ border: '1px solid black', padding: '0.4rem' }}>10. Keterangan lain-lain</td>
                        <td colSpan="2" style={{ border: '1px solid black', padding: '0.4rem' }}>{currentPrintDoc.keteranganSPD}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'left', width: '300px' }}>
                      <table style={{ border: 'none' }}>
                        <tbody>
                          <tr><td style={{ padding: '0 0.5rem 0 0', width: '100px' }}>Ditetapkan di</td><td style={{ padding: 0, width: '15px' }}>:</td><td style={{ padding: 0 }}>{settings.city}</td></tr>
                          <tr><td style={{ padding: '0 0.5rem 0 0' }}>Pada tanggal</td><td style={{ padding: 0 }}>:</td><td style={{ padding: 0 }}>{new Date(currentPrintDoc.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</td></tr>
                        </tbody>
                      </table>
                      <p style={{ fontWeight: 'bold', margin: '0.5rem 0 0.25rem 0' }}>PEJABAT PEMBUAT KOMITMEN,</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{currentPrintDoc.ppkSPD || "..................................................."}</p>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>NIK. ...................................................</p> 
                    </div>
                  </div>
                  
                  <div style={{ pageBreakBefore: 'always', paddingTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', margin: '0 0 1rem 0' }}>(halaman kedua)</p>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ width: '50%', border: '1px solid black', padding: '0.5rem', verticalAlign: 'top', height: '140px' }}>
                          </td>
                          <td style={{ width: '50%', border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Berangkat dari : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>(tempat kedudukan) : ........................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Ke : ............................................................</p>
                            <p style={{ margin: '0 0 1.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Nama</p>
                            <p style={{ margin: 0 }}>NIK</p>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>II. Tiba di : ....................................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: 0 }}>Kepala : ........................................................</p>
                          </td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Berangkat dari : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Ke : ............................................................</p>
                            <p style={{ margin: 0 }}>Pada tanggal : ..............................................</p>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>III. Tiba di : ....................................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: 0 }}>Kepala : ........................................................</p>
                          </td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Berangkat dari : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Ke : ............................................................</p>
                            <p style={{ margin: 0 }}>Pada tanggal : ..............................................</p>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>IV. Tiba di : ....................................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: 0 }}>Kepala : ........................................................</p>
                          </td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Berangkat dari : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Ke : ............................................................</p>
                            <p style={{ margin: 0 }}>Pada tanggal : ..............................................</p>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>V. Tiba di : ....................................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: 0 }}>Kepala : ........................................................</p>
                          </td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Berangkat dari : ..............................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Ke : ............................................................</p>
                            <p style={{ margin: 0 }}>Pada tanggal : ..............................................</p>
                          </td>
                        </tr>
                        <tr>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0' }}>VI. Tiba di : ....................................................</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>(Tempat Kedudukan)</p>
                            <p style={{ margin: '0 0 1.5rem 0' }}>Pada tanggal : ..............................................</p>
                            <p style={{ margin: '0 0 2rem 0' }}>Pejabat Pembuat Komitmen</p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>Nama</p>
                            <p style={{ margin: 0 }}>NIK</p>
                          </td>
                          <td style={{ border: '1px solid black', padding: '0.5rem', verticalAlign: 'top' }}>
                            <p style={{ margin: '0 0 0.5rem 0', textAlign: 'justify' }}>Telah diperiksa, dengan keterangan bahwa perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan.</p>
                            <p style={{ margin: '3.5rem 0 0.5rem 0' }}>(Nama)</p>
                            <p style={{ margin: 0 }}>NIK</p>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="2" style={{ border: '1px solid black', padding: '0.5rem' }}>
                            <span style={{ marginRight: '1rem' }}>VII. Catatan Lain-lain</span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="2" style={{ border: '1px solid black', padding: '0.5rem' }}>
                            <span style={{ marginRight: '1rem' }}>VIII. PERHATIAN :</span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="2" style={{ border: '1px solid black', padding: '0.5rem' }}>
                            <p style={{ margin: 0, textAlign: 'justify', textIndent: '2rem' }}>Pejabat Pembuat Komitmen yang menerbitkan SPD, pegawai yang melakukan perjalanan dinas, para Jabatan yang mengesahan tanggal berangkat / tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan perusahaan.</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : currentPrintDoc.templateType === "BA" ? (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>BERITA ACARA</h3>
                    <p>NOMOR : {currentPrintDoc.docNo}</p>
                  </div>

                  <div style={{ margin: '2rem 0', whiteSpace: 'pre-wrap', textAlign: 'justify' }}>
                    {renderFormattedContent(currentPrintDoc.content)}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: (currentPrintDoc.signeeCount === 2 || (currentPrintDoc.signeeCount !== 1 && Boolean((currentPrintDoc.leftSignatoryName && currentPrintDoc.leftSignatoryName.trim()) || (currentPrintDoc.leftSignatoryTitle && currentPrintDoc.leftSignatoryTitle.trim())))) ? 'space-between' : 'flex-end', 
                    marginTop: '4rem', 
                    padding: '0 2rem' 
                  }}>
                    {(currentPrintDoc.signeeCount === 2 || (currentPrintDoc.signeeCount !== 1 && Boolean((currentPrintDoc.leftSignatoryName && currentPrintDoc.leftSignatoryName.trim()) || (currentPrintDoc.leftSignatoryTitle && currentPrintDoc.leftSignatoryTitle.trim())))) && (
                      <div style={{ textAlign: 'center', width: '220px' }}>
                        <p style={{ visibility: 'hidden' }}>Spacer</p>
                        <p style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{currentPrintDoc.leftSignatoryTitle || 'PIHAK KEDUA,'}</p>
                        <div style={{ height: '75px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.leftSignatoryName || '( .................................... )'}</p>
                        <p style={{ margin: 0 }}>NIK. ..............................</p>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', width: '220px' }}>
                      <p>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>PIHAK PERTAMA,</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.signatory || settings.directorName}</p>
                      <p style={{ margin: 0 }}>NIK. ..............................</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ textDecoration: 'underline', fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                      {(() => {
                        if (currentPrintDoc.templateType === 'Surat Lain-lain' || currentPrintDoc.typeCode === 'SLL' || currentPrintDoc.templateType === 'SLL') {
                          return (currentPrintDoc.subject || 'SURAT KETERANGAN / PERNYATAAN').toUpperCase();
                        }
                        const typeObj = letterTypes.find(t => t.code === currentPrintDoc.typeCode || t.name === currentPrintDoc.templateType || t.code === currentPrintDoc.templateType);
                        if (typeObj) return typeObj.name.toUpperCase();
                        if (currentPrintDoc.templateTypeName) return currentPrintDoc.templateTypeName.toUpperCase();
                        if (currentPrintDoc.templateType && currentPrintDoc.templateType !== 'Direktur Utama') return currentPrintDoc.templateType.toUpperCase();
                        if (currentPrintDoc.subject) return currentPrintDoc.subject.toUpperCase();
                        return 'SURAT KETERANGAN';
                      })()}
                    </h3>
                    <p>Nomor: {currentPrintDoc.docNo}</p>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p>Kepada Yth,</p>
                    <p><strong>{currentPrintDoc.recipientName}</strong></p>
                    <p>{currentPrintDoc.destination}</p>
                  </div>

                  <div style={{ margin: '2rem 0', whiteSpace: 'pre-wrap' }}>
                    {renderFormattedContent(currentPrintDoc.content)}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: (currentPrintDoc.signeeCount === 2 || (currentPrintDoc.signeeCount !== 1 && Boolean((currentPrintDoc.leftSignatoryName && currentPrintDoc.leftSignatoryName.trim()) || (currentPrintDoc.leftSignatoryTitle && currentPrintDoc.leftSignatoryTitle.trim())))) ? 'space-between' : 'flex-end', 
                    marginTop: '4rem', 
                    padding: '0 1rem' 
                  }}>
                    {(currentPrintDoc.signeeCount === 2 || (currentPrintDoc.signeeCount !== 1 && Boolean((currentPrintDoc.leftSignatoryName && currentPrintDoc.leftSignatoryName.trim()) || (currentPrintDoc.leftSignatoryTitle && currentPrintDoc.leftSignatoryTitle.trim())))) && (
                      <div style={{ textAlign: 'center', width: '220px' }}>
                        <p style={{ visibility: 'hidden' }}>Spacer</p>
                        {currentPrintDoc.leftSignatoryTitle ? (
                          <p style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{currentPrintDoc.leftSignatoryTitle}</p>
                        ) : (
                          <div style={{ height: '1.2rem' }}></div>
                        )}
                        <div style={{ height: '75px' }}></div>
                        <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.leftSignatoryName || '( .................................... )'}</p>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', width: '220px' }}>
                      <p>{settings.city}, {new Date(currentPrintDoc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{currentPrintDoc.title || 'Direktur Utama'}</p>
                      {renderSafeDigitalSignature()}
                      <p style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{currentPrintDoc.signatory || settings.directorName || '( .................................... )'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tembusan (semua surat standar) */}
              {(currentPrintDoc.tembusan && currentPrintDoc.tembusan.length > 0 && currentPrintDoc.tembusan.some(t => t.trim() !== "")) && (
                <div style={{ marginTop: '2rem', fontSize: '12pt' }}>
                  <p style={{ margin: 0 }}>Tembusan :</p>
                  <ol style={{ margin: '0.25rem 0', paddingLeft: '1.25rem' }}>
                    {currentPrintDoc.tembusan.filter(t => t.trim() !== "").map((t, idx) => (
                      <li key={idx} style={{ paddingLeft: '0.25rem' }}>{t}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Lampiran Surat Umum (jika bukan SKep dan opsi lampiran aktif) */}
              {(currentPrintDoc.typeCode !== "SKep" && currentPrintDoc.templateType !== "SKep" && currentPrintDoc.templateType !== "Surat Keputusan") && (currentPrintDoc.gunakanLampiran || currentPrintDoc.lampiranData?.gunakanLampiran) && (
                renderLampiranDocument(false)
              )}
              </>
</>
              )}
            </div>
          )}

          {currentPrintType === "cert" && (
            <div id="print-area" style={{
              fontFamily: "'Playfair Display', 'Cinzel', Georgia, 'Times New Roman', serif",
              color: '#1a1a1a',
              width: '297mm',
              minWidth: '297mm',
              maxWidth: '297mm',
              minHeight: '210mm',
              height: '210mm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              backgroundColor: '#faf8f5',
              background: 'radial-gradient(ellipse at center, #ffffff 45%, #f6f3eb 100%)',
              padding: '7mm 14mm 8mm',
              border: '4px solid #0d382c',
              outline: '1.5px solid #c5a059',
              outlineOffset: '-6px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}>
              {/* Background Watermark */}
              <div style={{
                position: 'absolute',
                top: '52%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '260px',
                height: '260px',
                opacity: 0.04,
                pointerEvents: 'none',
                zIndex: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img src={settings?.logo || "/logo.png"} alt="Watermark" style={{ width: '100%', height: 'auto', filter: 'grayscale(100%)' }} />
              </div>

              {/* 4 Intricate Baroque Corner Flourishes */}
              {/* Top-Left */}
              <div style={{ position: 'absolute', top: '7px', left: '7px', width: '85px', height: '85px', pointerEvents: 'none', zIndex: 2 }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M3 3 L45 3 C45 15 35 25 25 25 C15 25 3 15 3 3 Z" fill="#c5a059" opacity="0.2" />
                  <path d="M3 3 L95 3 M3 3 L3 95" stroke="#0d382c" strokeWidth="2.5" />
                  <path d="M7 7 L80 7 M7 7 L7 80" stroke="#c5a059" strokeWidth="1.2" />
                  <path d="M11 11 Q30 11 40 22 Q50 32 36 44 Q22 56 26 74 Q17 52 17 34 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M11 11 Q11 30 22 40 Q32 50 44 36 Q56 22 74 26 Q52 17 34 17 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M8 8 C25 8 60 20 65 65 C50 42 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <path d="M8 8 C8 25 20 60 65 65 C42 50 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <circle cx="24" cy="24" r="3.5" fill="#0d382c" />
                  <circle cx="24" cy="24" r="2" fill="#d4af37" />
                  <circle cx="50" cy="14" r="2.2" fill="#b8860b" />
                  <circle cx="14" cy="50" r="2.2" fill="#b8860b" />
                  <circle cx="72" cy="11" r="1.8" fill="#0d382c" />
                  <circle cx="11" cy="72" r="1.8" fill="#0d382c" />
                </svg>
              </div>
              {/* Top-Right */}
              <div style={{ position: 'absolute', top: '7px', right: '7px', width: '85px', height: '85px', pointerEvents: 'none', zIndex: 2, transform: 'scaleX(-1)' }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M3 3 L45 3 C45 15 35 25 25 25 C15 25 3 15 3 3 Z" fill="#c5a059" opacity="0.2" />
                  <path d="M3 3 L95 3 M3 3 L3 95" stroke="#0d382c" strokeWidth="2.5" />
                  <path d="M7 7 L80 7 M7 7 L7 80" stroke="#c5a059" strokeWidth="1.2" />
                  <path d="M11 11 Q30 11 40 22 Q50 32 36 44 Q22 56 26 74 Q17 52 17 34 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M11 11 Q11 30 22 40 Q32 50 44 36 Q56 22 74 26 Q52 17 34 17 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M8 8 C25 8 60 20 65 65 C50 42 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <path d="M8 8 C8 25 20 60 65 65 C42 50 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <circle cx="24" cy="24" r="3.5" fill="#0d382c" />
                  <circle cx="24" cy="24" r="2" fill="#d4af37" />
                  <circle cx="50" cy="14" r="2.2" fill="#b8860b" />
                  <circle cx="14" cy="50" r="2.2" fill="#b8860b" />
                  <circle cx="72" cy="11" r="1.8" fill="#0d382c" />
                  <circle cx="11" cy="72" r="1.8" fill="#0d382c" />
                </svg>
              </div>
              {/* Bottom-Left */}
              <div style={{ position: 'absolute', bottom: '7px', left: '7px', width: '85px', height: '85px', pointerEvents: 'none', zIndex: 2, transform: 'scaleY(-1)' }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M3 3 L45 3 C45 15 35 25 25 25 C15 25 3 15 3 3 Z" fill="#c5a059" opacity="0.2" />
                  <path d="M3 3 L95 3 M3 3 L3 95" stroke="#0d382c" strokeWidth="2.5" />
                  <path d="M7 7 L80 7 M7 7 L7 80" stroke="#c5a059" strokeWidth="1.2" />
                  <path d="M11 11 Q30 11 40 22 Q50 32 36 44 Q22 56 26 74 Q17 52 17 34 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M11 11 Q11 30 22 40 Q32 50 44 36 Q56 22 74 26 Q52 17 34 17 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M8 8 C25 8 60 20 65 65 C50 42 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <path d="M8 8 C8 25 20 60 65 65 C42 50 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <circle cx="24" cy="24" r="3.5" fill="#0d382c" />
                  <circle cx="24" cy="24" r="2" fill="#d4af37" />
                  <circle cx="50" cy="14" r="2.2" fill="#b8860b" />
                  <circle cx="14" cy="50" r="2.2" fill="#b8860b" />
                  <circle cx="72" cy="11" r="1.8" fill="#0d382c" />
                  <circle cx="11" cy="72" r="1.8" fill="#0d382c" />
                </svg>
              </div>
              {/* Bottom-Right */}
              <div style={{ position: 'absolute', bottom: '7px', right: '7px', width: '85px', height: '85px', pointerEvents: 'none', zIndex: 2, transform: 'scale(-1, -1)' }}>
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M3 3 L45 3 C45 15 35 25 25 25 C15 25 3 15 3 3 Z" fill="#c5a059" opacity="0.2" />
                  <path d="M3 3 L95 3 M3 3 L3 95" stroke="#0d382c" strokeWidth="2.5" />
                  <path d="M7 7 L80 7 M7 7 L7 80" stroke="#c5a059" strokeWidth="1.2" />
                  <path d="M11 11 Q30 11 40 22 Q50 32 36 44 Q22 56 26 74 Q17 52 17 34 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M11 11 Q11 30 22 40 Q32 50 44 36 Q56 22 74 26 Q52 17 34 17 Q17 17 11 11 Z" fill="#b8860b" opacity="0.6" />
                  <path d="M8 8 C25 8 60 20 65 65 C50 42 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <path d="M8 8 C8 25 20 60 65 65 C42 50 38 38 8 8" stroke="#b8860b" strokeWidth="1.5" fill="none" />
                  <circle cx="24" cy="24" r="3.5" fill="#0d382c" />
                  <circle cx="24" cy="24" r="2" fill="#d4af37" />
                  <circle cx="50" cy="14" r="2.2" fill="#b8860b" />
                  <circle cx="14" cy="50" r="2.2" fill="#b8860b" />
                  <circle cx="72" cy="11" r="1.8" fill="#0d382c" />
                  <circle cx="11" cy="72" r="1.8" fill="#0d382c" />
                </svg>
              </div>

              {/* ====== KOP / HEADER RESMI ====== */}
              {(currentPrintDoc.showKop !== false) && (
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginTop: '1mm', marginBottom: '0.5rem' }}>
                  {/* Top Centered Logo - plain, no gold ring */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3px' }}>
                    <img
                      src={currentPrintDoc.kopLogo || settings?.logo || "/logo.png"}
                      alt="Logo Klinik"
                      style={{ width: '55px', height: 'auto', maxHeight: '58px', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Yayasan Name */}
                  <p style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: 400,
                    margin: '0 0 1px',
                    color: '#000'
                  }}>
                    {currentPrintDoc.kopYayasan || settings?.yayasanName || 'Yayasan Baeturrachman Garut'}
                  </p>

                  {/* Clinic Name - Bold & Large */}
                  <h2 style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    letterSpacing: '1px',
                    margin: '0 0 2px',
                    color: '#000',
                    textTransform: 'uppercase'
                  }}>
                    {currentPrintDoc.kopClinic || (settings?.clinicName ? settings.clinicName.toUpperCase() : 'KLINIK BAITURRAHMAN')}{settings?.city ? ` ${settings.city.toUpperCase()}` : ' GARUT'}
                  </h2>

                  {/* Sertifikat Standar Number */}
                  <p style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: '0.7rem',
                    fontWeight: 400,
                    margin: '0 0 1px',
                    color: '#000'
                  }}>
                    {formatSertifikatStandar(settings?.nib)}
                  </p>

                  {/* Address */}
                  <p style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: '0.67rem',
                    margin: '0 0 1px',
                    color: '#000'
                  }}>
                    {currentPrintDoc.kopAddress || formatKopAddress(settings) || 'Jl. Merdeka No. 217 Tarogong Kidul - Garut, Telp. 0262-234754, HP. 0813-2124-3303'}
                  </p>

                  {/* Email - italic & underline */}
                  <p style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: '0.67rem',
                    margin: '0 0 3px',
                    color: '#000',
                    fontStyle: 'italic',
                    textDecoration: 'underline'
                  }}>
                    {settings?.email ? `Email: ${settings.email}` : 'Email: klinikbaiturrahman@rocketmail.com'}
                  </p>

                  {/* Thick Bottom Border */}
                  <div style={{ borderBottom: '3px solid #000', marginTop: '2px' }} />
                </div>
              )}

              {/* ====== JUDUL SERTIFIKAT & GOLD RIBBON BANNER ====== */}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', margin: '0.15rem 0 0.25rem' }}>
                <h1 style={{
                  fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif",
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  letterSpacing: '7px',
                  margin: '0 0 4px',
                  textTransform: 'uppercase',
                  color: '#0d382c',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  SERTIFIKAT
                </h1>

                {/* 3D Gold Ribbon Banner */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', position: 'relative', margin: '2px 0 4px' }}>
                  {/* Left Swallowtail Ribbon Wing */}
                  <div style={{
                    width: '18px',
                    height: '24px',
                    backgroundColor: '#8a641f',
                    clipPath: 'polygon(100% 0%, 100% 100%, 0% 100%, 40% 50%, 0% 0%)',
                    marginRight: '-4px',
                    filter: 'drop-shadow(-1px 2px 2px rgba(0,0,0,0.25))'
                  }} />
                  {/* Center Ribbon Body */}
                  <div style={{
                    background: 'linear-gradient(180deg, #c5a059 0%, #a0782b 50%, #8c6721 100%)',
                    padding: '3px 28px',
                    boxShadow: '0 3px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)',
                    position: 'relative',
                    zIndex: 2,
                    borderTop: '1px solid #dfc282',
                    borderBottom: '1px solid #6b4d12'
                  }}>
                    <p style={{
                      fontFamily: "'Cinzel', sans-serif",
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      margin: 0,
                      color: '#ffffff',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      textShadow: '0 1px 2px rgba(0,0,0,0.6)'
                    }}>
                      PIAGAM PENGHARGAAN &amp; KELULUSAN
                    </p>
                  </div>
                  {/* Right Swallowtail Ribbon Wing */}
                  <div style={{
                    width: '18px',
                    height: '24px',
                    backgroundColor: '#8a641f',
                    clipPath: 'polygon(0% 0%, 60% 50%, 0% 100%, 100% 100%, 100% 0%)',
                    marginLeft: '-4px',
                    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.25))'
                  }} />
                </div>

                {/* Certificate Number */}
                <div style={{ marginTop: '2px' }}>
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: '0.78rem', color: '#374151', margin: 0, letterSpacing: '0.5px' }}>
                    Nomor: <strong style={{ color: '#0d382c', fontWeight: 800 }}>{currentPrintDoc.docNo}</strong>
                  </p>
                </div>
              </div>

              {/* ====== NAMA PENERIMA ====== */}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', margin: '0.1rem 0 0.3rem' }}>
                <p style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontSize: '1.5rem',
                  color: '#2d3748',
                  margin: '0 0 2px',
                  lineHeight: '1.2'
                }}>
                  Diberikan dengan hormat kepada :
                </p>
                
                <h2 style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.95rem',
                  fontWeight: 900,
                  margin: '2px 0 4px',
                  color: '#0d382c',
                  letterSpacing: '0.5px'
                }}>
                  {currentPrintDoc.name || '( Nama Penerima )'}
                </h2>

                {(currentPrintDoc.identityNo || currentPrintDoc.institution || currentPrintDoc.major) && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '3px 16px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255,255,255,0.85)',
                      border: '1px solid #d1d5db',
                      fontSize: '0.78rem',
                      fontFamily: "Arial, sans-serif",
                      color: '#374151',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}>
                      {currentPrintDoc.identityNo && <span>NIS/NIM/NIP: <strong style={{ color: '#0d382c' }}>{currentPrintDoc.identityNo}</strong></span>}
                      {currentPrintDoc.identityNo && (currentPrintDoc.institution || currentPrintDoc.major) && <span style={{ color: '#9ca3af' }}>•</span>}
                      {currentPrintDoc.institution && <span><strong>{currentPrintDoc.institution}</strong></span>}
                      {currentPrintDoc.institution && currentPrintDoc.major && <span style={{ color: '#9ca3af' }}>•</span>}
                      {currentPrintDoc.major && <span>{currentPrintDoc.major}</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* ====== BODY / ISI ====== */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                fontSize: '0.84rem',
                fontFamily: "'Playfair Display', Georgia, serif",
                lineHeight: '1.55',
                margin: '0.2rem 1.8rem',
                textAlign: 'justify',
                color: '#1f2937'
              }}>
                {currentPrintDoc.customBody ? (
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{currentPrintDoc.customBody}</p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 0.3rem' }}>
                      Yang bertanda tangan di bawah ini, Direktur <strong>{settings.clinicName || 'Klinik Baiturrahman'}</strong>, dengan ini menerangkan bahwa yang bersangkutan telah selesai melaksanakan kegiatan <strong>{currentPrintDoc.activityType || 'Magang / Praktik Kerja'}</strong> di lingkungan <strong>{settings.clinicName || 'Klinik Baiturrahman'}</strong>, terhitung mulai tanggal <strong>{(() => { if (!currentPrintDoc.startDate) return '______________'; const d = new Date(currentPrintDoc.startDate); return isNaN(d.getTime()) ? currentPrintDoc.startDate : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); })()}</strong> sampai dengan tanggal <strong>{(() => { if (!currentPrintDoc.endDate) return '______________'; const d = new Date(currentPrintDoc.endDate); return isNaN(d.getTime()) ? currentPrintDoc.endDate : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }); })()}</strong>. Selama melaksanakan kegiatan tersebut.
                    </p>
                    <p style={{ margin: '0 0 0.3rem' }}>
                      Sertifikat ini diberikan sebagai bentuk penghargaan atas partisipasi aktif dan kontribusi positif di sekitarnya. Selama melaksanakan kegiatan tersebut, bersangkutan telah menunjukkan <strong>{currentPrintDoc.notes || 'Sangat Baik'}</strong>.
                    </p>
                    <p style={{ margin: 0 }}>
                      Demikian sertifikat ini dibuat sebenarnya untuk dapat dipergunakan sebagaimana mestinya yang bersangkutan selama mengikuti kegiatan di {settings.clinicName || 'Klinik Baiturrahman'}.
                    </p>
                  </>
                )}
              </div>

              {/* ====== FOOTER: TANDA TANGAN & EMBOSSED GOLD WAX SEAL ====== */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '0.2rem',
                marginBottom: '1mm',
                display: 'flex',
                justifyContent: (currentPrintDoc.leftSignatoryTitle || currentPrintDoc.leftSignatoryName) ? 'space-between' : 'flex-end',
                alignItems: 'center',
                paddingLeft: '2.5rem',
                paddingRight: '2.5rem'
              }}>
                {/* TTD Kedua jika ada */}
                {(currentPrintDoc.leftSignatoryTitle || currentPrintDoc.leftSignatoryName) && (
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: '#666', fontStyle: 'italic', fontFamily: "Arial, sans-serif" }}>Mengetahui,</p>
                    <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: '0 0 2px', color: '#0d382c', fontFamily: "'Cinzel', Georgia, serif" }}>
                      {currentPrintDoc.leftSignatoryTitle || 'Pembimbing'}
                    </p>
                    <div style={{ height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Spasi TTD */}
                    </div>
                    <div style={{ borderTop: '1.2px solid #222', paddingTop: '2px', margin: '0 auto', width: '150px' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.82rem', margin: 0, fontFamily: "Arial, sans-serif" }}>
                        {currentPrintDoc.leftSignatoryName || '( .................................... )'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Right Signature Area with 3D Embossed Gold Wax Seal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  {/* TTD Utama: Direktur */}
                  <div style={{ textAlign: 'center', width: '220px' }}>
                    <p style={{ margin: '0 0 1px', fontSize: '0.72rem', color: '#4b5563', fontFamily: "Arial, sans-serif" }}>
                      {settings.city || 'Garut'}, {new Date(currentPrintDoc.date || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p style={{ fontWeight: 800, fontSize: '0.82rem', margin: '0 0 2px', color: '#0d382c', fontFamily: "'Cinzel', Georgia, serif", letterSpacing: '1px' }}>
                      {currentPrintDoc.title || 'DIREKTUR UTAMA'}
                    </p>
                    
                    <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      {((currentPrintDoc?.useDigitalSignature !== false && settings?.signature) || (currentPrintDoc?.useDigitalStamp !== false && settings?.stamp)) ? (
                        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '40px', width: '100%' }}>
                          {(currentPrintDoc?.useDigitalStamp !== false && settings?.stamp) && <img src={settings.stamp} alt="stempel" style={{ position: 'absolute', width: '50px', height: 'auto', left: '10%', opacity: 0.8 }} />}
                          {(currentPrintDoc?.useDigitalSignature !== false && settings?.signature) && <img src={settings.signature} alt="ttd" style={{ position: 'relative', width: '75px', height: 'auto', zIndex: 2 }} />}
                        </div>
                      ) : null}
                    </div>

                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.84rem', margin: 0, color: '#0d382c', fontFamily: "Arial, sans-serif" }}>
                        {currentPrintDoc.signatory || settings.directorName || 'Dr. H. Ahmad Fauzi, M.Kes'}
                      </p>
                      {settings.directorNik && (
                        <p style={{ fontSize: '0.7rem', color: '#555', margin: '1px 0 0', fontFamily: "Arial, sans-serif" }}>
                          NIK. {settings.directorNik}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3D Embossed Gold Wax Rosette Medallion Seal */}
                  <div style={{ width: '64px', height: '64px', position: 'relative', flexShrink: 0, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }}>
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                      <defs>
                        <radialGradient id="goldSealGrad" cx="35%" cy="35%" r="65%">
                          <stop offset="0%" stopColor="#fae19c" />
                          <stop offset="35%" stopColor="#d4af37" />
                          <stop offset="70%" stopColor="#aa7c11" />
                          <stop offset="100%" stopColor="#634503" />
                        </radialGradient>
                        <radialGradient id="goldInnerGrad" cx="40%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#fdf0cd" />
                          <stop offset="45%" stopColor="#c5a059" />
                          <stop offset="85%" stopColor="#8c6615" />
                          <stop offset="100%" stopColor="#553a02" />
                        </radialGradient>
                        <filter id="sealEmboss" x="-10%" y="-10%" width="120%" height="120%">
                          <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
                        </filter>
                      </defs>
                      
                      {/* 24-point Scalloped Rosette Edge */}
                      <path d="M50 2 L54 10 L63 5 L65 14 L75 11 L75 21 L85 20 L83 30 L93 32 L88 41 L97 45 L90 53 L98 60 L89 66 L94 75 L84 79 L87 89 L76 90 L76 100 L66 98 L63 107 L54 102 L50 110 L46 102 L37 107 L34 98 L24 100 L24 90 L13 89 L16 79 L6 75 L11 66 L2 60 L10 53 L3 45 L12 41 L7 32 L17 30 L15 20 L25 21 L25 11 L35 14 L37 5 L46 10 Z"
                        transform="scale(0.88) translate(7, 7)"
                        fill="url(#goldSealGrad)"
                        stroke="#5c3f03"
                        strokeWidth="1"
                      />
                      
                      {/* Outer Ring */}
                      <circle cx="50" cy="50" r="34" fill="url(#goldInnerGrad)" stroke="#fae19c" strokeWidth="1.5" filter="url(#sealEmboss)" />
                      {/* Inner Beaded Ring */}
                      <circle cx="50" cy="50" r="28" fill="none" stroke="#634503" strokeWidth="1" strokeDasharray="2.5,2.5" />
                      {/* Center Emblem Disc */}
                      <circle cx="50" cy="50" r="22" fill="url(#goldSealGrad)" stroke="#fae19c" strokeWidth="1" />
                      {/* Center Star / Ribbon Icon */}
                      <path d="M50 36 L53 45 L62 45 L55 51 L58 60 L50 54 L42 60 L45 51 L38 45 L47 45 Z" fill="#fdf0cd" opacity="0.85" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPrintType === "report_letters" && (
            <div>
              {/* Header Kop Surat - Center Aligned & Compact */}
              <div style={{ marginBottom: '1rem', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                  <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                  <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                  <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{(settings?.clinicName || "KLINIK BAITURRAHMAN").replace(/ GARUT$/i, '')}</h1>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
                  <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                  <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                    Email: <span style={{ textDecoration: 'underline' }}>{settings?.email || 'klinikbaiturrahman@gmail.com'}</span>
                  </p>
                </div>
                {/* Thick line and thin line */}
                <div style={{ borderTop: '3px solid black', marginTop: '2px' }}></div>
                <div style={{ borderTop: '1px solid black', marginTop: '1px' }}></div>
              </div>

              {/* Title Laporan */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>
                  LAPORAN REKAPITULASI {currentPrintDoc?.type === 'in' ? 'SURAT MASUK' : currentPrintDoc?.type === 'out' ? 'SURAT KELUAR' : 'PERSURATAN (MASUK & KELUAR)'}
                </h2>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>
                  PERIODE BULAN: {(() => {
                    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    const idx = parseInt(currentPrintDoc?.month || "08", 10) - 1;
                    return months[idx] || "Agustus";
                  })()} {currentPrintDoc?.year || "2026"}
                </p>
              </div>

              {/* Table Laporan Bulanan (NO, NO SURAT, URAIAN (TUJUAN SURAT), NAMA / TTD, KETERANGAN) */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '3rem', color: '#000' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #000', padding: '0.6rem', width: '45px', textAlign: 'center' }}>NO</th>
                    <th style={{ border: '1px solid #000', padding: '0.6rem', width: '180px', textAlign: 'left' }}>NO SURAT</th>
                    <th style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'left' }}>URAIAN (TUJUAN SURAT / PERIHAL)</th>
                    <th style={{ border: '1px solid #000', padding: '0.6rem', width: '170px', textAlign: 'left' }}>NAMA / TTD</th>
                    <th style={{ border: '1px solid #000', padding: '0.6rem', width: '120px', textAlign: 'center' }}>KETERANGAN</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredLetterReport(currentPrintDoc?.month || "08", currentPrintDoc?.year || "2026", currentPrintDoc?.type || "all").map((item, index) => (
                    <tr key={index}>
                      <td style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center' }}>{index + 1}</td>
                      <td style={{ border: '1px solid #000', padding: '0.6rem', fontWeight: 600 }}>{item.noSurat}</td>
                      <td style={{ border: '1px solid #000', padding: '0.6rem' }}>
                        <div style={{ fontWeight: 'bold' }}>{item.tujuan}</div>
                        <div style={{ fontStyle: 'italic', marginTop: '0.2rem' }}>Perihal: {item.perihal}</div>
                      </td>
                      <td style={{ border: '1px solid #000', padding: '0.6rem' }}>{item.namaTtd}</td>
                      <td style={{ border: '1px solid #000', padding: '0.6rem', textAlign: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{item.keterangan}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* TTD Signature Block */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                <div style={{ textAlign: 'center', width: '260px' }}>
                  <p style={{ margin: '0 0 0.25rem 0' }}>{settings?.city || "Garut"}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p style={{ fontWeight: 'bold', margin: '0 0 4rem 0' }}>Kepala Bagian Persuratan & Administrasi</p>
                  <p style={{ fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>{settings?.directorName || "Dr. H. Ahmad Fauzi, M.Kes"}</p>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>NIP: 19780412 200501 1 004</p>
                </div>
              </div>
            </div>
          )}

          {currentPrintType === "report" && (() => {
            const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
            const m = currentPrintDoc?.month || selectedReportPeriod?.month || "08";
            const year = currentPrintDoc?.year || selectedReportPeriod?.year || "2026";
            const monthName = monthNames[parseInt(m) - 1] || "Agustus";
            const filteredOut = (outgoingLetters || []).filter(l => l?.date && String(l.date).startsWith(`${year}-${m}`));
            const filteredIn = (incomingLetters || []).filter(l => l?.date && String(l.date).startsWith(`${year}-${m}`));
            const filteredCerts = (certificates || []).filter(c => c?.date && String(c.date).startsWith(`${year}-${m}`));
            const filteredStockIn = (stockInList || []).filter(s => s?.date && String(s.date).startsWith(`${year}-${m}`));
            const filteredStockOut = (stockOutList || []).filter(s => s?.date && String(s.date).startsWith(`${year}-${m}`));
            const filteredBorrow = (borrowings || []).filter(b => b?.date && String(b.date).startsWith(`${year}-${m}`));

            let modalSecCode = 65; // 'A'
            const modalLetters = {
              summary: String.fromCharCode(modalSecCode++),
              suratMasuk: filteredIn.length > 0 ? String.fromCharCode(modalSecCode++) : null,
              suratKeluar: filteredOut.length > 0 ? String.fromCharCode(modalSecCode++) : null,
              sertifikat: filteredCerts.length > 0 ? String.fromCharCode(modalSecCode++) : null,
              gudang: (filteredStockIn.length > 0 || filteredStockOut.length > 0) ? String.fromCharCode(modalSecCode++) : null,
            };

            return (
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                {/* Kop Surat Resmi - Center Aligned & Compact */}
                <div style={{ marginBottom: '1rem', textAlign: 'center', fontFamily: 'Arial, Helvetica, sans-serif', color: '#000', lineHeight: '1.15' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.5rem' }}>
                    <img src={settings?.logo || "/logo.png"} width="85" height="85"  alt="Logo" style={{ width: '85px', height: 'auto', marginBottom: '4px' }} />
                    <p style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 'bold', margin: '0 0 3px 0', textTransform: 'uppercase', color: '#000', letterSpacing: '0.2px' }}>{(settings.clinicName || "KLINIK BAITURRAHMAN").replace(/ GARUT$/i, '')}</h1>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
                    <p style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000' }}>{formatKopAddress(settings)}</p>
                    <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000' }}>
                      Email: <span style={{ textDecoration: 'underline' }}>{settings.email}</span>
                    </p>
                  </div>
                  {/* Thick line and thin line */}
                  <div style={{ borderTop: '3px solid black', marginTop: '2px' }}></div>
                  <div style={{ borderTop: '1px solid black', marginTop: '1px' }}></div>
                </div>

                {/* Judul Laporan */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>LAPORAN BULANAN ADMINISTRASI</h2>
                  <p style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, textTransform: 'uppercase' }}>PERIODE: {monthName} {year}</p>
                </div>

                {/* Ringkasan Eksekutif */}
                <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem', color: '#111827' }}>{modalLetters.summary}. RINGKASAN AKTIVITAS</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #374151', padding: '0.6rem', textAlign: 'center', width: '40px' }}>No</th>
                      <th style={{ border: '1px solid #374151', padding: '0.6rem', textAlign: 'left' }}>Uraian Kegiatan</th>
                      <th style={{ border: '1px solid #374151', padding: '0.6rem', textAlign: 'center', width: '100px' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Total Surat Masuk Diterima', value: filteredIn.length, unit: 'Surat' },
                      { label: 'Total Surat Keluar Diterbitkan', value: filteredOut.length, unit: 'Surat' },
                      { label: 'Total Sertifikat Magang Dicetak', value: filteredCerts.length, unit: 'Dokumen' },
                      { label: 'Transaksi Penerimaan Barang Gudang', value: filteredStockIn.length, unit: 'Transaksi' },
                      { label: 'Transaksi Pengeluaran Barang Gudang', value: filteredStockOut.length, unit: 'Transaksi' },
                      { label: 'Peminjaman Inventaris Aktif/Selesai', value: filteredBorrow.length, unit: 'Data' },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{row.label}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{row.value} {row.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Detail Surat Masuk */}
                {filteredIn.length > 0 && (<>
                  <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem', color: '#111827' }}>{modalLetters.suratMasuk}. DETAIL SURAT MASUK</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    <thead><tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center', width: '35px' }}>No</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '20%' }}>No. Referensi</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '15%' }}>Tanggal</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Pengirim</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '35%' }}>Perihal</th>
                    </tr></thead>
                    <tbody>{filteredIn.map((l, i) => (
                      <tr key={l.id}>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{i+1}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', fontWeight: 600 }}>{l.refNo || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.date}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.sender || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.subject || '-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </>)}

                {/* Detail Surat Keluar */}
                {filteredOut.length > 0 && (<>
                  <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem', color: '#111827' }}>{modalLetters.suratKeluar}. DETAIL SURAT KELUAR</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    <thead><tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center', width: '35px' }}>No</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '20%' }}>No. Surat</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '15%' }}>Tanggal</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Penerima</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '35%' }}>Perihal</th>
                    </tr></thead>
                    <tbody>{filteredOut.map((l, i) => (
                      <tr key={l.id}>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{i+1}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', fontWeight: 600 }}>{l.docNo || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.date}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.recipient || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{l.subject || '-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </>)}

                {/* Detail Sertifikat */}
                {filteredCerts.length > 0 && (<>
                  <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem', color: '#111827' }}>{modalLetters.sertifikat}. DETAIL SERTIFIKAT DITERBITKAN</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    <thead><tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center', width: '35px' }}>No</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '20%' }}>Nomor Dokumen</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Nama Peserta</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Asal Instansi</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Kualifikasi</th>
                    </tr></thead>
                    <tbody>{filteredCerts.map((c, i) => (
                      <tr key={c.id}>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{i+1}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{c.docNo || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem', fontWeight: 600 }}>{c.name || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{c.institution || '-'}</td>
                        <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{c.qualification || '-'}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </>)}

                {/* Stok Gudang (Masuk & Keluar digabung) */}
                {(filteredStockIn.length > 0 || filteredStockOut.length > 0) && (<>
                  <p style={{ fontWeight: 700, margin: '0 0 0.5rem', fontSize: '1rem', color: '#111827' }}>{modalLetters.gudang}. DETAIL TRANSAKSI GUDANG</p>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    <thead><tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center', width: '35px' }}>No</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '15%' }}>Tanggal</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '10%' }}>Jenis</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Nama Barang</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '10%', textAlign: 'center' }}>Qty</th>
                      <th style={{ border: '1px solid #374151', padding: '0.5rem', width: '25%' }}>Keterangan (Asal/Tujuan)</th>
                    </tr></thead>
                    <tbody>
                      {/* Gabungkan dan urutkan berdasarkan ID/Tanggal (dummy sort) */}
                      {[...filteredStockIn.map(s => ({ ...s, txType: 'Masuk' })), ...filteredStockOut.map(s => ({ ...s, txType: 'Keluar' }))]
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map((s, i) => (
                        <tr key={i}>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{i+1}</td>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{s.date}</td>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem', fontWeight: 600, color: s.txType === 'Masuk' ? '#059669' : '#dc2626' }}>{s.txType}</td>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{s.itemName || '-'}</td>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem', textAlign: 'center' }}>{s.qty}</td>
                          <td style={{ border: '1px solid #374151', padding: '0.5rem' }}>{s.txType === 'Masuk' ? s.supplier : s.destination || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>)}

                {/* Tanda Tangan Laporan */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: reportSigneeCount === 1 ? 'flex-end' : 'space-between', 
                  marginTop: '3.5rem', 
                  pageBreakInside: 'avoid', 
                  fontSize: '0.85rem', 
                  color: '#000', 
                  fontFamily: 'Arial, sans-serif' 
                }}>
                  {reportSigneeCount >= 2 && (
                    <div style={{ textAlign: 'center', width: '200px' }}>
                      <p style={{ margin: 0 }}>Mengetahui,</p>
                      <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeLeftTitle || "\u00A0"},</p>
                      <div style={{ height: '60px' }} />
                      <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeLeftName || "\u00A0"}</p>
                      {reportSigneeLeftNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeLeftNik}</p>}
                    </div>
                  )}

                  {reportSigneeCount === 3 && (
                    <div style={{ textAlign: 'center', width: '200px' }}>
                      <p style={{ margin: 0 }}>&nbsp;</p>
                      <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeMiddleTitle || "\u00A0"},</p>
                      <div style={{ height: '60px' }} />
                      <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeMiddleName || "\u00A0"}</p>
                      {reportSigneeMiddleNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeMiddleNik}</p>}
                    </div>
                  )}

                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <p style={{ margin: 0 }}>{reportDate || "\u00A0"}</p>
                    <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeRightTitle || "\u00A0"},</p>
                    <div style={{ height: '60px' }} />
                    <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeRightName || "\u00A0"}</p>
                    {reportSigneeRightNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeRightNik}</p>}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Screen Page Indicator Footer (Screen only, excluded from Print/PDF) */}
          <div className="screen-page-guide no-print" style={{
            marginTop: '2rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed #cbd5e1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748b',
            boxSizing: 'border-box'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <FileText size={13} style={{ color: '#059669' }} />
              <span>Dokumen Resmi Klinik Baiturrahman</span>
            </span>
            <span style={{ fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '0.2rem 0.65rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              📄 Halaman 1 dari {previewPageCount || 1} • Total: {previewPageCount || 1} Lembar (A4)
            </span>
          </div>
        </div>
        </div>
        </div>
        </div>
      </div>
    );
  }

  const getBreadcrumbs = () => {
    switch (activeMenu) {
      case "dashboard": return ["Dashboard"];
      case "letters_in": return ["Dashboard", "Surat", "Surat Masuk"];
      case "letters_out": return ["Dashboard", "Surat", "Surat Keluar"];
      case "archive": return ["Dashboard", "Arsip", "Dokumen Digital"];
      case "certificates":
      case "certs": return ["Dashboard", "Pelayanan", "Sertifikat Magang"];
      case "warehouse": return ["Dashboard", "Gudang", "Inventaris Gudang"];
      case "assets_inventaris": return ["Dashboard", "Aset Tetap", "Data Aset & Inventaris"];
      case "asset_master": return ["Dashboard", "Aset Tetap", "Master Data Aset"];
      case "asset_relocation": return ["Dashboard", "Aset Tetap", "Relokasi Aset"];
      case "report_assets": return ["Dashboard", "Aset Tetap", "Laporan Rekapitulasi"];
      case "requests":
      case "borrowings": return ["Dashboard", "Gudang", "Permintaan & Peminjaman"];
      case "reports": return ["Dashboard", "Laporan", "Laporan Bulanan"];
      case "settings": return ["Dashboard", "Pengaturan", "Pengaturan Sistem"];
      default: return ["Dashboard"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  // ----------------------------------------------------
  // DYNAMIC CHART DATA GENERATION
  // ----------------------------------------------------
  const generateChartData = (type) => {
    const dataMap = {};
    const today = new Date();
    
    // Determine number of months to show
    let monthsToShow = 12; // default
    if (dashboardTimeFilter === "6_bulan") monthsToShow = 6;
    else if (dashboardTimeFilter === "tahun_ini") monthsToShow = today.getMonth() + 1; // months since Jan

    // Initialize map
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('id-ID', { month: 'short' });
      const yearStr = d.getFullYear().toString().substr(-2);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      dataMap[key] = { 
        name: monthsToShow > 6 ? `${monthStr} '${yearStr}` : monthStr, 
        Masuk: 0, 
        Keluar: 0, 
        sortKey: d.getTime() 
      };
    }

    const processItem = (item, dateField, typeKey) => {
      if (!item[dateField]) return;
      const d = new Date(item[dateField]);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (dataMap[key]) {
        dataMap[key][typeKey]++;
      }
    };

    if (type === "surat") {
      incomingLetters.forEach(l => processItem(l, l.dateReceived ? 'dateReceived' : 'date', 'Masuk'));
      outgoingLetters.forEach(l => processItem(l, 'date', 'Keluar'));
    } else if (type === "stok") {
      stockInList.forEach(s => processItem(s, 'date', 'Masuk'));
      stockOutList.forEach(s => processItem(s, 'date', 'Keluar'));
    }

    return Object.values(dataMap).sort((a,b) => a.sortKey - b.sortKey);
  };

  // ----------------------------------------------------
  // MAIN DASHBOARD TEMPLATE LAYOUT
  // ----------------------------------------------------
  return (
    <div style={{ display: 'flex', height: '100dvh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar Navigation */}
      <aside className={`sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{
        position: 'relative', 
        height: 'calc(100dvh - 24px)',
        margin: '12px 0 12px 14px',
        width: sidebarCollapsed ? '76px' : '260px', 
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid rgba(16, 185, 129, 0.18)',
        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.06), 0 2px 8px rgba(0,0,0,0.03)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0,
        zIndex: 40,
        overflow: 'hidden'
      }}>
        {/* Top Controls: Collapse Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: '0.85rem 1rem 0.2rem',
          boxSizing: 'border-box'
        }}>
          <button 
            type="button"
            className="sidebar-collapse-desktop-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              padding: '4px',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              color: '#059669',
              borderRadius: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title={sidebarCollapsed ? "Perbesar Sidebar" : "Perkecil Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          <button
            type="button"
            className="mobile-sidebar-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'none',
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '8px'
            }}
            title="Tutup Menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Logo Branding Header (Centered) */}
        <div style={{ 
          padding: sidebarCollapsed ? '0.4rem 0.5rem 0.75rem' : '0.2rem 1rem 1rem', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          position: 'relative',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}>
          {/* Logo klinik – selalu tampilkan dari settings atau fallback ke file public, logo tidak berubah */}
          <img
            src={settings?.logo || '/logo.png'}
            alt="Logo Klinik"
            title={settings?.clinicName || "MEDIKARA"}
            style={{ 
              width: sidebarCollapsed ? '44px' : '56px', 
              height: sidebarCollapsed ? '44px' : '56px', 
              objectFit: 'contain', 
              display: 'block',
              margin: '0 auto 0.5rem',
              filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.18))',
              cursor: sidebarCollapsed ? 'pointer' : 'default'
            }}
            onClick={() => { if (sidebarCollapsed) setSidebarCollapsed(false); }}
            onError={e => { e.currentTarget.style.display = 'none'; }}
          />
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ 
                fontWeight: 800, 
                fontSize: '1.25rem', 
                letterSpacing: '0.04em', 
                color: '#065f46', 
                fontFamily: 'Outfit, sans-serif', 
                lineHeight: 1.15, 
                whiteSpace: 'nowrap' 
              }}>
                MEDIKARA
              </span>
              <span style={{ 
                fontSize: '0.62rem', 
                color: '#059669', 
                letterSpacing: '0.06em', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                marginTop: '0.2rem', 
                whiteSpace: 'nowrap' 
              }}>
                KLINIK BAITURRAHMAN
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav 
          onClick={(e) => {
            if (e.target.closest('.sidebar-item') || e.target.closest('.sidebar-subitem')) {
              setIsMobileMenuOpen(false);
            }
          }}
          style={{ 
            flex: '1 1 0%', 
            minHeight: 0, 
            padding: sidebarCollapsed ? '0.4rem 0.4rem' : '0.4rem 0.85rem 0.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.35rem', 
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorY: 'contain'
          }}
        >
          {/* Dashboard */}
          <button 
            onClick={() => { setActiveMenu("dashboard"); if (sidebarCollapsed) setSidebarCollapsed(false); }} 
            className={`sidebar-item ${activeMenu === "dashboard" ? "active" : ""}`} 
            title={sidebarCollapsed ? "Dashboard" : ""}
          >
            <Home size={19} style={{ color: activeMenu === "dashboard" ? '#064e3b' : '#059669', flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          {/* Persuratan (Collapsible / Direct) */}
          <button 
            onClick={() => { 
              if (sidebarCollapsed) { setSidebarCollapsed(false); }
              toggleSystem("surat");
            }} 
            className={`sidebar-item ${['letters_in', 'letters_out'].includes(activeMenu) && !openSystems.surat ? 'active' : ''}`}
            title={sidebarCollapsed ? "Persuratan" : ""}
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Mail size={19} style={{ color: ['letters_in', 'letters_out'].includes(activeMenu) ? '#064e3b' : '#059669', flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Persuratan</span>}
            </div>
            {!sidebarCollapsed && (
              openSystems.surat 
                ? <ChevronDown size={14} style={{ color: '#059669' }} /> 
                : <ChevronRight size={14} style={{ color: '#64748b' }} />
            )}
          </button>
          
          {/* Sub menu Persuratan */}
          {openSystems.surat && !sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.25rem', marginBottom: '0.2rem' }}>
              <button 
                onClick={() => setActiveMenu("letters_in")} 
                className={`sidebar-subitem ${activeMenu === "letters_in" ? "active" : ""}`}
              >
                <CircleDot size={14} style={{ color: activeMenu === "letters_in" ? '#047857' : '#10b981', flexShrink: 0 }} />
                <span>Surat Masuk</span>
              </button>
              <button 
                onClick={() => setActiveMenu("letters_out")} 
                className={`sidebar-subitem ${activeMenu === "letters_out" ? "active" : ""}`}
              >
                <MinusCircle size={14} style={{ color: activeMenu === "letters_out" ? '#047857' : '#10b981', flexShrink: 0 }} />
                <span>Surat Keluar</span>
              </button>
            </div>
          )}

          {/* Sertifikat & Piagam */}
          <button 
            onClick={() => { setActiveMenu("certificates"); if (sidebarCollapsed) setSidebarCollapsed(false); }} 
            className={`sidebar-item ${activeMenu === "certificates" ? "active" : ""}`} 
            title={sidebarCollapsed ? "Sertifikat & Piagam" : ""}
          >
            <Award size={19} style={{ color: activeMenu === "certificates" ? '#064e3b' : '#059669', flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Sertifikat & Piagam</span>}
          </button>

          {/* Arsip Digital */}
          <button 
            onClick={() => { setActiveMenu("archive"); if (sidebarCollapsed) setSidebarCollapsed(false); }} 
            className={`sidebar-item ${activeMenu === "archive" ? "active" : ""}`} 
            title={sidebarCollapsed ? "Arsip Digital" : ""}
          >
            <Folder size={19} style={{ color: activeMenu === "archive" ? '#064e3b' : '#059669', flexShrink: 0 }} />
            {!sidebarCollapsed && <span>Arsip Digital</span>}
          </button>

          {/* Laporan */}
          <button 
            onClick={() => { setActiveMenu("reports"); if (sidebarCollapsed) setSidebarCollapsed(false); }} 
            className={`sidebar-item ${['reports', 'report_letters', 'report_assets'].includes(activeMenu) ? "active" : ""}`} 
            title={sidebarCollapsed ? "Laporan" : ""}
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <FileText size={19} style={{ color: ['reports', 'report_letters', 'report_assets'].includes(activeMenu) ? '#064e3b' : '#059669', flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Laporan</span>}
            </div>
            {!sidebarCollapsed && <ChevronRight size={14} style={{ color: '#64748b' }} />}
          </button>

          {/* Pengaturan Sistem */}
          <button 
            onClick={() => { setActiveMenu("settings"); if (sidebarCollapsed) setSidebarCollapsed(false); }} 
            className={`sidebar-item ${activeMenu === "settings" ? "active" : ""}`} 
            title={sidebarCollapsed ? "Pengaturan Sistem" : ""}
            style={{ justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <Settings size={19} style={{ color: activeMenu === "settings" ? '#064e3b' : '#059669', flexShrink: 0 }} />
              {!sidebarCollapsed && <span>Pengaturan Sistem</span>}
            </div>
            {!sidebarCollapsed && <ChevronRight size={14} style={{ color: '#64748b' }} />}
          </button>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: '0.4rem' }} />

          {/* Logout button */}
          <button 
            onClick={handleLogout} 
            className="sidebar-item danger" 
            style={{ 
              borderRadius: '12px',
              padding: '0.65rem 1rem',
              fontSize: '0.88rem'
            }} 
            title={sidebarCollapsed ? "Keluar" : ""}
          >
            <LogOut size={18} />
            {!sidebarCollapsed && <span>Keluar</span>}
          </button>
        </nav>


      </aside>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Main Content Area */}
      <main 
        id="main-content-scroll" 
        className="app-main-content" 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          flex: 1, 
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex', 
          flexDirection: 'column', 
          minWidth: 0, 
          backgroundColor: 'var(--bg-main)',
          position: 'relative'
        }}
      >
        {/* Pull to Refresh Indicator */}
        {pullDistance > 0 && (
          <div style={{
            position: 'absolute',
            top: `${Math.max(pullDistance - 38, 10)}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: 'var(--bg-card)',
            color: 'var(--primary)',
            padding: '0.45rem 1rem',
            borderRadius: '24px',
            boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: 700,
            border: '1.5px solid var(--border)',
            pointerEvents: 'none',
            transition: isPulling.current ? 'none' : 'all 0.25s ease'
          }}>
            <RefreshCw size={15} style={{ animation: isPullRefreshing ? 'spin 0.8s linear infinite' : 'none', transform: `rotate(${pullDistance * 5}deg)` }} />
            <span>{isPullRefreshing ? 'Memuat Ulang Halaman...' : pullDistance > 45 ? 'Lepaskan untuk Refresh' : 'Tarik ke bawah untuk refresh'}</span>
          </div>
        )}

        {/* Header bar (Floating Card Navbar matching Sidebar & Design System) */}
        <header style={{ 
          height: '64px', 
          backgroundColor: theme === 'dark' ? 'rgba(15, 30, 22, 0.92)' : 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 1.25rem', 
          margin: '12px 1.5rem 0 1rem',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.18)',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05), 0 1px 3px rgba(0,0,0,0.02)',
          position: 'sticky',
          top: '12px',
          zIndex: 30,
          transition: 'all 0.25s ease'
        }}>
          {/* Global Search Bar (Left Side) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f0fdf4',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#059669',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Menu size={19} />
            </button>

            {activeMenu === "dashboard" && (
              <div className="header-search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button 
                  onClick={() => {
                    if (globalSearchQuery.trim() !== "" && getSearchResults().length > 0) {
                      handleSearchResultClick(getSearchResults()[0]);
                    } else {
                      document.getElementById('global-search-input')?.focus();
                    }
                  }}
                  style={{ position: 'absolute', left: '12px', background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                  title="Cari"
                >
                  <Search size={16} style={{ color: '#059669' }} />
                </button>
                <input 
                  id="global-search-input"
                  type="text" 
                  placeholder="Cari surat, aset, sertifikat, atau data lainnya..." 
                  value={globalSearchQuery}
                  onChange={(e) => setGlobalSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && globalSearchQuery.trim() !== "" && getSearchResults().length > 0) {
                      handleSearchResultClick(getSearchResults()[0]);
                    }
                  }}
                  style={{ 
                    height: '40px',
                    padding: '0 4rem 0 2.5rem', 
                    border: '1.5px solid rgba(16, 185, 129, 0.22)', 
                    borderRadius: '12px', 
                    outline: 'none', 
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    width: '360px',
                    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.25)' : '#f8fafc',
                    color: 'var(--text-dark)',
                    transition: 'all 0.2s ease',
                    boxShadow: isSearchFocused ? '0 0 0 3px rgba(16, 185, 129, 0.15)' : 'none',
                    borderColor: isSearchFocused ? '#059669' : 'rgba(16, 185, 129, 0.22)'
                  }} 
                />
                <span style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  fontSize: '0.66rem', 
                  fontWeight: 700, 
                  color: '#059669', 
                  backgroundColor: '#e6f4ea', 
                  padding: '2px 6px', 
                  borderRadius: '6px', 
                  pointerEvents: 'none',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  letterSpacing: '0.02em'
                }}>
                  ⌘K
                </span>
              
              {/* Search Results Dropdown */}
              {isSearchFocused && globalSearchQuery.trim() !== "" && (
                <div style={{
                  position: 'absolute', top: '115%', left: 0, width: '380px', backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  zIndex: 200, overflow: 'hidden'
                }}>
                  {getSearchResults().length > 0 ? (
                    getSearchResults().map((res, i) => (
                      <div 
                        key={i} 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSearchResultClick(res);
                        }}
                        style={{ padding: '0.7rem 1rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'background-color 0.15s' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e6f4ea'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)' }}>{res.label}</span>
                        <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 600 }}>{res.category}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '0.9rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Tidak ada hasil yang sesuai
                    </div>
                  )}
                </div>
              )}
            </div>
            )}
          </div>

          {/* Global Actions (Right Side) */}
          <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', position: 'relative' }}>
            
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
               <button 
                 onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }} 
                 style={{ 
                   width: '38px',
                   height: '38px',
                   borderRadius: '12px',
                   backgroundColor: showNotifications ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                   border: `1px solid ${showNotifications ? '#10b981' : 'rgba(16, 185, 129, 0.18)'}`,
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center',
                   color: showNotifications ? '#0d5c3a' : '#059669', 
                   cursor: 'pointer', 
                   transition: 'all 0.2s ease',
                   boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                 }}
                 onMouseOver={e => {
                   e.currentTarget.style.backgroundColor = '#e6f4ea';
                   e.currentTarget.style.borderColor = '#10b981';
                   e.currentTarget.style.transform = 'translateY(-1px)';
                 }}
                 onMouseOut={e => {
                   e.currentTarget.style.backgroundColor = showNotifications ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc');
                   e.currentTarget.style.borderColor = showNotifications ? '#10b981' : 'rgba(16, 185, 129, 0.18)';
                   e.currentTarget.style.transform = 'none';
                 }}
                 title="Notifikasi"
               >
                 <Bell size={18} />
               </button>
               {incomingLetters.filter(l => l.status === 'baru').length > 0 && (
                <span style={{ 
                  position: 'absolute', top: '-3px', right: '-3px', 
                  minWidth: '17px', height: '17px', backgroundColor: '#ef4444', 
                  borderRadius: '10px', border: '2px solid var(--bg-card)',
                  color: '#fff', fontSize: '0.62rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.35)'
                }}>
                  {incomingLetters.filter(l => l.status === 'baru').length}
                </span>
               )}

               {/* Notifications Dropdown Panel */}
               {showNotifications && (
                 <div style={{
                   position: 'absolute', right: 0, top: '48px', width: '320px', backgroundColor: 'var(--bg-card)',
                   borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', border: '1px solid rgba(16, 185, 129, 0.2)',
                   zIndex: 100, overflow: 'hidden'
                 }}>
                   <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-main)' }}>
                     <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>Notifikasi Terkini</span>
                     <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, backgroundColor: '#e6f4ea', padding: '2px 8px', borderRadius: '12px' }}>{activityLogs.length} Baru</span>
                   </div>
                   <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                     {activityLogs.slice(0, 5).map((log, index) => (
                       <div key={index} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', transition: 'background-color 0.15s' }}
                         onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                         onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                       >
                         <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.15rem' }}>{log.action}</div>
                         <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.details}</div>
                         <div style={{ fontSize: '0.68rem', color: '#059669', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                           <Clock size={11} /> {log.time}
                         </div>
                       </div>
                     ))}
                     {activityLogs.length === 0 && (
                       <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tidak ada notifikasi baru</div>
                     )}
                   </div>
                 </div>
               )}
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              style={{ 
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                border: '1px solid rgba(16, 185, 129, 0.18)',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#059669', 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#e6f4ea';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.18)';
                e.currentTarget.style.transform = 'none';
              }}
              title={theme === 'light' ? "Mode Gelap" : "Mode Terang"}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Settings Gear Icon */}
            <button 
              onClick={() => setActiveMenu('settings')} 
              style={{ 
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: activeMenu === 'settings' ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                border: `1px solid ${activeMenu === 'settings' ? '#10b981' : 'rgba(16, 185, 129, 0.18)'}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#059669', 
                cursor: 'pointer', 
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.backgroundColor = '#e6f4ea';
                e.currentTarget.style.borderColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.backgroundColor = activeMenu === 'settings' ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc');
                e.currentTarget.style.borderColor = activeMenu === 'settings' ? '#10b981' : 'rgba(16, 185, 129, 0.18)';
                e.currentTarget.style.transform = 'none';
              }}
              title="Pengaturan"
            >
              <Settings size={18} />
            </button>

            {/* Subtle Divider */}
            <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(16, 185, 129, 0.2)', margin: '0 0.15rem' }} />

            {/* Profile Pill Card */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.65rem',
                  cursor: 'pointer', 
                  padding: '0.28rem 0.75rem 0.28rem 0.4rem', 
                  borderRadius: '14px',
                  border: `1px solid ${showProfileMenu ? '#059669' : 'rgba(16, 185, 129, 0.2)'}`,
                  backgroundColor: showProfileMenu ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc'),
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#059669';
                  e.currentTarget.style.backgroundColor = '#e6f4ea';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = showProfileMenu ? '#059669' : 'rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.backgroundColor = showProfileMenu ? '#e6f4ea' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc');
                  e.currentTarget.style.transform = 'none';
                }}
                title={`Profil ${currentUser?.name || 'Pengguna'}`}
              >
                {/* Modern Avatar Squircle */}
                <div 
                  style={{ 
                    width: '34px', height: '34px', borderRadius: '10px', 
                    background: 'linear-gradient(135deg, #0d5c3a 0%, #10b981 100%)',
                    color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '0.82rem',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(13, 92, 58, 0.25)'
                  }}
                >
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : 'AD'}
                </div>

                <div className="header-user-text" style={{ textAlign: 'left', display: sidebarCollapsed ? 'none' : 'block' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: 'var(--text-dark)', lineHeight: 1.2, fontFamily: 'Outfit, sans-serif' }}>
                    {currentUser?.name || 'Admin'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700, lineHeight: 1.15 }}>
                    {currentUser?.role || 'Administrator'}
                  </div>
                </div>

                <ChevronDown size={14} style={{ color: '#059669', strokeWidth: 2.2, marginLeft: '0.1rem', transition: 'transform 0.2s', transform: showProfileMenu ? 'rotate(180deg)' : 'none' }} />
              </div>

              {/* Profile Dropdown Panel */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '48px', width: '250px', backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)', border: '1px solid rgba(16, 185, 129, 0.2)',
                  zIndex: 100, overflow: 'hidden', padding: '0.5rem 0'
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>{currentUser?.name || 'Admin'}</div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', marginTop: '2px' }}>{currentUser?.role || 'Administrator'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{currentUser?.email || (currentUser?.username === 'admin' ? 'kbaiturrahmangarut@gmail.com' : `${currentUser?.username || 'admin'}@klinikbaiturrahman.com`)}</div>
                  </div>
                  <button 
                    onClick={() => { setActiveMenu("settings"); setShowProfileMenu(false); }}
                    style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={15} color="#059669" /> Pengaturan Sistem
                  </button>
                  <button 
                    onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                    style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background-color 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Ganti Akun / Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Render Active View Router */}
        <div className="main-content-wrapper">

          {activeMenu === "dashboard" && (
            <div className="animate-fade-in" style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* 1. Hero / Welcome Banner */}
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #0e2a1d 0%, #153828 50%, #0d261a 100%)' 
                  : 'linear-gradient(135deg, #e8f5ec 0%, #d8f0e4 50%, #ebf7ef 100%)',
                border: '1px solid var(--border-light)',
                padding: '0.75rem 2rem',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(13, 92, 58, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Soft background decorative circles */}
                <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', top: '-140px', right: '25%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', bottom: '-80px', left: '15%', pointerEvents: 'none' }} />

                {/* Left Content */}
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', maxWidth: '580px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>
                    Selamat datang,
                  </span>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', margin: '0 0 0.2rem 0', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {currentUser?.name || 'Admin'} <span style={{ fontSize: '1.35rem' }}>👋</span>
                  </h1>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 0.65rem 0', lineHeight: 1.35 }}>
                    Kelola data administrasi, sertifikat, arsip, dan logistik klinik dengan lebih mudah.
                  </p>

                  {/* Floating Stat Pills */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {/* Card 1: Surat Masuk */}
                    <div 
                      onClick={() => { setActiveMenu('letters_in'); setScrollToSection('arsip_surat_masuk'); }}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '14px',
                        padding: '0.5rem 0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        minWidth: '155px',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.04)'; }}
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#e6f4ea', color: '#0d5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Mail size={17} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Surat Masuk</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.1 }}>{letterTypeDistribution.inCount}</div>
                        <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>●</span> Total Terdata
                        </div>
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                        <ChevronRight size={12} />
                      </div>
                    </div>

                    {/* Card 2: Surat Keluar */}
                    <div 
                      onClick={() => { setActiveMenu('letters_out'); setScrollToSection('arsip_surat_keluar'); }}
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '14px',
                        padding: '0.5rem 0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                        border: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        minWidth: '155px',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.04)'; }}
                    >
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Send size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Surat Keluar</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1.1 }}>{letterTypeDistribution.outCount}</div>
                        <div style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700, marginTop: '1px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span>●</span> Total Terdata
                        </div>
                      </div>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content: Real Clinic Photo - seamless gradient fade */}
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: '420px',
                  maxWidth: '46%',
                  overflow: 'hidden',
                  pointerEvents: 'none'
                }}>
                  {/* Photo with CSS mask for seamless fade - no hard lines */}
                  <img
                    src="/klinik_asli_transparan.png"
                    alt="Klinik Baiturrahman"
                    style={{
                      height: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center center',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 65%)',
                      maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.7) 40%, black 65%)',
                      mixBlendMode: 'multiply',
                      filter: 'saturate(0.88) brightness(1.02)'
                    }}
                  />
                  {/* Date/time card overlay - top right */}
                  <div style={{
                    position: 'absolute',
                    top: '0.75rem',
                    right: '1rem',
                    zIndex: 5,
                    backgroundColor: theme === 'dark' ? 'rgba(15,40,25,0.85)' : 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '12px',
                    padding: '0.45rem 0.85rem',
                    boxShadow: '0 4px 16px rgba(13,92,58,0.1)',
                    border: '1px solid rgba(255,255,255,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    pointerEvents: 'auto'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.05rem' }}>
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme === 'dark' ? '#6ee7b7' : '#0d5c3a', lineHeight: 1.1, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </div>
                  </div>
                </div>
              </div>


              {/* 2. Main 2-Column Grid */}
              <div className="dashboard-main-2col-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.95fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'stretch' }}>
                
                {/* LEFT COLUMN: Aktivitas Surat + (Jenis Surat & Kategori Surat) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Card: Aktivitas Surat */}
                  <div className="dashboard-card-top-h" style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '20px',
                    padding: '1.4rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '335px',
                    boxSizing: 'border-box',
                    gap: '0.65rem'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0', color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>
                          Aktivitas Surat
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                          Jumlah surat masuk dan keluar dalam {dashboardRange === '7d' ? '7 hari' : dashboardRange === '30d' ? '30 hari' : '3 bulan'} terakhir
                        </p>
                      </div>

                      {/* Range Pill Selector */}
                      <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', padding: '3px', borderRadius: '24px', border: '1px solid var(--border-light)', gap: '2px' }}>
                        {[
                          { id: '7d', label: '7 Hari' },
                          { id: '30d', label: '30 Hari' },
                          { id: '3m', label: '3 Bulan' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setDashboardRange(tab.id)}
                            style={{
                              border: 'none',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '20px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              backgroundColor: dashboardRange === tab.id ? '#0d5c3a' : 'transparent',
                              color: dashboardRange === tab.id ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all 0.2s ease',
                              boxShadow: dashboardRange === tab.id ? '0 2px 8px rgba(13,92,58,0.25)' : 'none'
                            }}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Legend Row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', fontWeight: 600, margin: '0.1rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d5c3a' }} />
                        <span>Surat Masuk</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c7' }} />
                        <span>Surat Keluar</span>
                      </div>
                    </div>

                    {/* Area / Spline Chart */}
                    <div style={{ width: '100%', flex: 1, minHeight: '170px', position: 'relative' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={activityChartData}
                          margin={{ top: 12, right: 15, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorMasukGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorKeluarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" opacity={0.6} />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                            dy={8}
                            interval={dashboardRange === '30d' ? 4 : 0}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
                            domain={[0, maxChartValue]}
                            allowDecimals={false}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const item = payload[0]?.payload;
                                const masukVal = payload.find(p => p.dataKey === 'Masuk')?.value ?? 0;
                                const keluarVal = payload.find(p => p.dataKey === 'Keluar')?.value ?? 0;
                                return (
                                  <div style={{
                                    backgroundColor: 'var(--bg-card)',
                                    padding: '0.6rem 0.9rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                                    border: '1px solid var(--border-light)',
                                    fontSize: '0.78rem'
                                  }}>
                                    <div style={{ fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.35rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.2rem' }}>
                                      {item?.rangeLabel || label}
                                    </div>
                                    <div style={{ color: '#0d5c3a', fontWeight: 700, display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                                      <span>Masuk :</span> <span>{masukVal}</span>
                                    </div>
                                    <div style={{ color: '#0284c7', fontWeight: 700, display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                                      <span>Keluar :</span> <span>{keluarVal}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Masuk"
                            stroke="#0d5c3a"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorMasukGrad)"
                            dot={{ r: 4, fill: '#0d5c3a', stroke: '#ffffff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#0d5c3a', stroke: '#ffffff', strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="Keluar"
                            stroke="#0284c7"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorKeluarGrad)"
                            dot={{ r: 4, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Row 2: Jenis Surat + Kategori Surat */}
                  <div className="dashboard-sub-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '1.25rem', height: '240px', boxSizing: 'border-box' }}>
                    
                    {/* Card: Jenis Surat (Donut Chart) */}
                    <div className="dashboard-card-bottom-h" style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '20px',
                      padding: '1.25rem 1.4rem',
                      border: '1px solid var(--border-light)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '240px',
                      boxSizing: 'border-box',
                      justifyContent: 'space-between'
                    }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>
                        Jenis Surat
                      </h4>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '1rem', flex: 1, minHeight: '120px' }}>
                        {/* SVG Donut */}
                        <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
                          <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                            {/* Background circle */}
                            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--bg-main)" strokeWidth="4.5" />
                            {letterTypeDistribution.total > 0 && (
                              <>
                                {/* Surat Masuk arc */}
                                <circle
                                  cx="18" cy="18" r="14" fill="none" stroke="#0d5c3a" strokeWidth="4.5"
                                  strokeDasharray={`${letterTypeDistribution.inPercent} 100`}
                                  strokeDashoffset="0"
                                  strokeLinecap="round"
                                  pathLength="100"
                                />
                                {/* Surat Keluar arc */}
                                <circle
                                  cx="18" cy="18" r="14" fill="none" stroke="#14b8a6" strokeWidth="4.5"
                                  strokeDasharray={`${letterTypeDistribution.outPercent} 100`}
                                  strokeDashoffset={-letterTypeDistribution.inPercent}
                                  strokeLinecap="round"
                                  pathLength="100"
                                />
                              </>
                            )}
                          </svg>
                          <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none'
                          }}>
                            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', lineHeight: 1 }}>
                              {letterTypeDistribution.total}
                            </span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.76rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0d5c3a', flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>Surat Masuk</span>
                            <strong style={{ color: 'var(--text-dark)', marginLeft: '0.5rem' }}>{letterTypeDistribution.inCount} ({letterTypeDistribution.inPercent}%)</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#14b8a6', flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>Surat Keluar</span>
                            <strong style={{ color: 'var(--text-dark)', marginLeft: '0.5rem' }}>{letterTypeDistribution.outCount} ({letterTypeDistribution.outPercent}%)</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8', flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>Lainnya</span>
                            <strong style={{ color: 'var(--text-dark)', marginLeft: '0.5rem' }}>0 (0%)</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card: Kategori Surat (Bars) */}
                    <div className="dashboard-card-bottom-h" style={{
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: '20px',
                      padding: '1.25rem 1.4rem',
                      border: '1px solid var(--border-light)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '240px',
                      boxSizing: 'border-box',
                      justifyContent: 'space-between'
                    }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>
                        Kategori Surat
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.2rem' }}>
                        {letterCategoriesDistribution.map((cat, idx) => {
                          const IconComp = cat.icon;
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '6px', backgroundColor: '#e6f4ea', color: '#0d5c3a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <IconComp size={13} />
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dark)', width: '110px', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {cat.label}
                              </div>
                              <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-main)', borderRadius: '10px', overflow: 'hidden' }}>
                                <div style={{ width: `${cat.percent}%`, height: '100%', backgroundColor: '#0d5c3a', borderRadius: '10px' }} />
                              </div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-dark)', width: '55px', textAlign: 'right', flexShrink: 0 }}>
                                {cat.count} ({cat.percent}%)
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Aktivitas Terbaru & Notifikasi */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Card: Aktivitas Terbaru */}
                  <div className="dashboard-card-top-h" style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '20px',
                    padding: '1.4rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '335px',
                    boxSizing: 'border-box',
                    justifyContent: 'space-between',
                    gap: '0.85rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} color="#059669" />
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>
                          Aktivitas Terbaru
                        </h4>
                      </div>
                      <button 
                        onClick={() => setActiveMenu('letters_in')} 
                        style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#059669', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        Lihat Semua →
                      </button>
                    </div>

                    {/* List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, justifyContent: 'space-around' }}>
                      {[
                        { icon: Mail, bg: '#e6f4ea', color: '#0d5c3a', title: 'Surat Masuk', desc: 'Surat dari Dinas Kesehatan', time: '10:24', dot: '#10b981' },
                        { icon: FileText, bg: '#e0f2fe', color: '#0284c7', title: 'Surat Keluar', desc: 'Surat Tugas No. 003/SM/2026', time: '09:15', dot: '#10b981' },
                        { icon: Award, bg: '#ecfdf5', color: '#059669', title: 'Sertifikat', desc: 'Sertifikat PKL telah ditambahkan', time: '08:47', dot: '#10b981' },
                        { icon: Warehouse, bg: '#fef3c7', color: '#d97706', title: 'Stok Gudang', desc: 'Stok alat medis menipis (<= 5)', time: '07:32', dot: '#f59e0b' },
                        { icon: Briefcase, bg: '#e6f4ea', color: '#059669', title: 'Aset Tetap', desc: 'Aset baru telah didata: Laptop', time: '06:50', dot: '#10b981' }
                      ].map((item, i) => {
                        const ItemIcon = item.icon;
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <ItemIcon size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>{item.title}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.desc}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.time}</span>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: item.dot }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card: Notifikasi */}
                  <div className="dashboard-card-bottom-h" style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '20px',
                    padding: '1.25rem 1.4rem',
                    border: '1px solid var(--border-light)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '240px',
                    boxSizing: 'border-box',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Bell size={16} color="#059669" />
                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>
                          Notifikasi
                        </h4>
                      </div>
                      <button 
                        onClick={() => setShowNotifications(true)} 
                        style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, color: '#059669', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        Lihat Semua →
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {/* Notif 1: Alert stok */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.2rem 0' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <AlertCircle size={17} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>Stok alat medis menipis</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>Kapasitas stok di bawah minimum (&lt;= 5).</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>
                          <span>07:32</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>

                      {/* Notif 2: Info backup */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.2rem 0' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Info size={17} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>Backup data berhasil</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.35 }}>Data sistem telah dibackup otomatis.</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, flexShrink: 0 }}>
                          <span>02:15</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 5.5 Digital Archive */}
          {activeMenu === "archive" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Cari dokumen..." 
                      value={archiveSearch} 
                      onChange={e => setArchiveSearch(e.target.value)} 
                      style={{ padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.85rem', width: '240px' }} 
                    />
                  </div>
                  <select 
                    value={archiveCategoryFilter} 
                    onChange={e => setArchiveCategoryFilter(e.target.value)} 
                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Dokumen & Surat">Dokumen & Surat</option>
                    <option value="SOP & Regulasi">SOP & Regulasi</option>
                    <option value="Laporan Keuangan">Laporan Keuangan</option>
                    <option value="SK & Perizinan">SK & Perizinan</option>
                    <option value="Kerjasama">Kerjasama / MOU</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Form Unggah Dokumen Digital */}
                <div className="elegant-card elegant-table-container">
                  <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>Form Unggah Dokumen</h3>
                  <form onSubmit={handleAddArchive} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Judul / Nama Dokumen</label>
                      <input type="text" value={archiveForm.title} onChange={e => setArchiveForm({ ...archiveForm, title: e.target.value })} required className="input-field" placeholder="Contoh: Laporan Tahunan Klinik 2026" />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Pilih Berkas File (PDF, Word, Gambar)</label>
                      <input 
                        type="file" 
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                        onChange={handleFileSelect} 
                        className="input-field" 
                        style={{ padding: '0.4rem' }}
                      />
                      {archiveForm.fileName && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                          ✓ Berkas terpilih: {archiveForm.fileName} ({archiveForm.fileSize})
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Kategori Dokumen</label>
                        <select value={archiveForm.category} onChange={e => setArchiveForm({ ...archiveForm, category: e.target.value })} required className="input-field">
                          <option value="Dokumen & Surat">Dokumen & Surat</option>
                          <option value="SOP & Regulasi">SOP & Regulasi</option>
                          <option value="Laporan Keuangan">Laporan Keuangan</option>
                          <option value="SK & Perizinan">SK & Perizinan</option>
                          <option value="Kerjasama">Kerjasama / MOU</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Hak Akses</label>
                        <select value={archiveForm.access} onChange={e => setArchiveForm({ ...archiveForm, access: e.target.value })} required className="input-field">
                          <option value="Publik">Publik</option>
                          <option value="Internal">Internal Staf</option>
                          <option value="Rahasia">Rahasia</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Nomor Referensi / Dokumen</label>
                      <input type="text" value={archiveForm.docNo} onChange={e => setArchiveForm({ ...archiveForm, docNo: e.target.value })} className="input-field" placeholder="Contoh: DOC/KBR/2026/01" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Tanggal Dokumen</label>
                      <input type="date" value={archiveForm.date} onChange={e => setArchiveForm({ ...archiveForm, date: e.target.value })} required className="input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Catatan Tambahan</label>
                      <textarea value={archiveForm.notes} onChange={e => setArchiveForm({ ...archiveForm, notes: e.target.value })} className="input-field" style={{ height: '60px', resize: 'vertical' }} placeholder="Catatan singkat dokumen..." />
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Plus size={18} /> Unggah & Simpan Dokumen
                    </button>
                  </form>
                </div>

                {/* Daftar Tabel Arsip Dokumen */}
                <div className="elegant-card elegant-table-container">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FolderArchive size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Daftar Arsip Dokumen Terunggah</h3>
                  </div>
                  <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Berkas Dokumen</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Kategori</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tanggal</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Akses</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {digitalArchive
                        .filter(item => {
                          const matchesSearch = item.title.toLowerCase().includes(archiveSearch.toLowerCase()) || (item.docNo && item.docNo.toLowerCase().includes(archiveSearch.toLowerCase()));
                          const matchesCat = archiveCategoryFilter === "Semua" || item.category === archiveCategoryFilter;
                          return matchesSearch && matchesCat;
                        })
                        .map(item => (
                          <tr key={item.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                            <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                                  <FileText size={14} style={{ color: 'var(--text-muted)' }} />
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{item.title}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                                    <File size={12} color="var(--primary)" />
                                    <span>{item.fileName || `${item.title}.pdf`}</span>
                                    <span>• {item.size || '1.2 MB'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                              <span style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>{item.date}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                              <span style={{ 
                                backgroundColor: item.access === 'Publik' ? 'var(--primary-light)' : item.access === 'Internal' ? '#fef3c7' : '#fee2e2', 
                                color: item.access === 'Publik' ? 'var(--primary)' : item.access === 'Internal' ? '#b45309' : '#dc2626', 
                                padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 
                              }}>
                                {item.access}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                              <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <button 
                                  title="Lihat / Buka Berkas"
                                  onClick={() => handleViewArchiveDoc(item)} 
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDownloadArchiveDoc(item)}
                                  title="Unduh Berkas Original"
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
                                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                                >
                                  <Download size={14} />
                                </button>
                                <button 
                                  title="Edit Dokumen Arsip"
                                  onClick={() => handleOpenEditArchive(item)} 
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s' }}
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button 
                                  title="Hapus Dokumen"
                                  onClick={() => handleDeleteArchive(item.id)} 
                                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', transition: 'all 0.2s' }}
                                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {digitalArchive.length === 0 && (
                        <tr><td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada berkas dokumen terarsip. Silakan unggah dokumen baru.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 5. Incoming Letters */}
          {activeMenu === "letters_in" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               
              {/* Persuratan Tab Switcher (Surat Masuk vs Surat Keluar) */}
              <div className="persuratan-top-switcher" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                padding: '6px',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveMenu('letters_in')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#0d5c3a',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(13, 92, 58, 0.25)'
                  }}
                >
                  <Inbox size={18} style={{ color: '#ffffff' }} />
                  <span>Surat Masuk</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                    {incomingLetters.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMenu('letters_out')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Send size={18} style={{ color: '#0284c7' }} />
                  <span>Surat Keluar</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-dark)',
                    fontWeight: 700
                  }}>
                    {outgoingLetters.length}
                  </span>
                </button>
              </div>

              {/* Card Cetak Laporan Bulanan Persuratan */}
              <div className="laporan-persuratan-card">
                <div className="laporan-persuratan-header">
                  <h3 className="laporan-persuratan-title">
                    <FileText size={17} /> Laporan Bulanan Persuratan
                  </h3>
                  <p className="laporan-persuratan-subtitle">Cetak rekapitulasi data surat masuk dan keluar lengkap dengan Uraian, Nama/TTD, &amp; Keterangan</p>
                </div>
                <div className="laporan-persuratan-controls">
                  <div className="laporan-persuratan-fields">
                    <div className="laporan-persuratan-field">
                      <label className="laporan-persuratan-label">Bulan</label>
                      <select 
                        value={letterReportFilter.month} 
                        onChange={e => setLetterReportFilter({ ...letterReportFilter, month: e.target.value })}
                        className="input-field" 
                        style={{ width: '100%' }}
                      >
                        <option value="01">Januari</option>
                        <option value="02">Februari</option>
                        <option value="03">Maret</option>
                        <option value="04">April</option>
                        <option value="05">Mei</option>
                        <option value="06">Juni</option>
                        <option value="07">Juli</option>
                        <option value="08">Agustus</option>
                        <option value="09">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>

                    <div className="laporan-persuratan-field">
                      <label className="laporan-persuratan-label">Tahun</label>
                      <select 
                        value={letterReportFilter.year} 
                        onChange={e => setLetterReportFilter({ ...letterReportFilter, year: e.target.value })}
                        className="input-field" 
                        style={{ width: '100%' }}
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>

                    <div className="laporan-persuratan-field field-full">
                      <label className="laporan-persuratan-label">Jenis Surat</label>
                      <select 
                        value={letterReportFilter.type} 
                        onChange={e => setLetterReportFilter({ ...letterReportFilter, type: e.target.value })}
                        className="input-field" 
                        style={{ width: '100%' }}
                      >
                        <option value="all">Semua (Masuk &amp; Keluar)</option>
                        <option value="in">Surat Masuk</option>
                        <option value="out">Surat Keluar</option>
                      </select>
                    </div>
                  </div>

                  <div className="laporan-persuratan-actions">
                    <button
                      type="button"
                      onClick={() => { setCurrentPrintDoc(letterReportFilter); setCurrentPrintType("report_letters"); }}
                      className="laporan-persuratan-btn-lihat"
                    >
                      <Eye size={14} /> Lihat
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCurrentPrintDoc(letterReportFilter); setCurrentPrintType("report_letters"); }}
                      className="laporan-persuratan-btn-pdf"
                    >
                      <Download size={14} /> PDF
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="elegant-card elegant-table-container">
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>Catat Surat Masuk Baru</h3>
                <form onSubmit={handleAddIncomingLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Nomor Surat / Ref</label>
                    <input type="text" value={incomingForm.refNo} onChange={e => setIncomingForm({ ...incomingForm, refNo: e.target.value })} required className="input-field" placeholder="Contoh: 045/DINKES/VIII/2026" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Instansi Pengirim</label>
                    <input type="text" value={incomingForm.sender} onChange={e => setIncomingForm({ ...incomingForm, sender: e.target.value })} required className="input-field" placeholder="Contoh: Dinas Kesehatan Kota" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Perihal / Hal</label>
                    <input type="text" value={incomingForm.subject} onChange={e => setIncomingForm({ ...incomingForm, subject: e.target.value })} required className="input-field" placeholder="Contoh: Undangan Koordinasi Pelayanan Kesehatan" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Disposisi Kepada</label>
                      <input type="text" value={incomingForm.disposition} onChange={e => setIncomingForm({ ...incomingForm, disposition: e.target.value })} required className="input-field" placeholder="Contoh: Kepala Klinik" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Tanggal Masuk</label>
                      <input type="date" value={incomingForm.date} onChange={e => setIncomingForm({ ...incomingForm, date: e.target.value })} required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Unggah Berkas Surat (PDF/Gambar)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleIncomingFileSelect} 
                      className="input-field" 
                      style={{ padding: '0.4rem' }}
                    />
                    {incomingForm.fileName && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                        ✓ Berkas terpilih: {incomingForm.fileName} ({incomingForm.fileSize})
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
                    Tambah Surat Masuk
                  </button>
                </form>
              </div>

              <div ref={arsipSuratMasukRef} className="elegant-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Inbox size={16} style={{ color: 'var(--primary)' }} />
                    </div>
                    <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Arsip Surat Masuk</h3>
                  </div>
                  <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Cari surat..." 
                      value={inboxSearch}
                      onChange={e => setInboxSearch(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '1.8rem', height: '32px', fontSize: '0.8rem', width: '100%' }}
                    />
                  </div>
                </div>
                <div className="elegant-table-container" style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}>
                <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>No Surat</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tanggal Masuk</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Pengirim</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Perihal</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Disposisi</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingLetters
                      .filter(l => l.refNo.toLowerCase().includes(inboxSearch.toLowerCase()) || l.subject.toLowerCase().includes(inboxSearch.toLowerCase()) || l.sender.toLowerCase().includes(inboxSearch.toLowerCase()))
                      .map(l => (
                      <tr key={l.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                        <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{l.refNo}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', color: 'var(--primary)', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem' }}>
                            <Calendar size={13} style={{ color: 'var(--primary)' }} />
                            <span>{formatDateIndo(l.date || l.createdAt, l.id)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <User size={12} style={{ color: 'var(--primary)' }} />
                            {l.sender}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-dark)', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>{l.subject}</td>
                        <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                          <span style={{ display: 'inline-block', whiteSpace: 'nowrap', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {l.disposition}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button 
                              title="Lihat Detail / Berkas Surat"
                              onClick={() => handleViewIncomingLetterFile(l)} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#d1fae5'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}
                            >
                              <Eye size={14} />
                            </button>
                            {(l.fileData || l.fileName || l.hasStoredFile) && (
                              <button 
                                title="Unduh Berkas Surat"
                                onClick={() => handleDownloadIncomingLetterFile(l)} 
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#e0f2fe', color: '#0284c7', cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#bae6fd'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                              >
                                <Download size={14} />
                              </button>
                            )}
                            <button 
                              onClick={() => setLetterModal({ isOpen: true, type: "in", action: "edit", data: l })} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', background: 'var(--bg-main)', color: 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s' }}
                              title="Edit"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteIncomingLetter(l.id)} 
                              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseOver={e => e.currentTarget.style.backgroundColor = '#fecaca'}
                              onMouseOut={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {incomingLetters.length === 0 && (
                      <tr><td colSpan="6" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada data surat masuk.</td></tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* 6. Outgoing Letters Generator */}
          {activeMenu === "letters_out" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               
              {/* Persuratan Tab Switcher (Surat Masuk vs Surat Keluar) */}
              <div className="persuratan-top-switcher" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                padding: '6px',
                borderRadius: '16px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                gap: '8px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveMenu('letters_in')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)'
                  }}
                >
                  <Inbox size={18} style={{ color: '#059669' }} />
                  <span>Surat Masuk</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--text-dark)',
                    fontWeight: 700
                  }}>
                    {incomingLetters.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMenu('letters_out')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    padding: '0.65rem 1rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit, sans-serif',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#0d5c3a',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(13, 92, 58, 0.25)'
                  }}
                >
                  <Send size={18} style={{ color: '#ffffff' }} />
                  <span>Surat Keluar</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                    {outgoingLetters.length}
                  </span>
                </button>
              </div>

            <SuratKeluar 
              letterForm={letterForm}
              setLetterForm={setLetterForm}
              letterReportFilter={letterReportFilter}
              setLetterReportFilter={setLetterReportFilter}
              outgoingLetters={outgoingLetters}
              previewJSPDFReport={previewJSPDFReport}
              generateJSPDFReport={generateJSPDFReport}
              generateWordReport={generateWordReport}
              printJSPDFReport={printJSPDFReport}
              handleCreateLetter={handleCreateLetter}
              setCurrentPrintDoc={setCurrentPrintDoc}
              setCurrentPrintType={setCurrentPrintType}
              setLetterModal={setLetterModal}
              handleDeleteOutgoingLetter={handleDeleteOutgoingLetter}
              letterTypes={letterTypes}
              unitCodes={unitCodes}
              arsipRef={arsipSuratKeluarRef}
            />
            </div>
          )}

          {/* 7. Certificates */}
          {(activeMenu === "certificates" || activeMenu === "certs") && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               
              <div className="elegant-card elegant-table-container">
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', color: 'var(--primary)' }}>Buat Sertifikat Resmi</h3>
                <form onSubmit={handleCreateCert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Nomor Sertifikat (Opsional)</label>
                    <input type="text" value={certForm.docNo} onChange={e => setCertForm({ ...certForm, docNo: e.target.value })} className="input-field" placeholder="Kosongkan jika ingin dibuat otomatis..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Nama Peserta / Penerima</label>
                    <input type="text" value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} required className="input-field" placeholder="Contoh: Budi Santoso, S.Kom" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>NIS / NIM / NIP <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.78rem' }}>(opsional)</span></label>
                      <input type="text" value={certForm.identityNo} onChange={e => setCertForm({ ...certForm, identityNo: e.target.value })} className="input-field" placeholder="Contoh: 210101089" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Program / Jenis Kegiatan</label>
                      <select value={certForm.activityType} onChange={e => setCertForm({ ...certForm, activityType: e.target.value, customActivityType: '' })} required className="input-field">
                        <option value="Magang / Praktik Kerja">Magang / PKL</option>
                        <option value="Pelatihan Kesehatan">Pelatihan Kesehatan</option>
                        <option value="Pengabdian Masyarakat">Pengabdian Masyarakat</option>
                        <option value="Workshop & Seminar">Workshop & Seminar</option>
                        <option value="Other">Lainnya (isi sendiri)</option>
                      </select>
                      {certForm.activityType === "Other" && (
                        <input type="text" value={certForm.customActivityType} onChange={e => setCertForm({ ...certForm, customActivityType: e.target.value })} required className="input-field" placeholder="Tuliskan jenis kegiatan..." style={{ marginTop: '0.5rem' }} />
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Institusi / Universitas</label>
                      <input type="text" value={certForm.institution} onChange={e => setCertForm({ ...certForm, institution: e.target.value })} required className="input-field" placeholder="Contoh: Universitas Indonesia" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Program Studi / Jurusan</label>
                      <input type="text" value={certForm.major} onChange={e => setCertForm({ ...certForm, major: e.target.value })} required className="input-field" placeholder="Contoh: Farmasi / Keperawatan" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Tgl Mulai</label>
                      <input type="date" value={certForm.startDate} onChange={e => setCertForm({ ...certForm, startDate: e.target.value })} required className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Tgl Selesai</label>
                      <input type="date" value={certForm.endDate} onChange={e => setCertForm({ ...certForm, endDate: e.target.value })} required className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Predikat / Nilai <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.78rem' }}>(opsional)</span></label>
                      <select value={certForm.notes} onChange={e => setCertForm({ ...certForm, notes: e.target.value })} className="input-field">
                        <option value="">-- Tanpa Predikat --</option>
                        <option value="Sangat Baik">Sangat Baik</option>
                        <option value="Baik">Baik</option>
                        <option value="Cukup">Cukup</option>
                      </select>
                    </div>
                  </div>

                  {/* Isi / Body Sertifikat */}
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}> Isi / Body Sertifikat</label>
                      <button
                        type="button"
                        onClick={() => {
                          const auto = generateCertBody(certForm);
                          setPrevAutoBody(auto);
                          setCertForm(prev => ({ ...prev, customBody: auto }));
                        }}
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        ↺ Regenerasi Otomatis
                      </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.5rem', fontStyle: 'italic' }}>Teks otomatis terisi berdasarkan data di atas. Edit langsung sesuai kebutuhan, atau klik "Regenerasi" untuk reset.</p>
                    <textarea
                      value={certForm.customBody}
                      onChange={e => setCertForm({ ...certForm, customBody: e.target.value })}
                      className="input-field"
                      rows={7}
                      style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.7', fontSize: '0.9rem' }}
                    />
                  </div>

                  {/* Editable TTD Section */}
                  <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>Pengaturan Tanda Tangan (TTD) Sertifikat</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Tanda Tangan Kiri (Direktur)</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Jabatan Penandatangan Kiri</label>
                            <input type="text" placeholder="Default: Direktur Utama" value={certForm.title} onChange={e => setCertForm({ ...certForm, title: e.target.value })} className="input-field" style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Nama Direktur</label>
                            <input type="text" placeholder="Kosongkan jika diisi manual" value={certForm.signatory} onChange={e => setCertForm({ ...certForm, signatory: e.target.value })} className="input-field" style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Tanda Tangan Kanan (Bebas)</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Jabatan Penandatangan Kanan</label>
                            <input type="text" placeholder="Contoh: Manajemen Klinik" value={certForm.leftSignatoryTitle} onChange={e => setCertForm({ ...certForm, leftSignatoryTitle: e.target.value })} className="input-field" style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-dark)' }}>Nama Penandatangan Kanan</label>
                            <input type="text" placeholder="Kosongkan jika diisi manual" value={certForm.leftSignatoryName} onChange={e => setCertForm({ ...certForm, leftSignatoryName: e.target.value })} className="input-field" style={{ padding: '0.4rem 0.5rem', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px dashed var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-dark)' }}>Opsi Pengesahan Sertifikat:</span>
                      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', margin: 0 }}>
                          <input 
                            type="checkbox" 
                            id="certUseSig" 
                            checked={certForm.useDigitalSignature !== false} 
                            onChange={e => setCertForm({ ...certForm, useDigitalSignature: e.target.checked })} 
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                          />
                          ✍️ Pakai TTD Digital
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 600, color: '#2563eb', cursor: 'pointer', margin: 0 }}>
                          <input 
                            type="checkbox" 
                            id="certUseStamp" 
                            checked={certForm.useDigitalStamp !== false} 
                            onChange={e => setCertForm({ ...certForm, useDigitalStamp: e.target.checked })} 
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                          />
                          💮 Pakai Stempel Resmi
                        </label>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem' }}>
                    Buat & Cetak Sertifikat PDF
                  </button>
                </form>
              </div>

              <div className="elegant-card elegant-table-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={16} style={{ color: 'var(--primary)' }} />
                  </div>
                  <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Arsip Sertifikat Diterbitkan</h3>
                </div>
                <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Nomor & Detail Sertifikat</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tanggal Terbit</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Nama Penerima</th>
                      <th style={{ padding: '0 1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map(c => (
                      <tr key={c.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                        <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                              <Award size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{c.docNo}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Sertifikat Resmi</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(13, 148, 136, 0.08)', color: 'var(--primary)', padding: '0.25rem 0.55rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.78rem' }}>
                            <Calendar size={13} style={{ color: 'var(--primary)' }} />
                            <span>{formatDateIndo(c.date || c.createdAt || c.endDate || c.startDate, c.id)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', color: 'var(--text-dark)', fontSize: '0.8rem', fontWeight: 600 }}>
                            <User size={12} style={{ color: 'var(--primary)' }} />
                            {c.name}
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button title="Lihat Sertifikat" onClick={() => { setCurrentPrintDoc(c); setCurrentPrintType("cert"); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-light)'}>
                              <Eye size={14} />
                            </button>
                            <button title="Cetak / Download PDF" onClick={() => { setCurrentPrintDoc(c); setCurrentPrintType("cert"); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}>
                              <Download size={14} />
                            </button>
                            <button title="Edit Sertifikat" onClick={() => setCertModal({ isOpen: true, data: c })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', transition: 'all 0.2s' }}>
                              <Edit3 size={14} />
                            </button>
                            <button title="Hapus" onClick={() => handleDeleteCert(c.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#b91c1c', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {certificates.length === 0 && (
                      <tr><td colSpan="4" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada sertifikat diterbitkan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Return Banner for Special Access pages */}
          {["warehouse", "requests", "assets_inventaris", "asset_master", "asset_relocation", "report_assets"].includes(activeMenu) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.85rem', marginBottom: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                <Shield size={14} /> Akses Khusus: {["warehouse", "requests"].includes(activeMenu) ? 'Gudang Umum' : 'Aset Tetap'}
              </div>
              <button
                type="button"
                onClick={() => setActiveMenu('settings')}
                style={{ background: '#fff', border: '1px solid #86efac', color: '#166534', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                ← Pengaturan Akses Khusus
              </button>
            </div>
          )}

          {/* 8. Warehouse Stock management */}
          {activeMenu === "warehouse" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(() => {
                const isUnlocked = (() => {
                  try {
                    return Boolean(JSON.parse(sessionStorage.getItem('kbr_unlocked_special_access') || '{}')?.gudang);
                  } catch { return false; }
                })();

                if (!isUnlocked) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: 'var(--bg-card, #fff)', borderRadius: '16px', border: '1px solid var(--border-light, #e5e7eb)', maxWidth: '520px', margin: '3rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: '#0d652d' }}>
                        <Lock size={34} />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>Gudang Umum Terkunci</h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.75rem 0', lineHeight: 1.5 }}>
                        Fitur Gudang Umum hanya dapat diakses melalui Pengaturan Akses Khusus dengan verifikasi PIN.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('settings')}
                        style={{ padding: '0.65rem 1.5rem', backgroundColor: '#0d652d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        Buka di Pengaturan Akses Khusus
                      </button>
                    </div>
                  );
                }

                return (
                  <InventarisGudang 
                    warehouseItems={warehouseItems}
                    stockInForm={stockInForm}
                    setStockInForm={setStockInForm}
                    handleStockIn={handleStockIn}
                    stockOutForm={stockOutForm}
                    setStockOutForm={setStockOutForm}
                    handleStockOut={handleStockOut}
                  />
                );
              })()}
            </div>
          )}

          {activeMenu === "assets_inventaris" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataAsetInventaris
                settings={settings}
                assets={assetsInventaris}
                onSaveAssets={(newAssets) => {
                  setAssetsInventaris(newAssets);
                  db.set("assets_inventaris", newAssets);
                }}
                locations={assetLocations}
                types={assetTypes}
                units={assetUnits}
                openConfirm={openConfirm}
                arsipRef={arsipAsetRef}
              />
            </div>
          )}

          {activeMenu === "asset_master" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <MasterAset 
                types={assetTypes}
                onSaveTypes={(updated) => {
                  setAssetTypes(updated);
                  db.set("asset_types", updated);
                }}
                locations={assetLocations}
                onSaveLocations={(updated) => {
                  setAssetLocations(updated);
                  db.set("asset_locations", updated);
                }}
                units={assetUnits}
                onSaveUnits={(updated) => {
                  setAssetUnits(updated);
                  db.set("asset_units", updated);
                }}
                openConfirm={openConfirm}
              />
            </div>
          )}

          {activeMenu === "asset_relocation" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <RelokasiAset 
                assets={assetsInventaris}
                onSaveAssets={(updated) => {
                  setAssetsInventaris(updated);
                  db.set("assets_inventaris", updated);
                }}
                locations={assetLocations}
                relocations={assetRelocations}
                onSaveRelocations={(updated) => {
                  setAssetRelocations(updated);
                  db.set("asset_relocations", updated);
                }}
                openConfirm={openConfirm}
              />
            </div>
          )}

          {activeMenu === "report_assets" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <LaporanAset
                settings={settings}
                assets={assetsInventaris}
                locations={assetLocations}
                types={assetTypes}
                initialTab={assetReportTab}
              />
            </div>
          )}

          

          {(activeMenu === "requests" || activeMenu === "borrowings") && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {(() => {
                const isUnlocked = (() => {
                  try {
                    return Boolean(JSON.parse(sessionStorage.getItem('kbr_unlocked_special_access') || '{}')?.gudang);
                  } catch { return false; }
                })();

                if (!isUnlocked) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: 'var(--bg-card, #fff)', borderRadius: '16px', border: '1px solid var(--border-light, #e5e7eb)', maxWidth: '520px', margin: '3rem auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '68px', height: '68px', borderRadius: '50%', backgroundColor: '#e6f4ea', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: '#0d652d' }}>
                        <Lock size={34} />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem 0' }}>Permintaan Keluar Terkunci</h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.75rem 0', lineHeight: 1.5 }}>
                        Fitur Gudang Umum hanya dapat diakses melalui Pengaturan Akses Khusus dengan verifikasi PIN.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveMenu('settings')}
                        style={{ padding: '0.65rem 1.5rem', backgroundColor: '#0d652d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        Buka di Pengaturan Akses Khusus
                      </button>
                    </div>
                  );
                }

                return null;
              })() || (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Form Input Permintaan Keluar */}
                <div className="elegant-card elegant-table-container">
                  {/* Form Type Switcher Header */}
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.35rem', borderRadius: '8px', marginBottom: '1.25rem', gap: '0.35rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setRequestFormType("out")} 
                      style={{ 
                        flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                        backgroundColor: requestFormType === "out" ? 'var(--bg-card)' : 'transparent',
                        color: requestFormType === "out" ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: requestFormType === "out" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Barang Keluar Stok
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRequestFormType("borrow")} 
                      style={{ 
                        flex: 1, padding: '0.65rem', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease',
                        backgroundColor: requestFormType === "borrow" ? 'var(--bg-card)' : 'transparent',
                        color: requestFormType === "borrow" ? 'var(--primary)' : 'var(--text-muted)',
                        boxShadow: requestFormType === "borrow" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      Peminjaman Alat
                    </button>
                  </div>

                  {/* Form Barang Keluar Stok */}
                  {requestFormType === "out" && (
                    <form onSubmit={handleStockOut} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Pengeluaran Barang Stok (Habis Pakai)</h4>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Pilih Barang Gudang</label>
                        <select value={stockOutForm.itemCode} onChange={e => setStockOutForm({ ...stockOutForm, itemCode: e.target.value })} required className="input-field">
                          <option value="">-- Pilih Barang --</option>
                          {warehouseItems.map(i => (
                            <option key={i.code} value={i.code}>{i.name} (Tersedia: {i.currentStock} {i.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jumlah / Quantity</label>
                          <input type="number" min="1" value={stockOutForm.qty} onChange={e => setStockOutForm({ ...stockOutForm, qty: e.target.value })} required className="input-field" placeholder="1" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Petugas Peminta</label>
                          <input type="text" value={stockOutForm.officer} onChange={e => setStockOutForm({ ...stockOutForm, officer: e.target.value })} required className="input-field" placeholder="Nama Petugas" />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tujuan Unit / Poli Peminta</label>
                        <input type="text" value={stockOutForm.destination} onChange={e => setStockOutForm({ ...stockOutForm, destination: e.target.value })} required className="input-field" placeholder="Contoh: Poli Anak / Ruang Rawat Inap" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Catatan / Perihal</label>
                        <input type="text" value={stockOutForm.notes} onChange={e => setStockOutForm({ ...stockOutForm, notes: e.target.value })} className="input-field" placeholder="Contoh: Kebutuhan medis & resep" />
                      </div>
                      <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Simpan Barang Keluar
                      </button>
                    </form>
                  )}

                  {/* Form Peminjaman Alat */}
                  {requestFormType === "borrow" && (
                    <form onSubmit={handleBorrowItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 700 }}>Peminjaman Alat & Inventaris Gudang</h4>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Barang / Alat</label>
                        <input type="text" value={borrowForm.itemName} onChange={e => setBorrowForm({ ...borrowForm, itemName: e.target.value })} required className="input-field" placeholder="Contoh: Tabung Oksigen" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Peminjam</label>
                          <input type="text" value={borrowForm.borrower} onChange={e => setBorrowForm({ ...borrowForm, borrower: e.target.value })} required className="input-field" placeholder="Dr. Syarifah" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unit / Poli</label>
                          <input type="text" value={borrowForm.unit} onChange={e => setBorrowForm({ ...borrowForm, unit: e.target.value })} required className="input-field" placeholder="Poli Gigi" />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jumlah (Qty)</label>
                          <input type="number" min="1" value={borrowForm.qty} onChange={e => setBorrowForm({ ...borrowForm, qty: e.target.value })} required className="input-field" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tgl Batas Kembali</label>
                          <input type="date" value={borrowForm.dueDate} onChange={e => setBorrowForm({ ...borrowForm, dueDate: e.target.value })} required className="input-field" />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tujuan Peminjaman</label>
                        <input type="text" value={borrowForm.purpose} onChange={e => setBorrowForm({ ...borrowForm, purpose: e.target.value })} required className="input-field" placeholder="Contoh: Pemeriksaan khusus Poli Gigi" />
                      </div>
                      <button type="submit" className="btn-primary" style={{ padding: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Simpan Transaksi Peminjaman
                      </button>
                    </form>
                  )}
                </div>

                {/* Tabel Riwayat Permintaan Keluar & Peminjaman */}
                <div className="elegant-card elegant-table-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <h3 style={{ fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Riwayat Permintaan</h3>
                    </div>
                    
                    {/* Modern Segmented Control Filter */}
                    <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '0.25rem', borderRadius: '8px', gap: '0.25rem' }}>
                      <button 
                        onClick={() => setRequestFilterTab("all")}
                        style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: requestFilterTab === "all" ? 'var(--bg-card)' : 'transparent', color: requestFilterTab === "all" ? 'var(--primary)' : 'var(--text-muted)', boxShadow: requestFilterTab === "all" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Semua
                      </button>
                      <button 
                        onClick={() => setRequestFilterTab("out")}
                        style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: requestFilterTab === "out" ? 'var(--bg-card)' : 'transparent', color: requestFilterTab === "out" ? 'var(--primary)' : 'var(--text-muted)', boxShadow: requestFilterTab === "out" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Barang Keluar
                      </button>
                      <button 
                        onClick={() => setRequestFilterTab("borrow")}
                        style={{ padding: '0.4rem 1rem', borderRadius: '6px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', backgroundColor: requestFilterTab === "borrow" ? 'var(--bg-card)' : 'transparent', color: requestFilterTab === "borrow" ? 'var(--primary)' : 'var(--text-muted)', boxShadow: requestFilterTab === "borrow" ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
                      >
                        Peminjaman
                      </button>
                    </div>
                  </div>

                  <table className="elegant-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Detail Barang</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tujuan / Peminta</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'left', fontWeight: 600 }}>Tanggal</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '0 1rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Barang Keluar Rows */}
                      {(requestFilterTab === "all" || requestFilterTab === "out") && stockOutList.map(out => (
                        <tr key={out.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                          <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fdf4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Upload size={14} style={{ color: '#c026d3' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{out.itemName} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.75rem' }}>x{out.qty} {out.unit || 'Unit'}</span></div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{out.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-dark)' }}>{out.destination}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              <User size={12} /> {out.officer}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{out.date}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Distribusi</div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              backgroundColor: out.status === 'Ditolak' ? '#fee2e2' : out.status === 'Disetujui' ? '#e0e7ff' : '#ecfdf5', 
                              color: out.status === 'Ditolak' ? '#991b1b' : out.status === 'Disetujui' ? '#3730a3' : '#047857', 
                              padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 
                            }}>
                              {out.status === 'Ditolak' ? <AlertCircle size={12} /> : out.status === 'Disetujui' ? <CheckCircle2 size={12} /> : <CheckCircle size={12} />}
                              {out.status || 'Selesai'}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              <button onClick={() => setRequestModal({ isOpen: true, type: "out", action: "edit", data: out })} title="Edit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', transition: 'all 0.2s' }}>
                                <Edit3 size={14} />
                              </button>
                              {(!out.status || out.status === 'Selesai') && (
                                <button onClick={() => handleStatusChange("out", out.id, "Disetujui")} title="Setujui" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#e0e7ff', color: '#3730a3', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c7d2fe'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e0e7ff'}>
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              {(!out.status || out.status === 'Selesai') && (
                                <button onClick={() => handleStatusChange("out", out.id, "Ditolak")} title="Tolak" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#991b1b', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                                  <AlertCircle size={14} />
                                </button>
                              )}
                              <button onClick={() => handleDeleteRequest("out", out.id)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#b91c1c', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {/* Peminjaman Rows */}
                      {(requestFilterTab === "all" || requestFilterTab === "borrow") && borrowings.map(b => (
                        <tr key={b.id} style={{ backgroundColor: 'var(--bg-card)', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', borderRadius: '8px', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)'}>
                          <td style={{ padding: '0.75rem', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw size={14} style={{ color: '#ea580c' }} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{b.itemName} <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '0.75rem' }}>x{b.qty || 1} Unit</span></div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{b.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-dark)' }}>{b.borrower}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              <Warehouse size={12} /> {b.unit}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Pjm: {b.date}</div>
                            <div style={{ fontSize: '0.7rem', color: b.dueDate < new Date().toISOString().split('T')[0] && b.status === "Dipinjam" ? '#dc2626' : 'var(--text-muted)', marginTop: '2px' }}>Batas: {b.dueDate || "-"}</div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ 
                              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                              backgroundColor: (b.status === 'Dikembalikan' || b.status === 'Selesai') ? '#ecfdf5' : '#fef9c3', 
                              color: (b.status === 'Dikembalikan' || b.status === 'Selesai') ? '#047857' : '#854d0e', 
                              padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 
                            }}>
                              {(b.status === 'Dikembalikan' || b.status === 'Selesai') ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {b.status}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', borderTop: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)', borderRight: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                              {b.status === "Dipinjam" && (
                                <button onClick={() => {
                                  openConfirm(`Apakah Anda yakin ingin menyelesaikan transaksi peminjaman "${b.itemName}" (${b.id}) dan menandai barang telah dikembalikan?`, () => {
                                    handleStatusChange("borrow", b.id, "Selesai");
                                    window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Peminjaman ${b.itemName} berhasil diselesaikan!`, type: 'success' } }));
                                  });
                                }} title="Selesaikan / Tandai Dikembalikan" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#ecfdf5', color: '#047857', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d1fae5'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ecfdf5'}>
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              <button onClick={() => setRequestModal({ isOpen: true, type: "borrow", action: "edit", data: b })} title="Edit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: '1px solid var(--border-light)', cursor: 'pointer', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', transition: 'all 0.2s' }}>
                                  <Edit3 size={14} />
                              </button>
                              <button onClick={() => handleDeleteRequest("borrow", b.id)} title="Hapus" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#fee2e2', color: '#b91c1c', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fecaca'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}>
                                  <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {stockOutList.length === 0 && borrowings.length === 0 && (
                        <tr><td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada transaksi permintaan keluar atau peminjaman.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              )}
            </div>
          )}



          {/* 10. Reports */}
          {activeMenu === "reports" && (() => {
            const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
            const m = selectedReportPeriod?.month || "08";
            const year = selectedReportPeriod?.year || "2026";
            const mIdx = Math.max(0, parseInt(m, 10) - 1);
            const monthName = monthNames[mIdx] || "Agustus";

            const safeOutgoing = outgoingLetters || [];
            const safeIncoming = incomingLetters || [];
            const safeCerts = certificates || [];
            const safeStockIn = stockInList || [];
            const safeStockOut = stockOutList || [];
            const safeBorrow = borrowings || [];
            const safeWarehouse = warehouseItems || [];
            const safeAssets = assetsInventaris || [];

            const filteredOut = safeOutgoing.filter(l => l?.date && String(l.date).startsWith(`${year}-${m}`));
            const filteredIn = safeIncoming.filter(l => l?.date && String(l.date).startsWith(`${year}-${m}`));
            const filteredCerts = safeCerts.filter(c => c?.date && String(c.date).startsWith(`${year}-${m}`));
            const filteredStockIn = safeStockIn.filter(s => s?.date && String(s.date).startsWith(`${year}-${m}`));
            const filteredStockOut = safeStockOut.filter(s => s?.date && String(s.date).startsWith(`${year}-${m}`));
            const filteredBorrow = safeBorrow.filter(b => b?.date && String(b.date).startsWith(`${year}-${m}`));
            const lowStockItems = safeWarehouse.filter(i => i && Number(i.currentStock || 0) <= Number(i.minStock || 0));

            let secCode = 65; // 'A'
            const reportLetters = {
              summary: String.fromCharCode(secCode++),
              suratMasuk: (reportFilters.suratMasuk && filteredIn.length > 0) ? String.fromCharCode(secCode++) : null,
              suratKeluar: (reportFilters.suratKeluar && filteredOut.length > 0) ? String.fromCharCode(secCode++) : null,
              barangMasuk: (reportFilters.barangMasuk && filteredStockIn.length > 0) ? String.fromCharCode(secCode++) : null,
              barangKeluar: (reportFilters.barangKeluar && filteredStockOut.length > 0) ? String.fromCharCode(secCode++) : null,
              peminjaman: (reportFilters.peminjaman && filteredBorrow.length > 0) ? String.fromCharCode(secCode++) : null,
              sertifikat: (reportFilters.sertifikat && filteredCerts.length > 0) ? String.fromCharCode(secCode++) : null,
              aset: (reportFilters.aset && safeAssets.length > 0) ? String.fromCharCode(secCode++) : null,
            };

            const handleExportCSV = () => {
              const exportData = [];
              if (reportFilters.suratMasuk) exportData.push({ Kategori: 'Surat Masuk', Jumlah: filteredIn.length });
              if (reportFilters.suratKeluar) exportData.push({ Kategori: 'Surat Keluar', Jumlah: filteredOut.length });
              if (reportFilters.sertifikat) exportData.push({ Kategori: 'Sertifikat / Piagam', Jumlah: filteredCerts.length });
              if (reportFilters.barangMasuk) exportData.push({ Kategori: 'Barang Masuk Gudang', Jumlah: filteredStockIn.length });
              if (reportFilters.barangKeluar) exportData.push({ Kategori: 'Barang Keluar Gudang', Jumlah: filteredStockOut.length });
              if (reportFilters.peminjaman) exportData.push({ Kategori: 'Peminjaman Aset', Jumlah: filteredBorrow.length });
              if (reportFilters.aset) exportData.push({ Kategori: 'Data Aset & Inventaris', Jumlah: safeAssets.length });
              exportTableToCSV(exportData, `Laporan_Bulanan_${m}_${year}.csv`);
            };

            const handleExportPDF = () => {
              const exportData = [];
              if (reportFilters.suratMasuk) exportData.push({ Kategori: 'Surat Masuk', Jumlah: filteredIn.length });
              if (reportFilters.suratKeluar) exportData.push({ Kategori: 'Surat Keluar', Jumlah: filteredOut.length });
              if (reportFilters.sertifikat) exportData.push({ Kategori: 'Sertifikat / Piagam', Jumlah: filteredCerts.length });
              if (reportFilters.barangMasuk) exportData.push({ Kategori: 'Barang Masuk Gudang', Jumlah: filteredStockIn.length });
              if (reportFilters.barangKeluar) exportData.push({ Kategori: 'Barang Keluar Gudang', Jumlah: filteredStockOut.length });
              if (reportFilters.peminjaman) exportData.push({ Kategori: 'Peminjaman Aset', Jumlah: filteredBorrow.length });
              if (reportFilters.aset) exportData.push({ Kategori: 'Data Aset & Inventaris', Jumlah: safeAssets.length });
              exportTableToPDF(exportData, `Laporan_Bulanan_${m}_${year}.pdf`, "Laporan Bulanan");
            };

            const handleExportWord = () => {
              const exportData = [];
              if (reportFilters.suratMasuk) exportData.push({ Kategori: 'Surat Masuk', Jumlah: filteredIn.length });
              if (reportFilters.suratKeluar) exportData.push({ Kategori: 'Surat Keluar', Jumlah: filteredOut.length });
              if (reportFilters.sertifikat) exportData.push({ Kategori: 'Sertifikat / Piagam', Jumlah: filteredCerts.length });
              if (reportFilters.barangMasuk) exportData.push({ Kategori: 'Barang Masuk Gudang', Jumlah: filteredStockIn.length });
              if (reportFilters.barangKeluar) exportData.push({ Kategori: 'Barang Keluar Gudang', Jumlah: filteredStockOut.length });
              if (reportFilters.peminjaman) exportData.push({ Kategori: 'Peminjaman Aset', Jumlah: filteredBorrow.length });
              if (reportFilters.aset) exportData.push({ Kategori: 'Data Aset & Inventaris', Jumlah: safeAssets.length });
              exportTableToWord(exportData, `Laporan_Bulanan_${m}_${year}.doc`, "Laporan Bulanan");
            };

            return (
            <div className="laporan-page-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
              
              {/* Toolbar Laporan Bulanan (Rapi, Terstruktur & Responsif Mobile) */}
              <div className="laporan-main-toolbar">
                {/* Baris 1: Judul, Periode, Tombol Generate & Ekspor */}
                <div className="laporan-toolbar-grid">
                  <div className="laporan-left-controls">
                    <div className="laporan-title-area">
                      <FileText size={18} color="var(--primary)" />
                      <span className="laporan-main-title">Laporan Bulanan</span>
                    </div>

                    <div className="laporan-desktop-sep" />

                    <div className="laporan-period-area">
                      <div className="laporan-period-select-wrap">
                        <span className="laporan-period-label">Bulan:</span>
                        <select 
                          value={selectedReportPeriod.month} 
                          onChange={e => setSelectedReportPeriod({ ...selectedReportPeriod, month: e.target.value })} 
                          className="laporan-select"
                        >
                          {["01","02","03","04","05","06","07","08","09","10","11","12"].map((mo, i) => (
                            <option key={mo} value={mo}>{monthNames[i]}</option>
                          ))}
                        </select>
                      </div>
                      <div className="laporan-period-select-wrap">
                        <span className="laporan-period-label">Tahun:</span>
                        <select 
                          value={selectedReportPeriod.year} 
                          onChange={e => setSelectedReportPeriod({ ...selectedReportPeriod, year: e.target.value })} 
                          className="laporan-select"
                        >
                          {["2024","2025","2026","2027"].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>

                    <button onClick={() => {
                      const data = { period: `${selectedReportPeriod.month} ${selectedReportPeriod.year}`, month: selectedReportPeriod.month, year: selectedReportPeriod.year };
                      setCurrentPrintDoc(data);
                      setCurrentPrintType("report");
                    }} className="laporan-generate-btn">
                      <FileText size={15} /> Generate Laporan
                    </button>
                  </div>

                  {/* Tombol Ekspor */}
                  <div className="laporan-export-area">
                    <span className="laporan-export-label">Ekspor:</span>
                    <button onClick={handleExportCSV} className="laporan-btn-csv" title="Ekspor data ringkasan ke file CSV">
                      <Download size={13} /> CSV
                    </button>
                    <button onClick={handleExportPDF} className="laporan-btn-pdf" title="Cetak / Simpan dokumen PDF resmi">
                      <Download size={13} /> PDF
                    </button>
                  </div>
                </div>

                {/* Baris 2: Filter Bagian yang rapih */}
                <div className="laporan-filter-section">
                  <div className="laporan-filter-header">
                    <Sliders size={13} color="var(--primary)" /> Sertakan Bagian:
                  </div>
                  <div className="laporan-checkbox-grid">
                    {[
                      { id: 'suratMasuk', label: 'Surat Masuk' },
                      { id: 'suratKeluar', label: 'Surat Keluar' },
                      { id: 'barangMasuk', label: 'Barang Masuk' },
                      { id: 'barangKeluar', label: 'Barang Keluar' },
                      { id: 'peminjaman', label: 'Peminjaman Aset' },
                      { id: 'sertifikat', label: 'Sertifikat' },
                      { id: 'aset', label: 'Data Aset' }
                    ].map(opt => (
                      <label key={opt.id} className="laporan-checkbox-item">
                        <input 
                          type="checkbox" 
                          checked={reportFilters[opt.id]} 
                          onChange={e => setReportFilters(prev => ({ ...prev, [opt.id]: e.target.checked }))} 
                          style={{ width: '14px', height: '14px', accentColor: 'var(--primary)', cursor: 'pointer' }} 
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel Pengaturan Tanda Tangan & Tanggal Cetak */}
              <div className="laporan-ttd-panel no-print">
                <div className="laporan-ttd-panel-header">
                  <span className="laporan-ttd-panel-title">
                    Pengaturan Tanda Tangan &amp; Tanggal Cetak
                  </span>
                  <div className="laporan-ttd-count-picker">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Jumlah TTD:</span>
                    <div className="laporan-ttd-toggle-group">
                      {[
                        { count: 1, label: "1 TTD" },
                        { count: 2, label: "2 TTD" },
                        { count: 3, label: "3 TTD" }
                      ].map(opt => (
                        <button key={opt.count} type="button" onClick={() => setReportSigneeCount(opt.count)}
                          style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem', fontWeight: reportSigneeCount === opt.count ? 700 : 500, backgroundColor: reportSigneeCount === opt.count ? 'var(--primary)' : 'transparent', color: reportSigneeCount === opt.count ? '#fff' : 'var(--text-muted)', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="laporan-ttd-panel-body">
                  <div className="laporan-ttd-date-box">
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>TEMPAT &amp; TANGGAL CETAK :</label>
                    <input type="text" value={reportDate} onChange={e => setReportDate(e.target.value)} className="input-field" style={{ width: '100%', height: '34px', boxSizing: 'border-box', fontSize: '0.82rem' }} placeholder="Contoh: Garut, 1 September 2026" />
                  </div>

                  <div className={`laporan-ttd-cards-grid ttd-count-${reportSigneeCount}`}>
                    {reportSigneeCount >= 2 && (
                      <div className="laporan-ttd-item">
                        <span className="laporan-ttd-item-title">TTD Kiri (Mengetahui)</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <input type="text" placeholder="Jabatan (Contoh: Kepala Klinik)" value={reportSigneeLeftTitle} onChange={e => setReportSigneeLeftTitle(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                          <input type="text" placeholder="Nama Lengkap" value={reportSigneeLeftName} onChange={e => setReportSigneeLeftName(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                          <input type="text" placeholder="NIK / NIP" value={reportSigneeLeftNik} onChange={e => setReportSigneeLeftNik(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}
                    {reportSigneeCount === 3 && (
                      <div className="laporan-ttd-item">
                        <span className="laporan-ttd-item-title">TTD Tengah</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <input type="text" placeholder="Jabatan (Contoh: KASUBID Umum)" value={reportSigneeMiddleTitle} onChange={e => setReportSigneeMiddleTitle(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                          <input type="text" placeholder="Nama Lengkap" value={reportSigneeMiddleName} onChange={e => setReportSigneeMiddleName(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                          <input type="text" placeholder="NIK / NIP" value={reportSigneeMiddleNik} onChange={e => setReportSigneeMiddleNik(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                        </div>
                      </div>
                    )}
                    <div className="laporan-ttd-item">
                      <span className="laporan-ttd-item-title">
                        {reportSigneeCount === 1 ? "TTD (Penanggung Jawab)" : "TTD Kanan"}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <input type="text" placeholder="Jabatan (Contoh: Pengelola Administrasi)" value={reportSigneeRightTitle} onChange={e => setReportSigneeRightTitle(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                        <input type="text" placeholder="Nama Lengkap" value={reportSigneeRightName} onChange={e => setReportSigneeRightName(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                        <input type="text" placeholder="NIK / NIP (Boleh Kosong)" value={reportSigneeRightNik} onChange={e => setReportSigneeRightNik(e.target.value)} className="input-field" style={{ fontSize: '0.78rem', padding: '0.35rem 0.55rem', height: '32px', width: '100%', boxSizing: 'border-box' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Preview */}
              <div id="print-area" className="laporan-print-preview">
                
                {/* Kop Surat Resmi Klinik */}
                <div className="laporan-kop-wrap">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '0.4rem', width: '100%', maxWidth: '100%' }}>
                    <img src={settings?.logo || "/logo.png"} width="85" height="85"  
                      alt="Logo Klinik Baiturrahman" 
                      className="laporan-kop-logo"
                      style={{ width: '85px', height: 'auto', marginBottom: '4px' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <p className="laporan-kop-yayasan" style={{ fontSize: '0.85rem', fontWeight: '500', margin: '0 0 1px 0', color: '#000', textAlign: 'center', width: '100%' }}>{settings?.yayasanName || 'Yayasan Baeturrachman Garut'}</p>
                    <h1 className="laporan-kop-title" style={{ textAlign: 'center', width: '100%' }}>
                      KLINIK BAITURRAHMAN
                    </h1>
                    <p className="laporan-kop-cert" style={{ fontSize: '0.85rem', fontWeight: '600', margin: '0 0 1px 0', color: '#000', textAlign: 'center', width: '100%' }}>SERTIFIKAT STANDAR : 91203004415170002</p>
                    <p className="laporan-kop-address" style={{ fontSize: '0.78rem', margin: '0 0 1px 0', color: '#000', textAlign: 'center', wordBreak: 'break-word', width: '100%' }}>{formatKopAddress(settings)}</p>
                    <p className="laporan-kop-email" style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0, color: '#000', textAlign: 'center', wordBreak: 'break-word', width: '100%' }}>
                      Email: <span style={{ textDecoration: 'underline' }}>{settings?.email || 'klinikbaiturrahman@rocketmail.com'}</span>
                    </p>
                  </div>
                  <div style={{ borderTop: '3px solid black', marginTop: '2px', width: '100%' }}></div>
                  <div style={{ borderTop: '1px solid black', marginTop: '1px', width: '100%' }}></div>
                </div>

                {/* Judul Laporan */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                  <h2 className="laporan-doc-title">
                    LAPORAN BULANAN ADMINISTRASI
                  </h2>
                  <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: '#000', fontFamily: 'Arial, sans-serif' }}>
                    Periode Laporan: {monthName} {year}
                  </p>
                </div>

                <div className="laporan-print-body">
                  
                  {/* Summary Section */}
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.summary}. Ringkasan Aktivitas Administrasi</h3>
                    <div className="laporan-table-scroll">
                      <table className="laporan-summary-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#000' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>Kategori</th>
                            <th style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>Jumlah</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportFilters.suratMasuk && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Surat Masuk</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredIn.length}</td></tr>}
                          {reportFilters.suratKeluar && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Surat Keluar</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredOut.length}</td></tr>}
                          {reportFilters.sertifikat && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Sertifikat / Piagam</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredCerts.length}</td></tr>}
                          {reportFilters.barangMasuk && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Barang Masuk (Gudang)</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredStockIn.length}</td></tr>}
                          {reportFilters.barangKeluar && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Barang Keluar (Gudang)</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredStockOut.length}</td></tr>}
                          {reportFilters.peminjaman && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Peminjaman Aset</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredBorrow.length}</td></tr>}
                          {reportFilters.aset && <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Data Fixed Asset &amp; Inventaris</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{safeAssets.length}</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Surat Masuk Table */}
                  {reportFilters.suratMasuk && filteredIn.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.suratMasuk}. Rincian Surat Masuk</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Nomor Referensi','Tanggal','Pengirim','Perihal'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredIn.map((l, i) => (
                              <tr key={l.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.refNo || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.sender || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.subject || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Surat Keluar Table */}
                  {reportFilters.suratKeluar && filteredOut.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.suratKeluar}. Rincian Surat Keluar</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Nomor Surat','Tanggal','Penerima','Perihal'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOut.map((l, i) => (
                              <tr key={l.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.docNo || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.recipient || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.subject || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Stok Masuk Table */}
                  {reportFilters.barangMasuk && filteredStockIn.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.barangMasuk}. Rincian Barang Masuk (Gudang)</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Nomor Transaksi','Tanggal','Barang','Jumlah','Pemasok'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStockIn.map((s, i) => (
                              <tr key={s.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.id || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.itemName || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{s.qty || 0}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.supplier || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Stok Keluar Table */}
                  {reportFilters.barangKeluar && filteredStockOut.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.barangKeluar}. Rincian Barang Keluar / Distribusi</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Nomor Transaksi','Tanggal','Barang','Jumlah','Tujuan','Status'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStockOut.map((s, i) => (
                              <tr key={s.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.id || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.itemName || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{s.qty || 0}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.destination || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.status || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Peminjaman Aset Table */}
                  {reportFilters.peminjaman && filteredBorrow.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.peminjaman}. Rincian Peminjaman Aset</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Tanggal','Peminjam','Barang/Aset','Status'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBorrow.map((b, i) => (
                              <tr key={b.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{b.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{b.borrower || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{b.itemName || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{b.status || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Sertifikat Table */}
                  {reportFilters.sertifikat && filteredCerts.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.sertifikat}. Sertifikat / Piagam</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Nomor','Tanggal','Penerima','Keterangan'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCerts.map((c, i) => (
                              <tr key={c.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{c.docNo || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{c.date || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{c.recipient || '-'}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{c.notes || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Data Aset Table */}
                  {reportFilters.aset && safeAssets.length > 0 && (
                    <div>
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportLetters.aset}. Data Fixed Asset &amp; Inventaris (Kondisi Terkini)</h3>
                      <div className="laporan-table-scroll">
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', color: '#000' }}>
                          <thead>
                            <tr>
                              {['No','Kode','Nama','Jenis','Lokasi','Kondisi'].map(h => (
                                <th key={h} style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {safeAssets.map((a, i) => (
                              <tr key={a.id || i}>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{a.id}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{a.namaAset}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{a.jenisAset}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{a.lokasi}</td>
                                <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{a.kondisi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* No data message */}
                  {filteredIn.length === 0 && filteredOut.length === 0 && filteredStockIn.length === 0 && filteredStockOut.length === 0 && filteredBorrow.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>Tidak ada data transaksi pada periode {monthName} {year}</p>
                    </div>
                  )}

                  {/* Tanda Tangan Laporan */}
                  <div className="laporan-signature-scroll">
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: reportSigneeCount === 1 ? 'flex-end' : 'space-between', 
                      marginTop: '3.5rem', 
                      pageBreakInside: 'avoid', 
                      fontSize: '0.85rem', 
                      color: '#000', 
                      fontFamily: 'Arial, sans-serif' 
                    }}>
                      {reportSigneeCount >= 2 && (
                        <div style={{ textAlign: 'center', width: '200px' }}>
                          <p style={{ margin: 0 }}>Mengetahui,</p>
                          <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeLeftTitle || "\u00A0"},</p>
                          <div style={{ height: '60px' }} />
                          <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeLeftName || "\u00A0"}</p>
                          {reportSigneeLeftNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeLeftNik}</p>}
                        </div>
                      )}

                      {reportSigneeCount === 3 && (
                        <div style={{ textAlign: 'center', width: '200px' }}>
                          <p style={{ margin: 0 }}>&nbsp;</p>
                          <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeMiddleTitle || "\u00A0"},</p>
                          <div style={{ height: '60px' }} />
                          <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeMiddleName || "\u00A0"}</p>
                          {reportSigneeMiddleNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeMiddleNik}</p>}
                        </div>
                      )}

                      <div style={{ textAlign: 'center', width: '200px' }}>
                        <p style={{ margin: 0 }}>{reportDate || "\u00A0"}</p>
                        <p style={{ fontWeight: 700, margin: '2px 0 0' }}>{reportSigneeRightTitle || "\u00A0"},</p>
                        <div style={{ height: '60px' }} />
                        <p style={{ fontWeight: 700, margin: 0, textDecoration: 'underline' }}>{reportSigneeRightName || "\u00A0"}</p>
                        {reportSigneeRightNik && <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#4b5563' }}>NIK. {reportSigneeRightNik}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            );
          })()}


          {/* 11. Pengaturan Sistem */}
          {activeMenu === "settings" && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               
            <PengaturanSistem 
              settings={settings} 
              currentUser={currentUser} 
              onSave={handleSaveSettings} 
              openConfirm={openConfirm} 
              setActiveMenu={setActiveMenu}
              setAssetReportTab={setAssetReportTab}
            />
            </div>
          )}

      {/* Modals for Permintaan Keluar / Peminjaman */}
      {requestModal && requestModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>
              {requestModal.action === "edit" ? "Edit Data Permintaan" : "Detail Peminjaman"}
            </h3>
            
            {requestModal.action === "edit" ? (
              <form onSubmit={handleEditRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {requestModal.type === "out" ? (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Barang</label>
                      <input type="text" value={requestModal.data.itemName || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, itemName: e.target.value}})} required className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jumlah (Qty)</label>
                        <input type="number" min="1" value={requestModal.data.qty || 1} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, qty: parseInt(e.target.value)}})} required className="input-field" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Petugas</label>
                        <input type="text" value={requestModal.data.officer || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, officer: e.target.value}})} required className="input-field" />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tujuan/Poli</label>
                      <input type="text" value={requestModal.data.destination || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, destination: e.target.value}})} required className="input-field" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Alat/Barang</label>
                      <input type="text" value={requestModal.data.itemName || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, itemName: e.target.value}})} required className="input-field" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Peminjam</label>
                        <input type="text" value={requestModal.data.borrower || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, borrower: e.target.value}})} required className="input-field" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unit/Poli</label>
                        <input type="text" value={requestModal.data.unit || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, unit: e.target.value}})} required className="input-field" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jumlah (Qty)</label>
                        <input type="number" min="1" value={requestModal.data.qty || 1} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, qty: parseInt(e.target.value)}})} required className="input-field" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tgl Batas Kembali</label>
                        <input type="date" value={requestModal.data.dueDate || ""} onChange={e => setRequestModal({...requestModal, data: {...requestModal.data, dueDate: e.target.value}})} required className="input-field" />
                      </div>
                    </div>
                  </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setRequestModal({ isOpen: false, type: "", action: "", data: null })} style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'var(--bg-card)' }}>Batal</button>
                  <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}>Simpan</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No Transaksi</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{requestModal.data.id}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nama Alat</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{requestModal.data.itemName} ({requestModal.data.qty} Unit)</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Peminjam</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{requestModal.data.borrower} - {requestModal.data.unit}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tgl Pinjam</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{requestModal.data.date}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Batas Kembali</span>
                  <span style={{ fontWeight: 600, color: 'var(--danger)' }}>{requestModal.data.dueDate}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Keperluan</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{requestModal.data.purpose}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setRequestModal({ isOpen: false, type: "", action: "", data: null })} style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'var(--bg-card)', fontWeight: 600 }}>Tutup</button>
                  {requestModal.data?.status === "Dipinjam" && (
                    <button 
                      type="button"
                      onClick={() => {
                        handleStatusChange("borrow", requestModal.data.id, "Selesai");
                        setRequestModal({ isOpen: false, type: "", action: "", data: null });
                        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: `Peminjaman ${requestModal.data.itemName} berhasil diselesaikan!`, type: 'success' } }));
                      }} 
                      style={{ padding: '0.6rem 1.25rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: '#047857', color: '#fff', fontWeight: 600 }}
                    >
                      Tandai Selesai / Dikembalikan
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals for Editing Letters (Surat Masuk / Surat Keluar) */}
      {letterModal && letterModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '550px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>
              Edit Data {letterModal.type === "in" ? "Surat Masuk" : "Surat Keluar"}
            </h3>
            
            <form onSubmit={handleEditLetterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {letterModal.type === "in" ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nomor Surat / Ref</label>
                    <input type="text" value={letterModal.data.refNo || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, refNo: e.target.value}})} required className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Instansi Pengirim</label>
                    <input type="text" value={letterModal.data.sender || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, sender: e.target.value}})} required className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Perihal / Hal</label>
                    <input type="text" value={letterModal.data.subject || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, subject: e.target.value}})} required className="input-field" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Disposisi</label>
                      <input type="text" value={letterModal.data.disposition || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, disposition: e.target.value}})} required className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tanggal Masuk</label>
                      <input type="date" value={letterModal.data.date || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, date: e.target.value}})} required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unggah Berkas Baru (PDF/Gambar)</label>
                    <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
                            setLetterModal(prev => ({
                              ...prev,
                              data: {
                                ...prev.data,
                                fileName: file.name,
                                fileSize: `${sizeMb} MB`,
                                fileData: event.target.result
                              }
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                      className="input-field" 
                      style={{ padding: '0.4rem' }}
                    />
                    {letterModal.data.fileName && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.25rem' }}>
                        ✓ Berkas terpilih: {letterModal.data.fileName} ({letterModal.data.fileSize})
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nomor Dokumen Resmi</label>
                    <input type="text" value={letterModal.data.docNo || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, docNo: e.target.value}})} required className="input-field" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tujuan / Instansi</label>
                      <input type="text" value={letterModal.data.destination || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, destination: e.target.value}})} required className="input-field" />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Penerima</label>
                      <input type="text" value={letterModal.data.recipientName || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, recipientName: e.target.value}})} required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Perihal (Subject)</label>
                    <input type="text" value={letterModal.data.subject || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, subject: e.target.value}})} required className="input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tipe Kop Surat</label>
                    <select value={letterModal.data.kopType || "direktur"} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, kopType: e.target.value}})} required className="input-field">
                      <option value="direktur">Direktur / Laporan (Rata Tengah)</option>
                      <option value="non-direktur">Selain Direktur / Umum (Logo Kiri)</option>
                    </select>
                  </div>
                  <div style={{ border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-main)', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>Format Tanda Tangan</span>
                      <div style={{ display: 'flex', backgroundColor: 'var(--bg-card)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border)', gap: '2px' }}>
                        <button
                          type="button"
                          onClick={() => setLetterModal({ ...letterModal, data: { ...letterModal.data, signeeCount: 1, leftSignatoryTitle: "", leftSignatoryName: "" } })}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: (letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? 500 : 700,
                            backgroundColor: !(letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? 'var(--primary)' : 'transparent',
                            color: !(letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? '#fff' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          1 TTD (Kanan)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLetterModal({ ...letterModal, data: { ...letterModal.data, signeeCount: 2 } })}
                          style={{
                            padding: '0.25rem 0.6rem',
                            fontSize: '0.75rem',
                            fontWeight: (letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? 700 : 500,
                            backgroundColor: (letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? 'var(--primary)' : 'transparent',
                            color: (letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? '#fff' : 'var(--text-muted)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          2 TTD (Kiri & Kanan)
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: (letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) ? '1fr 1fr' : '1fr', gap: '1rem' }}>
                      {(letterModal.data.signeeCount === 2 || (letterModal.data.signeeCount !== 1 && (letterModal.data.leftSignatoryTitle || letterModal.data.leftSignatoryName))) && (
                        <div>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Ttd Kiri (Pihak Kedua / Pengirim)</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input type="text" placeholder="Jabatan (cth: Penanggung Jawab)" value={letterModal.data.leftSignatoryTitle || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, leftSignatoryTitle: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                            <input type="text" placeholder="Nama Penandatangan Kiri" value={letterModal.data.leftSignatoryName || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, leftSignatoryName: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                          </div>
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Ttd Kanan (Direktur / Pimpinan)</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input type="text" placeholder="Jabatan (cth: Direktur Utama)" value={letterModal.data.title || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, title: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                          <input type="text" placeholder="Nama Direktur" value={letterModal.data.signatory || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, signatory: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          id="editUseDigitalSignature"
                          checked={letterModal.data.useDigitalSignature !== false} 
                          onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, useDigitalSignature: e.target.checked}})} 
                          style={{ cursor: 'pointer' }}
                        />
                        ✍️ Pakai TTD Digital
                      </label>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          id="editUseDigitalStamp"
                          checked={letterModal.data.useDigitalStamp !== false} 
                          onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, useDigitalStamp: e.target.checked}})} 
                          style={{ cursor: 'pointer' }}
                        />
                        💮 Pakai Stempel Resmi
                      </label>
                    </div>

                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Isi Utama Surat</label>
                    <textarea value={letterModal.data.content || ""} onChange={e => setLetterModal({...letterModal, data: {...letterModal.data, content: e.target.value}})} required className="input-field" style={{ height: '120px', resize: 'vertical' }} />
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setLetterModal({ isOpen: false, type: "", action: "", data: null })} style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'var(--bg-card)' }}>Batal</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Editing Certificates */}
      {certModal && certModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '12px', width: '550px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--primary)' }}>
              Edit Sertifikat Resmi
            </h3>
            
            <form onSubmit={handleEditCertSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nomor Sertifikat</label>
                <input type="text" value={certModal.data.docNo || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, docNo: e.target.value}})} required className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nama Penerima</label>
                <input type="text" value={certModal.data.name || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, name: e.target.value}})} required className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>NIM / No Identitas</label>
                  <input type="text" value={certModal.data.identityNo || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, identityNo: e.target.value}})} required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jenis Sertifikat</label>
                  <select value={certModal.data.activityType || "Magang"} onChange={e => setCertModal({...certModal, data: {...certModal.data, activityType: e.target.value}})} required className="input-field">
                    <option value="Magang">Magang / Praktik Kerja</option>
                    <option value="Pelatihan">Pelatihan Kompetensi</option>
                    <option value="Seminar">Seminar Kesehatan</option>
                    <option value="Penghargaan">Penghargaan Khusus</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Asal Institusi / Universitas</label>
                <input type="text" value={certModal.data.institution || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, institution: e.target.value}})} required className="input-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Program Studi / Divisi</label>
                <input type="text" value={certModal.data.major || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, major: e.target.value}})} required className="input-field" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tanggal Mulai</label>
                  <input type="date" value={certModal.data.startDate || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, startDate: e.target.value}})} required className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Tanggal Selesai</label>
                  <input type="date" value={certModal.data.endDate || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, endDate: e.target.value}})} required className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Penilaian Kinerja / Predikat</label>
                <select value={certModal.data.notes || "Sangat Baik"} onChange={e => setCertModal({...certModal, data: {...certModal.data, notes: e.target.value}})} required className="input-field">
                  <option value="Sangat Memuaskan">Sangat Memuaskan (A+)</option>
                  <option value="Sangat Baik">Sangat Baik (A)</option>
                  <option value="Baik">Baik (B)</option>
                  <option value="Cukup">Cukup (C)</option>
                </select>
              </div>

              {/* Editable TTD Section for Cert Edit Modal */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', border: '1px solid var(--border-light)', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-main)', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Ttd Kiri (Bebas)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" placeholder="Jabatan (cth: Manajemen Klinik)" value={certModal.data.leftSignatoryTitle || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, leftSignatoryTitle: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                    <input type="text" placeholder="Nama Penandatangan Kiri" value={certModal.data.leftSignatoryName || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, leftSignatoryName: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem', color: 'var(--primary)' }}>Ttd Kanan (Direktur)</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" placeholder="Jabatan (cth: Direktur Utama)" value={certModal.data.title || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, title: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                    <input type="text" placeholder="Nama Direktur" value={certModal.data.signatory || ""} onChange={e => setCertModal({...certModal, data: {...certModal.data, signatory: e.target.value}})} className="input-field" style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="certModalUseSig" 
                    checked={certModal.data.useDigitalSignature !== false} 
                    onChange={e => setCertModal({...certModal, data: {...certModal.data, useDigitalSignature: e.target.checked}})} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                  />
                  ✍️ Pakai TTD Digital
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-dark)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    id="certModalUseStamp" 
                    checked={certModal.data.useDigitalStamp !== false} 
                    onChange={e => setCertModal({...certModal, data: {...certModal.data, useDigitalStamp: e.target.checked}})} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }} 
                  />
                  💮 Pakai Stempel Resmi
                </label>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setCertModal({ isOpen: false, data: null })} style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'var(--bg-card)' }}>Batal</button>
                <button type="submit" style={{ padding: '0.6rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600 }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Arsip Dokumen Digital */}
      {archiveEditModal && archiveEditModal.isOpen && archiveEditModal.data && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '560px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderArchive size={18} />
                </div>
                <h3 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '1.1rem', fontWeight: 700 }}>
                  Edit Dokumen Arsip Digital
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setArchiveEditModal({ isOpen: false, data: null })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditArchiveSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Judul Dokumen *</label>
                <input 
                  type="text" 
                  value={archiveEditModal.data.title || ""} 
                  onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, title: e.target.value } })} 
                  required 
                  className="input-field" 
                  placeholder="Contoh: SOP Pelayanan Rawat Jalan"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Nomor Referensi / Dokumen</label>
                <input 
                  type="text" 
                  value={archiveEditModal.data.docNo || ""} 
                  onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, docNo: e.target.value } })} 
                  className="input-field" 
                  placeholder="Contoh: DOC/KBR/2026/01" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Kategori Dokumen</label>
                  <select 
                    value={archiveEditModal.data.category || "Dokumen & Surat"} 
                    onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, category: e.target.value } })} 
                    required 
                    className="input-field"
                  >
                    <option value="Dokumen & Surat">Dokumen & Surat</option>
                    <option value="SOP & Regulasi">SOP & Regulasi</option>
                    <option value="Laporan Keuangan">Laporan Keuangan</option>
                    <option value="SK & Perizinan">SK & Perizinan</option>
                    <option value="Kerjasama">Kerjasama & MOU</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Hak Akses</label>
                  <select 
                    value={archiveEditModal.data.access || "Internal"} 
                    onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, access: e.target.value } })} 
                    required 
                    className="input-field"
                  >
                    <option value="Internal">Internal (Staf Klinik)</option>
                    <option value="Publik">Publik (Umum)</option>
                    <option value="Rahasia">Rahasia (Pimpinan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Tanggal Dokumen</label>
                <input 
                  type="date" 
                  value={archiveEditModal.data.date || ""} 
                  onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, date: e.target.value } })} 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Ganti / Perbarui Berkas File (Opsional)</label>
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
                        setArchiveEditModal(prev => ({
                          ...prev,
                          data: {
                            ...prev.data,
                            fileName: file.name,
                            size: `${sizeMb} MB`,
                            fileData: event.target.result
                          }
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  className="input-field" 
                  style={{ padding: '0.4rem' }}
                />
                {archiveEditModal.data.fileName && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <File size={13} />
                    <span>Berkas aktif: {archiveEditModal.data.fileName} ({archiveEditModal.data.size || '1.2 MB'})</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-dark)' }}>Catatan Tambahan</label>
                <textarea 
                  value={archiveEditModal.data.notes || ""} 
                  onChange={e => setArchiveEditModal({ ...archiveEditModal, data: { ...archiveEditModal.data, notes: e.target.value } })} 
                  className="input-field" 
                  style={{ height: '70px', resize: 'vertical' }} 
                  placeholder="Catatan singkat dokumen..." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setArchiveEditModal({ isOpen: false, data: null })} 
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'var(--bg-card)', fontWeight: 600 }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={16} /> Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      </main>

      {/* Custom Confirm Modal */}
      {confirmDialog.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', width: '400px', maxWidth: '90%', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <AlertCircle size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-dark)', fontSize: '1.25rem' }}>Konfirmasi</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{confirmDialog.message}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, isOpen: false }); }} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Surat Masuk (Saat tidak ada berkas atau saat ingin melihat rincian surat) */}
      {selectedIncomingDetail && (
        <div 
          className="modal-overlay no-print" 
          style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
          onClick={() => setSelectedIncomingDetail(null)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '14px', 
              width: '540px', 
              maxWidth: '95vw', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)', 
              border: '1px solid var(--border-light)', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Inbox size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Detail Surat Masuk</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Informasi lengkap arsip surat masuk</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedIncomingDetail(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Nomor Surat</span>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--primary)' }}>{selectedIncomingDetail.refNo}</strong>
                </div>
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Tanggal Masuk</span>
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-dark)' }}>{selectedIncomingDetail.date || '-'}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Instansi / Asal Pengirim</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-dark)', fontWeight: 600, fontSize: '0.88rem' }}>
                  <User size={14} style={{ color: 'var(--primary)' }} />
                  {selectedIncomingDetail.sender}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Perihal Surat</span>
                <div style={{ color: 'var(--text-dark)', fontSize: '0.88rem', lineHeight: '1.4' }}>
                  {selectedIncomingDetail.subject}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Tujuan Disposisi</span>
                <span style={{ display: 'inline-block', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>
                  {selectedIncomingDetail.disposition}
                </span>
              </div>

              <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileText size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedIncomingDetail.fileName ? selectedIncomingDetail.fileName : 'Belum ada berkas terlampir'}
                  </span>
                </div>
                {selectedIncomingDetail.fileName && (
                  <button 
                    type="button" 
                    onClick={() => {
                      const doc = selectedIncomingDetail;
                      setSelectedIncomingDetail(null);
                      handleViewIncomingLetterFile(doc);
                    }}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Lihat Berkas
                  </button>
                )}
              </div>
            </div>

            <div style={{ padding: '0.85rem 1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'var(--bg-main)' }}>
              <button 
                type="button" 
                onClick={() => {
                  const doc = selectedIncomingDetail;
                  setSelectedIncomingDetail(null);
                  setLetterModal({ isOpen: true, type: "in", action: "edit", data: doc });
                }}
                style={{ padding: '0.45rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Edit3 size={13} /> Edit / Unggah Berkas
              </button>
              <button 
                type="button" 
                onClick={() => setSelectedIncomingDetail(null)}
                style={{ padding: '0.45rem 1.2rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Dokumen (Document Viewer) */}
      {docViewerModal.isOpen && (() => {
        const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
        let viewerIframeSrc = docViewerModal.blobUrl;
        if (isMobileDevice && docViewerModal.blobUrl && !docViewerModal.blobUrl.startsWith('blob:') && !docViewerModal.blobUrl.startsWith('data:')) {
          const absoluteUrl = docViewerModal.blobUrl.startsWith('http') ? docViewerModal.blobUrl : (window.location.origin + docViewerModal.blobUrl);
          viewerIframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`;
        }

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '0.5rem' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '14px', width: '100%', maxWidth: '1050px', height: '94vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
              {/* Modal Header (Responsive Desktop & Mobile) */}
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={18} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{docViewerModal.title}</h3>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{docViewerModal.fileName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (docViewerModal.blobUrl && docViewerModal.blobUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(docViewerModal.blobUrl);
                      }
                      setDocViewerModal({ isOpen: false, title: "", fileName: "", blobUrl: null, dataUrl: null });
                    }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                    title="Tutup"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Header Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (docViewerModal.dataUrl) {
                        viewFileBlob(docViewerModal.dataUrl, docViewerModal.fileName);
                      } else if (docViewerModal.blobUrl) {
                        window.open(docViewerModal.blobUrl, '_blank');
                      }
                    }}
                    title="Buka di Tab Baru"
                    style={{ flex: isMobileDevice ? '1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.45rem 0.8rem', borderRadius: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-main)', color: 'var(--text-dark)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    <ExternalLink size={13} /> Buka di Tab Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (docViewerModal.dataUrl && docViewerModal.dataUrl.startsWith('data:')) {
                        downloadFileBlob(docViewerModal.dataUrl, docViewerModal.fileName);
                      } else if (docViewerModal.blobUrl) {
                        const link = document.createElement('a');
                        link.href = docViewerModal.blobUrl;
                        link.download = docViewerModal.fileName || 'Dokumen.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }
                    }}
                    title="Unduh Berkas"
                    style={{ flex: isMobileDevice ? '1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.45rem 0.8rem', borderRadius: '6px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                  >
                    <Download size={13} /> Unduh
                  </button>
                </div>
              </div>

              {/* Modal Body: Document frame */}
              <div style={{ flex: 1, backgroundColor: '#f1f5f9', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {viewerIframeSrc ? (
                  <iframe
                    src={viewerIframeSrc}
                    title={docViewerModal.title}
                    style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#fff' }}
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                    <FileText size={48} style={{ opacity: 0.5, margin: '0 auto 0.5rem' }} />
                    <p style={{ margin: '0.5rem 0', fontWeight: 600 }}>Memuat dokumen...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Global Toast Notification */}
      {toast.show && (
        <div className="app-toast-popup" style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          backgroundColor: toast.type === 'error' ? 'var(--danger)' : '#10b981', // green for success
          color: '#fff',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          zIndex: 99999,
          fontWeight: 600,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          {toast.message}
        </div>
      )}

      {/* Quick Selector Popover for Surat */}
      {showSuratNavPopup && (
        <>
          {/* Backdrop click to dismiss */}
          <div 
            onClick={() => setShowSuratNavPopup(false)} 
            style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(2px)' }} 
          />
          
          <div style={{
            position: 'fixed',
            bottom: 'calc(68px + env(safe-area-inset-bottom, 16px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '340px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px',
            padding: '0.85rem',
            boxShadow: '0 16px 40px rgba(0,0,0,0.22), 0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid var(--border-light)',
            zIndex: 1002,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '0.2rem 0.4rem 0.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'Outfit, sans-serif' }}>
                Pilih Menu Persuratan
              </span>
              <button 
                type="button"
                onClick={() => setShowSuratNavPopup(false)}
                style={{ background: 'none', border: 'none', padding: '3px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Option 1: Surat Masuk */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("letters_in");
                setShowSuratNavPopup(false);
                setIsMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '14px',
                border: activeMenu === 'letters_in' ? '1.5px solid #059669' : '1px solid var(--border-light)',
                backgroundColor: activeMenu === 'letters_in' ? 'rgba(16, 185, 129, 0.12)' : 'var(--bg-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#e6f4ea',
                color: '#0d5c3a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Inbox size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Surat Masuk
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Kelola, catat & arsip surat masuk
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '20px',
                backgroundColor: activeMenu === 'letters_in' ? '#059669' : 'rgba(0,0,0,0.06)',
                color: activeMenu === 'letters_in' ? '#ffffff' : 'var(--text-dark)'
              }}>
                {incomingLetters.length}
              </span>
            </button>

            {/* Option 2: Surat Keluar */}
            <button
              type="button"
              onClick={() => {
                setActiveMenu("letters_out");
                setShowSuratNavPopup(false);
                setIsMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.75rem 0.85rem',
                borderRadius: '14px',
                border: activeMenu === 'letters_out' ? '1.5px solid #0284c7' : '1px solid var(--border-light)',
                backgroundColor: activeMenu === 'letters_out' ? 'rgba(2, 132, 199, 0.12)' : 'var(--bg-main)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Send size={19} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Surat Keluar
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Buat nomor, template & cetak surat
                </div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '20px',
                backgroundColor: activeMenu === 'letters_out' ? '#0284c7' : 'rgba(0,0,0,0.06)',
                color: activeMenu === 'letters_out' ? '#ffffff' : 'var(--text-dark)'
              }}>
                {outgoingLetters.length}
              </span>
            </button>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation Bar (Sidebar transforms to icons at bottom on mobile) */}
      <nav className="mobile-bottom-nav" aria-label="Navigasi Bawah">
        <button
          type="button"
          onClick={() => { setActiveMenu("dashboard"); setShowSuratNavPopup(false); setIsMobileMenuOpen(false); }}
          className={`mobile-bottom-nav-item ${activeMenu === "dashboard" ? "active" : ""}`}
        >
          <div className="mobile-bottom-nav-icon">
            <Home size={20} />
          </div>
          <span className="mobile-bottom-nav-label">Beranda</span>
        </button>

        <button
          type="button"
          onClick={() => { 
            setShowSuratNavPopup(!showSuratNavPopup);
          }}
          className={`mobile-bottom-nav-item ${['letters_in', 'letters_out'].includes(activeMenu) || showSuratNavPopup ? "active" : ""}`}
        >
          <div className="mobile-bottom-nav-icon">
            <Mail size={20} />
          </div>
          <span className="mobile-bottom-nav-label">
            {activeMenu === 'letters_out' ? 'S. Keluar' : activeMenu === 'letters_in' ? 'S. Masuk' : 'Surat'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMenu("certificates"); setShowSuratNavPopup(false); setIsMobileMenuOpen(false); }}
          className={`mobile-bottom-nav-item ${activeMenu === "certificates" ? "active" : ""}`}
        >
          <div className="mobile-bottom-nav-icon">
            <Award size={20} />
          </div>
          <span className="mobile-bottom-nav-label">Sertifikat</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveMenu("archive"); setShowSuratNavPopup(false); setIsMobileMenuOpen(false); }}
          className={`mobile-bottom-nav-item ${activeMenu === "archive" ? "active" : ""}`}
        >
          <div className="mobile-bottom-nav-icon">
            <Folder size={20} />
          </div>
          <span className="mobile-bottom-nav-label">Arsip</span>
        </button>

        <button
          type="button"
          onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setShowSuratNavPopup(false); }}
          className={`mobile-bottom-nav-item ${isMobileMenuOpen || ['reports', 'report_letters', 'report_assets', 'settings'].includes(activeMenu) ? "active" : ""}`}
        >
          <div className="mobile-bottom-nav-icon">
            <Menu size={20} />
          </div>
          <span className="mobile-bottom-nav-label">Menu</span>
        </button>
      </nav>

    </div>
  );
}


