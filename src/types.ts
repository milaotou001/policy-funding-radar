export interface Highlight {
  term: string;
  type: string;
  reason: string;
}

export interface ETFMapping {
  code: string;
  name: string;
  index: string;
  note: string;
  confidence: "精准匹配" | "相关匹配" | "暂无对应";
  priority: "核心配置" | "卫星配置" | "观察配置" | "";
}

export interface ProvincialEvidenceItem {
  category: "量化目标" | "工程项目" | "产业平台";
  text: string;
}

export interface ProvincialEvidence {
  zj_signal: string;
  zj_14_summary: string;
  zj_15_summary: string;
  concrete_items: ProvincialEvidenceItem[];
  source: string;
  source_url: string;
  zj_intensity: "强落地" | "有落地" | "弱落地";
}

export interface WorkReportEvidence {
  mention: string;
  detail: string;
  budget_signal: string;
  action_level: "重点推进" | "持续推进" | "早期培育" | "监管规范" | "制度构建";
}

export interface WorkReportData {
  national?: WorkReportEvidence;
  zhejiang?: WorkReportEvidence;
}

export type CityCode = "sh" | "sz" | "hz" | "nj" | "su" | "bj" | "gz" | "hf";

export const CITY_NAMES: Record<CityCode, string> = {
  sh: "上海", sz: "深圳", hz: "杭州", nj: "南京",
  su: "苏州", bj: "北京", gz: "广州", hf: "合肥",
};

export interface CityPlanEvidence {
  signal: string;
  summary_14: string;
  summary_15: string;
  concrete_items: ProvincialEvidenceItem[];
  source: string;
  source_url: string;
  intensity: "强落地" | "有落地" | "弱落地";
}

export type CityPlanMatrix = Partial<Record<CityCode, CityPlanEvidence>>;

export interface CityWorkReportEvidence {
  mention: string;
  detail: string;
  action_level: "重点推进" | "持续推进" | "早期培育" | "监管规范" | "制度构建";
}

export type CityEvidenceMatrix = Partial<Record<CityCode, CityWorkReportEvidence>>;

export interface MarketSignal {
  etf_code: string;
  price: number;
  return_5d_pct: number;
  return_1m_pct: number;
  return_3m_pct: number;
  return_6m_pct: number;
  return_1y_pct: number;
  volume_trend: "放量" | "缩量" | "持平";
  fund_flow_direction: "流入" | "流出" | "持平";
  signal: "双重验证" | "温和确认" | "市场分歧" | "暂不确认" | "数据不足";
  signal_label: string;
  updated: string;
}

export interface InvestmentObservation {
  policy_change: string;
  resource_intensity: "高" | "中" | "低" | "中（初期）";
  landing_evidence: string;
  industry_chain: string;
  risk_warning: string;
  etf?: ETFMapping;
}

export interface Industry {
  id: string;
  name: string;
  change_type: string;
  summary: string;
  tags_14: string[];
  tags_15: string[];
  evidence_14: string[];
  evidence_15: string[];
  highlights: Highlight[];
  investment_observation: InvestmentObservation;
  provincial_evidence?: ProvincialEvidence;
  market_signal?: MarketSignal;
  work_report?: WorkReportData;
  city_evidence?: CityEvidenceMatrix;
  city_plan_evidence?: CityPlanMatrix;
}

export interface Meta {
  title: string;
  subtitle: string;
  source_14: string;
  source_15: string;
  data_version: string;
  produced_by: string;
  disclaimer: string;
}

export interface Summary {
  overview: string;
  new_directions: string[];
  strengthened: string[];
  weakened: string[];
  engineering_shift: string[];
  regulatory_shift: string[];
}

export interface IndustriesData {
  meta: Meta;
  summary: Summary;
  industries: Industry[];
}

export const HIGHLIGHT_COLORS: Record<string, string> = {
  "新增": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "新增+工程化": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "新增+安全化": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "新增+战略级": "bg-amber-200g-amber-900/80 text-amber-900ext-amber-100",
  "全新产业": "bg-amber-200g-amber-900/80 text-amber-900ext-amber-100",
  "强化": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "强化+工程化": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "强化+安全化": "bg-amber-100g-amber-900/60 text-amber-900ext-amber-100",
  "大幅强化": "bg-amber-200g-amber-900/80 text-amber-900ext-amber-100",
  "大幅强化+安全化": "bg-amber-200g-amber-900/80 text-amber-900ext-amber-100",
  "弱化": "bg-gray-200g-gray-700 text-gray-500ext-gray-400",
  "工程化": "bg-blue-100g-blue-900/60 text-blue-900ext-blue-100",
  "监管化": "bg-orange-100g-orange-900/60 text-orange-900ext-orange-100",
  "监管化延续": "bg-orange-100g-orange-900/60 text-orange-900ext-orange-100",
  "安全化": "bg-red-100g-red-900/60 text-red-900ext-red-100",
};
