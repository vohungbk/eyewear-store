import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import ProductCard from "@/components/ui/ProductCard";
import RecentlyViewed from "@/components/ui/RecentlyViewed";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-neutral-950 text-white overflow-hidden">
        <Image
          src="/hero.avif"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            See Clearly
            <br />
            <span className="text-neutral-400">Look Exceptional</span>
          </h1>
          <p className="mt-8 text-lg text-neutral-400 max-w-xl mx-auto">
            Premium eyewear crafted for every lifestyle. UV400 protection,
            lightweight frames, exceptional clarity.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-block bg-white text-black text-sm font-semibold px-8 py-3 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Shop Collection
            </Link>
            <Link
              href="/collections/sunglasses"
              className="inline-block border border-neutral-600 text-white text-sm font-semibold px-8 py-3 rounded-md hover:border-white transition-colors"
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

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-xl font-bold mb-5">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/collections/${cat.slug}`}
                className="px-5 py-2.5 rounded-full border border-neutral-200 text-sm font-medium hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Featured</h2>
            <Link
              href="/products"
              className="text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      <RecentlyViewed />

      {/* Value props */}
      <section className="bg-neutral-950 text-white mt-8">
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
                <p className="text-sm text-neutral-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
