"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/server/admin-auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/announcements", label: "Announcements" },
  { href: "/admin/seating", label: "Seating" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="border-b border-sage-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Link href="/admin" className="font-display text-lg text-sage-800">
          Wedding Admin
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                isActive(link.href)
                  ? "bg-sage-50 font-medium text-sage-700"
                  : "text-ink/65 hover:bg-sage-50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs uppercase tracking-widest text-ink/50 hover:text-sage-700"
          >
            View site ↗
          </Link>
          <span className="hidden text-xs text-ink/40 sm:inline">{email}</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-sage-200 px-3 py-1.5 text-sm text-ink/70 transition-colors hover:bg-sage-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
