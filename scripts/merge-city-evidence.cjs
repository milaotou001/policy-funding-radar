const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const industries = JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8'));
const cityEvidence = JSON.parse(fs.readFileSync(path.join(dataDir, 'city-evidence-matrix.json'), 'utf8'));

const output = industries.industries.map(ind => {
  const evidence = cityEvidence[ind.id];
  if (!evidence) return ind;
  return { ...ind, city_evidence: evidence };
});

fs.writeFileSync(
  path.join(dataDir, 'industries.json'),
  JSON.stringify({ ...industries, industries: output }, null, 2),
  'utf8'
);

const withCity = output.filter(i => i.city_evidence);
const cityCounts = {};
withCity.forEach(i => {
  const cities = Object.keys(i.city_evidence);
  cities.forEach(c => {
    cityCounts[c] = (cityCounts[c] || 0) + 1;
  });
});

console.log(`Merged city evidence: ${withCity.length} industries with city data.`);
console.log('City coverage:', JSON.stringify(cityCounts));
