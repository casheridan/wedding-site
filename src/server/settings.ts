"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import type { ContentOverride } from "@/lib/content";
import type {
  ScheduleItem,
  Place,
  FaqItem,
  RsvpQuestion,
} from "@/config/site";

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

/**
 * Parse the RSVP custom-questions editor payload. Preserves each question's
 * stable `id`, sanitizes choices, and keeps a `showIf` conditional only when it
 * references a question defined *earlier* in the list (prevents cycles/dangles).
 */
function parseRsvpQuestions(raw: string): RsvpQuestion[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const out: RsvpQuestion[] = [];
  const seenIds = new Set<string>();

  for (const item of data.slice(0, 50)) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const label = String(r.label ?? "").slice(0, 300).trim();
    if (!label) continue;

    let id = String(r.id ?? "").slice(0, 64).trim();
    if (!id || seenIds.has(id)) id = `q${out.length + 1}`;
    seenIds.add(id);

    const options = Array.isArray(r.options)
      ? r.options
          .map((o) => String(o ?? "").slice(0, 200).trim())
          .filter(Boolean)
      : [];

    const question: RsvpQuestion = {
      id,
      label,
      ...(options.length > 0 ? { options } : {}),
      ...(r.required === true ? { required: true } : {}),
    };

    const showIf = r.showIf as Record<string, unknown> | undefined;
    if (showIf && typeof showIf === "object") {
      const questionId = String(showIf.questionId ?? "").trim();
      const value = String(showIf.value ?? "").slice(0, 200).trim();
      // Only honor references to an already-defined (earlier) question.
      if (questionId && value && questionId !== id && seenIds.has(questionId)) {
        question.showIf = { questionId, value };
      }
    }

    out.push(question);
  }
  return out;
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

  const mealOptions = rows("mealOptionsJson")
    .map((r) => r.text)
    .filter(Boolean);

  const rsvpQuestions = parseRsvpQuestions(
    String(formData.get("rsvpQuestionsJson") ?? "")
  );

  const partySizeNum = parseInt(s("maxPartySize"), 10);
  const maxPartySize =
    Number.isFinite(partySizeNum) && partySizeNum > 0
      ? Math.min(partySizeNum, 20)
      : undefined;

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
    rsvp: {
      deadlineDisplay: s("rsvpDeadline"),
      mealOptions,
      askSongRequest: formData.get("askSongRequest") === "on",
      questions: rsvpQuestions,
      ...(maxPartySize ? { maxPartySize } : {}),
    },
  };

  try {
    await setSetting("content", content);
    await setSetting("rsvpLocked", formData.get("rsvpLocked") === "on");
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
