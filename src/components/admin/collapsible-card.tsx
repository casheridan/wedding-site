"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/admin/ui";

/**
 * A settings section that collapses to just its header. The body is hidden with
 * CSS (not unmounted) so its form fields still submit while collapsed.
 */
export function CollapsibleCard({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span>
          <span className="block text-lg text-sage-800">{title}</span>
          {description && (
            <span className="mt-0.5 block text-xs text-ink/45">
              {description}
            </span>
          )}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-sage-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.21 8.27a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div className={open ? "space-y-4" : "hidden"}>{children}</div>
    </Card>
  );
}
