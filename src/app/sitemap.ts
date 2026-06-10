import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ products }, categories] = await Promise.all([
    getProducts({ limit: 500 }),
    getCategories(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "daily" },
    { url: `${BASE}/products`, priority: 0.9, changeFrequency: "daily" },
    { url: `${BASE}/pages/faq`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/shipping`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/sizing`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/contact`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/about`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/pages/privacy`, priority: 0.3, changeFrequency: "yearly" },
    { url: `${BASE}/pages/terms`, priority: 0.3, changeFrequency: "yearly" },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE}/collections/${c.slug}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE}/products/${p.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
