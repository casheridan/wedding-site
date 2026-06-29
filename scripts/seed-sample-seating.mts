/**
 * DEMO ONLY. Seeds a sample "from scratch" reception room (no image) — a room
 * with dimensions, a dance floor, bar, doors, labels, and round tables with
 * guests — so you can try the lookup and the editor before building your real
 * map. Run:  npx tsx scripts/seed-sample-seating.mts
 * It clears existing seating maps first.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type El = {
  kind: string;
  shape?: string;
  label: string;
  party?: string;
  table?: string;
  names?: string[];
  seats?: number;
  color?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  rotation?: number;
};

const elements: El[] = [
  // Areas / zones
  { kind: "area", shape: "rect", label: "Dance Floor", x: 0.5, y: 0.56, w: 0.3, h: 0.24 },
  { kind: "area", shape: "rect", label: "Bar", color: "#e68c61", x: 0.86, y: 0.12, w: 0.2, h: 0.1 },

  // Misc items
  { kind: "misc", shape: "rect", label: "Gifts", x: 0.12, y: 0.12, w: 0.1, h: 0.06 },
  { kind: "misc", shape: "rect", label: "Cake", x: 0.5, y: 0.9, w: 0.1, h: 0.06 },

  // Doors
  { kind: "door", shape: "rect", label: "Entrance", x: 0.3, y: 0.985, w: 0.12, h: 0.022 },

  // Text label
  { kind: "text", label: "Welcome!", x: 0.5, y: 0.06, w: 0.3, h: 0.05 },

  // Head table (rectangular)
  {
    kind: "table", shape: "rect", label: "Wedding Party", party: "Wedding Party",
    table: "Head Table", seats: 6,
    names: ["Christian", "Ally", "Jordan (Best Man)", "Riley (Maid of Honor)"],
    x: 0.5, y: 0.3, w: 0.28, h: 0.07,
  },

  // Round guest tables
  { kind: "table", label: "The Johnson Family", party: "Johnson", table: "Table 1", seats: 8, names: ["Robert Johnson", "Mary Johnson", "Emily Johnson"], x: 0.18, y: 0.4, w: 0.11, h: 0.11 },
  { kind: "table", label: "The Garcia Family", party: "Garcia", table: "Table 2", seats: 8, names: ["Luis Garcia", "Sofia Garcia"], x: 0.18, y: 0.62, w: 0.11, h: 0.11 },
  { kind: "table", label: "Neighbors", party: "Neighbors", table: "Table 3", seats: 8, names: ["Tom Brown", "Lisa Brown"], x: 0.18, y: 0.83, w: 0.11, h: 0.11 },
  { kind: "table", label: "Smith Party", party: "Smith", table: "Table 4", seats: 8, names: ["John Smith", "Jane Smith"], x: 0.82, y: 0.4, w: 0.11, h: 0.11 },
  { kind: "table", label: "Aunts & Uncles", party: "Aunts & Uncles", table: "Table 5", seats: 8, names: ["Carol Adams", "Dave Adams"], x: 0.82, y: 0.62, w: 0.11, h: 0.11 },
  { kind: "table", label: "The Patel Family", party: "Patel", table: "Table 6", seats: 8, names: ["Nina Patel", "Raj Patel"], x: 0.82, y: 0.83, w: 0.11, h: 0.11 },
  { kind: "table", label: "College Friends", party: "College Friends", table: "Table 7", seats: 8, names: ["Chris Lee", "Pat Kim", "Sam Rivera"], x: 0.4, y: 0.85, w: 0.11, h: 0.11 },
  { kind: "table", label: "Work Friends", party: "Work Friends", table: "Table 8", seats: 8, names: ["Dana White", "Morgan Yu"], x: 0.62, y: 0.85, w: 0.11, h: 0.11 },
];

await prisma.seatingMap.deleteMany();
await prisma.seatingMap.create({
  data: {
    name: "Reception",
    imageUrl: null,
    roomWidth: 40,
    roomHeight: 30,
    unit: "ft",
    isActive: true,
    elements: { create: elements },
  },
});

const tables = elements.filter((e) => e.kind === "table").length;
console.log(
  `✓ Seeded a sample 40×30 ft room with ${tables} tables and ${elements.length} items.`
);
await prisma.$disconnect();
