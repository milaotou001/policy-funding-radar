import type { Industry, DirectionJudgment, PolicyMomentum, ExecutionLevel, MarketStance, ConvictionTier, WatchItem } from "./types";

export type SignalLevel = "🟢" | "🟡" | "🟠" | "⚪";

export interface IndustrySignals {
  national: SignalLevel;
  provincial: SignalLevel;
  city: SignalLevel;
  plan: SignalLevel;
  market: SignalLevel;
  strategy: string;
  return3m: string;
  return6m: string;
  return1y: string;
  etfConfidence: string;
  etfCode: string;
  dataDate: string;
  direction: DirectionJudgment;
}

function nationalSignal(ind: Industry): SignalLevel {
  const i = ind.investment_observation.resource_intensity;
  if (i === "高") return "🟢";
  if (i.startsWith("中")) return "🟡";
  return "🟠";
}

function provincialSignal(ind: Industry): SignalLevel {
  const zj = ind.provincial_evidence?.zj_intensity;
  if (zj === "强落地") return "🟢";
  if (zj === "有落地") return "🟡";
  if (zj === "弱落地") return "🟠";
  return "⚪";
}

function citySignal(ind: Industry): SignalLevel {
  const ce = ind.city_evidence;
  if (!ce || Object.keys(ce).length === 0) return "⚪";
  const hasPriority = Object.values(ce).some(
    (e) => e.action_level === "重点推进"
  );
  return hasPriority ? "🟢" : "🟡";
}

function planSignal(ind: Industry): SignalLevel {
  const pe = ind.city_plan_evidence;
  if (!pe || Object.keys(pe).length === 0) return "⚪";
  const hasStrong = Object.values(pe).some((e) => e.intensity === "强落地");
  return hasStrong ? "🟢" : "🟡";
}

function marketSignal(ind: Industry): SignalLevel {
  const s = ind.market_signal?.signal;
  if (s === "双重验证") return "🟢";
  if (s === "温和确认") return "🟡";
  if (s === "市场分歧") return "🟠";
  return "⚪";
}

// --- 3D direction judgment ---

function computePolicyMomentum(ind: Industry): PolicyMomentum {
  const ct = ind.change_type;
  if (ct.includes("新增") || ct.includes("全新")) return "政策初现";
  if (ct.includes("大幅强化")) return "政策加速";
  if (ct.includes("强化")) return "政策稳定";
  if (ct.includes("弱化")) return "政策减速";
  return "政策稳定";
}

// Industries whose natural industrial centers are NOT in the 9 sampled cities
// (Shanghai/Shenzhen/Hangzhou/Nanjing/Suzhou/Beijing/Guangzhou/Hefei/Wuhan)
// Wuhan adds coverage for: seed, TCM, agritech, carbon, ice-snow, hydrogen, green-finance, manufacturing
// Remaining gaps: deep-sea (→ 青岛), nuclear-energy (→ 核电基地城市), critical-minerals (→ 赣/蒙/川)
const CITY_SAMPLE_MISMATCH: Set<string> = new Set([
  "deep-sea",                      // 深海 → 青岛/三亚/厦门
  "nuclear-energy",                // 核电 → 沿海核电基地城市
  "critical-minerals",             // 关键矿产 → 江西/内蒙古/四川
]);

function computeExecutionLevel(ind: Industry): ExecutionLevel {
  const zj = ind.provincial_evidence?.zj_intensity;
  const wr = ind.work_report?.national?.action_level;
  const cityEvidence = ind.city_evidence;
  const priorityCities = cityEvidence
    ? Object.values(cityEvidence).filter((e) => e.action_level === "重点推进").length
    : 0;
  const totalCities = cityEvidence ? Object.keys(cityEvidence).length : 0;

  if (zj === "强落地" && wr === "重点推进" && priorityCities >= 2) return "强执行";
  if (zj === "强落地" || wr === "重点推进") return "有执行";
  if (zj === "有落地" || priorityCities >= 1) return "弱执行";
  if (totalCities === 0 && CITY_SAMPLE_MISMATCH.has(ind.id)) return "样本偏差";
  return "无证据";
}

