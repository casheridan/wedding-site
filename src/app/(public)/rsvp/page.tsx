import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { RsvpForm } from "@/components/rsvp-form";

export const metadata: Metadata = {
  title: "RSVP",
  description: "Let us know if you can make it.",
};

export default async function RsvpPage() {
  const site = await getSiteContent();

  return (
    <Section
      eyebrow="RSVP"
      title="Will You Join Us?"
      description={
        site.rsvp.deadlineDisplay
          ? `Kindly respond by ${site.rsvp.deadlineDisplay}.`
          : undefined
      }
    >
      <RsvpForm
        mealOptions={site.rsvp.mealOptions}
        maxPartySize={site.rsvp.maxPartySize}
        askSongRequest={site.rsvp.askSongRequest}
      />
    </Section>
  );
}
