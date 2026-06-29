import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream/30">
      <AdminNav email={session.email} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
