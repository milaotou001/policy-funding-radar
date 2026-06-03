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
  "🟢": "text-emerald-600",
  "🟡": "text-amber-600",
  "🟠": "text-orange-500",
  "⚪": "text-zinc-300",
};

export const STRATEGY_COLORS: Record<string, string> = {
  "核心配置": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "左侧观察": "bg-blue-50 text-blue-700 border-blue-200",
  "政策扩散": "bg-purple-50 text-purple-700 border-purple-200",
  "动量交易": "bg-amber-50 text-amber-700 border-amber-200",
  "地方行情": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "排除池": "bg-zinc-100 text-zinc-500 border-zinc-200",
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
  battle:     "bg-red-50 border-red-300 text-red-800",
  growth:     "bg-amber-50 border-amber-300 text-amber-800",
  energy:     "bg-emerald-50 border-emerald-300 text-emerald-800",
  strategic:  "bg-blue-50 border-blue-300 text-blue-800",
  strengthen: "bg-purple-50 border-purple-300 text-purple-800",
  livelihood: "bg-teal-50 border-teal-300 text-teal-800",
  regulatory: "bg-orange-50 border-orange-300 text-orange-800",
};
