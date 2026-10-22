export const exportTableToCSV = (dataArray, filename = 'export.csv') => {
  if (!dataArray || !dataArray.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  // Generate headers from the keys of the first object
  const headers = Object.keys(dataArray[0]);
  
  // Construct CSV string
  const csvContent = [
    headers.join(','),
    ...dataArray.map(row => 
      headers.map(header => {
        let cellData = row[header];
        if (cellData === null || cellData === undefined) cellData = '';
        // If data contains comma, newline, or quotes, wrap it in double quotes
        let strData = String(cellData);
        if (strData.search(/("|,|\n)/g) >= 0) {
          strData = `"${strData.replace(/"/g, '""')}"`;
        }
        return strData;
      }).join(',')
    )
  ].join('\n');

  // Create a Blob and download it
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportTableToPDF = (dataArray, filename = 'export.pdf', title = 'Laporan') => {
  if (!dataArray || !dataArray.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  try {
    const doc = new jsPDF('landscape');
    
    // Set title
    doc.setFontSize(14);
    doc.text(title, 14, 15);

    const headers = Object.keys(dataArray[0]);
    const data = dataArray.map(row => headers.map(h => row[h] ?? ''));

    // Hitung ukuran font adaptif berdasarkan jumlah kolom agar tidak terpotong
    const fontSize = headers.length > 7 ? 7 : headers.length > 5 ? 8 : 9;

    const tableConfig = {
      head: [headers],
      body: data,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: fontSize, cellPadding: 2.5, overflow: 'linebreak' },
      headStyles: { fillColor: [30, 74, 53], textColor: 255, fontStyle: 'bold' },
      margin: { top: 20, right: 10, bottom: 15, left: 10 },
      tableWidth: 'auto'
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableConfig);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableConfig);
    }

    doc.save(filename);
  } catch (error) {
    console.error("Gagal export PDF:", error);
    alert("Gagal mengunduh PDF: " + (error.message || "Terjadi kesalahan sistem"));
  }
};

export const exportTableToWord = (dataArray, filename = 'export.doc', title = 'Laporan') => {
  if (!dataArray || !dataArray.length) {
    alert("Tidak ada data untuk diekspor!");
    return;
  }

  const headers = Object.keys(dataArray[0]);
  
  let tableHTML = `<table border="1" style="border-collapse: collapse; width: 100%;">`;
  
  tableHTML += `<thead><tr>`;
  headers.forEach(h => {
    tableHTML += `<th style="background-color: #f2f2f2; padding: 8px;">${h}</th>`;
  });
  tableHTML += `</tr></thead><tbody>`;
  
  dataArray.forEach(row => {
    tableHTML += `<tr>`;
    headers.forEach(h => {
      tableHTML += `<td style="padding: 8px;">${row[h] ?? ''}</td>`;
    });
    tableHTML += `</tr>`;
  });
  tableHTML += `</tbody></table>`;

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
    </head>
    <body>
      <h2>${title}</h2>
      ${tableHTML}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
