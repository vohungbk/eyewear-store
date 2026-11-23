import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block filtered/sorted/paginated catalog URLs (any query string) so
        // crawlers do not hit every filter combination.
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/checkout",
          "/*?*",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
