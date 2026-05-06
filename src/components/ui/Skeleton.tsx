import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  /** Variant shape */
  variant?: "text" | "circular" | "rectangular";
  /** Width (CSS value) */
  width?: string;
  /** Height (CSS value) */
  height?: string;
}

/**
 * Skeleton loading placeholder with pulse animation.
 */
export function Skeleton({ className, variant = "text", width, height }: SkeletonProps) {
  const variantStyles: Record<string, string> = {
    text: "rounded-md h-4",
    circular: "rounded-full",
    rectangular: "rounded-card",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-stone-200 dark:bg-stone-700",
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/** Pre-built skeleton for a person card */
export function PersonCardSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton width="80%" />
      <div className="flex gap-2">
        <Skeleton width="60px" height="20px" variant="rectangular" />
        <Skeleton width="80px" height="20px" variant="rectangular" />
      </div>
    </div>
  );
}

/** Pre-built skeleton for a village card */
export function VillageCardSkeleton() {
  return (
    <div className="p-5 space-y-4">
      <Skeleton height="160px" variant="rectangular" />
      <Skeleton width="50%" height="24px" />
      <Skeleton width="70%" />
      <div className="flex gap-3">
        <Skeleton width="80px" height="28px" variant="rectangular" />
        <Skeleton width="80px" height="28px" variant="rectangular" />
      </div>
    </div>
  );
}
