"use client";

import { useState, useTransition } from "react";
import { submitRsvp, type RsvpResult } from "@/server/rsvp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Guest = { name: string; meal: string; dietary: string };

export function RsvpForm({
  mealOptions,
  maxPartySize,
  askSongRequest,
}: {
  mealOptions: string[];
  maxPartySize: number;
  askSongRequest: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"" | "yes" | "no">("");
  const [primaryMeal, setPrimaryMeal] = useState("");
  const [primaryDietary, setPrimaryDietary] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [songRequest, setSongRequest] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RsvpResult | null>(null);

  const hasMeals = mealOptions.length > 0;
  const totalPartySize = 1 + guests.length;
  const canAddGuest = totalPartySize < maxPartySize;

  const addGuest = () =>
    setGuests((g) => [...g, { name: "", meal: "", dietary: "" }]);
  const removeGuest = (i: number) =>
    setGuests((g) => g.filter((_, idx) => idx !== i));
  const updateGuest = (i: number, patch: Partial<Guest>) =>
    setGuests((g) => g.map((guest, idx) => (idx === i ? { ...guest, ...patch } : guest)));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await submitRsvp({
        name,
        email,
        attending,
        primaryMeal,
        primaryDietary,
        additionalGuests: attending === "yes" ? guests : [],
        songRequest: attending === "yes" ? songRequest : "",
        message,
      });
      setResult(res);
      if (res.ok) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  if (result?.ok) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-sage-200 bg-sage-50 p-10 text-center">
        <p className="font-display text-3xl text-sage-800">With love</p>
        <p className="mt-4 text-base leading-relaxed text-ink/75">
          {result.message}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-xl space-y-6 rounded-2xl border border-sage-100 bg-ivory p-7 sm:p-9"
    >
      <Field label="Full name" htmlFor="name">
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          autoComplete="name"
        />
      </Field>

      <Field label="Email" htmlFor="email">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          autoComplete="email"
        />
      </Field>

      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-ink/80">
          Will you be joining us?
        </legend>
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton
            active={attending === "yes"}
            onClick={() => setAttending("yes")}
          >
            Joyfully accepts
          </ChoiceButton>
          <ChoiceButton
            active={attending === "no"}
            onClick={() => setAttending("no")}
          >
            Regretfully declines
          </ChoiceButton>
        </div>
      </fieldset>

      {attending === "yes" && (
        <div className="space-y-6 border-t border-sage-100 pt-6">
          {/* Primary guest meal/dietary */}
          {hasMeals && (
            <Field label="Your meal choice" htmlFor="primaryMeal">
              <select
                id="primaryMeal"
                value={primaryMeal}
                onChange={(e) => setPrimaryMeal(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a meal…</option>
                {mealOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field
            label="Dietary restrictions or allergies (optional)"
            htmlFor="primaryDietary"
          >
            <input
              id="primaryDietary"
              type="text"
              value={primaryDietary}
              onChange={(e) => setPrimaryDietary(e.target.value)}
              className={inputClass}
              placeholder="e.g. nut allergy, gluten-free"
            />
          </Field>

          {/* Additional guests */}
          <div className="space-y-4">
            {guests.map((guest, i) => (
              <div
                key={i}
                className="rounded-xl border border-sage-100 bg-cream/40 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink/80">
                    Guest {i + 2}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeGuest(i)}
                    className="text-xs uppercase tracking-widest text-blush-500 hover:text-blush-400"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={guest.name}
                    onChange={(e) => updateGuest(i, { name: e.target.value })}
                    className={inputClass}
                    placeholder="Guest name"
                  />
                  {hasMeals && (
                    <select
                      value={guest.meal}
                      onChange={(e) => updateGuest(i, { meal: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select a meal…</option>
                      {mealOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                  <input
                    type="text"
                    value={guest.dietary}
                    onChange={(e) => updateGuest(i, { dietary: e.target.value })}
                    className={inputClass}
                    placeholder="Dietary restrictions (optional)"
                  />
                </div>
              </div>
            ))}

            {canAddGuest && (
              <button
                type="button"
                onClick={addGuest}
                className="w-full rounded-xl border border-dashed border-sage-300 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
              >
                + Add a guest
              </button>
            )}
            {!canAddGuest && (
              <p className="text-xs text-ink/50">
                Party limit reached ({maxPartySize}). Contact us if you need more.
              </p>
            )}
          </div>

          {askSongRequest && (
            <Field label="Song request (optional)" htmlFor="songRequest">
              <input
                id="songRequest"
                type="text"
                value={songRequest}
                onChange={(e) => setSongRequest(e.target.value)}
                className={inputClass}
                placeholder="What will get you on the dance floor?"
              />
            </Field>
          )}
        </div>
      )}

      {attending && (
        <Field label="A note to the couple (optional)" htmlFor="message">
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={cn(inputClass, "resize-y")}
          />
        </Field>
      )}

      {result && !result.ok && (
        <p className="rounded-lg bg-blush-50 px-4 py-3 text-sm text-blush-500">
          {result.message}
        </p>
      )}

      <Button type="submit" disabled={isPending || !attending} className="w-full">
        {isPending ? "Sending…" : "Send RSVP"}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-sage-200 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-sage-400 focus:ring-2 focus:ring-sage-100";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink/80"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-4 py-3 text-sm transition-colors",
        active
          ? "border-sage-500 bg-sage-600 text-ivory"
          : "border-sage-200 bg-white text-ink/75 hover:border-sage-300"
      )}
    >
      {children}
    </button>
  );
}
