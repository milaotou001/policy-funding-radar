import type { Industry } from "./types";

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

export const TIER_COLORS: Record<TierKey, string> = {
  battle:     "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-300",
  growth:     "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300",
  energy:     "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
  strategic:  "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300",
  strengthen: "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300",
  livelihood: "bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300",
  regulatory: "bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800 text-orange-800 dark:text-orange-300",
};
