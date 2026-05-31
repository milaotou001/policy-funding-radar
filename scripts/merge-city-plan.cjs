const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const industries = JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8'));
const cityPlanEvidence = JSON.parse(fs.readFileSync(path.join(dataDir, 'city-plan-evidence.json'), 'utf8'));

const output = industries.industries.map(ind => {
  const evidence = cityPlanEvidence[ind.id];
  if (!evidence) return ind;
  return { ...ind, city_plan_evidence: evidence };
});

fs.writeFileSync(
  path.join(dataDir, 'industries.json'),
  JSON.stringify({ ...industries, industries: output }, null, 2),
  'utf8'
);

const withPlan = output.filter(i => i.city_plan_evidence);
const cityCounts = {};
withPlan.forEach(i => {
  const cities = Object.keys(i.city_plan_evidence);
  cities.forEach(c => {
    if (!cityCounts[c]) cityCounts[c] = { count: 0, industries: [] };
    cityCounts[c].count++;
    cityCounts[c].industries.push(i.id);
  });
});

console.log(`Merged city plan evidence: ${withPlan.length} industries with city plan data.`);
console.log('City coverage:');
Object.entries(cityCounts).forEach(([city, info]) => {
  console.log(`  ${city}: ${info.count} industries (${info.industries.join(', ')})`);
});
