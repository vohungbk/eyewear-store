import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import type { Json } from "@/types/database";
import { calculateOrder, PricingError } from "@/lib/pricing/calculateOrder";

// Stripe rejects USD charges below $0.50.
const MIN_STRIPE_AMOUNT = 0.5;

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
    // Prices, discounts, shipping, tax and totals are never read from the
    // client: it only sends variant ids, quantities and promo codes.
    const body = (await request.json()) as {
      items: { variantId: string; quantity: number }[];
      contact: { email: string; full_name: string; phone?: string };
      shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
      };
      discountCode?: string;
      giftCardCode?: string;
    };

    const { items: requestedItems, contact, shippingAddress } = body;

    if (!requestedItems?.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const db = serviceClient();
    let priced;
    try {
      priced = await calculateOrder(db, {
        items: requestedItems,
        discountCode: body.discountCode,
        giftCardCode: body.giftCardCode,
      });
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      throw err;
    }
    const { items, totals, discountCode, giftCard } = priced;

    if (totals.total <= 0) {
      return NextResponse.json(
        { error: "Order is fully covered by gift card. Use the free order flow." },
        { status: 400 }
      );
    }
    if (totals.total < MIN_STRIPE_AMOUNT) {
      return NextResponse.json(
        { error: `The amount due must be at least $${MIN_STRIPE_AMOUNT.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Get current user to link order to account (may be null for guests)
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    // Generate event ID for Facebook Purchase deduplication (browser Pixel vs CAPI)
    const fbEventId = crypto.randomUUID();

    // Create Stripe Payment Intent
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: contact.email,
    });

    // Create pending order via service role (bypasses RLS)
    const { data: orderData, error: orderError } = await db
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        subtotal: totals.subtotal,
        discount: totals.discount,
        discount_code: discountCode,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        gift_card_code: giftCard?.code ?? null,
        gift_card_credit: totals.giftCardCredit,
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
        unit_price: item.unitPrice,
        product_snapshot: {
          name: item.name,
          variant_name: item.variantName,
          image_url: item.imageUrl,
        } as unknown as Json,
      }))
    );

    if (itemsError) throw itemsError;

    // Attach order_id + fb_event_id to metadata for webhook + success page
    await getStripe().paymentIntents.update(paymentIntent.id, {
      metadata: { order_id: order.id, fb_event_id: fbEventId },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId: order.id,
      fbEventId,
    });
  } catch (err) {
    console.error("[create-payment-intent]", err);
    return NextResponse.json(
      { error: "Failed to create payment. Please try again." },
      { status: 500 }
    );
  }
}
