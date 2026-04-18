"use client";

import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import type { Project } from "@/lib/types";
import type { ChapterMode } from "../_shared/ModeToggle";
import type { ProjectType as SvcProjectType } from "@/lib/technique/services-catalog";
import { COMMON_TOOLS, TOOLS_BY_PROJECT_TYPE } from "@/lib/technique/tooling-presets";
import ChapterShell from "../_shared/ChapterShell";

import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import OsBudgetBlock from "./blocks/OsBudgetBlock";
import ToolsBlock from "./blocks/ToolsBlock";
import { TOOLING_SECTION_KEY, computeToolingCompleteness, mergeToolingState, parseToolingState, type ToolingState } from "./state";
import { exportToolingMarkdown } from "./exports/markdown";
import { exportToolingJson } from "./exports/json";
import { exportToolingClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:tooling:mode";

export default function ToolingChapter({
  project, initialSections, onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, changeMode] = useHydratedLocalStorage<ChapterMode>(LS_MODE, "intermediate", isChapterMode);

  const projectType = project.type as SvcProjectType;
  const totalCategories = COMMON_TOOLS.length + TOOLS_BY_PROJECT_TYPE[projectType].length;

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<ToolingState>({
    projectId: project.id,
    sectionKey: TOOLING_SECTION_KEY,
    initialContent: initialSections[TOOLING_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseToolingState,
    merge: mergeToolingState,
  });

  const completeness = computeToolingCompleteness(state, totalCategories);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Setup complet + notes.", ext: "md", mime: "text/markdown", generate: () => exportToolingMarkdown(state, project.name, projectType) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportToolingJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Script install + config Cursor/Obsidian/Raycast.", ext: "md", mime: "text/markdown", generate: () => exportToolingClaudeBrief(state, project.name, projectType) },
  ];

  return (
    <ChapterShell
      emoji="🛠️"
      title="Outillage & Knowledge"
      description="IDE+AI, knowledge mgmt, launcher, terminal, git GUI — + outils spécifiques au type projet."
      contextHint={`Outils variant selon type ${project.type}.`}
      completeness={completeness}
      issues={[]}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      <OsBudgetBlock state={state} onChange={updateState} />
      <ToolsBlock state={state} onChange={updateState} projectType={projectType} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="tooling" />
    </ChapterShell>
  );
}
