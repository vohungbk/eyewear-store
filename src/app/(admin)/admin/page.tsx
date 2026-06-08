import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Overview" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminPage() {
  const { totalOrders, revenue, activeProducts, recentOrders } =
    await getDashboardStats();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatPrice(revenue)} />
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Active Products" value={String(activeProducts)} />
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <h2 className="text-sm font-semibold">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-neutral-500 hover:text-black transition-colors"
          >
            View all →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">
            No orders yet.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">
                  Order
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">
                  Customer
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">
                  Total
                </th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs hover:underline"
                    >
                      #{order.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    {order.customer_name}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-5 py-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
