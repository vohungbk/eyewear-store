import type { Metadata } from "next";
import { getAbandonedCarts } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import { triggerRecoveryEmail } from "@/lib/actions/abandonedCart";
import Link from "next/link";
import type { CartItem } from "@/types/cart";

export const metadata: Metadata = { title: "Admin — Abandoned Carts" };

const FILTERS = ["all", "pending", "sent", "recovered"] as const;
type Filter = (typeof FILTERS)[number];

interface Props {
  searchParams: Promise<{ filter?: string; page?: string }>;
}

function StatusBadge({ cart }: { cart: { email_sent_at: string | null; recovered_at: string | null } }) {
  if (cart.recovered_at) {
    return (
      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">
        Recovered
      </span>
    );
  }
  if (cart.email_sent_at) {
    return (
      <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
        Email sent
      </span>
    );
  }
  return (
    <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">
      Pending
    </span>
  );
}

export default async function AbandonedCartsPage({ searchParams }: Props) {
  const { filter: rawFilter, page } = await searchParams;
  const filter = (FILTERS.includes(rawFilter as Filter) ? rawFilter : "all") as Filter;
  const currentPage = parseInt(page ?? "1", 10);

  const { carts, count } = await getAbandonedCarts(filter, currentPage);

  const totalPages = Math.ceil(count / 30);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Abandoned Carts</h1>
        <p className="text-sm text-neutral-500">{count} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/abandoned-carts?filter=${f}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
              filter === f
                ? "bg-black text-white border-black"
                : "border-neutral-200 text-neutral-600 hover:border-black"
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {carts.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">No carts found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Customer</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Items</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Total</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Date</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {carts.map((cart) => {
                const items = (cart.cart_items ?? []) as CartItem[];
                const itemCount = items.reduce((s, i) => s + i.quantity, 0);
                const preview = items.slice(0, 2).map((i) => i.name).join(", ");
                const more = items.length > 2 ? ` +${items.length - 2} more` : "";

                return (
                  <tr key={cart.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      <p className="font-medium">{cart.name ?? "—"}</p>
                      <p className="text-xs text-neutral-400">{cart.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-neutral-600 max-w-[200px] truncate">
                        {preview}{more}
                      </p>
                      <p className="text-xs text-neutral-400">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                    </td>
                    <td className="px-5 py-3 font-medium">{formatPrice(cart.cart_total)}</td>
                    <td className="px-5 py-3 text-neutral-500 text-xs">
                      {new Date(cart.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge cart={cart} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!cart.recovered_at && !cart.email_sent_at && (
                        <form
                          action={async () => {
                            "use server";
                            await triggerRecoveryEmail(cart.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs text-neutral-500 hover:text-black transition-colors"
                          >
                            Send email
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <Link
              href={`/admin/abandoned-carts?filter=${filter}&page=${currentPage - 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              ← Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`/admin/abandoned-carts?filter=${filter}&page=${currentPage + 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      {/* Setup instructions */}
      <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-500 space-y-1">
        <p className="font-semibold text-neutral-700">Cron setup</p>
        <p>
          Call <code className="font-mono bg-neutral-100 px-1 rounded">GET /api/cron/abandoned-carts?secret=YOUR_CRON_SECRET</code> hourly
          to automatically send recovery emails to carts abandoned for more than 1 hour.
        </p>
        <p>Add <code className="font-mono bg-neutral-100 px-1 rounded">CRON_SECRET</code> to your environment variables.</p>
      </div>
    </div>
  );
}
