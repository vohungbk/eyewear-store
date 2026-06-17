"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type {
  StripeExpressCheckoutElementConfirmEvent,
  StripeExpressCheckoutElementShippingAddressChangeEvent,
  ShippingRate,
} from "@stripe/stripe-js";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import type { CartItem } from "@/types/cart";
import { initiateCheckout } from "@/lib/facebook/pixel";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const elementsAppearance = {
  theme: "flat" as const,
  variables: {
    fontFamily: "system-ui, sans-serif",
    borderRadius: "6px",
    colorBackground: "#ffffff",
    colorPrimary: "#000000",
    colorText: "#111111",
    colorDanger: "#dc2626",
  },
  rules: {
    ".Input": { border: "1px solid #e5e5e5", padding: "10px 12px" },
    ".Input:focus": { border: "1px solid #000000", outline: "none" },
    ".Label": { fontWeight: "500", marginBottom: "4px", fontSize: "14px" },
  },
};

function calcTotals(items: CartItem[], discountAmount = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = Math.min(discountAmount, subtotal);
  const discounted = subtotal - discount;
  const shipping = discounted >= 100 ? 0 : 9.99;
  const tax = parseFloat((discounted * 0.08).toFixed(2));
  const total = parseFloat((discounted + shipping + tax).toFixed(2));
  return { subtotal, discount, shipping, tax, total };
}

