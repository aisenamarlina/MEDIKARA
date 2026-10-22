import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');

// The regex looks for <img src="/logo.png" ... style={{ width: 'XYpx' ... }} />
code = code.replace(/<img\s+src="\/logo\.png"([^>]*)style=\{\{\s*width:\s*'(\d+)(px|%)'([^}]*)\}\}([^>]*)>/g, '<img src="/logo.png" width="$2" height="$2" $1style={{ width: \'$2$3\'$4}}$5>');

// Ensure baganAlirImage has max width properly applied if possible, 
code = code.replace(/<img src=\{currentPrintDoc\.sopData\.baganAlirImage\}([^>]*)>/g, '<img src={currentPrintDoc.sopData.baganAlirImage} width="500" $1>');

fs.writeFileSync('src/App.jsx', code);
console.log('Done!');
