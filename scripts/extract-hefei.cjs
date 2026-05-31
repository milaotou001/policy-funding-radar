const fs = require('fs');
const transcriptPath = 'C:/Users/admin/.claude/projects/D--AIProjects-00-workflow-template/4d889ac7-8edb-4537-bda3-7683c947e241.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');

const startIdx = content.indexOf('各位代表：');
const bigSlice = content.substring(startIdx, startIdx + 28000);

// Find the actual end: closing phrase + JSON transition
const endPhrase = '作出新的更大贡献！';
const endIdx = bigSlice.indexOf(endPhrase);
if (endIdx < 0) { console.log('End not found'); process.exit(1); }

let reportText = bigSlice.substring(0, endIdx + endPhrase.length);

// Fix JSON escaping
reportText = reportText.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

console.log('Report length: ' + reportText.length + ' chars');
console.log('Starts with: ' + reportText.substring(0, 100));
console.log('Ends with: ' + reportText.substring(reportText.length - 100));

fs.writeFileSync('data/reports/cities/2026-hefei-full.txt', reportText, 'utf8');
console.log('Saved to 2026-hefei-full.txt');
