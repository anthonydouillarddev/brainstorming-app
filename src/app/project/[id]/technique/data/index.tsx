"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import DbEngineBlock from "./blocks/DbEngineBlock";
import HostingBlock from "./blocks/HostingBlock";
import OrmBlock from "./blocks/OrmBlock";
import MigrationsBackupsBlock from "./blocks/MigrationsBackupsBlock";
import { DATA_SECTION_KEY, computeDataCompleteness, mergeDataState, parseDataState, type DataState } from "./state";
import { validateData } from "./validators";
import { getDataContextHint } from "./templates";
import { exportDataMarkdown } from "./exports/markdown";
import { exportDataJson } from "./exports/json";
import { exportDataClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:data:mode";

export default function DataChapter({
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

  const { state, updateState, saving, lastSaved } = useChapterPersistence<DataState>({
    projectId: project.id,
    sectionKey: DATA_SECTION_KEY,
    initialContent: initialSections[DATA_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseDataState,
    merge: mergeDataState,
  });

  const completeness = computeDataCompleteness(state);
  const issues = validateData(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Doc archivable.", ext: "md", mime: "text/markdown", generate: () => exportDataMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportDataJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Schéma + migrations + RLS.", ext: "md", mime: "text/markdown", generate: () => exportDataClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="🗄️"
      title="Data & Database"
      description="Moteur + hosting + ORM + migrations + backups. RLS non-négociable avec Postgres."
      contextHint={`Contexte ${project.type} : ${getDataContextHint(project.type)}`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      mode={mode}
      onModeChange={changeMode}
    >
      <DbEngineBlock state={state} onChange={updateState} />
      <HostingBlock state={state} onChange={updateState} />
      <OrmBlock state={state} onChange={updateState} />
      <MigrationsBackupsBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="data" />
    </ChapterShell>
  );
}
