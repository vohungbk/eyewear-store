import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultEmail = "";
  let defaultName = "";

  if (user) {
    defaultEmail = user.email ?? "";
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    const profile = profileData as { full_name: string | null } | null;
    defaultName = profile?.full_name ?? "";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>
      <CheckoutForm
        defaultEmail={defaultEmail}
        defaultName={defaultName}
      />
    </div>
  );
}
