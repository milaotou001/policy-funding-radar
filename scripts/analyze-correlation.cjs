const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const { industries } = JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const hasNumber = (text) => /[\d.]+万|[\d.]+亿|[\d.]+千|[\d.]+个|[\d.]+%|[\d.]+兆|[\d.]+家|[\d.]+项|[\d.]+座|[\d.]+倍/.test(text);
const S = { '强落地': '强', '有落地': '中', '弱落地': '弱' };
const M = { '双重验证': '强', '温和确认': '中', '市场分歧': '弱', '暂不确认': '弱', '数据不足': '无' };
const A = { '重点推进': '强', '持续推进': '中', '早期培育': '弱', '监管规范': '弱', '制度构建': '弱' };

// ---------------------------------------------------------------------------
// Evidence quality scoring per industry
// ---------------------------------------------------------------------------
function evidenceQuality(ind) {
  let quan = 0, eng = 0, plat = 0, vague = 0;

  for (const item of ind.provincial_evidence?.concrete_items || []) {
    if (item.category === '量化目标' && hasNumber(item.text)) quan++;
    else if (item.category === '工程项目') eng++;
    else if (item.category === '产业平台') plat++;
    else vague++;
  }
  for (const [, ev] of Object.entries(ind.city_plan_evidence || {})) {
    for (const item of ev?.concrete_items || []) {
      if (item.category === '量化目标' && hasNumber(item.text)) quan++;
      else if (item.category === '工程项目') eng++;
      else if (item.category === '产业平台') plat++;
      else vague++;
    }
  }
  return { quan, eng, plat, vague };
}

// ---------------------------------------------------------------------------
// 5-layer signal judgment
// ---------------------------------------------------------------------------
function layerSignals(ind) {
  const eq = evidenceQuality(ind);

  // Layer 1: National
  const nat = ind.work_report?.national?.action_level;
  const national = A[nat] || '无';

  // Layer 2: Provincial
  const zj = ind.provincial_evidence?.zj_intensity;
  const provincial = S[zj] || '无';

  // Layer 3: City execution
  let keyCities = 0, totalCities = 0;
  for (const [, ev] of Object.entries(ind.city_evidence || {})) {
    totalCities++;
    if (ev?.action_level === '重点推进') keyCities++;
  }
  const cityExec = keyCities >= 3 ? '强' : keyCities >= 1 ? '中' : totalCities > 0 ? '弱' : '无';

  // Layer 4: Plan commitment (quality-weighted)
  const planScore = eq.quan * 3 + eq.eng * 2 + eq.plat * 1.5 + eq.vague * 0.5;
  const planCommit = eq.quan >= 2 ? '强' : eq.quan >= 1 || eq.eng >= 3 ? '中' : planScore > 0 ? '弱' : '无';

  // Layer 5: Market
  const ms = ind.market_signal?.signal;
  const market = M[ms] || '无';

  return { national, provincial, cityExec, planCommit, market, eq };
}

// ---------------------------------------------------------------------------
// Data quality label
// ---------------------------------------------------------------------------
function dataQuality(ind) {
  const etf = ind.investment_observation?.etf;
  const ms = ind.market_signal;
  if (!ms) return { label: '缺数据', tag: '🔴' };

  const conf = etf?.confidence;
  const hasExact = conf === '精准匹配';
  const code = ms.etf_code;

  // Count how many industries share this ETF
  const sharers = industries.filter((i) => i.market_signal?.etf_code === code);
  const isUnique = sharers.length === 1;

  if (isUnique && hasExact) return { label: '独立ETF·精准', tag: '🟢' };
  if (isUnique && conf === '相关匹配') return { label: '独立ETF·相关', tag: '🟡' };
  if (!isUnique && hasExact) return { label: '共享ETF·精准', tag: '🟡' };
  if (!isUnique && conf === '相关匹配') return { label: '共享ETF·相关', tag: '🟠' };

  // Check signal label for borrowing markers
  const label = ms.signal_label || '';
  if (label.includes('借用') || label.includes('无纯') || label.includes('近似') || label.includes('映射精度有限'))
    return { label: '借用ETF·代理弱', tag: '🟠' };

  return { label: '待核查', tag: '🟡' };
}

