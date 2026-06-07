"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import VariantSelector from "./VariantSelector";
import type { ProductWithVariants, ProductVariant } from "@/types/database";
import { formatPrice, getPrimaryImage } from "@/lib/utils/format";

interface ProductDetailProps {
  product: ProductWithVariants;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.product_variants?.length === 1
      ? product.product_variants[0]
      : null
  );
  const [added, setAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const finalPrice = selectedVariant
    ? product.price + selectedVariant.price_modifier
    : product.price;

  const outOfStock =
    selectedVariant !== null && selectedVariant?.stock_quantity === 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    const image = getPrimaryImage(product.product_images ?? []);
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      variantName: selectedVariant.name,
      price: finalPrice,
      imageUrl: image?.url ?? null,
      slug: product.slug,
      stockQuantity: selectedVariant.stock_quantity,
    });
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatPrice(finalPrice)}</span>
        {product.compare_at_price && product.compare_at_price > finalPrice && (
          <span className="text-lg text-neutral-400 line-through">
            {formatPrice(product.compare_at_price)}
          </span>
        )}
      </div>

      {/* Variants */}
      {product.product_variants && product.product_variants.length > 0 && (
        <VariantSelector
          variants={product.product_variants}
          basePrice={product.price}
          onSelect={setSelectedVariant}
        />
      )}

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant || outOfStock}
        className={`w-full py-4 rounded-md text-sm font-semibold tracking-wide transition-all
          ${
            !selectedVariant || outOfStock
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : added
              ? "bg-green-600 text-white"
              : "bg-black text-white hover:bg-neutral-800 active:scale-[0.98]"
          }`}
      >
        {added
          ? "Added ✓"
          : outOfStock
          ? "Out of Stock"
          : !selectedVariant
          ? "Select an Option"
          : "Add to Cart"}
      </button>

      {/* Stock status */}
      {selectedVariant && selectedVariant.stock_quantity > 0 && (
        <p className="text-xs text-neutral-500">
          {selectedVariant.stock_quantity <= 5
            ? `Only ${selectedVariant.stock_quantity} left in stock`
            : "In stock — ships within 2-3 days"}
        </p>
      )}
    </div>
  );
}
