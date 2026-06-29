"use client";

import { useState } from "react";
import { useActionState } from "react";
import { saveSettings, type SettingsState } from "@/server/settings";
import type { RsvpQuestion } from "@/config/site";
import { Card, adminInputClass, adminLabelClass } from "@/components/admin/ui";
import { RsvpQuestionsEditor } from "@/components/admin/rsvp-questions-editor";
import { Button } from "@/components/ui/button";

export type SettingsInitial = Record<string, string>;

export type SettingsLists = {
  attireNotes: string[];
  schedule: { time: string; title: string; description?: string }[];
  travel: { name: string; address: string; mapUrl?: string; notes?: string }[];
  faq: { question: string; answer: string }[];
  mealOptions: string[];
  rsvpQuestions: RsvpQuestion[];
};

const initialState: SettingsState = {};

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  hint,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  hint?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className={adminLabelClass}>
        {label}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={3}
          className={`${adminInputClass} resize-y`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={adminInputClass}
        />
      )}
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

/* ---- Repeatable list editor ---------------------------------------------- */

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  /** Render a checkbox storing "1" / "" instead of a text input. */
  check?: boolean;
  /** Span both columns in the row grid. */
  full?: boolean;
};

type Row = Record<string, string> & { _id: string };

let _uid = 0;
const nextId = () => `row-${_uid++}`;
const withId = (r: Record<string, string>): Row => ({ _id: nextId(), ...r });

