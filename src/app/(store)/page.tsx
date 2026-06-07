export default function HomePage() {
  return (
    <div>
      {/* Hero — Phase 5 will build this out */}
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
            <a
              href="/products"
              className="inline-block bg-white text-black text-sm font-semibold px-8 py-3 rounded-md hover:bg-neutral-100 transition-colors"
            >
              Shop All
            </a>
            <a
              href="/collections/sunglasses"
              className="inline-block border border-neutral-600 text-white text-sm font-semibold px-8 py-3 rounded-md hover:border-white transition-colors"
            >
              Sunglasses
            </a>
          </div>
        </div>
      </section>

      {/* Featured products placeholder */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold mb-8">Featured</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-neutral-100 rounded-lg mb-3" />
              <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-neutral-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
