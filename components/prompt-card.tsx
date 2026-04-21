"use client";

import { CopyButton } from "./copy-button";
import type { PromptEntry } from "../lib/prompts";

export function PromptCard({ prompt }: { prompt: PromptEntry }) {
  return (
    <article className="group flex h-full flex-col rounded-[1.75rem] border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            {prompt.category}
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{prompt.title}</h3>
        </div>
        <CopyButton text={prompt.prompt} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{prompt.prompt}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
