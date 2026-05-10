import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administration dashboard for the Silsila ancestry archive.",
};

export default async function AdminPage() {
  const [
    totalPersons,
    totalRelationships,
    totalVillages,
    pendingContributions,
    recentContributions,
    villageStats,
  ] = await Promise.all([
    prisma.person.count({ where: { deletedAt: null } }),
    prisma.relationship.count(),
    prisma.village.count(),
    prisma.contribution.count({ where: { status: "pending" } }),
    prisma.contribution.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        submitter: { select: { name: true, email: true } },
        reviewer: { select: { name: true } },
        person: { select: { id: true, fullName: true } },
      },
    }),
    prisma.village.findMany({
      select: {
        name: true,
        slug: true,
        _count: { select: { persons: { where: { deletedAt: null } } } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminDashboardClient
      stats={{ totalPersons, totalRelationships, totalVillages, pendingContributions }}
      contributions={recentContributions.map((c) => ({
        id: c.id,
        entityType: c.entityType,
        action: c.action,
        status: c.status,
        changeData: c.changeData,
        createdAt: c.createdAt.toISOString(),
        reviewNotes: c.reviewNotes,
        reviewedAt: c.reviewedAt?.toISOString() || null,
        submitter: c.submitter ? { name: c.submitter.name || "Unknown", email: c.submitter.email } : null,
        reviewer: c.reviewer ? { name: c.reviewer.name || "Unknown" } : null,
        person: c.person ? { id: c.person.id, fullName: c.person.fullName } : null,
      }))}
      villageStats={villageStats.map((v) => ({
        name: v.name,
        slug: v.slug,
        personCount: v._count.persons,
      }))}
    />
  );
}
