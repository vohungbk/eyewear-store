import { Suspense } from "react";
import type { Metadata } from "next";
import CartView from "@/components/cart/CartView";
import AdditionalPairs, {
  type PairItem,
} from "@/components/cart/AdditionalPairs";
import { getProducts } from "@/lib/data/products";
import { getPrimaryImage } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Your cart" };

async function AdditionalPairsSection() {
  const { products } = await getProducts({ limit: 8 });
  const items: PairItem[] = products.map((p) => {
    const image = getPrimaryImage(p.product_images ?? []);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? "",
    };
  });
  return <AdditionalPairs items={items} />;
}

export default function CartPage() {
  return (
    <CartView>
      <Suspense fallback={null}>
        <AdditionalPairsSection />
      </Suspense>
    </CartView>
  );
}
