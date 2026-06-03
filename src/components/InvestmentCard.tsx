import { useState } from "react";
import type { Industry, ProvincialEvidence, MarketSignal, WorkReportEvidence, CityEvidenceMatrix, CityPlanMatrix, CityPlanEvidence, CityCode } from "../types";
import { CITY_NAMES } from "../types";

type TabKey = "policy" | "market" | "evidence";

const TABS: { key: TabKey; label: string }[] = [
  { key: "policy", label: "政策信号" },
  { key: "market", label: "市场行情" },
  { key: "evidence", label: "落地证据" },
];

export function InvestmentCard({ industry }: { industry: Industry }) {
  const [activeTab, setActiveTab] = useState<TabKey>("policy");
  const obs = industry.investment_observation;

  const intensityColor = (level: string) => {
    if (level.startsWith("高")) return "text-red-600 bg-red-50";
    if (level.startsWith("中")) return "text-amber-600 bg-amber-50";
    return "text-gray-600 bg-gray-100";
  };

  const hasEvidence =
    (industry.work_report != null) ||
    (industry.provincial_evidence && industry.provincial_evidence.concrete_items.length > 0) ||
    (industry.city_evidence && Object.keys(industry.city_evidence).length > 0) ||
    (industry.city_plan_evidence && Object.keys(industry.city_plan_evidence).length > 0);

  return (
    <section className="mb-12">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-zinc-900">
        投资观察 · {industry.name}
      </h2>
      <p className="text-xs text-zinc-400 mb-4">
        以下内容仅供研究参考，不构成投资建议。
      </p>

      {/* Tab bar */}
      <div className="flex border-b border-zinc-200 mb-4">
        {TABS.map(({ key, label }) => {
          const isActive = key === activeTab;
          const isEvidence = key === "evidence";
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {label}
              {isEvidence && !hasEvidence && (
                <span className="ml-1 text-zinc-300">—</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-4 sm:p-6 space-y-4">
        {activeTab === "policy" && (
          <>
            <FieldRow label="政策变化" value={obs.policy_change} source="全国十四五→十五五规划纲要" />
            <FieldRow
              label="资源倾斜强度"
              value={
                <span className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${intensityColor(obs.resource_intensity)}`}>
                  {obs.resource_intensity}
                </span>
              }
            />
            <FieldRow label="落地证据" value={obs.landing_evidence} source="基于规划原文的AI语义分析" />
            <FieldRow label="对应产业链" value={obs.industry_chain} source="行业研究" />
            <FieldRow label="风险提示" value={obs.risk_warning} />
          </>
        )}

        {activeTab === "market" && (
          <>
            {obs.etf && obs.etf.code && (
              <div>
                <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
                  行业ETF
                  {sourceLabel("公开市场数据")}
                </dt>
                <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-zinc-900">{obs.etf.code}</span>
                    <span className="text-zinc-600">{obs.etf.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {obs.etf.priority && (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                        obs.etf.priority === "核心配置"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : obs.etf.priority === "卫星配置"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                      }`}>
                        {obs.etf.priority}
                      </span>
                    )}
                    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                      obs.etf.confidence === "精准匹配"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {obs.etf.confidence}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    跟踪指数：{obs.etf.index}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {obs.etf.note}
                  </div>
                </dd>
              </div>
            )}

            {industry.market_signal && (
              <MarketSection signal={industry.market_signal} />
            )}

            {!obs.etf?.code && !industry.market_signal && (
              <p className="text-sm text-zinc-400">暂无市场数据。</p>
            )}
          </>
        )}

        {activeTab === "evidence" && (
          <>
            {hasEvidence ? (
              <>
                {industry.work_report && (
                  <WorkReportSection data={industry.work_report} />
                )}

                {industry.provincial_evidence && industry.provincial_evidence.concrete_items.length > 0 && (
                  <ProvincialSection evidence={industry.provincial_evidence} />
                )}

                {industry.city_evidence && Object.keys(industry.city_evidence).length > 0 && (
                  <CityEvidenceSection evidence={industry.city_evidence} />
                )}

                {industry.city_plan_evidence && Object.keys(industry.city_plan_evidence).length > 0 && (
                  <CityPlanSection evidence={industry.city_plan_evidence} />
                )}
              </>
            ) : (
              <p className="text-sm text-zinc-400">暂无落地证据数据。</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ProvincialSection({ evidence }: { evidence: ProvincialEvidence }) {
  const categoryStyles: Record<string, string> = {
    "量化目标": "bg-blue-50 text-blue-700 border-blue-200",
    "工程项目": "bg-amber-50 text-amber-700 border-amber-200",
    "产业平台": "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
        浙江省落地证据
        {sourceLabel("浙江省十五五规划纲要")}
        {valueTag(2)}
        <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-bold ${
          evidence.zj_intensity === "强落地"
            ? "bg-red-100 text-red-700"
            : evidence.zj_intensity === "有落地"
            ? "bg-amber-100 text-amber-700"
            : "bg-zinc-100 text-zinc-500"
        }`}>
          {evidence.zj_intensity}
        </span>
      </dt>
      <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-2 text-sm">
        <p className="text-zinc-700 leading-relaxed">
          <span className="font-semibold">变化信号：</span>{evidence.zj_signal}
        </p>
        {evidence.zj_14_summary && (
          <p className="text-zinc-500 text-xs leading-relaxed">
            <span className="font-semibold">十四五：</span>{evidence.zj_14_summary}
          </p>
        )}
        <p className="text-zinc-500 text-xs leading-relaxed">
          <span className="font-semibold">十五五：</span>{evidence.zj_15_summary}
        </p>
        <ul className="space-y-1">
          {evidence.concrete_items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs">
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${categoryStyles[item.category] || "bg-zinc-100 text-zinc-600"}`}>
                {item.category}
              </span>
              <span className="text-zinc-600">{item.text}</span>
            </li>
          ))}
        </ul>
        <a
          href={evidence.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-blue-500 hover:underline mt-1"
        >
          {evidence.source} →
        </a>
      </dd>
    </div>
  );
}

function MarketSection({ signal }: { signal: MarketSignal }) {
  const signalStyles: Record<string, string> = {
    "双重验证": "bg-green-100 text-green-700 border-green-200",
    "温和确认": "bg-blue-100 text-blue-700 border-blue-200",
    "市场分歧": "bg-amber-100 text-amber-700 border-amber-200",
    "暂不确认": "bg-zinc-100 text-zinc-500 border-zinc-200",
    "数据不足": "bg-zinc-50 text-zinc-400 border-zinc-200",
  };

  const flowColor = signal.fund_flow_direction === "流入" ? "text-green-600" : signal.fund_flow_direction === "流出" ? "text-red-600" : "text-zinc-500";
  const returnColor = (pct: number) => pct > 0 ? "text-green-600" : pct < 0 ? "text-red-600" : "text-zinc-500";

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
        市场验证
        {sourceLabel("公开行情数据")}
        <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-bold ${signalStyles[signal.signal] || signalStyles["数据不足"]}`}>
          {signal.signal}
        </span>
      </dt>
      <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-zinc-900">
            {signal.etf_code}
          </span>
          <span className="font-mono text-sm text-zinc-600">
            ¥{signal.price}
          </span>
        </div>
        <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-xs font-mono">
          {[
            { label: "1周", pct: signal.return_5d_pct },
            { label: "1月", pct: signal.return_1m_pct },
            { label: "3月", pct: signal.return_3m_pct },
            { label: "6月", pct: signal.return_6m_pct },
            { label: "1年", pct: signal.return_1y_pct },
          ].map(({ label, pct }) => (
            <span key={label} className={`${returnColor(pct)}`}>
              {label} {pct > 0 ? "+" : ""}{pct}%
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>成交量：{signal.volume_trend}</span>
          <span>资金方向：<span className={flowColor}>{signal.fund_flow_direction}</span></span>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed pt-1 border-t border-zinc-100">
          {signal.signal_label}
        </p>
        <p className="text-xs text-zinc-400">
          数据截止：{signal.updated} · 仅供研究参考
        </p>
      </dd>
    </div>
  );
}

function WorkReportSection({ data }: { data: { national?: WorkReportEvidence; zhejiang?: WorkReportEvidence } }) {
  const actionStyles: Record<string, string> = {
    "重点推进": "bg-red-100 text-red-700 border-red-200",
    "持续推进": "bg-blue-100 text-blue-700 border-blue-200",
    "早期培育": "bg-purple-100 text-purple-700 border-purple-200",
    "监管规范": "bg-amber-100 text-amber-700 border-amber-200",
    "制度构建": "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
        2026年政府工作报告
        {sourceLabel("国务院/浙江省政府")}
        {valueTag(1)}
      </dt>
      <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 space-y-3 text-sm">
        {data.national && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-700">全国</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${actionStyles[data.national.action_level] || actionStyles["持续推进"]}`}>
                {data.national.action_level}
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed">
              <span className="font-semibold">定调：</span>{data.national.mention}
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed">
              {data.national.detail}
            </p>
            <p className="text-zinc-400 text-xs">
              <span className="font-semibold">预算信号：</span>{data.national.budget_signal}
            </p>
          </div>
        )}
        {data.zhejiang && (
          <div className={`space-y-1 ${data.national ? "pt-2 border-t border-zinc-200" : ""}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-700">浙江</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${actionStyles[data.zhejiang.action_level] || actionStyles["持续推进"]}`}>
                {data.zhejiang.action_level}
              </span>
            </div>
            <p className="text-zinc-700 leading-relaxed">
              <span className="font-semibold">定调：</span>{data.zhejiang.mention}
            </p>
            <p className="text-zinc-500 text-xs leading-relaxed">
              {data.zhejiang.detail}
            </p>
            <p className="text-zinc-400 text-xs">
              <span className="font-semibold">预算信号：</span>{data.zhejiang.budget_signal}
            </p>
          </div>
        )}
      </dd>
    </div>
  );
}