function computeMarketStance(ind: Industry): MarketStance {
  const s = ind.market_signal?.signal;
  const flow = ind.market_signal?.fund_flow_direction;
  if (!s || s === "数据不足") return "无数据";
  if (s === "双重验证") return "资金认同";
  if (s === "温和确认") return "资金观望";
  if (s === "市场分歧") return "资金分歧";
  if (s === "暂不确认" && flow === "流出") return "资金流出";
  return "资金观望";
}

function detectContradiction(
  momentum: PolicyMomentum,
  execution: ExecutionLevel,
  market: MarketStance
): string | null {
  // Policy pushing hard but market disagrees → potential early opportunity
  if (
    (momentum === "政策加速" || momentum === "政策初现") &&
    (execution === "强执行" || execution === "有执行") &&
    (market === "资金分歧" || market === "资金流出")
  ) {
    return "政策强推但市场未认——可能是左侧机会，也可能政策空转";
  }
  // Market buying but policy retreating → exit signal
  if (
    momentum === "政策减速" &&
    (market === "资金认同" || market === "资金观望")
  ) {
    return "政策退潮但资金未撤——注意见顶风险";
  }
  // Strong market without execution evidence → hype risk (only if sample IS relevant)
  if (
    market === "资金认同" &&
    execution === "无证据"
  ) {
    return "资金先行但无落地证据——警惕炒作退潮";
  }
  return null;
}

function computeConviction(
  momentum: PolicyMomentum,
  execution: ExecutionLevel,
  market: MarketStance,
  _contradiction: string | null
): { conviction: ConvictionTier; action: string; falsification: string } {
  // High conviction: everything aligned
  if (
    (momentum === "政策加速" || momentum === "政策稳定") &&
    (execution === "强执行") &&
    (market === "资金认同" || market === "资金观望")
  ) {
    return {
      conviction: "高信念",
      action: "回调15-20%分批建仓，单只≤15%",
      falsification: "省级降级 或 资金连续4周净流出 → 减仓",
    };
  }

  // Policy strong, execution good, market hasn't caught on → left-side
  if (
    (momentum === "政策加速" || momentum === "政策初现") &&
    (execution === "强执行" || execution === "有执行") &&
    (market === "资金分歧" || market === "无数据")
  ) {
    return {
      conviction: "中等信念",
      action: "等市场确认信号后试仓3-5%，或等待催化剂",
      falsification: "6个月内无新增城市落地 → 放弃",
    };
  }

  // Steady trend with execution
  if (
    momentum === "政策稳定" &&
    (execution === "有执行" || execution === "强执行") &&
    market !== "资金流出"
  ) {
    return {
      conviction: "中等信念",
      action: "已有仓位持有，新仓等回调",
      falsification: "省级降级 或 下期报告不再提及 → 清仓",
    };
  }

  // Policy strong but 8-city sample doesn't cover this industry → rely on national+provincial
  if (
    (momentum === "政策加速" || momentum === "政策初现") &&
    execution === "样本偏差"
  ) {
    return {
      conviction: "中等信念",
      action: "9城样本未见是正常的——该产业重心不在这些城市。以国家和省级信号为准，另找对口城市验证",
      falsification: "省级降级 或 下期报告不再提及 → 降信念",
    };
  }

  // Policy stable but 8-city sample doesn't cover → rely on national+provincial
  if (momentum === "政策稳定" && execution === "样本偏差") {
    return {
      conviction: "低信念",
      action: "9城样本未覆盖，等省级落地证据或对口城市信息",
      falsification: "下期工作报告不再提及 → 排除",
    };
  }

  // Policy accelerating but execution weak → watch
  if (
    (momentum === "政策加速" || momentum === "政策初现") &&
    execution === "弱执行"
  ) {
    return {
      conviction: "低信念",
      action: "列入观察清单，等省级落地证据出现再行动",
      falsification: "下期工作报告不再提及 → 排除",
    };
  }

  // Market buying with steady policy → momentum trade
  if (
    momentum === "政策稳定" &&
    execution === "弱执行" &&
    (market === "资金认同" || market === "资金观望")
  ) {
    return {
      conviction: "低信念",
      action: "纯技术面短线操作，不靠政策逻辑持仓",
      falsification: "趋势破位即出",
    };
  }

  // Policy retreating → avoid
  if (momentum === "政策减速") {
    return {
      conviction: "回避",
      action: "不做，等政策信号反转",
      falsification: "—",
    };
  }

  // No evidence anywhere → avoid
  if (execution === "无证据" && market === "无数据") {
    return {
      conviction: "观望",
      action: "等待任何一层出现信号",
      falsification: "—",
    };
  }

  // Default: low conviction
  return {
    conviction: "低信念",
    action: "信号不足，轻仓或无仓",
    falsification: "信号恶化 → 清仓",
  };
}

