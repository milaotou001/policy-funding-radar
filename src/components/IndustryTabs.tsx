import { useState } from "react";
import type { Industry } from "../types";
import { INDUSTRY_TIER } from "../signals";
import type { TierKey } from "../signals";

const TAB_TIER_COLORS: Record<string, string> = {
  battle:
    "bg-red-50g-red-950/40 border-red-200order-red-800/60 text-red-800ext-red-300 hover:border-red-400over:border-red-600",
  growth:
    "bg-amber-50g-amber-950/40 border-amber-200order-amber-800/60 text-amber-800ext-amber-300 hover:border-amber-400over:border-amber-600",
  energy:
    "bg-green-50g-green-950/40 border-green-200order-green-800/60 text-green-800ext-green-300 hover:border-green-400over:border-green-600",
  strategic:
    "bg-blue-50g-blue-950/40 border-blue-200order-blue-800/60 text-blue-800ext-blue-300 hover:border-blue-400over:border-blue-600",
  strengthen:
    "bg-purple-50g-purple-950/40 border-purple-200order-purple-800/60 text-purple-800ext-purple-300 hover:border-purple-400over:border-purple-600",
  livelihood:
    "bg-teal-50g-teal-950/40 border-teal-200order-teal-800/60 text-teal-800ext-teal-300 hover:border-teal-400over:border-teal-600",
  regulatory:
    "bg-orange-50g-orange-950/40 border-orange-200order-orange-800/60 text-orange-800ext-orange-300 hover:border-orange-400over:border-orange-600",
};

function getTierColor(id: string, isSelected: boolean) {
  if (isSelected) {
    return "bg-slate-700g-slate-200 text-whiteext-slate-800 border-slate-700order-slate-200 ring-2 ring-offset-1 ring-slate-400ing-slate-500";
  }
  const tier = INDUSTRY_TIER[id];
  if (!tier)
    return "bg-whiteg-zinc-800 text-zinc-600ext-zinc-400 border-zinc-200order-zinc-700 hover:border-zinc-400over:border-zinc-500";
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
      <p className="mb-3 text-xs text-zinc-400ext-zinc-500">
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
          className="mt-3 text-xs text-zinc-500ext-zinc-400 hover:text-zinc-700over:text-zinc-300 transition-colors cursor-pointer"
        >
          {effectiveExpanded
            ? `收起中低优先级方向 ▲`
            : `展开中低优先级方向 (${hiddenCount} 个) ▼`}
        </button>
      )}
    </nav>
  );
}
