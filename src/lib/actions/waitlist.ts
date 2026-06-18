"use server";

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { z } from "zod";

function publicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const JoinSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
});

export async function joinWaitlist(
  email: string,
  productId: string,
  variantId: string
): Promise<{ success: boolean; message: string }> {
  const parsed = JoinSchema.safeParse({ email, productId, variantId });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const first =
      flat.fieldErrors.email?.[0] ??
      flat.formErrors[0] ??
      "Invalid input.";
    return { success: false, message: first };
  }

  const db = publicClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (db.from("stock_waitlist") as any).insert({
    email: parsed.data.email.toLowerCase().trim(),
    product_id: parsed.data.productId,
    variant_id: parsed.data.variantId,
  }) as { error: { code: string } | null };

  if (error) {
    // unique constraint = already on list
    if (error.code === "23505") {
      return { success: true, message: "You're already on the waitlist for this item." };
    }
    return { success: false, message: "Failed to join waitlist. Please try again." };
  }

  return { success: true, message: "You're on the list! We'll email you when it's back." };
}
