import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function createPool(): Pool {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and configure it."
    );
  }
  const pool = new Pool({
    connectionString,
    keepAlive: true,
    // Recycle idle connections promptly so a pooler that drops them mid-idle
    // (the local `prisma dev` proxy, Neon's pooler) can't hand back a dead
    // socket on the next query.
    idleTimeoutMillis: 10_000,
    max: 5,
  });
  // Without a listener, an idle-client error would crash the process.
  pool.on("error", (err) => {
    console.error("Postgres pool error:", err.message);
  });
  return pool;
}

const pool = globalForPrisma.pgPool ?? createPool();

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pool;
}
