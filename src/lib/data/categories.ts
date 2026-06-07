import { cacheLife, cacheTag } from "next/cache";
import { createServerClient } from "@supabase/ssr";
import type { Database, Category } from "@/types/database";

function publicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("days");
  cacheTag("categories");

  const { data, error } = await publicClient()
    .from("categories")
    .select("*")
    .order("position", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCategory(slug: string): Promise<Category | null> {
  "use cache";
  cacheLife("days");
  cacheTag("categories", `category-${slug}`);

  const { data, error } = await publicClient()
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}
