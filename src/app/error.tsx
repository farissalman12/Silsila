"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches unhandled errors in any route segment.
 * Must be a client component per Next.js requirements.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (e.g., Sentry) in production
    console.error("Silsila Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Warning icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-red-400 dark:text-red-500"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path
              strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <p className="text-red-500 text-sm font-medium tracking-widest uppercase mb-2">
          Something Went Wrong
        </p>

        <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-3">
          An Error Occurred
        </h1>

        <p className="text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          We encountered an unexpected issue while loading this page.
          Please try again, or return to the home page.
        </p>

        {error.digest && (
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-4 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors"
          >
            Go Home →
          </a>
        </div>
      </div>
    </div>
  );
}
