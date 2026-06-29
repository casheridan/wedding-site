import { getSiteContent } from "@/lib/content";
import { getSeatingPassword } from "@/lib/auth";
import { PageHeading } from "@/components/admin/ui";
import {
  SettingsForm,
  type SettingsInitial,
  type SettingsLists,
} from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const site = await getSiteContent();
  const seatingPassword = (await getSeatingPassword()) ?? "";

  const initial: SettingsInitial = {
    partnerA: site.couple.partnerA,
    partnerB: site.couple.partnerB,
    hashtag: site.hashtag,
    tagline: site.tagline,
    weddingDate: site.weddingDate,
    weddingDateDisplay: site.weddingDateDisplay,
    weddingTimeDisplay: site.weddingTimeDisplay,
    weddingLocationShort: site.weddingLocationShort,
    contactEmail: site.contactEmail,
    ceremonyName: site.venue.ceremony.name,
    ceremonyAddress: site.venue.ceremony.address,
    ceremonyMapUrl: site.venue.ceremony.mapUrl ?? "",
    ceremonyTime: site.venue.ceremony.time ?? "",
    receptionName: site.venue.reception.name,
    receptionAddress: site.venue.reception.address,
    receptionMapUrl: site.venue.reception.mapUrl ?? "",
    receptionTime: site.venue.reception.time ?? "",
    attireTitle: site.attire.title,
    attireDescription: site.attire.description,
    rsvpDeadline: site.rsvp.deadlineDisplay,
    maxPartySize: String(site.rsvp.maxPartySize),
    askSongRequest: site.rsvp.askSongRequest ? "1" : "",
    seatingPassword,
  };

  const lists: SettingsLists = {
    attireNotes: site.attire.notes,
    schedule: site.schedule,
    travel: site.travel,
    faq: site.faq,
    mealOptions: site.rsvp.mealOptions,
    rsvpQuestions: site.rsvp.questions,
  };

  return (
    <>
      <PageHeading
        title="Site settings"
        description="Edit the core details shown across your site, including the schedule, attire notes, travel info, and FAQ on the Details page."
      />
      <SettingsForm initial={initial} lists={lists} />
    </>
  );
}
