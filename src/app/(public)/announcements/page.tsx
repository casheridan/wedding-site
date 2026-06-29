import type { Metadata } from "next";
import { getPublishedAnnouncements } from "@/lib/announcements";
import { Section } from "@/components/ui/section";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Announcements",
  description: "The latest updates from the couple.",
};

// Always reflect the newest announcements.
export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getPublishedAnnouncements();

  return (
    <Section
      eyebrow="News"
      title="Announcements"
      description="The latest updates as we count down to the big day."
    >
      {announcements.length === 0 ? (
        <p className="text-center text-ink/60">
          No announcements yet — check back soon!
        </p>
      ) : (
        <div className="mx-auto max-w-2xl space-y-6">
          {announcements.map((a) => (
            <article
              key={a.id}
              className="rounded-2xl border border-sage-100 bg-ivory p-7"
            >
              <div className="flex items-center gap-3">
                {a.pinned && (
                  <span className="rounded-full bg-blush-100 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-widest text-blush-500">
                    Pinned
                  </span>
                )}
                <time className="text-xs uppercase tracking-widest text-ink/50">
                  {formatDate(a.createdAt)}
                </time>
              </div>
              <h2 className="mt-3 text-2xl text-sage-800">{a.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">
                {a.body}
              </p>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
