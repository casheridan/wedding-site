import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import type { Place } from "@/config/site";
import { Section } from "@/components/ui/section";
import { Divider } from "@/components/ui/divider";

export const metadata: Metadata = {
  title: "Details",
  description: "Location, timing, attire, and everything you need to know.",
};

function PlaceCard({ label, place }: { label: string; place: Place }) {
  return (
    <div className="rounded-2xl border border-sage-100 bg-ivory p-7">
      <p className="eyebrow">{label}</p>
      <h3 className="mt-2 text-2xl text-sage-800">{place.name}</h3>
      {place.time && (
        <p className="mt-1 font-display text-lg text-blush-500">{place.time}</p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{place.address}</p>
      {place.notes && (
        <p className="mt-3 text-sm italic leading-relaxed text-ink/60">
          {place.notes}
        </p>
      )}
      {place.mapUrl && (
        <a
          href={place.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-xs uppercase tracking-widest text-sage-600 hover:text-sage-700"
        >
          View on map →
        </a>
      )}
    </div>
  );
}

export default async function DetailsPage() {
  const site = await getSiteContent();

  return (
    <>
      <Section
        eyebrow="The Details"
        title="Everything You Need to Know"
        description={`${site.weddingDateDisplay} · ${site.weddingTimeDisplay}`}
        className="pb-8"
      />

      {/* Location */}
      <Section title="Where" className="py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <PlaceCard label="Ceremony" place={site.venue.ceremony} />
          <PlaceCard label="Reception" place={site.venue.reception} />
        </div>
      </Section>

      {/* Schedule */}
      {site.schedule.length > 0 && (
        <Section title="Schedule" className="py-8">
          <ol className="mx-auto max-w-2xl divide-y divide-sage-100 border-y border-sage-100">
            {site.schedule.map((item) => (
              <li
                key={`${item.time}-${item.title}`}
                className="flex items-baseline gap-6 py-4"
              >
                <span className="w-24 shrink-0 font-display text-lg text-blush-500">
                  {item.time}
                </span>
                <span className="flex-1">
                  <span className="block text-lg text-sage-800">
                    {item.title}
                  </span>
                  {item.description && (
                    <span className="block text-sm text-ink/60">
                      {item.description}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Attire */}
      <Section title="Attire" className="bg-cream/40 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-2xl text-blush-500">
            {site.attire.title}
          </p>
          <p className="mt-3 text-base leading-relaxed text-ink/75">
            {site.attire.description}
          </p>
          {site.attire.palette.length > 0 && (
            <div className="mt-8">
              <p className="eyebrow">Our Palette</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-6">
                {site.attire.palette.map((color) => (
                  <li key={color.name} className="flex flex-col items-center gap-2">
                    <span
                      className="h-12 w-12 rounded-full border border-ink/10 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden
                    />
                    <span className="text-xs tracking-wide text-ink/65">
                      {color.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {site.attire.notes.length > 0 && (
            <ul className="mt-6 space-y-2 text-left">
              {site.attire.notes.map((note) => (
                <li
                  key={note}
                  className="flex gap-3 text-sm leading-relaxed text-ink/70"
                >
                  <span className="text-blush-400">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* Travel / accommodations */}
      {site.travel.length > 0 && (
        <Section title="Travel & Stay" className="py-8">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            {site.travel.map((place) => (
              <PlaceCard key={place.name} label="Where to Stay" place={place} />
            ))}
          </div>
        </Section>
      )}

      {/* What to be aware of (FAQ) */}
      {site.faq.length > 0 && (
        <Section
          eyebrow="Good to Know"
          title="What to Be Aware Of"
          className="py-12"
        >
          <div className="mx-auto max-w-2xl space-y-6">
            {site.faq.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-sage-100 bg-ivory p-6"
              >
                <h3 className="text-lg text-sage-800">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          <Divider className="mt-14" />
          <p className="mt-6 text-center text-sm text-ink/60">
            Still have a question?{" "}
            <a
              href={`mailto:${site.contactEmail}`}
              className="text-sage-700 underline-offset-4 hover:underline"
            >
              {site.contactEmail}
            </a>
          </p>
        </Section>
      )}
    </>
  );
}
