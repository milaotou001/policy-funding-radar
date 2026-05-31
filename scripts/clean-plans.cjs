const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'data', 'reports', 'plans');

const files = ['bj-15th.txt', 'nj-15th.txt', 'su-15th.txt'];

for (const f of files) {
  const filePath = path.join(dir, f);
  let text = fs.readFileSync(filePath, 'utf8');

  // Find where JSON artifacts start - look for known JSON field patterns
  const markers = ['}","uuid":"', '","commandMode":"prompt"},"type":"attachment"', '","version":"2.'];
  let cutIdx = text.length;
  for (const m of markers) {
    const idx = text.indexOf(m);
    if (idx > 0 && idx < cutIdx) cutIdx = idx;
  }

  if (cutIdx < text.length) {
    text = text.substring(0, cutIdx).trimEnd();
    fs.writeFileSync(filePath, text, 'utf8');
  }

  console.log(f + ': ' + text.length + ' chars');
  console.log('  Ends: ' + text.substring(Math.max(0, text.length - 80)).replace(/\n/g, ' '));
}
console.log('Done.');
