import { prisma } from "@/lib/db";
import { PageHeading } from "@/components/admin/ui";
import { SeatingStart } from "@/components/admin/seating-start";
import {
  SeatingMapEditor,
  type EditorElement,
} from "@/components/admin/seating-map-editor";

export const dynamic = "force-dynamic";

export default async function AdminSeatingPage() {
  // Prefer the active map; otherwise the most recent.
  const map = await prisma.seatingMap.findFirst({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    include: { elements: { orderBy: { label: "asc" } } },
  });

  return (
    <>
      <PageHeading
        title="Seating map"
        description="Design your room — drop tables, areas, doors, and labels onto a blank floor plan (or your own photo), then add guest names to each table. Guests look these up on the password-protected seating page."
      />

      {map ? (
        <SeatingMapEditor
          key={map.id + (map.imageUrl ?? "blank")}
          mapId={map.id}
          name={map.name}
          imageUrl={map.imageUrl}
          imgWidth={map.width}
          imgHeight={map.height}
          roomWidth={map.roomWidth}
          roomHeight={map.roomHeight}
          unit={map.unit}
          isActive={map.isActive}
          initialElements={map.elements.map(
            (e): EditorElement => ({
              id: e.id,
              kind: e.kind as EditorElement["kind"],
              shape: e.shape as EditorElement["shape"],
              label: e.label,
              party: e.party ?? "",
              table: e.table ?? "",
              names: e.names,
              seats: e.seats,
              color: e.color,
              x: e.x,
              y: e.y,
              w: e.w,
              h: e.h,
              rotation: e.rotation,
            })
          )}
        />
      ) : (
        <SeatingStart />
      )}
    </>
  );
}
