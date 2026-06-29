"use client";

import { useActionState } from "react";
import { unlockSeating, type GateState } from "@/server/seating";
import { Button } from "@/components/ui/button";

const initial: GateState = {};

export function SeatingGate() {
  const [state, formAction, pending] = useActionState(unlockSeating, initial);

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-2xl border border-sage-100 bg-white p-7 shadow-sm">
        <p className="text-center text-sm leading-relaxed text-ink/70">
          Seating is for our guests. Please enter the password from your
          invitation to look up your table.
        </p>
        <form action={formAction} className="mt-5 space-y-4">
          <input
            name="password"
            type="password"
            required
            autoComplete="off"
            placeholder="Password"
            className="w-full rounded-lg border border-sage-200 bg-white px-4 py-2.5 text-center text-sm text-ink outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100"
          />
          {state.error && (
            <p className="rounded-lg bg-blush-50 px-4 py-3 text-center text-sm text-blush-500">
              {state.error}
            </p>
          )}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Checking…" : "View seating"}
          </Button>
        </form>
      </div>
    </div>
  );
}
