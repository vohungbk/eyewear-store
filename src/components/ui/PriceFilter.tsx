"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

interface PriceFilterProps {
  currentPriceMin?: string;
  currentPriceMax?: string;
}

export default function PriceFilter({ currentPriceMin = "", currentPriceMax = "" }: PriceFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [priceMin, setPriceMin] = useState(currentPriceMin);
  const [priceMax, setPriceMax] = useState(currentPriceMax);

  useEffect(() => {
    setPriceMin(currentPriceMin);
    setPriceMax(currentPriceMax);
  }, [currentPriceMin, currentPriceMax]);

  function apply() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (priceMin) params.set("price_min", priceMin); else params.delete("price_min");
    if (priceMax) params.set("price_max", priceMax); else params.delete("price_max");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function clear() {
    setPriceMin("");
    setPriceMax("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("price_min");
    params.delete("price_max");
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const hasFilter = currentPriceMin || currentPriceMax;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
      <span className="text-xs font-medium text-neutral-500">Price:</span>
      <span className="text-xs text-neutral-400">$</span>
      <input
        type="number"
        min="0"
        value={priceMin}
        onChange={(e) => setPriceMin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && apply()}
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
        onKeyDown={(e) => e.key === "Enter" && apply()}
        placeholder="Max"
        className="w-20 border border-neutral-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-black"
      />
      <button
        onClick={apply}
        className="px-2.5 py-1 text-xs border border-neutral-300 rounded hover:border-black transition-colors"
      >
        Apply
      </button>
      {hasFilter && (
        <button onClick={clear} className="text-xs text-neutral-400 hover:text-black transition-colors">
          Clear
        </button>
      )}
    </div>
  );
}
