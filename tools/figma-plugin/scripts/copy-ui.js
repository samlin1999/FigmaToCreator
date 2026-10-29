const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/ui.html');
const dest = path.join(__dirname, '../dist/ui.html');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied ui.html -> dist/ui.html');
