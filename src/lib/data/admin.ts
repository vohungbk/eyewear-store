import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(): any {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function getAdminProducts(search?: string, page = 1, limit = 20) {
  const client = db();
  if (!client) return { products: [] as AdminProduct[], count: 0 };

  let query = client
    .from("products")
    .select(
      "id, name, slug, price, compare_at_price, is_active, is_featured, created_at, categories(name), product_images(url, is_primary)"
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count } = await query;
  return { products: (data ?? []) as AdminProduct[], count: count ?? 0 };
}

export async function getAdminProduct(id: string) {
  const client = db();
  if (!client) return null;
  const { data } = await client
    .from("products")
    .select("*, product_images(*), product_variants(*), categories(id, name)")
    .eq("id", id)
    .single();
  return data as AdminProductDetail | null;
}

export async function getAdminOrders(status?: string, page = 1, limit = 30) {
  const client = db();
  if (!client) return { orders: [] as AdminOrder[], count: 0 };

  let query = client
    .from("orders")
    .select("id, customer_name, customer_email, total, status, created_at")
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count } = await query;
  return { orders: (data ?? []) as AdminOrder[], count: count ?? 0 };
}

export async function getAdminOrder(id: string) {
  const client = db();
  if (!client) return null;
  const { data } = await client
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  return data as AdminOrderDetail | null;
}

export async function getDashboardStats() {
  const client = db();
  if (!client) {
    return { totalOrders: 0, revenue: 0, activeProducts: 0, recentOrders: [] as AdminOrder[] };
  }

  const [allOrders, products] = await Promise.all([
    client.from("orders").select("status, total"),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  const orders = (allOrders.data ?? []) as { status: string; total: number }[];
  const revenue = orders
    .filter((o) => !["pending", "cancelled"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const recentOrders = await client
    .from("orders")
    .select("id, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    totalOrders: orders.filter((o) => o.status !== "cancelled").length,
    revenue,
    activeProducts: products.count ?? 0,
    recentOrders: (recentOrders.data ?? []) as AdminOrder[],
  };
}

export async function getAdminCategories() {
  const client = db();
  if (!client) return [] as AdminCategory[];
  const { data } = await client
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, position, created_at")
    .order("position", { ascending: true });
  return (data ?? []) as AdminCategory[];
}

export async function getAdminCategory(id: string) {
  const client = db();
  if (!client) return null;
  const { data } = await client
    .from("categories")
    .select("id, name, slug, description, image_url, parent_id, position")
    .eq("id", id)
    .single();
  return data as AdminCategory | null;
}

// ─── Local types ─────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  categories: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[];
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  categories: { id: string; name: string } | null;
  product_images: {
    id: string;
    url: string;
    alt_text: string | null;
    position: number;
    is_primary: boolean;
  }[];
  product_variants: {
    id: string;
    name: string;
    sku: string | null;
    price_modifier: number;
    stock_quantity: number;
  }[];
}

export interface AdminOrder {
  id: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  position: number;
  created_at?: string;
}

export interface AdminOrderDetail {
  id: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  shipping_address: Record<string, string>;
  stripe_payment_intent_id: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product_snapshot: { name?: string; variant_name?: string; image_url?: string };
  }[];
}
