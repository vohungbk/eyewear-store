import Image from "next/image";
import Link from "next/link";

export interface PromoTile {
  title: string;
  /** Label of the pill button under the title. */
  ctaLabel: string;
  href: string;
  imageUrl: string | null;
  imageAlt?: string;
  /** "contain" suits product shots on a plain background. */
  imageFit?: "cover" | "contain";
}

/**
 * Two full-bleed image tiles side by side (stacked on mobile). Each has a
 * serif title and a pill button in the bottom-left corner. The whole tile
 * is one link, so clicking anywhere on it navigates.
 */
export default function PromoSplit({ tiles }: { tiles: PromoTile[] }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {tiles.map((tile) => {
        // Product shots sit on a light background, so use dark text there.
        const light = !!tile.imageUrl && tile.imageFit !== "contain";
        return (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative block aspect-[4/5] overflow-hidden bg-neutral-100 ${light ? "text-white" : "text-neutral-900"} sm:aspect-[5/4]`}
          >
            {tile.imageUrl && (
              <Image
                src={tile.imageUrl}
                alt={tile.imageAlt ?? ""}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className={`${
                  tile.imageFit === "contain"
                    ? "object-contain p-10 lg:p-16"
                    : "object-cover"
                } transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
              />
            )}
            {light && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            )}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 lg:bottom-10 lg:left-16">
              <h2 className="max-w-sm font-serif text-3xl leading-tight lg:text-4xl">
                {tile.title}
              </h2>
              <span
                className={`mt-4 inline-flex h-12 items-center rounded-full px-6 text-base transition-colors ${
                  light
                    ? "bg-white text-neutral-900 group-hover:bg-neutral-100"
                    : "bg-neutral-900 text-white group-hover:bg-neutral-700"
                }`}
              >
                {tile.ctaLabel}
              </span>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
