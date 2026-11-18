import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteDraft = {
  length: number;
  max: number;
  tooLong: boolean;
  unsaved: boolean;
  canSave: boolean;
};

export function describeDraft(draft: string, savedBody: string): NoteDraft {
  const tooLong = draft.length > MAX_NOTE_LENGTH;
  const trimmed = draft.trim();
  const empty = trimmed.length === 0;
  // The save action trims the note, so surrounding whitespace never differs
  // from what is stored.
  const unsaved = trimmed !== savedBody.trim();
  return {
    length: draft.length,
    max: MAX_NOTE_LENGTH,
    tooLong,
    unsaved,
    canSave: unsaved && !empty && !tooLong,
  };
}
