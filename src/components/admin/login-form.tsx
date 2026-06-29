"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/admin-auth";
import { Button } from "@/components/ui/button";

const initial: LoginState = {};

const inputClass =
  "w-full rounded-lg border border-sage-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-ink/80"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-ink/80"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-blush-50 px-4 py-3 text-sm text-blush-500">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
