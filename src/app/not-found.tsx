import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist in the Silsila archive.",
};

/**
 * Global 404 page — shown when no route matches.
 * Matches the Silsila design language with amber/stone palette.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Decorative chain icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-amber-400 dark:text-amber-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.07-9.07l-1.757 1.757a4.5 4.5 0 00-6.364 6.364l4.5 4.5a4.5 4.5 0 007.244 1.242"
            />
          </svg>
        </div>

        <p className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-2">
          Lost in the Archives
        </p>

        <h1 className="text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          Page Not Found
        </h1>

        <p className="text-stone-500 dark:text-stone-400 mb-8 leading-relaxed">
          The chain you followed seems to be broken. This page doesn&apos;t exist
          in our ancestry records, or may have been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Return Home
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
          >
            Search Archive →
          </Link>
        </div>
      </div>
    </div>
  );
}
