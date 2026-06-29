# Wedding Website

A full-stack wedding site: a polished public site plus a password-protected
admin dashboard. Built with Next.js, Postgres, and Prisma; designed to deploy on
Vercel.

## Features

**Public site**

- Home with countdown, schedule, and quick links
- Details — venue/location, date & time, attire, travel, and a "what to be aware
  of" FAQ
- Registry links
- Announcements feed (managed from the admin)
- Detailed **RSVP** — attendance, plus-ones, per-guest meal choices, dietary
  notes, song request, and a note to the couple
- **Find Your Seat** — password-gated seating lookup with an interactive map
  (search by guest name _or_ party/family) and a list view

**Admin dashboard** (`/admin`, login required)

- At-a-glance stats
- View RSVPs, meal tallies, and **export to CSV**
- Create / edit / pin / publish announcements
- **Floor-plan editor** — design your room from scratch (set its dimensions,
  then drop tables, areas like a dance floor or bar, doors, text labels, and
  misc items; drag to move, resize, rotate, recolor) _or_ upload a photo/diagram
  and place items on top. Each table carries a name, party, seat count, and its
  guest list
- Site settings — names, date, venue, attire, registries deadline, and the
  shared seating password

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Prisma 7 (node-postgres driver adapter) |
| Auth | Signed cookies (jose) + bcrypt — single shared admin |
| Image storage | Vercel Blob (local filesystem fallback in dev) |
| Hosting | Vercel |

---

## Local development

### 1. Install

```bash
npm install
```

### 2. Start a local database

The easiest option is Prisma's built-in local Postgres:

```bash
npx prisma dev --detach --name wedding
```

It prints a `postgres://...` connection string — copy it.

> Prefer your own Postgres (Docker, Postgres.app, etc.)? Just use its connection
> string in the next step instead.

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — the connection string from step 2
- `AUTH_SECRET` — generate one:
  `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — your first admin login
- `SEATING_PASSWORD` — the shared password guests use for the seating page

### 4. Create tables and your admin user

```bash
npm run db:deploy      # applies migrations
npm run admin:create   # creates the admin from ADMIN_EMAIL/ADMIN_PASSWORD
```

(Optional) load a sample seating map to explore the lookup:

```bash
npx tsx scripts/seed-sample-seating.mts
```

### 5. Run

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## Editing content

There are two ways to edit content:

1. **Admin → Settings** (no code): couple names, date, venue, attire, RSVP
   deadline, and the seating password. Changes show on the site immediately.
2. **`src/config/site.ts`** (code): everything, including the lists that aren't
   in the settings form yet — **registries**, the day-of **schedule**, the
   **FAQ**, and **travel/accommodations**. It's heavily commented.

The site works entirely from `src/config/site.ts` defaults; admin settings simply
override them.

## Useful scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm run db:deploy` | Apply migrations (use for prod + Prisma-dev local) |
| `npm run db:migrate` | Create a new migration after editing the schema* |
| `npm run db:studio` | Open Prisma Studio to browse data |
| `npm run admin:create` | Create/reset the admin from `.env` |

\* `db:migrate` needs a database that allows a shadow DB (Neon does). Against the
local `prisma dev` proxy, edit the schema then run
`npx prisma migrate diff --from-migrations prisma/migrations --to-schema prisma/schema.prisma --script -o prisma/migrations/<timestamp>_name/migration.sql`
followed by `npm run db:deploy`.

---

## Deploying to production (Vercel + Neon)

### 1. Create a Neon Postgres database

1. Sign up at [neon.tech](https://neon.tech) and create a project.
2. Copy the **pooled** connection string (the host contains `-pooler`). It looks
   like:
   `postgresql://USER:PASSWORD@ep-xxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require`

### 2. Apply migrations to Neon

From your machine, point at Neon and deploy the schema, then create your admin:

```bash
# temporarily, in your shell:
$env:DATABASE_URL="postgresql://...-pooler...sslmode=require"   # PowerShell
npm run db:deploy
$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"
npm run admin:create
```

### 3. Push to GitHub

```bash
git add -A
git commit -m "Wedding site"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 4. Import to Vercel

1. At [vercel.com/new](https://vercel.com/new), import the GitHub repo. Vercel
   auto-detects Next.js — no build settings to change.
2. Under **Storage**, create a **Blob** store and connect it to the project
   (this sets `BLOB_READ_WRITE_TOKEN` automatically).
3. Add the remaining **Environment Variables** (Production):
   - `DATABASE_URL` — your Neon pooled string
   - `AUTH_SECRET` — a fresh 32-byte hex value (different from local is fine)
   - `SEATING_PASSWORD` — shared seating password (or set it later in admin)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` are only needed if you run
     `admin:create` again; not required at runtime.
4. **Deploy.**

### 5. Connect your domain (GoDaddy registrar + Cloudflare DNS)

You're registering at GoDaddy but running DNS at Cloudflare, so all records are
managed in **Cloudflare**.

1. **Vercel** → Project → **Settings → Domains** → add `yourdomain.com` and
   `www.yourdomain.com`. Vercel shows the exact records to create.
2. **Cloudflare** → your domain → **DNS → Records**, add what Vercel asked for —
   typically:
   - `A` record, name `@`, value `76.76.21.21`
   - `CNAME` record, name `www`, value `cname.vercel-dns.com`
3. Set those records' proxy status to **DNS only** (grey cloud) so Vercel can
   issue and manage TLS. (You can enable Cloudflare's orange-cloud proxy later
   with SSL mode **Full (strict)** if you want Cloudflare in front.)
4. Make sure GoDaddy is still using **Cloudflare's nameservers** (this is what
   makes Cloudflare your DNS). If not, set them in GoDaddy → Domain →
   Nameservers.
5. Back in Vercel, wait for the domain to verify (DNS can take a little while).

Done — your site is live, and the admin lives at `https://yourdomain.com/admin`.

### Notes

- Uploaded seating images go to Vercel Blob in production. Image uploads pass
  through the serverless function, so keep them under ~4 MB (compress large
  photos).
- After you change settings or seating in admin, the public pages update
  automatically.
