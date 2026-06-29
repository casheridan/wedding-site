"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * One floor element on a seating map. `kind` decides how it renders and whether
 * it's searchable: "table" elements carry guest names/party and show up in the
 * guest lookup; "area" | "door" | "text" | "misc" are decoration.
 */
export type ElementInput = {
  kind: string;
  shape: string;
  label: string;
  party: string;
  table: string;
  names: string[];
  seats: number | null;
  color: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
};

const KINDS = new Set(["table", "area", "door", "text", "misc"]);
const SHAPES = new Set(["circle", "rect"]);

function clamp(n: number, lo: number, hi: number): number {
  if (Number.isNaN(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

function cleanColor(c: string | null): string | null {
  if (!c) return null;
  const v = c.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(v) ? v : null;
}

function revalidate() {
  revalidatePath("/seating");
  revalidatePath("/admin/seating");
}

export async function saveSeatingElements(
  mapId: string,
  elements: ElementInput[]
): Promise<{ ok: boolean; count: number }> {
  await requireAdmin();

  const clean = elements
    // Keep everything except empty text labels (those are just noise).
    .filter((e) => (e.kind === "text" ? e.label.trim().length > 0 : true))
    .map((e) => ({
      mapId,
      kind: KINDS.has(e.kind) ? e.kind : "misc",
      shape: SHAPES.has(e.shape) ? e.shape : "rect",
      label: e.label.trim().slice(0, 200),
      party: e.party.trim() ? e.party.trim().slice(0, 200) : null,
      table: e.table.trim() ? e.table.trim().slice(0, 100) : null,
      names: e.names.map((n) => n.trim()).filter(Boolean).slice(0, 50),
      seats:
        e.seats != null && Number.isFinite(e.seats)
          ? clamp(Math.round(e.seats), 0, 999)
          : null,
      color: cleanColor(e.color),
      x: clamp(e.x, 0, 1),
      y: clamp(e.y, 0, 1),
      w: clamp(e.w, 0.01, 1.5),
      h: clamp(e.h, 0.01, 1.5),
      rotation: ((Math.round(e.rotation) % 360) + 360) % 360,
    }));

  // Replace all elements for this map atomically.
  await prisma.$transaction([
    prisma.seatingPin.deleteMany({ where: { mapId } }),
    ...(clean.length ? [prisma.seatingPin.createMany({ data: clean })] : []),
  ]);

  revalidate();
  return { ok: true, count: clean.length };
}

/** Create a blank, image-less room as an unpublished draft. */
export async function createBlankMap(input: {
  name: string;
  roomWidth: number;
  roomHeight: number;
  unit?: string;
}): Promise<{ id: string }> {
  await requireAdmin();
  const name = input.name.trim().slice(0, 120) || "Reception";
  const roomWidth = clamp(Math.round(input.roomWidth), 4, 1000);
  const roomHeight = clamp(Math.round(input.roomHeight), 4, 1000);
  const unit = input.unit?.trim().slice(0, 8) || "ft";

  // Start unpublished so it isn't visible to guests until the admin publishes.
  const map = await prisma.seatingMap.create({
    data: { name, roomWidth, roomHeight, unit, imageUrl: null, isActive: false },
  });
  revalidate();
  return { id: map.id };
}

/** Update a map's name and room dimensions. */
export async function updateMapMeta(
  mapId: string,
  input: { name?: string; roomWidth?: number; roomHeight?: number }
): Promise<void> {
  await requireAdmin();
  await prisma.seatingMap.update({
    where: { id: mapId },
    data: {
      ...(input.name != null
        ? { name: input.name.trim().slice(0, 120) || "Reception" }
        : {}),
      ...(input.roomWidth != null
        ? { roomWidth: clamp(Math.round(input.roomWidth), 4, 1000) }
        : {}),
      ...(input.roomHeight != null
        ? { roomHeight: clamp(Math.round(input.roomHeight), 4, 1000) }
        : {}),
    },
  });
  revalidate();
}

export async function setMapActive(
  mapId: string,
  active: boolean
): Promise<void> {
  await requireAdmin();
  if (active) {
    await prisma.seatingMap.updateMany({ data: { isActive: false } });
  }
  await prisma.seatingMap.update({
    where: { id: mapId },
    data: { isActive: active },
  });
  revalidate();
}

export async function deleteSeatingMap(mapId: string): Promise<void> {
  await requireAdmin();
  await prisma.seatingMap.delete({ where: { id: mapId } });
  revalidate();
}
