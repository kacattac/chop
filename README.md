# Chop

A browser app that runs a .txt file through the 12-step text-reformatting
procedure (flatten OCR line breaks, restore dropped hyphens, extract page
numbers, insert soft returns around sentences/clauses/connectives, etc.)
and exports the result as an .html file.

Everything runs client-side and offline — no server, no API calls. The
heuristics for the two judgment-heavy steps (restoring run-together words,
extracting page numbers/running heads) are dictionary- and pattern-based;
see the "Notes" panel under each step for what was flagged or changed.

## Develop

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## How it works

- `src/pipeline/` — one module per numbered step, run in order by
  `src/pipeline/index.ts`.
- `public/words.txt` — an offline English word list (bundled), used to:
  - detect run-together words that should be re-hyphenated (Step 2), by
    checking whether a long non-dictionary token splits cleanly into two
    dictionary words;
  - reconstruct words split by a mid-word page break (Step 3).
- Page numbers are extracted with confidence only when a number sits
  directly next to a run of 2+ ALL-CAPS words (the OCR rendering of a
  running head) or inside a `word NUMBER word` mid-word break. An
  ALL-CAPS run with no adjacent number is left alone rather than deleted,
  since it can't reliably be told apart from genuine content (e.g. a real
  chapter heading).
- "Soft returns" (Steps 5-10) are represented internally as `\n` and
  rendered as line breaks in the step viewer.
