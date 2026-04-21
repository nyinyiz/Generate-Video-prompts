"use client";

import { CopyButton } from "./copy-button";
import type { PromptEntry } from "../lib/prompts";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function PromptCard({ 
  prompt, 
  variant = "grid" 
}: { 
  prompt: PromptEntry; 
  variant?: "grid" | "list";
}) {
  if (variant === "list") {
    return (
      <article className="group flex flex-col sm:flex-row sm:items-center gap-6 border-b border-[#EAEAEA] bg-white py-6 px-4 transition-all hover:bg-[#F7F6F3]">
        <div className="flex-none sm:w-32">
          <span className="bg-[#EDF3EC] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#346538]">
            {prompt.category}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-[#111111] truncate">
            {prompt.title}
          </h3>
          <p className="text-sm text-[#787774] truncate mt-1">
            {prompt.prompt.split("\n")[0]}
          </p>
        </div>

        <div className="flex-none flex items-center gap-6">
          <span className="font-mono text-[10px] text-[#787774] hidden md:block">
            {formatDate(prompt.createdAt)}
          </span>
          <CopyButton text={prompt.prompt} />
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col border border-[#EAEAEA] bg-white p-8 transition-all hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-[#EDF3EC] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#346538]">
              {prompt.category}
            </span>
            <span className="font-mono text-[10px] text-[#787774]">
              {formatDate(prompt.createdAt)}
              {prompt.updatedAt && prompt.updatedAt !== prompt.createdAt && (
                <> · Updated {formatDate(prompt.updatedAt)}</>
              )}
            </span>
          </div>
          <h3 className="text-3xl leading-tight text-[#111111]">
            {prompt.title}
          </h3>
        </div>
        <CopyButton text={prompt.prompt} />
      </div>

      <div className="mt-8">
        <p className="whitespace-pre-wrap text-base leading-relaxed text-[#2F3437]">
          {prompt.prompt}
        </p>
      </div>

      {(prompt.camera || prompt.lighting || prompt.audio) && (
        <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#F7F6F3] pt-8 sm:grid-cols-3">
          {prompt.camera && (
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#787774]">Camera</span>
              <p className="text-xs text-[#111111]">{prompt.camera}</p>
            </div>
          )}
          {prompt.lighting && (
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#787774]">Lighting</span>
              <p className="text-xs text-[#111111]">{prompt.lighting}</p>
            </div>
          )}
          {prompt.audio && (
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#787774]">Audio</span>
              <p className="text-xs text-[#111111]">{prompt.audio}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2 pt-6 border-t border-[#F7F6F3]">
        {prompt.tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-[11px] text-[#787774]"
          >
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
