/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import GiftCardTypeSelector from "@/components/ui/GiftCardTypeSelector";

export const metadata: Metadata = {
  title: "Gift Cards — VÉLORA",
  description:
    "Our gift cards match the prices of our favorite products, so they’re easy to give and even easier to use.",
};

export default function GiftCardsPage() {
  return (
    <div className="text-[#121212]">
      {/* Hero */}
      <section className="bg-white px-6 pb-16 pt-12 text-center md:pb-24 md:pt-20">
        <div className="mx-auto max-w-[680px]">
          <img
            src="https://img.warbyparker.com/Gift%20Cards/gift-card-holiday-2024-hero.jpg"
            alt="Gift card with its enclosing card and envelope"
            className="mx-auto h-auto w-full max-w-[600px] object-contain"
          />
          <h1 className="mt-10 font-serif text-[32px] font-semibold leading-tight md:text-[44px] lg:text-[56px]">
            Give a gift card!
          </h1>
          <p className="mt-6 text-base lg:text-lg">
            Our gift cards match the prices of our favorite products, so they’re easy to give and even easier to
            use—delivered via email or in a ready-to-gift envelope.
          </p>
          <div className="mt-6 flex flex-col items-center gap-6">
            <a
              href="#select-gift-card"
              className="inline-flex h-12 w-full max-w-[232px] items-center justify-center rounded-full bg-[#2a4bd0] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2340b8]"
            >
              Shop now
            </a>
            <Link href="/pages/faq" className="text-base font-semibold text-[#121212] hover:opacity-70">
              Gift card FAQs
            </Link>
          </div>
        </div>
      </section>

      <GiftCardTypeSelector />
    </div>
  );
}
