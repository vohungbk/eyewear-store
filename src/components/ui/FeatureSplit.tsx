import Image from "next/image";
import Link from "next/link";

interface FeatureSplitProps {
  title: string;
  ctaLabel: string;
  href: string;
  imageUrl: string | null;
  imageAlt?: string;
}

/**
 * Half image, half navy panel with a serif title and a pill button.
 * Stacks on mobile (image first).
 */
export default function FeatureSplit({
  title,
  ctaLabel,
  href,
  imageUrl,
  imageAlt = "",
}: FeatureSplitProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      <div className="relative aspect-square bg-neutral-100 md:aspect-auto md:min-h-[640px]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex items-center bg-[#0a1247] px-8 py-16 text-white lg:px-24">
        <div>
          <h2 className="max-w-sm font-serif text-[32px] leading-tight lg:max-w-xl lg:text-[55px]">
            {title}
          </h2>
          <Link
            href={href}
            className="mt-5 inline-flex h-12 items-center rounded-full bg-white px-6 text-base font-semibold text-neutral-900 transition-colors hover:bg-neutral-200"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
