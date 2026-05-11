/**
 * Global loading state — shown during route transitions.
 * Uses the Silsila amber gradient for brand consistency.
 */
export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        {/* Spinning chain link loader */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-stone-200 dark:border-stone-700" />
          <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
          Loading the archive…
        </p>
      </div>
    </div>
  );
}