// ---------------------------------------------------------------------------
// Build matrix for all 34 industries
// ---------------------------------------------------------------------------
const matrix = industries.map((ind) => {
  const layers = layerSignals(ind);
  const dq = dataQuality(ind);

  // Consensus: count strong layers
  const strongLayers = [layers.national, layers.provincial, layers.cityExec, layers.planCommit, layers.market]
    .filter((s) => s === '强').length;
  const policyStrong = [layers.national, layers.provincial, layers.cityExec, layers.planCommit]
    .filter((s) => s === '强').length;
  const marketStrong = layers.market === '强';
  const weakLayers = [layers.national, layers.provincial, layers.cityExec, layers.planCommit, layers.market]
    .filter((s) => s === '弱' || s === '无').length;

  // Consensus type
  let consensus;
  if (strongLayers >= 4) consensus = '高度共识';
  else if (policyStrong >= 3 && !marketStrong) consensus = '政策先行';
  else if (marketStrong && policyStrong <= 1) consensus = '市场驱动';
  else if (weakLayers >= 3) consensus = '全面偏弱';
  else if (policyStrong >= 2 && marketStrong) consensus = '政策-市场共振';
  else consensus = '信号分散';

  return {
    id: ind.id,
    name: ind.name,
    layers,
    consensus,
    strongLayers,
    policyStrong,
    dq,
    etf_code: ind.market_signal?.etf_code || '-',
    ret6m: ind.market_signal?.return_6m_pct,
    ret1y: ind.market_signal?.return_1y_pct,
    signal: ind.market_signal?.signal || '-',
    flow: ind.market_signal?.fund_flow_direction || '-',
  };
});

// ---------------------------------------------------------------------------
// Strategy classification
// ---------------------------------------------------------------------------
const STRATEGIES = {
  CORE: '核心配置',
  LEFT: '左侧观察',
  MOMENTUM: '动量交易',
  DIFFUSION: '政策扩散',
  LOCAL: '地方行情',
  EXCLUDE: '排除池',
};

const STRATEGY_RULES = {
  [STRATEGIES.CORE]: { action: '等回调15-20%分批买', position: '≤15%/只，合计≤60%', stop: '不止损行业，止损时机', exit: '省级降级或资金连续4周流出', horizon: '中长期' },
  [STRATEGIES.LEFT]: { action: '等≥2层信号改善再进', position: '3-5%试仓', stop: '量化目标下修→清仓', exit: '12个月无改善→放弃', horizon: '12个月+' },
  [STRATEGIES.MOMENTUM]: { action: '纯技术面入场', position: '≤5%/只，合计≤15%', stop: '严格技术止损', exit: '趋势破位即出', horizon: '短线' },
  [STRATEGIES.DIFFUSION]: { action: '等城市层新增重点推进信号', position: '5-8%', stop: '6个月无新信号→减半', exit: '省级降级或资金持续流出', horizon: '中期' },
  [STRATEGIES.LOCAL]: { action: '波段操作，快进快出', position: '3-5%', stop: '严格', exit: '目标位到就走', horizon: '短线波段' },
  [STRATEGIES.EXCLUDE]: { action: '不做', position: '—', stop: '—', exit: '—', horizon: '—' },
};

