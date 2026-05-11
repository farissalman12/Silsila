import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Loading state for person profile page.
 */
export default function PersonLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton width="300px" height="20px" className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile header */}
          <div className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <div className="flex items-start gap-5">
              <Skeleton variant="circular" width="80px" height="80px" />
              <div className="flex-1 space-y-3">
                <Skeleton width="200px" height="28px" />
                <Skeleton width="150px" height="18px" />
                <div className="flex gap-2">
                  <Skeleton width="60px" height="24px" />
                  <Skeleton width="80px" height="24px" />
                  <Skeleton width="70px" height="24px" />
                </div>
              </div>
            </div>
          </div>

          {/* Vital records */}
          <div className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <Skeleton width="140px" height="24px" className="mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton width="80px" height="12px" />
                  <Skeleton width="120px" height="16px" />
                </div>
              ))}
            </div>
          </div>

          {/* Relationships */}
          <div className="p-6 bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800">
            <Skeleton width="100px" height="24px" className="mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton variant="circular" width="36px" height="36px" />
                <div className="space-y-1">
                  <Skeleton width="140px" height="16px" />
                  <Skeleton width="90px" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <Skeleton height="200px" variant="rectangular" />
          <Skeleton height="150px" variant="rectangular" />
        </aside>
      </div>
    </div>
  );
}
