import type { Metadata } from "next";
import Link from "next/link";
import { getAdminCategories } from "@/lib/data/admin";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Admin — New Category" };

export default async function NewCategoryPage() {
  const allCategories = await getAdminCategories();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/categories"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Categories
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold">New Category</h1>
      </div>

      <CategoryForm allCategories={allCategories} />
    </div>
  );
}
