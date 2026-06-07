"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import { getPrimaryImage } from "@/lib/utils/format";

interface AddToCartButtonProps {
  product: ProductWithVariants;
  selectedVariant: ProductVariant | null;
}

export default function AddToCartButton({
  product,
  selectedVariant,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const disabled =
    !selectedVariant || selectedVariant.stock_quantity === 0;

  const handleAdd = () => {
    if (!selectedVariant) return;

    const image = getPrimaryImage(product.product_images ?? []);
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: product.price + selectedVariant.price_modifier,
      imageUrl: image?.url ?? null,
      slug: product.slug,
      stockQuantity: selectedVariant.stock_quantity,
    });

    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={disabled}
      className={`w-full py-3.5 rounded-md text-sm font-semibold transition-all
        ${
          disabled
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : added
            ? "bg-green-600 text-white"
            : "bg-black text-white hover:bg-neutral-800 active:scale-[0.98]"
        }`}
    >
      {added
        ? "Added to Cart ✓"
        : selectedVariant?.stock_quantity === 0
        ? "Out of Stock"
        : !selectedVariant
        ? "Select an Option"
        : "Add to Cart"}
    </button>
  );
}
