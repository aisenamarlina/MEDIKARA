export const defaultDirectorSignature = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 90" width="240" height="90"><path d="M25 60 C35 30, 45 15, 60 20 C75 25, 70 65, 80 55 C90 45, 110 35, 130 50 C145 60, 160 30, 180 40 C200 50, 215 35, 225 45 M45 40 Q90 35 170 30 M50 65 Q110 55 210 50 M140 30 C150 15, 175 10, 185 30 C195 50, 165 75, 180 75 C195 75, 215 60, 230 40" fill="none" stroke="%231e3a8a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const defaultClinicStamp = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="54" fill="none" stroke="%232563eb" stroke-width="2.8" opacity="0.85"/><circle cx="60" cy="60" r="48" fill="none" stroke="%232563eb" stroke-width="1.2" opacity="0.85"/><path id="topCurve" d="M 18,60 A 42,42 0 0,1 102,60" fill="none"/><text fill="%232563eb" font-family="Arial,sans-serif" font-size="8" font-weight="bold" letter-spacing="1.2" opacity="0.9"><textPath href="%23topCurve" startOffset="50%" text-anchor="middle">KLINIK BAITURRAHMAN</textPath></text><path id="botCurve" d="M 102,60 A 42,42 0 0,1 18,60" fill="none"/><text fill="%232563eb" font-family="Arial,sans-serif" font-size="8" font-weight="bold" letter-spacing="2" opacity="0.9"><textPath href="%23botCurve" startOffset="50%" text-anchor="middle">★ GARUT ★</textPath></text><circle cx="60" cy="60" r="26" fill="none" stroke="%232563eb" stroke-width="1" opacity="0.85"/><path d="M48 60 L72 60 M60 48 L60 72" stroke="%232563eb" stroke-width="3" stroke-linecap="round" opacity="0.9"/></svg>`;

export const defaultSettings = {
  clinicName: "KLINIK BAITURRAHMAN GARUT",
  logo: "/logo.png",
  signature: defaultDirectorSignature,
  stamp: defaultClinicStamp,
  address: "Jl. Merdeka No. 217 Tarogong Kidul - Garut",
  phone: "Telp. 0262-234754, HP. 0813-2124-3303",
  email: "klinikbaiturrahman@rocketmail.com",
  website: "",
  nib: "91203004416170002",
  directorName: "Dr. H. Ahmad Fauzi, M.Kes",
  directorTitle: "Direktur Utama",
  city: "Garut",
  numFormatLetter: "{NO}/KBR/ADM/{BULAN_ROMAWI}/{TAHUN}",
  numFormatCert: "{NO}/SERT/KBR/{BULAN_ROMAWI}/{TAHUN}",
  numFormatIn: "BM-{NO}/{BULAN_ROMAWI}/{TAHUN}",
  numFormatOut: "BK-{NO}/{BULAN_ROMAWI}/{TAHUN}",
  numFormatBorrow: "PMJ-{NO}/{BULAN_ROMAWI}/{TAHUN}"
};

export const defaultSequences = {
  letter: 25,
  cert: 10,
  stock_in: 12,
  stock_out: 4,
  borrow: 3
};

export const defaultOutgoingLetters = [
  {
    id: "SU-1787714124400",
    docNo: "025/SKep/01-10.0/VIII/K-BTR/2026",
    date: "2026-08-26",
    templateType: "Surat Keputusan",
    typeCode: "SKep",
    unitCode: "01-10.0",
    destination: "Seluruh Unit Pelayanan",
    recipientName: "Kepala Instalasi Rawat Jalan",
    subject: "Keputusan Direktur Tentang Standar Pelayanan Rawat Jalan",
    content: "Menimbang:\na. Bahwa untuk kelancaran pelayanan, diperlukan pengangkatan pegawai yang memenuhi syarat.\nb. Bahwa yang bersangkutan telah memenuhi persyaratan yang ditetapkan.\n\nMengingat:\n1. UU No. 36 Tahun 2009 tentang Kesehatan.\n2. Permenkes No. 9 Tahun 2014 tentang Klinik.\n\nMEMUTUSKAN\nMenetapkan:\nKESATU: Mengangkat tim implementasi standar pelayanan rawat jalan terpadu.\nKEDUA: Segala biaya dibebankan pada anggaran Klinik Baiturrahman.\nKETIGA: Keputusan ini berlaku sejak tanggal ditetapkan.",
    skData: {
      judulSK: "KEBIJAKAN STANDAR PELAYANAN RAWAT JALAN KLINIK BAITURRAHMAN",
      noSK: "025/SKep/01-10.0/VIII/K-BTR/2026",
      menimbang: [
        "dalam rangka meningkatkan mutu pelayanan kesehatan kepada masyarakat di Klinik Baiturrahman perlunya ditetapkan standar pelayanan rawat jalan yang komprehensif",
        "bahwa berdasarkan pertimbangan sebagaimana dimaksud dalam huruf a, perlu menetapkan Keputusan Direktur Klinik Baiturrahman"
      ],
      mengingat: [
        "Undang-Undang Republik Indonesia Nomor 17 Tahun 2023 tentang Kesehatan",
        "Peraturan Menteri Kesehatan Nomor 14 Tahun 2021 tentang Standar Kegiatan Usaha dan Produk pada Penyelenggaraan Perizinan Berusaha Berbasis Risiko Sektor Kesehatan"
      ],
      menetapkan: "Kebijakan Standar Pelayanan Rawat Jalan di Lingkungan Klinik Baiturrahman",
      diktum: [
        "Memberlakukan Standar Pelayanan Rawat Jalan di lingkungan Klinik Baiturrahman sebagaimana tercantum dalam Lampiran yang merupakan bagian tidak terpisahkan dari Keputusan ini",
        "Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila dikemudian hari terdapat kekeliruan akan diadakan perbaikan sebagaimana mestinya"
      ],
      ditetapkanDi: "Garut",
      tanggalSK: "2026-08-26",
      namaDirektur: "dr. H. Asep Maryaman",
      nikDirektur: "1.21.1",
      gunakanLampiran: true,
      lampiran: [
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
          title: "BAB II\nSTANDAR DAN PROSEDUR PELAYANAN",
          items: [
            { title: "Alur Pelayanan Pasien Rawat Jalan", content: "" },
            { title: "Standar Waktu Tunggu dan Pelayanan", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [
            {
              id: "tbl-sample-1",
              title: "Tabel 1.1 Standar Waktu dan Penanggung Jawab Pelayanan",
              headers: ["No", "Tahapan Pelayanan", "Standar Waktu", "Penanggung Jawab"],
              rows: [
                ["1", "Pendaftaran & Rekam Medis", "≤ 10 Menit", "Petugas Loket / Rekam Medis"],
                ["2", "Pemeriksaan Tanda Vital & Triase", "≤ 5 Menit", "Perawat / Bidan"],
                ["3", "Pemeriksaan & Konsultasi Dokter", "10 - 15 Menit", "Dokter Penanggung Jawab Pelayanan (DPJP)"],
                ["4", "Pelayanan Farmasi / Obat Jadi", "≤ 15 Menit", "Asisten Apoteker / Petugas Farmasi"]
              ]
            }
          ],
          images: []
        },
        {
          title: "BAB III\nPEMANTAUAN DAN EVALUASI MUTU",
          items: [
            { title: "Indikator Mutu Pelayanan", content: "" },
            { title: "Pelaporan Insiden Keselamatan Pasien", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [],
          images: []
        },
        {
          title: "BAB IV\nPENUTUP",
          items: [
            { title: "Ketentuan Penutup", content: "" },
            { title: "Ketentuan Peralihan", content: "" },
            { title: "Dst........", content: "" }
          ],
          tables: [],
          images: []
        }
      ]
    },
    signatory: "Dr. H. Ahmad Fauzi, M.Kes",
    title: "Direktur Utama",
    attachments: "1 Berkas SOP",
    status: "Selesai"
  },
  {
    id: "SU-1787714124401",
    docNo: "024/Und/02-11.0/VIII/K-BTR/2026",
    date: "2026-08-20",
    templateType: "Surat Undangan",
    typeCode: "Und",
    unitCode: "02-11.0",
    destination: "Internal Klinik Baiturrahman",
    recipientName: "Seluruh Kepala Ruangan dan Asisten Manager",
    subject: "Undangan Rapat Evaluasi Bulanan & Manajemen Mutu",
    content: "Dengan hormat,\nDengan ini mengundang Bapak/Ibu untuk hadir pada:\nHari/Tanggal: Senin, 25 Agustus 2026\nWaktu: 09.00 WIB s.d. Selesai\nTempat: Ruang Rapat Klinik Baiturrahman\nAgenda: Evaluasi Kinerja Bulanan & Persiapan Akreditasi Klinik\n\nAtas perhatian dan kehadirannya kami ucapkan terima kasih.",
    signatory: "Dr. H. Ahmad Fauzi, M.Kes",
    title: "Direktur Utama",
    attachments: "-",
    status: "Selesai"
  }
];

export const defaultCertificates = [
  {
    id: "CERT-1787741251221",
    docNo: "010/SERT/KBR/VIII/2026",
    name: "Ai Sena Marlina",
    identityNo: "2307017",
    institution: "Institut Teknologi Garut",
    major: "Sistem Informasi",
    activityType: "Magang / Praktik Kerja",
    startDate: "2026-08-18",
    endDate: "2026-09-18",
    notes: "Sangat Baik",
    customBody: "Yang bertanda tangan di bawah ini, Direktur Klinik Baiturrahman, dengan ini menerangkan bahwa yang bersangkutan telah selesai melaksanakan kegiatan Magang / Praktik Kerja di lingkungan Klinik Baiturrahman, terhitung mulai tanggal 18 Agustus 2026 sampai dengan tanggal 18 September 2026. Selama melaksanakan kegiatan tersebut, yang bersangkutan telah menunjukkan kinerja dan dedikasi dengan predikat Sangat Baik.\n\nSertifikat ini diberikan sebagai bentuk penghargaan atas partisipasi aktif dan kontribusi positif yang bersangkutan selama mengikuti kegiatan di Klinik Baiturrahman.\n\nDemikian sertifikat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.",
    signatory: "Dr. H. Ahmad Fauzi, M.Kes",
    title: "Direktur Utama",
    leftSignatoryName: "",
    leftSignatoryTitle: ""
  },
  {
    id: "CERT-1787741251222",
    docNo: "009/SERT/KBR/VII/2026",
    name: "Rizky Ramdani",
    identityNo: "2307025",
    institution: "Universitas Garut",
    major: "Farmasi Klinis",
    activityType: "Praktik Kerja Lapangan",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    notes: "Sangat Baik",
    customBody: "Yang bertanda tangan di bawah ini, Direktur Klinik Baiturrahman, dengan ini menerangkan bahwa yang bersangkutan telah selesai melaksanakan kegiatan Praktik Kerja Lapangan (PKL) Farmasi di Klinik Baiturrahman dengan predikat Sangat Baik.\n\nDemikian sertifikat ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.",
    signatory: "Dr. H. Ahmad Fauzi, M.Kes",
    title: "Direktur Utama",
    leftSignatoryName: "",
    leftSignatoryTitle: ""
  }
];

export const defaultIncomingLetters = [
  {
    id: "SM-1787714776070",
    refNo: "485/TU/.1.2-SMK1GARUT-Cadistik-WI-",
    sender: "SMKN 1 GARUT",
    subject: "Permohonan Izin Praktik Kerja Lapangan Siswa",
    disposition: "Direktur",
    date: "2026-07-28"
  },
  {
    id: "SM-1787107133161",
    refNo: "001/DINKES/B/VIII/2026",
    sender: "Dinas Kesehatan Kabupaten Garut",
    subject: "Undangan Sosialisasi Program Imunisasi Nasional",
    disposition: "Asisten Manager Pelayanan Medis",
    date: "2026-07-05"
  }
];

export const defaultWarehouseItems = [
  {
    code: "B-8853",
    name: "TV Monitor 32 Inch",
    category: "Elektronik",
    unit: "Unit",
    minStock: 2,
    currentStock: 1,
    location: "Gudang Utama",
    condition: "Baik",
    notes: "Display antrian"
  },
  {
    code: "B-7712",
    name: "Sapu & Alat Pel Lantai",
    category: "Kebersihan",
    unit: "Set",
    minStock: 5,
    currentStock: 4,
    location: "Gudang Utama",
    condition: "Baik",
    notes: "Alat sanitasi"
  },
  {
    code: "B-2035",
    name: "Printer Thermal Kasir",
    category: "Elektronik",
    unit: "Unit",
    minStock: 2,
    currentStock: 2,
    location: "Gudang Utama",
    condition: "Baik",
    notes: "Printer struk resepsionis"
  },
  {
    code: "B-9184",
    name: "Ballpoint Standard Hitam",
    category: "ATK",
    unit: "Pcs",
    minStock: 10,
    currentStock: 17,
    location: "Gudang Utama",
    condition: "Baik",
    notes: "ATK operasional"
  },
  {
    code: "B-001",
    name: "Kertas A4 Sinar Dunia 75gr",
    category: "ATK",
    unit: "Rim",
    minStock: 10,
    currentStock: 5,
    location: "Rak ATK A1",
    condition: "Baik",
    notes: "Kertas printer"
  },
  {
    code: "B-002",
    name: "Cairan Disinfektan Medis 5L",
    category: "Kebersihan",
    unit: "Galon",
    minStock: 3,
    currentStock: 6,
    location: "Rak Kimia B2",
    condition: "Baik",
    notes: "Sanitasi ruangan"
  }
];

export const defaultStockIn = [
  {
    id: "BM-012/VIII/2026",
    date: "2026-08-26",
    itemCode: "B-8853",
    itemName: "TV Monitor 32 Inch",
    qty: 1,
    unit: "Unit",
    source: "Vendor Elektronik",
    price: 2100000,
    officer: "Admin Gudang",
    notes: "Pengadaan baru"
  },
  {
    id: "BM-011/VIII/2026",
    date: "2026-08-26",
    itemCode: "B-7712",
    itemName: "Sapu & Alat Pel Lantai",
    qty: 5,
    unit: "Set",
    source: "Toko Perkakas Garut",
    price: 150000,
    officer: "Admin Gudang",
    notes: "Restock kebersihan"
  },
  {
    id: "BM-010/VIII/2026",
    date: "2026-08-25",
    itemCode: "B-2035",
    itemName: "Printer Thermal Kasir",
    qty: 2,
    unit: "Unit",
    source: "Mitra IT",
    price: 850000,
    officer: "Admin Gudang",
    notes: "Unit cadangan"
  }
];

export const defaultStockOut = [
  {
    id: "BK-004/VIII/2026",
    date: "2026-08-27",
    itemCode: "B-9184",
    itemName: "Ballpoint Standard Hitam",
    qty: 3,
    unit: "Pcs",
    recipient: "Resepsionis",
    officer: "Admin Gudang",
    notes: "Kebutuhan loket pendaftaran"
  }
];

export const defaultBorrowings = [
  {
    id: "PMJ-001/VIII/2026",
    date: "2026-08-20",
    itemCode: "B-8853",
    itemName: "TV Monitor 32 Inch",
    qty: 1,
    borrower: "Humas & Promkes",
    returnDate: "2026-08-28",
    status: "Dipinjam",
    notes: "Untuk acara penyuluhan kesehatan"
  }
];

export const defaultAssetsInventaris = [
  {
    id: "3-3-16-106-2",
    category: "Barang/Benda",
    jenisAset: "Peralatan Kantor",
    namaAset: "Jam dinding + Kaligrafi",
    satuan: "Pcs",
    tanggalPerolehan: "2023-12-31",
    portability: ["Mudah dibawa"],
    kondisi: "Baik",
    hargaPerUnit: 150000,
    lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
    pemegang: "NANANG ALAMSYAH, ST",
    keterangan: "Inventaris",
    biayaRincian: [],
    umurEkonomis: 5,
    nilaiResidu: 0
  },
  {
    id: "3-2-12-106-2",
    category: "Barang/Benda",
    jenisAset: "Furniture",
    namaAset: "Kursi chitose Staff",
    satuan: "Unit",
    tanggalPerolehan: "2023-12-31",
    portability: ["Tidak mudah dibawa"],
    kondisi: "Baik",
    hargaPerUnit: 350000,
    lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
    pemegang: "NANANG ALAMSYAH, ST",
    keterangan: "MEUBEL",
    biayaRincian: []
  },
  {
    id: "3-2-16-106-2",
    category: "Barang/Benda",
    jenisAset: "Furniture",
    namaAset: "Laci Dokumen 3 Pintu",
    satuan: "Unit",
    tanggalPerolehan: "2023-12-31",
    portability: ["Tidak mudah dibawa"],
    kondisi: "Rusak Ringan",
    hargaPerUnit: 600000,
    lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
    pemegang: "NANANG ALAMSYAH, ST",
    keterangan: "MEUBEL",
    biayaRincian: []
  },
  {
    id: "3-22-18-106-2",
    category: "Barang/Benda",
    jenisAset: "Furniture",
    namaAset: 'Lemari 4 Tahap Stainles "BROTHER"',
    satuan: "Unit",
    tanggalPerolehan: "2023-12-31",
    portability: ["Tidak mudah dibawa"],
    kondisi: "Baik",
    hargaPerUnit: 2450000,
    lokasi: "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
    pemegang: "NANANG ALAMSYAH, ST",
    keterangan: "MEUBEL",
    biayaRincian: []
  }
];

export const defaultAssetLocations = [
  "BANGUNAN KLINIK (GEDUNG LAMA)",
  "BANGUNAN RB (LORONG GENSET)",
  "GUDANG APOTEK (RB)",
  "HALAMAN DEPAN GEDUNG KLINIK",
  "HALAMAN DEPAN GEDUNG RB (X)",
  "HALAMAN TENGAH",
  "JEMBATAN KLINIK - RB",
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
  "RUANG ASMAN ADUM DAN KERUMAH TANGGA",
  "RUANG ASMAN KEUANGAN",
  "RUANG ASMAN PENUNJANG MEDIS",
  "RUANG ASMAN SDM",
  "GUDANG PERKAKAS",
  "KANTIN"
];

export const defaultAssetTypes = [
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
  "Kendaraan Operasional",
  "Non-Medis"
];

export const defaultAssetUnits = [
  "Unit",
  "M2",
  "Pcs",
  "Box",
  "Set",
  "Rim",
  "Lot"
];

export const defaultDigitalArchive = [
  {
    id: "AR-2023-001",
    docNo: "002/SKep/01-10.0/III/K-BTR/2023",
    title: "Pedoman Tata Naskah di Lingkungan Klinik Baiturrahman",
    category: "SOP & Regulasi",
    date: "2023-03-06",
    size: "3.45 MB",
    access: "Internal",
    fileName: "Pedoman_Tata_Naskah_Klinik_Baiturrahman_2023.pdf",
    notes: "Keputusan Direktur Klinik Baiturrahman No. 002/SKep/01-10.0/III/K-BTR/2023 tentang Pedoman Tata Naskah Dinas di Lingkungan Klinik Baiturrahman (dr. H. Asep Maryaman - NIK 1.21.1)"
  }
];

export const defaultUsers = [
  {
    id: "usr-001",
    username: "admin",
    password: "admin",
    name: "Admin",
    role: "Administrator",
    department: "Unit IT",
    email: "kbaiturrahmangarut@gmail.com",
    avatarColor: "#0d9488"
  },
  {
    id: "usr-002",
    username: "direktur",
    password: "direktur",
    name: "Dr. H. Ahmad Fauzi, M.Kes",
    role: "Direktur Utama",
    department: "Pimpinan & Direksi",
    email: "direktur@klinikbaiturrahman.com",
    avatarColor: "#1e4a35"
  },
  {
    id: "usr-003",
    username: "adum",
    password: "adum",
    name: "Nanang Alamsyah, ST",
    role: "Staf Administrasi & Umum",
    department: "Bagian Umum & Sekretariat",
    email: "adum@klinikbaiturrahman.com",
    avatarColor: "#2563eb"
  },
  {
    id: "usr-004",
    username: "gudang",
    password: "gudang",
    name: "Siti Rahmawati, A.Md.Farm",
    role: "Petugas Logistik & Gudang",
    department: "Instalasi Farmasi & Logistik",
    email: "gudang@klinikbaiturrahman.com",
    avatarColor: "#d97706"
  },
  {
    id: "usr-005",
    username: "sarpras",
    password: "sarpras",
    name: "Asep Maryaman",
    role: "Pengelola Aset & Sarpras",
    department: "Kerumahtanggaan & Sarpras",
    email: "sarpras@klinikbaiturrahman.com",
    avatarColor: "#7c3aed"
  }
];

