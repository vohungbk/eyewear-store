"use client";

import { useCartStore, useCartTotal } from "@/store/cartStore";
import Link from "next/link";

export default function CartDrawer() {
  const { isOpen, closeCart, items, removeItem, updateQuantity } =
    useCartStore();
  const total = useCartTotal();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-base font-semibold">
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-1 text-neutral-500 hover:text-black transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p className="text-sm">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-sm font-medium underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-3 py-3 border-b border-neutral-100"
                >
                  {/* Image placeholder */}
                  <div className="h-20 w-20 shrink-0 rounded-md bg-neutral-100 overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-neutral-200" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="text-sm font-medium hover:underline line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-neutral-500">
                          {item.variantName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        aria-label="Remove"
                        className="text-neutral-400 hover:text-black transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Qty */}
                      <div className="flex items-center border border-neutral-200 rounded">
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="px-2 py-1 text-sm hover:bg-neutral-100 transition-colors"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stockQuantity}
                          className="px-2 py-1 text-sm hover:bg-neutral-100 transition-colors disabled:opacity-40"
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-neutral-200 px-5 py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-neutral-400">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-black text-white text-sm font-semibold text-center py-3 rounded-md hover:bg-neutral-800 transition-colors"
            >
              Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-sm text-center text-neutral-500 hover:text-black transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
