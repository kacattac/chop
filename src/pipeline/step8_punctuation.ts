import { SOFT_RETURN } from "./types";

export interface PunctuationResult {
  text: string;
  notes: string[];
}

/**
 * STEP 8: SOFT RETURNS AFTER COMMAS, COLONS, AND SEMICOLONS
 * Insert a soft return after every comma, colon, and semicolon - except a
 * comma acting as a numeral thousands-separator (e.g. "1,234"), which is
 * not a clause boundary.
 */
export function step8Punctuation(text: string): PunctuationResult {
  let count = 0;
  let result = "";
  let lastIndex = 0;
  const re = /[,:;]/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const punct = m[0];
    const idx = m.index;
    const prev = text[idx - 1];
    const next = text[idx + 1];

    if (punct === "," && prev && next && /\d/.test(prev) && /\d/.test(next)) {
      continue;
    }

    result += text.slice(lastIndex, idx + 1) + SOFT_RETURN;
    lastIndex = idx + 1;
    count++;
  }
  result += text.slice(lastIndex);

  return {
    text: result,
    notes: count ? [`Inserted ${count} soft return(s) after commas/colons/semicolons.`] : [],
  };
}
