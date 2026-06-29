"use server";

import { redirect } from "next/navigation";
import {
  verifyAdminCredentials,
  startAdminSession,
  endAdminSession,
} from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const session = await verifyAdminCredentials(email, password);
  if (!session) {
    return { error: "Incorrect email or password." };
  }

  await startAdminSession(session);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}
