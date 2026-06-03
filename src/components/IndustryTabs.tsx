import { useState } from "react";
import type { Industry } from "../types";
import { INDUSTRY_TIER } from "../signals";
import type { TierKey } from "../signals";

const TAB_TIER_COLORS: Record<string, string> = {
  battle:
    "bg-red-50 border-red-200 text-red-800 hover:border-red-400",
  growth:
    "bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400",
  energy:
    "bg-green-50 border-green-200 text-green-800 hover:border-green-400",
  strategic:
    "bg-blue-50 border-blue-200 text-blue-800 hover:border-blue-400",
  strengthen:
    "bg-purple-50 border-purple-200 text-purple-800 hover:border-purple-400",
  livelihood:
    "bg-teal-50 border-teal-200 text-teal-800 hover:border-teal-400",
  regulatory:
    "bg-orange-50 border-orange-200 text-orange-800 hover:border-orange-400",
};

function getTierColor(id: string, isSelected: boolean) {
  if (isSelected) {
    return "bg-slate-700 text-white border-slate-700 ring-2 ring-offset-1 ring-slate-400";
  }
  const tier = INDUSTRY_TIER[id];
  if (!tier)
    return "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400";
  return TAB_TIER_COLORS[tier];
}

export function IndustryTabs({
  industries,
  selectedId,
  onSelect,
}: {
  industries: Industry[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const firstFourKeys = new Set<TierKey>(["battle", "growth", "energy", "strategic"]);
  const highCount = industries.filter(
    (ind) => firstFourKeys.has(INDUSTRY_TIER[ind.id])
  ).length;

  const selectedIndustry = industries.find((ind) => ind.id === selectedId);
  const selectedIdx = selectedIndustry ? industries.indexOf(selectedIndustry) : -1;
  const isSelectedHidden = selectedIdx >= highCount;
  const effectiveExpanded = expanded || isSelectedHidden;

  const visible = effectiveExpanded ? industries : industries.slice(0, highCount);
  const hiddenCount = industries.length - highCount;

  return (
    <nav className="mb-6" aria-label="产业标签">
      <p className="mb-3 text-xs text-zinc-400">
        按十五五规划纲要优先级排列，详情见下方矩阵分组说明。
      </p>

      {/* Tab grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-3">
        {visible.map((ind) => {
          const isSelected = ind.id === selectedId;
          return (
            <button
              key={ind.id}
              onClick={() => onSelect(ind.id)}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium rounded-lg border transition-colors cursor-pointer ${getTierColor(ind.id, isSelected)}`}
            >
              {ind.investment_observation.etf?.priority && (
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full mr-2 ${
                    ind.investment_observation.etf.priority === "核心配置"
                      ? "bg-red-500"
                      : ind.investment_observation.etf.priority === "卫星配置"
                      ? "bg-blue-500"
                      : "bg-zinc-400"
                  }`}
                />
              )}
              {ind.name}
            </button>
          );
        })}
      </div>

      {/* Expand toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => {
            if (isSelectedHidden && effectiveExpanded && industries.length > 0) {
              onSelect(industries[0].id);
            }
            setExpanded(!effectiveExpanded);
          }}
          className="mt-3 text-xs text-zinc-500 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          {effectiveExpanded
            ? `收起中低优先级方向 ▲`
            : `展开中低优先级方向 (${hiddenCount} 个) ▼`}
        </button>
      )}
    </nav>
  );
}
