import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { Countdown } from "@/components/countdown";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Divider } from "@/components/ui/divider";
import { ButtonLink } from "@/components/ui/button";

export default async function HomePage() {
  const site = await getSiteContent();

  const quickLinks = [
    {
      href: "/details",
      title: "The Details",
      description: "Location, timing, attire, and everything to know.",
    },
    {
      href: "/registry",
      title: "Registry",
      description: "Your presence is the gift — but if you insist.",
    },
    {
      href: "/seating",
      title: "Find Your Seat",
      description: "Look up your table on the day.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream/70 via-ivory to-ivory">
        <Container className="flex flex-col items-center py-24 text-center sm:py-32">
          <p className="eyebrow">We&apos;re getting married</p>

          <h1 className="mt-6 text-6xl leading-none text-sage-800 sm:text-8xl">
            {site.couple.partnerA}
            <span className="mx-3 text-blush-400">&amp;</span>
            {site.couple.partnerB}
          </h1>

          <Divider className="my-8" />

          <p className="text-lg text-ink/75 sm:text-xl">
            {site.weddingDateDisplay}
          </p>
          <p className="mt-1 text-base text-ink/60">
            {site.weddingLocationShort}
          </p>

          <p className="mt-8 max-w-xl text-base leading-relaxed text-ink/70">
            {site.tagline}
          </p>

          <div className="mt-12">
            <Countdown date={site.weddingDate} />
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink href="/rsvp">RSVP</ButtonLink>
            <ButtonLink href="/details" variant="outline">
              View Details
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Schedule preview */}
      {site.schedule.length > 0 && (
        <Section eyebrow="The Day" title="A Look at the Schedule">
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

      {/* Quick links */}
      <Section className="bg-cream/40">
        <div className="grid gap-6 sm:grid-cols-3">
          {quickLinks.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-sage-100 bg-ivory p-8 text-center transition-shadow hover:shadow-md"
            >
              <h3 className="text-2xl text-sage-800 group-hover:text-sage-700">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                {card.description}
              </p>
              <span className="mt-5 inline-block text-xs uppercase tracking-widest text-blush-500">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
