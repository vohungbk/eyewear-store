import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Json } from "@/types/database";
import type { CartItem } from "@/types/cart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Used when a gift card covers the full order total so no Stripe payment is needed.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items: CartItem[];
      contact: { email: string; full_name: string; phone?: string };
      shippingAddress: {
        line1: string; line2?: string; city: string; state: string;
        postal_code: string; country: string;
      };
      totals: {
        subtotal: number; discount: number; shipping: number; tax: number;
        giftCardCredit: number; total: number;
      };
      discountCode?: string;
      giftCardCode: string;
    };

    const { items, contact, shippingAddress, totals, discountCode, giftCardCode } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!giftCardCode) {
      return NextResponse.json({ error: "No gift card provided." }, { status: 400 });
    }
    if (totals.total > 0) {
      return NextResponse.json({ error: "Order is not fully covered by gift card." }, { status: 400 });
    }

    const db = serviceClient();
    const code = giftCardCode.trim().toUpperCase();

    // Validate and lock the gift card with a balance check
    const { data: gc } = await db
      .from("gift_cards")
      .select("id, balance, is_active, expires_at")
      .eq("code", code)
      .single();

    if (!gc || !gc.is_active) {
      return NextResponse.json({ error: "Invalid or inactive gift card." }, { status: 400 });
    }
    if (gc.expires_at && new Date(gc.expires_at) < new Date()) {
      return NextResponse.json({ error: "Gift card has expired." }, { status: 400 });
    }
    if (gc.balance < totals.giftCardCredit) {
      return NextResponse.json({ error: "Insufficient gift card balance." }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    // Create order as already paid (no Stripe)
    const { data: orderData, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "paid",
        subtotal: totals.subtotal,
        discount: totals.discount,
        discount_code: discountCode ?? null,
        shipping: totals.shipping,
        tax: totals.tax,
        total: 0,
        shipping_address: shippingAddress as unknown as Json,
        customer_email: contact.email,
        customer_name: contact.full_name,
        gift_card_code: code,
        gift_card_credit: totals.giftCardCredit,
      })
      .select("id")
      .single();

    if (orderError || !orderData) throw orderError ?? new Error("Order creation failed");
    const order = orderData as { id: string };

    // Insert order items
    await db.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        quantity: item.quantity,
        unit_price: item.price,
        product_snapshot: {
          name: item.name,
          variant_name: item.variantName,
          image_url: item.imageUrl ?? null,
        } as unknown as Json,
      }))
    );

    // Deduct gift card balance
    const newBalance = parseFloat((gc.balance - totals.giftCardCredit).toFixed(2));
    await db.from("gift_cards").update({ balance: newBalance }).eq("id", gc.id);
    await db.from("gift_card_redemptions").insert({
      gift_card_id: gc.id,
      order_id: order.id,
      amount: totals.giftCardCredit,
    });

    // Send order confirmation email
    if (contact.email) {
      sendOrderConfirmationEmail({
        id: order.id,
        customer_name: contact.full_name,
        customer_email: contact.email,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: 0,
        shipping_address: shippingAddress as {
          line1: string; line2?: string; city: string; state: string;
          postal_code: string; country: string;
        },
        order_items: items.map((i) => ({
          product_snapshot: { name: i.name, variant_name: i.variantName, image_url: i.imageUrl ?? undefined },
          unit_price: i.price,
          quantity: i.quantity,
        })),
      }).catch(() => {});
    }

    return NextResponse.json({ orderId: order.id });
  } catch (err) {
    console.error("[orders/create-free]", err);
    return NextResponse.json({ error: "Failed to place order. Please try again." }, { status: 500 });
  }
}
