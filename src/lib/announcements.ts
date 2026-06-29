import { prisma } from "@/lib/db";

/** Public feed: published announcements, pinned first, then newest. */
export async function getPublishedAnnouncements() {
  return prisma.announcement.findMany({
    where: { published: true },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
}
