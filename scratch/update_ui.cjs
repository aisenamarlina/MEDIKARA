const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Replace Sidebar
const sidebarStart = code.indexOf('{/* Sidebar Navigation */}');
const sidebarEnd = code.indexOf('</aside>') + '</aside>'.length;

const newSidebar = `{/* Sidebar Navigation */}
      <aside style={{
        width: sidebarCollapsed ? '70px' : '260px', backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border)', transition: 'all 0.3s ease',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '2rem 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: 'auto' }} />
          {!sidebarCollapsed && (
            <div>
              <span style={{ fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'block', color: 'var(--text-dark)', fontFamily: 'Outfit, sans-serif' }}>SIBAKTI</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Integrated Clinic</span>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          <button onClick={() => setActiveMenu("dashboard")} className={\`sidebar-item \${activeMenu === "dashboard" ? "active" : ""}\`}>
            <LayoutDashboard size={18} />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          {!sidebarCollapsed && <div className="sidebar-header" onClick={() => toggleSystem("surat")}>2. Sistem Surat {openSystems.surat ? "▼" : "▶"}</div>}
          {(openSystems.surat || sidebarCollapsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: sidebarCollapsed ? '0' : '0.5rem' }}>
              <button onClick={() => setActiveMenu("letters_in")} className={\`sidebar-item \${activeMenu === "letters_in" ? "active" : ""}\`}>
                <Mail size={18} />
                {!sidebarCollapsed && <span>Surat Masuk</span>}
              </button>
              <button onClick={() => setActiveMenu("letters_out")} className={\`sidebar-item \${activeMenu === "letters_out" ? "active" : ""}\`}>
                <FileText size={18} />
                {!sidebarCollapsed && <span>Surat Keluar</span>}
              </button>
              <button onClick={() => setActiveMenu("certificates")} className={\`sidebar-item \${activeMenu === "certificates" ? "active" : ""}\`}>
                <Award size={18} />
                {!sidebarCollapsed && <span>Sertifikat</span>}
              </button>
              <button onClick={() => setActiveMenu("archive")} className={\`sidebar-item \${activeMenu === "archive" ? "active" : ""}\`}>
                <FolderArchive size={18} />
                {!sidebarCollapsed && <span>Arsip Digital</span>}
              </button>
            </div>
          )}

          {!sidebarCollapsed && <div className="sidebar-header" onClick={() => toggleSystem("gudang")}>3. Gudang Umum {openSystems.gudang ? "▼" : "▶"}</div>}
          {(openSystems.gudang || sidebarCollapsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: sidebarCollapsed ? '0' : '0.5rem' }}>
              <button onClick={() => setActiveMenu("warehouse")} className={\`sidebar-item \${activeMenu === "warehouse" ? "active" : ""}\`}>
                <Warehouse size={18} />
                {!sidebarCollapsed && <span>Inventaris Barang</span>}
              </button>
              <button onClick={() => setActiveMenu("requests")} className={\`sidebar-item \${activeMenu === "requests" ? "active" : ""}\`}>
                <ClipboardList size={18} />
                {!sidebarCollapsed && <span>Permintaan Keluar</span>}
              </button>
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            {!sidebarCollapsed && <div className="sidebar-header">Pengaturan</div>}
            <button onClick={() => setActiveMenu("reports")} className={\`sidebar-item \${activeMenu === "reports" ? "active" : ""}\`}>
              <FileBarChart2 size={18} />
              {!sidebarCollapsed && <span>Laporan Bulanan</span>}
            </button>
            <button onClick={() => setActiveMenu("settings")} className={\`sidebar-item \${activeMenu === "settings" ? "active" : ""}\`}>
              <Settings size={18} />
              {!sidebarCollapsed && <span>Pengaturan Sistem</span>}
            </button>
            <button onClick={handleLogout} className="sidebar-item" style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>
              <LogOut size={18} />
              {!sidebarCollapsed && <span>Keluar</span>}
            </button>
          </div>
        </nav>
      </aside>`;

code = code.substring(0, sidebarStart) + newSidebar + code.substring(sidebarEnd);

// Replace Header
const headerStart = code.indexOf('<header');
const headerEnd = code.indexOf('</header>') + '</header>'.length;

