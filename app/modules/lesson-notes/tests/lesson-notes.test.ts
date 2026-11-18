import { describe, it, expect } from "vitest";
import { describeNoteDraft } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("describeNoteDraft", () => {
  it("counts the characters against the note limit", () => {
    const draft = describeNoteDraft("hello", null);
    expect(draft.length).toBe(5);
    expect(draft.max).toBe(MAX_NOTE_LENGTH);
  });

  it("lets a new, non-empty note be saved", () => {
    expect(describeNoteDraft("hello", null)).toMatchObject({
      unsaved: true,
      tooLong: false,
      canSave: true,
    });
  });

  it("does not offer Save for an empty or whitespace-only note", () => {
    expect(describeNoteDraft("", null).canSave).toBe(false);
    expect(describeNoteDraft("   \n", undefined).canSave).toBe(false);
  });

  it("treats an empty box with no saved note as nothing unsaved", () => {
    expect(describeNoteDraft("", null).unsaved).toBe(false);
    expect(describeNoteDraft("", undefined).unsaved).toBe(false);
  });

  it("does not offer Save for clearing a saved note, which the save rejects", () => {
    expect(describeNoteDraft("  ", "old note")).toMatchObject({
      unsaved: true,
      canSave: false,
    });
  });

  it("does not offer Save when the text matches the saved note", () => {
    expect(describeNoteDraft("same", "same")).toMatchObject({
      unsaved: false,
      canSave: false,
    });
  });

  it("ignores whitespace the save would trim away", () => {
    expect(describeNoteDraft("  same \n", "same").unsaved).toBe(false);
    expect(describeNoteDraft("same", " same ").unsaved).toBe(false);
  });

  it("offers Save once the saved note has been edited", () => {
    expect(describeNoteDraft("same, edited", "same")).toMatchObject({
      unsaved: true,
      canSave: true,
    });
  });

  it("allows a note exactly at the limit", () => {
    const draft = describeNoteDraft("a".repeat(MAX_NOTE_LENGTH), null);
    expect(draft.tooLong).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("blocks a note one character over the limit", () => {
    const draft = describeNoteDraft("a".repeat(MAX_NOTE_LENGTH + 1), null);
    expect(draft.tooLong).toBe(true);
    expect(draft.canSave).toBe(false);
  });
});
