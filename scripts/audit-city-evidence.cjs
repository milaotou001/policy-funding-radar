const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const reportsDir = path.join(dataDir, 'reports', 'cities');

// Map city codes to source report files
// .txt files = full plain text; .html files = original web capture
const cityReportFiles = {
  sh: { file: '2026-shanghai.html', type: 'html' },
  sz: { file: '2026-shenzhen.html', type: 'html' },
  hz: { file: '2026-hangzhou-full.txt', type: 'text' },
  nj: { file: '2026-nanjing.html', type: 'html' },
  su: { file: '2026-suzhou.html', type: 'html' },
  bj: { file: '2026-beijing.html', type: 'html' },
  gz: { file: '2026-guangzhou.html', type: 'html' },
  hf: { file: '2026-hefei-full.txt', type: 'text' },
};

// Strip HTML tags and decode entities
function stripHtml(html) {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#?\w+;/g, '')
    .replace(/\s+/g, '')
    .replace(/\s+/g, ' ');
  return text.trim();
}

// Load city evidence matrix
const cityEvidence = JSON.parse(fs.readFileSync(path.join(dataDir, 'city-evidence-matrix.json'), 'utf8'));

// Audit each city
const issues = [];
const allResults = {};

for (const [cityCode, reportCfg] of Object.entries(cityReportFiles)) {
  const reportPath = path.join(reportsDir, reportCfg.file);
  if (!fs.existsSync(reportPath)) {
    issues.push({ city: cityCode, industry: 'ALL', issue: `Report file not found: ${reportCfg.file}` });
    continue;
  }

  const raw = fs.readFileSync(reportPath, 'utf8');
  const plainText = reportCfg.type === 'text' ? raw : stripHtml(raw);

  console.log(`\n=== ${cityCode} report: ${plainText.length} chars ===`);

  // Find all industries that have this city
  const cityIndustries = [];
  for (const [industryId, cityMap] of Object.entries(cityEvidence)) {
    if (cityMap[cityCode]) {
      cityIndustries.push({ id: industryId, evidence: cityMap[cityCode] });
    }
  }

  console.log(`  Industries claimed: ${cityIndustries.length}`);

  for (const { id, evidence } of cityIndustries) {
    const { mention, detail, action_level } = evidence;

    // Check: extract key terms from mention (first 3-5 chars of key phrases)
    const keyTerms = extractKeyTerms(mention);
    let foundTerms = 0;
    let missingTerms = [];

    for (const term of keyTerms) {
      if (plainText.includes(term)) {
        foundTerms++;
      } else {
        missingTerms.push(term);
      }
    }

    const matchRate = keyTerms.length > 0 ? foundTerms / keyTerms.length : 1;

    if (matchRate < 0.5) {
      issues.push({
        city: cityCode,
        industry: id,
        issue: `LOW MATCH (${Math.round(matchRate * 100)}%): ${missingTerms.length}/${keyTerms.length} terms not found`,
        missing: missingTerms.slice(0, 5),
        mention: mention.substring(0, 80),
        action_level
      });
    }

    // Check for key numbers/dates in detail that should be verifiable
    const numbers = detail.match(/\d+[万亿千百亿万千]/g) || [];
    let verifiedNumbers = 0;
    for (const num of numbers) {
      if (plainText.includes(num)) verifiedNumbers++;
    }

    if (numbers.length > 0 && verifiedNumbers < numbers.length) {
      issues.push({
        city: cityCode,
        industry: id,
        issue: `NUMBER MISMATCH: ${verifiedNumbers}/${numbers.length} numbers verified in source`,
        detail: detail.substring(0, 100),
        unverified: numbers.filter(n => !plainText.includes(n))
      });
    }

    allResults[`${id}/${cityCode}`] = { matchRate, termsChecked: keyTerms.length, foundTerms };
  }
}

// Print issues
console.log('\n=== ISSUES FOUND ===');
if (issues.length === 0) {
  console.log('No issues found.');
} else {
  issues.forEach(i => {
    console.log(`\n[${i.city}] ${i.industry} — ${i.issue}`);
    if (i.missing) console.log(`  Missing terms: ${i.missing.join(', ')}`);
    if (i.unverified) console.log(`  Unverified numbers: ${i.unverified.join(', ')}`);
    if (i.mention) console.log(`  Mention: ${i.mention}`);
    if (i.detail) console.log(`  Detail: ${i.detail}`);
  });
}

console.log(`\nTotal issues: ${issues.length}`);

// Also list industries with very weak matches
const weakMatches = Object.entries(allResults)
  .filter(([, r]) => r.matchRate < 0.6)
  .sort((a, b) => a[1].matchRate - b[1].matchRate);

console.log('\n=== WEAK MATCHES (< 60%) ===');
weakMatches.forEach(([key, r]) => {
  console.log(`${key}: ${Math.round(r.matchRate * 100)}% (${r.foundTerms}/${r.termsChecked} terms)`);
});

function extractKeyTerms(text) {
  // Extract meaningful substrings (2-4 chars) that would appear in a report
  const terms = [];
  // Split on common punctuation
  const segments = text.split(/[，。、；：,.;:\s]+/).filter(s => s.length >= 2);

  for (const seg of segments) {
    if (seg.length <= 6) {
      terms.push(seg);
    } else {
      // For longer segments, extract the key noun phrases
      // Take first 2-3 chars and last 2-3 chars as potential search terms
      if (seg.length >= 4) terms.push(seg.substring(0, 3));
    }
  }

  // Filter out very common words
  const stopWords = ['的', '了', '在', '是', '有', '和', '与', '及', '等', '为', '以', '被', '把', '对', '向', '从', '到'];
  return terms.filter(t => !stopWords.includes(t) && t.length >= 2).slice(0, 8);
}

// Save detailed results
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'audit-results.json'),
  JSON.stringify({ issues, weakMatches, timestamp: new Date().toISOString() }, null, 2)
);
console.log('\nAudit results saved to data/audit-results.json');
