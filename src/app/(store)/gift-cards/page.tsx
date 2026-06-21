import type { Metadata } from "next";
import GiftCardPurchaseForm from "@/components/ui/GiftCardPurchaseForm";

export const metadata: Metadata = {
  title: "Gift Cards — EYEWEAR",
  description: "Give the gift of great vision. Send an EYEWEAR gift card instantly by email.",
};

export default function GiftCardsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
          Perfect for any occasion
        </p>
        <h1 className="text-3xl font-bold mb-3">Gift Cards</h1>
        <p className="text-neutral-500 text-sm leading-relaxed max-w-md mx-auto">
          Give the gift of great vision. Gift cards are delivered instantly by email and
          never expire. Redeemable on any order.
        </p>
      </div>

      {/* Visual gift card illustration */}
      <div
        className="rounded-2xl mb-10 p-8 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #111 0%, #333 100%)" }}
      >
        <p className="text-xs font-bold tracking-[0.2em] uppercase mb-6 opacity-60">EYEWEAR</p>
        <p className="text-3xl font-bold mb-1">Gift Card</p>
        <p className="text-sm opacity-60 mb-8">Valid on any purchase · Never expires</p>
        <p className="font-mono text-lg tracking-widest opacity-40">XXXX-XXXX-XXXX-XXXX</p>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white opacity-5" />
        <div className="absolute -right-4 -bottom-12 w-64 h-64 rounded-full bg-white opacity-5" />
      </div>

      <GiftCardPurchaseForm />
    </div>
  );
}
