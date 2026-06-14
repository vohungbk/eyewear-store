import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sendNewsletterWelcomeEmail } from "@/lib/email";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  let body: { email?: string; name?: string; source?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const client = db();

  // Upsert — re-subscribing if unsubscribed
  const { data, error } = await client
    .from("newsletter_subscribers")
    .upsert(
      {
        email,
        name: body.name?.trim() || null,
        source: body.source ?? "footer",
        is_confirmed: true,
        unsubscribed_at: null,
      },
      { onConflict: "email" }
    )
    .select("id, is_confirmed")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
  }

  // Send welcome email async (don't await — don't block response)
  if (data) {
    sendNewsletterWelcomeEmail(email, body.name ?? null).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
