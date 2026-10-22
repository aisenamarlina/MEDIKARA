const fs = require('fs');

const path = "c:\\TUGAS ALLISA SEMESTER 6\\SIBAKTI\\SIBAKTI\\src\\App.jsx";
let content = fs.readFileSync(path, 'utf8');

const targetStr = `                      {/* Summary Cards */}
                      <div>
                        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>Ringkasan Periode {monthName} {year}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                          {[
                            { label: 'Surat Masuk', value: filteredIn.length, color: '#3b82f6', bg: '#eff6ff' },
                            { label: 'Surat Keluar', value: filteredOut.length, color: 'var(--primary)', bg: 'var(--primary-light)' },
                            { label: 'Sertifikat', value: filteredCerts.length, color: '#f59e0b', bg: '#fffbeb' },
                            { label: 'Stok Masuk', value: filteredStockIn.length, color: '#10b981', bg: '#ecfdf5' },
                            { label: 'Stok Keluar', value: filteredStockOut.length, color: '#ef4444', bg: '#fef2f2' },
                            { label: 'Peminjaman', value: filteredBorrow.length, color: '#8b5cf6', bg: '#f5f3ff' },
                          ].map((card, i) => (
                            <div key={i} style={{ backgroundColor: card.bg, borderRadius: '10px', padding: '1rem', textAlign: 'center', border: \`1px solid \${card.color}22\` }}>
                              <p style={{ margin: '0 0 0.25rem', fontSize: '1.8rem', fontWeight: 800, color: card.color }}>{card.value}</p>
                              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: card.color, opacity: 0.8 }}>{card.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Surat Masuk Table */}
                      {filteredIn.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', borderLeft: '3px solid #3b82f6', paddingLeft: '0.75rem' }}>Data Surat Masuk ({filteredIn.length})</h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#eff6ff' }}>
                                  {['No','Nomor Referensi','Tanggal','Pengirim','Perihal'].map(h => (
                                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#3b82f6', borderBottom: '2px solid #bfdbfe', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredIn.map((l, i) => (
                                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-main)' }}>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{i+1}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--text-dark)' }}>{l.refNo || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{l.date}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{l.sender || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{l.subject || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Surat Keluar Table */}
                      {filteredOut.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', borderLeft: '3px solid var(--primary)', paddingLeft: '0.75rem' }}>Data Surat Keluar ({filteredOut.length})</h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: 'var(--primary-light)' }}>
                                  {['No','Nomor Surat','Tanggal','Penerima','Perihal'].map(h => (
                                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: 'var(--primary-dark)', borderBottom: '2px solid var(--primary)', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredOut.map((l, i) => (
                                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-main)' }}>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{i+1}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{l.docNo || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{l.date}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{l.recipient || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{l.subject || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Stok Masuk Table */}
                      {filteredStockIn.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', borderLeft: '3px solid #10b981', paddingLeft: '0.75rem' }}>Data Stok Masuk ({filteredStockIn.length})</h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#ecfdf5' }}>
                                  {['No','Nomor Transaksi','Tanggal','Barang','Jumlah','Pemasok'].map(h => (
                                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#10b981', borderBottom: '2px solid #6ee7b7', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredStockIn.map((s, i) => (
                                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-main)' }}>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{i+1}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#10b981' }}>{s.id || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{s.date}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{s.itemName || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#10b981' }}>{s.qty}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{s.supplier || '-'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Stok Keluar Table */}
                      {filteredStockOut.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)', borderLeft: '3px solid #ef4444', paddingLeft: '0.75rem' }}>Data Stok Keluar ({filteredStockOut.length})</h3>
                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                              <thead>
                                <tr style={{ backgroundColor: '#fef2f2' }}>
                                  {['No','Nomor Transaksi','Tanggal','Barang','Jumlah','Tujuan','Status'].map(h => (
                                    <th key={h} style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 700, color: '#ef4444', borderBottom: '2px solid #fca5a5', whiteSpace: 'nowrap' }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredStockOut.map((s, i) => (
                                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-main)' }}>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{i+1}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#ef4444' }}>{s.id || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{s.date}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-dark)' }}>{s.itemName || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#ef4444' }}>{s.qty}</td>
                                    <td style={{ padding: '0.6rem 0.75rem', color: 'var(--text-muted)' }}>{s.destination || '-'}</td>
                                    <td style={{ padding: '0.6rem 0.75rem' }}><span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: s.status === 'Selesai' ? '#d1fae5' : s.status === 'Ditolak' ? '#fee2e2' : '#fef3c7', color: s.status === 'Selesai' ? '#065f46' : s.status === 'Ditolak' ? '#7f1d1d' : '#78350f' }}>{s.status}</span></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* No data message */}
                      {filteredIn.length === 0 && filteredOut.length === 0 && filteredStockIn.length === 0 && filteredStockOut.length === 0 && filteredBorrow.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                          <FileText size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                          <p style={{ fontSize: '1rem', fontWeight: 600 }}>Tidak ada data pada periode {monthName} {year}</p>
                          <p style={{ fontSize: '0.85rem' }}>Coba pilih bulan atau tahun yang berbeda</p>
                        </div>
                      )}

                      {/* Signature */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border)' }}>
                        <div style={{ textAlign: 'center', minWidth: '200px' }}>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{settings.city || 'Garut'}, {new Date(parseInt(year), parseInt(m), 0).getDate()} {monthName} {year}</p>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>{settings.directorTitle || 'Kepala Klinik'}</p>
                          <div style={{ height: '60px' }} />
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-dark)', textDecoration: 'underline' }}>{settings.directorName || '_______________'}</p>
                        </div>
                      </div>`;

