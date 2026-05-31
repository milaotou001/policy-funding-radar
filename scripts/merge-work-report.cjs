const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const industries = JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8'));
const nationalReport = JSON.parse(fs.readFileSync(path.join(dataDir, 'work-report-evidence.json'), 'utf8'));
const zjReport = JSON.parse(fs.readFileSync(path.join(dataDir, 'zj-work-report-evidence.json'), 'utf8'));

const output = industries.industries.map(ind => {
  const national = nationalReport[ind.id];
  const zhejiang = zjReport[ind.id];

  if (!national && !zhejiang) return ind;

  const work_report = {};
  if (national) work_report.national = national;
  if (zhejiang) work_report.zhejiang = zhejiang;

  return { ...ind, work_report };
});

fs.writeFileSync(
  path.join(dataDir, 'industries.json'),
  JSON.stringify({ ...industries, industries: output }, null, 2),
  'utf8'
);

const withNational = output.filter(i => i.work_report?.national);
const withZj = output.filter(i => i.work_report?.zhejiang);
console.log(`Merged work reports: ${withNational.length} national, ${withZj.length} Zhejiang.`);
