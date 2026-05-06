"use client";

import { AnimatedCounter } from "@/components/AnimatedCounter";

interface HomeStatsSectionProps {
  stats: {
    personCount: number;
    villageCount: number;
    clanCount: number;
    generationDepth: number;
  };
}

/**
 * Client component for animated stats counters on the home page.
 * Separated from the server component page to keep data fetching on the server.
 */
export function HomeStatsSection({ stats }: HomeStatsSectionProps) {
  return (
    <section className="bg-white dark:bg-card-dark border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600 dark:text-amber-400">
              <AnimatedCounter end={stats.personCount} suffix="+" />
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">People Documented</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600 dark:text-amber-400">
              <AnimatedCounter end={stats.clanCount} />
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Family Clans</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600 dark:text-amber-400">
              <AnimatedCounter end={stats.villageCount} />
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Villages Mapped</p>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-serif font-bold text-amber-600 dark:text-amber-400">
              <AnimatedCounter end={stats.generationDepth} />
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Generations Deep</p>
          </div>
        </div>
      </div>
    </section>
  );
}
