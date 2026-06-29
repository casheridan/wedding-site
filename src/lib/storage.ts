/**
 * Stores an uploaded image and returns its public URL.
 *
 * - If BLOB_READ_WRITE_TOKEN is set (production on Vercel), uses Vercel Blob.
 * - Otherwise (local dev), writes to /public/uploads.
 */
export async function saveUpload(
  file: File,
  prefix = "seating"
): Promise<{ url: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
  const key = `${prefix}/${Date.now()}-${safeName}`;

  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(key, file, {
      access: "public",
      token,
      addRandomSuffix: true,
    });
    return { url: blob.url };
  }

  // Local fallback.
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const buf = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${Date.now()}-${safeName}`;
  await fs.writeFile(path.join(dir, fileName), buf);
  return { url: `/uploads/${fileName}` };
}
