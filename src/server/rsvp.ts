"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";

const guestSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  meal: z.string().trim().max(120).optional().default(""),
  dietary: z.string().trim().max(500).optional().default(""),
});

const rsvpSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.string().trim().email("Please enter a valid email").max(200),
  attending: z.enum(["yes", "no"]),
  primaryMeal: z.string().trim().max(120).optional().default(""),
  primaryDietary: z.string().trim().max(500).optional().default(""),
  additionalGuests: z.array(guestSchema).max(20).optional().default([]),
  songRequest: z.string().trim().max(300).optional().default(""),
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

  // Normalize attendees: primary guest first, then plus-ones.
  const guests = attending
    ? [
        {
          name: data.name,
          meal: data.primaryMeal,
          dietary: data.primaryDietary,
          isPrimary: true,
        },
        ...data.additionalGuests.map((g) => ({ ...g, isPrimary: false })),
      ]
    : [];

  try {
    await prisma.rsvp.create({
      data: {
        name: data.name,
        email: data.email,
        attending,
        partySize: guests.length,
        songRequest: attending ? data.songRequest || null : null,
        message: data.message || null,
        guests: {
          create: guests.map((g) => ({
            name: g.name,
            meal: g.meal || null,
            dietary: g.dietary || null,
            isPrimary: g.isPrimary,
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
