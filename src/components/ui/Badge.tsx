import { cn } from "@/lib/utils";

export interface BadgeProps {
  /** Text content of the badge */
  children: React.ReactNode;
  /** Visual variant */
  variant?: "default" | "amber" | "teal" | "stone" | "success" | "warning" | "error" | "blue" | "pink";
  /** Badge size */
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  stone: "bg-stone-200 text-stone-800 dark:bg-stone-700 dark:text-stone-200",
  success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

const sizeStyles: Record<string, string> = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

/**
 * Badge component for status indicators, village labels, clan tags, etc.
 */
export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
