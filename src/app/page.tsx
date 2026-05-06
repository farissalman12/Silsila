import Link from "next/link";
import { getHomeStats, getVillageSummaries, getRecentPersons } from "@/lib/data/villages";
import { HomeStatsSection } from "./HomeStats";
import { PersonCard } from "@/components/PersonCard";

export default async function HomePage() {
  const [stats, villages, recentPersons] = await Promise.all([
    getHomeStats(),
    getVillageSummaries(),
    getRecentPersons(8),
  ]);

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(250,199,117,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(29,158,117,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.03),transparent_40%)]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <p className="text-amber-300/80 text-sm font-medium tracking-widest uppercase mb-4 animate-fade-in">
            Hunza Valley · Living Ancestry Archive
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-4 animate-slide-up">
            Silsila
          </h1>

          <p className="text-2xl sm:text-3xl text-amber-200/60 font-serif italic mb-8 animate-slide-up">
            سلسلہ
          </p>

          <p className="max-w-2xl mx-auto text-lg text-stone-300 mb-10 leading-relaxed animate-fade-in">
            Preserving the generational heritage of Hunza Valley communities —
            from Karimabad to Misgar, one family tree at a time.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-8 animate-slide-up">
            <form action="/search" method="get" className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search by name, village, or clan..."
                className="w-full px-5 py-4 pl-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-stone-400 text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          <div className="flex items-center justify-center gap-4 animate-fade-in">
            <Link
              href="/search"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-semibold rounded-lg transition-colors shadow-lg shadow-amber-500/25"
            >
              Explore the Archive
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-medium rounded-lg transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Animated Stats */}
      <HomeStatsSection stats={stats} />

      {/* Villages Grid */}
      <section id="villages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
            Villages of Hunza
          </h2>
          <p className="text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
            Explore documented family trees across the settlements of the Hunza Valley
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {villages.map((village) => (
            <Link
              key={village.id}
              href={`/village/${village.slug}`}
              className="group p-5 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-serif font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {village.name}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  village.documentationStatus === "complete"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : village.documentationStatus === "partial"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                }`}>
                  {village.documentationStatus === "complete" ? "Complete" : village.documentationStatus === "partial" ? "Partial" : "Pending"}
                </span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-1">
                {village.region}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {village.personCount > 0
                  ? `${village.personCount} people · ${village.clanCount} clans`
                  : "Documentation in progress"}
              </p>
              {village.personCount > 0 && (
                <div className="mt-3 w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 dark:bg-amber-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min((village.personCount / 100) * 100, 100)}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      {recentPersons.length > 0 && (
        <section className="bg-stone-50 dark:bg-surface-dark border-t border-b border-stone-200 dark:border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                  Recently Added
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Latest additions to the archive
                </p>
              </div>
              <Link
                href="/search?sort=recent"
                className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentPersons.map((person) => (
                <PersonCard key={person.id} person={person} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">
          Help Preserve Your Family&apos;s Story
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
          Every family has a story worth preserving. Contribute your knowledge of family
          relationships, share old photographs, and help build a lasting record for future generations.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            Start Contributing
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
          >
            Learn More →
          </Link>
        </div>
      </section>
    </div>
  );
}
