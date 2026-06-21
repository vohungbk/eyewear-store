import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { code } = (await request.json()) as { code: string };

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, message: "Please enter a gift card code." });
    }

    const normalised = code.trim().toUpperCase();

    const { data } = await serviceClient()
      .from("gift_cards")
      .select("id, balance, initial_value, is_active, expires_at")
      .eq("code", normalised)
      .single();

    if (!data) {
      return NextResponse.json({ valid: false, message: "Gift card not found or invalid." });
    }

    const gc = data as {
      id: string;
      balance: number;
      initial_value: number;
      is_active: boolean;
      expires_at: string | null;
    };

    if (!gc.is_active) {
      return NextResponse.json({ valid: false, message: "This gift card has not been activated yet." });
    }

    if (gc.expires_at && new Date(gc.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This gift card has expired." });
    }

    if (gc.balance <= 0) {
      return NextResponse.json({ valid: false, message: "This gift card has no remaining balance." });
    }

    return NextResponse.json({ valid: true, balance: gc.balance, initialValue: gc.initial_value });
  } catch (err) {
    console.error("[gift-cards/validate]", err);
    return NextResponse.json({ valid: false, message: "Failed to validate gift card. Please try again." }, { status: 500 });
  }
}
