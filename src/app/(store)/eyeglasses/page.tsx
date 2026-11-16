import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEyeglassFilterOptions, getProducts } from "@/lib/data/products";
import { getCategory } from "@/lib/data/categories";
import EyeglassesShell from "@/components/ui/EyeglassesShell";
import EyeglassesSort from "@/components/ui/EyeglassesSort";
import ReadMoreText from "@/components/ui/ReadMoreText";
import PriceRangeSlider from "@/components/ui/PriceRangeSlider";
import MobileFilterBar from "@/components/ui/MobileFilterBar";
import EyeglassesProductCard from "@/components/ui/EyeglassesProductCard";
import { getPrimaryImage } from "@/lib/utils/format";
import {
  SAMPLE_BANNER,
  SAMPLE_EYEGLASSES,
  type EyeglassItem,
} from "@/lib/data/eyeglassesSample";

export const metadata: Metadata = {
  title: "Eyeglasses",
  description:
    "Prescription frames for every face. Shop our full eyeglasses collection.",
};

const PAGE_SIZE = 12;
const SORTS = ["newest", "price_asc", "price_desc"] as const;
type Sort = (typeof SORTS)[number];

const MERCH = [
  { value: "bestsellers", label: "Bestsellers" },
  { value: "90s", label: "Trending: 90s minimalism" },
  { value: "progressives", label: "Good for progressives" },
  { value: "new-arrival", label: "New arrivals" },
] as const;

const MIN_REAL_PRODUCTS = 6;

const COLOR_OPTIONS = [
  { value: "Black", dot: "#000000" },
  { value: "Brown", dot: "#7a5a2c" },
  {
    value: "Tortoise",
    dot: "radial-gradient(circle at 30% 30%, #b5651d, #3b1e0e 60%, #c98a3a)",
  },
  {
    value: "Crystal",
    dot: "radial-gradient(circle at 40% 35%, #ffffff, #e8f1f8)",
  },
  {
    value: "Multicolor",
    dot: "conic-gradient(#ff5f6d, #ffc371, #f9f871, #6fe3a0, #5bb5ff, #b36bff, #ff5f6d)",
  },
  {
    value: "Two-tone",
    dot: "linear-gradient(#2b2523 50%, #b5bcc6 50%)",
  },
  {
    value: "Gold",
    dot: "conic-gradient(#d9b44a, #f6e08a, #b8932f, #f1d977, #d9b44a)",
  },
  {
    value: "Silver",
    dot: "conic-gradient(#9a9a9a, #e6e6e6, #8c8c8c, #d9d9d9, #9a9a9a)",
  },
  { value: "Red", dot: "#c0503a" },
  { value: "Yellow", dot: "#f7e06f" },
  { value: "Green", dot: "#8cc0a0" },
  { value: "Blue", dot: "#5b9bd9" },
  { value: "Pink", dot: "#e0919f" },
  { value: "Purple", dot: "#8b66d0" },
  { value: "Grey", dot: "#939395" },
  {
    value: "Clear",
    dot: "radial-gradient(circle at 40% 35%, #ffffff, #dcdcdc)",
  },
];

interface PageProps {
  searchParams: Promise<{
    merch?: string;
    sort?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
    color?: string | string[];
    width?: string | string[];
  }>;
}

function Caret() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="rounded-full border border-[#e1e5e6] p-1 transition-transform group-open:rotate-180"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PromoBanner() {
  return (
    <Link
      href={SAMPLE_BANNER.href}
      aria-label={SAMPLE_BANNER.alt}
      className="relative mb-12 block aspect-[171/265] overflow-hidden rounded-xl bg-[#f6f0e9] sm:col-span-2 sm:aspect-auto sm:min-h-[218px] xl:min-h-[279px]"
    >
      <picture>
        <source media="(min-width: 640px)" srcSet={SAMPLE_BANNER.image} />
        <img
          src={SAMPLE_BANNER.mobileImage}
          alt={SAMPLE_BANNER.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
    </Link>
  );
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((x) => x !== value)
    : [...list, value];
}

function buildHref(params: Record<string, string | string[] | undefined>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((x) => qs.append(k, x));
    else if (v) qs.set(k, v);
  });
  const s = qs.toString();
  return s ? `/eyeglasses?${s}` : "/eyeglasses";
}

