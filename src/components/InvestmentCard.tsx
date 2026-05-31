import type { Industry } from "../types";

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
        <FieldRow label="风险提示" value={obs.risk_warning} />
      </div>
    </section>
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
