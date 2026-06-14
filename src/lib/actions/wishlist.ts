"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceDb(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function toggleWishlist(
  productId: string
): Promise<{ wishlisted: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { wishlisted: false, error: "Please sign in to save items." };

  const db = serviceDb();

  // Check if already in wishlist
  const { data: existing } = await db
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    await db.from("wishlists").delete().eq("id", existing.id);
    return { wishlisted: false };
  }

  const { error } = await db.from("wishlists").insert({
    user_id: user.id,
    product_id: productId,
  });

  if (error) return { wishlisted: false, error: "Failed to save item." };
  return { wishlisted: true };
}

export async function getWishlistedProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const db = serviceDb();
  const { data } = await db
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);

  return (data ?? []).map((w: { product_id: string }) => w.product_id);
}

export async function getWishlistProducts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const db = serviceDb();
  const { data } = await db
    .from("wishlists")
    .select(
      `product_id, products (
        id, name, slug, price, compare_at_price,
        product_images (id, url, alt_text, position, is_primary),
        categories (id, name, slug)
      )`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as {
    product_id: string;
    products: {
      id: string;
      name: string;
      slug: string;
      price: number;
      compare_at_price: number | null;
      product_images: { id: string; url: string; alt_text: string | null; position: number; is_primary: boolean }[];
      categories: { id: string; name: string; slug: string } | null;
    } | null;
  }[];
}
