import Link from "next/link";
import { getFeaturedProducts, getProducts } from "@/lib/data/products";
import FeaturedCarousel, {
  type CarouselProduct,
} from "@/components/ui/FeaturedCarousel";
import HeroVideo from "@/components/ui/HeroVideo";
import PromoSplit from "@/components/ui/PromoSplit";
import FeatureSplit from "@/components/ui/FeatureSplit";
import ImpactStat from "@/components/ui/ImpactStat";
import { getPrimaryImage } from "@/lib/utils/format";

export default async function HomePage() {
  const CAROUSEL_SIZE = 8;
  const featuredOnly = await getFeaturedProducts(CAROUSEL_SIZE);
  // Top up with the newest products so the carousel has enough to slide.
  const featured =
    featuredOnly.length >= CAROUSEL_SIZE
      ? featuredOnly
      : [
          ...featuredOnly,
          ...(
            await getProducts({ sort: "newest", limit: CAROUSEL_SIZE })
          ).products.filter((p) => !featuredOnly.some((f) => f.id === p.id)),
        ].slice(0, CAROUSEL_SIZE);

  return (
    <div>
      {/* Hero */}
      <section className="relative md:-mt-[var(--header-h)] flex min-h-[560px] h-[calc(100svh-var(--header-h))] md:h-svh items-end bg-neutral-950 text-white overflow-hidden">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight">
            See Clearly
            <br />
            Look Exceptional
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
            Premium eyewear crafted for every lifestyle. UV400 protection,
            lightweight frames, exceptional clarity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-block bg-white text-black text-sm font-semibold px-8 py-3 rounded-full hover:bg-neutral-100 transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              href="/collections/sunglasses"
              className="inline-block border border-white/70 text-white text-sm font-semibold px-8 py-3 rounded-full hover:border-white hover:bg-white/10 transition-colors"
            >
              Explore Sunglasses
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-600">
            {/* Star rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="font-semibold text-neutral-900">4.9</span>
              <span className="text-neutral-500">from 2,400+ reviews</span>
            </div>

            <span className="hidden sm:block w-px h-4 bg-neutral-200" />

            {[
              "UV400 Protection",
              "Free Shipping",
              "30-Day Returns",
              "Premium Materials",
            ].map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo tiles */}
      <PromoSplit
        tiles={[
          {
            title: "Everyday eyewear, made extraordinary",
            ctaLabel: "Explore Intelligent Eyewear",
            href: "/intelligent-eyewear",
            imageUrl: "/assets/promo/promo-1-lifestyle.avif",
            imageAlt: "Model wearing tinted frames",
          },
          {
            title: "Sunglasses for every season",
            ctaLabel: "Book a demo",
            href: "/reservations/demo/book",
            imageUrl: "/assets/promo/promo-2-frames.avif",
            imageAlt: "Three frames in green, red and black",
          },
        ]}
      />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="mb-6 flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-medium">
              Shop all <span className="text-blue-700">featured</span>
            </h2>
            <Link
              href="/products"
              className="inline-flex h-10 items-center rounded-full border border-blue-700 px-5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-700 hover:text-white"
            >
              Shop all
            </Link>
          </div>
          <FeaturedCarousel products={featured as CarouselProduct[]} />
        </section>
      )}

      {/* Collection feature */}
      <FeatureSplit
        title="Meet our newest collection"
        ctaLabel="Shop now"
        href="/products"
        imageUrl="/assets/feature-split/feature-split-lifestyle.avif"
        imageAlt="Model in tinted gold-rimmed sunglasses"
      />

      {/* Impact */}
      <ImpactStat
        eyebrow="Buy a Pair, Give a Pair"
        value="1,000,000"
        description="pairs of glasses (and counting) sold and loved around the world"
        ctaLabel="Learn more"
        href="/pages/about"
        images={featured
          .map((p) => getPrimaryImage(p.product_images ?? []))
          .filter((img): img is NonNullable<typeof img> => !!img)
          .slice(0, 5)
          .map((img) => ({ url: img.url, alt: img.alt || "" }))}
      />

      {/* Value props */}
      <section className="bg-white text-neutral-900 mt-8 border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
            {[
              {
                icon: "🚚",
                title: "Free Shipping",
                desc: "On all orders over $150",
              },
              {
                icon: "↩",
                title: "Easy Returns",
                desc: "30-day hassle-free returns",
              },
              {
                icon: "🛡",
                title: "Warranty",
                desc: "1-year manufacturer warranty",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-2">
                <span className="text-3xl">{icon}</span>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
