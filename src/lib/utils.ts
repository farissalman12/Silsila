import { clsx, type ClassValue } from "clsx";

/** Utility to merge class names conditionally */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a birth/death year for display, handling approximate dates */
export function formatYear(year: number | null | undefined, approximate?: boolean): string {
  if (!year) return "Unknown";
  if (approximate) return `~${Math.floor(year / 10) * 10}s`;
  return year.toString();
}

/** Format a person's life span */
export function formatLifeSpan(
  birthYear: number | null | undefined,
  deathYear: number | null | undefined,
  isLiving: boolean,
  approximate?: boolean
): string {
  const birth = formatYear(birthYear, approximate);
  if (isLiving) return `b. ${birth}`;
  const death = formatYear(deathYear);
  return `${birth} – ${death}`;
}

/** Generate initials from a full name */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Slugify a string for URL-safe usage */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/** Check if a person is considered publicly viewable based on privacy rules */
export function isPubliclyViewable(
  isLiving: boolean,
  deathYear: number | null | undefined,
  privacyLevel: string
): boolean {
  if (privacyLevel === "private") return false;
  if (!isLiving && deathYear && new Date().getFullYear() - deathYear >= 50) return true;
  if (!isLiving) return privacyLevel === "public";
  return privacyLevel === "public";
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
