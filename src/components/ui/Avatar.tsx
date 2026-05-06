import { cn, getInitials } from "@/lib/utils";

export interface AvatarProps {
  /** Full name for generating initials fallback */
  name: string;
  /** Photo URL — if not provided, shows initials */
  src?: string | null;
  /** Avatar size */
  size?: "sm" | "md" | "lg" | "xl";
  /** Gender-based color coding */
  gender?: "male" | "female" | "unknown";
  className?: string;
}

const sizeStyles: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

const genderStyles: Record<string, string> = {
  male: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200",
  female: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  unknown: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

/**
 * Avatar component with photo support and initials fallback.
 * Color-coded by gender to match tree node colors.
 */
export function Avatar({ name, src, size = "md", gender = "unknown", className }: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "rounded-full object-cover border-2 border-white dark:border-stone-800 shadow-sm",
          sizeStyles[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-semibold border-2 border-white dark:border-stone-800 shadow-sm",
        sizeStyles[size],
        genderStyles[gender],
        className
      )}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
