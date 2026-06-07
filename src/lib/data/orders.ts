import { createClient } from "@/lib/supabase/server";
import type { OrderWithItems } from "@/types/database";

export async function getUserOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*, products(id, name, slug))`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as OrderWithItems[];
}

export async function getUserOrder(orderId: string): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*, products(id, name, slug))`)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error) return null;
  return data as unknown as OrderWithItems;
}
