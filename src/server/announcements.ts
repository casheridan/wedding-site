"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

function revalidate() {
  revalidatePath("/announcements");
  revalidatePath("/admin/announcements");
}

export async function createAnnouncement(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;

  await prisma.announcement.create({
    data: {
      title: title.slice(0, 200),
      body: body.slice(0, 5000),
      pinned: formData.get("pinned") === "on",
      published: formData.get("published") === "on",
    },
  });
  revalidate();
}

export async function updateAnnouncement(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !title || !body) return;

  await prisma.announcement.update({
    where: { id },
    data: {
      title: title.slice(0, 200),
      body: body.slice(0, 5000),
      pinned: formData.get("pinned") === "on",
      published: formData.get("published") === "on",
    },
  });
  revalidate();
}

export async function deleteAnnouncement(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.announcement.delete({ where: { id } });
  revalidate();
}
