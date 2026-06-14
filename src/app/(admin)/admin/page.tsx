import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats, getAdminLowStockVariants } from "@/lib/data/admin";
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
  const [{ totalOrders, revenue, activeProducts, recentOrders, lowStockCount }, lowStockVariants] =
    await Promise.all([getDashboardStats(), getAdminLowStockVariants()]);

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-6">Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Revenue" value={formatPrice(revenue)} />
        <StatCard label="Total Orders" value={String(totalOrders)} />
        <StatCard label="Active Products" value={String(activeProducts)} />
        <StatCard
          label="Low Stock Variants"
          value={String(lowStockCount)}
          alert={lowStockCount > 0}
          href="/admin/products"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockVariants.length > 0 && (
        <div className="bg-white border border-orange-200 rounded-lg overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-orange-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-sm font-semibold text-orange-700">Low Stock Alert</h2>
            </div>
            <Link href="/admin/products" className="text-xs text-orange-600 hover:text-orange-800 transition-colors">
              View all products →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Product</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Variant</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">In Stock</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {lowStockVariants.map((v) => (
                <tr key={v.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-2.5">
                    {v.products ? (
                      <Link href={`/admin/products/${v.products.id}/edit`} className="font-medium hover:underline">
                        {v.products.name}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-2.5 text-neutral-600">
                    {v.name}
                    {v.sku && <span className="ml-1.5 text-xs text-neutral-400 font-mono">{v.sku}</span>}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`font-semibold ${v.stock_quantity === 0 ? "text-red-600" : "text-orange-600"}`}>
                      {v.stock_quantity}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-400 text-xs">{v.low_stock_threshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

function StatCard({ label, value, alert, href }: { label: string; value: string; alert?: boolean; href?: string }) {
  const inner = (
    <>
      <p className={`text-xs mb-1 ${alert ? "text-orange-500" : "text-neutral-500"}`}>{label}</p>
      <p className={`text-2xl font-bold ${alert ? "text-orange-600" : ""}`}>{value}</p>
    </>
  );
  const cls = `bg-white border rounded-lg px-5 py-4 ${alert ? "border-orange-200" : "border-neutral-200"}`;
  if (href) return <Link href={href} className={`${cls} block hover:border-orange-400 transition-colors`}>{inner}</Link>;
  return <div className={cls}>{inner}</div>;
}
