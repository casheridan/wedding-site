import { cn } from "@/lib/utils";

export const adminInputClass =
  "w-full rounded-lg border border-sage-200 bg-white px-3.5 py-2 text-sm text-ink outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100";

export const adminLabelClass = "mb-1.5 block text-sm font-medium text-ink/80";

export function PageHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl text-sage-800">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-sage-100 bg-white p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Card className="text-center">
      <p className="font-display text-4xl text-sage-800">{value}</p>
      <p className="mt-1 text-sm font-medium text-ink/70">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-ink/45">{hint}</p>}
    </Card>
  );
}
