import { useState } from "react";
import type { Industry } from "../types";

// Priority sub-tiers within 高 resource intensity — mapped by document hierarchy
const PRIORITY_TIER: Record<string, { tier: string; label: string }> = {
  // 攻坚战 + AI — 最高优先级
  semiconductor:         { tier: "battle", label: "攻坚战" },
  manufacturing:         { tier: "battle", label: "攻坚战" },
  "new-materials":       { tier: "battle", label: "攻坚战" },
  "industrial-software": { tier: "battle", label: "攻坚战" },
  biomanufacturing:      { tier: "battle", label: "攻坚战" },
  ai:                    { tier: "battle", label: "攻坚战" },
  // 增长引擎 — 写入"新的经济增长点"
  "quantum-tech":   { tier: "growth", label: "增长引擎" },
  robotics:         { tier: "growth", label: "增长引擎" },
  "brain-computer": { tier: "growth", label: "增长引擎" },
  "six-g":          { tier: "growth", label: "增长引擎" },
  "hydrogen-fusion":{ tier: "growth", label: "增长引擎" },
  // 能源与资源安全 — 清洁能源基地 + 关键矿产
  "new-energy":      { tier: "energy", label: "能源与资源安全" },
  "nuclear-energy":  { tier: "energy", label: "能源与资源安全" },
  "energy-storage":  { tier: "energy", label: "能源与资源安全" },
  "critical-minerals": { tier: "energy", label: "能源与资源安全" },
  // 战略产业 — 独立战略性新兴产业
  "low-altitude-economy": { tier: "strategic", label: "战略产业" },
  "digital-economy":  { tier: "strategic", label: "战略产业" },
  "commercial-space": { tier: "strategic", label: "战略产业" },
  biomedicine:        { tier: "strategic", label: "战略产业" },
  "autonomous-driving": { tier: "strategic", label: "战略产业" },
};

const TIER_COLORS: Record<string, string> = {
  battle:
    "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60 text-red-800 dark:text-red-300 hover:border-red-400 dark:hover:border-red-600",
  growth:
    "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:border-amber-400 dark:hover:border-amber-600",
  energy:
    "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/60 text-green-800 dark:text-green-300 hover:border-green-400 dark:hover:border-green-600",
  strategic:
    "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 hover:border-blue-400 dark:hover:border-blue-600",
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
          { tier: "energy", label: "能源与资源安全" },
          { tier: "strategic", label: "战略产业" },
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
          const idx = industries.indexOf(ind);
          const isSelected = idx === selectedIdx;
          return (
            <button
              key={ind.id}
              onClick={() => onSelect(idx)}
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
      {/* ETF priority legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">ETF投资优先级：</span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          核心配置
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
          卫星配置
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400" />
          观察配置
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full border border-zinc-300 dark:border-zinc-600" />
          暂无ETF
        </span>
      </div>
    </nav>
  );
}
