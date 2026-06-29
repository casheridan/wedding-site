import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSiteContent } from "@/lib/content";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteContent();

  return (
    <>
      <SiteHeader coupleNames={site.coupleNames} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        coupleNames={site.coupleNames}
        dateDisplay={site.weddingDateDisplay}
        locationShort={site.weddingLocationShort}
        hashtag={site.hashtag}
      />
    </>
  );
}
