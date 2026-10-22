const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Insert Master Data and helpers above export default function App()
const masterData = `
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
  { name: "Surat Perjalan Dinas", code: "SPD" },
  { name: "Surat Rekomendasi", code: "SRkm" },
  { name: "Surat Panggilan", code: "SPgl" },
  { name: "Surat Lain-lain", code: "SLL" },
  { name: "Memorandum", code: "Mem" },
  { name: "Nota Dinas", code: "Nd" },
  { name: "Pengumuman", code: "Peng" },
  { name: "Berita Acara", code: "BA" },
  { name: "Notula", code: "Ntl" },
  { name: "Daftar Hadir", code: "Dh" },
  { name: "Sertifikat", code: "Stk" },
  { name: "Piagam", code: "Pgm" },
  { name: "SOP", code: "SOP" }
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
  return \`\${seqStr}/\${typeCode}/\${unitCode}/\${monthRoman}/K-BTR/\${year}\`;
}
`;

code = code.replace('export default function App() {', masterData + '\nexport default function App() {');

// 2. Update letterForm state
const oldLetterFormState = 'const [letterForm, setLetterForm] = useState({ templateType: "Surat Keterangan", destination: "", recipientName: "", subject: "", content: "", attachments: "-", signatory: "", title: "" });';
const newLetterFormState = `// Letter numbering states
  const [letterForm, setLetterForm] = useState({ 
    docNo: "",
    typeCode: "SKet", 
    unitCode: "01-10.0", 
    destination: "", 
    recipientName: "", 
    subject: "", 
    content: "", 
    attachments: "-", 
    signatory: "", 
    title: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Auto-generate docNo when typeCode, unitCode or date changes
  useEffect(() => {
    // Generate next sequence number based on current total letters this year
    const d = new Date(letterForm.date);
    const yearLetters = outgoingLetters.filter(l => new Date(l.date).getFullYear() === d.getFullYear());
    const nextSeq = yearLetters.length + 1;
    const generatedNo = generateSuratNumber(nextSeq, letterForm.typeCode, letterForm.unitCode, letterForm.date);
    setLetterForm(prev => ({ ...prev, docNo: generatedNo }));
  }, [letterForm.typeCode, letterForm.unitCode, letterForm.date, outgoingLetters.length]);`;

code = code.replace(oldLetterFormState, newLetterFormState);

// 3. Update handleCreateLetter
const oldHandleCreateLetter = `  const handleCreateLetter = (e) => {
    e.preventDefault();
    const newLetter = {
      id: "L-" + Date.now(),
      docNo: \`\${Math.floor(Math.random() * 900) + 100}/KBR/2026\`, // Auto generate fake docNo
      date: new Date().toISOString().split('T')[0],
      ...letterForm
    };
    const updated = [newLetter, ...outgoingLetters];
    updateDBState("outgoing_letters", updated, setOutgoingLetters);
    db.addLog(\`Pembuatan Surat \${letterForm.templateType}\`, "Surat Menyurat", \`Tujuan: \${letterForm.recipientName}\`);
    setActivityLogs(db.get("activity_logs"));
    setLetterForm({ templateType: "Surat Keterangan", destination: "", recipientName: "", subject: "", content: "", attachments: "-", signatory: "", title: "" });
    alert("Surat berhasil dibuat!");
  };`;

const newHandleCreateLetter = `  const handleCreateLetter = (e) => {
    e.preventDefault();
    const typeObj = letterTypes.find(t => t.code === letterForm.typeCode);
    const templateType = typeObj ? typeObj.name : "Surat Keluar";
    
    const newLetter = {
      id: "L-" + Date.now(),
      docNo: letterForm.docNo,
      date: letterForm.date,
      templateType: templateType,
      destination: letterForm.destination,
      recipientName: letterForm.recipientName,
      subject: letterForm.subject,
      content: letterForm.content,
      attachments: letterForm.attachments,
      signatory: letterForm.signatory,
      title: letterForm.title
    };
    const updated = [newLetter, ...outgoingLetters];
    updateDBState("outgoing_letters", updated, setOutgoingLetters);
    db.addLog(\`Pembuatan \${templateType}\`, "Surat Menyurat", \`No: \${newLetter.docNo}\`);
    setActivityLogs(db.get("activity_logs"));
    // reset form but keep defaults
    setLetterForm(prev => ({ 
      ...prev,
      destination: "", recipientName: "", subject: "", content: "", attachments: "-", signatory: "", title: "" 
    }));
    alert("Surat berhasil dibuat!");
  };`;

