import { SOFT_RETURN } from "./types";

export interface ConnectiveResult {
  text: string;
  notes: string[];
}

const CONNECTIVES = ["and", "if", "whether", "although"];

function computeExclusionSpans(text: string): [number, number][] {
  const spans: [number, number][] = [];
  const parenRe = /\([^()]*\)/g;
  const bracketRe = /\[[^[\]]*\]/g;
  let m: RegExpExecArray | null;
  while ((m = parenRe.exec(text)) !== null) spans.push([m.index, m.index + m[0].length]);
  while ((m = bracketRe.exec(text)) !== null) spans.push([m.index, m.index + m[0].length]);
  return spans;
}

function isInsideAnySpan(pos: number, spans: [number, number][]): boolean {
  return spans.some(([s, e]) => pos >= s && pos < e);
}

/**
 * STEP 9: SOFT RETURNS AROUND CONNECTIVES
 * Soft return before and after exact-case "and", "if", "whether",
 * "although" - not inside parens/brackets, and not directly touching a
 * hyphen or em-dash.
 */
export function step9Connectives(text: string): ConnectiveResult {
  const notes: string[] = [];
  const exclusionSpans = computeExclusionSpans(text);
  const re = new RegExp(`\\b(${CONNECTIVES.join("|")})\\b`, "g");

  let result = "";
  let lastIndex = 0;
  let count = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const word = m[1];
    const start = m.index;
    const end = start + word.length;

    if (isInsideAnySpan(start, exclusionSpans)) continue;

    const before = text[start - 1];
    const after = text[end];
    if (before === "-" || before === "—" || after === "-" || after === "—") continue;

    result += text.slice(lastIndex, start) + SOFT_RETURN + word + SOFT_RETURN;
    lastIndex = end;
    count++;
  }
  result += text.slice(lastIndex);

  if (count) notes.push(`Inserted soft returns around ${count} connective(s).`);
  return { text: result, notes };
}
