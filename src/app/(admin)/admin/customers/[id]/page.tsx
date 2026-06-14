import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminCustomer } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Admin — Customer Detail" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminCustomerPage({ params }: Props) {
  const { id } = await params;
  const customer = await getAdminCustomer(id);

  if (!customer) notFound();

  const { profile, email, orders, totalSpend } = customer;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/customers"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Customers
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold">{profile.full_name ?? email}</h1>
      </div>

      {/* Customer info cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="border border-neutral-200 rounded-lg px-5 py-4">
          <p className="text-xs text-neutral-500 mb-1">Total Spend</p>
          <p className="text-2xl font-bold">{formatPrice(totalSpend)}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg px-5 py-4">
          <p className="text-xs text-neutral-500 mb-1">Orders</p>
          <p className="text-2xl font-bold">{orders.filter((o) => o.status !== "cancelled").length}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg px-5 py-4">
          <p className="text-xs text-neutral-500 mb-1">Member Since</p>
          <p className="text-base font-semibold">
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="border border-neutral-200 rounded-lg p-4 mb-6">
        <h2 className="text-sm font-semibold mb-3">Contact</h2>
        <div className="space-y-1.5 text-sm">
          <p><span className="text-neutral-500 w-20 inline-block">Name</span>{profile.full_name ?? "—"}</p>
          <p><span className="text-neutral-500 w-20 inline-block">Email</span>{email}</p>
          <p><span className="text-neutral-500 w-20 inline-block">Role</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${profile.role === "admin" ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"}`}>
              {profile.role}
            </span>
          </p>
        </div>
      </div>

      {/* Order history */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
          <h2 className="text-sm font-semibold">Order History ({orders.length})</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-8">No orders.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Order</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Date</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Total</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-2.5">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-2.5 font-mono text-xs">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-2.5 font-medium">{formatPrice(order.total)}</td>
                  <td className="px-5 py-2.5">
                    <span
                      className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                        STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.discount_code && (
                      <span className="ml-1.5 text-[10px] text-neutral-400 font-mono">{order.discount_code}</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs text-neutral-500 hover:text-black transition-colors"
                    >
                      View
                    </Link>
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