function ListEditor({
  heading,
  description,
  name,
  fields,
  blank,
  addLabel,
  initialRows,
}: {
  heading: string;
  description?: string;
  /** Name of the hidden input carrying the serialized JSON array. */
  name: string;
  fields: FieldDef[];
  blank: Record<string, string>;
  addLabel: string;
  initialRows: Record<string, string>[];
}) {
  const [items, setItems] = useState<Row[]>(() => initialRows.map(withId));

  const update = (idx: number, key: string, value: string) =>
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [key]: value } : it))
    );
  const add = () => setItems((prev) => [...prev, withId({ ...blank })]);
  const remove = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const serialized = JSON.stringify(
    items.map((it) => {
      const { _id, ...rest } = it;
      void _id; // drop the internal React key before serializing
      return rest;
    })
  );

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg text-sage-800">{heading}</h2>
        {description && (
          <p className="mt-1 text-xs text-ink/45">{description}</p>
        )}
      </div>

      <div className="space-y-3">
        {items.length === 0 && (
          <p className="text-sm text-ink/45">
            Nothing here yet — this section is hidden on the site.
          </p>
        )}
        {items.map((item, idx) => (
          <div
            key={item._id}
            className="rounded-xl border border-sage-100 bg-ivory/60 p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((f) =>
                f.check ? (
                  <label
                    key={f.key}
                    className={`flex items-center gap-2 text-sm text-ink/75 ${
                      f.full ? "sm:col-span-2" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item[f.key] === "1"}
                      onChange={(e) =>
                        update(idx, f.key, e.target.checked ? "1" : "")
                      }
                      className="h-4 w-4 rounded border-sage-300 text-sage-600"
                    />
                    {f.label}
                  </label>
                ) : (
                <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
                  <label className={adminLabelClass}>{f.label}</label>
                  {f.textarea ? (
                    <textarea
                      value={item[f.key] ?? ""}
                      placeholder={f.placeholder}
                      rows={2}
                      onChange={(e) => update(idx, f.key, e.target.value)}
                      className={`${adminInputClass} resize-y`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={item[f.key] ?? ""}
                      placeholder={f.placeholder}
                      onChange={(e) => update(idx, f.key, e.target.value)}
                      className={adminInputClass}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-xs uppercase tracking-widest text-blush-500 hover:text-blush-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-sage-300 px-4 py-2 text-sm text-sage-700 transition-colors hover:border-sage-400 hover:bg-sage-50"
      >
        + {addLabel}
      </button>

      <input type="hidden" name={name} value={serialized} readOnly />
    </Card>
  );
}

/* ---- Form ----------------------------------------------------------------- */

export function SettingsForm({
  initial,
  lists,
}: {
  initial: SettingsInitial;
  lists: SettingsLists;
}) {
  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">The couple</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Partner A" name="partnerA" defaultValue={initial.partnerA} />
          <Field label="Partner B" name="partnerB" defaultValue={initial.partnerB} />
        </div>
        <Field
          label="Hashtag"
          name="hashtag"
          defaultValue={initial.hashtag}
          placeholder="#AlexAndSam2026"
        />
        <Field
          label="Welcome line"
          name="tagline"
          defaultValue={initial.tagline}
          textarea
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">Date & place</h2>
        <Field
          label="Ceremony date/time (ISO with timezone)"
          name="weddingDate"
          defaultValue={initial.weddingDate}
          placeholder="2026-09-19T16:00:00-05:00"
          hint="Drives the countdown. Include the timezone offset."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date (display)"
            name="weddingDateDisplay"
            defaultValue={initial.weddingDateDisplay}
          />
          <Field
            label="Time (display)"
            name="weddingTimeDisplay"
            defaultValue={initial.weddingTimeDisplay}
          />
        </div>
        <Field
          label="Location (short)"
          name="weddingLocationShort"
          defaultValue={initial.weddingLocationShort}
        />
        <Field
          label="Contact email"
          name="contactEmail"
          type="email"
          defaultValue={initial.contactEmail}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">Ceremony venue</h2>
        <Field label="Name" name="ceremonyName" defaultValue={initial.ceremonyName} />
        <Field label="Address" name="ceremonyAddress" defaultValue={initial.ceremonyAddress} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time" name="ceremonyTime" defaultValue={initial.ceremonyTime} />
          <Field label="Map URL" name="ceremonyMapUrl" defaultValue={initial.ceremonyMapUrl} />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">Reception venue</h2>
        <Field label="Name" name="receptionName" defaultValue={initial.receptionName} />
        <Field label="Address" name="receptionAddress" defaultValue={initial.receptionAddress} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Time" name="receptionTime" defaultValue={initial.receptionTime} />
          <Field label="Map URL" name="receptionMapUrl" defaultValue={initial.receptionMapUrl} />
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">Attire & RSVP</h2>
        <Field label="Attire title" name="attireTitle" defaultValue={initial.attireTitle} />
        <Field
          label="Attire description"
          name="attireDescription"
          defaultValue={initial.attireDescription}
          textarea
        />
        <Field
          label="RSVP deadline (display)"
          name="rsvpDeadline"
          defaultValue={initial.rsvpDeadline}
        />
      </Card>

      <ListEditor
        heading="Attire notes"
        description="The bullet points shown beneath the color palette on the Details page."
        name="attireNotesJson"
        addLabel="Add note"
        fields={[
          {
            key: "text",
            label: "Note",
            full: true,
            textarea: true,
            placeholder: "e.g. The ceremony is on grass — flats are your friend.",
          },
        ]}
        blank={{ text: "" }}
        initialRows={lists.attireNotes.map((text) => ({ text }))}
      />

      <ListEditor
        heading="Schedule"
        description="Your day-of timeline. Leave a row's description blank if you don't need one."
        name="scheduleJson"
        addLabel="Add schedule item"
        fields={[
          { key: "time", label: "Time", placeholder: "4:00 PM" },
          { key: "title", label: "Title", placeholder: "Ceremony" },
          {
            key: "description",
            label: "Description (optional)",
            full: true,
            placeholder: "The Magnolia Gardens lawn",
          },
        ]}
        blank={{ time: "", title: "", description: "" }}
        initialRows={lists.schedule.map((i) => ({
          time: i.time,
          title: i.title,
          description: i.description ?? "",
        }))}
      />

      <ListEditor
        heading="Travel & stay"
        description="Hotels, room blocks, or travel tips. Map URL and notes are optional."
        name="travelJson"
        addLabel="Add place"
        fields={[
          { key: "name", label: "Name", placeholder: "The Harbor Hotel (room block)" },
          { key: "address", label: "Address", placeholder: "456 Bay Street, …" },
          { key: "mapUrl", label: "Map URL (optional)", full: true, placeholder: "https://maps.google.com/…" },
          {
            key: "notes",
            label: "Notes (optional)",
            full: true,
            textarea: true,
            placeholder: "Group rate available — mention the wedding when booking.",
          },
        ]}
        blank={{ name: "", address: "", mapUrl: "", notes: "" }}
        initialRows={lists.travel.map((p) => ({
          name: p.name,
          address: p.address,
          mapUrl: p.mapUrl ?? "",
          notes: p.notes ?? "",
        }))}
      />

      <ListEditor
        heading="Good to know (FAQ)"
        description="Questions and answers shown in the “What to Be Aware Of” section."
        name="faqJson"
        addLabel="Add question"
        fields={[
          { key: "question", label: "Question", full: true, placeholder: "Are kids welcome?" },
          {
            key: "answer",
            label: "Answer",
            full: true,
            textarea: true,
            placeholder: "We love your little ones, but…",
          },
        ]}
        blank={{ question: "", answer: "" }}
        initialRows={lists.faq.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">RSVP form</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Max party size"
            name="maxPartySize"
            type="number"
            defaultValue={initial.maxPartySize}
            hint="Primary guest + plus-ones per response."
          />
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-ink/75">
            <input
              type="checkbox"
              name="askSongRequest"
              defaultChecked={initial.askSongRequest === "1"}
              className="h-4 w-4 rounded border-sage-300 text-sage-600"
            />
            Ask guests for a song request
          </label>
        </div>
      </Card>

      <ListEditor
        heading="Meal options"
        description="Choices shown in the RSVP meal dropdown. Remove all to hide meal selection entirely."
        name="mealOptionsJson"
        addLabel="Add meal"
        fields={[
          {
            key: "text",
            label: "Meal",
            full: true,
            placeholder: "e.g. Filet Mignon",
          },
        ]}
        blank={{ text: "" }}
        initialRows={lists.mealOptions.map((text) => ({ text }))}
      />

      <RsvpQuestionsEditor initial={lists.rsvpQuestions} />

      <Card className="space-y-4">
        <h2 className="text-lg text-sage-800">Seating password</h2>
        <Field
          label="Shared password guests enter to view seating"
          name="seatingPassword"
          defaultValue={initial.seatingPassword}
          hint="Leave blank to keep the current password."
        />
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {state.ok && (
          <span className="text-sm text-sage-700">Saved ✓</span>
        )}
        {state.error && (
          <span className="text-sm text-blush-500">{state.error}</span>
        )}
      </div>
    </form>
  );
}
