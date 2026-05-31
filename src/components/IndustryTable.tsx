import type { Industry } from "../types";

export function IndustryTable({
  industries,
  selectedIdx,
}: {
  industries: Industry[];
  selectedIdx: number;
}) {
  return (
    <section className="mb-12 overflow-x-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
        产业标签对比
      </h2>

      <div className="min-w-[700px]">
        <div className="grid grid-cols-5 gap-0 border-b-2 border-zinc-300 dark:border-zinc-600 pb-2 mb-1 text-xs sm:text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          <div className="px-3">产业标签</div>
          <div className="px-3">十四五状态</div>
          <div className="px-3">十五五状态</div>
          <div className="px-3">变化判断</div>
          <div className="px-3">资源倾斜方向</div>
        </div>

        {(() => {
          const ind = industries[selectedIdx];
          return (
            <div className="grid grid-cols-5 gap-0 border-b border-zinc-100 dark:border-zinc-800 py-2.5 text-sm bg-amber-50 dark:bg-amber-900/20 border-l-2 border-l-amber-400 dark:border-l-amber-500 rounded-r-md font-medium">
              <div className="px-3 font-medium text-zinc-900 dark:text-zinc-100">
                {ind.name}
              </div>
              <div className="px-3 text-zinc-600 dark:text-zinc-400">
                {ind.tags_14.join(" · ")}
              </div>
              <div className="px-3 text-zinc-600 dark:text-zinc-400">
                {ind.tags_15.join(" · ")}
              </div>
              <div className="px-3">
                <ChangeTypeBadge type={ind.change_type} />
              </div>
              <div className="px-3 text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">
                {ind.tags_15[0]}
                {ind.tags_15.length > 1 ? ` → ${ind.tags_15.at(-1)}` : ""}
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}

function ChangeTypeBadge({ type }: { type: string }) {
  const isStrengthened = type.includes("强化") || type.includes("新增");
  const isWeakened = type.includes("弱化");

  const baseClass = isStrengthened
    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
    : isWeakened
    ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600"
    : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700";

  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${baseClass}`}
    >
      {type}
    </span>
  );
}
