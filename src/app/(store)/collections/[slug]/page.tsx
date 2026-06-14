import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCategory } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import ProductCard from "@/components/ui/ProductCard";
import SortSelect from "@/components/ui/SortSelect";
import PriceFilter from "@/components/ui/PriceFilter";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
    price_min?: string;
    price_max?: string;
  }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection Not Found" };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name}`,
  };
}

const PAGE_SIZE = 12;

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const [{ slug }, { sort = "newest", page = "1", price_min, price_max }] =
    await Promise.all([params, searchParams]);

  const category = await getCategory(slug);
  if (!category) notFound();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const priceMin = price_min ? parseFloat(price_min) : undefined;
  const priceMax = price_max ? parseFloat(price_max) : undefined;

  const { products, total } = await getProducts({
    categoryId: category.id,
    sort: sort as "newest" | "price_asc" | "price_desc",
    priceMin,
    priceMax,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <span className="text-neutral-700 font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-neutral-500 text-sm max-w-xl">
            {category.description}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-400">{total} products</p>
      </div>

      {/* Sort + Price filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <Suspense fallback={null}>
          <PriceFilter currentPriceMin={price_min} currentPriceMax={price_max} />
        </Suspense>
        <SortSelect value={sort} />
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">
          <p className="text-lg font-medium">No products in this collection yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/collections/${slug}?page=${p}${sort !== "newest" ? `&sort=${sort}` : ""}${price_min ? `&price_min=${price_min}` : ""}${price_max ? `&price_max=${price_max}` : ""}`}
              className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                p === currentPage
                  ? "bg-black text-white border-black"
                  : "border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
