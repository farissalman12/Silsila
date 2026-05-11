import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Dynamic sitemap generator — lists all indexable pages.
 * Includes: static pages, villages, clans, persons (public only).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silsila.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/directory`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/auth/signin`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/auth/register`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Village pages
  const villages = await prisma.village.findMany({ select: { slug: true, createdAt: true } });
  const villagePages: MetadataRoute.Sitemap = villages.map((v) => ({
    url: `${baseUrl}/village/${v.slug}`,
    lastModified: v.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Clan pages
  const clans = await prisma.clan.findMany({ select: { slug: true, createdAt: true } });
  const clanPages: MetadataRoute.Sitemap = clans.map((c) => ({
    url: `${baseUrl}/clan/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Person pages (public, non-deleted only — privacy-respecting)
  const persons = await prisma.person.findMany({
    where: {
      deletedAt: null,
      privacyLevel: "public",
    },
    select: { id: true, updatedAt: true },
  });
  const personPages: MetadataRoute.Sitemap = persons.map((p) => ({
    url: `${baseUrl}/person/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Tree pages for each person
  const treePages: MetadataRoute.Sitemap = persons.map((p) => ({
    url: `${baseUrl}/tree/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...villagePages, ...clanPages, ...personPages, ...treePages];
}
