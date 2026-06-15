import type { Metadata } from "next";
import Link from "next/link";
import { getAdminBundles } from "@/lib/data/admin";
import { deleteBundle } from "@/lib/actions/admin";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Bundles" };

export default async function AdminBundlesPage() {
  const bundles = await getAdminBundles();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Bundles</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{bundles.length} bundles</p>
        </div>
        <Link
          href="/admin/bundles/new"
          className="bg-black text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-neutral-800 transition-colors"
        >
          + New Bundle
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {bundles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-neutral-400 mb-3">No bundles yet.</p>
            <Link href="/admin/bundles/new" className="text-sm font-medium underline">
              Create your first bundle →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Bundle</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Products</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Discount</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {bundles.map((bundle) => (
                <tr key={bundle.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <p className="font-medium">{bundle.name}</p>
                    {bundle.description && (
                      <p className="text-xs text-neutral-400 mt-0.5 truncate max-w-xs">{bundle.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    <div className="text-xs space-y-0.5">
                      {bundle.bundle_items.slice(0, 3).map((item, i) => (
                        <p key={i}>{item.products?.name ?? "—"}</p>
                      ))}
                      {bundle.bundle_items.length > 3 && (
                        <p className="text-neutral-400">+{bundle.bundle_items.length - 3} more</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-semibold text-green-700">
                      {bundle.discount_type === "percent"
                        ? `${bundle.discount_value}% off`
                        : `${formatPrice(bundle.discount_value)} off`}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
                        bundle.is_active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {bundle.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/bundles/${bundle.id}/edit`}
                        className="text-xs text-neutral-500 hover:text-black transition-colors"
                      >
                        Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteBundle(bundle.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            if (!confirm("Delete this bundle?")) e.preventDefault();
                          }}
                        >
                          Delete
                        </button>
                      </form>
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
