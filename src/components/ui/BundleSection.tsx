"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils/format";
import type { BundleData } from "@/lib/data/bundles";

function calcBundlePrice(bundle: BundleData) {
  const total = bundle.bundle_items.reduce((sum, item) => {
    const v = item.products.product_variants[0];
    return sum + (item.products.price + (v?.price_modifier ?? 0)) * item.quantity;
  }, 0);
  const savings =
    bundle.discount_type === "percent"
      ? total * (bundle.discount_value / 100)
      : bundle.discount_value;
  return { total, savings, bundlePrice: Math.max(0, total - savings) };
}

interface Props {
  bundles: BundleData[];
  currentProductId: string;
}

export default function BundleSection({ bundles, currentProductId }: Props) {
  const { addItem, openCart } = useCartStore();
  const [adding, setAdding] = useState<string | null>(null);

  if (bundles.length === 0) return null;

  function handleAddBundle(bundle: BundleData) {
    setAdding(bundle.id);
    let added = 0;
    for (const item of bundle.bundle_items) {
      const { products } = item;
      const variant = products.product_variants
        .filter((v) => v.stock_quantity > 0)
        .sort((a, b) => a.price_modifier - b.price_modifier)[0];
      if (!variant) continue;
      const imageUrl =
        products.product_images.find((i) => i.is_primary)?.url ??
        products.product_images[0]?.url ??
        null;
      addItem({
        productId: products.id,
        variantId: variant.id,
        name: products.name,
        variantName: variant.name,
        price: products.price + variant.price_modifier,
        imageUrl,
        slug: products.slug,
        stockQuantity: variant.stock_quantity,
      });
      added++;
    }
    if (added > 0) openCart();
    setAdding(null);
  }

  return (
    <div className="mt-16 border-t border-neutral-100 pt-12 space-y-12">
      {bundles.map((bundle) => {
        const { total, savings, bundlePrice } = calcBundlePrice(bundle);
        const isAdding = adding === bundle.id;
        const sorted = [...bundle.bundle_items].sort((a, b) => a.position - b.position);

        return (
          <div key={bundle.id}>
            <h2 className="text-xl font-bold mb-1">{bundle.name}</h2>
            {bundle.description && (
              <p className="text-sm text-neutral-500 mb-6">{bundle.description}</p>
            )}

            {/* Products row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {sorted.map((item, i) => {
                const img =
                  item.products.product_images.find((im) => im.is_primary)?.url ??
                  item.products.product_images[0]?.url;
                const isCurrent = item.product_id === currentProductId;

                return (
                  <div key={item.id} className="flex items-center gap-3">
                    {i > 0 && (
                      <span className="text-neutral-300 font-bold text-xl select-none">+</span>
                    )}
                    <Link
                      href={`/products/${item.products.slug}`}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                        isCurrent
                          ? "border-black bg-neutral-50"
                          : "border-neutral-200 hover:border-neutral-400"
                      }`}
                    >
                      <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium max-w-20 line-clamp-2">
                          {item.products.name}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {formatPrice(item.products.price)}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            This item
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Pricing + CTA */}
            <div className="flex flex-wrap items-center gap-4 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4">
              <div>
                <p className="text-xs text-neutral-500 mb-0.5">Bundle price</p>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-bold">{formatPrice(bundlePrice)}</span>
                  {savings > 0 && (
                    <>
                      <span className="text-sm text-neutral-400 line-through">
                        {formatPrice(total)}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        Save{" "}
                        {bundle.discount_type === "percent"
                          ? `${bundle.discount_value}%`
                          : formatPrice(savings)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleAddBundle(bundle)}
                disabled={isAdding}
                className="ml-auto bg-black text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-60"
              >
                {isAdding ? "Adding…" : "Add Bundle to Cart"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
