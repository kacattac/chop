import type { FlattenResult, LineRhythm } from "./types";

/**
 * STEP 1: FLATTEN
 * Reformat the text as a single continuous passage. Where a line ends in a
 * hyphen, remove the hyphen and join directly to the next line with no
 * space. Remove all newline characters. Maintain spaces between words.
 * Collapse multiple spaces to one.
 */
export function step1Flatten(raw: string): FlattenResult {
  const normalized = raw.replace(/\r\n?/g, "\n");
  const rawLines = normalized.split("\n").map((l) => l.trim());
  const lines = rawLines.filter((l) => l.length > 0);

  let text = "";
  let prevEndedWithHyphen = false;
  const rhythm: LineRhythm[] = [];

  for (let i = 0; i < lines.length; i++) {
    const endsWithHyphen = /-$/.test(lines[i]);
    const content = endsWithHyphen ? lines[i].slice(0, -1) : lines[i];

    rhythm.push({ offset: text.length, length: content.length });

    if (i === 0) {
      text = content;
    } else if (prevEndedWithHyphen) {
      text += content;
    } else {
      text += " " + content;
    }
    prevEndedWithHyphen = endsWithHyphen;
  }

  text = text.replace(/[ \t]+/g, " ").trim();

  // Flag lines whose length deviates sharply from their local neighborhood -
  // a signal (not proof) that a word merge/split artifact happened there.
  const suspectOffsets: number[] = [];
  const windowRadius = 4;
  for (let i = 0; i < rhythm.length; i++) {
    const start = Math.max(0, i - windowRadius);
    const end = Math.min(rhythm.length, i + windowRadius + 1);
    const neighborhood = rhythm.slice(start, end).map((r) => r.length);
    const mean =
      neighborhood.reduce((a, b) => a + b, 0) / neighborhood.length;
    if (mean === 0) continue;
    const deviation = Math.abs(rhythm[i].length - mean) / mean;
    if (deviation > 0.6 && rhythm[i].length > 0) {
      suspectOffsets.push(rhythm[i].offset);
    }
  }

  return { text, lines: rhythm, suspectOffsets };
}
