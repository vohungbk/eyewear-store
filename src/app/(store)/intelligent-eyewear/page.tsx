import type { Metadata } from "next";
import Link from "next/link";
import EyeglassesProductCard from "@/components/ui/EyeglassesProductCard";
import {
  INTELLIGENT_EYEWEAR,
  INTELLIGENT_EYEWEAR_BANNERS,
  type CollectionBanner,
} from "@/lib/data/intelligentEyewearSample";

export const metadata: Metadata = {
  title: "Intelligent Eyewear",
  description:
    "Google and Samsung present Intelligent Eyewear: next-gen glasses designed for all-day wear.",
};

// Banners sit between frames so the 3-column grid tiles evenly:
// banner, 5 frames, 2 banners, 5 frames, banner.
const LAYOUT: ({ banner: number } | { frame: number })[] = [
  { banner: 0 },
  ...[0, 1, 2, 3, 4].map((frame) => ({ frame })),
  { banner: 1 },
  { banner: 2 },
  ...[5, 6, 7, 8, 9].map((frame) => ({ frame })),
  { banner: 3 },
];

function Banner({ banner }: { banner: CollectionBanner }) {
  return (
    <div className="relative mb-12 aspect-[171/265] overflow-hidden rounded-xl bg-[#f6f0e9] sm:col-span-2 sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]">
      <picture>
        <source media="(min-width: 640px)" srcSet={banner.image} />
        <img
          src={banner.mobileImage}
          alt={banner.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </div>
  );
}

export default function IntelligentEyewearPage() {
  return (
    <div className="border-t border-[#e1e5e6] px-6 text-[#121212] lg:px-12">
      <div className="pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#3a434c]"
        >
          <Link href="/" className="hover:text-[#121212] hover:underline">
            Home
          </Link>
          <span aria-hidden>&rsaquo;</span>
          <Link
            href="/collections"
            className="hover:text-[#121212] hover:underline"
          >
            Collections
          </Link>
          <span aria-hidden>&rsaquo;</span>
          <span className="font-medium text-[#121212]">
            Intelligent Eyewear
          </span>
        </nav>
        <h1 className="mt-2 text-2xl font-medium leading-[34px] tracking-[0.48px] lg:text-[32px] lg:leading-10">
          Intelligent Eyewear
        </h1>
      </div>

      <div className="py-4 text-base text-[#3a434c] lg:py-5">
        {INTELLIGENT_EYEWEAR.length} frames
      </div>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
        {LAYOUT.map((cell, i) =>
          "banner" in cell ? (
            <Banner
              key={`banner-${cell.banner}`}
              banner={INTELLIGENT_EYEWEAR_BANNERS[cell.banner]}
            />
          ) : (
            <div key={INTELLIGENT_EYEWEAR[cell.frame].id} className="mb-12">
              <EyeglassesProductCard
                item={INTELLIGENT_EYEWEAR[cell.frame]}
                priority={i < 4}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
