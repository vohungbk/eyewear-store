import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CartRecovery from "@/components/checkout/CartRecovery";
import type { CartItem } from "@/types/cart";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function CartRecoveryPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    redirect("/checkout");
  }

  const db = serviceClient();
  const { data: cart } = await db
    .from("abandoned_carts")
    .select("cart_items, recovered_at")
    .eq("token", token)
    .single();

  if (!cart) notFound();

  // Already recovered — go straight to checkout
  if (cart.recovered_at) redirect("/checkout");

  const items = (cart.cart_items ?? []) as CartItem[];
  if (items.length === 0) redirect("/products");

  return <CartRecovery items={items} />;
}
