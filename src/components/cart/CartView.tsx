"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCartStore, useCartTotal } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/format";

const subscribe = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const PERKS = [
  {
    label: "Free shipping",
    icon: (
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    ),
  },
  {
    label: "Free returns",
    icon: <path d="m12 3 8 4v10l-8 4-8-4V7zM4 7l8 4 8-4M12 11v10" />,
  },
  {
    label: "Scratch-free lens",
    icon: (
      <path d="M2 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0zM15 12a3.5 3.5 0 1 0 7 0 3.5 3.5 0 0 0-7 0zM9 11.5c1-1 5-1 6 0" />
    ),
  },
];

function Perks({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-3 gap-2 text-center text-xs ${className}`}>
      {PERKS.map((perk) => (
        <li key={perk.label} className="flex flex-col items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {perk.icon}
          </svg>
          {perk.label}
        </li>
      ))}
    </ul>
  );
}

function Summary({ total }: { total: number }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between text-neutral-600">
        <dt>Item(s) total</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
      <div className="flex justify-between text-neutral-600">
        <dt>Shipping</dt>
        <dd>Standard: Free</dd>
      </div>
      <div className="flex justify-between font-medium">
        <dt>Subtotal</dt>
        <dd>{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

const nextStepClass =
  "flex h-12 w-full items-center justify-center rounded-full bg-[#1050d0] text-base font-medium text-white transition-colors hover:bg-[#0d44b0]";

export default function CartView({ children }: { children?: React.ReactNode }) {
  const isClient = useIsClient();
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const total = useCartTotal();

  if (!isClient) {
    return <div className="min-h-[60vh] bg-neutral-50" aria-busy="true" />;
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-neutral-50 px-4 text-center">
        <h1 className="font-serif text-3xl">Your cart is empty</h1>
        <p className="text-sm text-neutral-600">
          Find a pair you love and add it to your cart.
        </p>
        <Link
          href="/eyeglasses"
          className="inline-flex h-12 items-center rounded-full bg-[#1050d0] px-8 text-base font-medium text-white transition-colors hover:bg-[#0d44b0]"
        >
          Shop eyeglasses
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-neutral-50 lg:flex lg:min-h-[635px]">
        {/* Items */}
        <section className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-10">
          <div className="mx-auto max-w-xl lg:max-w-[660px]">
            {/* Mobile perks */}
            <Perks className="mb-4 rounded-xl bg-white px-2 py-4 shadow-sm lg:hidden" />

            <h1 className="mb-6 text-center font-serif text-3xl lg:text-left">
              Your cart: {formatPrice(total)}
            </h1>

            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="rounded-xl bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-white sm:h-24 sm:w-24">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-neutral-100" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium text-[#1050d0] hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span className="text-sm font-medium tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-600">
                        {item.variantName}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-neutral-500">
                          {formatPrice(item.price)} each
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-900 transition-colors hover:bg-neutral-100"
                        >
                          <TrashIcon />
                        </button>
                        <div className="relative">
                          <select
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.variantId,
                                Number(e.target.value),
                              )
                            }
                            aria-label={`Quantity for ${item.name}`}
                            className="h-8 appearance-none rounded-full border border-neutral-900 bg-white pl-3 pr-7 text-sm"
                          >
                            {Array.from(
                              {
                                length: Math.max(
                                  1,
                                  Math.min(item.stockQuantity, 10),
                                ),
                              },
                              (_, i) => i + 1,
                            ).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                            <ChevronIcon />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Mobile summary */}
            <div className="mt-6 border-t border-neutral-200 pt-5 lg:hidden">
              <Summary total={total} />
            </div>
          </div>
        </section>

        {/* Desktop sidebar */}
        <aside className="hidden w-[480px] shrink-0 bg-white px-8 py-10 lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)] space-y-6">
            <Summary total={total} />
            <Link href="/checkout/shipping-address" className={nextStepClass}>
              Next step
            </Link>
            <Perks />
          </div>
        </aside>

        {/* Mobile sticky CTA */}
        <div className="fixed inset-x-0 bottom-0 z-30 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
          <Link href="/checkout/shipping-address" className={nextStepClass}>
            Next step
          </Link>
        </div>
      </div>

      {/* Desktop only: extra content (e.g. additional pairs) */}
      {children && <div className="hidden lg:block">{children}</div>}
    </>
  );
}
