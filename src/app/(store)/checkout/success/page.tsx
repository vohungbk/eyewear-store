import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import CartClearer from "@/components/checkout/CartClearer";
import PurchaseTracker from "@/components/analytics/PurchaseTracker";
import { formatPrice } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Order Confirmed" };

interface Props {
  searchParams: Promise<{
    payment_intent?: string;
    redirect_status?: string;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { payment_intent, redirect_status } = await searchParams;

  if (!payment_intent || redirect_status !== "succeeded") {
    redirect("/checkout");
  }

  // Verify payment intent server-side
  if (!process.env.STRIPE_SECRET_KEY) redirect("/checkout");
  const pi = await getStripe().paymentIntents.retrieve(payment_intent);
  if (pi.status !== "succeeded") {
    redirect("/checkout");
  }

  const fbEventId = (pi.metadata?.fb_event_id as string) ?? "";

  // Check if the current visitor is logged in
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  const db = serviceClient();
  const { data: orderData } = db
    ? await db
        .from("orders")
        .select("id, total, customer_name, customer_email, user_id, status, order_items(product_id, quantity)")
        .eq("stripe_payment_intent_id", payment_intent)
        .single()
    : { data: null };
  const order = orderData as {
    id: string;
    total: number;
    customer_name: string;
    customer_email: string;
    user_id: string | null;
    status: string;
    order_items: { product_id: string; quantity: number }[];
  } | null;

  const isGuestOrder = !order?.user_id;
  const registerUrl = order?.customer_email
    ? `/register?email=${encodeURIComponent(order.customer_email)}`
    : "/register";

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <CartClearer />
      {order && fbEventId && (
        <PurchaseTracker
          value={order.total}
          orderId={order.id}
          eventId={fbEventId}
          numItems={order.order_items.reduce((s, i) => s + i.quantity, 0)}
          contentIds={order.order_items.map((i) => i.product_id)}
        />
      )}

      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-neutral-500 mb-8">
        Thanks for your purchase. We&apos;ve received your order and will
        process it shortly.
      </p>

      {order && (
        <div className="border border-neutral-200 rounded-lg p-5 mb-8 text-left space-y-3">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Order number</p>
            <p className="font-mono font-semibold">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Total</p>
            <p className="font-semibold">{formatPrice(order.total)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Shipping to</p>
            <p className="text-sm">{order.customer_name}</p>
          </div>
        </div>
      )}

      {/* Guest upsell: prompt to create account for order tracking */}
      {isGuestOrder && !user && (
        <div className="border border-neutral-200 rounded-lg p-5 mb-6 text-left bg-neutral-50">
          <p className="text-sm font-semibold mb-1">Track your order anytime</p>
          <p className="text-sm text-neutral-500 mb-3">
            Create a free account to view order status, manage returns, and
            check out faster next time.
          </p>
          <Link
            href={registerUrl}
            className="inline-block px-4 py-2 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Create account →
          </Link>
          <Link
            href="/login"
            className="inline-block ml-3 text-sm text-neutral-500 hover:text-black transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {order && !isGuestOrder && (
          <Link
            href={`/account/orders/${order.id}`}
            className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
          >
            View Order
          </Link>
        )}
        <Link
          href="/products"
          className="px-6 py-2.5 border border-neutral-200 text-sm font-semibold rounded-lg hover:border-black transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
