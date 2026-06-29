"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSiteContent } from "@/lib/content";
import { visibleQuestionIds } from "@/lib/rsvp-questions";
import { verifySeatingPassword, startSeatingSession } from "@/lib/auth";

export type RsvpGateState = { error?: string };

/** Unlock the RSVP page using the shared guest password (same as seating). */
export async function unlockRsvp(
  _prev: RsvpGateState,
  formData: FormData
): Promise<RsvpGateState> {
  const password = String(formData.get("password") ?? "");
  if (!(await verifySeatingPassword(password))) {
    return { error: "That password didn't match. Please try again." };
  }
  await startSeatingSession();
  redirect("/rsvp");
}

const guestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  meal: z.string().trim().max(120).optional().default(""),
  dietary: z.string().trim().max(500).optional().default(""),
  child: z.boolean().optional().default(false),
  answers: z.record(z.string(), z.string().max(2000)).optional().default({}),
});

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  attending: z.enum(["yes", "no"]),
  primaryMeal: z.string().trim().max(120).optional().default(""),
  primaryDietary: z.string().trim().max(500).optional().default(""),
  additionalGuests: z.array(guestSchema).max(20).optional().default([]),
  songRequest: z.string().trim().max(300).optional().default(""),
  answers: z.record(z.string(), z.string().max(2000)).optional().default({}),
  message: z.string().trim().max(2000).optional().default(""),
});

export type RsvpInput = z.input<typeof rsvpSchema>;

export type RsvpResult = {
  ok: boolean;
  message: string;
};

export async function submitRsvp(input: unknown): Promise<RsvpResult> {
  const parsed = rsvpSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check the form.";
    return { ok: false, message: first };
  }

  const data = parsed.data;
  const attending = data.attending === "yes";

  type Snapshot = { question: string; answer: string }[];
  type GuestRow = {
    name: string;
    meal: string;
    dietary: string;
    isPrimary: boolean;
    isChild: boolean;
    customAnswers: Snapshot | null;
  };

  // Snapshot a set of question answers (label + answer) and enforce required
  // ones, so responses stay readable even if questions change later.
  function collect(
    questions: { id: string; label: string; required?: boolean }[],
    raw: Record<string, string>,
    visible: Set<string>
  ): Snapshot | { error: string } {
    const snap: Snapshot = [];
    for (const q of questions) {
      if (!visible.has(q.id)) continue;
      const answer = (raw[q.id] ?? "").trim();
      if (q.required && !answer) return { error: q.label };
      if (answer) snap.push({ question: q.label, answer });
    }
    return snap;
  }

  const customAnswers: Snapshot = [];
  const guests: GuestRow[] = [];

  if (attending) {
    const site = await getSiteContent();

    // Party-level custom questions.
    const partyResult = collect(
      site.rsvp.questions,
      data.answers,
      visibleQuestionIds(site.rsvp.questions, data.answers)
    );
    if ("error" in partyResult) {
      return { ok: false, message: `Please answer: ${partyResult.error}` };
    }
    customAnswers.push(...partyResult);

    // Primary guest, then the rest of the party (with per-child answers).
    guests.push({
      name: data.name,
      meal: data.primaryMeal,
      dietary: data.primaryDietary,
      isPrimary: true,
      isChild: false,
      customAnswers: null,
    });

    const childQs = site.rsvp.childQuestions;
    for (const g of data.additionalGuests) {
      let childAnswers: Snapshot | null = null;
      if (g.child && childQs.length > 0) {
        const result = collect(
          childQs,
          g.answers,
          visibleQuestionIds(childQs, g.answers)
        );
        if ("error" in result) {
          return {
            ok: false,
            message: `Please answer "${result.error}" for ${
              g.name || "the child"
            }.`,
          };
        }
        childAnswers = result.length > 0 ? result : null;
      }
      guests.push({
        name: g.name,
        meal: g.meal,
        dietary: g.dietary,
        isPrimary: false,
        isChild: g.child,
        customAnswers: childAnswers,
      });
    }
  }

  try {
    await prisma.rsvp.create({
      data: {
        name: data.name,
        email: data.email,
        attending,
        partySize: guests.length,
        songRequest: attending ? data.songRequest || null : null,
        message: data.message || null,
        customAnswers: customAnswers.length > 0 ? customAnswers : undefined,
        guests: {
          create: guests.map((g) => ({
            name: g.name,
            meal: g.meal || null,
            dietary: g.dietary || null,
            isPrimary: g.isPrimary,
            isChild: g.isChild,
            customAnswers: g.customAnswers ?? undefined,
          })),
        },
      },
    });
  } catch (err) {
    console.error("Failed to save RSVP:", err);
    return {
      ok: false,
      message: "Something went wrong saving your RSVP. Please try again.",
    };
  }

  return {
    ok: true,
    message: attending
      ? "Thank you! We can't wait to celebrate with you. 🥂"
      : "Thank you for letting us know — you'll be missed!",
  };
}
