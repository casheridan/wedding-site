import { prisma } from "@/lib/db";
import { PageHeading, StatCard, Card } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRsvpsPage() {
  const rsvps = await prisma.rsvp.findMany({
    include: { guests: { orderBy: { isPrimary: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const attending = rsvps.filter((r) => r.attending);
  const declinedCount = rsvps.length - attending.length;
  const guestsAttending = attending.reduce((sum, r) => sum + r.partySize, 0);

  // Tally meal choices across attending guests.
  const mealTally = new Map<string, number>();
  for (const r of attending) {
    for (const g of r.guests) {
      if (g.meal) mealTally.set(g.meal, (mealTally.get(g.meal) ?? 0) + 1);
    }
  }
  const meals = [...mealTally.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeading
        title="RSVPs"
        description={`${rsvps.length} ${rsvps.length === 1 ? "response" : "responses"} so far.`}
        action={
          rsvps.length > 0 ? (
            <ButtonLink href="/admin/rsvps/export" variant="outline" prefetch={false}>
              Export CSV
            </ButtonLink>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Responses" value={rsvps.length} />
        <StatCard label="Guests attending" value={guestsAttending} />
        <StatCard label="Parties attending" value={attending.length} />
        <StatCard label="Declined" value={declinedCount} />
      </div>

      {meals.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-lg text-sage-800">Meal selections</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/75">
            {meals.map(([meal, count]) => (
              <li key={meal}>
                <span className="font-medium text-ink">{count}×</span> {meal}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="mt-6 space-y-4">
        {rsvps.length === 0 && (
          <Card className="text-center text-ink/55">
            No RSVPs yet. Responses will appear here as guests reply.
          </Card>
        )}

        {rsvps.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg text-sage-800">{r.name}</p>
                <a
                  href={`mailto:${r.email}`}
                  className="text-sm text-ink/55 hover:text-sage-700"
                >
                  {r.email}
                </a>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    "inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                    r.attending
                      ? "bg-sage-100 text-sage-700"
                      : "bg-blush-100 text-blush-500"
                  )}
                >
                  {r.attending ? `Attending · ${r.partySize}` : "Declined"}
                </span>
                <p className="mt-1 text-xs text-ink/45">
                  {formatDate(r.createdAt.toISOString())}
                </p>
              </div>
            </div>

            {r.attending && r.guests.length > 0 && (
              <ul className="mt-4 divide-y divide-sage-50 border-t border-sage-50 text-sm">
                {r.guests.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 py-2"
                  >
                    <span className="text-ink">
                      {g.name}
                      {g.isPrimary && (
                        <span className="ml-2 text-xs text-ink/40">
                          (primary)
                        </span>
                      )}
                    </span>
                    <span className="text-ink/60">
                      {g.meal || "—"}
                      {g.dietary && (
                        <span className="ml-2 text-blush-500">
                          · {g.dietary}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {(r.songRequest || r.message) && (
              <div className="mt-3 space-y-1 border-t border-sage-50 pt-3 text-sm">
                {r.songRequest && (
                  <p className="text-ink/70">
                    <span className="text-ink/45">Song request:</span>{" "}
                    {r.songRequest}
                  </p>
                )}
                {r.message && (
                  <p className="text-ink/70">
                    <span className="text-ink/45">Note:</span> {r.message}
                  </p>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
