"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore, type ShippingInfo } from "@/store/checkoutStore";
import { formatPrice } from "@/lib/utils/format";
import { initiateCheckout } from "@/lib/facebook/pixel";
import { upsertAbandonedCart } from "@/lib/actions/abandonedCart";
import type { CartItem } from "@/types/cart";
import {
  calcTotals,
  elementsAppearance,
  stripePromise,
  toOrderItems,
} from "@/components/checkout/CheckoutForm";

type Totals = ReturnType<typeof calcTotals>;

const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(subscribe, () => true, () => false);

const primaryButton =
  "flex h-12 w-full items-center justify-center rounded-full bg-[#1050d0] text-base font-medium text-white transition-colors enabled:hover:bg-[#0d44b0] disabled:cursor-not-allowed disabled:opacity-50";

interface Promo {
  code: string;
  amount: number;
}

// Build the request body shared by the Stripe and free-order endpoints.
function buildOrderPayload(
  items: CartItem[],
  shipping: ShippingInfo,
  coupon: Promo | null,
  giftCard: Promo | null
) {
  return {
    items: toOrderItems(items),
    contact: {
      email: shipping.email,
      full_name: shipping.full_name,
      phone: shipping.phone || undefined,
    },
    shippingAddress: {
      line1: shipping.line1,
      line2: shipping.line2 || undefined,
      city: shipping.city,
      state: shipping.state,
      postal_code: shipping.postal_code,
      country: shipping.country,
    },
    discountCode: coupon?.code,
    giftCardCode: giftCard?.code,
  };
}

// ─── Layout shared by the Stripe and the free-order variants ─────────────────

function PaymentLayout({
  total,
  method,
  promo,
  error,
  button,
}: {
  total: number;
  method: React.ReactNode;
  promo: React.ReactNode;
  error: string;
  button: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[660px] px-4 pb-16 pt-6 sm:px-6">
      <Link
        href="/checkout/shipping-address"
        aria-label="Back to shipping information"
        className="mb-8 inline-flex p-1 transition-opacity hover:opacity-60"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      </Link>

      <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
        How do you want to pay?
      </h1>
      <p className="mb-6 mt-2 text-sm">
        Order total: {total === 0 ? "Free" : formatPrice(total)}
      </p>

      <div className="space-y-4">
        {method}
        {promo}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        {button}
      </div>
    </div>
  );
}

// ─── Gift card / promo code accordion ────────────────────────────────────────

