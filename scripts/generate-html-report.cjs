// Generates correlation-report.html from industries.json
// Run: node scripts/generate-html-report.cjs
// Logic mirrors analyze-correlation.cjs

const fs = require('fs');
const path = require('path');
const dataDir = path.join(__dirname, '..', 'data');
const { industries } = JSON.parse(fs.readFileSync(path.join(dataDir, 'industries.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Helpers (same as analyze-correlation.cjs)
// ---------------------------------------------------------------------------
const hasNumber = (text) => /[\d.]+万|[\d.]+亿|[\d.]+千|[\d.]+个|[\d.]+%|[\d.]+兆|[\d.]+家|[\d.]+项|[\d.]+座|[\d.]+倍/.test(text);
const S = { '强落地': '强', '有落地': '中', '弱落地': '弱' };
const M = { '双重验证': '强', '温和确认': '中', '市场分歧': '弱', '暂不确认': '弱', '数据不足': '无' };
const A = { '重点推进': '强', '持续推进': '中', '早期培育': '弱', '监管规范': '弱', '制度构建': '弱' };

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

function layerSignals(ind) {
  const eq = evidenceQuality(ind);
  const nat = ind.work_report?.national?.action_level;
  const national = A[nat] || '无';
  const zj = ind.provincial_evidence?.zj_intensity;
  const provincial = S[zj] || '无';
  let keyCities = 0, totalCities = 0;
  for (const [, ev] of Object.entries(ind.city_evidence || {})) {
    totalCities++;
    if (ev?.action_level === '重点推进') keyCities++;
  }
  const cityExec = keyCities >= 3 ? '强' : keyCities >= 1 ? '中' : totalCities > 0 ? '弱' : '无';
  const planScore = eq.quan * 3 + eq.eng * 2 + eq.plat * 1.5 + eq.vague * 0.5;
  const planCommit = eq.quan >= 2 ? '强' : eq.quan >= 1 || eq.eng >= 3 ? '中' : planScore > 0 ? '弱' : '无';
  const ms = ind.market_signal?.signal;
  const market = M[ms] || '无';
  return { national, provincial, cityExec, planCommit, market, eq };
}

function dataQuality(ind) {
  const etf = ind.investment_observation?.etf;
  const ms = ind.market_signal;
  if (!ms) return { label: '缺数据', tag: '🔴' };
  const conf = etf?.confidence;
  const hasExact = conf === '精准匹配';
  const code = ms.etf_code;
  const sharers = industries.filter((i) => i.market_signal?.etf_code === code);
  const isUnique = sharers.length === 1;
  if (isUnique && hasExact) return { label: '独立ETF·精准', tag: '🟢' };
  if (isUnique && conf === '相关匹配') return { label: '独立ETF·相关', tag: '🟡' };
  if (!isUnique && hasExact) return { label: '共享ETF·精准', tag: '🟡' };
  if (!isUnique && conf === '相关匹配') return { label: '共享ETF·相关', tag: '🟠' };
  const label = ms.signal_label || '';
  if (label.includes('借用') || label.includes('无纯') || label.includes('近似') || label.includes('映射精度有限'))
    return { label: '借用ETF·代理弱', tag: '🟠' };
  return { label: '待核查', tag: '🟡' };
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------
const STRATEGIES = {
  CORE: '核心配置', LEFT: '左侧观察', MOMENTUM: '动量交易',
  DIFFUSION: '政策扩散', LOCAL: '地方行情', EXCLUDE: '排除池',
};
const STRATEGY_RULES = {
  [STRATEGIES.CORE]: { action: '等回调15-20%分批买', position: '≤15%/只，合计≤60%', stop: '不止损行业，止损时机', exit: '省级降级或资金连续4周流出', horizon: '中长期' },
  [STRATEGIES.LEFT]: { action: '等≥2层信号改善再进', position: '3-5%试仓', stop: '量化目标下修→清仓', exit: '12个月无改善→放弃', horizon: '12个月+' },
  [STRATEGIES.MOMENTUM]: { action: '纯技术面入场', position: '≤5%/只，合计≤15%', stop: '严格技术止损', exit: '趋势破位即出', horizon: '短线' },
  [STRATEGIES.DIFFUSION]: { action: '等城市层新增重点推进信号', position: '5-8%', stop: '6个月无新信号→减半', exit: '省级降级或资金持续流出', horizon: '中期' },
  [STRATEGIES.LOCAL]: { action: '波段操作，快进快出', position: '3-5%', stop: '严格', exit: '目标位到就走', horizon: '短线波段' },
  [STRATEGIES.EXCLUDE]: { action: '不做', position: '—', stop: '—', exit: '—', horizon: '—' },
};

const STRATEGY_LABELS = [
  [STRATEGIES.CORE, '一、核心配置 · 回调即买'],
  [STRATEGIES.LEFT, '二、左侧观察 · 等催化剂'],
  [STRATEGIES.DIFFUSION, '三、政策扩散 · 等城市落地'],
  [STRATEGIES.MOMENTUM, '四、动量交易 · 不靠政策逻辑'],
  [STRATEGIES.LOCAL, '五、地方行情 · 波段操作'],
  [STRATEGIES.EXCLUDE, '六、排除池 · 不做'],
];

const STRATEGY_COLORS = {
  '核心配置': { tag: 'tag-core', border: '#16a34a' },
  '左侧观察': { tag: 'tag-left', border: '#d97706' },
  '动量交易': { tag: 'tag-momentum', border: '#9333ea' },
  '政策扩散': { tag: 'tag-diffusion', border: '#2563eb' },
  '地方行情': { tag: 'tag-local', border: '#71717a' },
  '排除池': { tag: 'tag-exclude', border: '#dc2626' },
};

// ---------------------------------------------------------------------------
// Build matrix
// ---------------------------------------------------------------------------
const matrix = industries.map((ind) => {
  const layers = layerSignals(ind);
  const dq = dataQuality(ind);
  const strongLayers = [layers.national, layers.provincial, layers.cityExec, layers.planCommit, layers.market].filter((s) => s === '强').length;
  const policyStrong = [layers.national, layers.provincial, layers.cityExec, layers.planCommit].filter((s) => s === '强').length;
  const marketStrong = layers.market === '强';
  const weakLayers = [layers.national, layers.provincial, layers.cityExec, layers.planCommit, layers.market].filter((s) => s === '弱' || s === '无').length;

  let consensus;
  if (strongLayers >= 4) consensus = '高度共识';
  else if (policyStrong >= 3 && !marketStrong) consensus = '政策先行';
  else if (marketStrong && policyStrong <= 1) consensus = '市场驱动';
  else if (weakLayers >= 3) consensus = '全面偏弱';
  else if (policyStrong >= 2 && marketStrong) consensus = '政策-市场共振';
  else consensus = '信号分散';

  const ioetf = ind.investment_observation?.etf;
  return {
    id: ind.id, name: ind.name, layers, consensus, strongLayers, policyStrong, dq,
    etf_code: ind.market_signal?.etf_code || '-',
    etf_name: ioetf?.name || '',
    etf_index: ioetf?.index || '',
    etf_note: ioetf?.note || '',
    ret6m: ind.market_signal?.return_6m_pct,
    ret1y: ind.market_signal?.return_1y_pct,
    signal: ind.market_signal?.signal || '-',
    flow: ind.market_signal?.fund_flow_direction || '-',
  };
});

for (const m of matrix) {
  const L = m.layers;
  const policyStrong = [L.national, L.provincial, L.cityExec, L.planCommit].filter(s => s === '强').length;
  const marketOk = L.market === '强' || L.market === '中';
  const topStrong = L.national === '强' || L.provincial === '强';

  if (m.consensus === '高度共识') m.strategy = STRATEGIES.CORE;
  else if (m.consensus === '政策先行') m.strategy = STRATEGIES.LEFT;
  else if (m.consensus === '信号分散') {
    if (marketOk && policyStrong <= 1) m.strategy = STRATEGIES.MOMENTUM;
    else if (topStrong && (L.cityExec === '弱' || L.cityExec === '无' || L.planCommit === '弱' || L.planCommit === '无' || L.planCommit === '中')) m.strategy = STRATEGIES.DIFFUSION;
    else if ((L.planCommit === '强' || L.planCommit === '中') && (L.national === '弱' || L.national === '无' || L.national === '中')) m.strategy = STRATEGIES.LOCAL;
    else m.strategy = STRATEGIES.LOCAL;
  } else m.strategy = STRATEGIES.EXCLUDE;

  m.rules = STRATEGY_RULES[m.strategy];
}

const stratOrder = { '核心配置': 0, '左侧观察': 1, '政策扩散': 2, '动量交易': 3, '地方行情': 4, '排除池': 5 };
matrix.sort((a, b) => (stratOrder[a.strategy] ?? 9) - (stratOrder[b.strategy] ?? 9) || b.strongLayers - a.strongLayers);

// ---------------------------------------------------------------------------
// Helpers for HTML
// ---------------------------------------------------------------------------
const pct = (n) => (n == null ? '—' : (n >= 0 ? '+' : '') + n.toFixed(1) + '%');
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

const s = (v) => {
  if (v === '强') return '🟢'; if (v === '中') return '🟡'; if (v === '弱') return '🟠'; return '⚪';
};

const flowClass = (f) => f === '流入' ? 'flow-in' : f === '流出' ? 'flow-out' : '';
const retClass = (n) => n == null ? 'return-na' : n >= 0 ? 'return-pos' : 'return-neg';

// ---------------------------------------------------------------------------
// Dist stats
// ---------------------------------------------------------------------------
const dist = {}; for (const m of matrix) { dist[m.consensus] = (dist[m.consensus] || 0) + 1; }
const stratDist = {}; for (const m of matrix) { stratDist[m.strategy] = (stratDist[m.strategy] || 0) + 1; }

// ---------------------------------------------------------------------------
// HTML string builder
// ---------------------------------------------------------------------------
let H = '';
H += '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n';
H += '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
H += '<title>五层信号共识矩阵 & 投资策略框架 v2 — 政策资金流向雷达</title>\n';
H += '<style>\n';
H += `:root{--bg:#fafafa;--card:#fff;--text:#18181b;--muted:#71717a;--border:#e4e4e7;--accent:#2563eb;--green:#16a34a;--amber:#d97706;--red:#dc2626;--purple:#9333ea;--green-bg:#f0fdf4;--amber-bg:#fffbeb;--red-bg:#fef2f2;--blue-bg:#eff6ff;--purple-bg:#faf5ff;--zinc-bg:#f4f4f5}
2@media(prefers-color-scheme:dark){:root{--bg:#09090b;--card:#18181b;--text:#f4f4f5;--muted:#a1a1aa;--border:#27272a;--accent:#60a5fa;--green:#4ade80;--amber:#fbbf24;--red:#f87171;--purple:#c084fc;--green-bg:#052e16;--amber-bg:#451a03;--red-bg:#450a0a;--blue-bg:#172554;--purple-bg:#2e1065;--zinc-bg:#27272a}}
3*{box-sizing:border-box;margin:0;padding:0}
4body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;max-width:1280px;margin:0 auto;padding:24px 16px}
5h1{font-size:1.6em;margin-bottom:4px}h2{font-size:1.2em;margin:36px 0 16px;padding-bottom:6px;border-bottom:2px solid var(--border)}
6h3{font-size:1em;margin:20px 0 8px;font-family:monospace}.meta{color:var(--muted);font-size:.85em;margin-bottom:20px}
7.summary{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
8.summary-item{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px 18px;min-width:100px;text-align:center}
9.summary-item strong{font-size:1.5em;display:block}.summary-item span{font-size:.8em;color:var(--muted)}
10table{width:100%;border-collapse:collapse;font-size:.84em;margin:12px 0}
11th,td{padding:6px 8px;border:1px solid var(--border);text-align:left}
12th{background:var(--zinc-bg);font-weight:600;white-space:nowrap;position:sticky;top:0}
13tr:hover{background:var(--blue-bg)}
14.matrix-wrap{overflow-x:auto;margin:16px 0;border:1px solid var(--border);border-radius:8px}
15.matrix-wrap table{margin:0;font-size:.82em}.matrix-wrap td:first-child{white-space:nowrap;font-weight:600}
16.tag{display:inline-block;padding:1px 8px;border-radius:4px;font-size:.75em;font-weight:600;white-space:nowrap}
17.tag-core{background:var(--green-bg);color:var(--green)}.tag-left{background:var(--amber-bg);color:var(--amber)}
18.tag-momentum{background:var(--purple-bg);color:var(--purple)}.tag-diffusion{background:var(--blue-bg);color:var(--accent)}
19.tag-local{background:var(--zinc-bg);color:var(--muted)}.tag-exclude{background:var(--red-bg);color:var(--red)}
20.strategy-box{background:var(--card);border:2px solid var(--border);border-radius:10px;padding:20px;margin:20px 0}
21.strategy-box h3{margin-top:0;font-family:inherit}.strategy-rules{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:12px 0;font-size:.85em}
22.rule-item{background:var(--zinc-bg);border-radius:6px;padding:8px 12px}
23.rule-item strong{display:block;font-size:.75em;color:var(--muted);text-transform:uppercase;margin-bottom:2px}
24.industry-card{background:var(--card);border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin:10px 0}
25.industry-card h4{margin:0 0 8px;font-size:.95em}.industry-card ul{list-style:none;padding:0;font-size:.88em}
26.industry-card li{padding:2px 0}
27.etf-info{font-size:.85em;background:var(--zinc-bg);padding:8px 12px;border-radius:6px;margin:8px 0;line-height:1.7}
28.etf-info code{font-size:1em;background:var(--card);padding:1px 6px;border-radius:3px}
29.key-quote{font-size:.85em;color:var(--muted);padding:6px 0 6px 12px;border-left:3px solid var(--border);margin:6px 0}
30.flow-in{color:var(--green)}.flow-out{color:var(--red)}
31.return-pos{color:var(--green);font-weight:600}.return-neg{color:var(--red);font-weight:600}.return-na{color:var(--muted)}
32hr{border:none;border-top:1px solid var(--border);margin:28px 0}.footer{font-size:.8em;color:var(--muted);margin-top:40px}
33.toc{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.toc a{font-size:.85em;color:var(--accent);text-decoration:none;padding:4px 10px;border:1px solid var(--border);border-radius:20px}.toc a:hover{background:var(--blue-bg)}
34@media print{body{max-width:none;padding:0;font-size:10pt}.strategy-box,.industry-card{break-inside:avoid}h2{break-after:avoid}}
35</style>\n</head>\n<body>\n`;

// Title
H += '<h1>五层信号共识矩阵 &amp; 投资策略框架 v2</h1>\n';
H += `<p class="meta">生成：${new Date().toISOString().slice(0, 10)} | ${industries.length} 个行业 | 基于证据质量加权的五层政策-市场信号共识分析</p>\n`;

// Strategy overview cards
H += '<h2>策略速览</h2>\n<div class="summary">\n';
for (const [type, label] of STRATEGY_LABELS) {
  const rules = STRATEGY_RULES[type];
  const count = stratDist[type] || 0;
  const sc = STRATEGY_COLORS[type] || { tag: '', border: '#e4e4e7' };
  H += `<div class="summary-item"><strong>${count}</strong><span>${type}</span></div>\n`;
}
H += '</div>\n';

H += '<table><tr><th>策略</th><th>入场</th><th>仓位</th><th>止损</th><th>退出</th><th>周期</th><th>数量</th></tr>\n';
for (const [type, label] of STRATEGY_LABELS) {
  const rules = STRATEGY_RULES[type];
  const count = stratDist[type] || 0;
  const sc = STRATEGY_COLORS[type] || { tag: '' };
  H += `<tr><td><span class="tag ${esc(sc.tag)}">${esc(type)}</span></td><td>${esc(rules.action)}</td><td>${esc(rules.position)}</td><td>${esc(rules.stop)}</td><td>${esc(rules.exit)}</td><td>${esc(rules.horizon)}</td><td>${count} 个</td></tr>\n`;
}
H += '</table>\n';

// Consensus distribution
H += '<h2>共识分布</h2>\n<div class="summary">\n';
for (const [type, count] of Object.entries(dist)) {
  H += `<div class="summary-item"><strong>${count}</strong><span>${esc(type)}</span></div>\n`;
}
H += '</div>\n';

// Full matrix table
H += '<h2>全行业信号矩阵</h2>\n<div class="matrix-wrap">\n<table>\n';
H += '<tr><th>行业</th><th>ETF代码</th><th>ETF名称</th><th>国家</th><th>省级</th><th>城市</th><th>规划</th><th>市场</th><th>策略</th><th>数据质量</th><th>6月</th><th>1年</th></tr>\n';
for (const m of matrix) {
  const sc = STRATEGY_COLORS[m.strategy] || { tag: '' };
  H += `<tr><td>${esc(m.name)}</td><td style="font-family:monospace;font-size:.85em">${esc(m.etf_code)}</td><td style="font-size:.82em">${esc(m.etf_name)}</td><td>${s(m.layers.national)}</td><td>${s(m.layers.provincial)}</td><td>${s(m.layers.cityExec)}</td><td>${s(m.layers.planCommit)}</td><td>${s(m.layers.market)}</td><td><span class="tag ${esc(sc.tag)}">${esc(m.strategy)}</span></td><td style="font-size:.82em">${m.dq.tag} ${esc(m.dq.label)}</td><td class="${retClass(m.ret6m)}">${pct(m.ret6m)}</td><td class="${retClass(m.ret1y)}">${pct(m.ret1y)}</td></tr>\n`;
}
H += '</table></div>\n';
H += '<p style="font-size:.82em;color:var(--muted)">🟢强 🟡中 🟠弱 ⚪无/缺</p>\n';

// Strategy sections
const CITY = { sh: '上海', sz: '深圳', hz: '杭州', nj: '南京', su: '苏州', bj: '北京', gz: '广州', hf: '合肥' };

for (const [stratType, stratLabel] of STRATEGY_LABELS) {
  const items = matrix.filter((m) => m.strategy === stratType);
  if (items.length === 0) continue;
  const first = items[0];
  const sc = STRATEGY_COLORS[stratType] || { tag: '', border: '#e4e4e7' };

  H += `<hr>\n<h2>${esc(stratLabel)}（${items.length} 个）</h2>\n`;
  H += `<div class="strategy-box" style="border-color:${sc.border}">\n<h3>策略逻辑</h3>\n`;
  if (stratType === '核心配置') H += '<p>五层政策验证 + 市场已确认 = 趋势有政策底。不是追高工具，是"等打折"清单。</p>\n';
  else if (stratType === '左侧观察') H += '<p>政策方向明确但市场尚未确认，存在预期差。等待催化剂让市场重新定价。</p>\n';
  else if (stratType === '政策扩散') H += '<p>顶层政策已定调，但城市执行和规划承诺尚未跟上。城市层"重点推进"信号是最核心的升级触发器。</p>\n';
  else if (stratType === '动量交易') H += '<p>市场有趋势但政策逻辑不构成主驱动。纯技术面交易，不依赖政策信仰。</p>\n';
  else if (stratType === '地方行情') H += '<p>政策驱动力相对分散，地方/区域因素主导。快进快出，不适合中长期持有。</p>\n';
  else if (stratType === '排除池') H += '<p>政策信号太弱或ETF映射太差，无法形成有效分析。不做就是最好的操作。</p>\n';
  H += '<div class="strategy-rules">\n';
  if (first?.rules) {
    H += `<div class="rule-item"><strong>入场</strong>${esc(first.rules.action)}</div>\n`;
    H += `<div class="rule-item"><strong>仓位</strong>${esc(first.rules.position)}</div>\n`;
    H += `<div class="rule-item"><strong>止损</strong>${esc(first.rules.stop)}</div>\n`;
    H += `<div class="rule-item"><strong>退出</strong>${esc(first.rules.exit)}</div>\n`;
    H += `<div class="rule-item"><strong>周期</strong>${esc(first.rules.horizon)}</div>\n`;
  }
  H += '</div></div>\n';

  for (const m of items) {
    const ind = industries.find((i) => i.id === m.id);
    const eq = m.layers.eq;

    H += `<div class="industry-card">\n<h4>${esc(m.name)} <code style="font-weight:400;font-size:.9em">${esc(m.etf_code)}</code> ${m.dq.tag}</h4>\n`;

    // ETF info section
    if (m.etf_name) {
      H += `<div class="etf-info"><strong>ETF：</strong>${esc(m.etf_name)}<br>`;
      H += `<strong>跟踪指数：</strong>${esc(m.etf_index)}<br>`;
      H += `<strong>简介：</strong>${esc(m.etf_note)}</div>\n`;
    }

    H += '<ul>\n';
    H += `<li><strong>共识：</strong>${esc(m.consensus)}（${m.strongLayers}/5 层强信号）</li>\n`;
    H += `<li><strong>市场：</strong>${esc(m.signal)} | 6月 <span class="${retClass(m.ret6m)}">${pct(m.ret6m)}</span> | 1年 <span class="${retClass(m.ret1y)}">${pct(m.ret1y)}</span> | 资金 <span class="${flowClass(m.flow)}">${esc(m.flow)}</span></li>\n`;
    H += `<li><strong>证据质量：</strong>量化目标 ${eq.quan} 条 | 工程项目 ${eq.eng} 条 | 产业平台 ${eq.plat} 条 | 定性提及 ${eq.vague} 条</li>\n`;
    if (ind.provincial_evidence?.zj_signal) H += `<li><strong>浙江：</strong>${esc(ind.provincial_evidence.zj_signal)}</li>\n`;
    if (ind.work_report?.national?.mention) H += `<li><strong>国家：</strong>${esc(ind.work_report.national.mention)}</li>\n`;
    H += '</ul>\n';

    // Key quantitative targets
    const citems = [
      ...(ind.provincial_evidence?.concrete_items || []).map((x) => ({ ...x, source: '浙江规划' })),
      ...Object.entries(ind.city_plan_evidence || {}).flatMap(([city, ev]) =>
        (ev?.concrete_items || []).map((x) => ({ ...x, source: CITY[city] || city }))
      ),
    ];
    const keyItems = citems.filter((x) => x.category === '量化目标' && hasNumber(x.text));
    if (keyItems.length > 0) {
      H += '<div class="key-quote"><strong>关键量化目标：</strong><br>';
      for (const item of keyItems.slice(0, 5)) {
        H += `• ${esc(item.text)}（${esc(item.source)}）<br>`;
      }
      H += '</div>\n';
    }
    H += '</div>\n';
  }
}

// Appendix
H += '<hr>\n<h2>证据质量权重说明</h2>\n';
H += '<table><tr><th>证据类型</th><th>权重</th><th>识别规则</th></tr>\n';
H += '<tr><td>量化目标（有具体数字）</td><td>3</td><td>含万/亿/%/个/兆等数值单位</td></tr>\n';
H += '<tr><td>工程项目（有名称）</td><td>2</td><td>具体项目/工程/示范名称</td></tr>\n';
H += '<tr><td>产业平台/集群</td><td>1.5</td><td>园区/集群/走廊/平台</td></tr>\n';
H += '<tr><td>定性提及</td><td>0.5</td><td>方向性表述无具体内容</td></tr>\n';
H += '</table>\n';

H += '<h2>数据质量标签说明</h2>\n';
H += '<table><tr><th>标签</th><th>含义</th></tr>\n';
H += '<tr><td>🟢 独立ETF·精准</td><td>ETF唯一映射，精准匹配该行业</td></tr>\n';
H += '<tr><td>🟡 独立ETF·相关 / 共享ETF·精准</td><td>相关性匹配或多行业共用但合理</td></tr>\n';
H += '<tr><td>🟠 借用ETF·代理弱</td><td>借用其他行业ETF，映射精度有限</td></tr>\n';
H += '<tr><td>🔴 缺数据</td><td>无市场信号</td></tr>\n';
H += '</table>\n';

H += '<div class="footer">\n<p>分析仅供研究参考，不构成投资建议。共识度基于现有五层证据的方向一致性，不涉及行情预测。</p>\n';
H += `<p>生成时间：${new Date().toISOString().slice(0, 10)} | 数据来源：Wind / East Money / 各地方政府十五五规划</p>\n</div>\n`;
H += '</body>\n</html>\n';

const outPath = path.join(dataDir, 'correlation-report.html');
fs.writeFileSync(outPath, H, 'utf8');
console.log(`Written: ${outPath}`);
console.log(`Matrix: ${matrix.length} industries`);
console.log('Consensus distribution:', Object.entries(dist).map(([k,v])=>`${k}:${v}`).join(', '));
console.log('Strategy distribution:', Object.entries(stratDist).map(([k,v])=>`${k}:${v}`).join(', '));
