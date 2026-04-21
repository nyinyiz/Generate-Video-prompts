"use client";

export function Header({
  totalCount,
  visibleCount,
}: {
  totalCount: number;
  visibleCount: number;
}) {
  return (
    <header className="space-y-4 pt-2 sm:pt-4">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
        <span>Generate Video Prompt</span>
        <span className="h-1 w-1 rounded-full bg-slate-400/70" aria-hidden="true" />
        <span>Static prompt library</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-end">
        <div className="space-y-3">
          <h1 className="max-w-3xl text-4xl leading-[0.95] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            A polished library for browsing, filtering, and copying video prompts fast.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Search by title, category, or tags, then jump between today&apos;s prompts and the
            previous archive without leaving the page.
          </p>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Library status
          </p>
          <div className="mt-3 flex items-baseline justify-between gap-3">
            <span className="text-3xl font-semibold text-slate-950">{visibleCount}</span>
            <span className="text-sm text-slate-500">visible now</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {totalCount} total prompts in the collection.
          </p>
        </div>
      </div>
    </header>
  );
}
