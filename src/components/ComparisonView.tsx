import { useState } from "react";
import type { Industry, Highlight } from "../types";
import { HIGHLIGHT_COLORS } from "../types";

export function ComparisonView({ industry }: { industry: Industry }) {
  const [tooltip, setTooltip] = useState<Highlight | null>(null);

  const highlightTypeClass = (type: string): string => {
    if (type.includes("弱化")) return "highlight-weaken";
    if (type.includes("工程化")) return "highlight-engineering";
    return "highlight-new";
  };

  return (
    <section className="mb-12">
      <h2 className="text-lg sm:text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
        原文对比 · {industry.name}
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
        {industry.summary}
      </p>

      {tooltip && (
        <div className="mb-4 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                HIGHLIGHT_COLORS[tooltip.type]
              }`}
            >
              {tooltip.type}
            </span>
            <strong>{tooltip.term}</strong>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400">{tooltip.reason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 十四五 */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            十四五规划纲要（2021-2025）
          </h3>
          <div className="space-y-3 text-sm leading-relaxed">
            {industry.evidence_14.map((text, i) => (
              <ParagraphWithHighlights
                key={i}
                text={text}
                highlights={industry.highlights.filter((h) =>
                  text.includes(h.term)
                )}
                onHover={setTooltip}
                highlightClass={highlightTypeClass}
              />
            ))}
          </div>
        </div>

        {/* 十五五 */}
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wide">
            十五五规划纲要（2026-2030）
          </h3>
          <div className="space-y-3 text-sm leading-relaxed">
            {industry.evidence_15.map((text, i) => (
              <ParagraphWithHighlights
                key={i}
                text={text}
                highlights={industry.highlights.filter((h) =>
                  text.includes(h.term)
                )}
                onHover={setTooltip}
                highlightClass={highlightTypeClass}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Highlights legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded highlight-new" />{" "}
          新增/强化
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded highlight-weaken" />{" "}
          弱化
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded highlight-engineering" />{" "}
          工程化
        </span>
      </div>
    </section>
  );
}

function ParagraphWithHighlights({
  text,
  highlights,
  onHover,
  highlightClass,
}: {
  text: string;
  highlights: Highlight[];
  onHover: (h: Highlight | null) => void;
  highlightClass: (type: string) => string;
}) {
  if (highlights.length === 0) {
    return <p className="text-zinc-700 dark:text-zinc-300 mb-1">{text}</p>;
  }

  const parts: { text: string; highlight?: Highlight }[] = [{ text }];

  for (const h of highlights) {
    const newParts: typeof parts = [];
    for (const part of parts) {
      if (part.highlight) {
        newParts.push(part);
        continue;
      }
      const idx = part.text.indexOf(h.term);
      if (idx === -1) {
        newParts.push(part);
        continue;
      }
      if (idx > 0) newParts.push({ text: part.text.slice(0, idx) });
      newParts.push({
        text: part.text.slice(idx, idx + h.term.length),
        highlight: h,
      });
      if (idx + h.term.length < part.text.length) {
        newParts.push({
          text: part.text.slice(idx + h.term.length),
        });
      }
    }
    parts.length = 0;
    parts.push(...newParts);
  }

  return (
    <p className="text-zinc-700 dark:text-zinc-300 mb-1">
      {parts.map((part, i) =>
        part.highlight ? (
          <span
            key={i}
            className={highlightClass(part.highlight.type)}
            onMouseEnter={() => onHover(part.highlight!)}
            onMouseLeave={() => onHover(null)}
            title={part.highlight.reason}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  );
}