function PromoSection({
  subtotal,
  coupon,
  giftCard,
  onCoupon,
  onGiftCard,
}: {
  subtotal: number;
  coupon: Promo | null;
  giftCard: Promo | null;
  onCoupon: (c: Promo | null) => void;
  onGiftCard: (g: Promo | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function apply() {
    const value = code.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      // Try as a promo code first, then as a gift card.
      const couponRes = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value, subtotal }),
      });
      const couponData = await couponRes.json();
      if (couponData.valid) {
        onCoupon({ code: value.toUpperCase(), amount: couponData.discountAmount });
        setCode("");
        return;
      }

      const gcRes = await fetch("/api/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const gcData = await gcRes.json();
      if (gcData.valid) {
        onGiftCard({ code: value.toUpperCase(), amount: gcData.balance });
        setCode("");
        return;
      }

      setError(couponData.message ?? gcData.message ?? "Invalid code.");
    } catch {
      setError("Failed to apply code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const applied = [
    coupon && {
      key: "coupon",
      label: `${coupon.code} (-${formatPrice(coupon.amount)})`,
      remove: () => onCoupon(null),
    },
    giftCard && {
      key: "gc",
      label: `${giftCard.code} (${formatPrice(giftCard.amount)} available)`,
      remove: () => onGiftCard(null),
    },
  ].filter(Boolean) as { key: string; label: string; remove: () => void }[];

  return (
    <div className="rounded-2xl bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-5 py-5 text-left font-medium"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-sm leading-none">
          {open ? "−" : "+"}
        </span>
        Add a gift card or promo code
      </button>

      {open && (
        <div className="space-y-3 px-5 pb-5">
          {applied.map((a) => (
            <div
              key={a.key}
              className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm"
            >
              <span className="font-mono">{a.label}</span>
              <button
                type="button"
                onClick={a.remove}
                className="text-xs text-neutral-500 underline"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  apply();
                }
              }}
              placeholder="Gift card or promo code"
              aria-label="Gift card or promo code"
              className="h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 text-sm uppercase outline-none focus:border-neutral-900"
            />
            <button
              type="button"
              onClick={apply}
              disabled={busy || !code.trim()}
              className="h-11 rounded-full border border-neutral-900 px-5 text-sm font-medium transition-colors enabled:hover:bg-neutral-100 disabled:opacity-50"
            >
              {busy ? "…" : "Apply"}
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Card payment (inside <Elements>) ────────────────────────────────────────

function StripeSection({
  items,
  shipping,
  totals,
  coupon,
  giftCard,
  promo,
}: {
  items: CartItem[];
  shipping: ShippingInfo;
  totals: Totals;
  coupon: Promo | null;
  giftCard: Promo | null;
  promo: React.ReactNode;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  // Keep the Elements amount in sync with coupons and gift cards.
  useEffect(() => {
    if (!elements) return;
    elements.update({ amount: Math.round(totals.total * 100) });
  }, [elements, totals.total]);

  async function handlePay() {
    if (!stripe || !elements) return;
    setProcessing(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment validation failed.");
      setProcessing(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildOrderPayload(items, shipping, coupon, giftCard)
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initialize payment");

      // Stripe redirects to return_url on success; only returns here on error.
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });
      if (confirmError) {
        setError(confirmError.message ?? "Payment failed. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <PaymentLayout
      total={totals.total}
      promo={promo}
      error={error}
      method={
        <div className="rounded-2xl bg-white p-5">
          <h2 className="font-medium">Credit or debit card</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-600">
            By providing your card information, you allow us to charge your
            card for future payments in accordance with our terms.
          </p>
          <PaymentElement
            options={{
              layout: {
                type: "accordion",
                defaultCollapsed: false,
                radios: "never",
                spacedAccordionItems: true,
              },
            }}
          />
        </div>
      }
      button={
        <button
          type="button"
          onClick={handlePay}
          disabled={!stripe || !elements || processing}
          className={primaryButton}
        >
          {processing ? "Processing…" : `Pay ${formatPrice(totals.total)}`}
        </button>
      }
    />
  );
}

// ─── Order fully covered by a gift card (no Stripe needed) ───────────────────

function FreeSection({
  items,
  shipping,
  coupon,
  giftCard,
  promo,
}: {
  items: CartItem[];
  shipping: ShippingInfo;
  coupon: Promo | null;
  giftCard: Promo | null;
  promo: React.ReactNode;
}) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handlePlaceOrder() {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/orders/create-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildOrderPayload(items, shipping, coupon, giftCard)
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to place order");
      router.push(`/checkout/success?order_id=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setProcessing(false);
    }
  }

  return (
    <PaymentLayout
      total={0}
      promo={promo}
      error={error}
      method={
        <div className="rounded-2xl bg-white p-5 text-sm">
          Your gift card covers the full order. No payment is needed.
        </div>
      }
      button={
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={processing}
          className={primaryButton}
        >
          {processing ? "Processing…" : "Place order"}
        </button>
      }
    />
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PaymentForm() {
  const router = useRouter();
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const shipping = useCheckoutStore((s) => s.shipping);

  const [coupon, setCoupon] = useState<Promo | null>(null);
  const [giftCard, setGiftCard] = useState<Promo | null>(null);
  const tracked = useRef(false);

  const preTotals = calcTotals(items, coupon?.amount ?? 0);
  const giftCardCredit = giftCard
    ? Math.min(giftCard.amount, preTotals.total)
    : 0;
  const totals = calcTotals(items, coupon?.amount ?? 0, giftCardCredit);

  // Shipping step first.
  useEffect(() => {
    if (isClient && items.length > 0 && !shipping) {
      router.replace("/checkout/shipping-address");
    }
  }, [isClient, items.length, shipping, router]);

  // Analytics and abandoned-cart capture, once per visit.
  useEffect(() => {
    if (!isClient || tracked.current || items.length === 0 || !shipping) return;
    tracked.current = true;
    initiateCheckout({
      value: calcTotals(items).total,
      numItems: items.reduce((s, i) => s + i.quantity, 0),
      contentIds: items.map((i) => i.productId),
    });
    upsertAbandonedCart({
      email: shipping.email,
      name: shipping.full_name,
      items,
      total: calcTotals(items).total,
    }).catch(() => {});
  }, [isClient, items, shipping]);

  if (!isClient || (items.length > 0 && !shipping)) {
    return <div className="min-h-[60vh]" aria-busy="true" />;
  }

  if (items.length === 0 || !shipping) {
    return (
      <div className="mx-auto max-w-[520px] px-4 py-16 text-center">
        <p className="mb-4 text-sm text-neutral-600">Your cart is empty.</p>
        <Link href="/cart" className="text-sm font-medium underline">
          Back to cart
        </Link>
      </div>
    );
  }

  const promo = (
    <PromoSection
      subtotal={preTotals.subtotal}
      coupon={coupon}
      giftCard={giftCard}
      onCoupon={setCoupon}
      onGiftCard={setGiftCard}
    />
  );

  const shared = {
    items,
    shipping,
    coupon,
    giftCard,
    promo,
  };

  if (totals.total === 0 && giftCard) {
    return <FreeSection {...shared} />;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: Math.max(50, Math.round(totals.total * 100)),
        currency: "usd",
        appearance: elementsAppearance,
      }}
    >
      <StripeSection {...shared} totals={totals} />
    </Elements>
  );
}
