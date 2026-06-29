import { prisma } from "@/lib/db";
import {
  PageHeading,
  Card,
  adminInputClass,
  adminLabelClass,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { formatDate } from "@/lib/utils";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/server/announcements";

export const dynamic = "force-dynamic";

function CheckboxRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink/75">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-sage-300 text-sage-600 focus:ring-sage-300"
      />
      {label}
    </label>
  );
}

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeading
        title="Announcements"
        description="Share updates with your guests. Published announcements appear on the public site."
      />

      {/* New announcement */}
      <Card>
        <h2 className="mb-4 text-lg text-sage-800">New announcement</h2>
        <form action={createAnnouncement} className="space-y-4">
          <div>
            <label htmlFor="new-title" className={adminLabelClass}>
              Title
            </label>
            <input
              id="new-title"
              name="title"
              required
              maxLength={200}
              className={adminInputClass}
            />
          </div>
          <div>
            <label htmlFor="new-body" className={adminLabelClass}>
              Message
            </label>
            <textarea
              id="new-body"
              name="body"
              required
              rows={3}
              maxLength={5000}
              className={`${adminInputClass} resize-y`}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-5">
              <CheckboxRow name="pinned" label="Pin to top" />
              <CheckboxRow name="published" label="Publish now" defaultChecked />
            </div>
            <Button type="submit">Post announcement</Button>
          </div>
        </form>
      </Card>

      {/* Existing announcements */}
      <div className="mt-8 space-y-4">
        <h2 className="text-lg text-sage-800">
          All announcements ({announcements.length})
        </h2>

        {announcements.length === 0 && (
          <Card className="text-center text-ink/55">
            No announcements yet.
          </Card>
        )}

        {announcements.map((a) => (
          <Card key={a.id}>
            <form action={updateAnnouncement} className="space-y-3">
              <input type="hidden" name="id" value={a.id} />
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {a.pinned && (
                    <span className="rounded-full bg-blush-100 px-2 py-0.5 font-semibold uppercase tracking-wide text-blush-500">
                      Pinned
                    </span>
                  )}
                  <span
                    className={
                      a.published
                        ? "rounded-full bg-sage-100 px-2 py-0.5 font-semibold uppercase tracking-wide text-sage-700"
                        : "rounded-full bg-ink/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-ink/50"
                    }
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>
                  <span className="text-ink/45">
                    {formatDate(a.createdAt)}
                  </span>
                </div>
              </div>

              <input
                name="title"
                required
                defaultValue={a.title}
                maxLength={200}
                className={adminInputClass}
              />
              <textarea
                name="body"
                required
                defaultValue={a.body}
                rows={3}
                maxLength={5000}
                className={`${adminInputClass} resize-y`}
              />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-5">
                  <CheckboxRow
                    name="pinned"
                    label="Pinned"
                    defaultChecked={a.pinned}
                  />
                  <CheckboxRow
                    name="published"
                    label="Published"
                    defaultChecked={a.published}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <ConfirmButton
                    formAction={deleteAnnouncement}
                    message="Delete this announcement?"
                    className="rounded-full px-4 py-2 text-sm text-blush-500 transition-colors hover:bg-blush-50"
                  >
                    Delete
                  </ConfirmButton>
                  <Button type="submit" variant="outline">
                    Save
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        ))}
      </div>
    </>
  );
}
