import { notFound } from "next/navigation";
import Link from "next/link";
import { getPersonById, organizeRelationships } from "@/lib/data/persons";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { formatLifeSpan, formatYear } from "@/lib/utils";
import type { Metadata } from "next";

interface PersonPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const { id } = await params;
  const person = await getPersonById(id);
  if (!person) return { title: "Person Not Found" };
  return {
    title: person.fullName,
    description: `${person.fullName} — ${formatLifeSpan(person.birthYear, person.deathYear, person.isLiving)}. ${person.village?.name || "Hunza Valley"} genealogy record.`,
  };
}

export default async function PersonPage({ params }: PersonPageProps) {
  const { id } = await params;
  const person = await getPersonById(id);
  if (!person) notFound();

  const relationships = organizeRelationships(person);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    ...(person.village ? [{ label: person.village.name, href: `/village/${person.village.slug}` }] : []),
    ...(person.clan ? [{ label: person.clan.name, href: `/clan/${person.clan.slug}` }] : []),
    { label: person.fullName },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-5">
              <Avatar
                name={person.fullName}
                src={person.photoUrl}
                gender={person.gender as "male" | "female" | "unknown"}
                size="xl"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
                    {person.fullName}
                  </h1>
                  {person.verified && (
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {person.birthName && person.birthName !== person.fullName && (
                  <p className="text-sm text-stone-500 dark:text-stone-400 italic mb-2">
                    Birth name: {person.birthName}
                  </p>
                )}

                <p className="text-stone-600 dark:text-stone-400 mb-3">
                  {formatLifeSpan(person.birthYear, person.deathYear, person.isLiving, person.birthYearApproximate)}
                </p>

                <div className="flex flex-wrap gap-2">
                  {person.gender !== "unknown" && (
                    <Badge variant={person.gender === "male" ? "blue" : "pink"}>
                      {person.gender === "male" ? "Male" : "Female"}
                    </Badge>
                  )}
                  {person.isLiving && <Badge variant="success">Living</Badge>}
                  {person.village && (
                    <Link href={`/village/${person.village.slug}`}>
                      <Badge variant="stone">{person.village.name}</Badge>
                    </Link>
                  )}
                  {person.clan && (
                    <Link href={`/clan/${person.clan.slug}`}>
                      <Badge variant="amber">{person.clan.name}</Badge>
                    </Link>
                  )}
                </div>

                {/* View Tree CTA */}
                <Link
                  href={`/tree/${person.id}`}
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  View Family Tree
                </Link>
              </div>
            </div>

            {/* Bio */}
            {person.bio && (
              <div className="mt-5 pt-5 border-t border-stone-200 dark:border-stone-700">
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">{person.bio}</p>
              </div>
            )}
          </section>

          {/* Vital Records */}
          <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Vital Records</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <VitalRow label="Birth Year" value={formatYear(person.birthYear, person.birthYearApproximate)} />
              <VitalRow label="Birth Place" value={person.birthPlace || "—"} />
              {!person.isLiving && (
                <>
                  <VitalRow label="Death Year" value={formatYear(person.deathYear)} />
                  <VitalRow label="Death Place" value={person.deathPlace || "—"} />
                </>
              )}
              <VitalRow label="Village" value={person.village?.name || "—"} />
              <VitalRow label="Clan" value={person.clan?.name || "—"} />
              <VitalRow label="Status" value={person.isLiving ? "Living" : "Deceased"} />
              <VitalRow label="Privacy" value={person.privacyLevel} />
            </dl>
          </section>

          {/* Family: Parents */}
          {relationships.parents.length > 0 && (
            <RelationshipSection title="Parents" people={relationships.parents} />
          )}

          {/* Family: Spouses */}
          {relationships.spouses.length > 0 && (
            <RelationshipSection title="Spouse(s)" people={relationships.spouses} />
          )}

          {/* Family: Children */}
          {relationships.children.length > 0 && (
            <RelationshipSection title="Children" people={relationships.children} />
          )}

          {/* Family: Siblings */}
          {relationships.siblings.length > 0 && (
            <RelationshipSection title="Siblings" people={relationships.siblings} />
          )}

          {/* Sources */}
          {person.sources.length > 0 && (
            <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">Sources</h2>
              <ul className="space-y-3">
                {person.sources.map((source) => (
                  <li key={source.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        {source.type.slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{source.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="stone" size="sm">{source.type}</Badge>
                        {source.reliabilityScore && (
                          <span className="text-xs text-stone-500 dark:text-stone-400">
                            Reliability: {source.reliabilityScore}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Quick Facts */}
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 rounded-card border border-amber-200 dark:border-amber-800">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-3">
              Quick Facts
            </h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-amber-700 dark:text-amber-400">Parents</dt>
                <dd className="font-medium text-amber-900 dark:text-amber-200">{relationships.parents.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700 dark:text-amber-400">Spouses</dt>
                <dd className="font-medium text-amber-900 dark:text-amber-200">{relationships.spouses.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700 dark:text-amber-400">Children</dt>
                <dd className="font-medium text-amber-900 dark:text-amber-200">{relationships.children.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700 dark:text-amber-400">Sources</dt>
                <dd className="font-medium text-amber-900 dark:text-amber-200">{person.sources.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700 dark:text-amber-400">Media</dt>
                <dd className="font-medium text-amber-900 dark:text-amber-200">{person.mediaItems.length}</dd>
              </div>
            </dl>
          </div>

          {/* Media */}
          {person.mediaItems.length > 0 && (
            <div className="p-5 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
              <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
                Media ({person.mediaItems.length})
              </h3>
              <ul className="space-y-2">
                {person.mediaItems.map((media) => (
                  <li key={media.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={media.type === "photo" ? "blue" : media.type === "document" ? "amber" : "teal"} size="sm">
                        {media.type}
                      </Badge>
                      <span className="text-stone-600 dark:text-stone-400 truncate">{media.caption || "Untitled"}</span>
                    </div>
                    {media.year && <span className="text-xs text-stone-400 dark:text-stone-500 ml-12">{media.year}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function VitalRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm text-stone-900 dark:text-stone-100 mt-0.5">{value}</dd>
    </div>
  );
}

interface RelatedPerson {
  id: string;
  fullName: string;
  gender: string;
  birthYear: number | null;
  deathYear: number | null;
  isLiving: boolean;
  photoUrl: string | null;
  village?: { name: string; slug: string } | null;
}

function RelationshipSection({ title, people }: { title: string; people: RelatedPerson[] }) {
  return (
    <section className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
      <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 mb-4">{title}</h2>
      <div className="space-y-3">
        {people.map((p) => (
          <Link
            key={p.id}
            href={`/person/${p.id}`}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors group"
          >
            <Avatar
              name={p.fullName}
              src={p.photoUrl}
              gender={p.gender as "male" | "female" | "unknown"}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {p.fullName}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {formatLifeSpan(p.birthYear, p.deathYear, p.isLiving)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
