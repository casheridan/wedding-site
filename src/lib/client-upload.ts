/** Client-side helper to upload a seating-map image. Browser-only. */

export type UploadResult = {
  ok?: boolean;
  mapId?: string;
  url?: string;
  error?: string;
};

function readDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export async function uploadSeatingImage(
  file: File,
  mapId?: string
): Promise<UploadResult> {
  const dims = await readDimensions(file).catch(() => ({
    width: 0,
    height: 0,
  }));
  const fd = new FormData();
  fd.set("file", file);
  if (dims.width) fd.set("width", String(dims.width));
  if (dims.height) fd.set("height", String(dims.height));
  if (mapId) fd.set("mapId", mapId);

  const res = await fetch("/admin/seating/upload", {
    method: "POST",
    body: fd,
  });
  return res.json();
}
