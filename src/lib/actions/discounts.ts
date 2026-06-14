"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { DiscountSchema, type DiscountFormValues } from "@/lib/validations/admin";
import type { FormState } from "@/lib/validations/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serviceDb(): any {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if ((data as { role: string } | null)?.role !== "admin") throw new Error("Not authorized");
}

export async function createDiscount(data: DiscountFormValues): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = DiscountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const db = serviceDb();
  const { error } = await db.from("discount_codes").insert({
    ...parsed.data,
    code: parsed.data.code.toUpperCase(),
  });

  if (error) {
    if (error.code === "23505") return { success: false, message: "A discount code with this name already exists." };
    return { success: false, message: "Failed to create discount code." };
  }

  revalidatePath("/admin/discounts");
  redirect("/admin/discounts");
}

export async function updateDiscount(id: string, data: DiscountFormValues): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = DiscountSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const db = serviceDb();
  const { error } = await db
    .from("discount_codes")
    .update({ ...parsed.data, code: parsed.data.code.toUpperCase() })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { success: false, message: "A discount code with this name already exists." };
    return { success: false, message: "Failed to update discount code." };
  }

  revalidatePath("/admin/discounts");
  return { success: true, message: "Discount code saved." };
}

export async function deleteDiscount(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { error } = await db.from("discount_codes").delete().eq("id", id);
  if (error) return { error: "Failed to delete discount code." };

  revalidatePath("/admin/discounts");
  return {};
}
