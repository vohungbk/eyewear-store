"use client";

import { useState } from "react";
import { joinWaitlist } from "@/lib/actions/waitlist";

interface StockWaitlistFormProps {
  productId: string;
  variantId: string;
  variantName: string;
}

export default function StockWaitlistForm({
  productId,
  variantId,
  variantName,
}: StockWaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    const result = await joinWaitlist(email.trim(), productId, variantId);
    if (result.success) {
      setStatus("done");
    } else {
      setStatus("error");
    }
    setMessage(result.message);
  }

  if (status === "done") {
    return (
      <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-3">
        <p className="text-sm text-neutral-700">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-neutral-50 border border-neutral-200 px-4 py-4">
      <p className="text-sm font-semibold text-neutral-800 mb-0.5">
        Notify me when available
      </p>
      <p className="text-xs text-neutral-500 mb-3">
        We&apos;ll email you as soon as{" "}
        <span className="font-medium text-neutral-700">{variantName}</span> is
        back in stock.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 min-w-0 border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2 bg-black text-white text-sm font-semibold rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Notify Me"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-600">{message}</p>
      )}
    </div>
  );
}
