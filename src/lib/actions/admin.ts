"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ProductSchema, type ProductFormValues, CategorySchema, type CategoryFormValues } from "@/lib/validations/admin";
import type { FormState } from "@/lib/validations/auth";
import { sendShippedEmail, sendBackInStockEmail } from "@/lib/email";

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

  revalidateTag("categories", "minutes");
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

  revalidateTag("categories", "minutes");
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

  revalidateTag("categories", "minutes");
  revalidatePath("/admin/categories");
  return {};
}

export async function createBundle(formData: FormData): Promise<{ error?: string }> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const db = serviceDb();
  const { data: bundle, error } = await db
    .from("bundles")
    .insert({
      name,
      description: (formData.get("description") as string)?.trim() || null,
      discount_type: formData.get("discount_type") as string,
      discount_value: parseFloat(formData.get("discount_value") as string) || 0,
      is_active: formData.get("is_active") === "true",
    })
    .select("id")
    .single();

  if (error || !bundle) return { error: "Failed to create bundle." };

  const items = JSON.parse((formData.get("items") as string) || "[]") as { productId: string; quantity: number }[];
  if (items.length > 0) {
    await db.from("bundle_items").insert(
      items.map((item, i) => ({
        bundle_id: bundle.id,
        product_id: item.productId,
        quantity: item.quantity,
        position: i,
      }))
    );
  }

  revalidatePath("/admin/bundles");
  redirect("/admin/bundles");
}

export async function updateBundle(id: string, formData: FormData): Promise<{ error?: string }> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };

  const db = serviceDb();

  const { error } = await db
    .from("bundles")
    .update({
      name,
      description: (formData.get("description") as string)?.trim() || null,
      discount_type: formData.get("discount_type") as string,
      discount_value: parseFloat(formData.get("discount_value") as string) || 0,
      is_active: formData.get("is_active") === "true",
    })
    .eq("id", id);

  if (error) return { error: "Failed to update bundle." };

  // Replace items
  await db.from("bundle_items").delete().eq("bundle_id", id);

  const items = JSON.parse((formData.get("items") as string) || "[]") as { productId: string; quantity: number }[];
  if (items.length > 0) {
    await db.from("bundle_items").insert(
      items.map((item, i) => ({
        bundle_id: id,
        product_id: item.productId,
        quantity: item.quantity,
        position: i,
      }))
    );
  }

  revalidatePath("/admin/bundles");
  revalidatePath(`/admin/bundles/${id}/edit`);
  redirect("/admin/bundles");
}

export async function deleteBundle(id: string): Promise<{ error?: string }> {
  try { await requireAdmin(); } catch { return { error: "Not authorized." }; }
  const db = serviceDb();
  const { error } = await db.from("bundles").delete().eq("id", id);
  if (error) return { error: "Failed to delete bundle." };
  revalidatePath("/admin/bundles");
  return {};
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  tracking?: { trackingNumber?: string; shippingCarrier?: string }
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  const db = serviceDb();

  const updateData: Record<string, string | null> = { status };
  if (tracking?.trackingNumber !== undefined) {
    updateData.tracking_number = tracking.trackingNumber || null;
    updateData.shipping_carrier = tracking.shippingCarrier || null;
  }

  const { error } = await db
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (error) return { error: "Failed to update order status." };

  // Send shipped email when status changes to "shipped"
  if (status === "shipped") {
    const { data: order } = await db
      .from("orders")
      .select("customer_name, customer_email, tracking_number, shipping_carrier")
      .eq("id", orderId)
      .single();

    if (order?.customer_email) {
      sendShippedEmail({
        orderId,
        customerName: order.customer_name ?? "",
        customerEmail: order.customer_email,
        trackingNumber: order.tracking_number ?? null,
        shippingCarrier: order.shipping_carrier ?? null,
      }).catch(() => {});
    }
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return {};
}

// ─── Variant stock ────────────────────────────────────────────────────────────

export async function updateVariantStock(
  variantId: string,
  newQuantity: number
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Not authorized." };
  }

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return { error: "Quantity must be a non-negative integer." };
  }

  const db = serviceDb();

  // Fetch current state + product info for email
  const { data: variantData } = await db
    .from("product_variants")
    .select("stock_quantity, product_id, name, products(name, slug, price, product_images(url, is_primary))")
    .eq("id", variantId)
    .single();

  if (!variantData) return { error: "Variant not found." };

  const wasOutOfStock = variantData.stock_quantity === 0;
  const nowInStock = newQuantity > 0;

  const { error } = await db
    .from("product_variants")
    .update({ stock_quantity: newQuantity })
    .eq("id", variantId);

  if (error) return { error: "Failed to update stock." };

  // Notify waitlist when restocked from zero
  if (wasOutOfStock && nowInStock) {
    const { data: waitlist } = await db
      .from("stock_waitlist")
      .select("id, email")
      .eq("variant_id", variantId);

    if (waitlist && waitlist.length > 0) {
      const product = variantData.products as {
        name: string;
        slug: string;
        price: number;
        product_images: { url: string; is_primary: boolean }[];
      } | null;

      const images: { url: string; is_primary: boolean }[] = product?.product_images ?? [];
      const primaryImage =
        images.find((i: { url: string; is_primary: boolean }) => i.is_primary) ?? images[0] ?? null;

      const ids = waitlist.map((w: { id: string }) => w.id);

      await Promise.allSettled(
        waitlist.map((w: { email: string }) =>
          sendBackInStockEmail({
            email: w.email,
            productName: product?.name ?? "",
            variantName: variantData.name,
            productSlug: product?.slug ?? "",
            productImageUrl: primaryImage?.url ?? null,
            price: product?.price ?? 0,
          })
        )
      );

      // Remove notified entries
      await db.from("stock_waitlist").delete().in("id", ids);
    }
  }

  const product = variantData.products as { slug: string } | null;
  if (product?.slug) revalidateTag(`product-${product.slug}`, "hours");
  revalidatePath(`/admin/products/${variantData.product_id}/edit`);
  return {};
}
