"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import type { CartItem } from "@/types/cart";

export default function CartRecovery({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const { clearCart, addItem } = useCartStore();

  useEffect(() => {
    clearCart();
    for (const item of items) {
      // addItem expects the item without quantity; it sets quantity to 1
      const { quantity: _q, ...rest } = item;
      // Add the item once, then bump quantity if needed
      addItem(rest);
      // addItem caps at 1 on first call; use updateQuantity to restore exact qty
      useCartStore.getState().updateQuantity(item.variantId, item.quantity);
    }
    router.replace("/checkout");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-neutral-500">Restoring your cart…</p>
      </div>
    </div>
  );
}
