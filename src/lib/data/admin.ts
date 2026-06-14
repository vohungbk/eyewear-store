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
      "id, name, slug, price, compare_at_price, is_active, is_featured, created_at, categories(name), product_images(url, is_primary), product_variants(stock_quantity, low_stock_threshold)"
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
    .select("id, customer_name, customer_email, subtotal, discount, discount_code, shipping, tax, total, status, shipping_address, stripe_payment_intent_id, tracking_number, shipping_carrier, created_at, order_items(*)")
    .eq("id", id)
    .single();
  return data as AdminOrderDetail | null;
}

export async function getDashboardStats() {
  const client = db();
  if (!client) {
    return { totalOrders: 0, revenue: 0, activeProducts: 0, recentOrders: [] as AdminOrder[], lowStockCount: 0 };
  }

  const [allOrders, products, variants] = await Promise.all([
    client.from("orders").select("status, total"),
    client.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    client.from("product_variants").select("stock_quantity, low_stock_threshold"),
  ]);

  const orders = (allOrders.data ?? []) as { status: string; total: number }[];
  const revenue = orders
    .filter((o) => !["pending", "cancelled"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockCount = ((variants.data ?? []) as { stock_quantity: number; low_stock_threshold: number }[])
    .filter((v) => v.stock_quantity <= v.low_stock_threshold).length;

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
    lowStockCount,
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

export async function getAdminDiscounts() {
  const client = db();
  if (!client) return [] as AdminDiscount[];
  const { data } = await client
    .from("discount_codes")
    .select("id, code, type, value, min_order, usage_limit, usage_count, is_active, expires_at, created_at")
    .order("created_at", { ascending: false });
  return (data ?? []) as AdminDiscount[];
}

export async function getAdminDiscount(id: string) {
  const client = db();
  if (!client) return null;
  const { data } = await client
    .from("discount_codes")
    .select("id, code, type, value, min_order, usage_limit, usage_count, is_active, expires_at")
    .eq("id", id)
    .single();
  return data as AdminDiscount | null;
}

export async function getAdminReviews(approved?: boolean, page = 1, limit = 30) {
  const client = db();
  if (!client) return { reviews: [] as AdminReview[], count: 0 };

  let query = client
    .from("reviews")
    .select(
      "id, rating, title, body, is_approved, created_at, products(name, slug), profiles(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (approved !== undefined) query = query.eq("is_approved", approved);

  const { data, count } = await query;
  return { reviews: (data ?? []) as AdminReview[], count: count ?? 0 };
}

export async function getAdminNewsletter(page = 1, limit = 50) {
  const client = db();
  if (!client) return { subscribers: [] as AdminSubscriber[], count: 0 };

  const { data, count } = await client
    .from("newsletter_subscribers")
    .select("id, email, name, source, is_confirmed, subscribed_at, unsubscribed_at", { count: "exact" })
    .is("unsubscribed_at", null)
    .order("subscribed_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  return { subscribers: (data ?? []) as AdminSubscriber[], count: count ?? 0 };
}

export async function getAdminLowStockVariants() {
  const client = db();
  if (!client) return [] as AdminLowStockVariant[];

  const { data } = await client
    .from("product_variants")
    .select("id, name, sku, stock_quantity, low_stock_threshold, products(id, name, slug)")
    .filter("stock_quantity", "lte", client.rpc ? undefined : 999)
    .order("stock_quantity", { ascending: true })
    .limit(20);

  // Filter in JS: variants where stock <= threshold
  const variants = ((data ?? []) as AdminLowStockVariant[]).filter(
    (v) => v.stock_quantity <= v.low_stock_threshold
  );
  return variants;
}

export async function getAdminCustomers(page = 1, limit = 30) {
  const client = db();
  if (!client) return { customers: [] as AdminCustomer[], count: 0 };

  const { data } = await client
    .from("orders")
    .select("user_id, customer_email, customer_name, total, status, created_at")
    .not("user_id", "is", null)
    .in("status", ["paid", "processing", "shipped", "delivered"]);

  if (!data) return { customers: [] as AdminCustomer[], count: 0 };

  // Aggregate by user_id
  const map = new Map<string, AdminCustomer>();
  for (const order of data as { user_id: string; customer_email: string; customer_name: string; total: number; status: string; created_at: string }[]) {
    const existing = map.get(order.user_id);
    if (existing) {
      existing.order_count += 1;
      existing.total_spend += order.total;
      if (order.created_at > existing.last_order_at) {
        existing.last_order_at = order.created_at;
      }
    } else {
      map.set(order.user_id, {
        user_id: order.user_id,
        email: order.customer_email,
        name: order.customer_name,
        order_count: 1,
        total_spend: order.total,
        last_order_at: order.created_at,
      });
    }
  }

  const customers = Array.from(map.values())
    .sort((a, b) => b.total_spend - a.total_spend);

  const count = customers.length;
  const paginated = customers.slice((page - 1) * limit, page * limit);
  return { customers: paginated, count };
}

export async function getAdminCustomer(userId: string) {
  const client = db();
  if (!client) return null;

  const [profileRes, ordersRes] = await Promise.all([
    client.from("profiles").select("id, full_name, role, created_at").eq("id", userId).single(),
    client.from("orders").select("id, total, status, created_at, customer_email, customer_name, discount_code").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (!profileRes.data) return null;

  const orders = (ordersRes.data ?? []) as AdminCustomerOrder[];
  const totalSpend = orders.filter((o) => !["pending", "cancelled"].includes(o.status)).reduce((s, o) => s + o.total, 0);
  const email = orders[0]?.customer_email ?? "—";

  return {
    profile: profileRes.data as { id: string; full_name: string | null; role: string; created_at: string },
    email,
    orders,
    totalSpend,
  };
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
  product_variants: { stock_quantity: number; low_stock_threshold: number }[];
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

export interface AdminDiscount {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at?: string;
}

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
  products: { name: string; slug: string } | null;
  profiles: { full_name: string | null } | null;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  is_confirmed: boolean;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface AdminLowStockVariant {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  products: { id: string; name: string; slug: string } | null;
}

export interface AdminCustomer {
  user_id: string;
  email: string;
  name: string;
  order_count: number;
  total_spend: number;
  last_order_at: string;
}

export interface AdminCustomerOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_email: string;
  customer_name: string;
  discount_code: string | null;
}

export interface AdminOrderDetail {
  id: string;
  customer_name: string;
  customer_email: string;
  subtotal: number;
  discount: number;
  discount_code: string | null;
  shipping: number;
  tax: number;
  total: number;
  status: string;
  shipping_address: Record<string, string>;
  stripe_payment_intent_id: string | null;
  tracking_number: string | null;
  shipping_carrier: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    product_snapshot: { name?: string; variant_name?: string; image_url?: string };
  }[];
}
