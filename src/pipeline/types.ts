// Internal soft-return marker. Steps 1-4 operate on a single flattened line
// with no newlines at all; steps 5-10 insert this marker to mean "soft
// return" per the spec. It's a plain "\n" since real newlines were removed
// in Step 1, so there's no ambiguity between "soft return" and "hard
// paragraph break" inside the pipeline's working text.
export const SOFT_RETURN = "\n";

export interface StepOutput {
  step: number;
  title: string;
  content: string;
  /** Human-readable notes about ambiguous/flagged decisions made in this step. */
  notes: string[];
}

export interface LineRhythm {
  /** Character offset into the flattened text where this original line's content begins. */
  offset: number;
  /** Length (trimmed, hyphen-stripped) of the original source line. */
  length: number;
}

export interface FlattenResult {
  text: string;
  /** Per-original-line rhythm info, used by Step 2 as a secondary signal. */
  lines: LineRhythm[];
  /** Character offsets (into the flattened text) that are unusually short/long lines. */
  suspectOffsets: number[];
}
