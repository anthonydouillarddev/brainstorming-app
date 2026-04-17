import type { Project } from "@/lib/types";
import type { FoundationsState } from "../state";

export function exportFoundationsJson(
  state: FoundationsState,
  project: Project
): string {
  const payload = {
    $description: "Mindeck — Fondations stratégiques (chap. 1)",
    $source: "mindeck",
    project: {
      name: project.official_name || project.name,
      type: project.type,
      description: project.description,
      northStar: project.north_star,
    },
    jtbd: {
      core: state.jtbdCore,
      emotional: state.jtbdEmotional,
      social: state.jtbdSocial,
    },
    personas: state.personas.map((p) => ({
      ...p,
      isPrimary: p.id === state.primaryPersonaId,
    })),
    jobStories: state.jobStories,
    positioning: {
      alternatives: state.positioningAlternatives,
      uniqueAttributes: state.positioningUniqueAttributes,
      value: state.positioningValue,
      segment: state.positioningSegment,
      category: state.positioningCategory,
      statement: state.positioningStatement,
    },
    ahaMoment: {
      event: state.ahaMomentEvent,
      threshold: state.ahaMomentThreshold,
    },
    designPrinciples: state.designPrinciples,
    antiGoals: state.antiGoals,
    meta: {
      modeUsed: state.modeUsed,
      updatedAt: state.updatedAt,
    },
  };

  return JSON.stringify(payload, null, 2);
}
