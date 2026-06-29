import { cn } from "@/lib/utils";

/** A thin rule with a small centered ornament — a soft section divider. */
export function Divider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-12 bg-sage-300" />
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        className="text-blush-400"
        aria-hidden="true"
      >
        <path
          d="M12 2c2 4 6 6 6 10a6 6 0 0 1-12 0c0-4 4-6 6-10z"
          fill="currentColor"
        />
      </svg>
      <span className="h-px w-12 bg-sage-300" />
    </div>
  );
}
