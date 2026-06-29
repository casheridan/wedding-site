import Link from "next/link";
import { navLinks } from "@/config/site";

export function SiteFooter({
  coupleNames,
  dateDisplay,
  locationShort,
  hashtag,
}: {
  coupleNames: string;
  dateDisplay: string;
  locationShort: string;
  hashtag: string;
}) {
  return (
    <footer className="mt-auto border-t border-sage-100 bg-cream/60">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 text-center sm:px-8">
        <p className="font-display text-2xl text-sage-800">{coupleNames}</p>
        <p className="mt-2 text-sm text-ink/60">
          {dateDisplay} · {locationShort}
        </p>

        <nav className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-widest text-ink/55 transition-colors hover:text-sage-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {hashtag && (
          <p className="mt-6 text-sm tracking-wide text-blush-500">{hashtag}</p>
        )}
      </div>
    </footer>
  );
}
