"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PRESET_AMOUNTS = [25, 50, 100, 200];

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

// ─── Payment step ─────────────────────────────────────────────────────────────

function PaymentStep({ amount, onBack }: { amount: number; onBack: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "Payment validation failed.");
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/gift-cards/success`,
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
        <h2 className="text-base font-semibold mb-4">Payment — ${amount.toFixed(2)}</h2>
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
          {isProcessing ? "Processing…" : `Purchase Gift Card — $${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
}

// ─── Details step ─────────────────────────────────────────────────────────────

interface DetailsForm {
  amount: number | "";
  customAmount: string;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  message: string;
}

export default function GiftCardPurchaseForm() {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [clientSecret, setClientSecret] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<DetailsForm>({
    amount: 50,
    customAmount: "",
    recipientEmail: "",
    recipientName: "",
    senderName: "",
    message: "",
  });

  const resolvedAmount =
    form.amount !== ""
      ? form.amount
      : parseFloat(form.customAmount) || 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!resolvedAmount || resolvedAmount < 5 || resolvedAmount > 1000) {
      setError("Please enter an amount between $5 and $1,000.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail)) {
      setError("Please enter a valid recipient email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: resolvedAmount,
          recipientEmail: form.recipientEmail,
          recipientName: form.recipientName || undefined,
          senderName: form.senderName || undefined,
          message: form.message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create gift card");
      setClientSecret(data.clientSecret);
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "payment" && clientSecret) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: elementsAppearance }}
      >
        <PaymentStep
          amount={resolvedAmount}
          onBack={() => setStep("details")}
        />
      </Elements>
    );
  }

  return (
    <form onSubmit={handleDetailsSubmit} className="space-y-8">
      {/* Amount */}
      <section>
        <h2 className="text-base font-semibold mb-4">Choose an amount</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => setForm((f) => ({ ...f, amount: amt, customAmount: "" }))}
              className={`py-3 rounded-lg border text-sm font-semibold transition-colors ${
                form.amount === amt
                  ? "bg-black text-white border-black"
                  : "border-neutral-200 text-neutral-700 hover:border-black"
              }`}
            >
              ${amt}
            </button>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="customAmount">
            Custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
            <input
              id="customAmount"
              name="customAmount"
              type="number"
              min="5"
              max="1000"
              step="1"
              value={form.customAmount}
              onChange={(e) => {
                setForm((f) => ({ ...f, customAmount: e.target.value, amount: "" }));
              }}
              placeholder="5 – 1000"
              className="w-full border border-neutral-200 rounded-md pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:border-black"
            />
          </div>
        </div>
      </section>

      {/* Recipient */}
      <section>
        <h2 className="text-base font-semibold mb-4">Recipient</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="recipientEmail" className="block text-sm font-medium mb-1">
              Recipient email <span className="text-red-500">*</span>
            </label>
            <input
              id="recipientEmail"
              name="recipientEmail"
              type="email"
              required
              value={form.recipientEmail}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              placeholder="they@example.com"
            />
          </div>
          <div>
            <label htmlFor="recipientName" className="block text-sm font-medium mb-1">
              Recipient name <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              id="recipientName"
              name="recipientName"
              type="text"
              value={form.recipientName}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              placeholder="Alex"
            />
          </div>
        </div>
      </section>

      {/* From */}
      <section>
        <h2 className="text-base font-semibold mb-4">From</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="senderName" className="block text-sm font-medium mb-1">
              Your name <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              id="senderName"
              name="senderName"
              type="text"
              value={form.senderName}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black"
              placeholder="Jordan"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Personal message <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              value={form.message}
              onChange={handleChange}
              className="w-full border border-neutral-200 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-black resize-none"
              placeholder="Happy birthday! Treat yourself to something special."
            />
          </div>
        </div>
      </section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !resolvedAmount}
        className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
      >
        {isSubmitting
          ? "Processing…"
          : resolvedAmount
          ? `Continue to Payment — $${resolvedAmount.toFixed(2)} →`
          : "Select an amount to continue"}
      </button>
    </form>
  );
}
