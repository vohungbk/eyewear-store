import type { Metadata } from "next";
import Link from "next/link";
import { getAnalytics } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import RevenueChart from "@/components/admin/RevenueChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";

export const metadata: Metadata = { title: "Admin — Analytics" };

interface Props {
  searchParams: Promise<{ period?: string }>;
}

const PERIOD_TABS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
];

export default async function AdminAnalyticsPage({ searchParams }: Props) {
  const { period } = await searchParams;
  const days = period === "7" ? 7 : period === "90" ? 90 : 30;
  const currentPeriod = String(days);

  const data = await getAnalytics(days);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Analytics</h1>
        <div className="flex gap-0.5 bg-neutral-100 p-1 rounded-lg">
          {PERIOD_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/analytics?period=${tab.value}`}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                currentPeriod === tab.value
                  ? "bg-white text-black shadow-sm font-medium"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard
          label="Revenue"
          value={formatPrice(data.totalRevenue)}
          sub={`Last ${days} days`}
        />
        <KpiCard
          label="Orders"
          value={String(data.totalOrders)}
          sub={`Last ${days} days`}
        />
        <KpiCard
          label="Avg. Order Value"
          value={formatPrice(data.aov)}
          sub="Per paid order"
        />
        <KpiCard
          label="Customers"
          value={String(data.newCustomersCount + data.returningCustomersCount)}
          sub={`${data.newCustomersCount} new · ${data.returningCustomersCount} returning`}
        />
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-neutral-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Revenue</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Daily revenue, last {days} days</p>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-neutral-100 rounded text-neutral-500">
            {formatPrice(data.totalRevenue)} total
          </span>
        </div>
        <RevenueChart data={data.revenueByDay} />
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top products */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-sm font-semibold">Top Products</h2>
            <p className="text-xs text-neutral-400 mt-0.5">By revenue, last {days} days</p>
          </div>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-10">No sales in this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left font-medium text-neutral-400 px-5 py-2.5 w-8">#</th>
                  <th className="text-left font-medium text-neutral-400 px-5 py-2.5">Product</th>
                  <th className="text-right font-medium text-neutral-400 px-5 py-2.5">Units</th>
                  <th className="text-right font-medium text-neutral-400 px-5 py-2.5">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {data.topProducts.map((p, i) => (
                  <tr key={p.slug || i} className="hover:bg-neutral-50">
                    <td className="px-5 py-2.5 text-neutral-300 text-xs font-mono">{i + 1}</td>
                    <td className="px-5 py-2.5">
                      {p.slug ? (
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          className="font-medium hover:underline"
                        >
                          {p.name}
                        </Link>
                      ) : (
                        <span className="font-medium">{p.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-2.5 text-right text-neutral-600">{p.units}</td>
                    <td className="px-5 py-2.5 text-right font-semibold">
                      {formatPrice(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order status */}
        <div className="bg-white border border-neutral-200 rounded-lg p-5">
          <h2 className="text-sm font-semibold mb-1">Orders by Status</h2>
          <p className="text-xs text-neutral-400 mb-4">All time</p>
          <OrderStatusChart data={data.ordersByStatus} />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-5 py-4">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] text-neutral-400 mt-1 truncate">{sub}</p>
    </div>
  );
}
