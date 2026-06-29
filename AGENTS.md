<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Wedding site — project notes

Stack: Next.js 16 (App Router) + React 19 + Tailwind v4 + Prisma 7 (Postgres).

## Layout
- `src/app/(public)/*` — public pages; `(public)/layout.tsx` adds the wedding header/footer.
- `src/app/admin/login` — public login; `src/app/admin/(protected)/*` — auth-guarded (layout calls `requireAdmin`).
- `src/server/*` — `"use server"` actions (rsvp, announcements, seating-admin, settings, admin-auth).
- `src/lib/*` — `db` (Prisma singleton), `auth`, `content` (config+DB merge), `settings`, `seating`, `storage`.
- `src/config/site.ts` — static content defaults; `src/lib/content.getSiteContent()` merges DB settings over them.

## Conventions / gotchas
- Prisma 7 uses the `prisma-client` generator → import from `@/generated/prisma/client` (git-ignored, run `prisma generate`).
- DB uses the **node-postgres driver adapter** (`src/lib/db.ts`) with a hardened pool; works with local `prisma dev` and Neon alike.
- DB-reading admin/seating/announcements pages set `export const dynamic = "force-dynamic"`. Public content pages are static and revalidated via `revalidatePath("/", "layout")` on settings save.
- Local DB: `npx prisma dev --detach --name wedding` (its TCP proxy always maps to the `template1` db). Migrations: author with `prisma migrate diff`, apply with `npm run db:deploy` (the proxy doesn't support the `migrate dev` shadow DB).
- Seating image uploads go through `POST /admin/seating/upload` → `src/lib/storage.ts` (Vercel Blob if `BLOB_READ_WRITE_TOKEN`, else `public/uploads`).
- Seating maps can be image-backed *or* "from scratch" (blank room: `SeatingMap.imageUrl` null + `roomWidth`/`roomHeight`). `SeatingPin` is a misnomer — it's any floor element (`kind`: table/area/door/text/misc) with `shape`/`w`/`h`/`rotation`/`color`; only `kind==="table"` carries guests and is searchable. Shared rendering lives in `src/components/seating/floor.tsx` (`RoomCanvas` + `ElementBox`), used by both the admin editor and the public lookup. Coords: `x`/`y` are center as a fraction of canvas; `w`/`h` are a fraction of canvas **width** (so circles stay round).
- After editing the Prisma schema, run `prisma generate` and create a migration.
