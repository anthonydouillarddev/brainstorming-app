"use client";

import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import PatternBlock from "./blocks/PatternBlock";
import LayersBlock from "./blocks/LayersBlock";
import DataFlowBlock from "./blocks/DataFlowBlock";
import EntitiesBlock from "./blocks/EntitiesBlock";
import SecurityBoundariesBlock from "./blocks/SecurityBoundariesBlock";
import ExportBlock from "./blocks/ExportBlock";
import BeginnerChat from "./components/BeginnerChat";
import {
  ARCHITECTURE_SECTION_KEY,
  computeArchitectureCompleteness,
  mergeArchitectureState,
  parseArchitectureState,
  type ArchitectureState,
} from "./state";
import { validateArchitecture } from "./validators";
import { getArchitectureContextHint } from "./templates";

const LS_MODE = "mindeck:technique:architecture:mode";

export default function ArchitectureChapter({
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

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<ArchitectureState>({
    projectId: project.id,
    sectionKey: ARCHITECTURE_SECTION_KEY,
    initialContent: initialSections[ARCHITECTURE_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseArchitectureState,
    merge: mergeArchitectureState,
  });

  const completeness = computeArchitectureCompleteness(state);
  const issues = validateArchitecture(state);

  return (
    <ChapterShell
      emoji="🏛️"
      title="Architecture & Blueprint"
      description="Pattern architectural, couches techniques, flux de données, modèle de données, sécu boundaries. Monolith-first, éviter microservices avant 500k€ ARR."
      contextHint={`Contexte ${project.type} : ${getArchitectureContextHint(project.type)}`}
      completeness={completeness}
      issues={issues}
      saving={saving}
      lastSaved={lastSaved}
      saveError={saveError}
      mode={mode}
      onModeChange={changeMode}
    >
      {mode === "beginner" ? (
        <BeginnerChat state={state} onApply={updateState} />
      ) : (
        <>
          <PatternBlock state={state} onChange={updateState} />
          <LayersBlock state={state} onChange={updateState} />
          <DataFlowBlock state={state} onChange={updateState} />
          <EntitiesBlock state={state} onChange={updateState} />
          <SecurityBoundariesBlock state={state} onChange={updateState} />
          <ExportBlock state={state} projectName={project.name} />
        </>
      )}
    </ChapterShell>
  );
}
