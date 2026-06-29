"use client";

import { useState, useTransition } from "react";
import { submitRsvp, type RsvpResult } from "@/server/rsvp";
import type { RsvpQuestion } from "@/config/site";
import { visibleQuestionIds } from "@/lib/rsvp-questions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Guest = {
  name: string;
  meal: string;
  dietary: string;
  child: boolean;
  answers: Record<string, string>;
};

export function RsvpForm({
  mealOptions,
  maxPartySize,
  askSongRequest,
  questions = [],
  childQuestions = [],
}: {
  mealOptions: string[];
  maxPartySize: number;
  askSongRequest: boolean;
  questions?: RsvpQuestion[];
  childQuestions?: RsvpQuestion[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<"" | "yes" | "no">("");
  const [primaryMeal, setPrimaryMeal] = useState("");
  const [primaryDietary, setPrimaryDietary] = useState("");
  const [members, setMembers] = useState<Guest[]>([]);
  const [songRequest, setSongRequest] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RsvpResult | null>(null);

  const hasMeals = mealOptions.length > 0;
  const totalPartySize = 1 + members.length;
  const canAddGuest = totalPartySize < maxPartySize;
  const visibleIds = visibleQuestionIds(questions, answers);

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
        additionalGuests:
          attending === "yes"
            ? members.map((g) => ({
                name: g.name,
                meal: g.meal,
                dietary: g.dietary,
                child: g.child,
                answers: g.child
                  ? Object.fromEntries(
                      Object.entries(g.answers).filter(([id]) =>
                        visibleQuestionIds(childQuestions, g.answers).has(id)
                      )
                    )
                  : {},
              }))
            : [],
        songRequest: attending === "yes" ? songRequest : "",
        answers:
          attending === "yes"
            ? Object.fromEntries(
                Object.entries(answers).filter(([id]) => visibleIds.has(id))
              )
            : {},
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

          {/* Others in the party */}
          <GuestSection
            title="Others in your party"
            hint="Everyone else included on your invitation. Mark any children so we can plan for them."
            guests={members}
            setGuests={setMembers}
            mealOptions={mealOptions}
            hasMeals={hasMeals}
            childQuestions={childQuestions}
            canAdd={canAddGuest}
          />

          {!canAddGuest && (
            <p className="text-xs text-ink/50">
              Party limit reached ({maxPartySize} total). Contact us if you need
              more.
            </p>
          )}

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

          {questions.map((q) => {
            if (!visibleIds.has(q.id)) return null;
            const label = q.required ? q.label : `${q.label} (optional)`;
            return (
              <Field key={q.id} label={label} htmlFor={`q-${q.id}`}>
                {q.options && q.options.length > 0 ? (
                  <select
                    id={`q-${q.id}`}
                    required={q.required}
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                    className={inputClass}
                  >
                    <option value="">Select…</option>
                    {q.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`q-${q.id}`}
                    type="text"
                    required={q.required}
                    value={answers[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                    className={inputClass}
                  />
                )}
              </Field>
            );
          })}
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

function GuestSection({
  title,
  hint,
  guests,
  setGuests,
  mealOptions,
  hasMeals,
  childQuestions,
  canAdd,
}: {
  title: string;
  hint: string;
  guests: Guest[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  mealOptions: string[];
  hasMeals: boolean;
  childQuestions: RsvpQuestion[];
  canAdd: boolean;
}) {
  const add = () =>
    setGuests((g) => [
      ...g,
      { name: "", meal: "", dietary: "", child: false, answers: {} },
    ]);
  const remove = (i: number) =>
    setGuests((g) => g.filter((_, idx) => idx !== i));
  const update = (i: number, patch: Partial<Guest>) =>
    setGuests((g) =>
      g.map((guest, idx) => (idx === i ? { ...guest, ...patch } : guest))
    );
  const setAnswer = (i: number, qid: string, value: string) =>
    setGuests((g) =>
      g.map((guest, idx) =>
        idx === i
          ? { ...guest, answers: { ...guest.answers, [qid]: value } }
          : guest
      )
    );

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-ink/80">{title}</p>
        <p className="text-xs text-ink/55">{hint}</p>
      </div>

      {guests.map((guest, i) => {
        const childVisible = guest.child
          ? visibleQuestionIds(childQuestions, guest.answers)
          : new Set<string>();
        return (
          <div
            key={i}
            className="rounded-xl border border-sage-100 bg-cream/40 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-ink/80">
                Guest {i + 1}
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
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
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputClass}
                placeholder="Full name"
              />
              <label className="flex items-center gap-2 text-sm text-ink/75">
                <input
                  type="checkbox"
                  checked={guest.child}
                  onChange={(e) => update(i, { child: e.target.checked })}
                  className="h-4 w-4 rounded border-sage-300 text-sage-600"
                />
                This guest is a child
              </label>
              {hasMeals && (
                <select
                  value={guest.meal}
                  onChange={(e) => update(i, { meal: e.target.value })}
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
                onChange={(e) => update(i, { dietary: e.target.value })}
                className={inputClass}
                placeholder="Dietary restrictions (optional)"
              />

              {guest.child &&
                childQuestions.map((q) => {
                  if (!childVisible.has(q.id)) return null;
                  const id = `g${i}-${q.id}`;
                  return (
                    <div key={q.id}>
                      <label
                        htmlFor={id}
                        className="mb-1.5 block text-sm text-ink/70"
                      >
                        {q.required ? q.label : `${q.label} (optional)`}
                      </label>
                      {q.options && q.options.length > 0 ? (
                        <select
                          id={id}
                          required={q.required}
                          value={guest.answers[q.id] ?? ""}
                          onChange={(e) => setAnswer(i, q.id, e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select…</option>
                          {q.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={id}
                          type="text"
                          required={q.required}
                          value={guest.answers[q.id] ?? ""}
                          onChange={(e) => setAnswer(i, q.id, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}

      {canAdd && (
        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl border border-dashed border-sage-300 py-3 text-sm text-sage-700 transition-colors hover:bg-sage-50"
        >
          + Add a guest
        </button>
      )}
    </div>
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
