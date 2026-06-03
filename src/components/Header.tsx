import type { Meta, Summary } from "../types";

export function Header({ meta, summary }: { meta: Meta; summary: Summary }) {
  return (
    <header className="mb-8 sm:mb-12">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900ext-zinc-100 mb-4">
        {meta.title}
      </h1>
      <p className="text-base sm:text-lg text-zinc-500ext-zinc-400 mb-6">
        {meta.subtitle}
      </p>

      <div className="bg-zinc-50g-zinc-800 rounded-lg border border-zinc-200order-zinc-700">
        <p className="px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base leading-relaxed text-zinc-700ext-zinc-300">
          {summary.overview}
        </p>

        <details className="group">
          <summary className="px-4 sm:px-6 pb-3 text-xs font-semibold text-zinc-400ext-zinc-500 cursor-pointer hover:text-zinc-600over:text-zinc-300 transition-colors select-none">
            产业分类明细
          </summary>
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs sm:text-sm">
              <SummaryGroup label="新增方向" items={summary.new_directions} color="amber" />
              <SummaryGroup label="明显强化" items={summary.strengthened} color="emerald" />
              <SummaryGroup label="明显弱化" items={summary.weakened} color="gray" />
              <SummaryGroup label="工程化" items={summary.engineering_shift} color="blue" />
              <SummaryGroup label="监管化" items={summary.regulatory_shift} color="orange" />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}

function SummaryGroup({
  label,
  items,
  color,
}: {
  label: string;
  items: string[];
  color: string;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50g-amber-900/30 text-amber-800ext-amber-200 border-amber-200order-amber-700",
    emerald: "bg-emerald-50g-emerald-900/30 text-emerald-800ext-emerald-200 border-emerald-200order-emerald-700",
    gray: "bg-gray-50g-gray-700/50 text-gray-500ext-gray-400 border-gray-200order-gray-600",
    blue: "bg-blue-50g-blue-900/30 text-blue-800ext-blue-200 border-blue-200order-blue-700",
    orange: "bg-orange-50g-orange-900/30 text-orange-800ext-orange-200 border-orange-200order-orange-700",
  };

  return (
    <div className={`rounded-md p-3 border ${colors[color]}`}>
      <div className="font-semibold mb-1.5">{label}</div>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
