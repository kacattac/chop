import { SOFT_RETURN } from "./types";

export interface EnumeratedListResult {
  text: string;
  notes: string[];
}

/**
 * STEP 7: ENUMERATED LISTS
 * Each item in an enumerated list of more than two items gets a soft
 * return after it. Comma-separated list items are already covered by
 * Step 8's blanket comma rule; this step targets explicit markers like
 * "(1)", "1.", "1)" that run 1, 2, 3, ... with no punctuation between items.
 */
export function step7EnumeratedLists(text: string): EnumeratedListResult {
  const notes: string[] = [];
  const markerRe = /\(?(\d+)[.)]\)?/g;
  const markers: { index: number; end: number; num: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = markerRe.exec(text)) !== null) {
    markers.push({ index: m.index, end: m.index + m[0].length, num: parseInt(m[1], 10) });
  }

  const insertions: number[] = [];
  let runStart = -1;

  for (let i = 0; i < markers.length; i++) {
    if (markers[i].num === 1) runStart = i;
    if (runStart === -1) continue;
    const positionInRun = i - runStart;
    if (markers[i].num !== positionInRun + 1) {
      runStart = -1;
      continue;
    }
    if (positionInRun >= 1) insertions.push(markers[i].index);
  }

  let result = text;
  let offset = 0;
  for (const idx of insertions) {
    const pos = idx + offset;
    result = result.slice(0, pos) + SOFT_RETURN + result.slice(pos);
    offset += SOFT_RETURN.length;
  }

  if (insertions.length) {
    notes.push(`Inserted ${insertions.length} soft return(s) before enumerated list marker(s).`);
  }
  return { text: result, notes };
}
