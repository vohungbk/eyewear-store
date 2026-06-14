import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata: Metadata = { title: "Admin — Products" };

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const { search, page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);

  const { products } = await getAdminProducts(search, currentPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search products…"
          className="border border-neutral-200 rounded-md px-3 py-2 text-sm w-64 focus:outline-none focus:border-black"
        />
      </form>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {products.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">
            No products found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3 w-12" />
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Product
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Price
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Category
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Stock
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {products.map((product) => {
                const primaryImage = product.product_images?.find(
                  (i) => i.is_primary
                ) ?? product.product_images?.[0];

                return (
                  <tr key={product.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded bg-neutral-100 overflow-hidden shrink-0">
                        {primaryImage?.url && (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-neutral-400 font-mono">
                        {product.slug}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatPrice(product.price)}
                      {product.compare_at_price && (
                        <span className="ml-1.5 text-xs text-neutral-400 line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-neutral-500">
                      {product.categories?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const variants = product.product_variants ?? [];
                        if (variants.length === 0) return <span className="text-xs text-neutral-400">—</span>;
                        const minStock = Math.min(...variants.map((v) => v.stock_quantity));
                        const isLow = variants.some((v) => v.stock_quantity <= v.low_stock_threshold);
                        const isOut = variants.every((v) => v.stock_quantity === 0);
                        return (
                          <span className={`text-xs font-semibold ${isOut ? "text-red-600" : isLow ? "text-orange-500" : "text-green-700"}`}>
                            {isOut ? "Out" : `${minStock}${isLow ? " ⚠" : ""}`}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                          product.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                      {product.is_featured && (
                        <span className="ml-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-xs text-neutral-500 hover:text-black transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteProductButton id={product.id} name={product.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {currentPage > 1 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <Link
              href={`/admin/products?page=${currentPage - 1}${search ? `&search=${search}` : ""}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              ← Previous
            </Link>
          )}
          <Link
            href={`/admin/products?page=${currentPage + 1}${search ? `&search=${search}` : ""}`}
            className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
