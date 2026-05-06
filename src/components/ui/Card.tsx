import { cn } from "@/lib/utils";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Whether the card should have hover effects */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

/**
 * Card container with optional hover effects for interactive cards.
 */
export function Card({ children, className, interactive, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-card-dark rounded-card border border-stone-200 dark:border-stone-800 overflow-hidden",
        interactive && "cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-amber-300 dark:hover:border-amber-700 hover:-translate-y-0.5",
        className
      )}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") onClick?.(); } : undefined}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 py-4 border-b border-stone-100 dark:border-stone-800", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50", className)}>
      {children}
    </div>
  );
}
