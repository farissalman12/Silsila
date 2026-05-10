import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/contributions/[id]/review — Approve or reject a contribution
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { status, notes, reviewedBy } = body;

  if (!["approved", "rejected", "changes_requested"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Get default admin if not provided
  const reviewerId = reviewedBy || (await getDefaultAdmin());
  if (!reviewerId) {
    return NextResponse.json({ error: "No admin found" }, { status: 400 });
  }

  const contribution = await prisma.contribution.update({
    where: { id },
    data: {
      status,
      reviewNotes: notes || null,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    },
  });

  // If approved and it's a person, mark as verified
  if (status === "approved" && contribution.personId) {
    await prisma.person.update({
      where: { id: contribution.personId },
      data: { verified: true },
    });
  }

  return NextResponse.json({ success: true, contribution });
}

async function getDefaultAdmin(): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { role: { in: ["super_admin", "village_admin"] } },
    select: { id: true },
  });
  return user?.id ?? null;
}
