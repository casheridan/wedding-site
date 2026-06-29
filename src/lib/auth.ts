import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSetting } from "@/lib/settings";

const ADMIN_COOKIE = "admin_session";
const SEATING_COOKIE = "seating_access";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SEATING_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set. See .env.example.");
  return new TextEncoder().encode(secret);
}

export type AdminSession = { userId: string; email: string };

/** Returns the admin user on valid credentials, otherwise null. */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return { userId: user.id, email: user.email };
}

async function signSession(session: AdminSession): Promise<string> {
  return new SignJWT({ email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function startAdminSession(session: AdminSession): Promise<void> {
  const token = await signSession(session);
  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    return { userId: payload.sub, email: String(payload.email ?? "") };
  } catch {
    return null;
  }
}

/** Use in protected server components/actions. Redirects to login if absent. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

// --- Seating gate (shared password) --------------------------------------

/** The shared seating password: admin-set setting, else env fallback. */
export async function getSeatingPassword(): Promise<string | null> {
  const fromDb = (await getSetting<string>("seatingPassword"))?.trim();
  return fromDb || process.env.SEATING_PASSWORD?.trim() || null;
}

export async function verifySeatingPassword(input: string): Promise<boolean> {
  const expected = await getSeatingPassword();
  if (!expected) return false;
  return input.trim() === expected;
}

export async function startSeatingSession(): Promise<void> {
  const token = await new SignJWT({ seating: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SEATING_MAX_AGE}s`)
    .sign(getSecret());
  const store = await cookies();
  store.set(SEATING_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SEATING_MAX_AGE,
  });
}

/**
 * Whether the public RSVP page should sit behind the shared guest password.
 * Off by default; toggled from the admin settings. Reuses the seating password
 * and the same unlock session, so unlocking either page unlocks both.
 */
export async function isRsvpLocked(): Promise<boolean> {
  return (await getSetting<boolean>("rsvpLocked")) === true;
}

export async function hasSeatingAccess(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SEATING_COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.seating === true;
  } catch {
    return false;
  }
}
