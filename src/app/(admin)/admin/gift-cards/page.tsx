import type { Metadata } from "next";
import Link from "next/link";
import { getAdminGiftCards } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Gift Cards" };

const FILTERS = ["all", "active", "depleted", "pending"] as const;
type Filter = (typeof FILTERS)[number];

interface Props {
  searchParams: Promise<{ filter?: string; page?: string }>;
}

function StatusBadge({ card }: { card: { is_active: boolean; balance: number; initial_value: number } }) {
  if (!card.is_active) {
    return <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-yellow-50 text-yellow-700">Pending</span>;
  }
  if (card.balance <= 0) {
    return <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-500">Depleted</span>;
  }
  return <span className="inline-block text-[11px] font-medium px-2 py-0.5 rounded bg-green-50 text-green-700">Active</span>;
}

export default async function AdminGiftCardsPage({ searchParams }: Props) {
  const { filter: rawFilter, page } = await searchParams;
  const filter = (FILTERS.includes(rawFilter as Filter) ? rawFilter : "all") as Filter;
  const currentPage = parseInt(page ?? "1", 10);

  const { cards, count } = await getAdminGiftCards(filter, currentPage);
  const totalPages = Math.ceil(count / 30);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Gift Cards</h1>
        <p className="text-sm text-neutral-500">{count} total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={`/admin/gift-cards?filter=${f}`}
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
        {cards.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">No gift cards found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Code</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Recipient</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Value</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Balance</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Date</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {cards.map((card) => (
                <tr key={card.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-semibold tracking-wider">{card.code}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium">{card.recipient_name ?? "—"}</p>
                    <p className="text-xs text-neutral-400">{card.recipient_email}</p>
                  </td>
                  <td className="px-5 py-3 font-medium">{formatPrice(card.initial_value)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        card.balance <= 0
                          ? "text-neutral-400"
                          : card.balance < card.initial_value
                          ? "text-amber-600 font-medium"
                          : "text-green-600 font-medium"
                      }
                    >
                      {formatPrice(card.balance)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">
                    {new Date(card.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge card={card} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <Link
              href={`/admin/gift-cards?filter=${filter}&page=${currentPage - 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              ← Previous
            </Link>
          )}
          {currentPage < totalPages && (
            <Link
              href={`/admin/gift-cards?filter=${filter}&page=${currentPage + 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-500 space-y-1">
        <p className="font-semibold text-neutral-700">How gift cards work</p>
        <p>Customers purchase gift cards at <code className="font-mono bg-neutral-100 px-1 rounded">/gift-cards</code>. Cards are activated automatically after payment. Recipients receive the code by email and can redeem it at checkout.</p>
        <p>Partial redemptions reduce the remaining balance. The webhook handles activation and partial deductions; the free-order endpoint handles full-balance redemptions.</p>
      </div>
    </div>
  );
}
