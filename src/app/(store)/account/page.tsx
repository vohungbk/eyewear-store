import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrders } from "@/lib/data/orders";
import ProfileForm from "@/components/auth/ProfileForm";
import { logout } from "@/lib/actions/auth";
import { formatPrice } from "@/lib/utils/format";
import type { Profile } from "@/types/database";

export const metadata: Metadata = { title: "My Account" };

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-700",
  paid:       "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped:    "bg-purple-50 text-purple-700",
  delivered:  "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-700",
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account");

  const [profileResult, orders] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getUserOrders(),
  ]);

  const profile = profileResult.data as Profile | null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Account</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-neutral-500 hover:text-black transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Profile */}
        <div className="lg:col-span-1">
          <h2 className="text-base font-semibold mb-4">Profile</h2>
          <p className="text-sm text-neutral-500 mb-4">{user.email}</p>
          {profile && <ProfileForm profile={profile} />}
        </div>

        {/* Orders */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold mb-4">Order History</h2>

          {orders.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-200 rounded-lg">
              <p className="text-neutral-500 text-sm">No orders yet.</p>
              <Link
                href="/products"
                className="mt-3 inline-block text-sm font-medium underline"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="block p-4 border border-neutral-200 rounded-lg hover:border-black transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          {" · "}
                          {order.order_items?.length ?? 0} item
                          {(order.order_items?.length ?? 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">
                          {formatPrice(order.total)}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                            STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
