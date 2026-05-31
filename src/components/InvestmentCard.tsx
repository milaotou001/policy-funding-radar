import type { Industry, ProvincialEvidence, MarketSignal, WorkReportEvidence, CityEvidenceMatrix, CityCode } from "../types";
import { CITY_NAMES } from "../types";

export function InvestmentCard({ industry }: { industry: Industry }) {
  const obs = industry.investment_observation;

  const intensityColor = (level: string) => {
    if (level.startsWith("高")) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30";
    if (level.startsWith("中")) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30";
    return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800";
  };

  return (
    <section className="mb-12">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        投资观察 · {industry.name}
      </h2>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        以下内容仅供研究参考，不构成投资建议。
      </p>

      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 sm:p-6 space-y-4">
        <FieldRow label="政策变化" value={obs.policy_change} />

        <FieldRow
          label="资源倾斜强度"
          value={
            <span
              className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${intensityColor(obs.resource_intensity)}`}
            >
              {obs.resource_intensity}
            </span>
          }
        />

        <FieldRow label="落地证据" value={obs.landing_evidence} />
        <FieldRow label="对应产业链" value={obs.industry_chain} />

        {obs.etf && obs.etf.code && (
          <div>
            <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
              行业ETF
            </dt>
            <dd className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{obs.etf.code}</span>
                <span className="text-zinc-600 dark:text-zinc-400">{obs.etf.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {obs.etf.priority && (
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                    obs.etf.priority === "核心配置"
                      ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700"
                      : obs.etf.priority === "卫星配置"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                  }`}>
                    {obs.etf.priority}
                  </span>
                )}
                <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
                  obs.etf.confidence === "精准匹配"
                    ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                    : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                }`}>
                  {obs.etf.confidence}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                跟踪指数：{obs.etf.index}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {obs.etf.note}
              </div>
            </dd>
          </div>
        )}

        {industry.market_signal && (
          <MarketSection signal={industry.market_signal} />
        )}

        {industry.work_report && (
          <WorkReportSection data={industry.work_report} />
        )}

        {industry.city_evidence && Object.keys(industry.city_evidence).length > 0 && (
          <CityEvidenceSection evidence={industry.city_evidence} />
        )}

        <FieldRow label="风险提示" value={obs.risk_warning} />

        {industry.provincial_evidence && industry.provincial_evidence.concrete_items.length > 0 && (
          <ProvincialSection evidence={industry.provincial_evidence} />
        )}
      </div>
    </section>
  );
}

function ProvincialSection({ evidence }: { evidence: ProvincialEvidence }) {
  const categoryStyles: Record<string, string> = {
    "量化目标": "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    "工程项目": "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    "产业平台": "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
  };

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
        浙江省落地证据
        <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-bold ${
          evidence.zj_intensity === "强落地"
            ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
            : evidence.zj_intensity === "有落地"
            ? "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
        }`}>
          {evidence.zj_intensity}
        </span>
      </dt>
      <dd className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-2 text-sm">
        <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <span className="font-semibold">变化信号：</span>{evidence.zj_signal}
        </p>
        {evidence.zj_14_summary && (
          <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
            <span className="font-semibold">十四五：</span>{evidence.zj_14_summary}
          </p>
        )}
        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
          <span className="font-semibold">十五五：</span>{evidence.zj_15_summary}
        </p>
        <ul className="space-y-1">
          {evidence.concrete_items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs">
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium shrink-0 ${categoryStyles[item.category] || "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                {item.category}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">{item.text}</span>
            </li>
          ))}
        </ul>
        <a
          href={evidence.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-blue-500 dark:text-blue-400 hover:underline mt-1"
        >
          {evidence.source} →
        </a>
      </dd>
    </div>
  );
}

function MarketSection({ signal }: { signal: MarketSignal }) {
  const signalStyles: Record<string, string> = {
    "双重验证": "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
    "温和确认": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    "市场分歧": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    "暂不确认": "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
    "数据不足": "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700",
  };

  const flowColor = signal.fund_flow_direction === "流入" ? "text-green-600 dark:text-green-400" : signal.fund_flow_direction === "流出" ? "text-red-600 dark:text-red-400" : "text-zinc-500";
  const returnColor = (pct: number) => pct > 0 ? "text-green-600 dark:text-green-400" : pct < 0 ? "text-red-600 dark:text-red-400" : "text-zinc-500";

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
        市场验证
        <span className={`ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-bold ${signalStyles[signal.signal] || signalStyles["数据不足"]}`}>
          {signal.signal}
        </span>
      </dt>
      <dd className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {signal.etf_code}
          </span>
          <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">
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
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>成交量：{signal.volume_trend}</span>
          <span>资金方向：<span className={flowColor}>{signal.fund_flow_direction}</span></span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-zinc-100 dark:border-zinc-800">
          {signal.signal_label}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          数据截止：{signal.updated} · 仅供研究参考
        </p>
      </dd>
    </div>
  );
}

function WorkReportSection({ data }: { data: { national?: WorkReportEvidence; zhejiang?: WorkReportEvidence } }) {
  const actionStyles: Record<string, string> = {
    "重点推进": "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    "持续推进": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    "早期培育": "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    "监管规范": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    "制度构建": "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
  };

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
        2026年政府工作报告
      </dt>
      <dd className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-3 text-sm">
        {data.national && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">全国</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${actionStyles[data.national.action_level] || actionStyles["持续推进"]}`}>
                {data.national.action_level}
              </span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold">定调：</span>{data.national.mention}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              {data.national.detail}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs">
              <span className="font-semibold">预算信号：</span>{data.national.budget_signal}
            </p>
          </div>
        )}
        {data.zhejiang && (
          <div className={`space-y-1 ${data.national ? "pt-2 border-t border-zinc-200 dark:border-zinc-700" : ""}`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">浙江</span>
              <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${actionStyles[data.zhejiang.action_level] || actionStyles["持续推进"]}`}>
                {data.zhejiang.action_level}
              </span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <span className="font-semibold">定调：</span>{data.zhejiang.mention}
            </p>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              {data.zhejiang.detail}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs">
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
    "重点推进": "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700",
    "持续推进": "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700",
    "早期培育": "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700",
    "监管规范": "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700",
    "制度构建": "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700",
  };

  const entries = Object.entries(evidence) as [CityCode, { mention: string; detail: string; action_level: string }][];
  if (entries.length === 0) return null;

  const priorityCities = entries.filter(([, e]) => e.action_level === "重点推进");
  const otherCities = entries.filter(([, e]) => e.action_level !== "重点推进");
  const sorted = [...priorityCities, ...otherCities];

  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-2">
        八城落地证据
        <span className="ml-1.5 text-[10px] font-normal normal-case text-zinc-400">
          {entries.length}/8 城覆盖
        </span>
      </dt>
      <dd className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md p-3 space-y-1.5 text-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {sorted.map(([code, ev]) => (
            <div
              key={code}
              className={`rounded px-2 py-1.5 border text-xs ${actionStyles[ev.action_level] || "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}
              title={ev.detail}
            >
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold">{CITY_NAMES[code]}</span>
                <span className="text-[10px] opacity-70">{ev.action_level}</span>
              </div>
              <p className="text-[10px] mt-0.5 leading-tight opacity-80 line-clamp-2">
                {ev.mention}
              </p>
            </div>
          ))}
        </div>
      </dd>
    </div>
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">
        {label}
      </dt>
      <dd className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed">
        {value}
      </dd>
    </div>
  );
}
