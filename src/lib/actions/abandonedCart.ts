"use server";

import { createClient } from "@supabase/supabase-js";
import type { CartItem } from "@/types/cart";
import { sendAbandonedCartEmail } from "@/lib/email";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function upsertAbandonedCart(data: {
  email: string;
  name: string;
  items: CartItem[];
  total: number;
}): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const db = serviceClient();

  // Find any active (not yet recovered) cart for this email
  const { data: existing } = await db
    .from("abandoned_carts")
    .select("id")
    .eq("email", data.email)
    .is("recovered_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    // Update cart snapshot; preserve email_sent_at so we don't re-send
    await db
      .from("abandoned_carts")
      .update({
        name: data.name || null,
        cart_items: data.items,
        cart_total: data.total,
      })
      .eq("id", existing.id);
  } else {
    await db.from("abandoned_carts").insert({
      email: data.email,
      name: data.name || null,
      cart_items: data.items,
      cart_total: data.total,
    });
  }
}

export async function markCartRecovered(email: string): Promise<void> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const db = serviceClient();
  await db
    .from("abandoned_carts")
    .update({ recovered_at: new Date().toISOString() })
    .eq("email", email)
    .is("recovered_at", null);
}

export async function triggerRecoveryEmail(cartId: string): Promise<{ success: boolean; error?: string }> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Service role key not configured" };
  }

  const db = serviceClient();
  const { data: cart } = await db
    .from("abandoned_carts")
    .select("id, email, name, cart_items, cart_total, token, recovered_at")
    .eq("id", cartId)
    .single();

  if (!cart) return { success: false, error: "Cart not found" };
  if (cart.recovered_at) return { success: false, error: "Cart already recovered" };

  try {
    await sendAbandonedCartEmail({
      email: cart.email,
      name: cart.name,
      items: cart.cart_items as CartItem[],
      total: cart.cart_total,
      token: cart.token,
    });

    await db
      .from("abandoned_carts")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", cartId);

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send email" };
  }
}
