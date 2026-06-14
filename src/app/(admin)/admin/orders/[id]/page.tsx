import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrder } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Admin — Order Detail" };

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  paid: "bg-blue-50 text-blue-700",
  processing: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminOrderPage({ params }: Props) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) notFound();

  const addr = order.shipping_address;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Orders
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold font-mono">
          #{order.id.slice(0, 8).toUpperCase()}
        </h1>
      </div>

      {/* Header row */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div>
          <p className="text-xs text-neutral-500">
            Placed{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {order.stripe_payment_intent_id && (
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              {order.stripe_payment_intent_id}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              STATUS_STYLES[order.status] ?? "bg-neutral-100 text-neutral-600"
            }`}
          >
            {order.status}
          </span>
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={order.tracking_number}
            currentCarrier={order.shipping_carrier}
          />
        </div>
      </div>

      {/* Tracking info */}
      {order.tracking_number && (
        <div className="mb-6 flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
          <svg className="w-4 h-4 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <div>
            <p className="text-xs text-purple-600 font-medium">Tracking</p>
            <p className="text-sm font-semibold text-purple-800">
              {order.shipping_carrier && <span className="mr-1.5">{order.shipping_carrier} —</span>}
              {order.tracking_number}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 mb-6">
        {/* Customer */}
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2">Customer</h2>
          <p className="text-sm">{order.customer_name}</p>
          <p className="text-sm text-neutral-500">{order.customer_email}</p>
        </div>

        {/* Shipping address */}
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold mb-2">Shipping Address</h2>
          <address className="text-sm text-neutral-600 not-italic leading-relaxed">
            {addr?.line1}<br />
            {addr?.line2 && <>{addr.line2}<br /></>}
            {addr?.city}, {addr?.state} {addr?.postal_code}<br />
            {addr?.country}
          </address>
        </div>
      </div>

      {/* Items */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden mb-5">
        <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
          <h2 className="text-sm font-semibold">
            Items ({order.order_items.length})
          </h2>
        </div>
        <ul className="divide-y divide-neutral-50">
          {order.order_items.map((item) => {
            const snap = item.product_snapshot;
            return (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-12 h-12 rounded bg-neutral-100 shrink-0 overflow-hidden">
                  {snap?.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={snap.image_url}
                      alt={snap?.name ?? ""}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{snap?.name ?? "Product"}</p>
                  {snap?.variant_name && (
                    <p className="text-xs text-neutral-500">{snap.variant_name}</p>
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

      {/* Totals */}
      <div className="border border-neutral-200 rounded-lg p-4 max-w-xs ml-auto">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-500">Subtotal</dt>
            <dd>{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Shipping</dt>
            <dd>
              {order.shipping === 0 ? "Free" : formatPrice(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-500">Tax</dt>
            <dd>{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between font-semibold border-t border-neutral-200 pt-2 mt-1">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
