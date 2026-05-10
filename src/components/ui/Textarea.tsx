import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Textarea component with label, error, and helper text support.
 */
export function Textarea({ label, error, helperText, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "w-full px-3 py-2 rounded-lg border text-sm transition-colors min-h-[80px] resize-y",
          "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100",
          "focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400",
          error
            ? "border-red-400 dark:border-red-500"
            : "border-stone-300 dark:border-stone-600",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{helperText}</p>
      )}
    </div>
  );
}
