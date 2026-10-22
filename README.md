# 🏥 MEDIKARA
### Sistem Informasi Administrasi & Manajemen Aset Klinik

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

---

**MEDIKARA** adalah aplikasi sistem informasi terpadu berbasis web yang dirancang khusus untuk mempermudah tata kelola administrasi surat-menyurat, inventaris gudang, serta siklus hidup aset dan sarana prasarana klinik.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Database](#-arsitektur--database)
- [Teknologi](#-teknologi)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Perintah yang Tersedia](#-perintah-yang-tersedia)
- [Struktur Proyek](#-struktur-proyek)

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| 📊 **Dashboard** | Statistik analitik, ringkasan operasional klinik, dan pencarian cepat |
| 📬 **Surat Masuk & Keluar** | Pengarsipan nomor surat otomatis, disposisi, dan surat dinas klinik |
| 📜 **Sertifikat & Arsip Digital** | Pembuatan nomor sertifikat medis dan manajemen berkas arsip terpusat |
| 📦 **Inventaris Gudang** | Kontrol stok obat/alkes, pencatatan Barang Masuk (BM) & Barang Keluar (BK) |
| 🏷️ **Data Aset & Inventaris** | Pelacakan aset fisik klinik, kondisi barang, nilai, dan QR Code aset |
| 🔄 **Relokasi Aset** | Mutasi atau perpindahan inventaris antar ruangan / unit kerja |
| 🛒 **Peminjaman & Permintaan** | Alur peminjaman alat serta permintaan barang pakai habis |
| 📋 **Laporan & Rekapitulasi** | Ekspor laporan berkala, cetak label, dan konversi ke PDF siap cetak |
| ⚙️ **Pengaturan Sistem** | Konfigurasi kop surat, format penomoran dokumen, dan manajemen akun staf |

---

## 🗄️ Arsitektur & Database

MEDIKARA menggunakan pendekatan **Hybrid Resilient Storage** (Offline-First dengan sinkronisasi Cloud):

```
┌────────────────────────────────────────────────────────┐
│                   Aplikasi Frontend                    │
│            (React 19 + LocalStorage Cache)             │
└───────────────────────────┬────────────────────────────┘
                            │
               Sinkronisasi REST API (Express)
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  🐘 PostgreSQL (Utama)  │     │ 📁 Local JSON (Fallback)│
│  (Neon DB / Supabase)   │     │      server/data/       │
│  Koneksi via pg pool    │     │  Aktif saat DB offline  │
└─────────────────────────┘     └─────────────────────────┘
```

1. **PostgreSQL (Database Utama)**
   - Menggunakan library `pg` (node-postgres) yang terhubung ke server PostgreSQL (didukung oleh **Neon Database**, **Supabase**, atau instance lokal).
   - Seluruh data transaksi, aset, dan surat disimpan dalam tabel persisten di cloud.
2. **Local JSON Fallback (`server/data/`)**
   - Jika `DATABASE_URL` belum diisi atau koneksi PostgreSQL terputus, backend Express secara otomatis mengalihkan penyimpanan ke file JSON lokal agar sistem tetap beroperasi tanpa henti.
3. **Browser LocalStorage (Offline-First Cache)**
   - Frontend menyimpan cache lokal di peramban untuk respon instan tanpa jeda loading.
74:    - Dilengkapi pendeteksi status jaringan (`online/offline` event listener) dan auto-sync antrean perubahan (`__dirty_keys`).
75: 
76: ---
77: 
78: ## 🛠️ Teknologi
79: 
80: ### Frontend
81: - **React 19** & **Vite 6** — Framework UI modern dan build tool kilat
82: - **Recharts** — Grafik visualisasi tren stok dan surat
83: - **jsPDF + AutoTable** & **html2canvas** — Generator berkas PDF dan cetak dokumen
84: - **react-qr-code** — Pembuat kode QR unik untuk pelabelan aset
85: - **Lucide React** — Set ikon antarmuka medis dan administrasi
86: - **canvas-confetti** — Feedback animasi interaktif
87: 
88: ### Backend & Penyimpanan
89: - **Express 5** — Backend API RESTful
90: - **PostgreSQL (`pg`)** — Database relasional utama
91: - **Node.js Local File Storage** — Cadangan penyimpanan data JSON lokal
92: 
93: ### Quality & Testing
94: - **Vitest** — Unit & integration test
95: - **@testing-library/react** — Pengujian komponen
96: - **Oxlint** — Linter kode berkinerja tinggi
97: 
98: ---
99: 
100: ## 📌 Persyaratan Sistem
101: 
102: - **Node.js** versi 18 atau lebih baru
103: - **npm** versi 9 atau lebih baru
104: - Akun **PostgreSQL** (opsional, disarankan [Neon](https://neon.tech) atau [Supabase](https://supabase.com) untuk cloud)

---

## 🚀 Instalasi & Menjalankan Lokal

### 1. Clone Repositori

```bash
git clone https://github.com/aisenamarlina/MEDIKARA.git
cd MEDIKARA
```

### 2. Pasang Dependensi

```bash
npm install
```

### 3. Buat File Konfigurasi `.env`

Salin template konfigurasi:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Buka file `.env` dan sesuaikan nilainya:

```env
# Database PostgreSQL Utama (Neon / Supabase / Localhost)
DATABASE_URL=postgresql://user:password@host:port/database_name?sslmode=require
```

> 💡 **Tip:** Jika `DATABASE_URL` belum diisi, backend otomatis menggunakan penyimpanan file JSON di folder `server/data/` sehingga aplikasi langsung bisa dijalankan tanpa setup database eksternal.

### 4. Migrasi Data (Opsional)

Jika ingin memindahkan data awal ke PostgreSQL:

```bash
npm run migrate:pg
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Perintah di atas akan menjalankan **backend Express (port 3001)** dan **frontend Vite (port 5173)** secara bersamaan.
Buka peramban di: **`http://localhost:5173`**

---

## 📟 Perintah yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan backend server dan frontend Vite bersamaan |
| `npm run server` | Menjalankan backend API Express saja |
| `npm run client` | Menjalankan frontend Vite saja |
| `npm run build` | Membuat paket produksi di direktori `dist/` |
| `npm run preview` | Menjalankan pratinjau hasil build produksi secara lokal |
| `npm run lint` | Menjalankan pengecekan kode dengan Oxlint |
| `npm test` | Menjalankan seluruh pengujian (test suite) dengan Vitest |
| `npm run test:watch` | Menjalankan test dalam mode pantau aktif (watch mode) |
| `npm run migrate:pg` | Migrasi schema dan seed data awal ke PostgreSQL |
| `npm run deploy` | Melakukan build dan deploy ke Vercel |

---

## 📁 Struktur Proyek

```
MEDIKARA/
├── api/                  # Konfigurasi handler API serverless (Vercel)
├── public/               # File statis publik (logo, favicon)
├── scripts/              # Utilitas & skrip migrasi data
│   ├── auto-push.ps1     # Skrip sinkronisasi otomatis ke GitHub
│   ├── migrate.js        # Utilitas migrasi data lokal
│   └── migrate-postgres.js # Skrip inisialisasi tabel PostgreSQL
├── server/               # Backend Express
│   ├── data/             # Direktori penyimpanan JSON (fallback offline)
│   ├── index.js          # Router Express & endpoint API
│   └── postgres.js       # Pengelola koneksi pool & kueri PostgreSQL
├── src/                  # Kode sumber aplikasi React
│   ├── assets/           # Berkas gambar dan ikon lokal
│   ├── pages/            # Komponen halaman aplikasi
│   ├── db.js             # Data Access Object (DAO) & sinkronisasi multi-storage
│   ├── firebase.js       # Inisialisasi Firebase Auth & RTDB
│   ├── defaultData.js    # Data default sistem klinik
│   ├── App.jsx           # Komponen root navigasi dan layout
│   └── main.jsx          # Entry point React Vite
├── .env.example          # Templat variabel lingkungan
├── package.json
├── vercel.json           # Konfigurasi deployment hosting Vercel
└── vite.config.js        # Konfigurasi bundling Vite
```

---

## 🎓 Informasi Proyek

Proyek ini dikembangkan sebagai bagian dari **Proyek Kerja Praktik** pada Klinik Baiturrahman.

---

<p align="center">
  Dibuat dengan ❤️ oleh <b>Ai Sena</b> dan <b>Allisa</b>
</p>

