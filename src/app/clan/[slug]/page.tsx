import { notFound } from "next/navigation";
import Link from "next/link";
import { getClanBySlug, getClanMembers } from "@/lib/data/clans";
import { PersonCard } from "@/components/PersonCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatLifeSpan } from "@/lib/utils";
import type { Metadata } from "next";

interface ClanPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ClanPageProps): Promise<Metadata> {
  const { slug } = await params;
  const clan = await getClanBySlug(slug);
  if (!clan) return { title: "Clan Not Found" };
  return {
    title: `${clan.name} Clan`,
    description: `History and family tree of the ${clan.name} clan from ${clan.village?.name || "Hunza Valley"}. ${clan._count.persons} members documented.`,
  };
}

export default async function ClanPage({ params }: ClanPageProps) {
  const { slug } = await params;
  const clan = await getClanBySlug(slug);
  if (!clan) notFound();

  const { persons } = await getClanMembers(clan.id, 1, 20);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900/90 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <Link href="/" className="text-stone-400 hover:text-stone-300">Home</Link>
            <span className="text-stone-600">/</span>
            {clan.village && (
              <>
                <Link href={`/village/${clan.village.slug}`} className="text-stone-400 hover:text-stone-300">
                  {clan.village.name}
                </Link>
                <span className="text-stone-600">/</span>
              </>
            )}
            <span className="text-stone-300">Clan</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-2">{clan.name}</h1>
          <div className="flex items-center gap-3 mb-6">
            {clan.village && <Badge variant="stone">{clan.village.name}</Badge>}
            <span className="text-stone-400">{clan._count.persons} members</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Origin Story */}
            {clan.originStory && (
              <section>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">Origin Story</h2>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  {clan.originStory}
                </p>
              </section>
            )}

            {/* Members */}
            <section>
              <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">
                Members ({clan._count.persons})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {persons.map((person) => (
                  <PersonCard key={person.id} person={{ ...person, clan: { name: clan.name, slug: clan.slug } }} />
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Founding Ancestor */}
            {clan.foundingAncestor && (
              <div className="p-5 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                  Founding Ancestor
                </h3>
                <Link href={`/person/${clan.foundingAncestor.id}`} className="flex items-center gap-3 group">
                  <Avatar
                    name={clan.foundingAncestor.fullName}
                    src={clan.foundingAncestor.photoUrl}
                    gender={clan.foundingAncestor.gender as "male" | "female" | "unknown"}
                    size="lg"
                  />
                  <div>
                    <p className="font-serif font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {clan.foundingAncestor.fullName}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {formatLifeSpan(clan.foundingAncestor.birthYear, clan.foundingAncestor.deathYear, clan.foundingAncestor.isLiving)}
                    </p>
                  </div>
                </Link>
              </div>
            )}

            {/* Village */}
            {clan.village && (
              <div className="p-5 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
                <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                  Village
                </h3>
                <Link
                  href={`/village/${clan.village.slug}`}
                  className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium"
                >
                  {clan.village.name} →
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
