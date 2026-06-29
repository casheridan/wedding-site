import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { saveUpload } from "@/lib/storage";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const mapId = form.get("mapId");
  const width = Number(form.get("width")) || null;
  const height = Number(form.get("height")) || null;

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Please upload an image." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Image is too large (max 8 MB)." },
      { status: 400 }
    );
  }

  let url: string;
  try {
    ({ url } = await saveUpload(file));
  } catch (err) {
    console.error("Upload failed:", err);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }

  let map;
  if (typeof mapId === "string" && mapId) {
    // Replace the image on an existing map (keep its pins).
    map = await prisma.seatingMap.update({
      where: { id: mapId },
      data: { imageUrl: url, width, height },
    });
  } else {
    // New map becomes the single active one.
    await prisma.seatingMap.updateMany({ data: { isActive: false } });
    map = await prisma.seatingMap.create({
      data: { imageUrl: url, width, height, isActive: true },
    });
  }

  revalidatePath("/seating");
  revalidatePath("/admin/seating");
  return Response.json({ ok: true, mapId: map.id, url });
}
