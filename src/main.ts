import "./style.css";
import { runPipeline, type StepOutput } from "./pipeline";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="shell">
    <header>
      <h1>Chop</h1>
      <p class="subtitle">Reformat a .txt file through the 12-step procedure and export it as .html.</p>
    </header>

    <section class="upload-card" id="upload-card">
      <input type="file" id="file-input" accept=".txt" />
      <p class="hint">Choose a .txt file to begin.</p>
    </section>

    <section id="results" hidden>
      <div class="tabs" id="tabs"></div>
      <div class="panel">
        <div id="content" class="content"></div>
      </div>
      <div class="notes" id="notes"></div>
      <div class="actions">
        <button id="download-btn">Download final .html</button>
        <span id="filename-preview"></span>
      </div>
    </section>

    <p class="error" id="error" hidden></p>
  </div>
`;

const fileInput = document.querySelector<HTMLInputElement>("#file-input")!;
const resultsSection = document.querySelector<HTMLElement>("#results")!;
const tabsEl = document.querySelector<HTMLDivElement>("#tabs")!;
const contentEl = document.querySelector<HTMLDivElement>("#content")!;
const notesEl = document.querySelector<HTMLDivElement>("#notes")!;
const downloadBtn = document.querySelector<HTMLButtonElement>("#download-btn")!;
const filenamePreview = document.querySelector<HTMLSpanElement>("#filename-preview")!;
const errorEl = document.querySelector<HTMLParagraphElement>("#error")!;

type StepSelector = number | "all";

let currentSteps: StepOutput[] = [];
let currentFinalFileName = "";
let activeStep: StepSelector = "all";

function renderTabs() {
  const allButton = `<button class="tab${activeStep === "all" ? " active" : ""}" data-step="all">All steps</button>`;
  const stepButtons = currentSteps
    .map(
      (s) =>
        `<button class="tab${s.step === activeStep ? " active" : ""}" data-step="${s.step}">${s.step}. ${s.title}</button>`,
    )
    .join("");
  tabsEl.innerHTML = allButton + stepButtons;

  tabsEl.querySelectorAll<HTMLButtonElement>(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.step!;
      activeStep = value === "all" ? "all" : parseInt(value, 10);
      renderTabs();
      renderContent();
    });
  });
}

function renderContent() {
  if (activeStep === "all") {
    contentEl.innerHTML = currentSteps
      .map(
        (s) =>
          `<h3 class="step-heading">${s.step}. ${escapeHtml(s.title)}</h3><div class="step-body">${escapeHtml(s.content)}</div>`,
      )
      .join("");
  } else {
    const step = currentSteps.find((s) => s.step === activeStep)!;
    contentEl.innerHTML = `<div class="step-body">${escapeHtml(step.content)}</div>`;
  }

  const selected = activeStep;
  const relevantSteps =
    selected === "all" ? currentSteps : currentSteps.filter((s) => s.step <= selected);
  const allNotes = relevantSteps.flatMap((s) => s.notes.map((n) => `Step ${s.step}: ${n}`));

  notesEl.innerHTML = allNotes.length
    ? `<h3>Notes</h3><ul>${allNotes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>`
    : "";
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  errorEl.hidden = true;
  resultsSection.hidden = true;

  try {
    const rawText = await file.text();
    const { steps, finalFileName } = await runPipeline(rawText, file.name);
    currentSteps = steps;
    currentFinalFileName = finalFileName;
    activeStep = "all";

    resultsSection.hidden = false;
    filenamePreview.textContent = `Will export as: ${finalFileName}`;
    renderTabs();
    renderContent();
  } catch (err) {
    errorEl.hidden = false;
    errorEl.textContent = err instanceof Error ? err.message : String(err);
  }
});

downloadBtn.addEventListener("click", () => {
  const finalStep = currentSteps[currentSteps.length - 1];
  if (!finalStep) return;

  const blob = new Blob([finalStep.content], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = currentFinalFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});
