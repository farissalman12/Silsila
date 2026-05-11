/**
 * JSON-LD structured data helpers for SEO.
 * Generates Schema.org compliant data for persons, villages, and the site.
 */

interface PersonLdInput {
  fullName: string;
  birthYear?: number | null;
  deathYear?: number | null;
  birthPlace?: string | null;
  deathPlace?: string | null;
  gender?: string;
  isLiving: boolean;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
}

/** Generate JSON-LD for a person profile page */
export function generatePersonJsonLd(person: PersonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.fullName,
    url: person.url,
    ...(person.gender && { gender: person.gender === "male" ? "Male" : person.gender === "female" ? "Female" : undefined }),
    ...(person.birthYear && { birthDate: String(person.birthYear) }),
    ...(person.deathYear && { deathDate: String(person.deathYear) }),
    ...(person.birthPlace && { birthPlace: { "@type": "Place", name: person.birthPlace } }),
    ...(person.deathPlace && { deathPlace: { "@type": "Place", name: person.deathPlace } }),
    ...(person.description && { description: person.description }),
    ...(person.imageUrl && { image: person.imageUrl }),
  };
}

interface VillageLdInput {
  name: string;
  region: string;
  lat?: number | null;
  lng?: number | null;
  description?: string | null;
  url: string;
}

/** Generate JSON-LD for a village page */
export function generateVillageJsonLd(village: VillageLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Place",
    name: village.name,
    url: village.url,
    description: village.description || `${village.name} village in ${village.region}, Hunza Valley, Pakistan.`,
    address: {
      "@type": "PostalAddress",
      addressRegion: village.region,
      addressCountry: "PK",
    },
    ...(village.lat && village.lng && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: village.lat,
        longitude: village.lng,
      },
    }),
  };
}

/** Generate JSON-LD for the website (used in root layout) */
export function generateWebsiteJsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://silsila.app";
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Silsila — Hunza Valley Living Ancestry Archive",
    alternateName: "سلسلہ",
    url: baseUrl,
    description: "Digitize, preserve, and visually explore generational family trees of all communities in the Hunza Valley, Pakistan.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
