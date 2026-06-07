"use client";

import Image from "next/image";
import { useState } from "react";

interface GalleryImage {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
  is_primary: boolean;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return a.position - b.position;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const active = sorted[activeIndex];

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-neutral-100 rounded-xl flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-neutral-300"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
        <Image
          src={active.url}
          alt={active.alt_text ?? productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={activeIndex === 0}
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`relative shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                idx === activeIndex
                  ? "border-black"
                  : "border-transparent hover:border-neutral-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? `${productName} ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
