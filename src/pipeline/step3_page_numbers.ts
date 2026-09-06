import { SOFT_RETURN } from "./types";

export interface PageNumberResult {
  text: string;
  notes: string[];
}

const CAPS_WORD = "[A-Z]{2,}(?:['’][A-Z]+)?";
// Two or more consecutive all-caps words - the OCR rendering of a running head/section code.
const CAPS_RUN = `(?:${CAPS_WORD} +){1,9}${CAPS_WORD}`;

/**
 * STEP 3: EXTRACT PAGE NUMBERS
 * Page numbers may appear alone, within running heads, or mid-word when a
 * page break fell inside a word. Extract each into "[n]" on its own line
 * and strip the running head/section code text around it.
 *
 * Only an ALL-CAPS run directly adjacent to a number is treated as a
 * running head/section code - that's the confident case. An ALL-CAPS run
 * with no adjacent number is left untouched rather than deleted, since it
 * can't be told apart from genuine content (e.g. a real chapter heading)
 * without a number to confirm it's page furniture; deleting it on a guess
 * would violate the "delete no characters except running heads/section
 * codes" constraint.
 */
export function step3ExtractPageNumbers(
  text: string,
  dictionary: Set<string>,
): PageNumberResult {
  const notes: string[] = [];
  let working = text;

  // Pass A: page number embedded mid-word, e.g. "exam 148 ple" -> "example" + [148]
  working = working.replace(
    /\b([a-z]{2,})[ ]+(\d{1,4})[ ]+([a-z]{2,})\b/g,
    (full, left: string, num: string, right: string) => {
      const combined = (left + right).toLowerCase();
      if (dictionary.has(combined)) {
        notes.push(
          `Reconstructed "${left}${right}" from mid-word page break, extracted page number [${num}]`,
        );
        return `${left}${right}${SOFT_RETURN}[${num}]${SOFT_RETURN}`;
      }
      return full;
    },
  );

  // Pass B: running head followed by a page number ("...CAPS CAPS 148...").
  const runThenNum = new RegExp(`(${CAPS_RUN}) +(\\d{1,4})\\b`, "g");
  working = working.replace(runThenNum, (_full, head: string, num: string) => {
    notes.push(`Extracted page number [${num}]; removed running head "${head.trim()}"`);
    return `${SOFT_RETURN}[${num}]${SOFT_RETURN}`;
  });

  // Pass C: page number followed by a running head ("...148 CAPS CAPS...").
  const numThenRun = new RegExp(`\\b(\\d{1,4}) +(${CAPS_RUN})`, "g");
  working = working.replace(numThenRun, (_full, num: string, head: string) => {
    notes.push(`Extracted page number [${num}]; removed running head "${head.trim()}"`);
    return `${SOFT_RETURN}[${num}]${SOFT_RETURN}`;
  });

  return { text: working, notes };
}