function computeWatchItems(ind: Industry): WatchItem[] {
  const items: WatchItem[] = [];

  // Provincial intensity — relevant for "省级降级" conditions
  const zj = ind.provincial_evidence?.zj_intensity;
  if (zj) {
    items.push({
      label: "省级落地强度",
      current: zj,
      threshold: zj === "强落地" ? "降至有落地或弱落地即证伪" : "降至弱落地即证伪",
      status: zj === "弱落地" ? "watch" : "safe",
    });
  }

  // Market fund flow — relevant for "资金流出" conditions
  const flow = ind.market_signal?.fund_flow_direction;
  if (flow) {
    items.push({
      label: "资金方向",
      current: flow,
      threshold: "连续4周净流出即证伪",
      status: flow === "流出" ? "triggered" : "safe",
    });
  }

  // Market signal — relevant for market-based conditions
  const ms = ind.market_signal?.signal;
  if (ms) {
    items.push({
      label: "市场信号",
      current: ms,
      threshold: ms === "双重验证" ? "降至市场分歧即证伪" : "降至暂不确认即证伪",
      status: ms === "暂不确认" ? "triggered" : ms === "市场分歧" ? "watch" : "safe",
    });
  }

  // Work report action level — relevant for "下期报告不再提及"
  const wr = ind.work_report?.national?.action_level;
  if (wr) {
    items.push({
      label: "国家工作报告动作级别",
      current: wr,
      threshold: "下期不再提及即证伪",
      status: wr === "早期培育" || wr === "监管规范" ? "watch" : "safe",
    });
  }

  // City evidence coverage
  const cityCount = ind.city_evidence ? Object.keys(ind.city_evidence).length : 0;
  if (cityCount > 0) {
    items.push({
      label: "城市落地覆盖",
      current: `${cityCount}/9 城有证据`,
      threshold: "6个月内无新增城市落地即证伪",
      status: cityCount <= 2 ? "watch" : "safe",
    });
  }

  return items;
}

