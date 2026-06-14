import { cacheLife, cacheTag } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import type {
  Database,
  ProductWithImages,
  ProductWithVariants,
} from "@/types/database";

// Stateless client for public cached data (no cookies / auth context needed)
function publicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export interface GetProductsOptions {
  categoryId?: string;
  search?: string;
  featured?: boolean;
  sort?: "newest" | "price_asc" | "price_desc";
  priceMin?: number;
  priceMax?: number;
  limit?: number;
  offset?: number;
}

export async function getProducts(options: GetProductsOptions = {}): Promise<{
  products: ProductWithImages[];
  total: number;
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag("products");

  const {
    categoryId,
    search,
    featured,
    sort = "newest",
    priceMin,
    priceMax,
    limit = 12,
    offset = 0,
  } = options;

  let query = publicClient()
    .from("products")
    .select(
      `*, product_images (id, url, alt_text, position, is_primary), categories (id, name, slug)`,
      { count: "exact" }
    )
    .eq("is_active", true);

  if (featured) query = query.eq("is_featured", true);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (search) {
    query = query.textSearch("search_vector", search, { type: "websearch" });
  }
  if (priceMin !== undefined) query = query.gte("price", priceMin);
  if (priceMax !== undefined) query = query.lte("price", priceMax);

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);

  return { products: (data ?? []) as unknown as ProductWithImages[], total: count ?? 0 };
}

export async function getProduct(
  slug: string
): Promise<ProductWithVariants | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-${slug}`, "products");

  const { data, error } = await publicClient()
    .from("products")
    .select(
      `*, product_images (id, url, alt_text, position, is_primary), product_variants (id, name, sku, price_modifier, stock_quantity, attributes), categories (id, name, slug)`
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as unknown as ProductWithVariants;
}

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductWithImages[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products", "featured-products");

  const { products } = await getProducts({ featured: true, limit });
  return products;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<ProductWithImages[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("products");

  const sb = publicClient();
  let query = sb
    .from("products")
    .select(
      `*, product_images (id, url, alt_text, position, is_primary), categories (id, name, slug)`
    )
    .eq("is_active", true)
    .neq("id", productId)
    .limit(limit);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query;
  return (data ?? []) as unknown as ProductWithImages[];
}