const newHeader = `<header style={{ height: '70px', backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="btn-icon" style={{ border: '1px solid var(--border)' }}>
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 500, color: 'var(--text-dark)' }}>
              {activeMenu === "dashboard" ? "Dashboard" : 
               activeMenu === "letters_in" ? "Surat Masuk" :
               activeMenu === "letters_out" ? "Surat Keluar" :
               activeMenu === "certificates" ? "Sertifikat" :
               activeMenu === "archive" ? "Arsip Digital" :
               activeMenu === "warehouse" ? "Inventaris Barang" :
               activeMenu === "requests" ? "Permintaan Barang" :
               activeMenu === "reports" ? "Laporan Bulanan" :
               activeMenu === "settings" ? "Pengaturan" : "Menu"}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Cari dokumen..." style={{ padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '20px', border: '1px solid var(--border)', outline: 'none', width: '250px', fontSize: '0.875rem', backgroundColor: '#fff' }} />
            </div>
            <button className="btn-icon"><Bell size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                A
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Administrator</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Klinik Pusat</span>
              </div>
            </div>
          </div>
        </header>`;

code = code.substring(0, headerStart) + newHeader + code.substring(headerEnd);

// Replace Dashboard Cards
const dashboardStart = code.indexOf('{activeMenu === "dashboard" && (');
// find the closing div of dashboard
const dashboardEndStr = '</div>\n          )}';
const dashboardEnd = code.indexOf(dashboardEndStr, dashboardStart) + dashboardEndStr.length;

const newDashboard = `{activeMenu === "dashboard" && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '2rem', color: 'var(--text-dark)' }}>Ringkasan Sistem</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="stat-card">
                  <div className="stat-label">
                    <span>Surat Keluar</span>
                    <FileText size={20} color="var(--text-muted)" />
                  </div>
                  <div className="stat-value">{outgoingLetters.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    <span>Sertifikat Dibuat</span>
                    <Award size={20} color="var(--text-muted)" />
                  </div>
                  <div className="stat-value">{certificates.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">
                    <span>Item Gudang Umum</span>
                    <Warehouse size={20} color="var(--text-muted)" />
                  </div>
                  <div className="stat-value">{warehouseItems.length}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="elegant-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Aktivitas Sistem Terkini</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activityLogs.slice(0, 5).map((log, i) => (
                      <div key={i} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: i < 4 ? '1px dashed var(--border-light)' : 'none' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', color: 'var(--primary)', height: 'fit-content' }}>
                          <Clock size={16} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', fontWeight: 500 }}>{log.action}</h4>
                          <p style={{ margin: '0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.details}</p>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', display: 'block' }}>{log.time}</span>
                        </div>
                      </div>
                    ))}
                    {activityLogs.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>Belum ada aktivitas tercatat.</p>
                    )}
                  </div>
                </div>
                <div className="elegant-card">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Akses Cepat</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button onClick={() => setActiveMenu("letters_out")} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <Plus size={16} /> Buat Surat Keluar
                    </button>
                    <button onClick={() => setActiveMenu("certificates")} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>
                      <Plus size={16} /> Buat Sertifikat
                    </button>
                    <button onClick={() => setActiveMenu("reports")} className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fff', color: 'var(--text-dark)', border: '1px solid var(--border)' }}>
                      <FileBarChart2 size={16} /> Buka Laporan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}`;

code = code.substring(0, dashboardStart) + newDashboard + code.substring(dashboardEnd);

// Replace Surat Masuk Table
const tableStartStr = '<table style={{ width: \'100%\', borderCollapse: \'collapse\', textAlign: \'left\' }}>';
// Replace all occurances of this with <table className="elegant-table">
code = code.split(tableStartStr).join('<table className="elegant-table">');

// Replace standard table container with elegant container
code = code.split('<div style={{ backgroundColor: \'var(--bg-card)\', padding: \'1.5rem\', borderRadius: \'12px\', border: \'1px solid var(--border)\' }}>').join('<div className="elegant-card elegant-table-container">');

fs.writeFileSync('src/App.jsx', code);
console.log('Done replacing App.jsx UI elements.');
