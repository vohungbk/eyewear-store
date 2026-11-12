"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPrice, getPrimaryImage } from "@/lib/utils/format";
import type { ProductVariant, ProductWithImages } from "@/types/database";
import WishlistButton from "./WishlistButton";

export type CarouselProduct = ProductWithImages & {
  product_variants?: Pick<ProductVariant, "id" | "name" | "attributes">[];
};

/** Unique frame colors from the variants' `color` attribute. */
function getColors(product: CarouselProduct): string[] {
  const colors = (product.product_variants ?? [])
    .map((v) => {
      const attrs = v.attributes as Record<string, unknown> | null;
      return typeof attrs?.color === "string" ? attrs.color : null;
    })
    .filter((c): c is string => !!c);
  return [...new Set(colors)];
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "right" ? (
        <>
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="14 6 20 12 14 18" />
        </>
      ) : (
        <>
          <line x1="20" y1="12" x2="4" y2="12" />
          <polyline points="10 6 4 12 10 18" />
        </>
      )}
    </svg>
  );
}

const arrowButton =
  "absolute top-1/2 z-10 hidden cursor-pointer h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-md transition-colors hover:bg-neutral-50 md:flex";

export default function FeaturedCarousel({
  products,
}: {
  products: CarouselProduct[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
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
  }, [update, products.length]);

  function scrollByPage(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={update}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => {
          const image = getPrimaryImage(product.product_images ?? []);
          const colors = getColors(product);
          return (
            <article
              key={product.id}
              className="relative flex w-[78%] shrink-0 snap-start flex-col bg-[#faf8f5] sm:w-[44%] lg:w-[31%]"
            >
              <div className="absolute left-4 top-4 z-10">
                <WishlistButton productId={product.id} size="sm" />
              </div>

              <Link
                href={`/products/${product.slug}`}
                aria-label={product.name}
                className="relative block aspect-[5/4] overflow-hidden"
              >
                {image && (
                  <Image
                    src={image.url}
                    alt={image.alt || product.name}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 44vw, 78vw"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="mt-5 flex items-baseline justify-between gap-3 px-4">
                <h3 className="truncate font-serif text-xl">{product.name}</h3>
                <span className="shrink-0 text-sm">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="mt-3 flex min-h-5 items-center gap-2 px-4">
                {colors.slice(0, 5).map((color) => (
                  <span
                    key={color}
                    title={color}
                    className="h-4 w-4 rounded-full border border-neutral-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                ))}
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="mx-4 mb-4 mt-4 flex h-11 items-center justify-center rounded-full border border-neutral-400 bg-white text-sm font-medium transition-colors hover:border-neutral-900"
              >
                Select lenses and buy
              </Link>
            </article>
          );
        })}
      </div>

      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label="Previous products"
          className={`${arrowButton} left-4`}
        >
          <Arrow direction="left" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label="Next products"
          className={`${arrowButton} right-4`}
        >
          <Arrow direction="right" />
        </button>
      )}
    </div>
  );
}
