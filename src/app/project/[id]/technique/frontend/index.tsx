"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import FrameworkBlock from "./blocks/FrameworkBlock";
import RenderingBlock from "./blocks/RenderingBlock";
import StylingBlock from "./blocks/StylingBlock";
import TypeScriptBlock from "./blocks/TypeScriptBlock";
import {
  FRONTEND_SECTION_KEY,
  computeFrontendCompleteness,
  mergeFrontendState,
  parseFrontendState,
  type FrontendState,
} from "./state";
import { validateFrontend } from "./validators";
import { getFrontendContextHint } from "./templates";
import { exportFrontendMarkdown } from "./exports/markdown";
import { exportFrontendJson } from "./exports/json";
import { exportFrontendClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:frontend:mode";

export default function FrontendChapter({
  project,
  initialSections,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, setMode] = useState<ChapterMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: ChapterMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const { state, updateState, saving, lastSaved } = useChapterPersistence<FrontendState>({
    projectId: project.id,
    sectionKey: FRONTEND_SECTION_KEY,
    initialContent: initialSections[FRONTEND_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseFrontendState,
    merge: mergeFrontendState,
  });

  const completeness = computeFrontendCompleteness(state);
  const issues = validateFrontend(state);

  const formats: ExportFormat[] = [
    {
      value: "markdown",
      label: "📄 Markdown",
      hint: "Doc archivable, compatible GitHub/Obsidian.",
      ext: "md",
      mime: "text/markdown",
      generate: () => exportFrontendMarkdown(state, project.name),
    },
    {
      value: "json",
      label: "📦 JSON",
      hint: "Shape versionné pour reuse automatisé.",
      ext: "json",
      mime: "application/json",
      generate: () => exportFrontendJson(state, project.name),
    },
    {
      value: "claude",
      label: "🤖 Claude brief",
      hint: "Prompt prêt à coller pour scaffold.",
      ext: "md",
      mime: "text/markdown",
      generate: () => exportFrontendClaudeBrief(state, project.name),
    },
  ];

  return (
    <ChapterShell
      emoji="🎨"
      title="Frontend"
      description="Framework, rendering, styling, TypeScript. Next.js 16 + Tailwind v4 = combo SaaS 2026."
      contextHint={`Contexte ${project.type} : ${getFrontendContextHint(project.type)}`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      mode={mode}
      onModeChange={changeMode}
    >
      <FrameworkBlock state={state} onChange={updateState} />
      <RenderingBlock state={state} onChange={updateState} />
      <StylingBlock state={state} onChange={updateState} />
      <TypeScriptBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="frontend" />
    </ChapterShell>
  );
}
