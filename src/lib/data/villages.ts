import { prisma } from "@/lib/prisma";

/** Fetch all villages with person/clan counts */
export async function getVillages() {
  const villages = await prisma.village.findMany({
    include: {
      _count: { select: { persons: true, clans: true } },
    },
    orderBy: { name: "asc" },
  });
  return villages;
}

/** Fetch a single village by slug with stats */
export async function getVillageBySlug(slug: string) {
  const village = await prisma.village.findUnique({
    where: { slug },
    include: {
      clans: { include: { _count: { select: { persons: true } } } },
      _count: { select: { persons: true, clans: true } },
    },
  });
  return village;
}

/** Fetch home page stats */
export async function getHomeStats() {
  const [personCount, villageCount, clanCount, maxGen] = await Promise.all([
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.village.count(),
    prisma.clan.count(),
    prisma.person.findFirst({
      where: { deletedAt: null },
      orderBy: { birthYear: "asc" },
      select: { birthYear: true },
    }),
  ]);

  // Estimate generation depth from year range
  const oldestYear = maxGen?.birthYear || 1900;
  const generationDepth = Math.ceil((new Date().getFullYear() - oldestYear) / 25);

  return { personCount, villageCount, clanCount, generationDepth };
}

/** Fetch recently added persons */
export async function getRecentPersons(limit = 10) {
  return prisma.person.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      village: { select: { name: true, slug: true } },
      clan: { select: { name: true, slug: true } },
    },
  });
}

/** Fetch village summary for cards (used on home page) */
export async function getVillageSummaries() {
  const villages = await prisma.village.findMany({
    include: {
      _count: { select: { persons: true, clans: true } },
    },
    orderBy: { name: "asc" },
  });

  return villages.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    region: v.region,
    documentationStatus: v.documentationStatus,
    personCount: v._count.persons,
    clanCount: v._count.clans,
  }));
}
