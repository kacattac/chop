export interface RestoreHyphensResult {
  text: string;
  notes: string[];
}

const MIN_TOKEN_LENGTH = 8;
const MIN_FRAGMENT_LENGTH = 3;

/**
 * STEP 2: RESTORE RUN-TOGETHER WORDS
 * Where two words appear to have been incorrectly joined due to a dropped
 * hyphen, restore the hyphen. Primary signal: the token isn't itself a
 * dictionary word, but splits cleanly into two dictionary words. Secondary
 * signal: proximity to a line-length "rhythm disruption" flagged in Step 1.
 */
export function step2RestoreHyphens(
  text: string,
  dictionary: Set<string>,
  suspectOffsets: number[],
): RestoreHyphensResult {
  const notes: string[] = [];
  const sortedSuspects = [...suspectOffsets].sort((a, b) => a - b);

  const isNearSuspectOffset = (offset: number) => {
    // Binary-search-free linear scan is fine at this text size; within ~40
    // chars of a flagged line boundary counts as "near".
    return sortedSuspects.some((s) => Math.abs(s - offset) <= 40);
  };

  let result = "";
  let lastIndex = 0;
  const tokenRe = /[A-Za-z]+/g;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(text)) !== null) {
    const token = match[0];
    result += text.slice(lastIndex, match.index);
    lastIndex = match.index + token.length;

    if (token.length < MIN_TOKEN_LENGTH || dictionary.has(token.toLowerCase())) {
      result += token;
      continue;
    }

    const candidates: { split: number; balance: number }[] = [];
    for (
      let split = MIN_FRAGMENT_LENGTH;
      split <= token.length - MIN_FRAGMENT_LENGTH;
      split++
    ) {
      const left = token.slice(0, split).toLowerCase();
      const right = token.slice(split).toLowerCase();
      if (dictionary.has(left) && dictionary.has(right)) {
        candidates.push({ split, balance: Math.abs(left.length - right.length) });
      }
    }

    if (candidates.length === 0) {
      result += token;
      continue;
    }

    // Prefer the split nearest a flagged rhythm disruption; otherwise the
    // most balanced split (tends to be the more natural compound break).
    let chosen = candidates[0];
    if (isNearSuspectOffset(match.index)) {
      chosen = candidates[0];
    } else {
      chosen = candidates.reduce((best, c) => (c.balance < best.balance ? c : best));
    }

    const restored = token.slice(0, chosen.split) + "-" + token.slice(chosen.split);
    result += restored;
    notes.push(`Restored hyphen: "${token}" -> "${restored}"`);
  }
  result += text.slice(lastIndex);

  return { text: result, notes };
}
