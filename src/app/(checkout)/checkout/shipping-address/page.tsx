import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ShippingAddressForm from "@/components/checkout/ShippingAddressForm";

export const metadata: Metadata = { title: "Shipping information" };

async function ShippingAddressContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultEmail = "";
  let defaultName = "";

  if (user) {
    defaultEmail = user.email ?? "";
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    defaultName = (data as { full_name: string | null } | null)?.full_name ?? "";
  }

  return (
    <ShippingAddressForm
      defaultEmail={defaultEmail}
      defaultName={defaultName}
    />
  );
}

export default function ShippingAddressPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <ShippingAddressContent />
    </Suspense>
  );
}