export default async function EyeglassesPage({ searchParams }: PageProps) {
  const {
    merch,
    sort: rawSort,
    page = "1",
    price_min,
    price_max,
    color,
    width,
  } = await searchParams;

  const category = await getCategory("eyeglasses");
  if (!category) notFound();

  const options = await getEyeglassFilterOptions(category.id);
  const activeColors = toArray(color).filter((c) =>
    COLOR_OPTIONS.some((o) => o.value === c),
  );
  const activeWidths = toArray(width).filter((w) =>
    options.frameWidths.includes(w),
  );

  const sort: Sort = SORTS.includes(rawSort as Sort)
    ? (rawSort as Sort)
    : "newest";
  const activeMerch = MERCH.find((m) => m.value === merch)?.value;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const priceMin = price_min ? parseFloat(price_min) : undefined;
  const priceMax = price_max ? parseFloat(price_max) : undefined;

  const { products, total: dbTotal } = await getProducts({
    categoryId: category.id,
    featured: activeMerch === "bestsellers" ? true : undefined,
    sort,
    priceMin: Number.isFinite(priceMin) ? priceMin : undefined,
    priceMax: Number.isFinite(priceMax) ? priceMax : undefined,
    colors: activeColors,
    frameWidths: activeWidths,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  // Demo fallback: when the catalog is nearly empty, show the sample frames.
  const useSample =
    dbTotal < MIN_REAL_PRODUCTS &&
    !activeMerch &&
    activeColors.length === 0 &&
    activeWidths.length === 0;

  let items: EyeglassItem[];
  let total: number;
  if (useSample) {
    items = SAMPLE_EYEGLASSES.filter(
      (x) =>
        (!Number.isFinite(priceMin) || x.price >= (priceMin as number)) &&
        (!Number.isFinite(priceMax) || x.price <= (priceMax as number)),
    ).sort((x, y) =>
      sort === "price_asc"
        ? x.price - y.price
        : sort === "price_desc"
          ? y.price - x.price
          : 0,
    );
    total = items.length;
  } else {
    total = dbTotal;
    items = products.map((p) => {
      const variants =
        (
          p as unknown as {
            product_variants?: { name: string; attributes: unknown }[];
          }
        ).product_variants ?? [];
      const seen = new Set<string>();
      const swatches = variants.flatMap((v) => {
        const label =
          ((v.attributes ?? {}) as { color?: string }).color ?? v.name;
        if (seen.has(label)) return [];
        seen.add(label);
        return [{ label, color: "#9ca3af" }];
      });
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        tag: p.is_featured ? "Bestseller" : undefined,
        image: getPrimaryImage(p.product_images ?? [])?.url ?? null,
        href: `/products/${p.slug}`,
        cta: "Select lenses and buy",
        swatches,
        wishlistId: p.id,
      };
    });
  }

  const totalPages = useSample ? 1 : Math.ceil(total / PAGE_SIZE);
  const base = {
    merch: activeMerch,
    sort: sort !== "newest" ? sort : undefined,
    price_min,
    price_max,
    color: activeColors,
    width: activeWidths,
  };

  const head = (showTitle: boolean) => (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[#3a434c]"
      >
        <Link href="/" className="hover:text-[#121212] hover:underline">
          Home
        </Link>
        <span aria-hidden>&rsaquo;</span>
        <span className="text-[#121212]">Eyeglasses</span>
      </nav>
      {showTitle ? (
        <h1 className="mt-2 text-2xl font-medium leading-[34px] tracking-[0.48px]">
          Eyeglasses
        </h1>
      ) : (
        <h1 className="sr-only">Eyeglasses</h1>
      )}
      <ReadMoreText
        paragraphs={[
          "Starting at $95, including prescription lenses with scratch-resistant, anti-reflective coatings. After choosing your eyeglasses, pick from a variety of prescription types and lens options to meet your vision needs.",
          "Buy one pair and get 20% off additional pairs, plus get free shipping and free 30-day returns on every order.",
        ]}
      />
      <Link
        href="/products"
        className="mt-4 mb-6 inline-flex items-center gap-1 text-base font-medium tracking-[0.32px] text-[#1050d0] hover:text-[#0b3a9a]"
      >
        Start with a style quiz <span aria-hidden>&rsaquo;</span>
      </Link>
    </div>
  );

  const groups = (
    <div>
      <details open className="group border-t border-[#e1e5e6]">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-medium tracking-[0.32px] [&::-webkit-details-marker]:hidden">
          Shop by
          <span className="flex items-center gap-3">
            {activeMerch && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eef3fd] px-1 text-xs font-medium text-[#1050d0]">
                1
              </span>
            )}
            <Caret />
          </span>
        </summary>
        <ul className="mb-3 divide-y divide-[#e1e5e6] rounded-lg border border-[#e1e5e6] px-3 text-sm font-semibold tracking-[0.28px] [&>li]:py-3">
          {MERCH.map((m) => {
            const active = activeMerch === m.value;
            return (
              <li key={m.value}>
                <Link
                  href={buildHref({
                    ...base,
                    merch: active ? undefined : m.value,
                  })}
                  className={`flex items-center gap-3 hover:underline ${
                    active ? "underline" : ""
                  }`}
                  aria-current={active ? "true" : undefined}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      active
                        ? "border-[#2b4fd0] bg-[#2b4fd0]"
                        : "border-[#121212]"
                    }`}
                  >
                    {active && (
                      <span className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </span>
                  {m.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </details>

      {(
        [
          {
            title: "Frame width",
            param: "width",
            values: options.frameWidths.map((v) => ({
              value: v,
              dot: undefined,
            })),
            active: activeWidths,
          },
          {
            title: "Color",
            param: "color",
            values: COLOR_OPTIONS,
            active: activeColors,
          },
        ] as const
      )
        .filter((f) => f.values.length > 0)
        .map((f) => (
          <details
            key={f.title}
            open={f.active.length > 0}
            className="group border-t border-[#e1e5e6]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-medium tracking-[0.32px] [&::-webkit-details-marker]:hidden">
              {f.title}
              <span className="flex items-center gap-3">
                {f.active.length > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eef3fd] px-1 text-xs font-medium text-[#1050d0]">
                    {f.active.length}
                  </span>
                )}
                <Caret />
              </span>
            </summary>
            <ul className="grid grid-cols-2 gap-3 pb-4">
              {f.values.map((opt) => {
                const checked = f.active.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <Link
                      href={buildHref({
                        ...base,
                        [f.param]: toggle([...f.active], opt.value),
                      })}
                      aria-current={checked ? "true" : undefined}
                      className={`flex h-12 items-center gap-3 rounded-lg border px-3 text-base font-semibold tracking-[0.32px] ${
                        checked
                          ? "border-[#121212]"
                          : "border-[#e1e5e6] hover:border-[#a1a4a6]"
                      }`}
                    >
                      {opt.dot && (
                        <span
                          className="h-6 w-6 shrink-0 rounded-full"
                          style={{ background: opt.dot }}
                        />
                      )}
                      {opt.value}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ))}

      <details
        className="group border-t border-[#e1e5e6]"
        open={!!(price_min || price_max)}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-medium tracking-[0.32px] [&::-webkit-details-marker]:hidden">
          Frame price
          <Caret />
        </summary>
        <Suspense fallback={null}>
          <PriceRangeSlider priceMin={price_min} priceMax={price_max} />
        </Suspense>
      </details>
      <div className="border-t border-[#e1e5e6]" />
    </div>
  );

  const sidebar = (
    <div className="pt-3">
      {head(true)}
      {groups}
    </div>
  );

  const mobileLabels = [
    "Shop by",
    ...(options.frameWidths.length > 0 ? ["Frame width"] : []),
    "Color",
    "Frame price",
  ];

  const compactHeader = (
    <div className="pt-6">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-[#3a434c]"
      >
        <Link href="/" className="hover:text-[#121212] hover:underline">
          Home
        </Link>
        <span aria-hidden>&rsaquo;</span>
        <span className="font-medium text-[#121212]">Eyeglasses</span>
      </nav>
      <h1 className="mt-2 text-center text-2xl font-medium leading-[34px] tracking-[0.48px]">
        Eyeglasses
      </h1>
    </div>
  );

  const chips: { key: string; label: string; href: string }[] = [
    ...activeWidths.map((w) => ({
      key: `w-${w}`,
      label: w,
      href: buildHref({ ...base, width: activeWidths.filter((x) => x !== w) }),
    })),
    ...activeColors.map((c) => ({
      key: `c-${c}`,
      label: c,
      href: buildHref({ ...base, color: activeColors.filter((x) => x !== c) }),
    })),
    ...(activeMerch
      ? [
          {
            key: "merch",
            label: MERCH.find((m) => m.value === activeMerch)?.label ?? "",
            href: buildHref({ ...base, merch: undefined }),
          },
        ]
      : []),
    ...(price_min || price_max
      ? [
          {
            key: "price",
            label: `$${price_min ?? 95} - $${price_max ?? 195}`,
            href: buildHref({
              ...base,
              price_min: undefined,
              price_max: undefined,
            }),
          },
        ]
      : []),
  ];

  const tags =
    chips.length > 0 ? (
      <div className="flex flex-wrap items-center gap-3 pb-5">
        {chips.map((c) => (
          <Link
            key={c.key}
            href={c.href}
            className="flex h-9 items-center gap-2 rounded-full bg-[#f4f4f2] px-4 text-sm font-medium text-[#1050d0]"
          >
            <span aria-hidden>&times;</span>
            {c.label}
            <span className="sr-only"> (remove filter)</span>
          </Link>
        ))}
        <Link
          href="/eyeglasses"
          className="flex h-9 items-center rounded-full border border-[#e1e5e6] bg-white px-4 text-sm font-medium"
        >
          Reset
        </Link>
      </div>
    ) : null;

  const mobileTop = (
    <div className="pt-4 lg:hidden">
      {head(false)}
      <MobileFilterBar labels={mobileLabels} total={total} chips={chips}>
        {groups}
      </MobileFilterBar>
    </div>
  );

  return (
    <EyeglassesShell
      sidebar={sidebar}
      compactHeader={compactHeader}
      mobileTop={mobileTop}
      tags={tags}
      total={total}
      sort={
        <Suspense fallback={null}>
          <EyeglassesSort value={sort} />
        </Suspense>
      }
    >
      <div>
        {items.length === 0 ? (
          <div className="py-20 text-center text-[#3a434c]">
            <p className="text-lg font-medium text-[#121212]">
              No frames found
            </p>
            <p className="mt-1 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-3 group-data-[hidden=true]/shell:xl:grid-cols-4">
            {items.flatMap((item, i) => {
              const card = (
                <div key={item.id} className="mb-12">
                  <EyeglassesProductCard item={item} priority={i < 3} />
                </div>
              );
              return useSample && i === 0
                ? [card, <PromoBanner key="promo" />]
                : [card];
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="mb-12 flex justify-center gap-2"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref({
                  ...base,
                  page: p > 1 ? String(p) : undefined,
                })}
                className={`rounded border px-3 py-1.5 text-sm font-medium transition-colors ${
                  p === currentPage
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {p}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </EyeglassesShell>
  );
}
