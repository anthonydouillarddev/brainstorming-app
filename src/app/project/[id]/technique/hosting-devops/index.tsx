"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import HostingPlatformBlock from "./blocks/HostingPlatformBlock";
import CiCdBlock from "./blocks/CiCdBlock";
import EnvironmentsBlock from "./blocks/EnvironmentsBlock";
import DeploymentBlock from "./blocks/DeploymentBlock";
import { HOSTING_SECTION_KEY, computeHostingCompleteness, mergeHostingState, parseHostingState, type HostingState } from "./state";
import { validateHosting } from "./validators";
import { exportHostingMarkdown } from "./exports/markdown";
import { exportHostingJson } from "./exports/json";
import { exportHostingGithubActions } from "./exports/github-actions";
import { exportHostingClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:hosting-devops:mode";

export default function HostingDevopsChapter({
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

  const { state, updateState, saving, lastSaved } = useChapterPersistence<HostingState>({
    projectId: project.id,
    sectionKey: HOSTING_SECTION_KEY,
    initialContent: initialSections[HOSTING_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseHostingState,
    merge: mergeHostingState,
  });

  const completeness = computeHostingCompleteness(state);
  const issues = validateHosting(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Doc CI/CD.", ext: "md", mime: "text/markdown", generate: () => exportHostingMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné.", ext: "json", mime: "application/json", generate: () => exportHostingJson(state, project.name) },
    { value: "gh-actions", label: "⚡ GitHub Actions", hint: "Workflow YAML starter.", ext: "yml", mime: "text/yaml", generate: () => exportHostingGithubActions(state) },
    { value: "claude", label: "🤖 Claude brief", hint: "Setup CI/CD complet.", ext: "md", mime: "text/markdown", generate: () => exportHostingClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="🚀"
      title="Hosting & DevOps"
      description="Plateforme + CI/CD + envs + déploiement. Rollback < 30s, preview envs pour PR, feature flags pour rollout safe."
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      mode={mode}
      onModeChange={changeMode}
    >
      <HostingPlatformBlock state={state} onChange={updateState} />
      <CiCdBlock state={state} onChange={updateState} />
      <EnvironmentsBlock state={state} onChange={updateState} />
      <DeploymentBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="hosting-devops" />
    </ChapterShell>
  );
}
