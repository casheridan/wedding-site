-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "attending" BOOLEAN NOT NULL,
    "partySize" INTEGER NOT NULL DEFAULT 0,
    "songRequest" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RsvpGuest" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meal" TEXT,
    "dietary" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RsvpGuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingMap" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Reception',
    "imageUrl" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatingPin" (
    "id" TEXT NOT NULL,
    "mapId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "party" TEXT,
    "table" TEXT,
    "names" TEXT[],
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatingPin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Rsvp_createdAt_idx" ON "Rsvp"("createdAt");

-- CreateIndex
CREATE INDEX "RsvpGuest_rsvpId_idx" ON "RsvpGuest"("rsvpId");

-- CreateIndex
CREATE INDEX "Announcement_published_pinned_createdAt_idx" ON "Announcement"("published", "pinned", "createdAt");

-- CreateIndex
CREATE INDEX "SeatingPin_mapId_idx" ON "SeatingPin"("mapId");

-- AddForeignKey
ALTER TABLE "RsvpGuest" ADD CONSTRAINT "RsvpGuest_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatingPin" ADD CONSTRAINT "SeatingPin_mapId_fkey" FOREIGN KEY ("mapId") REFERENCES "SeatingMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
