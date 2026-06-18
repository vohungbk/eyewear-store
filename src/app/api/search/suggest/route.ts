import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database, ProductWithImages } from "@/types/database";

function publicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const { data } = await publicClient()
    .from("products")
    .select("*, product_images(url, alt_text, is_primary)")
    .eq("is_active", true)
    .ilike("name", `%${q}%`)
    .order("is_featured", { ascending: false })
    .limit(5) as unknown as { data: ProductWithImages[] | null };

  const suggestions = (data ?? []).map((p) => {
    const images = p.product_images;
    const primary = images?.find((i) => i.is_primary) ?? images?.[0] ?? null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compare_at_price: p.compare_at_price,
      imageUrl: primary?.url ?? null,
      imageAlt: primary?.alt_text ?? p.name,
    };
  });

  return NextResponse.json({ suggestions });
}
