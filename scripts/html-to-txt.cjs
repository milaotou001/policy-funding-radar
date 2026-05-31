const fs = require('fs');
const path = require('path');

const plansDir = path.join(__dirname, '..', 'data', 'reports', 'plans');

const conversions = [
  { html: 'sh-15th.html', txt: 'sh-15th.txt', label: '上海', planTitle: '上海市国民经济和社会发展第十五个五年规划纲要' },
  { html: 'sz-15th.html', txt: 'sz-15th.txt', label: '深圳', planTitle: '深圳市国民经济和社会发展第十五个五年规划纲要' },
  { html: 'hz-15th.html', txt: 'hz-15th.txt', label: '杭州', planTitle: '杭州市国民经济和社会发展第十五个五年规划纲要' },
  { html: 'gz-15th.html', txt: 'gz-15th.txt', label: '广州', planTitle: '广州市国民经济和社会发展第十五个五年规划纲要' },
];

function stripHtml(html) {
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n')
    .replace(/<tr[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#?\w+;/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text;
}

// Closing phrases that indicate plan text ending (keep everything including these)
const closingPhrases = [
  '不懈奋斗',
  '而努力奋斗',
  '作出新的更大贡献',
  '凝聚强大合力',
  '强大合力',
  '美好蓝图',
  '落到实处',
];

for (const { html, txt, label, planTitle } of conversions) {
  const htmlPath = path.join(plansDir, html);
  const txtPath = path.join(plansDir, txt);

  if (!fs.existsSync(htmlPath)) {
    console.log(label + ': HTML file not found');
    continue;
  }

  const raw = fs.readFileSync(htmlPath, 'utf8');
  let text = stripHtml(raw);

  // Find plan start
  const startIdx = text.indexOf(planTitle);
  if (startIdx >= 0) {
    text = text.substring(startIdx);
  }

  // Find the LAST occurrence of any closing phrase - this is the real end
  let lastClosingIdx = -1;
  for (const phrase of closingPhrases) {
    const idx = text.lastIndexOf(phrase);
    if (idx > lastClosingIdx) {
      lastClosingIdx = idx;
    }
  }

  if (lastClosingIdx > 0) {
    // Cut after the closing phrase (include reasonable continuation)
    const cutIdx = text.indexOf('\n', lastClosingIdx + 50);
    if (cutIdx > 0 && cutIdx - lastClosingIdx < 500) {
      text = text.substring(0, cutIdx).trimEnd();
    }
  }

  // Remove leading whitespace
  text = text.replace(/^\s+/, '');

  fs.writeFileSync(txtPath, text, 'utf8');
  console.log(label + ': saved ' + txt + ' (' + text.length + ' chars)');
  console.log('  Ends:   ' + text.substring(text.length - 100).replace(/\n/g, ' '));
}

console.log('\nDone.');
