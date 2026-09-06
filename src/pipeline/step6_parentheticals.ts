import { SOFT_RETURN } from "./types";

export interface ParentheticalResult {
  text: string;
  notes: string[];
}

/**
 * STEP 6: SOFT RETURNS AROUND PARENTHETICALS
 * Soft return before "(" and after ")", except when the ")" is directly
 * followed by ./,/?/!/:/; , or the parenthetical is a bare 4-digit year.
 */
export function step6Parentheticals(text: string): ParentheticalResult {
  const notes: string[] = [];
  let result = "";
  let lastIndex = 0;
  let count = 0;
  const re = /\(([^()]*)\)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const full = m[0];
    const inner = m[1];
    result += text.slice(lastIndex, m.index);
    lastIndex = m.index + full.length;

    if (/^\d{4}$/.test(inner.trim())) {
      result += full;
      continue;
    }

    const nextChar = text[lastIndex] ?? "";
    const skipAfter = /[.,?!:;]/.test(nextChar);

    result += SOFT_RETURN + full + (skipAfter ? "" : SOFT_RETURN);
    count++;
  }
  result += text.slice(lastIndex);

  if (count) notes.push(`Inserted soft returns around ${count} parenthetical(s).`);
  return { text: result, notes };
}
