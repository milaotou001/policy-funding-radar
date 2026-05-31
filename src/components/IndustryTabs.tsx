import type { Industry } from "../types";

export function IndustryTabs({
  industries,
  selectedIdx,
  onSelect,
}: {
  industries: Industry[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <nav className="mb-8" aria-label="产业标签">
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {industries.map((ind, idx) => (
          <button
            key={ind.id}
            onClick={() => onSelect(idx)}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-medium rounded-lg border transition-colors cursor-pointer
              ${
                idx === selectedIdx
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
          >
            {ind.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
