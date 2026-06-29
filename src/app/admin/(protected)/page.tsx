import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeading, StatCard, Card } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalRsvps, attendingAgg, declined, announcements, pins] =
    await Promise.all([
      prisma.rsvp.count(),
      prisma.rsvp.aggregate({
        _sum: { partySize: true },
        where: { attending: true },
      }),
      prisma.rsvp.count({ where: { attending: false } }),
      prisma.announcement.count(),
      prisma.seatingPin.count(),
    ]);

  const guestsAttending = attendingAgg._sum.partySize ?? 0;

  const quickLinks = [
    { href: "/admin/rsvps", title: "Manage RSVPs", desc: "View responses & export a guest list." },
    { href: "/admin/announcements", title: "Post an Announcement", desc: "Share an update on the site." },
    { href: "/admin/seating", title: "Edit Seating Map", desc: "Upload a room photo & place guests." },
    { href: "/admin/settings", title: "Site Settings", desc: "Names, date, venue, registries & more." },
  ];

  return (
    <>
      <PageHeading
        title="Dashboard"
        description="Manage your wedding site from here."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="RSVPs received" value={totalRsvps} />
        <StatCard label="Guests attending" value={guestsAttending} />
        <StatCard label="Declined" value={declined} />
        <StatCard label="Seating pins" value={pins} hint={`${announcements} announcements`} />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-shadow hover:shadow-md">
              <h2 className="text-xl text-sage-800">{link.title}</h2>
              <p className="mt-1 text-sm text-ink/60">{link.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
