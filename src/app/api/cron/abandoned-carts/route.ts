import { createClient } from "@supabase/supabase-js";
import { sendAbandonedCartEmail } from "@/lib/email";
import type { CartItem } from "@/types/cart";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Called by an external scheduler (Vercel Cron, GitHub Actions, etc.) every hour.
// Set CRON_SECRET env var and pass ?secret=<value> in the URL.
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "Service role key not configured" }, { status: 500 });
  }

  const db = serviceClient();

  // Carts older than 1 hour, no email sent yet, not recovered
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: carts } = await db
    .from("abandoned_carts")
    .select("id, email, name, cart_items, cart_total, token")
    .lt("created_at", cutoff)
    .is("email_sent_at", null)
    .is("recovered_at", null)
    .limit(50);

  if (!carts?.length) {
    return Response.json({ sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const cart of carts) {
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
        .eq("id", cart.id);
      sent++;
    } catch (err) {
      errors.push(`${cart.email}: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  }

  return Response.json({ sent, errors: errors.length ? errors : undefined });
}
