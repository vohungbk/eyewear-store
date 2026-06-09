"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore, CartItem } from "@/types/cart";
import { addToCart as pixelAddToCart } from "@/lib/facebook/pixel";

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find((i) => i.variantId === newItem.variantId);
        if (existing) {
          const capped = Math.min(
            existing.quantity + 1,
            newItem.stockQuantity
          );
          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: capped }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
        pixelAddToCart({
          productId: newItem.productId,
          name: newItem.name,
          price: newItem.price,
          quantity: 1,
        });
      },

      removeItem: (variantId) =>
        set({ items: get().items.filter((i) => i.variantId !== variantId) }),

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.stockQuantity) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
    }),
    {
      name: "eyewear-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// Selectors
export const useCartItemCount = () =>
  useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

export const useCartTotal = () =>
  useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
