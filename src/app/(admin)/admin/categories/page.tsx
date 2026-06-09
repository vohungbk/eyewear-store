import type { Metadata } from "next";
import Link from "next/link";
import { getAdminCategories } from "@/lib/data/admin";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export const metadata: Metadata = { title: "Admin — Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  // Build a lookup for parent names
  const nameById = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + Add Category
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">
            No categories yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Name</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Slug</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Parent</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3 w-16">Pos</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium">{cat.name}</td>
                  <td className="px-5 py-3 font-mono text-xs text-neutral-500">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {cat.parent_id ? nameById[cat.parent_id] ?? "—" : "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">{cat.position}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="text-xs text-neutral-500 hover:text-black transition-colors"
                      >
                        Edit
                      </Link>
                      <DeleteCategoryButton id={cat.id} name={cat.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
