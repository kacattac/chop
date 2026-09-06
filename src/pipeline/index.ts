import { loadDictionary } from "../dictionary";
import type { StepOutput } from "./types";
import { step1Flatten } from "./step1_flatten";
import { step2RestoreHyphens } from "./step2_restore_hyphens";
import { step3ExtractPageNumbers } from "./step3_page_numbers";
import { step4HyphensEmdashes } from "./step4_hyphens_emdashes";
import { step5SentenceBreaks } from "./step5_sentence_breaks";
import { step6Parentheticals } from "./step6_parentheticals";
import { step7EnumeratedLists } from "./step7_enumerated_lists";
import { step8Punctuation } from "./step8_punctuation";
import { step9Connectives } from "./step9_connectives";
import { step10Transitionals } from "./step10_transitionals";
import { step11Cleanup } from "./step11_cleanup";
import { step12Finalize } from "./step12_finalize";

export type { StepOutput } from "./types";
export { SOFT_RETURN } from "./types";

export interface PipelineResult {
  steps: StepOutput[];
  finalFileName: string;
}

export async function runPipeline(
  rawText: string,
  originalFileName: string,
): Promise<PipelineResult> {
  const dictionary = await loadDictionary();
  const steps: StepOutput[] = [];

  const flattened = step1Flatten(rawText);
  steps.push({ step: 1, title: "Flatten", content: flattened.text, notes: [] });

  const restored = step2RestoreHyphens(flattened.text, dictionary, flattened.suspectOffsets);
  steps.push({
    step: 2,
    title: "Restore run-together words",
    content: restored.text,
    notes: restored.notes,
  });

  const pageNumbers = step3ExtractPageNumbers(restored.text, dictionary);
  steps.push({
    step: 3,
    title: "Extract page numbers",
    content: pageNumbers.text,
    notes: pageNumbers.notes,
  });

  const dashes = step4HyphensEmdashes(pageNumbers.text);
  steps.push({
    step: 4,
    title: "Hyphens and em-dashes",
    content: dashes.text,
    notes: dashes.notes,
  });

  const sentences = step5SentenceBreaks(dashes.text);
  steps.push({
    step: 5,
    title: "Soft returns after sentences and clauses",
    content: sentences.text,
    notes: sentences.notes,
  });

  const parens = step6Parentheticals(sentences.text);
  steps.push({
    step: 6,
    title: "Soft returns around parentheticals",
    content: parens.text,
    notes: parens.notes,
  });

  const lists = step7EnumeratedLists(parens.text);
  steps.push({
    step: 7,
    title: "Enumerated lists",
    content: lists.text,
    notes: lists.notes,
  });

  const punct = step8Punctuation(lists.text);
  steps.push({
    step: 8,
    title: "Soft returns after commas, colons, semicolons",
    content: punct.text,
    notes: punct.notes,
  });

  const connectives = step9Connectives(punct.text);
  steps.push({
    step: 9,
    title: "Soft returns around connectives",
    content: connectives.text,
    notes: connectives.notes,
  });

  const transitionals = step10Transitionals(connectives.text);
  steps.push({
    step: 10,
    title: "Soft returns after transitional words",
    content: transitionals.text,
    notes: transitionals.notes,
  });

  const cleaned = step11Cleanup(transitionals.text);
  steps.push({
    step: 11,
    title: "Clean up",
    content: cleaned.text,
    notes: cleaned.notes,
  });

  const finalFileName = step12Finalize(originalFileName);
  steps.push({
    step: 12,
    title: "Export as .html",
    content: cleaned.text,
    notes: [`Renamed "${originalFileName}" -> "${finalFileName}"`],
  });

  return { steps, finalFileName };
}
