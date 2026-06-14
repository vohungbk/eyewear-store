import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDiscounts } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import DeleteDiscountButton from "@/components/admin/DeleteDiscountButton";

export const metadata: Metadata = { title: "Admin — Discount Codes" };

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded ${
        active ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default async function DiscountsPage() {
  const discounts = await getAdminDiscounts();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Discount Codes</h1>
        <Link
          href="/admin/discounts/new"
          className="px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          + New Code
        </Link>
      </div>

      {discounts.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-lg">
          <p className="text-neutral-500 text-sm">No discount codes yet.</p>
          <Link href="/admin/discounts/new" className="mt-3 inline-block text-sm font-medium underline">
            Create your first code
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Code</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Discount</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Min Order</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Usage</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Expires</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {discounts.map((dc) => (
                <tr key={dc.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-mono font-semibold tracking-wider">{dc.code}</td>
                  <td className="px-5 py-3">
                    {dc.type === "percent" ? `${dc.value}% off` : `${formatPrice(dc.value)} off`}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {dc.min_order > 0 ? formatPrice(dc.min_order) : "—"}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {dc.usage_count}
                    {dc.usage_limit !== null ? ` / ${dc.usage_limit}` : " / ∞"}
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {dc.expires_at
                      ? new Date(dc.expires_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge active={dc.is_active} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <Link
                        href={`/admin/discounts/${dc.id}/edit`}
                        className="text-sm hover:underline"
                      >
                        Edit
                      </Link>
                      <DeleteDiscountButton id={dc.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
