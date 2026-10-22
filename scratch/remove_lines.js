const fs = require('fs');
const lines = fs.readFileSync('src/App.jsx', 'utf8').split('\n');
// Remove lines 725 to 897 (1-indexed means index 724 to 896)
const newLines = [...lines.slice(0, 724), ...lines.slice(897)];
fs.writeFileSync('src/App.jsx', newLines.join('\n'));
