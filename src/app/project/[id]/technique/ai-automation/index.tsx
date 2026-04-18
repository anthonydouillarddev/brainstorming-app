"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import ProviderBlock from "./blocks/ProviderBlock";
import UseCasesBlock from "./blocks/UseCasesBlock";
import WorkflowBlock from "./blocks/WorkflowBlock";
import { AI_SECTION_KEY, computeAiCompleteness, mergeAiState, parseAiState, type AiState } from "./state";
import { validateAi } from "./validators";
import { exportAiMarkdown } from "./exports/markdown";
import { exportAiJson } from "./exports/json";
import { exportAiClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:ai-automation:mode";

export default function AiAutomationChapter({
  project, initialSections, onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, setMode] = useState<ChapterMode>("intermediate");
  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") setMode(saved);
  }, []);
  function changeMode(m: ChapterMode) { setMode(m); window.localStorage.setItem(LS_MODE, m); }

  const { state, updateState, saving, lastSaved } = useChapterPersistence<AiState>({
    projectId: project.id,
    sectionKey: AI_SECTION_KEY,
    initialContent: initialSections[AI_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseAiState,
    merge: mergeAiState,
  });

  const completeness = computeAiCompleteness(state);
  const issues = validateAi(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Plan IA + workflows.", ext: "md", mime: "text/markdown", generate: () => exportAiMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportAiJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Scaffold IA + prompt library.", ext: "md", mime: "text/markdown", generate: () => exportAiClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="🤖"
      title="IA & Automation"
      description="LLM providers + SDK + use cases + workflow automation (n8n/Zapier/Make). Prompt caching 90% savings obligatoire."
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      mode={mode}
      onModeChange={changeMode}
    >
      <ProviderBlock state={state} onChange={updateState} />
      <UseCasesBlock state={state} onChange={updateState} />
      <WorkflowBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="ai-automation" />
    </ChapterShell>
  );
}
