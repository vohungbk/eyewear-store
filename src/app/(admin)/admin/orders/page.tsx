import type { Metadata } from "next";
import Link from "next/link";
import { getAdminOrders } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Orders" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status, page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);

  const { orders } = await getAdminOrders(status, currentPage);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Orders</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Link
          href="/admin/orders"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !status
              ? "bg-black text-white border-black"
              : "border-neutral-200 text-neutral-600 hover:border-black"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
              status === s
                ? "bg-black text-white border-black"
                : "border-neutral-200 text-neutral-600 hover:border-black"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">
            No orders found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Order
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Customer
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Date
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Total
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3 font-mono text-xs">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3">
                    <p>{order.customer_name}</p>
                    <p className="text-xs text-neutral-400">
                      {order.customer_email}
                    </p>
                  </td>
                  <td className="px-5 py-3 text-neutral-500">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                        STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-neutral-500 hover:text-black transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex gap-2 mt-4">
        {currentPage > 1 && (
          <Link
            href={`/admin/orders?page=${currentPage - 1}${status ? `&status=${status}` : ""}`}
            className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
          >
            ← Previous
          </Link>
        )}
        {orders.length === 30 && (
          <Link
            href={`/admin/orders?page=${currentPage + 1}${status ? `&status=${status}` : ""}`}
            className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
          >
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
