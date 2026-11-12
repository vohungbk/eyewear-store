import Image from "next/image";
import Link from "next/link";

interface ImpactStatProps {
  eyebrow: string;
  value: string;
  description: string;
  ctaLabel: string;
  href: string;
  /** Up to 5 images, shown as a fanned stack of photos. */
  images: { url: string; alt?: string }[];
}

// Position of each photo in the stack, as percentages of the stack box.
const LAYOUT = [
  { left: 0, top: 24, width: 8, height: 65, rotate: 1, z: 1 },
  { left: 7.5, top: 13, width: 24, height: 76, rotate: -0.5, z: 2 },
  { left: 15, top: 0, width: 59, height: 90, rotate: -1.5, z: 3 },
  { left: 91, top: 16, width: 9, height: 64, rotate: 2, z: 2 },
  { left: 38.5, top: 5, width: 53, height: 80, rotate: 0.5, z: 5 },
];

/**
 * Big number with a short description on the left and a fanned stack of
 * photos on the right. Stacks on mobile (text first).
 */
export default function ImpactStat({
  eyebrow,
  value,
  description,
  ctaLabel,
  href,
  images,
}: ImpactStatProps) {
  return (
    <section className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 lg:px-14 lg:py-24">
      <div>
        <p className="text-xl text-blue-700">{eyebrow}</p>
        <p className="mt-3 text-6xl font-medium leading-none tracking-tight sm:text-7xl lg:text-[7.5rem]">
          {value}
        </p>
        <p className="mt-4 max-w-xl text-lg lg:text-xl">{description}</p>
        <Link
          href={href}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-blue-700 px-6 text-base font-medium text-white transition-colors hover:bg-blue-800"
        >
          {ctaLabel}
        </Link>
      </div>

      <div className="relative aspect-[23/18] w-full" aria-hidden={images.length === 0}>
        {LAYOUT.slice(0, images.length).map((pos, i) => (
          <div
            key={images[i].url}
            className="absolute overflow-hidden bg-neutral-100 shadow-sm"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              width: `${pos.width}%`,
              height: `${pos.height}%`,
              transform: `rotate(${pos.rotate}deg)`,
              zIndex: pos.z,
            }}
          >
            <Image
              src={images[i].url}
              alt={images[i].alt ?? ""}
              fill
              sizes="(min-width: 768px) 30vw, 60vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
