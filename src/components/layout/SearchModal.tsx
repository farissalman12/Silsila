"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

/**
 * CMD+K / Ctrl+K global search modal.
 * Opens from anywhere in the app, searches as you type.
 */
export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); setQuery(""); }} size="md">
      <form onSubmit={handleSearch}>
        <div className="relative">
          {/* Search icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, villages, clans..."
            className="w-full pl-10 pr-4 py-3 text-lg bg-transparent border-0 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-0"
            autoFocus
          />

          {/* Keyboard shortcut hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 rounded border border-stone-200 dark:border-stone-700">
              ESC
            </kbd>
          </div>
        </div>

        {/* Quick links */}
        <div className="border-t border-stone-200 dark:border-stone-700 pt-3 mt-2">
          <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 font-medium uppercase tracking-wider">
            Quick Links
          </p>
          <div className="space-y-1">
            {[
              { label: "Browse all villages", href: "/#villages" },
              { label: "Contribute a record", href: "/contribute" },
              { label: "View family trees", href: "/search" },
            ].map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  router.push(link.href);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
