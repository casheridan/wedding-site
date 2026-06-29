/**
 * Central wedding content.
 *
 * Everything here is placeholder content you can edit directly. Later in the
 * build, a subset of these fields (names, date, venue, attire, registries, FAQ,
 * seating password) becomes editable from the admin dashboard and will override
 * these defaults — but this file is always the safe fallback, and the site runs
 * entirely from it with no database.
 */

export type NavLink = { href: string; label: string };

export type RegistryLink = {
  name: string;
  url: string;
  description?: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ScheduleItem = {
  time: string;
  title: string;
  description?: string;
};

export type RsvpQuestion = {
  /** Stable id used to key answers and reference from conditional questions. */
  id: string;
  /** The question text shown to guests. */
  label: string;
  /** If non-empty, renders a dropdown of these choices instead of a text box. */
  options?: string[];
  /** Require an answer (only enforced for attending guests when visible). */
  required?: boolean;
  /**
   * Conditional display: only show this question when the answer to an earlier
   * question (`questionId`) exactly equals `value`. Omit to always show.
   */
  showIf?: { questionId: string; value: string };
};

export type Place = {
  name: string;
  address: string;
  /** Optional Google Maps link (or any map URL). */
  mapUrl?: string;
  /** e.g. "4:00 PM" */
  time?: string;
  notes?: string;
};

export const siteConfig = {
  couple: {
    partnerA: "Christian",
    partnerB: "Ally",
  },

  /** Shown in the page title, header, and footer. */
  get coupleNames() {
    return `${this.couple.partnerA} & ${this.couple.partnerB}`;
  },

  /** Social hashtag (optional — set to "" to hide). */
  hashtag: "#ChristianAndAlly2026",

  /**
   * Ceremony start, in ISO 8601 WITH a timezone offset. This drives the
   * live countdown, so the offset matters. Example below is US Central.
   */
  weddingDate: "2026-09-19T16:00:00-05:00",
  /** Human-friendly versions for display. */
  weddingDateDisplay: "Saturday, September 19, 2026",
  weddingTimeDisplay: "4:00 in the afternoon",
  weddingLocationShort: "Charleston, South Carolina",

  /** A short welcome line on the home page. */
  tagline: "Together with our families, we invite you to celebrate our wedding.",

  venue: {
    ceremony: {
      name: "The Magnolia Gardens",
      address: "123 Live Oak Lane, Charleston, SC 29401",
      mapUrl: "https://maps.google.com/?q=Charleston+SC",
      time: "4:00 PM",
      notes: "Ceremony begins promptly — please arrive 20 minutes early.",
    } as Place,
    reception: {
      name: "The Magnolia Gardens — Grand Ballroom",
      address: "123 Live Oak Lane, Charleston, SC 29401",
      mapUrl: "https://maps.google.com/?q=Charleston+SC",
      time: "5:30 PM",
      notes: "Cocktails, dinner, and dancing to follow.",
    } as Place,
  },

  attire: {
    title: "Garden Formal",
    description:
      "Think cocktail attire with a romantic, garden-party feel. Suits or sport coats, cocktail dresses or dressy separates.",
    notes: [
      "The ceremony and cocktail hour are on grass — kitten heels or flats are your friend.",
      "Evenings can cool down; a light layer is a good idea.",
    ],
    /** Our wedding palette — feel free to take cues from these colors. */
    palette: [
      { name: "Dusty Blue", hex: "#7f97ad" },
      { name: "Lavender", hex: "#beabd4" },
      { name: "Sage Green", hex: "#aab891" },
      { name: "Peach", hex: "#f7baa6" },
      { name: "Cream", hex: "#f5f1e8" },
    ],
  },

  /** Day-of timeline. Add or remove items freely. */
  schedule: [
    { time: "3:30 PM", title: "Guest Arrival" },
    { time: "4:00 PM", title: "Ceremony", description: "The Magnolia Gardens lawn" },
    { time: "4:45 PM", title: "Cocktail Hour", description: "Garden terrace" },
    { time: "5:30 PM", title: "Reception", description: "Dinner & dancing in the Grand Ballroom" },
    { time: "10:00 PM", title: "Send-Off" },
  ] as ScheduleItem[],

  registries: [
    {
      name: "The Knot",
      url: "https://registry.theknot.com/christian-sheridan-allyson-attigliato-august-2026-mo/77061197",
      description: "Our registry lives on The Knot — gifts, experiences, and a cash fund, all in one place.",
    },
  ] as RegistryLink[],

  /** "What to be aware of" — the practical things guests ask about. */
  faq: [
    {
      question: "Are kids welcome?",
      answer:
        "We love your little ones, but this will be an adults-only celebration so everyone can relax and enjoy the evening.",
    },
    {
      question: "Where should I park?",
      answer:
        "Complimentary self-parking is available on-site, with valet at the main entrance.",
    },
    {
      question: "Is the venue indoors or outdoors?",
      answer:
        "The ceremony and cocktail hour are outdoors (weather permitting), and the reception is indoors. We have a covered backup plan in case of rain.",
    },
    {
      question: "What about accommodations?",
      answer:
        "We've reserved a room block at The Harbor Hotel — mention the wedding when booking for the group rate.",
    },
    {
      question: "Can I take photos during the ceremony?",
      answer:
        "We're having an unplugged ceremony — please keep phones tucked away so everyone can be fully present. Our photographer will capture it all!",
    },
  ] as FaqItem[],

  /** Optional travel / accommodation pointers shown on the Details page. */
  travel: [
    {
      name: "The Harbor Hotel (room block)",
      address: "456 Bay Street, Charleston, SC 29401",
      mapUrl: "https://maps.google.com/?q=Charleston+SC",
      notes: "Group rate available — mention the wedding when booking.",
    },
  ] as Place[],

  rsvp: {
    /** Shown on the RSVP page. Set to "" to hide the deadline note. */
    deadlineDisplay: "August 1, 2026",
    /** Meal choices in the RSVP form. Set to [] to hide meal selection. */
    mealOptions: [
      "Herb-Roasted Chicken",
      "Filet Mignon",
      "Pan-Seared Salmon",
      "Garden Risotto (vegetarian)",
    ],
    /** Total max guests per RSVP (the primary guest + plus-ones). */
    maxPartySize: 6,
    /** Collect a song request? */
    askSongRequest: true,
    /**
     * Extra questions you define in the admin. Shown to attending guests.
     * Each needs a stable `id`; add an `options` list to make it a dropdown.
     */
    questions: [] as RsvpQuestion[],
    /** Extra questions asked for each party member marked as a child. */
    childQuestions: [] as RsvpQuestion[],
  },

  /** Where guests can reach you with questions. */
  contactEmail: "hello@example.com",
};

/** Public navigation. */
export const navLinks: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/details", label: "Details" },
  { href: "/registry", label: "Registry" },
  { href: "/announcements", label: "Announcements" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/seating", label: "Find Your Seat" },
];

export type SiteConfig = typeof siteConfig;
