"use client";

import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";

// Suggestions Container
type SuggestionsProps = ComponentProps<"div"> & {
  children: ReactNode;
};

export const Suggestions = ({ className, children, ...props }: SuggestionsProps) => {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Suggestions.displayName = "Suggestions";

// Individual Suggestion Chip
type SuggestionProps = Omit<ComponentProps<"button">, "onClick"> & {
  suggestion: string;
  onClick: (suggestion: string) => void;
};

export const Suggestion = ({
  suggestion,
  onClick,
  className,
  ...props
}: SuggestionProps) => {
  const handleClick = () => {
    onClick(suggestion);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-3 text-left px-6 py-4",
        "rounded-lg",
        "bg-card backdrop-blur-sm border border-border",
        "text-base sm:text-lg text-foreground",
        "transition-all duration-200",
        "hover:bg-accent",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground flex-shrink-0" />
      <span>{suggestion}</span>
    </button>
  );
};

Suggestion.displayName = "Suggestion";
