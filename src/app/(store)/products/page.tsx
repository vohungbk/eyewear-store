import { Suspense } from "react";
import type { Metadata } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import ProductCard from "@/components/ui/ProductCard";
import ProductsFilterBar from "@/components/ui/ProductsFilterBar";

export const metadata: Metadata = {
  title: "All Eyewear",
  description: "Browse our full collection of premium sunglasses and eyeglasses.",
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

const PAGE_SIZE = 12;

interface ProductsPageProps {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { sort = "newest", category, page = "1", price_min, price_max } = await searchParams;

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const priceMin = price_min ? parseFloat(price_min) : undefined;
  const priceMax = price_max ? parseFloat(price_max) : undefined;

  const [{ products, total }, categories] = await Promise.all([
    getProducts({
      categoryId: category,
      sort: sort as "newest" | "price_asc" | "price_desc",
      priceMin,
      priceMax,
      limit: PAGE_SIZE,
      offset,
    }),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">All Eyewear</h1>
        <p className="text-sm text-neutral-500 mt-1">{total} products</p>
      </div>

      {/* Filter / sort bar */}
      <Suspense fallback={null}>
        <ProductsFilterBar
          categories={categories}
          sortOptions={SORT_OPTIONS}
          currentSort={sort}
          currentCategory={category}
          currentPriceMin={price_min}
          currentPriceMax={price_max}
        />
      </Suspense>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/products?page=${p}${sort !== "newest" ? `&sort=${sort}` : ""}${category ? `&category=${category}` : ""}${price_min ? `&price_min=${price_min}` : ""}${price_max ? `&price_max=${price_max}` : ""}`}
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
    </div>
  );
}
