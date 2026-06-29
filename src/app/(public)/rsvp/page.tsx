import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { isRsvpLocked, hasSeatingAccess } from "@/lib/auth";
import { Section } from "@/components/ui/section";
import { RsvpForm } from "@/components/rsvp-form";
import { RsvpGate } from "@/components/rsvp-gate";

export const metadata: Metadata = {
  title: "RSVP",
  description: "Let us know if you can make it.",
};

export const dynamic = "force-dynamic";

export default async function RsvpPage() {
  const site = await getSiteContent();
  const locked = await isRsvpLocked();
  const gated = locked && !(await hasSeatingAccess());

  return (
    <Section
      eyebrow="RSVP"
      title="Will You Join Us?"
      description={
        !gated && site.rsvp.deadlineDisplay
          ? `Kindly respond by ${site.rsvp.deadlineDisplay}.`
          : undefined
      }
    >
      {gated ? (
        <RsvpGate />
      ) : (
        <RsvpForm
          mealOptions={site.rsvp.mealOptions}
          maxPartySize={site.rsvp.maxPartySize}
          askSongRequest={site.rsvp.askSongRequest}
          questions={site.rsvp.questions}
          childQuestions={site.rsvp.childQuestions}
        />
      )}
    </Section>
  );
}
