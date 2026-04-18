"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import ErrorTrackingBlock from "./blocks/ErrorTrackingBlock";
import UptimeLogsBlock from "./blocks/UptimeLogsBlock";
import TestingBlock from "./blocks/TestingBlock";
import MetricsBlock from "./blocks/MetricsBlock";
import { OBSERVABILITY_SECTION_KEY, computeObservabilityCompleteness, mergeObservabilityState, parseObservabilityState, type ObservabilityState } from "./state";
import { validateObservability } from "./validators";
import { exportObservabilityMarkdown } from "./exports/markdown";
import { exportObservabilityJson } from "./exports/json";
import { exportObservabilityClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:observability:mode";

export default function ObservabilityChapter({
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

  const { state, updateState, saving, lastSaved } = useChapterPersistence<ObservabilityState>({
    projectId: project.id,
    sectionKey: OBSERVABILITY_SECTION_KEY,
    initialContent: initialSections[OBSERVABILITY_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseObservabilityState,
    merge: mergeObservabilityState,
  });

  const completeness = computeObservabilityCompleteness(state);
  const issues = validateObservability(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Plan observability.", ext: "md", mime: "text/markdown", generate: () => exportObservabilityMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportObservabilityJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Setup complet observability.", ext: "md", mime: "text/markdown", generate: () => exportObservabilityClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="📊"
      title="Observability & Qualité"
      description="Errors + uptime + logs + tests + metrics produit + SLO. Sentry + PostHog + Better Stack + Vitest = combo solo 2026."
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      mode={mode}
      onModeChange={changeMode}
    >
      <ErrorTrackingBlock state={state} onChange={updateState} />
      <UptimeLogsBlock state={state} onChange={updateState} />
      <TestingBlock state={state} onChange={updateState} />
      <MetricsBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="observability" />
    </ChapterShell>
  );
}
