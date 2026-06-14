import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const { code, subtotal } = (await request.json()) as {
      code: string;
      subtotal: number;
    };

    if (!code?.trim()) {
      return NextResponse.json({ valid: false, message: "Please enter a discount code." });
    }

    const { data } = await serviceClient()
      .from("discount_codes")
      .select("id, type, value, min_order, usage_limit, usage_count, expires_at")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (!data) {
      return NextResponse.json({ valid: false, message: "Invalid or expired discount code." });
    }

    const dc = data as {
      id: string;
      type: "percent" | "fixed";
      value: number;
      min_order: number;
      usage_limit: number | null;
      usage_count: number;
      expires_at: string | null;
    };

    if (dc.expires_at && new Date(dc.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, message: "This discount code has expired." });
    }

    if (dc.usage_limit !== null && dc.usage_count >= dc.usage_limit) {
      return NextResponse.json({ valid: false, message: "This discount code has reached its usage limit." });
    }

    if (subtotal < dc.min_order) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of $${dc.min_order.toFixed(2)} required for this code.`,
      });
    }

    const discountAmount =
      dc.type === "percent"
        ? parseFloat(((subtotal * dc.value) / 100).toFixed(2))
        : parseFloat(Math.min(dc.value, subtotal).toFixed(2));

    return NextResponse.json({
      valid: true,
      discountAmount,
      discountType: dc.type,
      discountValue: dc.value,
    });
  } catch (err) {
    console.error("[discount/validate]", err);
    return NextResponse.json(
      { valid: false, message: "Failed to validate code. Please try again." },
      { status: 500 }
    );
  }
}
