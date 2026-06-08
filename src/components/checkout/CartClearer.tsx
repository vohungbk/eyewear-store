"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

export default function CartClearer() {
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}