for (const m of matrix) {
  const L = m.layers;
  const policyWeak = [L.national, L.provincial, L.cityExec, L.planCommit].filter(s => s === '弱' || s === '无').length;
  const policyStrong = [L.national, L.provincial, L.cityExec, L.planCommit].filter(s => s === '强').length;
  const marketOk = L.market === '强' || L.market === '中';
  const topStrong = L.national === '强' || L.provincial === '强';

  if (m.consensus === '高度共识') {
    m.strategy = STRATEGIES.CORE;
  } else if (m.consensus === '政策先行') {
    m.strategy = STRATEGIES.LEFT;
  } else if (m.consensus === '信号分散') {
    if (marketOk && policyStrong <= 1) {
      // Market moves but policy isn't the clear driver
      m.strategy = STRATEGIES.MOMENTUM;
    } else if (topStrong && (L.cityExec === '弱' || L.cityExec === '无' || L.planCommit === '弱' || L.planCommit === '无' || L.planCommit === '中')) {
      // Top-down policy exists but city/plan layers lag
      m.strategy = STRATEGIES.DIFFUSION;
    } else if ((L.planCommit === '强' || L.planCommit === '中') && (L.national === '弱' || L.national === '无' || L.national === '中')) {
      // Plan/regional driving, national weak
      m.strategy = STRATEGIES.LOCAL;
    } else {
      m.strategy = STRATEGIES.LOCAL;
    }
  } else {
    m.strategy = STRATEGIES.EXCLUDE;
  }
  m.rules = STRATEGY_RULES[m.strategy];
}

// ---------------------------------------------------------------------------
// Sort: strategy priority
// ---------------------------------------------------------------------------
const stratOrder = { '核心配置': 0, '左侧观察': 1, '政策扩散': 2, '动量交易': 3, '地方行情': 4, '排除池': 5 };
matrix.sort((a, b) => (stratOrder[a.strategy] ?? 9) - (stratOrder[b.strategy] ?? 9) || b.strongLayers - a.strongLayers);

// ---------------------------------------------------------------------------
// Build report
// ---------------------------------------------------------------------------
const pct = (n) => (n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1) + '%');

let R = '';
R += '# 政策-行情信号共识分析报告\n\n';
R += `> 生成：${new Date().toISOString().slice(0, 10)} | ${industries.length} 个行业\n\n`;
R += '---\n\n';

// Summary stats
R += '## 共识分布\n\n';
const dist = {};
for (const m of matrix) {
  dist[m.consensus] = (dist[m.consensus] || 0) + 1;
}
for (const [type, count] of Object.entries(dist)) {
  R += `- **${type}**：${count} 个\n`;
}
R += '\n---\n\n';

// Main table
// Strategy summary
const stratDist = {};
for (const m of matrix) {
  stratDist[m.strategy] = (stratDist[m.strategy] || 0) + 1;
}
R += '## 策略分布\n\n';
for (const [type, count] of Object.entries(stratDist)) {
  R += `- **${type}**：${count} 个\n`;
}
R += '\n---\n\n';

R += '## 全行业信号矩阵\n\n';
R += '| 行业 | 国家 | 省级 | 城市 | 规划 | 市场 | 策略类型 | 数据质量 | 6月 | 1年 |\n';
R += '|------|------|------|------|------|------|----------|----------|-----|-----|\n';

for (const m of matrix) {
  const s = (v) => {
    if (v === '强') return '🟢';
    if (v === '中') return '🟡';
    if (v === '弱') return '🟠';
    return '⚪';
  };
  R += `| ${m.name} | ${s(m.layers.national)} | ${s(m.layers.provincial)} | ${s(m.layers.cityExec)} | ${s(m.layers.planCommit)} | ${s(m.layers.market)} | ${m.strategy} | ${m.dq.tag} ${m.dq.label} | ${pct(m.ret6m)} | ${pct(m.ret1y)} |\n`;
}

R += `\n> 🟢强 🟡中 🟠弱 ⚪无/缺\n`;
R += '\n---\n\n';

