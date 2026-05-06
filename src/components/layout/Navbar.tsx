"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/providers/ThemeProvider";

const villages = [
  "Karimabad", "Altit", "Ganesh", "Gulmit",
  "Shimshal", "Passu", "Ghulkin", "Hussaini", "Misgar",
];

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Search", href: "/search" },
  { label: "About", href: "/about" },
];

/**
 * Main navigation bar with logo, search shortcut, village dropdown,
 * dark mode toggle, and mobile hamburger menu.
 */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [villageDropdownOpen, setVillageDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-serif font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100 leading-tight">
                Silsila
              </h1>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-none -mt-0.5 tracking-wider uppercase">
                Hunza Valley Archive
              </p>
            </div>
          </Link>

          {/* Center nav links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Villages dropdown */}
            <div className="relative">
              <button
                onClick={() => setVillageDropdownOpen(!villageDropdownOpen)}
                onBlur={() => setTimeout(() => setVillageDropdownOpen(false), 200)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-600 dark:text-stone-300 dark:hover:text-amber-400 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Villages
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {villageDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-xl py-1 animate-scale-in">
                  {villages.map((village) => (
                    <Link
                      key={village}
                      href={`/village/${village.toLowerCase()}`}
                      className="block px-4 py-2 text-sm text-stone-700 dark:text-stone-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                      onClick={() => setVillageDropdownOpen(false)}
                    >
                      {village}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search shortcut (desktop) */}
            <button
              onClick={() => {
                // Trigger the CMD+K modal
                document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
              }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              aria-label="Search (Ctrl+K)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
              <kbd className="px-1 py-0.5 text-[10px] font-mono bg-white dark:bg-stone-700 rounded border border-stone-300 dark:border-stone-600">
                ⌘K
              </kbd>
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            {/* Sign In */}
            <Link
              href="/auth/signin"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors shadow-sm"
            >
              Sign In
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 dark:border-stone-800 py-3 animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-stone-200 dark:border-stone-700 mt-2 pt-2">
              <p className="px-3 py-1 text-xs font-medium text-stone-400 uppercase tracking-wider">Villages</p>
              {villages.map((village) => (
                <Link
                  key={village}
                  href={`/village/${village.toLowerCase()}`}
                  className="block px-3 py-2 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {village}
                </Link>
              ))}
            </div>
            <div className="border-t border-stone-200 dark:border-stone-700 mt-2 pt-2 px-3">
              <Link
                href="/auth/signin"
                className="block w-full text-center py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
