import { prisma } from "@/lib/prisma";

/** Fetch a clan by slug with members and founding ancestor */
export async function getClanBySlug(slug: string) {
  return prisma.clan.findUnique({
    where: { slug },
    include: {
      village: true,
      foundingAncestor: {
        select: {
          id: true, fullName: true, gender: true,
          birthYear: true, deathYear: true, isLiving: true, photoUrl: true,
        },
      },
      _count: { select: { persons: true } },
    },
  });
}

/** Fetch all clans with basic stats */
export async function getAllClans() {
  return prisma.clan.findMany({
    include: {
      village: { select: { name: true, slug: true } },
      _count: { select: { persons: true } },
    },
    orderBy: { name: "asc" },
  });
}

/** Fetch members of a clan with pagination */
export async function getClanMembers(clanId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [persons, total] = await Promise.all([
    prisma.person.findMany({
      where: { clanId, deletedAt: null },
      skip,
      take: limit,
      orderBy: { birthYear: "asc" },
      include: {
        village: { select: { name: true, slug: true } },
      },
    }),
    prisma.person.count({ where: { clanId, deletedAt: null } }),
  ]);
  return { persons, total, page, totalPages: Math.ceil(total / limit) };
}
