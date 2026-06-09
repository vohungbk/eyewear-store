import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCategory, getAdminCategories } from "@/lib/data/admin";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata: Metadata = { title: "Admin — Edit Category" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const [category, allCategories] = await Promise.all([
    getAdminCategory(id),
    getAdminCategories(),
  ]);

  if (!category) notFound();

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
        <h1 className="text-xl font-bold">Edit Category</h1>
      </div>

      <CategoryForm category={category} allCategories={allCategories} />
    </div>
  );
}
