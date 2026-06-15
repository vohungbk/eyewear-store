import type { Metadata } from "next";
import Link from "next/link";
import { getAdminProducts } from "@/lib/data/admin";
import BundleForm from "@/components/admin/BundleForm";

export const metadata: Metadata = { title: "Admin — New Bundle" };

export default async function NewBundlePage() {
  const { products } = await getAdminProducts(undefined, 1, 200);

  const simpleProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    imageUrl: p.product_images.find((i) => i.is_primary)?.url ?? p.product_images[0]?.url ?? null,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/bundles" className="text-sm text-neutral-500 hover:text-black transition-colors">
          ← Bundles
        </Link>
        <span className="text-neutral-300">/</span>
        <h1 className="text-xl font-bold">New Bundle</h1>
      </div>
      <BundleForm products={simpleProducts} />
    </div>
  );
}
