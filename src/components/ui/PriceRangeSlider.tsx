"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

const SLIDER_CSS = `
.price-range{position:absolute;left:-8px;top:0;width:calc(100% + 16px);height:24px;margin:0;background:transparent;pointer-events:none;-webkit-appearance:none;appearance:none}
.price-range::-webkit-slider-runnable-track{background:transparent;height:24px}
.price-range::-moz-range-track{background:transparent;height:24px}
.price-range::-webkit-slider-thumb{-webkit-appearance:none;pointer-events:auto;width:16px;height:16px;margin-top:4px;border-radius:9999px;border:0;background:#1f3fd0;cursor:pointer}
.price-range::-moz-range-thumb{pointer-events:auto;width:16px;height:16px;border-radius:9999px;border:0;background:#1f3fd0;cursor:pointer}
.price-range:focus-visible::-webkit-slider-thumb{outline:2px solid #121212;outline-offset:2px}
`;

const STOPS = [95, 125, 145, 175, 195];
const LAST = STOPS.length - 1;

function nearestIndex(value: string | undefined, fallback: number) {
  const n = value ? parseFloat(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  let best = 0;
  STOPS.forEach((s, i) => {
    if (Math.abs(s - n) < Math.abs(STOPS[best] - n)) best = i;
  });
  return best;
}

export default function PriceRangeSlider({
  priceMin,
  priceMax,
}: {
  priceMin?: string;
  priceMax?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [lo, setLo] = useState(() => nearestIndex(priceMin, 0));
  const [hi, setHi] = useState(() => nearestIndex(priceMax, LAST));

  function commit(nextLo: number, nextHi: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (nextLo > 0) params.set("price_min", String(STOPS[nextLo]));
    else params.delete("price_min");
    if (nextHi < LAST) params.set("price_max", String(STOPS[nextHi]));
    else params.delete("price_max");
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  const pct = (i: number) => `${(i / LAST) * 100}%`;
  const commitHandlers = {
    onPointerUp: () => commit(lo, hi),
    onKeyUp: () => commit(lo, hi),
    onBlur: () => commit(lo, hi),
  };

  return (
    <div className={`pb-5 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-[#3a434c]">Min</div>
          <div className="text-base font-semibold">${STOPS[lo]}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#3a434c]">Max</div>
          <div className="text-base font-semibold">${STOPS[hi]}</div>
        </div>
      </div>

      <style>{SLIDER_CSS}</style>
      <div className="relative mx-2 mt-3 h-6">
        {/* Track */}
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[#7f98e6]" />
        {/* Stops */}
        {STOPS.map((s, i) => (
          <span
            key={s}
            aria-hidden
            className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7f98e6] bg-white"
            style={{ left: pct(i) }}
          />
        ))}
        {/* Inputs (thumbs only receive pointer events) */}
        <input
          type="range"
          min={0}
          max={LAST}
          step={1}
          value={lo}
          aria-label="Minimum price"
          onChange={(e) => setLo(Math.min(Number(e.target.value), hi))}
          className="price-range"
          style={{ zIndex: lo === LAST ? 3 : 2 }}
          {...commitHandlers}
        />
        <input
          type="range"
          min={0}
          max={LAST}
          step={1}
          value={hi}
          aria-label="Maximum price"
          onChange={(e) => setHi(Math.max(Number(e.target.value), lo))}
          className="price-range"
          style={{ zIndex: 2 }}
          {...commitHandlers}
        />
      </div>

      <div className="relative mx-2 mt-2 h-5 text-xs text-[#3a434c]">
        {STOPS.map((s, i) => (
          <span
            key={s}
            className="absolute -translate-x-1/2"
            style={{ left: pct(i) }}
          >
            ${s}
          </span>
        ))}
      </div>
    </div>
  );
}
