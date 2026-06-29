import type { RsvpQuestion } from "@/config/site";

/**
 * Resolve which RSVP questions should be visible given the current answers,
 * honoring conditional (`showIf`) rules. Questions are evaluated in order, and
 * a hidden question contributes an empty answer — so a chain of conditionals
 * (a question that depends on another conditional question) collapses correctly.
 *
 * Relies on conditional questions referencing an *earlier* question, which the
 * admin editor enforces.
 */
export function visibleQuestionIds(
  questions: RsvpQuestion[],
  answers: Record<string, string>
): Set<string> {
  const visible = new Set<string>();
  const effective: Record<string, string> = {};

  for (const q of questions) {
    const show =
      !q.showIf || (effective[q.showIf.questionId] ?? "") === q.showIf.value;
    if (show) {
      visible.add(q.id);
      effective[q.id] = answers[q.id] ?? "";
    } else {
      effective[q.id] = "";
    }
  }
  return visible;
}
