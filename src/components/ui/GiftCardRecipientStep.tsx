"use client";

import { useState } from "react";
import { useScrollIntoViewOnMount } from "@/components/ui/useScrollIntoViewOnMount";
import { GiftCardPayment } from "@/components/ui/GiftCardPurchaseForm";

const NOTE_MAX = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Local calendar day as YYYY-MM-DD (not UTC, so the picked day never shifts). */
const toDateString = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const FIELD =
  "w-full rounded-xl border border-[#e4e0da] bg-white px-4 py-4 text-base text-[#121212] placeholder:text-[#3a434c] focus:border-[#0f1b6b] focus:outline-none";

interface Props {
  /** "physical": step 3 of 3. "electronic": step 4 of 4, with emails, and it continues to payment. */
  mode: "physical" | "electronic";
  amount: number;
  /** Day the e-gift card email should be sent. */
  deliveryDate?: Date | null;
  autoScroll?: boolean;
}

export default function GiftCardRecipientStep({
  mode,
  amount,
  deliveryDate,
  autoScroll = true,
}: Props) {
  const ref = useScrollIntoViewOnMount<HTMLDivElement>(autoScroll);
  const electronic = mode === "electronic";
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [note, setNote] = useState("");
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const canSubmit =
    recipientName.trim() !== "" &&
    senderName.trim() !== "" &&
    (!electronic ||
      (EMAIL_RE.test(recipientEmail) && EMAIL_RE.test(senderEmail)));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;
    setNotice("");

    if (!electronic) {
      // Physical gift cards are not backed by a product or checkout flow yet.
      setNotice("Physical gift cards can’t be added to the cart yet.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          recipientEmail,
          recipientName: recipientName || undefined,
          senderName: senderName || undefined,
          senderEmail: senderEmail || undefined,
          deliveryDate: deliveryDate ? toDateString(deliveryDate) : undefined,
          message: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create gift card");
      setClientSecret(data.clientSecret);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div ref={ref} className="mx-auto mt-24 max-w-[600px] scroll-mt-24">
      <div className="text-center">
        <p className="text-xs font-medium uppercase text-[#121212]">
          Step {electronic ? "4 of 4" : "3 of 3"}
        </p>
        <h2 className="mt-6 font-serif text-[28px] font-semibold leading-tight lg:text-[40px]">
          Who’s the lucky recipient?
        </h2>
        <p className="mx-auto mt-6 max-w-[300px] text-base text-[#121212] lg:text-lg">
          Share some details and add a note to go with your gift.
        </p>
      </div>

      {clientSecret ? (
        <div className="mt-10 rounded-xl bg-white p-6">
          <GiftCardPayment
            clientSecret={clientSecret}
            amount={amount}
            onBack={() => setClientSecret("")}
          />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              aria-label="Recipient's Name"
              placeholder="Recipient's Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className={FIELD}
            />
            {electronic && (
              <input
                type="email"
                aria-label="Recipient's Email"
                placeholder="Recipient's Email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className={FIELD}
              />
            )}
            <input
              type="text"
              aria-label="Your Name"
              placeholder="Your Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className={FIELD}
            />
            {electronic && (
              <input
                type="email"
                aria-label="Your Email"
                placeholder="Your Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className={FIELD}
              />
            )}
          </div>

          <div className="relative mt-4 rounded-xl border border-[#e4e0da] bg-white px-4 pb-3 pt-3 focus-within:border-[#0f1b6b]">
            <label htmlFor="gift-note" className="block text-xs text-[#3a434c]">
              Add a Note (If You Want)
            </label>
            <textarea
              id="gift-note"
              rows={4}
              maxLength={NOTE_MAX}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Say a little something sweet."
              className="mt-1 w-full resize-none bg-transparent text-base text-[#121212] placeholder:text-[#6b7280] focus:outline-none"
            />
            <span className="absolute bottom-3 right-4 text-base text-[#6b7280]">
              {NOTE_MAX - note.length}
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="inline-flex h-12 min-w-[224px] items-center justify-center rounded-full bg-[#2a4bd0] px-6 text-base font-semibold text-white transition-colors enabled:cursor-pointer enabled:hover:bg-[#2340b8] disabled:opacity-60"
            >
              {isSubmitting ? "Processing…" : "Add to cart"}
            </button>
            {notice && <p className="text-sm text-[#3a434c]">{notice}</p>}
          </div>
        </form>
      )}

      <p className="mx-auto mt-12 max-w-[600px] text-center text-sm text-[#3a434c] lg:text-base">
        Gift cards do not expire. Gift cards cannot be replaced or refunded if
        lost or stolen. Gift cards cannot be returned and cannot be exchanged
        for cash except where required by law. Coupons, promo codes and other
        discounts may not be used to purchase gift cards. In the event that a
        purchase made with a gift card is returned, the original gift card will
        be credited. Gift cards are redeemable by customers in the U.S. only.
      </p>
    </div>
  );
}
