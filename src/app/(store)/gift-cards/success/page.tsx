import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Gift Card Sent — EYEWEAR" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceClient(): any {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

interface Props {
  searchParams: Promise<{ payment_intent?: string; redirect_status?: string }>;
}

export default async function GiftCardSuccessPage({ searchParams }: Props) {
  const { payment_intent, redirect_status } = await searchParams;

  if (!payment_intent || redirect_status !== "succeeded") {
    redirect("/gift-cards");
  }

  if (!process.env.STRIPE_SECRET_KEY) redirect("/gift-cards");

  const pi = await getStripe().paymentIntents.retrieve(payment_intent);
  if (pi.status !== "succeeded") redirect("/gift-cards");

  const db = serviceClient();
  const { data: gc } = db
    ? await db
        .from("gift_cards")
        .select("code, initial_value, recipient_email, recipient_name, sender_name")
        .eq("stripe_payment_intent_id", payment_intent)
        .single()
    : { data: null };

  const recipientEmail = gc?.recipient_email ?? "the recipient";
  const value = gc?.initial_value ?? pi.amount / 100;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2">Gift Card Sent!</h1>
      <p className="text-neutral-500 mb-8">
        A <strong>${value.toFixed(2)}</strong> gift card has been sent to{" "}
        <strong>{recipientEmail}</strong>. They&apos;ll receive an email with their code shortly.
      </p>

      <div className="border border-neutral-200 rounded-lg p-5 mb-8 text-left space-y-3">
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Gift card value</p>
          <p className="font-semibold">${value.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5">Sent to</p>
          <p className="text-sm">{recipientEmail}</p>
        </div>
        {gc?.code && (
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Gift card code</p>
            <p className="font-mono font-semibold text-sm tracking-wider">{gc.code}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/gift-cards"
          className="px-6 py-2.5 border border-neutral-200 text-sm font-semibold rounded-lg hover:border-black transition-colors"
        >
          Send Another Gift Card
        </Link>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
