const fs = require('fs');
const path = require('path');

const transcript = 'C:/Users/admin/.claude/projects/D--AIProjects-00-workflow-template/4d889ac7-8edb-4537-bda3-7683c947e241.jsonl';
const plansDir = path.join(__dirname, '..', 'data', 'reports', 'plans');

const targets = [
  { marker: '北京市国民经济和社会发展', out: 'bj-15th.txt' },
  { marker: '南京市国民经济和社会发展', out: 'nj-15th.txt' },
  { marker: '苏州市国民经济和社会发展', out: 'su-15th.txt' },
];

const lines = fs.readFileSync(transcript, 'utf8').split('\n');

for (const t of targets) {
  let bestLine = '';
  for (const line of lines) {
    if (line.includes(t.marker) && line.length > bestLine.length) {
      bestLine = line;
    }
  }

  if (!bestLine) {
    console.log(t.marker.substring(0,4) + ': NOT FOUND');
    continue;
  }

  // Find the raw text position of the marker
  const idx = bestLine.indexOf(t.marker);
  let text = bestLine.substring(idx);

  // The text is JSON-escaped. Fix common escapes.
  // The plan texts are in user messages, where newlines become \n in JSON
  text = text.replace(/\\n/g, '\n');
  text = text.replace(/\\"/g, '"');
  text = text.replace(/\\\\/g, '\\');

  // Find where the actual plan content ends
  // Plans typically end with sections about planning implementation
  // After the plan text, there may be JSON structure or conversation text
  // Look for the end of the plan - typically there's a closing section

  // Clean trailing JSON artifacts: find last substantial content
  // Plans end with implementation sections

  const outPath = path.join(plansDir, t.out);
  fs.writeFileSync(outPath, text, 'utf8');
  console.log(t.marker.substring(0,4) + ': saved ' + t.out + ' (' + text.length + ' chars)');
  console.log('  Starts: ' + text.substring(0, 80).replace(/\n/g, ' '));
  console.log('  Ends:   ' + text.substring(Math.max(0, text.length - 80)).replace(/\n/g, ' '));
}

console.log('\nDone.');
