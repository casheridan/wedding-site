import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: string | number | boolean | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Quote if it contains comma, quote, or newline; escape inner quotes.
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  // Route handlers aren't covered by the layout auth guard — check here.
  const session = await getAdminSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rsvps = await prisma.rsvp.findMany({
    include: { guests: { orderBy: { isPrimary: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    "Responded",
    "Primary Name",
    "Email",
    "Attending",
    "Party Size",
    "Guest Name",
    "Primary",
    "Meal",
    "Dietary",
    "Song Request",
    "Note",
  ];

  const rows: string[] = [header.map(csvCell).join(",")];

  for (const r of rsvps) {
    const base = [
      r.createdAt.toISOString(),
      r.name,
      r.email,
      r.attending ? "Yes" : "No",
      r.partySize,
    ];
    const tail = [r.songRequest ?? "", r.message ?? ""];

    if (r.attending && r.guests.length > 0) {
      for (const g of r.guests) {
        rows.push(
          [
            ...base,
            g.name,
            g.isPrimary ? "Yes" : "No",
            g.meal ?? "",
            g.dietary ?? "",
            ...tail,
          ]
            .map(csvCell)
            .join(",")
        );
      }
    } else {
      rows.push([...base, "", "", "", "", ...tail].map(csvCell).join(","));
    }
  }

  // Prepend BOM so Excel reads UTF-8 correctly.
  const csv = "﻿" + rows.join("\r\n");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
