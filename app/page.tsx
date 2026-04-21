"use client";

import { useMemo, useState } from "react";
import { CategoryFilter } from "../components/category-filter";
import { Header } from "../components/header";
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

  const filteredPrompts = useMemo(() => {
    return filterPrompts(prompts, { query, category });
  }, [category, query]);

  const todayPrompts = filteredPrompts.filter((prompt) => prompt.section === "today");
  const previousPrompts = filteredPrompts.filter((prompt) => prompt.section === "previous");

  const visibleCount = filteredPrompts.length;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Header totalCount={prompts.length} visibleCount={visibleCount} />

        <section className="space-y-4 rounded-[2rem] border border-white/60 bg-white/75 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Browse prompts
              </p>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Search by title, category, or tags.
              </h2>
            </div>

            <label className="relative block">
              <span className="sr-only">Search prompts</span>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              >
                <path
                  d="M21 21l-4.3-4.3m1.3-5.2A7.5 7.5 0 1 1 3 11.5a7.5 7.5 0 0 1 15 0Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search prompts"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
              />
            </label>
          </div>

          <CategoryFilter
            categories={promptCategories}
            activeCategory={category}
            onCategoryChange={setCategory}
          />
        </section>

        <PromptSection
          title="Today's prompts"
          description="Fresh ideas ready for the current session."
          prompts={todayPrompts}
        />

        <PromptSection
          title="Previous prompts"
          description="A longer reference shelf for reuse and refinement."
          prompts={previousPrompts}
        />
      </div>
    </main>
  );
}

function PromptSection({
  title,
  description,
  prompts,
}: {
  title: string;
  description: string;
  prompts: PromptEntry[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
        </div>
        <p className="text-sm font-medium text-slate-500">{prompts.length} prompts</p>
      </div>

      {prompts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-sm text-slate-500">
          No prompts match the current search or category.
        </div>
      )}
    </section>
  );
}
