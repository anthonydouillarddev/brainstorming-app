import type { Project } from "@/lib/types";
import type { StatesState } from "../state";

// Snapshot structuré du chap 8 États (schéma custom Mindeck).
export function exportStatesJson(state: StatesState, project: Project): string {
  return JSON.stringify(
    {
      $schema: "mindeck/states/1.0",
      $description: `États — ${project.official_name || project.name}`,
      project: {
        id: project.id,
        name: project.official_name || project.name,
        type: project.type,
      },
      screens: state.screens,
      loadingPatterns: state.loadingPatterns,
      emptyStates: state.emptyStates,
      errorPatterns: state.errorPatterns,
      microInteractions: state.microInteractions,
      successPatterns: state.successPatterns,
      toasts: state.toasts,
      stateMachines: state.stateMachines,
      latencyLogs: state.latencyLogs,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
