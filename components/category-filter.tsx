"use client";

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isActive = category === activeCategory;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            aria-pressed={isActive}
            className={`px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-all ${
              isActive
                ? "bg-[#111111] text-white"
                : "bg-[#F7F6F3] text-[#787774] hover:bg-[#EAEAEA]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
