"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
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
  currentPriceMin?: string;
  currentPriceMax?: string;
}

export default function ProductsFilterBar({
  categories,
  sortOptions,
  currentSort,
  currentCategory,
  currentPriceMin = "",
  currentPriceMax = "",
}: ProductsFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [priceMin, setPriceMin] = useState(currentPriceMin);
  const [priceMax, setPriceMax] = useState(currentPriceMax);

  // Sync if URL changes externally
  useEffect(() => {
    setPriceMin(currentPriceMin);
    setPriceMax(currentPriceMax);
  }, [currentPriceMin, currentPriceMax]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  function applyPriceFilter() {
    updateParams({
      price_min: priceMin || undefined,
      price_max: priceMax || undefined,
    });
  }

  function clearPriceFilter() {
    setPriceMin("");
    setPriceMax("");
    updateParams({ price_min: undefined, price_max: undefined });
  }

  const hasPriceFilter = currentPriceMin || currentPriceMax;

  return (
    <div className={`space-y-3 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      {/* Category pills + Sort */}
      <div className="flex flex-wrap items-center gap-3">
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

      {/* Price range */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-neutral-500">Price:</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">$</span>
          <input
            type="number"
            min="0"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
            placeholder="Min"
            className="w-20 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-black"
          />
          <span className="text-xs text-neutral-400">–</span>
          <span className="text-xs text-neutral-400">$</span>
          <input
            type="number"
            min="0"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyPriceFilter()}
            placeholder="Max"
            className="w-20 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-black"
          />
          <button
            onClick={applyPriceFilter}
            className="px-2.5 py-1 text-xs border border-neutral-300 rounded hover:border-black transition-colors"
          >
            Apply
          </button>
          {hasPriceFilter && (
            <button
              onClick={clearPriceFilter}
              className="text-xs text-neutral-400 hover:text-black transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {hasPriceFilter && (
          <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {currentPriceMin ? `$${currentPriceMin}` : "$0"} – {currentPriceMax ? `$${currentPriceMax}` : "any"}
          </span>
        )}
      </div>
    </div>
  );
}
