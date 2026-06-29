import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in → go to dashboard.
  if (await getAdminSession()) redirect("/admin");

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl text-sage-800">
            {siteConfig.coupleNames}
          </p>
          <p className="eyebrow mt-2">Admin</p>
        </div>
        <div className="rounded-2xl border border-sage-100 bg-white p-7 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
