/* eslint-disable @next/next/no-img-element */
import PromoVideo from "@/components/ui/PromoVideo";
import { COLLECTIONS, type CollectionItem } from "@/lib/data/collectionsSample";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New collections",
  description: "On the lookout for new eyeglasses or sunglasses? Discover our freshest frames and latest debuts.",
};

const PILL_BLUE =
  "inline-flex h-12 items-center justify-center rounded-full bg-[#2a4bd0] px-6 text-base font-semibold text-white transition-colors hover:bg-[#2340b8]";
const PILL_DENIM =
  "inline-flex h-12 items-center justify-center rounded-full bg-[#0f1b6b] px-6 text-base font-semibold text-white transition-colors hover:bg-[#0b1550]";

function CollectionRow({ item, inverted }: { item: CollectionItem; inverted: boolean }) {
  const { media } = item;
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-[1600px] items-center gap-8 px-6 py-8 md:grid-cols-2 md:gap-12 md:px-8 lg:gap-24 lg:px-12 lg:py-12">
        <div className={`relative aspect-[684/692] overflow-hidden rounded-xl bg-[#f6f0e9] md:aspect-square ${inverted ? "md:order-2" : ""}`}>
          {media.video ? (
            <PromoVideo src={media.video} mobileSrc={media.video} poster={media.image} mobilePoster={media.mobileImage} label={media.alt} />
          ) : (
            <Link href={item.cta.href} aria-label={media.alt}>
              <picture>
                <source media="(min-width: 768px)" srcSet={media.image} />
                <img src={media.mobileImage} alt={media.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              </picture>
            </Link>
          )}
        </div>

        <div className="max-w-[620px]">
          {item.logo && <img src={item.logo.src} alt={item.logo.alt} width={454} height={78} className="mb-4 h-auto w-[619.61px] max-w-full" />}
          {item.title && <h2 className="font-serif text-[28px] leading-tight md:text-[40px] lg:text-5xl">{item.title}</h2>}
          <p className="mt-4 text-base text-[#121212] lg:text-lg">{item.body}</p>
          {item.note && <p className="mt-4 text-sm lg:text-base font-semibold">{item.note}</p>}
          <Link href={item.cta.href} className={`mt-6 ${PILL_BLUE}`}>
            {item.cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CollectionsPage() {
  return (
    <div className="text-[#121212]">
      {/* Hero */}
      <section className="bg-[#faf8f5] px-6 py-16 text-center md:py-24">
        <h1 className="font-serif text-[32px] leading-tight lg:text-[56px]">New collections</h1>
        <p className="mx-auto mt-4 text-base text-[#3a434c] lg:text-lg">
          On the lookout for new eyeglasses or sunglasses? Discover our freshest frames and latest debuts right here.
        </p>
      </section>

      {/* Collections, alternating sides */}
      {COLLECTIONS.map((item, i) => (
        <CollectionRow key={item.id} item={item} inverted={i % 2 === 1} />
      ))}

      {/* Closing text */}
      <section className="px-6 py-16 text-center md:py-24">
        <h2 className="font-serif text-[32px] leading-tight lg:text-[55px]">New Collections | VÉLORA Parker</h2>
        <p className="mx-auto mt-4 text-sm text-[#121212] lg:text-base">
          On the lookout for new eyeglasses or sunglasses? Discover our freshest eyeglasses and sunglasses and latest debuts right here.
        </p>
      </section>

      {/* Footer CTAs */}
      <section className="px-6 pb-24 pt-8 text-center">
        <h2 className="font-serif text-[28px] leading-tight md:text-[40px] lg:text-5xl">Want to see more?</h2>
        <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 lg:max-w-none lg:flex-row lg:justify-center">
          <Link href="/eyeglasses" className={`w-full lg:w-auto lg:min-w-[464px] ${PILL_BLUE}`}>
            Shop eyeglasses
          </Link>
          <Link href="/collections/sunglasses" className={`w-full lg:w-auto lg:min-w-[464px] ${PILL_DENIM}`}>
            Shop sunglasses
          </Link>
        </div>
        <Link href="/products" className="mt-6 inline-flex items-center gap-1 text-base font-semibold text-[#1050d0] hover:text-[#0b3a9a]">
          Start with a style quiz <span aria-hidden>&rsaquo;</span>
        </Link>
      </section>
    </div>
  );
}
