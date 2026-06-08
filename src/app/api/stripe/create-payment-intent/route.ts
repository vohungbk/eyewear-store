import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import type { Json } from "@/types/database";
import type { CartItem } from "@/types/cart";

// Untyped service client — avoids broken generic inference; runtime safety via RLS-bypass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      items: CartItem[];
      contact: { email: string; full_name: string; phone?: string };
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      totals: { subtotal: number; shipping: number; tax: number; total: number };
    };

    const { items, contact, shippingAddress, totals } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    // Get current user to link order to account (may be null for guests)
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: contact.email,
    });

    // Create pending order via service role (bypasses RLS)
    const db = serviceClient();
    const { data: orderData, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        stripe_payment_intent_id: paymentIntent.id,
        shipping_address: shippingAddress as unknown as Json,
        customer_email: contact.email,
        customer_name: contact.full_name,
      })
      .select("id")
      .single();

    if (orderError || !orderData) {
      throw orderError ?? new Error("Order creation failed");
    }
    const order = orderData as { id: string };

    const { error: itemsError } = await db.from("order_items").insert(
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

    if (itemsError) throw itemsError;

    // Attach order_id to payment intent metadata for webhook lookup
    await stripe.paymentIntents.update(paymentIntent.id, {
      metadata: { order_id: order.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
    });
  } catch (err) {
    console.error("[create-payment-intent]", err);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
