import { notFound } from "next/navigation";
import Link from "next/link";
import { getVillageBySlug } from "@/lib/data/villages";
import { searchPersons } from "@/lib/data/persons";
import { PersonCard } from "@/components/PersonCard";
import { Badge } from "@/components/ui/Badge";
import { generateVillageJsonLd } from "@/lib/json-ld";
import type { Metadata } from "next";

interface VillagePageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: VillagePageProps): Promise<Metadata> {
  const { name } = await params;
  const village = await getVillageBySlug(name);
  if (!village) return { title: "Village Not Found" };
  return {
    title: village.name,
    description: `Explore the family trees and ancestry records of ${village.name}, ${village.region}. ${village._count.persons} people documented.`,
  };
}

export default async function VillagePage({ params }: VillagePageProps) {
  const { name } = await params;
  const village = await getVillageBySlug(name);
  if (!village) notFound();

  const { persons } = await searchPersons({ village: name, limit: 12 });

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateVillageJsonLd({
              name: village.name,
              region: village.region,
              lat: village.lat ? Number(village.lat) : null,
              lng: village.lng ? Number(village.lng) : null,
              description: village.historicalNotes,
              url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://silsila.app"}/village/${village.slug}`,
            })
          ),
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-800 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-2 mb-3">
            <Link href="/" className="text-stone-400 hover:text-stone-300 text-sm">Home</Link>
            <span className="text-stone-600">/</span>
            <span className="text-stone-300 text-sm">Village</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-3">{village.name}</h1>
          <p className="text-stone-400 text-lg mb-6">{village.region}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-2xl font-serif font-bold text-amber-400">{village._count.persons}</p>
              <p className="text-sm text-stone-400">People</p>
            </div>
            <div>
              <p className="text-2xl font-serif font-bold text-amber-400">{village._count.clans}</p>
              <p className="text-sm text-stone-400">Clans</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                village.documentationStatus === "complete" ? "success"
                : village.documentationStatus === "partial" ? "warning"
                : "default"
              }>
                {village.documentationStatus === "complete" ? "Complete" : village.documentationStatus === "partial" ? "Partial" : "Pending"}
              </Badge>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Documentation Progress</span>
              <span>{Math.min(Math.round((village._count.persons / 100) * 100), 100)}%</span>
            </div>
            <div className="w-full bg-stone-700 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((village._count.persons / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Historical Notes */}
        {village.historicalNotes && (
          <section className="mb-12">
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">History</h2>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed max-w-3xl">
              {village.historicalNotes}
            </p>
          </section>
        )}

        {/* Clans in this village */}
        {village.clans.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Clans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {village.clans.map((clan) => (
                <Link
                  key={clan.id}
                  href={`/clan/${clan.slug}`}
                  className="p-4 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md transition-all group"
                >
                  <h3 className="font-serif font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 mb-1">
                    {clan.name}
                  </h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {clan._count.persons} members
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* People from this village */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">People</h2>
            <Link
              href={`/search?village=${name}`}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {persons.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
