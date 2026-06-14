import type { Metadata } from "next";
import Link from "next/link";
import { getAdminCustomers } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Admin — Customers" };

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminCustomersPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const currentPage = parseInt(page ?? "1", 10);
  const { customers, count } = await getAdminCustomers(currentPage);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Customers</h1>
          <p className="text-sm text-neutral-500 mt-0.5">{count} customers with orders</p>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        {customers.length === 0 ? (
          <p className="text-sm text-neutral-400 text-center py-12">No customers yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Customer</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Orders</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Total Spent</th>
                <th className="text-left font-medium text-neutral-500 px-5 py-3">Last Order</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {customers.map((customer) => (
                <tr key={customer.user_id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-xs text-neutral-400">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3 text-neutral-600">{customer.order_count}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(customer.total_spend)}</td>
                  <td className="px-5 py-3 text-neutral-500 text-xs">
                    {new Date(customer.last_order_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/customers/${customer.user_id}`}
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
      {count > 30 && (
        <div className="flex gap-2 mt-4">
          {currentPage > 1 && (
            <Link
              href={`/admin/customers?page=${currentPage - 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              ← Previous
            </Link>
          )}
          {count > currentPage * 30 && (
            <Link
              href={`/admin/customers?page=${currentPage + 1}`}
              className="text-sm px-3 py-1.5 border border-neutral-200 rounded hover:border-black transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
