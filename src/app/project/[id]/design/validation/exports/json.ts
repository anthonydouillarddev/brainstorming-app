import type { Project } from "@/lib/types";
import type { ValidationState } from "../state";
import { averageSusScore } from "../state";

export function exportValidationJson(
  state: ValidationState,
  project: Project
): string {
  return JSON.stringify(
    {
      $schema: "mindeck/validation/1.0",
      $description: `Validation — ${project.official_name || project.name}`,
      project: {
        id: project.id,
        name: project.official_name || project.name,
        type: project.type,
      },
      userTests: state.userTests,
      susResponses: state.susResponses,
      susAverage: averageSusScore(state.susResponses),
      heuristicEvals: state.heuristicEvals,
      pmfMetrics: state.pmfMetrics,
      roadmap: state.roadmap,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
