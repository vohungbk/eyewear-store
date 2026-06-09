"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ProductSchema, type ProductFormValues, CategorySchema, type CategoryFormValues } from "@/lib/validations/admin";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const profile = data as { role: string } | null;

  if (profile?.role !== "admin") throw new Error("Not authorized");
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function createProduct(
  data: ProductFormValues
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = serviceDb();
  const { data: product, error } = await db
    .from("products")
    .insert(parsed.data)
    .select("id, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "A product with this slug already exists." };
    }
    return { success: false, message: "Failed to create product." };
  }

  revalidateTag("products", "minutes");
  revalidateTag(`product-${(product as { slug: string }).slug}`, "hours");
  redirect(`/admin/products/${(product as { id: string }).id}/edit`);
}

export async function updateProduct(
  id: string,
  data: ProductFormValues
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = ProductSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = serviceDb();
  const { error } = await db
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "A product with this slug already exists." };
    }
    return { success: false, message: "Failed to update product." };
  }

  revalidateTag("products", "minutes");
  revalidateTag(`product-${parsed.data.slug}`, "hours");
  return { success: true, message: "Product saved." };
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { data: product } = await db
    .from("products")
    .select("slug")
    .eq("id", id)
    .single();

  const { error } = await db.from("products").delete().eq("id", id);
  if (error) return { error: "Failed to delete product." };

  revalidateTag("products", "minutes");
  if (product) revalidateTag(`product-${(product as { slug: string }).slug}`, "hours");
  revalidatePath("/admin/products");
  return {};
}

// ─── Product images ───────────────────────────────────────────────────────────

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { error } = await db
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) return { error: "Failed to delete image." };

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidateTag("products", "minutes");
  return {};
}

export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  await db
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await db
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) return { error: "Failed to set primary image." };

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidateTag("products", "minutes");
  revalidateTag(`product-${productId}`, "hours");
  return {};
}

export async function saveProductImage(
  productId: string,
  url: string,
  isPrimary = false
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();

  if (isPrimary) {
    await db
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
  }

  const { error } = await db.from("product_images").insert({
    product_id: productId,
    url,
    position: 0,
    is_primary: isPrimary,
  });

  if (error) return { error: "Failed to save image record." };

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidateTag("products", "minutes");
  return {};
}

// ─── Orders ───────────────────────────────────────────────────────────────────

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(
  data: CategoryFormValues
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = serviceDb();
  const { error } = await db.from("categories").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "A category with this slug already exists." };
    }
    return { success: false, message: "Failed to create category." };
  }

  revalidateTag("categories");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

export async function updateCategory(
  id: string,
  data: CategoryFormValues
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch {
    return { success: false, message: "Not authorized." };
  }

  const parsed = CategorySchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const db = serviceDb();
  const { error } = await db
    .from("categories")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "A category with this slug already exists." };
    }
    return { success: false, message: "Failed to update category." };
  }

  revalidateTag("categories");
  revalidatePath("/admin/categories");
  return { success: true, message: "Category saved." };
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) return { error: "Failed to delete category." };

  revalidateTag("categories");
  revalidatePath("/admin/categories");
  return {};
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: "Failed to update order status." };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}
