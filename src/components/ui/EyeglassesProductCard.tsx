/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { EyeglassItem } from "@/lib/data/eyeglassesSample";
import WishlistButton from "./WishlistButton";

function formatWhole(price: number) {
  return Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
}

export default function EyeglassesProductCard({
  item,
  priority = false,
}: {
  item: EyeglassItem;
  priority?: boolean;
}) {
  return (
    <article className="w-full">
      {/* Image area */}
      <div className="relative h-[218px] overflow-hidden rounded-xl bg-[#faf8f5] xl:h-[279px]">
        {item.tag && (
          <span className="absolute left-3 top-3 z-10 rounded bg-[#09624d] px-2 py-1 text-xs font-semibold leading-4 text-white">
            {item.tag}
          </span>
        )}

        <Link
          href={item.href}
          aria-label={item.name}
          className={`absolute inset-0 flex items-center justify-center ${
            item.wishlistId ? "" : "px-5 pb-14 pt-10"
          }`}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={`${item.name}, front view`}
              loading={priority ? "eager" : "lazy"}
              className={`h-full w-full ${
                item.wishlistId
                  ? "object-cover"
                  : "object-contain mix-blend-multiply"
              }`}
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </Link>

        <div className="absolute bottom-4 left-4 z-10">
          {item.wishlistId ? (
            <WishlistButton productId={item.wishlistId} size="sm" />
          ) : (
            <button
              type="button"
              aria-label="Add favorite"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-[#e1e5e6] hover:ring-[#72777c]"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 20s-7-4.6-9-9.2C1.8 7.6 3.6 5 6.4 5c1.9 0 3.4 1 5.6 3.2C14.2 6 15.700 5 17.600 5c2.800 0 4.600 2.600 3.400 5.800C19 15.400 12 20 12 20z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-3 pt-4 lg:px-3.5 lg:pt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link href={item.href} className="min-w-0">
            <h2 className="truncate font-serif text-2xl font-normal leading-[30px] tracking-[-0.24px]">
              {item.name}
            </h2>
          </Link>
          <span className="shrink-0 text-lg font-medium tracking-[0.36px]">
            {formatWhole(item.price)}
          </span>
        </div>

        {item.swatches.length > 0 && (
          <ul
            className="mb-3 flex gap-1"
            aria-label={`Style options for ${item.name}`}
          >
            {item.swatches.map((s, i) => (
              <li
                key={s.label}
                title={s.label}
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  i === 0 ? "ring-1 ring-[#121212] ring-offset-1" : ""
                }`}
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.label}
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] rounded-full object-contain"
                  />
                ) : (
                  <span
                    className="h-[18px] w-[18px] rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={item.href}
          className="flex h-12 w-full items-center justify-center rounded-full border border-[#e1e5e6] bg-white px-6 text-base font-medium tracking-[0.32px] text-[#3a434c] transition-colors hover:border-[#72777c]"
        >
          {item.cta}
        </Link>
      </div>
    </article>
  );
}
