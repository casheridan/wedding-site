"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadSeatingImage } from "@/lib/client-upload";

export function SeatingUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="rounded-2xl border-2 border-dashed border-sage-200 bg-white p-10 text-center">
      <p className="font-display text-2xl text-sage-800">
        Upload your room map
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
        Add a photo or diagram of your reception layout (a hand-drawn sketch,
        a photo of the venue&apos;s plan, or an image you made). You&apos;ll
        then drop named pins onto it. PNG or JPG, up to 8&nbsp;MB.
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-sage-600 px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-sage-700 disabled:opacity-60"
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
  );
}
