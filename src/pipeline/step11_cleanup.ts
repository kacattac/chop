import { SOFT_RETURN } from "./types";

export interface CleanupResult {
  text: string;
  notes: string[];
}

const CURLY_MAP: Record<string, string> = {
  "‘": "'", "’": "'", "‚": "'", "‛": "'",
  "“": '"', "”": '"', "„": '"', "‟": '"',
};

/**
 * STEP 11: CLEAN UP
 * Collapse consecutive soft returns to one, trim leading/trailing spaces
 * on each line, and straighten curly quotes/apostrophes.
 */
export function step11Cleanup(text: string): CleanupResult {
  let result = text.replace(/(\n[ \t]*)+/g, SOFT_RETURN);
  result = result
    .split(SOFT_RETURN)
    .map((line) => line.trim())
    .join(SOFT_RETURN);
  result = result.replace(/[‘’‚‛“”„‟]/g, (c) => CURLY_MAP[c]);
  result = result.replace(/^\n+|\n+$/g, "");

  return { text: result, notes: [] };
}
