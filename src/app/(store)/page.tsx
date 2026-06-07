import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import ProductCard from "@/components/ui/ProductCard";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-36 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            See the World
            <br />
            <span className="text-neutral-400">in Style</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">
            Premium eyewear crafted for every lifestyle. UV400 protection,
            lightweight frames, exceptional clarity.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-block bg-white text-black text-sm font-semibold px-8 py-3 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Shop All
            </Link>
            <Link
              href="/collections/sunglasses"
              className="inline-block border border-neutral-600 text-white text-sm font-semibold px-8 py-3 rounded-md hover:border-white transition-colors"
            >
              Sunglasses
            </Link>
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
