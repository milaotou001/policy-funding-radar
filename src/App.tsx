import { useState, useCallback } from "react";
import data from "../data/industries.json";
import type { IndustriesData } from "./types";
import { Header } from "./components/Header";
import { IndustryTabs } from "./components/IndustryTabs";
import { ComparisonView } from "./components/ComparisonView";
import { IndustryTable } from "./components/IndustryTable";
import { InvestmentCard } from "./components/InvestmentCard";

const industriesData = data as unknown as IndustriesData;
const { meta, summary, industries } = industriesData;

function App() {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleSelect = useCallback((idx: number) => {
    setSelectedIdx(idx);
    const el = document.getElementById("comparison-section");
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const industry = industries[selectedIdx];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Header meta={meta} summary={summary} />

        <IndustryTabs
          industries={industries}
          selectedIdx={selectedIdx}
          onSelect={handleSelect}
        />

        <div id="comparison-section">
          <ComparisonView industry={industry} />
        </div>

        <IndustryTable industries={industries} selectedIdx={selectedIdx} />

        <InvestmentCard industry={industry} />

        <footer className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-400 dark:text-zinc-500 space-y-1">
          <p>{meta.disclaimer}</p>
          <p>
            {meta.produced_by} · 数据版本 {meta.data_version} · {meta.source_14} · {meta.source_15}
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
