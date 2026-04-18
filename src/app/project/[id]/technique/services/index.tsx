"use client";

import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import type { Project } from "@/lib/types";
import type { ChapterMode } from "../_shared/ModeToggle";
import type { ProjectType as ServiceProjectType } from "@/lib/technique/services-catalog";
import ChapterShell from "../_shared/ChapterShell";

import ExportPanel, { type ExportFormat } from "../_shared/ExportPanel";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import CatalogBlock from "./blocks/CatalogBlock";
import { SERVICES_SECTION_KEY, computeServicesCompleteness, mergeServicesState, parseServicesState, type ServicesState } from "./state";
import { validateServices } from "./validators";
import { exportServicesMarkdown } from "./exports/markdown";
import { exportServicesJson } from "./exports/json";
import { exportServicesClaudeBrief } from "./exports/claude-brief";

const LS_MODE = "mindeck:technique:services:mode";

export default function ServicesChapter({
  project, initialSections, onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const [mode, changeMode] = useHydratedLocalStorage<ChapterMode>(LS_MODE, "intermediate", isChapterMode);

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<ServicesState>({
    projectId: project.id,
    sectionKey: SERVICES_SECTION_KEY,
    initialContent: initialSections[SERVICES_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseServicesState,
    merge: mergeServicesState,
  });

  const completeness = computeServicesCompleteness(state);
  const issues = validateServices(state);

  const formats: ExportFormat[] = [
    { value: "markdown", label: "📄 Markdown", hint: "Liste services utilisés par groupe.", ext: "md", mime: "text/markdown", generate: () => exportServicesMarkdown(state, project.name) },
    { value: "json", label: "📦 JSON", hint: "Shape structurée used/evaluated/skip.", ext: "json", mime: "application/json", generate: () => exportServicesJson(state, project.name) },
    { value: "claude", label: "🤖 Claude brief", hint: "Config + env vars + coûts.", ext: "md", mime: "text/markdown", generate: () => exportServicesClaudeBrief(state, project.name) },
  ];

  return (
    <ChapterShell
      emoji="🔌"
      title="Services tiers & Intégrations"
      description="Catalogue de 26 catégories (paiement, email, storage, CMS, support…) avec scoring 🔥🌱🪦. Décide : utilisé / évalué / pas besoin."
      contextHint={`Catalogue filtré automatiquement selon type ${project.type}. Désactive le filtre pour voir tout.`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      <CatalogBlock
        state={state}
        onChange={updateState}
        projectType={project.type as ServiceProjectType}
      />
      <ExportPanel formats={formats} projectName={project.name} filenamePrefix="services" />
    </ChapterShell>
  );
}
