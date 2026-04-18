"use client";

import type { Project } from "@/lib/types";
import ChapterShell from "../_shared/ChapterShell";
import type { ChapterMode } from "../_shared/ModeToggle";
import { useChapterPersistence } from "../_shared/useChapterPersistence";
import { useHydratedLocalStorage, isChapterMode } from "../_shared/useHydratedLocalStorage";
import ConstraintsBlock from "./blocks/ConstraintsBlock";
import ObjectivesBlock from "./blocks/ObjectivesBlock";
import DriversBlock from "./blocks/DriversBlock";
import RisksBlock from "./blocks/RisksBlock";
import DecisionBlock from "./blocks/DecisionBlock";
import ExportBlock from "./blocks/ExportBlock";
import BeginnerChat from "./components/BeginnerChat";
import {
  STRATEGY_SECTION_KEY,
  computeStrategyCompleteness,
  mergeStrategyState,
  parseStrategyState,
  type StrategyState,
} from "./state";
import { validateStrategy } from "./validators";
import { getStrategyContextHint } from "./templates";

const LS_MODE = "mindeck:technique:strategy:mode";

export default function StrategyChapter({
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

  const { state, updateState, saving, lastSaved, saveError } = useChapterPersistence<StrategyState>({
    projectId: project.id,
    sectionKey: STRATEGY_SECTION_KEY,
    initialContent: initialSections[STRATEGY_SECTION_KEY],
    initialSections,
    onSectionsChange,
    parse: parseStrategyState,
    merge: mergeStrategyState,
  });

  const completeness = computeStrategyCompleteness(state);
  const issues = validateStrategy(state);

  return (
    <ChapterShell
      emoji="🎯"
      title="Stratégie technique"
      description="Cadrer contraintes et objectifs avant de choisir une techno. 5 blocs : contraintes → objectifs → drivers → risques → décision (ADR léger)."
      contextHint={`Contexte ${project.type} : ${getStrategyContextHint(project.type)}`}
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
          <ConstraintsBlock state={state} onChange={updateState} />
          <ObjectivesBlock state={state} onChange={updateState} />
          <DriversBlock state={state} onChange={updateState} />
          <RisksBlock state={state} onChange={updateState} />
          <DecisionBlock projectId={project.id} state={state} onChange={updateState} />
          <ExportBlock state={state} projectName={project.name} />
        </>
      )}
    </ChapterShell>
  );
}
