import { useState } from "react";
import type { Industry } from "../types";

// Priority sub-tiers within 高 resource intensity
const PRIORITY_TIER: Record<string, { tier: string; label: string }> = {
  // 攻坚战
  semiconductor:         { tier: "battle", label: "攻坚战" },
  manufacturing:         { tier: "battle", label: "攻坚战" },
  "new-materials":       { tier: "battle", label: "攻坚战" },
  "industrial-software": { tier: "battle", label: "攻坚战" },
  biomanufacturing:      { tier: "battle", label: "攻坚战" },
  // 增长引擎
  robotics:       { tier: "growth", label: "增长引擎" },
  "new-energy":   { tier: "growth", label: "增长引擎" },
  "nuclear-energy": { tier: "growth", label: "增长引擎" },
  "energy-storage": { tier: "growth", label: "增长引擎" },
  // 战略性产业
  ai:                  { tier: "strategic", label: "战略性产业" },
  "digital-economy":   { tier: "strategic", label: "战略性产业" },
  "commercial-space":  { tier: "strategic", label: "战略性产业" },
  biomedicine:         { tier: "strategic", label: "战略性产业" },
  // 强化升级
  "power-grid":         { tier: "strengthened", label: "强化升级" },
  "autonomous-driving": { tier: "strengthened", label: "强化升级" },
  "seed-industry":      { tier: "strengthened", label: "强化升级" },
  "medical-devices":    { tier: "strengthened", label: "强化升级" },
  "domestic-aircraft":  { tier: "strengthened", label: "强化升级" },
  nev:                  { tier: "strengthened", label: "强化升级" },
  // 制度/民生
  "data-elements":  { tier: "other", label: "制度/民生" },
  "silver-economy": { tier: "other", label: "制度/民生" },
  "carbon-market":  { tier: "other", label: "制度/民生" },
};

const TIER_COLORS: Record<string, string> = {
  battle:
    "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 hover:border-red-400 dark:hover:border-red-600",
  growth:
    "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:border-amber-400 dark:hover:border-amber-600",
  strategic:
    "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-600",
  strengthened:
    "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 hover:border-purple-400 dark:hover:border-purple-600",
  other:
    "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500",
};

function getTierColor(id: string, isSelected: boolean) {
  if (isSelected) {
    return "bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-700 dark:border-slate-200 ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500";
  }
  const info = PRIORITY_TIER[id];
  if (!info) return "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500";
  return TIER_COLORS[info.tier];
}

export function IndustryTabs({
  industries,
  selectedIdx,
  onSelect,
}: {
  industries: Industry[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const highCount = industries.filter(
    (ind) => ind.investment_observation.resource_intensity === "高"
  ).length;

  // Auto-expand when a hidden tab is selected
  const isSelectedHidden = selectedIdx >= highCount;
  const effectiveExpanded = expanded || isSelectedHidden;

  const visible = effectiveExpanded ? industries : industries.slice(0, highCount);
  const hiddenCount = industries.length - highCount;

  return (
    <nav className="mb-6" aria-label="产业标签">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">资源倾斜 高：</span>
        {[
          { tier: "battle", label: "攻坚战" },
          { tier: "growth", label: "增长引擎" },
          { tier: "strategic", label: "战略性产业" },
          { tier: "strengthened", label: "强化升级" },
          { tier: "other", label: "制度/民生" },
        ].map(({ tier, label }) => (
          <span key={tier} className="inline-flex items-center gap-1">
            <span
              className={`inline-block w-3 h-3 rounded border ${TIER_COLORS[tier].split(" ").slice(0, 2).join(" ")}`}
            />
            {label}
          </span>
        ))}
      </div>

      {/* Tab grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 lg:gap-3">
        {visible.map((ind) => {
          // Find original index in full industries array
          const idx = industries.indexOf(ind);
          const isSelected = idx === selectedIdx;
          return (
            <button
              key={ind.id}
              onClick={() => onSelect(idx)}
              className={`px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium rounded-lg border transition-colors cursor-pointer ${getTierColor(ind.id, isSelected)}`}
            >
              {ind.name}
            </button>
          );
        })}
      </div>

      {/* Expand toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => {
            if (isSelectedHidden && effectiveExpanded) {
              onSelect(0);
            }
            setExpanded(!effectiveExpanded);
          }}
          className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          {effectiveExpanded
            ? `收起中低优先级方向 ▲`
            : `展开中低优先级方向 (${hiddenCount} 个) ▼`}
        </button>
      )}
    </nav>
  );
}
