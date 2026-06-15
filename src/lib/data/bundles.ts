import { cacheLife, cacheTag } from "next/cache";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function publicClient() {
  return createServerClient(url, anonKey, { cookies: { getAll: () => [], setAll: () => {} } });
}

export interface BundleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  product_images: { url: string; is_primary: boolean }[];
  product_variants: { id: string; name: string; price_modifier: number; stock_quantity: number }[];
}

export interface BundleItemData {
  id: string;
  quantity: number;
  position: number;
  product_id: string;
  products: BundleProduct;
}

export interface BundleData {
  id: string;
  name: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  bundle_items: BundleItemData[];
}

export async function getBundlesForProduct(productId: string): Promise<BundleData[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`bundles-product-${productId}`);

  const client = publicClient();

  const { data: refs } = await client
    .from("bundle_items")
    .select("bundle_id")
    .eq("product_id", productId);

  if (!refs || refs.length === 0) return [];

  const bundleIds = (refs as { bundle_id: string }[]).map((r) => r.bundle_id);

  const { data } = await client
    .from("bundles")
    .select(
      `id, name, description, discount_type, discount_value,
       bundle_items(
         id, quantity, position, product_id,
         products(
           id, name, slug, price,
           product_images(url, is_primary),
           product_variants(id, name, price_modifier, stock_quantity)
         )
       )`
    )
    .in("id", bundleIds)
    .eq("is_active", true);

  return (data ?? []) as unknown as BundleData[];
}

