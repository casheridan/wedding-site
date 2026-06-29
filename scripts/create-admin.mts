/**
 * Creates (or updates the password of) the first admin user, reading
 * ADMIN_EMAIL and ADMIN_PASSWORD from your .env. Run once:
 *
 *   npm run admin:create
 *
 * Re-running with a new ADMIN_PASSWORD resets the password for that email.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("✖ Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  process.exit(1);
}
if (password.length < 8) {
  console.error("✖ ADMIN_PASSWORD should be at least 8 characters.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.adminUser.upsert({
  where: { email },
  update: { passwordHash },
  create: { email, passwordHash },
});

console.log(`✓ Admin ready: ${user.email}`);
await prisma.$disconnect();
