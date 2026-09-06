import { SOFT_RETURN } from "./types";

export interface SentenceBreakResult {
  text: string;
  notes: string[];
}

// Abbreviations (and single-letter initials) whose period does not end a sentence.
const ABBREVIATIONS = ["p", "pp", "vol", "Inc", "Co", "Ltd", "etc"];
const ABBREV_ALT = `(?:${ABBREVIATIONS.join("|")}|[A-Z])`;

/**
 * STEP 5: SOFT RETURNS AFTER SENTENCES AND CLAUSES
 * A sentence ends at ./?/!, optionally a quote, a space, optionally a
 * quote, then a capital letter - except after a single-letter initial or
 * a common abbreviation.
 */
export function step5SentenceBreaks(text: string): SentenceBreakResult {
  const re = new RegExp(
    `(?<!\\b${ABBREV_ALT})([.?!])([’”'"]?) +([‘“'"]?)(?=[A-Z])`,
    "g",
  );
  let count = 0;
  const result = text.replace(re, (_full, end: string, closeQuote: string, openQuote: string) => {
    count++;
    return `${end}${closeQuote}${SOFT_RETURN}${openQuote}`;
  });
  return {
    text: result,
    notes: count ? [`Inserted ${count} sentence-end soft return(s).`] : [],
  };
}
