import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Admin — New Product" };

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/products"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Products
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold">New Product</h1>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
