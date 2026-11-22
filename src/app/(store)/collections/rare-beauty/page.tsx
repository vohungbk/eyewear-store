import type { Metadata } from "next";
import Link from "next/link";
import EyeglassesProductCard from "@/components/ui/EyeglassesProductCard";
import PromoVideo from "@/components/ui/PromoVideo";
import {
  RARE_BEAUTY_BANNERS,
  RARE_BEAUTY_FRAMES,
  type RareBeautyBanner,
} from "@/lib/data/rareBeautySample";

export const metadata: Metadata = {
  title: "Rare Beauty",
  description:
    "Our collaboration with Rare Beauty: five frames customized to match their fan-favorite Soft Pinch Liquid Blush.",
};

// Order follows the original page: hero banner, frame, square banner,
// two frames, frame, wide banner, video banner, frame, full-width banner.
const LAYOUT: ({ banner: number } | { frame: number })[] = [
  { banner: 0 },
  { frame: 0 },
  { banner: 1 },
  { frame: 1 },
  { frame: 2 },
  { frame: 3 },
  { banner: 2 },
  { banner: 3 },
  { frame: 4 },
  { banner: 4 },
];

const SPAN: Record<RareBeautyBanner["variant"], string> = {
  hero: "aspect-[171/265] sm:col-span-2 sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]",
  video: "aspect-[171/265] sm:col-span-2 sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]",
  wide: "aspect-[171/265] sm:col-span-2 sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]",
  square: "aspect-square sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]",
  full: "aspect-[171/265] sm:col-span-2 sm:aspect-[2652/858] xl:col-span-3",
};

function Banner({ banner }: { banner: RareBeautyBanner }) {
  return (
    <div
      className={`relative mb-12 overflow-hidden rounded-xl bg-[#f6f0e9] ${SPAN[banner.variant]}`}
    >
      {banner.video ? (
        <PromoVideo
          src={banner.video.src}
          mobileSrc={banner.video.mobileSrc}
          poster={banner.image}
          mobilePoster={banner.mobileImage}
          label={banner.alt}
        />
      ) : (
        <picture>
          <source media="(min-width: 640px)" srcSet={banner.image} />
          <img
            src={banner.mobileImage}
            alt={banner.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      )}
    </div>
  );
}

export default function RareBeautyPage() {
  return (
    <div className="border-t border-[#e1e5e6] px-6 text-[#121212] lg:px-12">
      <div className="pt-6">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-[#3a434c]"
        >
          <Link href="/" className="hover:text-[#121212] hover:underline">
            Homepage
          </Link>
          <span aria-hidden>&rsaquo;</span>
          <Link
            href="/collections"
            className="hover:text-[#121212] hover:underline"
          >
            Collections
          </Link>
          <span aria-hidden>&rsaquo;</span>
          <span className="font-medium text-[#121212]">Rare Beauty</span>
        </nav>
        <h1 className="mt-2 text-2xl font-medium leading-[34px] tracking-[0.48px] lg:text-[32px] lg:leading-10">
          Rare Beauty
        </h1>
      </div>

      <div className="py-4 text-base text-[#3a434c] lg:py-5">
        {RARE_BEAUTY_FRAMES.length} frames
      </div>

      <div className="grid grid-cols-1 gap-x-6 sm:grid-flow-row-dense sm:grid-cols-2 xl:grid-cols-3">
        {LAYOUT.map((cell, i) =>
          "banner" in cell ? (
            <Banner
              key={`banner-${cell.banner}`}
              banner={RARE_BEAUTY_BANNERS[cell.banner]}
            />
          ) : (
            <div key={RARE_BEAUTY_FRAMES[cell.frame].id} className="mb-12">
              <EyeglassesProductCard
                item={RARE_BEAUTY_FRAMES[cell.frame]}
                priority={i < 4}
              />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
