import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/contributions — Submit a new contribution
 * GET  /api/contributions — List contributions (filtered by status)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, personData, relationshipData, sourceData, submittedBy } = body;

    // For now, use a default user if no auth
    const userId = submittedBy || (await getDefaultContributor());
    if (!userId) {
      return NextResponse.json({ error: "No contributor found" }, { status: 400 });
    }

    let personId: string | undefined;
    let entityType: string = "person";

    if (action === "new_person" && personData) {
      // Create the person
      const person = await prisma.person.create({
        data: {
          fullName: personData.fullName,
          gender: personData.gender || "unknown",
          birthYear: personData.birthYear ? parseInt(personData.birthYear) : null,
          deathYear: personData.deathYear ? parseInt(personData.deathYear) : null,
          birthPlace: personData.birthPlace || null,
          isLiving: personData.isLiving ?? true,
          villageId: personData.villageId || undefined,
          clanId: personData.clanId || undefined,
          bio: personData.bio || null,
          verified: false,
          privacyLevel: personData.isLiving ? "family" : "public",
          addedById: userId,
        },
      });
      personId = person.id;

      // Create relationship if provided
      if (relationshipData?.relatedPersonId && relationshipData?.relationshipType) {
        await prisma.relationship.create({
          data: {
            personAId: relationshipData.direction === "child" ? relationshipData.relatedPersonId : person.id,
            personBId: relationshipData.direction === "child" ? person.id : relationshipData.relatedPersonId,
            relationshipType: relationshipData.relationshipType === "spouse" ? "spouse" : "parent",
          },
        });
      }
    } else if (action === "add_relationship" && relationshipData) {
      entityType = "relationship";
      personId = relationshipData.personAId;

      await prisma.relationship.create({
        data: {
          personAId: relationshipData.personAId,
          personBId: relationshipData.personBId,
          relationshipType: relationshipData.relationshipType,
        },
      });
    } else if (action === "edit" && personData?.personId) {
      personId = personData.personId;
      await prisma.person.update({
        where: { id: personData.personId },
        data: {
          fullName: personData.fullName || undefined,
          bio: personData.bio || undefined,
          birthYear: personData.birthYear ? parseInt(personData.birthYear) : undefined,
        },
      });
    }

    // Create source citation
    if (sourceData?.title && personId) {
      await prisma.source.create({
        data: {
          title: sourceData.title,
          type: sourceData.type || "oral",
          personId,
          reliabilityScore: sourceData.reliability ? parseInt(sourceData.reliability) : 3,
          addedById: userId,
        },
      });
    }

    // Log the contribution
    const contribution = await prisma.contribution.create({
      data: {
        submittedBy: userId,
        entityType,
        entityId: personId || "unknown",
        personId: personId || undefined,
        action: action === "new_person" ? "create" : "update",
        changeData: JSON.stringify({ action, personData, relationshipData, sourceData }),
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, contributionId: contribution.id, personId });
  } catch (err) {
    console.error("Contribution error:", err);
    return NextResponse.json({ error: "Failed to submit contribution" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [contributions, total] = await Promise.all([
    prisma.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        submitter: { select: { name: true, email: true } },
        reviewer: { select: { name: true } },
        person: { select: { id: true, fullName: true } },
      },
    }),
    prisma.contribution.count({ where }),
  ]);

  return NextResponse.json({ contributions, total, page, totalPages: Math.ceil(total / limit) });
}

async function getDefaultContributor(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { role: "contributor" },
    select: { id: true },
  });
  return user?.id ?? null;
}
