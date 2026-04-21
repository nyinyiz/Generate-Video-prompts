"use client";

import { useMemo, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { Header } from "../components/header";
import { TopBar } from "../components/top-bar";
import { PromptCard } from "../components/prompt-card";
import {
  filterPrompts,
  getPromptCategories,
  prompts,
  type PromptEntry,
} from "../lib/prompts";

const promptCategories = getPromptCategories(prompts);

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredPrompts = useMemo(() => {
    return filterPrompts(prompts, { query, category });
  }, [category, query]);

  const visibleCount = filteredPrompts.length;

  return (
    <main className="min-h-screen">
      <TopBar totalCount={prompts.length} visibleCount={visibleCount} />
      
      <div className="mx-auto flex w-full max-w-6xl flex-col px-6 pt-12 pb-24">
        <Header />

        <section className="mt-24 space-y-12">
          {/* Sticky Filter Bar */}
          <div className="sticky top-[73px] z-40 -mx-6 bg-[#fbfbfa]/95 px-6 py-8 backdrop-blur-sm border-b border-[#EAEAEA]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 max-w-xl">
                <label className="relative block">
                  <span className="sr-only">Search prompts</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Filter by keyword..."
                    className="h-10 w-full border-b border-[#EAEAEA] bg-transparent text-lg text-[#111111] outline-none transition placeholder:text-[#787774] focus:border-[#111111]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <CategoryFilter
                  categories={promptCategories}
                  activeCategory={category}
                  onCategoryChange={setCategory}
                />
                
                <div className="h-6 w-px bg-[#EAEAEA] hidden sm:block" />
                
                <div className="flex items-center gap-1 bg-[#F7F6F3] p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                      viewMode === "grid" ? "bg-[#111111] text-white" : "text-[#787774] hover:text-[#111111]"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1 font-mono text-[10px] uppercase tracking-wider transition-all ${
                      viewMode === "list" ? "bg-[#111111] text-white" : "text-[#787774] hover:text-[#111111]"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>

          <PromptList prompts={filteredPrompts} viewMode={viewMode} />
        </section>
      </div>
    </main>
  );
}

function PromptList({ 
  prompts, 
  viewMode 
}: { 
  prompts: PromptEntry[]; 
  viewMode: "grid" | "list";
}) {
  if (prompts.length === 0) {
    return (
      <div className="border border-dashed border-[#EAEAEA] py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-[#787774]">
          No results found
        </p>
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" ? "asymmetric-grid" : "flex flex-col gap-4"}>
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} variant={viewMode} />
      ))}
    </div>
  );
}
