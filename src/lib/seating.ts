import { prisma } from "@/lib/db";

/** The currently published seating map (with its elements), or null. */
export async function getActiveSeatingMap() {
  return prisma.seatingMap.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { elements: { orderBy: { label: "asc" } } },
  });
}
