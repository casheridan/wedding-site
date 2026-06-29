import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Registry",
  description: "Gift registry.",
};

export default async function RegistryPage() {
  const site = await getSiteContent();

  return (
    <Section
      eyebrow="Registry"
      title="Your Presence Is the Gift"
      description="Truly — celebrating with you is all we want. But for those who have asked, we've gathered everything in one place."
    >
      <div
        className={`mx-auto grid gap-6 ${
          site.registries.length > 1 ? "max-w-3xl sm:grid-cols-2" : "max-w-md"
        }`}
      >
        {site.registries.map((registry) => (
          <a
            key={registry.name}
            href={registry.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl border border-sage-100 bg-ivory p-8 text-center transition-shadow hover:shadow-md"
          >
            <h3 className="text-2xl text-sage-800 group-hover:text-sage-700">
              {registry.name}
            </h3>
            {registry.description && (
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">
                {registry.description}
              </p>
            )}
            <span className="mt-5 inline-block text-xs uppercase tracking-widest text-blush-500">
              Visit registry →
            </span>
          </a>
        ))}
      </div>
    </Section>
  );
}