code = code.replace(oldHandleCreateLetter, newHandleCreateLetter);

// 4. Update the Outgoing Letter Form UI
const oldFormUI = `<form onSubmit={handleCreateLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jenis Templat</label>
                        <select value={letterForm.templateType} onChange={e => setLetterForm({ ...letterForm, templateType: e.target.value })} required style={{ width: '100%', padding: '0.5rem' }}>
                          <option value="Surat Keterangan">Surat Keterangan</option>
                          <option value="Surat Rujukan">Surat Rujukan</option>
                          <option value="Surat Undangan">Surat Undangan</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Kepada Yth. (Nama Penerima)</label>
                        <input type="text" value={letterForm.recipientName} onChange={e => setLetterForm({ ...letterForm, recipientName: e.target.value })} required style={{ width: '100%', padding: '0.5rem' }} />
                      </div>
                    </div>`;

const newFormUI = `<form onSubmit={handleCreateLetter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Jenis Surat</label>
                        <select className="input-field" value={letterForm.typeCode} onChange={e => setLetterForm({ ...letterForm, typeCode: e.target.value })} required>
                          {letterTypes.map(t => (
                            <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unit Pengeluar</label>
                        <select className="input-field" value={letterForm.unitCode} onChange={e => setLetterForm({ ...letterForm, unitCode: e.target.value })} required>
                          {unitCodes.map(u => (
                            <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nomor Surat (Auto/Edit)</label>
                        <input type="text" className="input-field" value={letterForm.docNo} onChange={e => setLetterForm({ ...letterForm, docNo: e.target.value })} required />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Kepada Yth. (Nama Penerima)</label>
                        <input type="text" className="input-field" value={letterForm.recipientName} onChange={e => setLetterForm({ ...letterForm, recipientName: e.target.value })} required />
                      </div>`;

code = code.replace(oldFormUI, newFormUI);

// 5. Update old input fields to have className="input-field"
code = code.replace('onChange={e => setLetterForm({ ...letterForm, destination: e.target.value })} required style={{ width: \'100%\', padding: \'0.5rem\' }} />', 'onChange={e => setLetterForm({ ...letterForm, destination: e.target.value })} required className="input-field" />');
code = code.replace('onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })} required style={{ width: \'100%\', padding: \'0.5rem\' }} />', 'onChange={e => setLetterForm({ ...letterForm, subject: e.target.value })} required className="input-field" />');
code = code.replace('onChange={e => setLetterForm({ ...letterForm, signatory: e.target.value })} required style={{ width: \'100%\', padding: \'0.5rem\' }} />', 'onChange={e => setLetterForm({ ...letterForm, signatory: e.target.value })} required className="input-field" />');
code = code.replace('onChange={e => setLetterForm({ ...letterForm, title: e.target.value })} required style={{ width: \'100%\', padding: \'0.5rem\' }} />', 'onChange={e => setLetterForm({ ...letterForm, title: e.target.value })} required className="input-field" />');
code = code.replace('onChange={e => setLetterForm({ ...letterForm, content: e.target.value })} required style={{ width: \'100%\', padding: \'0.5rem\', minHeight: \'150px\' }}', 'onChange={e => setLetterForm({ ...letterForm, content: e.target.value })} required className="input-field" style={{ minHeight: \'150px\' }}');

// Replace standard forms with elegant components
fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx has been updated with automatic numbering system.');
