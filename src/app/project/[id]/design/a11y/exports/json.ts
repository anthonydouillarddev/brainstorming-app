import type { Project } from "@/lib/types";
import type { A11yState } from "../state";

export function exportA11yJson(state: A11yState, project: Project): string {
  return JSON.stringify(
    {
      $schema: "mindeck/a11y/1.0",
      $description: `A11y — ${project.official_name || project.name}`,
      project: {
        id: project.id,
        name: project.official_name || project.name,
        type: project.type,
      },
      wcagChecks: state.wcagChecks,
      keyboardFlows: state.keyboardFlows,
      landmarks: state.landmarks,
      liveRegions: state.liveRegions,
      ariaPatterns: state.ariaPatterns,
      issues: state.issues,
      assistiveTech: state.assistiveTech,
      cognitiveChecks: state.cognitiveChecks,
      motionPreferences: state.motionPreferences,
      remediation: state.remediation,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
