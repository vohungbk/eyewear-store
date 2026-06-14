"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceDb(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((data as { role: string } | null)?.role !== "admin") throw new Error("Not authorized");
}

export async function submitReview(
  productId: string,
  data: { rating: number; title?: string; body?: string }
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "Please sign in to leave a review." };

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    return { success: false, message: "Please select a rating." };
  }

  // Use service client (typed as any) — consistent with codebase pattern for new tables
  const db = serviceDb();
  const { error } = await db.from("reviews").upsert(
    {
      product_id: productId,
      user_id: user.id,
      rating: data.rating,
      title: data.title?.trim() || null,
      body: data.body?.trim() || null,
      is_approved: false,
    },
    { onConflict: "user_id,product_id" }
  );

  if (error) return { success: false, message: "Failed to submit review." };

  revalidateTag(`reviews-${productId}`, "minutes");
  return { success: true, message: "Review submitted! It will appear after approval." };
}

export async function approveReview(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  // Get productId for cache revalidation
  const db = serviceDb();
  const { data } = await db.from("reviews").select("product_id").eq("id", id).single();
  const { error } = await db.from("reviews").update({ is_approved: true }).eq("id", id);
  if (error) return { error: "Failed to approve review." };

  if (data?.product_id) revalidateTag(`reviews-${data.product_id}`, "minutes");
  revalidatePath("/admin/reviews");
  return {};
}

export async function deleteReview(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { data } = await db.from("reviews").select("product_id").eq("id", id).single();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (error) return { error: "Failed to delete review." };

  if (data?.product_id) revalidateTag(`reviews-${data.product_id}`, "minutes");
  revalidatePath("/admin/reviews");
  return {};
}
