const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------
const { industries } = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8')
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const pct = (n) => n == null ? 'N/A' : (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
const median = (arr) => {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

// ---------------------------------------------------------------------------
// Step 1: ETF dedup
// ---------------------------------------------------------------------------
const etfMap = {}; // etf_code -> [{id, name}]
for (const ind of industries) {
  const code = ind.market_signal?.etf_code;
  if (!code) continue;
  if (!etfMap[code]) etfMap[code] = [];
  etfMap[code].push({ id: ind.id, name: ind.name });
}

const sharedETFs = {};
const independentIndustries = [];
const borrowedIndustries = [];

for (const [code, inds] of Object.entries(etfMap)) {
  if (inds.length > 1) {
    sharedETFs[code] = inds;
    borrowedIndustries.push(...inds);
  } else {
    independentIndustries.push(inds[0]);
  }
}

// Also find industries with no market_signal at all
const noSignal = industries.filter((i) => !i.market_signal);

// ---------------------------------------------------------------------------
// Step 2: Policy scoring (independent ETF industries only)
// ---------------------------------------------------------------------------
function scoreProvince(ind) {
  const v = ind.provincial_evidence?.zj_intensity;
  if (v === '强落地') return 3;
  if (v === '有落地') return 2;
  if (v === '弱落地') return 1;
  return 0;
}

function scoreCityExec(ind) {
  const ce = ind.city_evidence;
  if (!ce) return 0;
  const keyCount = Object.keys(ce).filter((k) => ce[k]?.action_level === '重点推进').length;
  if (keyCount > 1) return 3;
  if (keyCount === 1) return 2;
  return Object.keys(ce).length > 0 ? 1 : 0;
}

function scorePlanCommit(ind) {
  const cp = ind.city_plan_evidence;
  if (!cp) return 0;
  let strongCities = 0;
  let totalItems = 0;
  for (const [, v] of Object.entries(cp)) {
    if (v?.intensity === '强落地') strongCities++;
    totalItems += v?.concrete_items?.length || 0;
  }
  const density = strongCities + totalItems;
  if (density >= 6) return 3;
  if (density >= 3) return 2;
  return 1;
}

function scoreNational(ind) {
  const v = ind.work_report?.national?.action_level;
  if (v === '重点推进') return 3;
  if (v === '持续推进') return 2;
  if (v) return 1;
  return 0;
}

function scoreResource(ind) {
  const v = ind.investment_observation?.resource_intensity;
  if (v === '高') return 3;
  if (v === '中') return 2;
  if (v === '低') return 1;
  return 0;
}

function policyScores(ind) {
  const dims = {
    provincial: scoreProvince(ind),
    cityExec: scoreCityExec(ind),
    planCommit: scorePlanCommit(ind),
    national: scoreNational(ind),
    resource: scoreResource(ind),
  };
  dims.total = dims.provincial + dims.cityExec + dims.planCommit + dims.national + dims.resource;
  return dims;
}

// Score only independent industries
const independentData = independentIndustries
  .map((ref) => {
    const ind = industries.find((i) => i.id === ref.id);
    return {
      id: ind.id,
      name: ind.name,
      etf_code: ind.market_signal.etf_code,
      returns: {
        m1: ind.market_signal.return_1m_pct,
        m3: ind.market_signal.return_3m_pct,
        m6: ind.market_signal.return_6m_pct,
        y1: ind.market_signal.return_1y_pct,
      },
      fundFlow: ind.market_signal.fund_flow_direction,
      volumeTrend: ind.market_signal.volume_trend,
      signal: ind.market_signal.signal,
      policy: policyScores(ind),
    };
  })
  .filter((d) => d.policy.total > 0 && d.returns.m6 != null);

// ---------------------------------------------------------------------------
// Step 3: Market scoring
// ---------------------------------------------------------------------------
const marketScores = independentData.map((d) => {
  const m6 = d.returns.m6;
  d.marketLevel = m6 > 15 ? '强' : m6 >= 0 ? '中' : '弱';
  return d;
});

const policyMedian = median(marketScores.map((d) => d.policy.total));
const marketMedian = median(marketScores.map((d) => d.returns.m6));

for (const d of marketScores) {
  d.policyStrong = d.policy.total >= policyMedian;
  d.marketStrong = d.returns.m6 >= marketMedian;
}

// ---------------------------------------------------------------------------
// Step 4: 2x2 matrix
// ---------------------------------------------------------------------------
const matrix = {
  resonance: [],    // policy strong + market strong
  marketDriven: [], // policy weak + market strong
  policyLeading: [],// policy strong + market weak
  bothWeak: [],     // policy weak + market weak
};

for (const d of marketScores) {
  if (d.policyStrong && d.marketStrong) matrix.resonance.push(d);
  else if (!d.policyStrong && d.marketStrong) matrix.marketDriven.push(d);
  else if (d.policyStrong && !d.marketStrong) matrix.policyLeading.push(d);
  else matrix.bothWeak.push(d);
}

// ---------------------------------------------------------------------------
// Step 5: Dimension attribution
// ---------------------------------------------------------------------------
const dimNames = ['provincial', 'cityExec', 'planCommit', 'national', 'resource'];
const dimLabels = {
  provincial: '省级落地强度',
  cityExec: '城市执行覆盖',
  planCommit: '规划承诺密度',
  national: '国家定调',
  resource: '资源倾斜力度',
};

function dimEffect() {
  const results = [];
  for (const dim of dimNames) {
    const highGroup = marketScores.filter((d) => d.policy[dim] >= 3);
    const lowGroup = marketScores.filter((d) => d.policy[dim] <= 1 && d.policy[dim] >= 0);
    if (highGroup.length < 2 || lowGroup.length < 2) {
      results.push({ dim, label: dimLabels[dim], highAvg: null, lowAvg: null, diff: null, nHigh: highGroup.length, nLow: lowGroup.length });
      continue;
    }
    const highAvg = highGroup.reduce((s, d) => s + d.returns.m6, 0) / highGroup.length;
    const lowAvg = lowGroup.reduce((s, d) => s + d.returns.m6, 0) / lowGroup.length;
    results.push({
      dim,
      label: dimLabels[dim],
      highAvg,
      lowAvg,
      diff: highAvg - lowAvg,
      nHigh: highGroup.length,
      nLow: lowGroup.length,
    });
  }
  results.sort((a, b) => (b.diff ?? -999) - (a.diff ?? -999));
  return results;
}

const dimEffects = dimEffect();

// ---------------------------------------------------------------------------
// Step 6: Category analysis
// ---------------------------------------------------------------------------
function countCategories(ind) {
  const counts = { '量化目标': 0, '工程项目': 0, '产业平台': 0 };
  // provincial
  for (const item of ind.provincial_evidence?.concrete_items || []) {
    if (counts[item.category] !== undefined) counts[item.category]++;
  }
  // city plan
  for (const [, cityEv] of Object.entries(ind.city_plan_evidence || {})) {
    for (const item of cityEv?.concrete_items || []) {
      if (counts[item.category] !== undefined) counts[item.category]++;
    }
  }
  return counts;
}

const categoryData = marketScores.map((d) => {
  const ind = industries.find((i) => i.id === d.id);
  return { ...d, categories: countCategories(ind) };
});

function categoryEffect(catName) {
  const highGroup = categoryData.filter((d) => d.categories[catName] >= 2);
  const lowGroup = categoryData.filter((d) => d.categories[catName] === 0);
  if (highGroup.length < 2 || lowGroup.length < 2) return null;
  return {
    cat: catName,
    highAvg: highGroup.reduce((s, d) => s + d.returns.m6, 0) / highGroup.length,
    lowAvg: lowGroup.reduce((s, d) => s + d.returns.m6, 0) / lowGroup.length,
    nHigh: highGroup.length,
    nLow: lowGroup.length,
  };
}

const catEffects = ['量化目标', '工程项目', '产业平台']
  .map(categoryEffect)
  .filter(Boolean);

// ---------------------------------------------------------------------------
// Build report
// ---------------------------------------------------------------------------
let report = '';

report += '# 政策-行情相关性分析报告\n\n';
report += `> 生成时间：${new Date().toISOString().slice(0, 10)}\n`;
report += `> 数据版本：${JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8')).meta?.data_version || 'N/A'}\n`;
report += `> 分析样本：${industries.length} 个行业，${Object.keys(etfMap).length} 个独特 ETF\n\n`;

report += '---\n\n';

// 1. ETF dedup
report += '## 1. ETF 去重表\n\n';
report += `独立 ETF 行业（${independentIndustries.length} 个，参与定量分析）：\n\n`;
report += '| 行业 | ETF代码 | 6月回报 | 1年回报 | 市场信号 |\n';
report += '|------|--------|---------|---------|----------|\n';
for (const d of marketScores) {
  report += `| ${d.name} | ${d.etf_code} | ${pct(d.returns.m6)} | ${pct(d.returns.y1)} | ${d.signal} |\n`;
}

report += `\n借用 ETF 行业（${borrowedIndustries.length} 个，不参与定量对比）：\n\n`;
report += '| 行业 | 借用ETF | 原始行业 | 6月回报 | 市场信号 |\n';
report += '|------|---------|---------|---------|----------|\n';
for (const [code, inds] of Object.entries(sharedETFs)) {
  const primary = inds[0];
  const sig = industries.find((i) => i.id === primary.id)?.market_signal;
  for (const ref of inds) {
    const label = ref.id === primary.id ? '← 原始映射' : '借用';
    report += `| ${ref.name} | ${code} | ${primary.name} | ${sig ? pct(sig.return_6m_pct) : 'N/A'} | ${label} |\n`;
  }
}

if (noSignal.length > 0) {
  report += `\n无市场信号行业（${noSignal.length} 个）：\n\n`;
  report += noSignal.map((i) => `- ${i.name}`).join('\n') + '\n';
}

report += '\n---\n\n';

// 2. 2x2 matrix
report += '## 2. 2×2 政策-行情矩阵\n\n';
report += `- 政策分中位数：${policyMedian}/15\n`;
report += `- 行情中位数（6月回报）：${pct(marketMedian)}\n\n`;

report += '| | 行情强 | 行情弱 |\n';
report += '|------|--------|--------|\n';
report += `| **政策强** | 共振 ${matrix.resonance.length} 个 | 政策先行 ${matrix.policyLeading.length} 个 |\n`;
report += `| **政策弱** | 市场驱动 ${matrix.marketDriven.length} 个 | 双弱 ${matrix.bothWeak.length} 个 |\n`;

report += '\n';

function matrixTable(title, items) {
  report += `### ${title}（${items.length} 个）\n\n`;
  if (items.length === 0) {
    report += '（无）\n\n';
    return;
  }
  report += '| 行业 | 政策分 | 6月回报 | 省级 | 城市 | 规划 | 国家 | 资源 | 市场信号 |\n';
  report += '|------|--------|---------|------|------|------|------|------|----------|\n';
  for (const d of items.sort((a, b) => b.returns.m6 - a.returns.m6)) {
    report += `| ${d.name} | ${d.policy.total} | ${pct(d.returns.m6)} | ${d.policy.provincial} | ${d.policy.cityExec} | ${d.policy.planCommit} | ${d.policy.national} | ${d.policy.resource} | ${d.signal} |\n`;
  }
  report += '\n';
}

matrixTable('共振 — 政策与行情一致（高确信）', matrix.resonance);
matrixTable('市场驱动 — 行情强但政策支撑弱', matrix.marketDriven);
matrixTable('政策先行 — 政策强但行情尚未确认（待观察）', matrix.policyLeading);
matrixTable('双弱 — 政策弱且行情弱（回避）', matrix.bothWeak);

report += '---\n\n';

// 3. Resonance list with details
report += '## 3. 共振行业详情\n\n';
if (matrix.resonance.length === 0) {
  report += '（无）\n\n';
} else {
  for (const d of matrix.resonance.sort((a, b) => b.returns.m6 - a.returns.m6)) {
    const ind = industries.find((i) => i.id === d.id);
    report += `### ${d.name}（${d.etf_code}）\n\n`;
    report += `- **6月回报**：${pct(d.returns.m6)} | 3月：${pct(d.returns.m3)} | 1月：${pct(d.returns.m1)}\n`;
    report += `- **政策分**：${d.policy.total}/15（省级${d.policy.provincial} 城市${d.policy.cityExec} 规划${d.policy.planCommit} 国家${d.policy.national} 资源${d.policy.resource}）\n`;
    report += `- **资金方向**：${d.fundFlow} | 成交量：${d.volumeTrend}\n`;
    report += `- **市场判断**：${d.signal}\n`;
    if (ind.provincial_evidence?.zj_signal) {
      report += `- **浙江信号**：${ind.provincial_evidence.zj_signal}\n`;
    }
    if (ind.work_report?.national?.mention) {
      report += `- **国家定调**：${ind.work_report.national.mention}\n`;
    }
    report += '\n';
  }
}

report += '---\n\n';

// 4. Divergence analysis
report += '## 4. 背离行业分析\n\n';

report += '### 政策先行（政策强 + 行情弱）\n\n';
if (matrix.policyLeading.length === 0) {
  report += '（无）\n\n';
} else {
  report += '这些行业政策力度大但市场价格尚未反映，可能原因：政策落地周期长、产业仍处早期阶段、或市场尚未定价。需逐个定性判断。\n\n';
  for (const d of matrix.policyLeading.sort((a, b) => b.policy.total - a.policy.total)) {
    const ind = industries.find((i) => i.id === d.id);
    const reasons = [];
    if (d.returns.m6 < 0) reasons.push('6月负回报');
    if (d.returns.m6 < 5) reasons.push('涨幅显著落后政策力度');
    if (d.fundFlow === '流出') reasons.push('资金净流出');
    if (d.signal === '暂不确认') reasons.push('市场信号暂不确认');
    report += `- **${d.name}**（${pct(d.returns.m6)}，政策分 ${d.policy.total}）：${reasons.join('；') || '待观察'}\n`;
  }
  report += '\n';
}

report += '### 市场驱动（政策弱 + 行情强）\n\n';
if (matrix.marketDriven.length === 0) {
  report += '（无）\n\n';
} else {
  report += '这些行业行情表现好但政策支撑力度有限，可能由行业自身景气度、业绩驱动或市场情绪推动。\n\n';
  for (const d of matrix.marketDriven.sort((a, b) => b.returns.m6 - a.returns.m6)) {
    report += `- **${d.name}**（${pct(d.returns.m6)}，政策分 ${d.policy.total}）：政策维度偏弱，行情可能非政策驱动\n`;
  }
  report += '\n';
}

report += '---\n\n';

// 5. Dimension effects
report += '## 5. 分维度解释力排序\n\n';
report += '比较每个政策维度高分（3分）vs 低分（0-1分）组的平均 6 月回报差异：\n\n';
report += '| 政策维度 | 高分平均6月回报 | 低分平均6月回报 | 差异 | 高分样本 | 低分样本 |\n';
report += '|----------|----------------|----------------|------|---------|----------|\n';
for (const r of dimEffects) {
  if (r.diff === null) {
    report += `| ${r.label} | N/A | N/A | 样本不足 | ${r.nHigh} | ${r.nLow} |\n`;
  } else {
    report += `| ${r.label} | ${pct(r.highAvg)} | ${pct(r.lowAvg)} | **${pct(r.diff)}** | ${r.nHigh} | ${r.nLow} |\n`;
  }
}
report += '\n';
report += `> 差异为正 → 该政策维度高分组行情系统性更好；差异为负 → 该维度与行情无正向关联。\n\n`;

report += '---\n\n';

// 6. Category analysis
report += '## 6. 标签类别与行情关联\n\n';
report += '按 concrete_items 中各类别条数分组（>=2条 vs 0条），比较平均 6 月回报：\n\n';
report += '| 证据类别 | 高条数组平均6月 | 零条数组平均6月 | 差异 | 高组样本 | 零组样本 |\n';
report += '|----------|----------------|----------------|------|---------|----------|\n';
for (const r of catEffects) {
  report += `| ${r.cat} | ${pct(r.highAvg)} | ${pct(r.lowAvg)} | **${pct(r.highAvg - r.lowAvg)}** | ${r.nHigh} | ${r.nLow} |\n`;
}
report += '\n';

report += '---\n\n';

// Footer
report += '## 方法论说明\n\n';
report += '- **政策打分**：五个维度等权 0-3 分，总分 0-15。基于 industries.json 中已合并的四层证据数据。\n';
report += '- **行情评分**：以 6 月回报为主要指标，辅以 3 月和 1 月回报。中位数切分"强/弱"。\n';
report += '- **ETF 去重**：多行业共用同一 ETF 的，仅保留原始映射行业参与定量分析，借用行业单独列出。\n';
report += '- **局限性**：样本量有限（独立 ETF 行业约 15-20 个），不适宜做统计显著性检验。分析结论仅供研究参考，不构成投资建议。\n';

// ---------------------------------------------------------------------------
// Write report
// ---------------------------------------------------------------------------
const outPath = path.join(dataDir, 'correlation-report.md');
fs.writeFileSync(outPath, report, 'utf8');
console.log(`Report written to ${outPath}`);
console.log(`Independent ETF industries: ${independentData.length}`);
console.log(`Borrowed ETF industries: ${borrowedIndustries.length}`);
console.log(`No signal: ${noSignal.length}`);
console.log(`Policy score median: ${policyMedian}/15`);
console.log(`Market median (6m): ${pct(marketMedian)}`);
console.log(`Resonance: ${matrix.resonance.length} | Market-driven: ${matrix.marketDriven.length} | Policy-leading: ${matrix.policyLeading.length} | Both-weak: ${matrix.bothWeak.length}`);
