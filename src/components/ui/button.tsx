import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dustyblue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-dustyblue-600 text-ivory hover:bg-dustyblue-700",
  outline: "border border-sage-500 text-sage-700 hover:bg-sage-50",
  ghost: "text-sage-700 hover:bg-sage-50",
};

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, variants[variant], className);
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}
