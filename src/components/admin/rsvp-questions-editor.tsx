"use client";

import { useState } from "react";
import type { RsvpQuestion } from "@/config/site";
import { Card, adminInputClass, adminLabelClass } from "@/components/admin/ui";

type Row = {
  id: string;
  label: string;
  /** Comma-separated choices; empty = free-text answer. */
  options: string;
  required: boolean;
  /** Id of an earlier question this one depends on; "" = always show. */
  showIfId: string;
  showIfValue: string;
};

function toRow(q: RsvpQuestion): Row {
  return {
    id: q.id,
    label: q.label,
    options: (q.options ?? []).join(", "),
    required: Boolean(q.required),
    showIfId: q.showIf?.questionId ?? "",
    showIfValue: q.showIf?.value ?? "",
  };
}

let _seq = 0;
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : `q${Date.now().toString(36)}${_seq++}`;

const choicesOf = (options: string) =>
  options
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

export function RsvpQuestionsEditor({ initial }: { initial: RsvpQuestion[] }) {
  const [rows, setRows] = useState<Row[]>(() => initial.map(toRow));

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const add = () =>
    setRows((rs) => [
      ...rs,
      {
        id: newId(),
        label: "",
        options: "",
        required: false,
        showIfId: "",
        showIfValue: "",
      },
    ]);

  const remove = (i: number) =>
    setRows((rs) => {
      const removedId = rs[i]?.id;
      return rs
        .filter((_, idx) => idx !== i)
        .map((r) =>
          r.showIfId === removedId ? { ...r, showIfId: "", showIfValue: "" } : r
        );
    });

  // Serialize to the shape the server expects.
  const payload = rows
    .filter((r) => r.label.trim())
    .map((r) => {
      const options = choicesOf(r.options);
      const q: RsvpQuestion = { id: r.id, label: r.label.trim() };
      if (options.length > 0) q.options = options;
      if (r.required) q.required = true;
      if (r.showIfId && r.showIfValue) {
        q.showIf = { questionId: r.showIfId, value: r.showIfValue };
      }
      return q;
    });

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg text-sage-800">Custom RSVP questions</h2>
        <p className="mt-1 text-xs text-ink/45">
          Extra questions shown to attending guests. Leave “Choices” blank for a
          text box, or list comma-separated choices for a dropdown. A question
          can be shown only when an earlier question has a specific answer.
        </p>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <p className="text-sm text-ink/45">
            No custom questions yet — guests just get the standard fields.
          </p>
        )}

        {rows.map((row, i) => {
          // Candidate parents: earlier questions that have a label.
          const earlier = rows.slice(0, i).filter((r) => r.label.trim());
          const parent = earlier.find((r) => r.id === row.showIfId);
          const parentChoices = parent ? choicesOf(parent.options) : [];

          return (
            <div
              key={row.id}
              className="rounded-xl border border-sage-100 bg-ivory/60 p-4"
            >
              <div className="grid gap-3">
                <div>
                  <label className={adminLabelClass}>Question</label>
                  <input
                    type="text"
                    value={row.label}
                    placeholder="e.g. Will you need the shuttle?"
                    onChange={(e) => update(i, { label: e.target.value })}
                    className={adminInputClass}
                  />
                </div>

                <div>
                  <label className={adminLabelClass}>
                    Choices (optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={row.options}
                    placeholder="Yes, No"
                    onChange={(e) => update(i, { options: e.target.value })}
                    className={adminInputClass}
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-ink/75">
                  <input
                    type="checkbox"
                    checked={row.required}
                    onChange={(e) => update(i, { required: e.target.checked })}
                    className="h-4 w-4 rounded border-sage-300 text-sage-600"
                  />
                  Required
                </label>

                {/* Conditional display */}
                {earlier.length > 0 && (
                  <div className="rounded-lg border border-dashed border-sage-200 bg-sage-50/40 p-3">
                    <label className={adminLabelClass}>Show this question…</label>
                    <div className="mt-1 grid gap-2 sm:grid-cols-2">
                      <select
                        value={row.showIfId}
                        onChange={(e) =>
                          update(i, { showIfId: e.target.value, showIfValue: "" })
                        }
                        className={adminInputClass}
                      >
                        <option value="">Always</option>
                        {earlier.map((p) => (
                          <option key={p.id} value={p.id}>
                            Only if “{p.label.trim() || "untitled"}” =
                          </option>
                        ))}
                      </select>

                      {row.showIfId &&
                        (parentChoices.length > 0 ? (
                          <select
                            value={row.showIfValue}
                            onChange={(e) =>
                              update(i, { showIfValue: e.target.value })
                            }
                            className={adminInputClass}
                          >
                            <option value="">Select answer…</option>
                            {parentChoices.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={row.showIfValue}
                            placeholder="exact answer"
                            onChange={(e) =>
                              update(i, { showIfValue: e.target.value })
                            }
                            className={adminInputClass}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-xs uppercase tracking-widest text-blush-500 hover:text-blush-600"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={add}
        className="rounded-lg border border-dashed border-sage-300 px-4 py-2 text-sm text-sage-700 transition-colors hover:border-sage-400 hover:bg-sage-50"
      >
        + Add question
      </button>

      <input
        type="hidden"
        name="rsvpQuestionsJson"
        value={JSON.stringify(payload)}
        readOnly
      />
    </Card>
  );
}
