const fs = require('fs');
const path = require('path');
const industries = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'industries.json'), 'utf8'));
const signals = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'market-signals.json'), 'utf8'));
const output = industries.industries.map(ind => {
  const sig = signals[ind.id];
  return sig ? { ...ind, market_signal: sig } : ind;
});
fs.writeFileSync(path.join(__dirname, '..', 'data', 'industries.json'), JSON.stringify({ ...industries, industries: output }, null, 2), 'utf8');
const withSignal = output.filter(i => i.market_signal);
console.log(`Merged ${withSignal.length} market signals.`);
