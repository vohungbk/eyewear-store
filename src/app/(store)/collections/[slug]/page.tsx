import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategory } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import ProductCard from "@/components/ui/ProductCard";

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
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
  const [{ slug }, { sort = "newest", page = "1" }] = await Promise.all([
    params,
    searchParams,
  ]);

  const category = await getCategory(slug);
  if (!category) notFound();

  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { products, total } = await getProducts({
    categoryId: category.id,
    sort: sort as "newest" | "price_asc" | "price_desc",
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
        <a href="/" className="hover:text-black transition-colors">Home</a>
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

      {/* Sort */}
      <div className="flex justify-end mb-4">
        <select
          defaultValue={sort}
          onChange={(e) => {
            const url = new URL(window.location.href);
            url.searchParams.set("sort", e.target.value);
            url.searchParams.delete("page");
            window.location.href = url.toString();
          }}
          className="text-sm border border-neutral-200 rounded-md px-3 py-1.5 bg-white focus:outline-none focus:border-black"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
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
            <a
              key={p}
              href={`/collections/${slug}?page=${p}${sort !== "newest" ? `&sort=${sort}` : ""}`}
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
