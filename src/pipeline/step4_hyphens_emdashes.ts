export interface HyphenEmdashResult {
  text: string;
  notes: string[];
}

/**
 * STEP 4: HYPHENS AND EM-DASHES
 * Convert hyphens to em-dashes where the surrounding syntax clearly
 * indicates one. Word-internal hyphens (no surrounding spaces) are left
 * alone; a hyphen standing alone between spaces, or a doubled ASCII
 * "--" dash substitute, is the clear, low-risk signal to convert.
 */
export function step4HyphensEmdashes(text: string): HyphenEmdashResult {
  const notes: string[] = [];
  let result = text;

  const doubleDashCount = (result.match(/--/g) || []).length;
  if (doubleDashCount > 0) {
    result = result.replace(/--/g, "—");
    notes.push(`Converted ${doubleDashCount} "--" to em-dash.`);
  }

  let spacedCount = 0;
  result = result.replace(/([^\s-]) - ([^\s-])/g, (_full, before: string, after: string) => {
    spacedCount++;
    return `${before} — ${after}`;
  });
  if (spacedCount > 0) {
    notes.push(`Converted ${spacedCount} spaced hyphen(s) to em-dash.`);
  }

  return { text: result, notes };
}
