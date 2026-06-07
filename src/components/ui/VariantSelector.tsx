"use client";

import { useState } from "react";
import type { ProductVariant } from "@/types/database";

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  onSelect: (variant: ProductVariant | null) => void;
}

export default function VariantSelector({
  variants,
  basePrice,
  onSelect,
}: VariantSelectorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  );

  // Auto-select single variant
  const handleSelect = (variant: ProductVariant) => {
    const next = variant.id === selectedId ? null : variant.id;
    setSelectedId(next);
    onSelect(next ? variant : null);
  };

  // Group variants by a display attribute (color preferred, else just show as list)
  const colorAttr = variants.some(
    (v) => (v.attributes as Record<string, string>)?.color
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {colorAttr ? "Color / Style" : "Variant"}
        </span>
        {selectedId && (
          <span className="text-neutral-500">
            {variants.find((v) => v.id === selectedId)?.name}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const attrs = variant.attributes as Record<string, string>;
          const isSelected = selectedId === variant.id;
          const outOfStock = variant.stock_quantity === 0;
          const finalPrice = basePrice + variant.price_modifier;

          return (
            <button
              key={variant.id}
              onClick={() => handleSelect(variant)}
              disabled={outOfStock}
              title={`${variant.name}${outOfStock ? " — Out of stock" : ` — $${finalPrice.toFixed(2)}`}`}
              className={`relative px-4 py-2 rounded-md border text-sm font-medium transition-colors
                ${isSelected ? "border-black bg-black text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"}
                ${outOfStock ? "opacity-40 cursor-not-allowed line-through" : "cursor-pointer"}`}
            >
              {attrs?.color ?? variant.name}
              {variant.price_modifier !== 0 && (
                <span className="ml-1 text-xs opacity-70">
                  {variant.price_modifier > 0 ? "+" : ""}
                  {variant.price_modifier > 0 || variant.price_modifier < 0
                    ? `$${Math.abs(variant.price_modifier).toFixed(0)}`
                    : ""}
                </span>
              )}
              {outOfStock && (
                <span className="sr-only"> (out of stock)</span>
              )}
            </button>
          );
        })}
      </div>

      {!selectedId && variants.length > 1 && (
        <p className="text-xs text-neutral-500">Please select an option</p>
      )}
    </div>
  );
}
