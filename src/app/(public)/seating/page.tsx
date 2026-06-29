import type { Metadata } from "next";
import { hasSeatingAccess } from "@/lib/auth";
import { getActiveSeatingMap } from "@/lib/seating";
import { Section } from "@/components/ui/section";
import { SeatingGate } from "@/components/seating/seating-gate";
import { SeatingLookup } from "@/components/seating/seating-lookup";

export const metadata: Metadata = {
  title: "Find Your Seat",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SeatingPage() {
  const unlocked = await hasSeatingAccess();

  return (
    <Section
      eyebrow="Seating"
      title="Find Your Seat"
      description={
        unlocked
          ? "Search your name or your party to find your table."
          : undefined
      }
    >
      {unlocked ? <SeatingContent /> : <SeatingGate />}
    </Section>
  );
}

async function SeatingContent() {
  const map = await getActiveSeatingMap();

  if (!map) {
    return (
      <p className="text-center text-ink/60">
        Seating hasn&apos;t been published yet — check back closer to the day. 💌
      </p>
    );
  }

  const elements = map.elements.map((e) => ({
    id: e.id,
    kind: e.kind as "table" | "area" | "door" | "text" | "misc",
    shape: e.shape as "circle" | "rect",
    label: e.label,
    party: e.party,
    table: e.table,
    names: e.names,
    seats: e.seats,
    color: e.color,
    x: e.x,
    y: e.y,
    w: e.w,
    h: e.h,
    rotation: e.rotation,
  }));

  return (
    <SeatingLookup
      imageUrl={map.imageUrl}
      imgWidth={map.width}
      imgHeight={map.height}
      roomWidth={map.roomWidth}
      roomHeight={map.roomHeight}
      unit={map.unit}
      elements={elements}
    />
  );
}
