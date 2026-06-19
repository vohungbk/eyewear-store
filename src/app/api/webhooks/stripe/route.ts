import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { sendCAPIEvent } from "@/lib/facebook/capi";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { markCartRecovered } from "@/lib/actions/abandonedCart";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  // Raw text body required for Stripe webhook signature verification
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(
      `Webhook Error: ${err instanceof Error ? err.message : "Unknown"}`,
      { status: 400 }
    );
  }

  const db = serviceClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id;
      const fbEventId = pi.metadata?.fb_event_id;

      if (orderId) {
        await db
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId)
          .eq("stripe_payment_intent_id", pi.id);

        // Fetch full order once — used for both CAPI and confirmation email
        const { data: order } = await db
          .from("orders")
          .select(`
            id, customer_email, customer_name, shipping_address,
            subtotal, shipping, tax, total,
            order_items(product_id, unit_price, quantity, product_snapshot)
          `)
          .eq("id", orderId)
          .single();

        if (order) {
          type RawItem = { product_id: string; unit_price: number; quantity: number; product_snapshot: { name: string; variant_name?: string; image_url?: string } | null };
          const addr = order.shipping_address as Record<string, string> | null;
          const nameParts = (order.customer_name as string ?? "").split(" ");
          const items = (order.order_items ?? []) as RawItem[];

          await Promise.all([
            // Mark abandoned cart as recovered
            markCartRecovered(order.customer_email),

            // Facebook CAPI Purchase
            fbEventId
              ? sendCAPIEvent({
                  eventName: "Purchase",
                  eventId: fbEventId,
                  userData: {
                    email: order.customer_email ?? undefined,
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(" ") || undefined,
                    city: addr?.city,
                    state: addr?.state,
                    zip: addr?.postal_code,
                    country: addr?.country,
                  },
                  customData: {
                    value: order.total,
                    currency: "USD",
                    contentIds: items.map((i) => i.product_id),
                    contentType: "product",
                    numItems: items.reduce((s, i) => s + i.quantity, 0),
                    orderId,
                  },
                })
              : Promise.resolve(),

            // Order confirmation email
            order.customer_email
              ? sendOrderConfirmationEmail({
                  id: order.id,
                  customer_name: order.customer_name ?? "",
                  customer_email: order.customer_email,
                  subtotal: order.subtotal,
                  shipping: order.shipping,
                  tax: order.tax,
                  total: order.total,
                  shipping_address: addr as {
                    line1: string;
                    line2?: string;
                    city: string;
                    state: string;
                    postal_code: string;
                    country: string;
                  },
                  order_items: items.map((i) => ({
                    product_snapshot: i.product_snapshot,
                    unit_price: i.unit_price,
                    quantity: i.quantity,
                  })),
                })
              : Promise.resolve(),
          ]);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        await db
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
          .eq("stripe_payment_intent_id", pi.id);
      }
      break;
    }
  }

  return new Response(null, { status: 200 });
}