// Detail sections
function strategySection(title, items) {
  if (items.length === 0) return;
  const first = items[0];
  R += `## ${title}（${items.length} 个）\n\n`;
  if (first?.rules) {
    R += `> **操作**：${first.rules.action} | **仓位**：${first.rules.position} | **止损**：${first.rules.stop} | **退出**：${first.rules.exit} | **周期**：${first.rules.horizon}\n\n`;
  }
  for (const m of items) {
    const ind = industries.find((i) => i.id === m.id);
    const eq = m.layers.eq;
    R += `### ${m.name} \`${m.etf_code}\` ${m.dq.tag}\n\n`;
    R += `- **共识**：${m.consensus}（${m.strongLayers}/5 层强信号）\n`;
    R += `- **市场**：${m.signal} | 6月 ${pct(m.ret6m)} | 1年 ${pct(m.ret1y)} | 资金 ${m.flow}\n`;
    R += `- **证据质量**：量化目标 ${eq.quan} 条 | 工程项目 ${eq.eng} 条 | 产业平台 ${eq.plat} 条 | 定性提及 ${eq.vague} 条\n`;

    if (ind.provincial_evidence?.zj_signal) {
      R += `- **浙江**：${ind.provincial_evidence.zj_signal}\n`;
    }
    if (ind.work_report?.national?.mention) {
      R += `- **国家**：${ind.work_report.national.mention}\n`;
    }

    // Key concrete items
    const items = [
      ...(ind.provincial_evidence?.concrete_items || []).map((x) => ({ ...x, source: '浙江规划' })),
      ...Object.entries(ind.city_plan_evidence || {}).flatMap(([city, ev]) =>
        (ev?.concrete_items || []).map((x) => ({ ...x, source: CITY[city] || city }))
      ),
    ];
    const keyItems = items.filter((x) => x.category === '量化目标' && hasNumber(x.text));
    if (keyItems.length > 0) {
      R += `- **关键量化目标**：\n`;
      for (const item of keyItems.slice(0, 5)) {
        R += `  - ${item.text}（${item.source}）\n`;
      }
    }
    R += '\n';
  }
  R += '---\n\n';
}

const CITY = { sh: '上海', sz: '深圳', hz: '杭州', nj: '南京', su: '苏州', bj: '北京', gz: '广州', hf: '合肥' };

groupSection = strategySection;

// Strategy-grouped detail sections
for (const [stratType, stratLabel] of [
  [STRATEGIES.CORE, '一、核心配置 · 回调即买'],
  [STRATEGIES.LEFT, '二、左侧观察 · 等催化剂'],
  [STRATEGIES.DIFFUSION, '三、政策扩散 · 等城市落地'],
  [STRATEGIES.MOMENTUM, '四、动量交易 · 不靠政策逻辑'],
  [STRATEGIES.LOCAL, '五、地方行情 · 波段操作'],
  [STRATEGIES.EXCLUDE, '六、排除池 · 不做'],
]) {
  const items = matrix.filter((m) => m.strategy === stratType);
  if (items.length > 0) groupSection(stratLabel, items);
}

// Evidence quality note
R += '## 证据质量权重说明\n\n';
R += '| 证据类型 | 权重 | 识别规则 |\n';
R += '|---------|------|---------|\n';
R += '| 量化目标（有具体数字） | 3 | 含万/亿/%/个/兆等数值单位 |\n';
R += '| 工程项目（有名称） | 2 | 具体项目/工程/示范名称 |\n';
R += '| 产业平台/集群 | 1.5 | 园区/集群/走廊/平台 |\n';
R += '| 定性提及 | 0.5 | 方向性表述无具体内容 |\n';
R += '\n';
R += '## 数据质量标签说明\n\n';
R += '| 标签 | 含义 |\n';
R += '|------|------|\n';
R += '| 🟢 独立ETF·精准 | ETF唯一映射，精准匹配该行业 |\n';
R += '| 🟡 独立ETF·相关 / 共享ETF·精准 | 相关性匹配或多行业共用但合理 |\n';
R += '| 🟠 借用ETF·代理弱 | 借用其他行业ETF，映射精度有限 |\n';
R += '| 🔴 缺数据 | 无市场信号 |\n';

// Footer
R += '\n---\n\n';
R += '> 分析仅供研究参考，不构成投资建议。共识度基于现有五层证据的方向一致性，不涉及行情预测。\n';

const outPath = path.join(dataDir, 'correlation-report.md');
fs.writeFileSync(outPath, R, 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Industries: ${industries.length}`);
console.log('Consensus:');
for (const [type, count] of Object.entries(dist)) {
  console.log(`  ${type}: ${count}`);
}
