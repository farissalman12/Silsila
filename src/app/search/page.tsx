import { Suspense } from "react";
import { searchPersons } from "@/lib/data/persons";
import { getVillages } from "@/lib/data/villages";
import { PersonCard } from "@/components/PersonCard";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export const metadata = {
  title: "Search the Archive",
  description: "Search people, villages, and clans in the Hunza Valley ancestry archive.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-6">
        Search the Archive
      </h1>

      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults params={params} />
      </Suspense>
    </div>
  );
}

async function SearchResults({ params }: { params: Record<string, string | undefined> }) {
  const q = params.q || "";
  const village = params.village || "";
  const gender = params.gender || "";
  const living = params.living || "";
  const verified = params.verified || "";
  const page = parseInt(params.page || "1", 10);

  const [results, villages] = await Promise.all([
    searchPersons({ q, village, gender, living, verified, page, limit: 20 }),
    getVillages(),
  ]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filter Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <form method="get" action="/search" className="space-y-5 p-4 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Search</label>
            <input
              type="text" name="q" defaultValue={q}
              placeholder="Name..."
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Village filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Village</label>
            <select
              name="village" defaultValue={village}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
            >
              <option value="">All villages</option>
              {villages.map((v) => (
                <option key={v.id} value={v.slug}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Gender filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Gender</label>
            <select
              name="gender" defaultValue={gender}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
            >
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Living filter */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5">Status</label>
            <select
              name="living" defaultValue={living}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none text-stone-900 dark:text-stone-100"
            >
              <option value="">All</option>
              <option value="true">Living</option>
              <option value="false">Deceased</option>
            </select>
          </div>

          {/* Verified filter */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox" name="verified" value="true" id="verified-filter"
              defaultChecked={verified === "true"}
              className="w-4 h-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
            />
            <label htmlFor="verified-filter" className="text-sm text-stone-700 dark:text-stone-300">
              Verified only
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            Search
          </button>
        </form>
      </aside>

      {/* Results */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {results.total > 0
              ? `Showing ${(results.page - 1) * results.limit + 1}–${Math.min(results.page * results.limit, results.total)} of ${results.total} results`
              : "No results found"}
            {q && <span className="font-medium text-stone-700 dark:text-stone-300"> for &ldquo;{q}&rdquo;</span>}
          </p>
        </div>

        {results.persons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <svg className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-serif font-semibold text-stone-700 dark:text-stone-300 mb-2">
              No results found
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Try broadening your search or adjusting the filters. You can also{" "}
              <Link href="/auth/register" className="text-amber-600 hover:underline">contribute a new record</Link>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {results.persons.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>

            {/* Pagination */}
            {results.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
                {Array.from({ length: results.totalPages }, (_, i) => i + 1).map((p) => {
                  const searchParams = new URLSearchParams();
                  if (q) searchParams.set("q", q);
                  if (village) searchParams.set("village", village);
                  if (gender) searchParams.set("gender", gender);
                  if (living) searchParams.set("living", living);
                  if (verified) searchParams.set("verified", verified);
                  searchParams.set("page", p.toString());

                  return (
                    <Link
                      key={p}
                      href={`/search?${searchParams.toString()}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-amber-500 text-white"
                          : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                      }`}
                      aria-current={p === page ? "page" : undefined}
                    >
                      {p}
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-64"><Skeleton height="320px" variant="rectangular" /></div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="100px" variant="rectangular" />
        ))}
      </div>
    </div>
  );
}
