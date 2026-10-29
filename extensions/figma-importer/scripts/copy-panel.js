const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../src/panel/index.js');
const dest = path.join(__dirname, '../dist/panel.js');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied panel -> dist/panel.js');