function CityEvidenceSection({ evidence }: { evidence: CityEvidenceMatrix }) {
  const actionStyles: Record<string, string> = {
    "重点推进": "bg-red-50 text-red-800 border-red-200",
    "持续推进": "bg-blue-50 text-blue-800 border-blue-200",
    "早期培育": "bg-purple-50 text-purple-800 border-purple-200",
    "监管规范": "bg-amber-50 text-amber-800 border-amber-200",
    "制度构建": "bg-green-50 text-green-800 border-green-200",
  };

  const badgeStyles: Record<string, string> = {
    "重点推进": "bg-red-100 text-red-700",
    "持续推进": "bg-blue-100 text-blue-700",
    "早期培育": "bg-purple-100 text-purple-700",
    "监管规范": "bg-amber-100 text-amber-700",
    "制度构建": "bg-green-100 text-green-700",
  };

  const entries = Object.entries(evidence) as [CityCode, { mention: string; detail: string; action_level: string }][];
  if (entries.length === 0) return null;

  const priorityCities = entries.filter(([, e]) => e.action_level === "重点推进");
  const otherCities = entries.filter(([, e]) => e.action_level !== "重点推进");
  const sorted = [...priorityCities, ...otherCities];

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
        八城落地证据
        {sourceLabel("2026年各市政府工作报告")}
        {valueTag(3)}
        <span className="ml-1.5 text-[10px] font-normal normal-case text-zinc-400">
          {entries.length}/8 城覆盖
        </span>
      </dt>
      <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sorted.map(([code, ev]) => (
            <div
              key={code}
              className={`rounded px-3 py-2.5 border ${actionStyles[ev.action_level] || "bg-zinc-50 text-zinc-600 border-zinc-200"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-sm">{CITY_NAMES[code]}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${badgeStyles[ev.action_level] || "bg-zinc-100 text-zinc-500"}`}>
                  {ev.action_level}
                </span>
              </div>
              <p className="text-xs leading-relaxed font-medium text-zinc-800">
                {ev.mention}
              </p>
              {ev.detail && (
                <p className="text-[11px] leading-relaxed mt-1 text-zinc-500">
                  {ev.detail}
                </p>
              )}
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}

function CityPlanSection({ evidence }: { evidence: CityPlanMatrix }) {
  const categoryStyles: Record<string, string> = {
    "量化目标": "bg-blue-50 text-blue-700 border-blue-200",
    "工程项目": "bg-amber-50 text-amber-700 border-amber-200",
    "产业平台": "bg-green-50 text-green-700 border-green-200",
  };

  const intensityBadge = (level: string) => {
    if (level === "强落地") return "bg-red-100 text-red-700";
    if (level === "有落地") return "bg-amber-100 text-amber-700";
    return "bg-zinc-100 text-zinc-500";
  };

  const entries = Object.entries(evidence) as [CityCode, CityPlanEvidence][];
  if (entries.length === 0) return null;

  const priority = entries.filter(([, e]) => e.intensity === "强落地");
  const moderate = entries.filter(([, e]) => e.intensity === "有落地");
  const weak = entries.filter(([, e]) => e.intensity === "弱落地");
  const sorted = [...priority, ...moderate, ...weak];

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
        城市十五五规划证据
        {sourceLabel("各市十五五规划纲要")}
        {valueTag(4)}
        <span className="ml-1.5 text-[10px] font-normal normal-case text-zinc-400">
          {entries.length}/8 城覆盖
        </span>
      </dt>
      <dd className="bg-zinc-50 border border-zinc-200 rounded-md p-3 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sorted.map(([code, ev]) => (
            <div
              key={code}
              className="rounded px-3 py-2.5 border border-zinc-200 bg-white"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="font-bold text-sm">{CITY_NAMES[code]}</span>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${intensityBadge(ev.intensity)}`}>
                  {ev.intensity}
                </span>
              </div>
              {ev.signal && (
                <p className="text-xs leading-relaxed text-zinc-700 mb-1">
                  <span className="font-semibold">信号：</span>{ev.signal}
                </p>
              )}
              <p className="text-[11px] leading-relaxed text-zinc-500 mb-1.5">
                {ev.summary_15}
              </p>
              {ev.concrete_items.length > 0 && (
                <ul className="space-y-1 mb-1.5">
                  {ev.concrete_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-1 text-[11px]">
                      <span className={`inline-block px-1 py-0.5 rounded text-[10px] font-medium shrink-0 ${categoryStyles[item.category] || "bg-zinc-100 text-zinc-600"}`}>
                        {item.category}
                      </span>
                      <span className="text-zinc-600 leading-relaxed">{item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {ev.source_url && (
                <a
                  href={ev.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] text-blue-500 hover:underline"
                >
                  {ev.source} →
                </a>
              )}
              {!ev.source_url && ev.source && (
                <span className="text-[11px] text-zinc-400">{ev.source}</span>
              )}
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}

const sourceLabel = (text: string) => (
  <span className="text-[10px] font-normal text-zinc-300 ml-2 normal-case tracking-normal">
    {text}
  </span>
);

const VALUE_TIERS: Record<number, { label: string; style: string }> = {
  1: { label: "最具时效·预算信号", style: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  2: { label: "省级量化·具体项目", style: "bg-blue-50 text-blue-600 border-blue-200" },
  3: { label: "基层执行验证", style: "bg-amber-50 text-amber-600 border-amber-200" },
  4: { label: "长期愿景·落地不确定", style: "bg-zinc-100 text-zinc-500 border-zinc-200" },
};

function valueTag(tier: number) {
  const t = VALUE_TIERS[tier];
  if (!t) return null;
  return (
    <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${t.style}`}>
      {t.label}
    </span>
  );
}

function FieldRow({
  label,
  value,
  source,
}: {
  label: string;
  value: React.ReactNode;
  source?: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1">
        {label}
        {source && sourceLabel(source)}
      </dt>
      <dd className="text-sm text-zinc-800 leading-relaxed">
        {value}
      </dd>
    </div>
  );
}
