"use client";

export function TopBar({
  totalCount,
  visibleCount,
}: {
  totalCount: number;
  visibleCount: number;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-[#EAEAEA] bg-[#fbfbfa]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#787774]">
            Library / v0.1.0
          </span>
          <h1 className="text-sm font-medium tracking-tight text-[#111111]">
            Generate Video Prompt
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#787774]">
              Total
            </span>
            <span className="text-xs font-medium">{totalCount}</span>
          </div>
          <div className="h-6 w-px bg-[#EAEAEA]" />
          <div className="flex flex-col items-end">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#787774]">
              Visible
            </span>
            <span className="text-xs font-medium">{visibleCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
