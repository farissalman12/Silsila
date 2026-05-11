import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading state for the search page — shows filter sidebar and result skeletons.
 */
export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton width="240px" height="36px" className="mb-6" />

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 flex-shrink-0">
          <Skeleton height="320px" variant="rectangular" />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="100px" variant="rectangular" />
          ))}
        </div>
      </div>
    </div>
  );
}
