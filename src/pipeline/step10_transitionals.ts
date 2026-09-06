import { SOFT_RETURN } from "./types";

export interface TransitionalResult {
  text: string;
  notes: string[];
}

const TWO_WORD = ["That is", "So far", "Thus far", "In sum", "For now", "If so"];

const SINGLE_WORD = [
  "Also", "But", "Or", "That", "And", "If", "Whether", "Yet", "However", "Nevertheless",
  "Furthermore", "Moreover", "Thus", "Hence", "Indeed", "Similarly", "Accordingly", "Now",
  "Obviously", "Plainly", "Theoretically", "Rather", "First", "Second", "Third", "Conversely",
  "Therefore", "Still", "Nonetheless", "Instead", "Evidently", "Clearly", "Consequently",
  "Additionally", "Finally", "Subsequently", "Meanwhile", "Notably", "Naturally", "Certainly",
  "Fortunately", "Importantly", "Typically", "Generally", "Otherwise", "Perhaps", "Likewise",
  "So", "Since", "Although",
];

function isWordChar(c: string | undefined): boolean {
  return !!c && /[A-Za-z]/.test(c);
}

/**
 * STEP 10: SOFT RETURNS AFTER TRANSITIONAL WORDS
 * A sentence-initial transitional word/connective gets a soft return after
 * it (after a following comma, if present). Two-word forms ("That is",
 * "So far", ...) take the return after their second word.
 */
export function step10Transitionals(text: string): TransitionalResult {
  let count = 0;
  const positions: number[] = [0];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === SOFT_RETURN) positions.push(i + 1);
  }
  positions.sort((a, b) => b - a); // process end-to-start so earlier indices stay valid

  let result = text;

  for (const pos of positions) {
    if (pos >= result.length) continue;
    const remainder = result.slice(pos);
    let insertAt: number | null = null;

    for (const phrase of TWO_WORD) {
      if (remainder.startsWith(phrase) && !isWordChar(result[pos + phrase.length])) {
        const after = pos + phrase.length;
        insertAt = result[after] === "," ? after + 1 : after;
        break;
      }
    }

    if (insertAt === null) {
      for (const word of SINGLE_WORD) {
        if (remainder.startsWith(word) && !isWordChar(result[pos + word.length])) {
          const after = pos + word.length;
          insertAt = result[after] === "," ? after + 1 : after;
          break;
        }
      }
    }

    if (insertAt !== null) {
      result = result.slice(0, insertAt) + SOFT_RETURN + result.slice(insertAt);
      count++;
    }
  }

  return {
    text: result,
    notes: count ? [`Inserted ${count} soft return(s) after sentence-initial transitional word(s).`] : [],
  };
}
