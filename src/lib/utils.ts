/** Tiny className combiner (no dependency needed). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

/** Format a date (ISO string or Date) as e.g. "May 1, 2026". */
export function formatDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