function strategyType(signals: SignalLevel[]): string {
  const greenCount = signals.filter((s) => s === "🟢").length;
  if (greenCount >= 4) return "核心配置";
  if (greenCount === 3) {
    return signals[4] === "⚪" ? "左侧观察" : "政策扩散";
  }
  if (greenCount === 2) return "地方行情";
  if (greenCount === 1) return "动量交易";
  return "排除池";
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return v > 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`;
}

export function computeSignals(ind: Industry): IndustrySignals {
  const signals: SignalLevel[] = [
    nationalSignal(ind),
    provincialSignal(ind),
    citySignal(ind),
    planSignal(ind),
    marketSignal(ind),
  ];

  const momentum = computePolicyMomentum(ind);
  const execution = computeExecutionLevel(ind);
  const market = computeMarketStance(ind);
  const contradiction = detectContradiction(momentum, execution, market);
  const { conviction, action, falsification } = computeConviction(
    momentum,
    execution,
    market,
    contradiction
  );

  return {
    national: signals[0],
    provincial: signals[1],
    city: signals[2],
    plan: signals[3],
    market: signals[4],
    strategy: strategyType(signals),
    return3m: fmtPct(ind.market_signal?.return_3m_pct),
    return6m: fmtPct(ind.market_signal?.return_6m_pct),
    return1y: fmtPct(ind.market_signal?.return_1y_pct),
    etfConfidence: ind.investment_observation.etf?.confidence || "暂无对应",
    etfCode: ind.market_signal?.etf_code || "",
    dataDate: ind.market_signal?.updated || "",
    direction: {
      policyMomentum: momentum,
      executionLevel: execution,
      marketStance: market,
      conviction,
      contradiction,
      action,
      falsification,
      watchItems: computeWatchItems(ind),
    },
  };
}

export const SIGNAL_COLORS: Record<SignalLevel, string> = {
  "🟢": "text-emerald-600 dark:text-emerald-400",
  "🟡": "text-amber-600 dark:text-amber-400",
  "🟠": "text-orange-500 dark:text-orange-400",
  "⚪": "text-zinc-300 dark:text-zinc-600",
};

export const STRATEGY_COLORS: Record<string, string> = {
  "核心配置": "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700",
  "左侧观察": "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
  "政策扩散": "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
  "动量交易": "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
  "地方行情": "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700",
  "排除池": "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

// --- 文件层级分组 ---

export type TierKey = "battle" | "growth" | "energy" | "strategic" | "strengthen" | "livelihood" | "regulatory";

export interface TierDef {
  key: TierKey;
  label: string;
  order: number;
}

export const TIERS: TierDef[] = [
  { key: "battle",       label: "攻坚战",           order: 1 },
  { key: "growth",       label: "增长引擎",          order: 2 },
  { key: "energy",       label: "能源与资源安全",     order: 3 },
  { key: "strategic",    label: "战略产业",          order: 4 },
  { key: "strengthen",   label: "强化升级",          order: 5 },
  { key: "livelihood",   label: "制度民生",          order: 6 },
  { key: "regulatory",   label: "监管化",           order: 7 },
];

export const INDUSTRY_TIER: Record<string, TierKey> = {
  // 攻坚战
  semiconductor:       "battle",
  manufacturing:       "battle",
  "new-materials":     "battle",
  "industrial-software":"battle",
  biomanufacturing:    "battle",
  ai:                  "battle",
  // 增长引擎
  "quantum-tech":      "growth",
  robotics:            "growth",
  "brain-computer":    "growth",
  "six-g":             "growth",
  "hydrogen-fusion":   "growth",
  // 能源与资源安全
  "new-energy":        "energy",
  "nuclear-energy":    "energy",
  "energy-storage":    "energy",
  "critical-minerals": "energy",
  // 战略产业
  "low-altitude-economy": "strategic",
  "digital-economy":      "strategic",
  "commercial-space":     "strategic",
  biomedicine:            "strategic",
  "autonomous-driving":   "strategic",
  // 强化升级
  "power-grid":             "strengthen",
  "medical-devices":        "strengthen",
  "domestic-aircraft":      "strengthen",
  nev:                      "strengthen",
  "deep-sea":               "strengthen",
  "data-elements":          "strengthen",
  agritech:                 "strengthen",
  "traditional-chinese-medicine": "strengthen",
  "seed-industry":          "strengthen",
  // 制度民生
  "green-finance":   "livelihood",
  "silver-economy":  "livelihood",
  "ice-snow-economy":"livelihood",
  // 监管化
  "carbon-market":   "regulatory",
  "platform-economy":"regulatory",
};

export const CONVICTION_COLORS: Record<ConvictionTier, string> = {
  "高信念": "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700",
  "中等信念": "bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700",
  "低信念": "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700",
  "观望": "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  "回避": "bg-red-50 dark:bg-red-950/30 text-red-400 dark:text-red-500 border-red-200 dark:border-red-800",
};

export const MOMENTUM_COLORS: Record<PolicyMomentum, string> = {
  "政策加速": "text-emerald-600 dark:text-emerald-400",
  "政策稳定": "text-blue-600 dark:text-blue-400",
  "政策减速": "text-red-500 dark:text-red-400",
  "政策初现": "text-purple-600 dark:text-purple-400",
};

export const EXECUTION_COLORS: Record<ExecutionLevel, string> = {
  "强执行": "text-emerald-600 dark:text-emerald-400",
  "有执行": "text-blue-600 dark:text-blue-400",
  "弱执行": "text-amber-600 dark:text-amber-400",
  "无证据": "text-zinc-400 dark:text-zinc-500",
  "样本偏差": "text-purple-600 dark:text-purple-400",
};

export const MARKET_STANCE_COLORS: Record<MarketStance, string> = {
  "资金认同": "text-emerald-600 dark:text-emerald-400",
  "资金观望": "text-blue-600 dark:text-blue-400",
  "资金分歧": "text-amber-600 dark:text-amber-400",
  "资金流出": "text-red-500 dark:text-red-400",
  "无数据": "text-zinc-400 dark:text-zinc-500",
};

export const TIER_COLORS: Record<TierKey, string> = {
  battle:     "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300",
  growth:     "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  energy:     "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
  strategic:  "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  strengthen: "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300",
  livelihood: "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300",
  regulatory: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300",
};
