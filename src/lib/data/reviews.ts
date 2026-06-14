import { cacheLife, cacheTag } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

function publicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export interface ReviewWithAuthor {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export interface ProductReviewSummary {
  reviews: ReviewWithAuthor[];
  averageRating: number;
  totalCount: number;
}

export async function getProductReviews(productId: string): Promise<ProductReviewSummary> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`reviews-${productId}`);

  const { data } = await publicClient()
    .from("reviews")
    .select("id, rating, title, body, created_at, profiles(full_name)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const reviews = (data ?? []) as ReviewWithAuthor[];
  const totalCount = reviews.length;
  const averageRating =
    totalCount > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalCount) * 10) / 10
      : 0;

  return { reviews, averageRating, totalCount };
}
