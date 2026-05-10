import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your contributions and activity on the Silsila ancestry archive.",
};

export default async function DashboardPage() {
  // Get the first contributor user for demo purposes (would use auth session in prod)
  const user = await prisma.user.findFirst({
    where: { role: "contributor" },
    select: { id: true, name: true, email: true, role: true },
  });

  const contributions = user
    ? await prisma.contribution.findMany({
        where: { submittedBy: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          person: { select: { id: true, fullName: true } },
          reviewer: { select: { name: true } },
        },
      })
    : [];

  const stats = user
    ? {
        total: await prisma.contribution.count({ where: { submittedBy: user.id } }),
        approved: await prisma.contribution.count({ where: { submittedBy: user.id, status: "approved" } }),
        pending: await prisma.contribution.count({ where: { submittedBy: user.id, status: "pending" } }),
        rejected: await prisma.contribution.count({ where: { submittedBy: user.id, status: "rejected" } }),
      }
    : { total: 0, approved: 0, pending: 0, rejected: 0 };

  const statusVariant = (s: string): "warning" | "success" | "error" | "stone" => {
    switch (s) {
      case "pending": return "warning";
      case "approved": return "success";
      case "rejected": return "error";
      default: return "stone";
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} className="mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
            My Dashboard
          </h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">
            Welcome back, {user?.name || user?.email || "Contributor"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/contribute"
            className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
          >
            + New Contribution
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 text-sm font-medium border border-stone-300 dark:border-stone-600 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", value: stats.total, color: "bg-stone-100 dark:bg-stone-800" },
          { label: "Approved", value: stats.approved, color: "bg-green-50 dark:bg-green-900/20" },
          { label: "Pending", value: stats.pending, color: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-50 dark:bg-red-900/20" },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-card border border-stone-200 dark:border-stone-800 ${s.color}`}>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{s.value}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Contributions List */}
      <div className="bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
        <div className="p-5 border-b border-stone-200 dark:border-stone-700">
          <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">My Contributions</h2>
        </div>

        {contributions.length === 0 ? (
          <div className="p-10 text-center">
            <svg className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">No contributions yet</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Start by adding a family member to the archive.</p>
            <Link href="/contribute" className="inline-block mt-4 px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-lg">
              Make Your First Contribution
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {contributions.map((c) => (
              <li key={c.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={statusVariant(c.status)} size="sm">
                        {c.status}
                      </Badge>
                      <Badge variant="stone" size="sm">{c.action}</Badge>
                      <Badge variant="teal" size="sm">{c.entityType}</Badge>
                    </div>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {c.person ? (
                        <Link href={`/person/${c.person.id}`} className="hover:text-amber-600 transition-colors">
                          {c.person.fullName}
                        </Link>
                      ) : (
                        "Unknown entity"
                      )}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      Submitted {new Date(c.createdAt).toLocaleDateString()}
                      {c.reviewer && ` · Reviewed by ${c.reviewer.name}`}
                    </p>
                  </div>
                  {c.person && (
                    <Link
                      href={`/person/${c.person.id}`}
                      className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium flex-shrink-0"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
