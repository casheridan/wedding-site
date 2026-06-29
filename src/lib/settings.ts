import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

/** Reads a single site setting (JSON value), or null if unset. */
export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row ? (row.value as T) : null;
}

/** Reads all settings as a key → value map. */
export async function getAllSettings(): Promise<Record<string, unknown>> {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Creates or updates a single setting. */
export async function setSetting(
  key: string,
  value: Prisma.InputJsonValue
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}
