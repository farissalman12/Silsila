import { prisma } from "@/lib/prisma";

/**
 * Fetch all persons and relationships for the full network directory view.
 * Groups by village for force-directed clustering.
 */
export async function getNetworkData() {
  const [persons, relationships, villages] = await Promise.all([
    prisma.person.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        fullName: true,
        gender: true,
        birthYear: true,
        isLiving: true,
        verified: true,
        villageId: true,
        village: { select: { name: true, slug: true } },
        clan: { select: { name: true } },
      },
    }),
    prisma.relationship.findMany({
      select: {
        personAId: true,
        personBId: true,
        relationshipType: true,
      },
    }),
    prisma.village.findMany({
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return { persons, relationships, villages };
}
