import type { Project } from "@/lib/types";
import type { FlowsState } from "../state";
import { computeActivationMetric, computeFrictionScore } from "../state";

export function exportFlowsJson(state: FlowsState, project: Project): string {
  const friction = computeFrictionScore(state);
  const activationMetric = computeActivationMetric(state.northStarAction);

  return JSON.stringify(
    {
      $description: "Mindeck — Parcours utilisateur & flows (chap. 4)",
      $source: "mindeck",
      project: {
        name: project.official_name || project.name,
        type: project.type,
      },
      onboardingPattern: state.onboardingPattern,
      northStarAction: state.northStarAction,
      activationMetric,
      steps: state.steps,
      ahaMomentStepId: state.ahaMomentStepId,
      branches: state.branches,
      journeyPhases: state.journeyPhases,
      emptyStates: state.emptyStates,
      aarrrMetrics: state.aarrrMetrics,
      frictionScore: friction,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
