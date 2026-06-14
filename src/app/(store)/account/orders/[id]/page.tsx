import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserOrder } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils/format";
import type { Address } from "@/types/checkout";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Order Details" };

const STATUS_STEPS = ["pending", "paid", "processing", "shipped", "delivered"];

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/account");

  const order = await getUserOrder(id);
  if (!order) notFound();

  const shippingAddress = order.shipping_address as unknown as Address;
  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/account"
        className="text-sm text-neutral-500 hover:text-black transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Back to account
      </Link>

      <div className="flex items-start justify-between gap-4 mt-4 mb-8">
        <div>
          <h1 className="text-xl font-bold font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 capitalize">
          {order.status}
        </span>
      </div>

      {/* Progress tracker */}
      {order.status !== "cancelled" && (
        <div className="mb-8">
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i <= stepIndex
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-400"
                  }`}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${
                      i < stepIndex ? "bg-black" : "bg-neutral-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STATUS_STEPS.map((step) => (
              <span key={step} className="text-[10px] text-neutral-400 capitalize">
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tracking info */}
      {order.tracking_number && (
        <div className="mb-6 flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
          <svg className="w-5 h-5 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div>
            <p className="text-xs font-medium text-purple-600">Your order is on its way</p>
            <p className="text-sm font-semibold text-purple-800">
              {order.shipping_carrier && <span className="mr-1.5">{order.shipping_carrier} —</span>}
              Tracking: {order.tracking_number}
            </p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
          <h2 className="text-sm font-semibold">Items</h2>
        </div>
        <ul className="divide-y divide-neutral-100">
          {order.order_items?.map((item) => {
            const snapshot = item.product_snapshot as {
              name?: string;
              image_url?: string;
              variant_name?: string;
            };
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-14 h-14 rounded bg-neutral-100 shrink-0 overflow-hidden">
                  {snapshot?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={snapshot.image_url}
                      alt={snapshot?.name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {snapshot?.name ?? "Product"}
                  </p>
                  {snapshot?.variant_name && (
                    <p className="text-xs text-neutral-500">
                      {snapshot.variant_name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">
                  {formatPrice(item.unit_price * item.quantity)}
                </p>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Totals + Shipping */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">Shipping address</h2>
          <address className="text-sm text-neutral-600 not-italic leading-relaxed">
            {order.customer_name}<br />
            {shippingAddress?.line1}<br />
            {shippingAddress?.line2 && <>{shippingAddress.line2}<br /></>}
            {shippingAddress?.city}, {shippingAddress?.state}{" "}
            {shippingAddress?.postal_code}<br />
            {shippingAddress?.country}
          </address>
        </div>

        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-3">Order summary</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Shipping</dt>
              <dd>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Tax</dt>
              <dd>{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between font-semibold border-t border-neutral-200 pt-1.5 mt-1.5">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
