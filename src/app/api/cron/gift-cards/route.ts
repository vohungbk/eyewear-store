import { createClient } from "@supabase/supabase-js";
import { sendGiftCardEmail } from "@/lib/email";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Sends e-gift cards whose delivery date has arrived.
// Called by an external scheduler (Vercel Cron, GitHub Actions, etc.) at least once a day.
// Set CRON_SECRET env var and pass ?secret=<value> in the URL.
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json(
      { error: "Service role key not configured" },
      { status: 500 },
    );
  }

  const db = serviceClient();
  const today = new Date().toISOString().slice(0, 10);

  // Paid cards (activated by the Stripe webhook) that are due and not yet emailed
  const { data: cards } = await db
    .from("gift_cards")
    .select(
      "id, code, initial_value, recipient_email, recipient_name, sender_name, message",
    )
    .eq("is_active", true)
    .is("email_sent_at", null)
    .not("delivery_date", "is", null)
    .lte("delivery_date", today)
    .limit(50);

  if (!cards?.length) {
    return Response.json({ sent: 0 });
  }

  let sent = 0;
  const errors: string[] = [];

  for (const card of cards) {
    try {
      await sendGiftCardEmail({
        recipientEmail: card.recipient_email,
        recipientName: card.recipient_name,
        senderName: card.sender_name,
        message: card.message,
        code: card.code,
        value: card.initial_value,
      });
      await db
        .from("gift_cards")
        .update({ email_sent_at: new Date().toISOString() })
        .eq("id", card.id);
      sent++;
    } catch (err) {
      errors.push(
        `${card.code}: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }
  }

  return Response.json({ sent, errors: errors.length ? errors : undefined });
}
