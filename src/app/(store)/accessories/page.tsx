import AccessoriesGrid from "@/components/ui/AccessoriesGrid";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessories",
  description:
    "Keep your glasses safe, clean, and fog-free with cases, lens cleaners, and sun clip-ons.",
};

export default function AccessoriesPage() {
  return (
    <div className="text-[#121212]">
      <section className="bg-[#faf8f5] px-6 py-16 text-center md:py-24">
        <h1 className="font-serif text-[32px] leading-tight lg:text-[56px]">Accessories</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#3a434c] lg:text-lg">
          Plan on traveling with your frames? Whether you have one pair or three, we have everything you need to keep
          your glasses safe, clean, and fog-free.
        </p>
      </section>

      <div className="pt-8 lg:pt-12">
        <AccessoriesGrid />
      </div>

      <section className="bg-[#faf8f5] px-6 py-16 text-center md:py-24">
        <h2 className="font-serif text-[28px] leading-tight md:text-[40px]">Give a gift card!</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base lg:text-lg">
          Our gift cards match the prices of our favorite products, so they’re easy to give and even easier to use—
          delivered via email or in a ready-to-gift envelope.
        </p>
        <Link
          href="/gift-cards"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#2a4bd0] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2340b8]"
        >
          Shop now
        </Link>
      </section>
    </div>
  );
}
