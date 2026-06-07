"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import type { Category } from "@/types/database";

interface SortOption {
  value: string;
  label: string;
}

interface ProductsFilterBarProps {
  categories: Category[];
  sortOptions: readonly SortOption[];
  currentSort: string;
  currentCategory?: string;
}

export default function ProductsFilterBar({
  categories,
  sortOptions,
  currentSort,
  currentCategory,
}: ProductsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Reset to page 1 on filter change
    params.delete("page");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ category: undefined })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            !currentCategory
              ? "bg-black text-white border-black"
              : "border-neutral-200 hover:border-neutral-400"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams({ category: cat.id })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              currentCategory === cat.id
                ? "bg-black text-white border-black"
                : "border-neutral-200 hover:border-neutral-400"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Sort select */}
      <div className="ml-auto">
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="text-sm border border-neutral-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-black"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
