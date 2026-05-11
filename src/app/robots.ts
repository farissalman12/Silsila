import type { MetadataRoute } from "next";

/**
 * Robots.txt configuration — controls search engine crawling.
 * Allows all crawlers, points to sitemap, blocks admin/dashboard/api.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silsila.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/contribute"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
