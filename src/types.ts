export interface Highlight {
  term: string;
  type: "新增" | "强化" | "弱化" | "工程化" | "监管化" | "新增+工程化" | "新增+安全化" | "大幅强化" | "大幅强化+安全化" | "强化+工程化" | "新增+战略级" | "强化+安全化" | "监管化延续" | "安全化" | "全新产业";
  reason: string;
}

export interface InvestmentObservation {
  policy_change: string;
  resource_intensity: "高" | "中" | "低" | "中（初期）";
  landing_evidence: string;
  industry_chain: string;
  risk_warning: string;
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
  "新增": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "新增+工程化": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "新增+安全化": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "新增+战略级": "bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100",
  "全新产业": "bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100",
  "强化": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "强化+工程化": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "强化+安全化": "bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100",
  "大幅强化": "bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100",
  "大幅强化+安全化": "bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100",
  "弱化": "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400",
  "工程化": "bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100",
  "监管化": "bg-orange-100 dark:bg-orange-900/60 text-orange-900 dark:text-orange-100",
  "监管化延续": "bg-orange-100 dark:bg-orange-900/60 text-orange-900 dark:text-orange-100",
  "安全化": "bg-red-100 dark:bg-red-900/60 text-red-900 dark:text-red-100",
};
