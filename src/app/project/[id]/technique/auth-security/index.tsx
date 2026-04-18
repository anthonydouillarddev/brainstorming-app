"use client";

import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import type { Project } from "@/lib/types";
import type { ChapterMode } from "../_shared/ModeToggle";
import ChapterShell from "../_shared/ChapterShell";

import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import AuthMethodBlock from "./blocks/AuthMethodBlock";
import RbacBlock from "./blocks/RbacBlock";
import OwaspBlock from "./blocks/OwaspBlock";
import SecretsBlock from "./blocks/SecretsBlock";
import { AUTH_SECURITY_SECTION_KEY, computeAuthSecCompleteness, mergeAuthSecState, parseAuthSecState, type AuthSecState } from "./state";
import { validateAuthSec } from "./validators";
import { getAuthSecContextHint } from "./templates";
import { exportAuthSecMarkdown } from "./exports/markdown";
import { exportAuthSecJson } from "./exports/json";
import { exportAuthSecClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:auth-security:mode";

export default function AuthSecurityChapter({
  project, initialSections, onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, changeMode] = useHydratedLocalStorage<ChapterMode>(LS_MODE, "intermediate", isChapterMode);

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<AuthSecState>({
    projectId: project.id,
    sectionKey: AUTH_SECURITY_SECTION_KEY,
    initialContent: initialSections[AUTH_SECURITY_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseAuthSecState,
    merge: mergeAuthSecState,
  });

  const completeness = computeAuthSecCompleteness(state);
  const issues = validateAuthSec(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "OWASP audit + checklist.", ext: "md", mime: "text/markdown", generate: () => exportAuthSecMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape versionné audit.", ext: "json", mime: "application/json", generate: () => exportAuthSecJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Setup auth + RLS complet.", ext: "md", mime: "text/markdown", generate: () => exportAuthSecClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="🔐"
      title="Auth & Sécurité"
      description="Méthode auth + session + RBAC + OWASP Top 10 2025 + secrets. Non-négociable."
      contextHint={`Contexte ${project.type} : ${getAuthSecContextHint(project.type)}`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      <AuthMethodBlock state={state} onChange={updateState} />
      <RbacBlock state={state} onChange={updateState} />
      <OwaspBlock state={state} onChange={updateState} />
      <SecretsBlock state={state} onChange={updateState} />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="auth-security" />
    </ChapterShell>
  );
}
