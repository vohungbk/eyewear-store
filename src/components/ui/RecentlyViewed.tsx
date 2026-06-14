"use client";

import Link from "next/link";
import Image from "next/image";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { formatPrice } from "@/lib/utils/format";

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const { items } = useRecentlyViewed();
  const filtered = items.filter((i) => i.id !== excludeId);

  if (filtered.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-xl font-bold mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 lg:grid-cols-8">
        {filtered.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="group block"
          >
            <div className="aspect-square rounded-lg bg-neutral-100 overflow-hidden mb-2">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs font-medium truncate">{item.name}</p>
            <p className="text-xs text-neutral-500">{formatPrice(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
