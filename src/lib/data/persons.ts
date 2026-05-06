import { prisma } from "@/lib/prisma";

export interface PersonSearchParams {
  q?: string;
  village?: string;
  gender?: string;
  living?: string;
  verified?: string;
  page?: number;
  limit?: number;
}

/** Search persons with filters and pagination */
export async function searchPersons(params: PersonSearchParams) {
  const { q, village, gender, living, verified, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Record<string, unknown> = { deletedAt: null };

  if (q && q.trim()) {
    where.fullName = { contains: q.trim() };
  }

  if (village) {
    where.village = { slug: village };
  }

  if (gender && gender !== "all") {
    where.gender = gender;
  }

  if (living === "true") {
    where.isLiving = true;
  } else if (living === "false") {
    where.isLiving = false;
  }

  if (verified === "true") {
    where.verified = true;
  }

  const [persons, total] = await Promise.all([
    prisma.person.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ verified: "desc" }, { fullName: "asc" }],
      include: {
        village: { select: { name: true, slug: true } },
        clan: { select: { name: true, slug: true } },
      },
    }),
    prisma.person.count({ where }),
  ]);

  return {
    persons,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/** Get a single person by ID with full relations */
export async function getPersonById(id: string) {
  return prisma.person.findUnique({
    where: { id, deletedAt: null },
    include: {
      village: true,
      clan: true,
      mediaItems: { orderBy: { year: "asc" } },
      sources: { orderBy: { createdAt: "desc" } },
      relationshipsAsA: {
        include: {
          personB: {
            select: {
              id: true, fullName: true, gender: true,
              birthYear: true, deathYear: true, isLiving: true,
              photoUrl: true, villageId: true,
              village: { select: { name: true, slug: true } },
            },
          },
        },
      },
      relationshipsAsB: {
        include: {
          personA: {
            select: {
              id: true, fullName: true, gender: true,
              birthYear: true, deathYear: true, isLiving: true,
              photoUrl: true, villageId: true,
              village: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });
}

/** Get related people organized by relationship type */
export function organizeRelationships(person: NonNullable<Awaited<ReturnType<typeof getPersonById>>>) {
  const parents: typeof person.relationshipsAsB[0]["personA"][] = [];
  const children: typeof person.relationshipsAsA[0]["personB"][] = [];
  const spouses: typeof person.relationshipsAsA[0]["personB"][] = [];
  const siblings: typeof person.relationshipsAsA[0]["personB"][] = [];

  // As person_a (parent of, spouse of, sibling of)
  for (const rel of person.relationshipsAsA) {
    if (rel.relationshipType === "parent") children.push(rel.personB);
    else if (rel.relationshipType === "spouse") spouses.push(rel.personB);
    else if (rel.relationshipType === "sibling") siblings.push(rel.personB);
  }

  // As person_b (child of, spouse of, sibling of)
  for (const rel of person.relationshipsAsB) {
    if (rel.relationshipType === "parent") parents.push(rel.personA);
    else if (rel.relationshipType === "spouse") spouses.push(rel.personA);
    else if (rel.relationshipType === "sibling") siblings.push(rel.personA);
  }

  return { parents, children, spouses, siblings };
}
