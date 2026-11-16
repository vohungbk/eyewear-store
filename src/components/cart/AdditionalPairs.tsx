"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils/format";
import WishlistButton from "@/components/ui/WishlistButton";

export interface PairItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  imageAlt: string;
}

export default function AdditionalPairs({ items }: { items: PairItem[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = trackRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, items.length]);

  function scrollBy(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="additional-pairs-heading"
      className="border-t border-neutral-200 bg-white px-10 py-10"
    >
      <h2
        id="additional-pairs-heading"
        className="mb-6 font-serif text-[30px]"
      >
        Save 20% on additional pairs
      </h2>

      <div className="relative">
        <ul
          ref={trackRef}
          onScroll={update}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => (
            <li
              key={item.id}
              className="group relative aspect-[4/5] w-[calc((100%-3rem)/4)] min-w-[220px] shrink-0 snap-start overflow-hidden rounded-2xl bg-[#faf8f5]"
            >
              {/* Image fills the whole card */}
              <Link
                href={`/products/${item.slug}`}
                aria-label={item.name}
                className="absolute inset-0 block"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt || item.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-100" />
                )}
              </Link>

              <div className="absolute left-4 top-4 z-10">
                <WishlistButton productId={item.id} size="sm" />
              </div>

              {/* Name, price and button sit over the image */}
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
                  <p className="truncate font-serif text-xl">{item.name}</p>
                  <p className="shrink-0 text-xs tabular-nums">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <Link
                  href={`/products/${item.slug}`}
                  className="flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-base font-semibold text-[#3a434c] transition-colors hover:border-[#1050d0] hover:bg-[#1050d0] hover:text-white"
                >
                  Select lenses and buy
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {canPrev && (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Previous pairs"
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-neutral-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1050d0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 12H4M10 6l-6 6 6 6" />
            </svg>
          </button>
        )}
        {canNext && (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Next pairs"
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-colors hover:bg-neutral-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1050d0" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
