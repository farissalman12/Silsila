"use client";

import { useState, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  /** The content to show in the tooltip */
  content: string;
  /** The trigger element */
  children: ReactNode;
  /** Tooltip position */
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const positionStyles: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Tooltip that appears on hover with configurable position.
 */
export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsVisible(true), 200);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-40 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap",
            "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900",
            "shadow-lg animate-fade-in pointer-events-none",
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
