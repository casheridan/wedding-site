"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadSeatingImage } from "@/lib/client-upload";
import { createBlankMap } from "@/server/seating-admin";
import { adminInputClass, adminLabelClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

export function SeatingStart() {
  const router = useRouter();

  // Blank-room form
  const [name, setName] = useState("Reception");
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(30);
  const [creating, startCreate] = useTransition();

  // Image upload
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function createRoom() {
    startCreate(async () => {
      await createBlankMap({ name, roomWidth: width, roomHeight: height });
      router.refresh();
    });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    const res = await uploadSeatingImage(file);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Build from scratch */}
      <div className="rounded-2xl border border-sage-200 bg-white p-7">
        <p className="font-display text-2xl text-sage-800">
          Design a room from scratch
        </p>
        <p className="mt-2 text-sm text-ink/60">
          Set your room size, then drop tables, a dance floor, a bar, doors, and
          labels onto a blank floor plan — no photo needed.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className={adminLabelClass}>Room name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={adminInputClass}
              placeholder="Reception"
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className={adminLabelClass}>Width (ft)</label>
              <input
                type="number"
                min={4}
                max={1000}
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className={adminInputClass}
              />
            </div>
            <span className="pb-3 text-ink/40">×</span>
            <div className="flex-1">
              <label className={adminLabelClass}>Length (ft)</label>
              <input
                type="number"
                min={4}
                max={1000}
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className={adminInputClass}
              />
            </div>
          </div>
          <p className="text-xs text-ink/45">
            Sets the canvas shape and a scale reference. You can change it later.
          </p>
          <Button type="button" onClick={createRoom} disabled={creating}>
            {creating ? "Creating…" : "Create blank room"}
          </Button>
        </div>
      </div>

      {/* Upload an image */}
      <div className="rounded-2xl border-2 border-dashed border-sage-200 bg-white p-7 text-center">
        <p className="font-display text-2xl text-sage-800">
          Or start from a photo
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
          Have a diagram from your venue or a sketch? Upload it and drop tables
          and labels on top. PNG or JPG, up to 8&nbsp;MB.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-sage-500 px-6 py-3 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Choose image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        {error && <p className="mt-4 text-sm text-blush-500">{error}</p>}
      </div>
    </div>
  );
}
