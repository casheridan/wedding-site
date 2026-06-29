"use server";

import { redirect } from "next/navigation";
import { verifySeatingPassword, startSeatingSession } from "@/lib/auth";

export type GateState = { error?: string };

export async function unlockSeating(
  _prev: GateState,
  formData: FormData
): Promise<GateState> {
  const password = String(formData.get("password") ?? "");
  if (!(await verifySeatingPassword(password))) {
    return { error: "That password didn't match. Please try again." };
  }
  await startSeatingSession();
  redirect("/seating");
}
