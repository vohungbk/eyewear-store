import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendCAPIEvent } from "@/lib/facebook/capi";

export const dynamic = "force-dynamic";

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
    event = stripe.webhooks.constructEvent(
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

        if (fbEventId) {
          const { data: order } = await db
            .from("orders")
            .select("customer_email, customer_name, shipping_address, total, order_items(product_id, quantity)")
            .eq("id", orderId)
            .single();

          if (order) {
            const addr = order.shipping_address as Record<string, string> | null;
            const nameParts = (order.customer_name as string ?? "").split(" ");
            const items = (order.order_items ?? []) as { product_id: string; quantity: number }[];

            await sendCAPIEvent({
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
            });
          }
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