interface FormValues {
  email: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// ─── PaymentStep (must be a descendant of <Elements>) ─────────────────────────

function PaymentStep({
  total,
  onBack,
}: {
  total: number;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError("");

    // Validate card fields before confirming
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment validation failed.");
      setIsProcessing(false);
      return;
    }

    // Stripe redirects to return_url on success; only reaches here on error
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-base font-semibold mb-4">Payment</h2>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-neutral-500 hover:text-black transition-colors"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-black text-white font-semibold py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {isProcessing ? "Processing…" : `Pay ${formatPrice(total)}`}
        </button>
      </div>

      <p className="text-xs text-neutral-400 text-center">
        Payments secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}

// ─── ExpressCheckoutSection ───────────────────────────────────────────────────

const ALLOWED_COUNTRIES = ["US", "CA", "GB", "AU", "VN"];

function ExpressCheckoutSection({
  items,
  totals,
  appliedCoupon,
  onAvailabilityChange,
}: {
  items: CartItem[];
  totals: ReturnType<typeof calcTotals>;
  appliedCoupon: { code: string; discountAmount: number } | null;
  onAvailabilityChange: (available: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");

  // Keep Elements amount in sync when coupon changes (amount excludes shipping —
  // shipping is passed as a separate rate so the payment sheet total stays correct)
  useEffect(() => {
    if (!elements) return;
    elements.update({
      amount: Math.round((totals.total - totals.shipping) * 100),
    });
  }, [elements, totals.total, totals.shipping]);

  const shippingRate: ShippingRate =
    totals.shipping === 0
      ? { id: "free", displayName: "Free Shipping", amount: 0 }
      : { id: "standard", displayName: "Standard Shipping (3–5 days)", amount: 999 };

  async function handleConfirm(event: StripeExpressCheckoutElementConfirmEvent) {
    if (!stripe || !elements) return;
    setError("");

    const { billingDetails, shippingAddress } = event;
    const addr = shippingAddress?.address ?? billingDetails?.address;

    const contact = {
      email: billingDetails?.email ?? "",
      full_name: billingDetails?.name ?? shippingAddress?.name ?? "",
      phone: billingDetails?.phone ?? undefined,
    };
    const shipping = {
      line1: addr?.line1 ?? "",
      line2: addr?.line2 ?? undefined,
      city: addr?.city ?? "",
      state: addr?.state ?? "",
      postal_code: addr?.postal_code ?? "",
      country: addr?.country ?? "US",
    };

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          contact,
          shippingAddress: shipping,
          totals,
          discountCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        event.paymentFailed({ reason: "fail" });
        setError(data.error ?? "Failed to initialize payment.");
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (confirmError) {
        event.paymentFailed({ reason: "fail" });
        setError(confirmError.message ?? "Payment failed. Please try again.");
      }
    } catch {
      event.paymentFailed({ reason: "fail" });
      setError("Something went wrong. Please try again.");
    }
  }

  function handleShippingAddressChange(
    event: StripeExpressCheckoutElementShippingAddressChangeEvent
  ) {
    if (!ALLOWED_COUNTRIES.includes(event.address.country)) {
      event.reject();
      return;
    }
    event.resolve({ shippingRates: [shippingRate] });
  }

  return (
    <div>
      <ExpressCheckoutElement
        onReady={({ availablePaymentMethods }) => {
          onAvailabilityChange(
            !!availablePaymentMethods &&
              Object.values(availablePaymentMethods).some(Boolean)
          );
        }}
        onClick={({ resolve }) => resolve({ shippingRates: [shippingRate] })}
        onShippingAddressChange={handleShippingAddressChange}
        onConfirm={handleConfirm}
        options={{
          buttonHeight: 44,
          emailRequired: true,
          phoneNumberRequired: false,
          shippingAddressRequired: true,
          allowedShippingCountries: ALLOWED_COUNTRIES,
          paymentMethods: {
            applePay: "auto",
            googlePay: "auto",
            link: "never",
            paypal: "never",
            amazonPay: "never",
            klarna: "never",
          },
          buttonType: { applePay: "buy", googlePay: "buy" },
        }}
      />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md mt-3">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── OrderSummary ─────────────────────────────────────────────────────────────

function OrderSummary({
  items,
  totals,
  couponCode,
}: {
  items: CartItem[];
  totals: ReturnType<typeof calcTotals>;
  couponCode?: string;
}) {
  return (
    <div className="border border-neutral-200 rounded-lg p-6 sticky top-24">
      <h2 className="text-base font-semibold mb-4">Order Summary</h2>
      <ul className="space-y-3 mb-5">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded bg-neutral-100 shrink-0 overflow-hidden">
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-neutral-700 text-white rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.name}</p>
              <p className="text-xs text-neutral-500">{item.variantName}</p>
            </div>
            <p className="text-sm font-semibold shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-1.5 text-sm border-t border-neutral-100 pt-4">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Subtotal</dt>
          <dd>{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <dt>
              Discount
              {couponCode && (
                <span className="ml-1 text-[10px] font-mono bg-green-50 px-1.5 py-0.5 rounded">
                  {couponCode}
                </span>
              )}
            </dt>
            <dd>-{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-neutral-500">Shipping</dt>
          <dd>
            {totals.shipping === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              formatPrice(totals.shipping)
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-500">Tax (8%)</dt>
          <dd>{formatPrice(totals.tax)}</dd>
        </div>
        <div className="flex justify-between font-semibold text-base border-t border-neutral-200 pt-2 mt-1">
          <dt>Total</dt>
          <dd>{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {totals.shipping > 0 && (
        <p className="text-xs text-neutral-400 mt-3">
          Free shipping on orders over $100
        </p>
      )}
    </div>
  );
}

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
      />
    </div>
  );
}

// ─── CheckoutForm (main) ──────────────────────────────────────────────────────

export default function CheckoutForm({
  defaultEmail = "",
  defaultName = "",
}: {
  defaultEmail?: string;
  defaultName?: string;
}) {
  const items = useCartStore((s) => s.items);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const checkoutTracked = useRef(false);
  const [clientSecret, setClientSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [isExpressAvailable, setIsExpressAvailable] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);

  const [form, setForm] = useState<FormValues>({
    email: defaultEmail,
    full_name: defaultName,
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "US",
  });

  // Wait for Zustand to rehydrate from localStorage before rendering
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || checkoutTracked.current || items.length === 0) return;
    checkoutTracked.current = true;
    initiateCheckout({
      value: calcTotals(items).total,
      numItems: items.reduce((s, i) => s + i.quantity, 0),
      contentIds: items.map((i) => i.productId),
    });
  }, [hydrated, items]);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/products");
    }
  }, [hydrated, items.length, router]);

  const totals = calcTotals(items, appliedCoupon?.discountAmount ?? 0);

  // Stable options for express checkout Elements — amount excludes shipping
  // (shipping is passed as a rate in onClick so the sheet total stays accurate)
  const expressCheckoutOptions = useMemo(
    () => ({
      mode: "payment" as const,
      amount: Math.round((totals.total - totals.shipping) * 100),
      currency: "usd",
      appearance: elementsAppearance,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // ExpressCheckoutSection syncs amount changes via elements.update()
  );

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal: calcTotals(items).subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon({ code: couponInput.trim().toUpperCase(), discountAmount: data.discountAmount });
        setCouponInput("");
      } else {
        setCouponError(data.message ?? "Invalid code.");
      }
    } catch {
      setCouponError("Failed to apply code. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          contact: {
            email: form.email,
            full_name: form.full_name,
            phone: form.phone || undefined,
          },
          shippingAddress: {
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            state: form.state,
            postal_code: form.postal_code,
            country: form.country,
          },
          totals,
          discountCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initialize payment");

      setClientSecret(data.clientSecret);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 animate-pulse">
        <div className="lg:col-span-3 space-y-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-11 bg-neutral-100 rounded-md" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="h-72 bg-neutral-100 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      {/* Form area */}
      <div className="lg:col-span-3 order-2 lg:order-1">
        {/* Express checkout (Apple Pay / Google Pay) — only shown in details step */}
        {step === "details" && (
          <>
            <Elements stripe={stripePromise} options={expressCheckoutOptions}>
              <ExpressCheckoutSection
                items={items}
                totals={totals}
                appliedCoupon={appliedCoupon}
                onAvailabilityChange={setIsExpressAvailable}
              />
            </Elements>
            {isExpressAvailable && (
              <div className="relative my-6 flex items-center gap-3">
                <div className="flex-1 border-t border-neutral-200" />
                <span className="text-xs text-neutral-400 shrink-0">
                  or pay with card
                </span>
                <div className="flex-1 border-t border-neutral-200" />
              </div>
            )}
          </>
        )}

        {step === "details" ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-8">
            {/* Contact */}
            <section>
              <h2 className="text-base font-semibold mb-4">Contact</h2>
              <div className="space-y-4">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full name"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                  <Field
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-base font-semibold mb-4">
                Shipping Address
              </h2>
              <div className="space-y-4">
                <Field
                  label="Address"
                  name="line1"
                  value={form.line1}
                  onChange={handleChange}
                  required
                  autoComplete="address-line1"
                />
                <Field
                  label="Apartment, suite, etc. (optional)"
                  name="line2"
                  value={form.line2}
                  onChange={handleChange}
                  autoComplete="address-line2"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                  />
                  <Field
                    label="State / Province"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    autoComplete="address-level1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="ZIP / Postal code"
                    name="postal_code"
                    value={form.postal_code}
                    onChange={handleChange}
                    required
                    autoComplete="postal-code"
                  />
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium mb-1"
                    >
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      autoComplete="country"
                      className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black bg-white"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="VN">Vietnam</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Discount Code */}
            <section>
              <h2 className="text-base font-semibold mb-4">Discount Code</h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-sm">✓</span>
                    <span className="text-sm font-mono font-semibold text-green-700">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-sm text-green-600">
                      applied — saving {formatPrice(appliedCoupon.discountAmount)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs text-neutral-400 hover:text-red-500 transition-colors ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleApplyCoupon())}
                    placeholder="Enter code"
                    className="flex-1 border border-neutral-200 rounded-md px-3 py-2.5 text-sm uppercase tracking-wider focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="px-4 py-2.5 border border-neutral-300 rounded-md text-sm font-medium hover:border-black transition-colors disabled:opacity-50"
                  >
                    {isApplyingCoupon ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-600 mt-1.5">{couponError}</p>
              )}
            </section>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Processing…" : "Continue to Payment →"}
            </button>
          </form>
        ) : (
          clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: elementsAppearance }}
            >
              <PaymentStep
                total={totals.total}
                onBack={() => setStep("details")}
              />
            </Elements>
          )
        )}
      </div>

      {/* Order summary — shown first on mobile */}
      <div className="lg:col-span-2 order-1 lg:order-2">
        <OrderSummary items={items} totals={totals} couponCode={appliedCoupon?.code} />
      </div>
    </div>
  );
}
