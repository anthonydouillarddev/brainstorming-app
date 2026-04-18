"use client";

import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import type { Project } from "@/lib/types";
import type { ChapterMode } from "../_shared/ModeToggle";
import ChapterShell from "../_shared/ChapterShell";

import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import PatternBlock from "./blocks/PatternBlock";
import RuntimeBlock from "./blocks/RuntimeBlock";
import ApiStyleBlock from "./blocks/ApiStyleBlock";
import JobsBlock from "./blocks/JobsBlock";
import {
  BACKEND_SECTION_KEY,
  computeBackendCompleteness,
  mergeBackendState,
  parseBackendState,
  type BackendState,
} from "./state";
import { validateBackend } from "./validators";
import { getBackendContextHint } from "./templates";
import { exportBackendMarkdown } from "./exports/markdown";
import { exportBackendJson } from "./exports/json";
import { exportBackendClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:backend:mode";

export default function BackendChapter({
  project,
  initialSections,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, changeMode] = useHydratedLocalStorage<ChapterMode>(LS_MODE, "intermediate", isChapterMode);

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<BackendState>({
    projectId: project.id,
    sectionKey: BACKEND_SECTION_KEY,
    initialContent: initialSections[BACKEND_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseBackendState,
    merge: mergeBackendState,
  });

  const completeness = computeBackendCompleteness(state);
  const issues = validateBackend(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Doc archivable.", ext: "md", mime: "text/markdown", generate: () => exportBackendMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportBackendJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Prompt pour scaffold backend.", ext: "md", mime: "text/markdown", generate: () => exportBackendClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="⚙️"
      title="Backend"
      description="Pattern (BaaS/BFF), runtime, API style, background jobs. 95% des SaaS solo n'ont pas de backend séparé."
      contextHint={`Contexte ${project.type} : ${getBackendContextHint(project.type)}`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      <PatternBlock state={state} onChange={updateState} />
      <RuntimeBlock state={state} onChange={updateState} />
      <ApiStyleBlock state={state} onChange={updateState} />
      <JobsBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="backend" />
    </ChapterShell>
  );
}
