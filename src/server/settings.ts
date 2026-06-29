"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import type { ContentOverride } from "@/lib/content";
import type { ScheduleItem, Place, FaqItem } from "@/config/site";

export type SettingsState = { ok?: boolean; error?: string };

/**
 * Parse a JSON-serialized list of row objects coming from a list editor.
 * Coerces every value to a trimmed, length-capped string and ignores anything
 * that isn't a plain array of objects, so bad input can never crash the save.
 */
function parseRows(raw: string): Record<string, string>[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.slice(0, 50).map((row) => {
      const out: Record<string, string> = {};
      if (row && typeof row === "object") {
        for (const [k, v] of Object.entries(row)) {
          out[k] = String(v ?? "").slice(0, 2000).trim();
        }
      }
      return out;
    });
  } catch {
    return [];
  }
}

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const s = (k: string) => String(formData.get(k) ?? "").trim();
  const rows = (k: string) => parseRows(String(formData.get(k) ?? ""));

  const attireNotes = rows("attireNotesJson")
    .map((r) => r.text)
    .filter(Boolean);

  const schedule: ScheduleItem[] = rows("scheduleJson")
    .filter((r) => r.time || r.title)
    .map((r) => ({
      time: r.time,
      title: r.title,
      ...(r.description ? { description: r.description } : {}),
    }));

  const travel: Place[] = rows("travelJson")
    .filter((r) => r.name || r.address)
    .map((r) => ({
      name: r.name,
      address: r.address,
      ...(r.mapUrl ? { mapUrl: r.mapUrl } : {}),
      ...(r.notes ? { notes: r.notes } : {}),
    }));

  const faq: FaqItem[] = rows("faqJson")
    .filter((r) => r.question || r.answer)
    .map((r) => ({ question: r.question, answer: r.answer }));

  const content: ContentOverride = {
    couple: { partnerA: s("partnerA"), partnerB: s("partnerB") },
    hashtag: s("hashtag"),
    weddingDate: s("weddingDate"),
    weddingDateDisplay: s("weddingDateDisplay"),
    weddingTimeDisplay: s("weddingTimeDisplay"),
    weddingLocationShort: s("weddingLocationShort"),
    tagline: s("tagline"),
    contactEmail: s("contactEmail"),
    venue: {
      ceremony: {
        name: s("ceremonyName"),
        address: s("ceremonyAddress"),
        mapUrl: s("ceremonyMapUrl"),
        time: s("ceremonyTime"),
      },
      reception: {
        name: s("receptionName"),
        address: s("receptionAddress"),
        mapUrl: s("receptionMapUrl"),
        time: s("receptionTime"),
      },
    },
    attire: {
      title: s("attireTitle"),
      description: s("attireDescription"),
      notes: attireNotes,
    },
    schedule,
    travel,
    faq,
    rsvp: { deadlineDisplay: s("rsvpDeadline") },
  };

  try {
    await setSetting("content", content);
    const seatingPassword = s("seatingPassword");
    if (seatingPassword) {
      await setSetting("seatingPassword", seatingPassword);
    }
  } catch (err) {
    console.error("Failed to save settings:", err);
    return { error: "Couldn't save settings. Please try again." };
  }

  // Refresh every public page so changes show immediately.
  revalidatePath("/", "layout");
  return { ok: true };
}
