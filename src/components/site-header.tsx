"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ coupleNames }: { coupleNames: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-sage-100 bg-ivory/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-wide text-sage-800"
          onClick={() => setOpen(false)}
        >
          {coupleNames}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm tracking-wide transition-colors hover:text-sage-700",
                isActive(link.href)
                  ? "text-sage-700 font-medium"
                  : "text-ink/70"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sage-700 hover:bg-sage-50 md:hidden"
        >
          <span className="sr-only">Menu</span>
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-sage-100 bg-ivory px-5 py-3 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-sage-50 text-sage-700 font-medium"
                  : "text-ink/75 hover:bg-sage-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
