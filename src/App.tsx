import { useState, useCallback, useMemo, useEffect } from "react";
import data from "../data/industries.json";
import type { IndustriesData, Industry } from "./types";
import { Header } from "./components/Header";
import { IndustryTabs } from "./components/IndustryTabs";
import { ComparisonView } from "./components/ComparisonView";
import { IndustryTable } from "./components/IndustryTable";
import { InvestmentCard } from "./components/InvestmentCard";
import { Methodology } from "./components/Methodology";

const industriesData = data as unknown as IndustriesData;
const { meta, summary, industries: allIndustries } = industriesData;

function getInitialId(): string {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("industry");
  if (id && allIndustries.some((ind) => ind.id === id)) return id;
  return allIndustries[0].id;
}

function App() {
  const [selectedId, setSelectedId] = useState(getInitialId);
  const [query, setQuery] = useState("");

  // Sync selected industry to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const current = params.get("industry");
    if (current === selectedId) return;
    params.set("industry", selectedId);
    const search = params.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [selectedId]);

  // Listen for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("industry");
      if (id && allIndustries.some((ind) => ind.id === id)) {
        setSelectedId(id);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const industries = useMemo(() => {
    if (!query.trim()) return allIndustries;
    const q = query.trim().toLowerCase();
    return allIndustries.filter((ind: Industry) =>
      ind.name.toLowerCase().includes(q)
    );
  }, [query]);

  const selectedIndustry =
    allIndustries.find((ind) => ind.id === selectedId) ?? allIndustries[0];

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const isFiltered = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Header meta={meta} summary={summary} />

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="搜索产业..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:border-transparent transition-shadow"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          {isFiltered && (
            <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              找到 {industries.length} 个匹配产业
            </p>
          )}
        </div>

        <IndustryTabs
          industries={industries}
          selectedId={selectedIndustry.id}
          onSelect={handleSelect}
        />

        <ComparisonView industry={selectedIndustry} />

        <IndustryTable
          industries={industries}
          selectedId={selectedIndustry.id}
          onSelect={handleSelect}
        />

        <InvestmentCard industry={selectedIndustry} />

        <Methodology />

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
