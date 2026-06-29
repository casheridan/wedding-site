import { cache } from "react";
import {
  siteConfig,
  type SiteConfig,
  type Place,
  type ScheduleItem,
  type FaqItem,
  type RsvpQuestion,
} from "@/config/site";
import { getSetting } from "@/lib/settings";

export type ContentOverride = {
  couple?: { partnerA?: string; partnerB?: string };
  hashtag?: string;
  weddingDate?: string;
  weddingDateDisplay?: string;
  weddingTimeDisplay?: string;
  weddingLocationShort?: string;
  tagline?: string;
  contactEmail?: string;
  venue?: {
    ceremony?: Partial<Place>;
    reception?: Partial<Place>;
  };
  attire?: { title?: string; description?: string; notes?: string[] };
  schedule?: ScheduleItem[];
  travel?: Place[];
  faq?: FaqItem[];
  rsvp?: {
    deadlineDisplay?: string;
    mealOptions?: string[];
    maxPartySize?: number;
    askSongRequest?: boolean;
    questions?: RsvpQuestion[];
    childQuestions?: RsvpQuestion[];
  };
};

/** Drop undefined / empty-string values so blank fields fall back to defaults. */
function clean<T extends object>(obj?: Partial<T>): Partial<T> {
  if (!obj) return {};
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== "")
  ) as Partial<T>;
}

/**
 * Site content: admin-edited settings merged over the static config defaults.
 * Wrapped in React cache() so repeated calls within one request hit the DB once.
 */
export const getSiteContent = cache(async (): Promise<SiteConfig> => {
  let override: ContentOverride | null = null;
  try {
    override = await getSetting<ContentOverride>("content");
  } catch {
    // If the DB is unreachable, fall back to static config.
    return siteConfig;
  }
  if (!override) return siteConfig;

  const couple = { ...siteConfig.couple, ...clean(override.couple) };

  return {
    ...siteConfig,
    couple,
    coupleNames: `${couple.partnerA} & ${couple.partnerB}`,
    hashtag: override.hashtag ?? siteConfig.hashtag,
    weddingDate: override.weddingDate || siteConfig.weddingDate,
    weddingDateDisplay:
      override.weddingDateDisplay || siteConfig.weddingDateDisplay,
    weddingTimeDisplay:
      override.weddingTimeDisplay || siteConfig.weddingTimeDisplay,
    weddingLocationShort:
      override.weddingLocationShort || siteConfig.weddingLocationShort,
    tagline: override.tagline || siteConfig.tagline,
    contactEmail: override.contactEmail || siteConfig.contactEmail,
    venue: {
      ceremony: {
        ...siteConfig.venue.ceremony,
        ...clean(override.venue?.ceremony),
      },
      reception: {
        ...siteConfig.venue.reception,
        ...clean(override.venue?.reception),
      },
    },
    attire: { ...siteConfig.attire, ...clean(override.attire) },
    schedule: override.schedule ?? siteConfig.schedule,
    travel: override.travel ?? siteConfig.travel,
    faq: override.faq ?? siteConfig.faq,
    rsvp: { ...siteConfig.rsvp, ...clean(override.rsvp) },
  };
});
