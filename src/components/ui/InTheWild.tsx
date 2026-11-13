import Image from "next/image";
import Link from "next/link";
import WildVideo from "@/components/ui/WildVideo";

export interface WildCard {
  /** Short text shown at the bottom, e.g. "Boaz in Jet Black". */
  caption: string;
  ctaLabel: string;
  href: string;
  /** Pass a video URL for a video card, or an image URL for a photo card. */
  videoUrl?: string;
  imageUrl?: string;
  alt: string;
}

/**
 * Row of tall portrait cards (photo or autoplay video) with a caption and
 * a shop button. Scrolls sideways on mobile, 4 columns on desktop.
 */
export default function InTheWild({
  title,
  cards,
}: {
  title: string;
  cards: WildCard[];
}) {
  return (
    <section className="py-12 lg:py-16">
      <h2 className="mb-6 px-4 text-2xl font-medium sm:px-6 lg:px-8">{title}</h2>
      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:px-6 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-8">
        {cards.map((card) => (
          <li
            key={card.caption}
            className="relative aspect-[9/16] w-[72%] shrink-0 snap-start overflow-hidden bg-neutral-200 sm:w-[44%] lg:w-auto"
          >
            {card.videoUrl ? (
              <WildVideo src={card.videoUrl} label={card.alt} />
            ) : (
              card.imageUrl && (
                <Image
                  src={card.imageUrl}
                  alt={card.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 72vw"
                  className="object-cover"
                />
              )
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-base font-medium">{card.caption}</p>
              <Link
                href={card.href}
                className="mt-3 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
              >
                {card.ctaLabel}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
