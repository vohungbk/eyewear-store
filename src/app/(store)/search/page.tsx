import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import ProductCard from "@/components/ui/ProductCard";

export const metadata: Metadata = {
  title: "Search",
  description: "Search our eyewear collection",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page = "1" } = await searchParams;
  const query = q.trim();
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const PAGE_SIZE = 12;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { products, total } = query
    ? await getProducts({ search: query, limit: PAGE_SIZE, offset })
    : { products: [], total: 0 };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search form */}
      <form method="get" action="/search" className="mb-8">
        <div className="relative max-w-xl">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search eyewear..."
            autoFocus
            className="w-full border border-neutral-200 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>

      {/* Results */}
      {!query ? (
        <p className="text-neutral-500">Enter a search term above.</p>
      ) : products.length === 0 ? (
        <div className="text-neutral-500">
          <p className="font-medium">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm mt-1">Try a different search term.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-neutral-500 mb-6">
            {total} result{total !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                  className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                    p === currentPage
                      ? "bg-black text-white border-black"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
