# 🏥 MEDIKARA
### Sistem Informasi Administrasi & Manajemen Aset Klinik

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

---

**MEDIKARA** adalah aplikasi informasi berbasis web yang dirancang untuk membantu pengelolaan administrasi, persediaan, dan aset klinik secara terpadu. Aplikasi ini menyediakan dashboard interaktif dan fitur pencatatan yang terintegrasi dalam satu antarmuka yang mudah digunakan.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Persyaratan](#-persyaratan)
- [Instalasi & Menjalankan Lokal](#-instalasi--menjalankan-lokal)
- [Perintah yang Tersedia](#-perintah-yang-tersedia)
- [Konfigurasi](#-konfigurasi)
- [Struktur Proyek](#-struktur-proyek)

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|---|---|
| 📊 **Dashboard** | Ringkasan data, statistik, dan pencarian informasi secara cepat |
| 📬 **Surat Masuk & Keluar** | Pengelolaan dan pencatatan surat secara digital |
| 📜 **Sertifikat & Arsip** | Manajemen sertifikat dan arsip dokumen digital |
| 📦 **Inventaris Gudang** | Pencatatan barang masuk dan barang keluar gudang |
| 🏷️ **Data Aset & Inventaris** | Pengelolaan aset lengkap beserta detail dan riwayatnya |
| 🔄 **Relokasi Aset** | Pencatatan perpindahan atau relokasi aset antar ruangan/unit |
| 📋 **Laporan Aset** | Laporan aset lengkap yang dapat dicetak dan diekspor |
| 🛒 **Permintaan Barang** | Pengajuan permintaan barang keluar dan peminjaman inventaris |
| 📈 **Laporan Bulanan** | Rekap laporan bulanan operasional klinik |
| ⚙️ **Pengaturan Sistem** | Konfigurasi dan pengaturan aplikasi |
| 🖨️ **Ekspor & Cetak** | Ekspor laporan ke PDF dan pencetakan langsung |

---

## 🛠️ Teknologi

### Frontend
- **React 19** — Library UI modern berbasis komponen
- **Vite 6** — Build tool cepat untuk pengembangan web
- **Recharts** — Visualisasi grafik dan chart interaktif
- **jsPDF + AutoTable** — Ekspor laporan ke format PDF
- **html2canvas** — Konversi konten HTML ke gambar
- **react-qr-code** — Generasi QR Code untuk aset
- **Lucide React** — Ikon modern dan konsisten
- **canvas-confetti** — Animasi konfeti interaktif

### Backend
- **Express 5** — Framework server Node.js
- **Firebase Realtime Database** — Penyimpanan data real-time berbasis cloud
- **Firebase Authentication** — Autentikasi pengguna
- **PostgreSQL** *(opsional)* — Database relasional untuk penyimpanan lokal

### Testing & Tooling
- **Vitest** — Framework pengujian unit
- **@testing-library/react** — Pengujian komponen React
- **Oxlint** — Linter JavaScript/TypeScript yang cepat

---

## 📌 Persyaratan

- **Node.js** versi 18 ke atas
- **npm** versi 9 ke atas
- **PostgreSQL** *(opsional, hanya jika ingin menggunakan database relasional)*
- Akun **Firebase** untuk penyimpanan cloud dan autentikasi

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

### 3. Buat File `.env`

Salin file contoh konfigurasi:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Kemudian edit file `.env` dan isi variabel yang diperlukan:

```env
# PostgreSQL (opsional — kosongkan jika tidak digunakan)
DATABASE_URL=postgresql://user:password@host:port/database_name?sslmode=require

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
```

> **Catatan:** Tanpa `DATABASE_URL`, server akan menggunakan penyimpanan lokal berbasis file JSON di folder `server/data`.

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Perintah ini menjalankan server API Express dan Vite secara bersamaan.
Buka browser dan akses: **`http://localhost:5173`**

---

## 📟 Perintah yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server API + aplikasi web (mode pengembangan) |
| `npm run server` | Menjalankan server API Express saja |
| `npm run client` | Menjalankan aplikasi web Vite saja |
| `npm run build` | Membuat build produksi di folder `dist` |
| `npm run preview` | Meninjau hasil build produksi secara lokal |
| `npm run lint` | Menjalankan Oxlint untuk memeriksa kualitas kode |
| `npm test` | Menjalankan seluruh unit test sekali |
| `npm run test:watch` | Menjalankan test dalam mode watch (auto re-run) |
| `npm run migrate` | Menjalankan skrip migrasi data JSON |
| `npm run migrate:pg` | Menjalankan skrip migrasi ke PostgreSQL |
| `npm run deploy` | Build produksi dan deploy ke Vercel |

---

## ⚙️ Konfigurasi

### Database

Server membaca variabel `DATABASE_URL` atau `POSTGRES_URL` dari file `.env`.

- **Dengan PostgreSQL:** Isi `DATABASE_URL` dengan URL koneksi yang valid.
- **Tanpa PostgreSQL:** Server otomatis menggunakan file JSON di `server/data/` sebagai penyimpanan lokal.

### Firebase

Variabel lingkungan Firebase harus diawali dengan `VITE_` agar dapat diakses oleh Vite di sisi frontend:

| Variabel | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key aplikasi Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain autentikasi Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID proyek Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket Firebase Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase Cloud Messaging |
| `VITE_FIREBASE_APP_ID` | App ID Firebase |
| `VITE_FIREBASE_DATABASE_URL` | URL Realtime Database Firebase |

> ⚠️ **Jangan pernah** menyertakan file `.env` atau kredensial pribadi ke dalam repositori.

---

## 📁 Struktur Proyek

```
MEDIKARA/
├── api/                  # Konfigurasi API (Vercel serverless)
├── public/               # Aset statis publik
├── scripts/              # Skrip migrasi data
│   ├── migrate.js
│   └── migrate-postgres.js
├── server/               # Backend Express
│   ├── index.js          # Entry point server
│   └── data/             # Penyimpanan data lokal (JSON)
├── src/                  # Kode sumber frontend
│   ├── assets/           # Gambar dan aset lokal
│   ├── pages/            # Halaman aplikasi
│   │   ├── DataAsetInventaris.jsx
│   │   ├── InventarisGudang.jsx
│   │   ├── LaporanAset.jsx
│   │   ├── MasterAset.jsx
│   │   ├── PengaturanSistem.jsx
│   │   ├── RelokasiAset.jsx
│   │   └── SuratKeluar.jsx
│   ├── utils/            # Fungsi utilitas
│   ├── App.jsx           # Komponen utama aplikasi
│   ├── db.js             # Konfigurasi dan query database
│   ├── firebase.js       # Konfigurasi Firebase
│   ├── defaultData.js    # Data default aplikasi
│   └── main.jsx          # Entry point React
├── .env.example          # Contoh konfigurasi environment
├── .gitignore
├── index.html
├── package.json
├── vercel.json           # Konfigurasi deployment Vercel
└── vite.config.js        # Konfigurasi Vite
```

---

## 🎓 Informasi Proyek

Proyek ini dikembangkan sebagai bagian dari **Proyek Kerja Praktik**.

---

<p align="center">
  Dibuat oleh Ai Sena dan Allisa
</p>

