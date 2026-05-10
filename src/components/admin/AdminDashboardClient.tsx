"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface Contribution {
  id: string;
  entityType: string;
  action: string;
  status: string;
  changeData: string;
  createdAt: string;
  reviewNotes: string | null;
  reviewedAt: string | null;
  submitter: { name: string; email: string } | null;
  reviewer: { name: string } | null;
  person: { id: string; fullName: string } | null;
}

interface AdminDashboardClientProps {
  stats: {
    totalPersons: number;
    totalRelationships: number;
    totalVillages: number;
    pendingContributions: number;
  };
  contributions: Contribution[];
  villageStats: { name: string; slug: string; personCount: number }[];
}

export function AdminDashboardClient({ stats, contributions, villageStats }: AdminDashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [contribs, setContribs] = useState(contributions);

  const filtered = statusFilter === "all"
    ? contribs
    : contribs.filter((c) => c.status === statusFilter);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setReviewingId(id);
    try {
      const res = await fetch(`/api/contributions/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setContribs((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status, reviewedAt: new Date().toISOString() } : c))
        );
      }
    } finally {
      setReviewingId(null);
    }
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "pending": return "warning";
      case "approved": return "success";
      case "rejected": return "error";
      default: return "stone";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">Admin Dashboard</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Manage the Silsila ancestry archive</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total People", value: stats.totalPersons, icon: "👤" },
          { label: "Relationships", value: stats.totalRelationships, icon: "🔗" },
          { label: "Villages", value: stats.totalVillages, icon: "🏘️" },
          { label: "Pending Reviews", value: stats.pendingContributions, icon: "⏳", highlight: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`p-5 rounded-card border ${
              stat.highlight && stat.value > 0
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : "bg-white dark:bg-card-dark border-stone-200 dark:border-stone-800"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              {stat.highlight && stat.value > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{stat.value}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contributions Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <div className="p-5 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                Contribution Queue
              </h2>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-0.5">
                {["all", "pending", "approved", "rejected"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                      statusFilter === s
                        ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "text-stone-500 dark:text-stone-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-stone-400 dark:text-stone-500 text-sm">No contributions matching this filter</p>
              </div>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {filtered.map((c) => (
                  <li key={c.id} className="p-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={statusVariant(c.status) as "warning" | "success" | "error" | "stone"} size="sm">
                            {c.status}
                          </Badge>
                          <Badge variant="stone" size="sm">{c.action}</Badge>
                          <span className="text-xs text-stone-400 dark:text-stone-500">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-stone-900 dark:text-stone-100 mt-1.5">
                          {c.person ? (
                            <Link href={`/person/${c.person.id}`} className="hover:text-amber-600 transition-colors">
                              {c.person.fullName}
                            </Link>
                          ) : (
                            <span className="text-stone-500">Unknown entity</span>
                          )}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                          by {c.submitter?.name || c.submitter?.email || "Unknown"}
                          {c.reviewer && ` · Reviewed by ${c.reviewer.name}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {c.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleReview(c.id, "approved")}
                              disabled={reviewingId === c.id}
                              className="px-2.5 py-1 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(c.id, "rejected")}
                              disabled={reviewingId === c.id}
                              className="px-2.5 py-1 text-xs font-medium bg-red-500 hover:bg-red-600 text-white rounded-md disabled:opacity-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                          className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                          aria-label="View details"
                        >
                          <svg className={`w-4 h-4 transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded diff view */}
                    {expandedId === c.id && (
                      <div className="mt-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                        <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                          Change Data
                        </h4>
                        <pre className="text-xs text-stone-700 dark:text-stone-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(c.changeData), null, 2);
                            } catch {
                              return c.changeData;
                            }
                          })()}
                        </pre>
                        {c.reviewNotes && (
                          <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                            <p className="text-xs text-stone-500">
                              <strong>Review notes:</strong> {c.reviewNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Village breakdown sidebar */}
        <aside className="space-y-6">
          <div className="p-5 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">
              Records by Village
            </h3>
            <ul className="space-y-3">
              {villageStats.map((v) => (
                <li key={v.slug} className="flex items-center justify-between">
                  <Link href={`/village/${v.slug}`} className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
                    {v.name}
                  </Link>
                  <span className="text-sm font-mono text-stone-500 dark:text-stone-400">{v.personCount}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-card border border-amber-200 dark:border-amber-800">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/search" className="block text-sm text-amber-700 dark:text-amber-400 hover:underline">→ Search Records</Link>
              <Link href="/directory" className="block text-sm text-amber-700 dark:text-amber-400 hover:underline">→ Network Directory</Link>
              <Link href="/contribute" className="block text-sm text-amber-700 dark:text-amber-400 hover:underline">→ Submit Contribution</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
