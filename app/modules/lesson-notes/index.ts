import { describeDraft, type NoteDraft } from "./lib/draft";

export type { NoteDraft };

/**
 * What the lesson note editor shows for the text in the box: the character
 * count against the limit, whether the text differs from the saved note, and
 * whether Save is worth pressing.
 */
export function describeNoteDraft(
  draft: string,
  savedBody: string | null | undefined
): NoteDraft {
  return describeDraft(draft, savedBody ?? "");
}