const replaceStr = `                      {/* Summary Section */}
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>A. Ringkasan Aktivitas Administrasi</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', color: '#000' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>Kategori</th>
                              <th style={{ padding: '0.5rem', border: '1px solid #000', backgroundColor: '#f3f4f6', textAlign: 'center', fontWeight: 'bold' }}>Jumlah Dokumen / Transaksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Surat Masuk</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredIn.length}</td></tr>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Surat Keluar</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredOut.length}</td></tr>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Sertifikat / Piagam</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredCerts.length}</td></tr>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Barang Masuk (Gudang)</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredStockIn.length}</td></tr>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Barang Keluar (Gudang)</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredStockOut.length}</td></tr>
                            <tr><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>Peminjaman Aset</td><td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{filteredBorrow.length}</td></tr>
                          </tbody>
                        </table>
                      </div>

                      {/* Surat Masuk Table */}
                      {filteredIn.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>B. Rincian Surat Masuk</h3>
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
                                <tr key={l.id}>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.refNo || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.date}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.sender || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.subject || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Surat Keluar Table */}
                      {filteredOut.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>C. Rincian Surat Keluar</h3>
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
                                <tr key={l.id}>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.docNo || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.date}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.recipient || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{l.subject || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Stok Masuk Table */}
                      {filteredStockIn.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>D. Rincian Barang Masuk (Gudang)</h3>
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
                                <tr key={s.id}>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.id || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.date}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.itemName || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{s.qty}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.supplier || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Stok Keluar Table */}
                      {filteredStockOut.length > 0 && (
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>E. Rincian Barang Keluar / Distribusi</h3>
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
                                <tr key={s.id}>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{i+1}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.id || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.date}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.itemName || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000', textAlign: 'center' }}>{s.qty}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.destination || '-'}</td>
                                  <td style={{ padding: '0.4rem 0.5rem', border: '1px solid #000' }}>{s.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* No data message */}
                      {filteredIn.length === 0 && filteredOut.length === 0 && filteredStockIn.length === 0 && filteredStockOut.length === 0 && filteredBorrow.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                          <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>Tidak ada data pada periode {monthName} {year}</p>
                        </div>
                      )}

                      {/* Signature */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3rem' }}>
                        <div style={{ textAlign: 'center', minWidth: '220px' }}>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', color: '#000' }}>{settings.city || 'Garut'}, {new Date(parseInt(year), parseInt(m), 0).getDate()} {monthName} {year}</p>
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', fontWeight: 'bold', color: '#000' }}>{settings.directorTitle || 'Kepala Klinik'}</p>
                          <div style={{ height: '70px' }} />
                          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#000', textDecoration: 'underline' }}>{settings.directorName || '_______________'}</p>
                        </div>
                      </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(path, content, 'utf8');
console.log('done');
