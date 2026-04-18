"use client";

import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import type { Project } from "@/lib/types";
import type { ChapterMode } from "../_shared/ModeToggle";
import ChapterShell from "../_shared/ChapterShell";

import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import CostBreakdownBlock from "./blocks/CostBreakdownBlock";
import UnitEconomicsBlock from "./blocks/UnitEconomicsBlock";
import GdprLegalBlock from "./blocks/GdprLegalBlock";
import { COSTS_SECTION_KEY, computeCostsCompleteness, mergeCostsState, parseCostsState, type CostsState } from "./state";
import { validateCosts } from "./validators";
import { exportCostsMarkdown } from "./exports/markdown";
import { exportCostsCsv } from "./exports/csv";
import { exportCostsJson } from "./exports/json";
import { exportCostsClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:costs-compliance:mode";

export default function CostsComplianceChapter({
  project, initialSections, onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, changeMode] = useHydratedLocalStorage<ChapterMode>(LS_MODE, "intermediate", isChapterMode);

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<CostsState>({
    projectId: project.id,
    sectionKey: COSTS_SECTION_KEY,
    initialContent: initialSections[COSTS_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseCostsState,
    merge: mergeCostsState,
  });

  const completeness = computeCostsCompleteness(state);
  const issues = validateCosts(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Rapport complet coûts + compliance.", ext: "md", mime: "text/markdown", generate: () => exportCostsMarkdown(state, project.name) },
    { value: "csv", label: "📊 CSV coûts", hint: "Tableur pour comptable / pitch investor.", ext: "csv", mime: "text/csv", generate: () => exportCostsCsv(state) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportCostsJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Privacy Policy + CGU + RGPD endpoints.", ext: "md", mime: "text/markdown", generate: () => exportCostsClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="💰"
      title="Coûts & Compliance"
      description="Modélise infra + unit economics + RGPD/Legal. Break-even clair + non-compliance = amende CNIL 4% CA."
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      <CostBreakdownBlock state={state} onChange={updateState} />
      <UnitEconomicsBlock state={state} onChange={updateState} />
      <GdprLegalBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="costs-compliance" />
    </ChapterShell>
  );
}
