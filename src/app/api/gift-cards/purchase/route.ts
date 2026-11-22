import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/I/1 confusion

function generateCode(): string {
  const uuid = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  // Map hex chars to our charset
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += CHARSET[parseInt(uuid[i], 16) % CHARSET.length];
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Valid when it is a real calendar day, not before yesterday (UTC, covers timezones) and within a year. */
function isValidDeliveryDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time) || new Date(time).toISOString().slice(0, 10) !== value)
    return false;
  const todayUtc = Date.parse(
    new Date().toISOString().slice(0, 10) + "T00:00:00Z",
  );
  return time >= todayUtc - DAY_MS && time <= todayUtc + 366 * DAY_MS;
}

const VALID_AMOUNTS = [25, 50, 100, 200];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      amount: number;
      recipientEmail: string;
      recipientName?: string;
      senderName?: string;
      senderEmail?: string;
      deliveryDate?: string;
      message?: string;
    };

    const {
      amount,
      recipientEmail,
      recipientName,
      senderName,
      senderEmail,
      deliveryDate,
      message,
    } = body;

    if (!amount || amount < 5 || amount > 1000) {
      return NextResponse.json(
        { error: "Amount must be between $5 and $1,000." },
        { status: 400 },
      );
    }
    if (!VALID_AMOUNTS.includes(amount) && amount % 1 !== 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }
    if (!recipientEmail?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: "Invalid recipient email." },
        { status: 400 },
      );
    }

    if (senderEmail && !EMAIL_RE.test(senderEmail)) {
      return NextResponse.json(
        { error: "Invalid sender email." },
        { status: 400 },
      );
    }
    if (deliveryDate && !isValidDeliveryDate(deliveryDate)) {
      return NextResponse.json(
        { error: "Invalid delivery date." },
        { status: 400 },
      );
    }

    // Generate a unique code (retry if collision)
    const db = serviceClient();
    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = generateCode();
      const { data: existing } = await db
        .from("gift_cards")
        .select("id")
        .eq("code", candidate)
        .single();
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) {
      return NextResponse.json(
        { error: "Failed to generate code. Please try again." },
        { status: 500 },
      );
    }

    // Create Stripe Payment Intent
    const pi = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: recipientEmail,
      metadata: { gift_card_code: code },
    });

    // Insert inactive gift card — activated when PI succeeds
    const { error } = await db.from("gift_cards").insert({
      code,
      initial_value: amount,
      balance: amount,
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      sender_name: senderName || null,
      message: message || null,
      sender_email: senderEmail || null,
      delivery_date: deliveryDate || null,
      stripe_payment_intent_id: pi.id,
      is_active: false,
    });

    if (error) throw error;

    return NextResponse.json({ clientSecret: pi.client_secret, code });
  } catch (err) {
    console.error("[gift-cards/purchase]", err);
    return NextResponse.json(
      { error: "Failed to create gift card. Please try again." },
      { status: 500 },
    );
  }
}
