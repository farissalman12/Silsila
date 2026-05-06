import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatLifeSpan } from "@/lib/utils";

interface PersonCardProps {
  person: {
    id: string;
    fullName: string;
    gender: string;
    birthYear: number | null;
    deathYear: number | null;
    isLiving: boolean;
    photoUrl: string | null;
    verified: boolean;
    village?: { name: string; slug: string } | null;
    clan?: { name: string; slug: string } | null;
  };
}

/**
 * Reusable person card used in search results, village pages, and related people sections.
 */
export function PersonCard({ person }: PersonCardProps) {
  return (
    <Link
      href={`/person/${person.id}`}
      className="group flex items-start gap-3 p-4 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <Avatar
        name={person.fullName}
        src={person.photoUrl}
        gender={person.gender as "male" | "female" | "unknown"}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-serif font-semibold text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
            {person.fullName}
          </h3>
          {person.verified && (
            <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-1.5">
          {formatLifeSpan(person.birthYear, person.deathYear, person.isLiving)}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {person.village && (
            <Badge variant="stone" size="sm">{person.village.name}</Badge>
          )}
          {person.clan && (
            <Badge variant="amber" size="sm">{person.clan.name}</Badge>
          )}
          {person.isLiving && (
            <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Living
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
