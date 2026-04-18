import type { Project } from "@/lib/types";
import type { MicrocopyState } from "../state";

export function exportMicrocopyJson(
  state: MicrocopyState,
  project: Project
): string {
  return JSON.stringify(
    {
      $schema: "mindeck/microcopy/1.0",
      $description: `Microcopy — ${project.official_name || project.name}`,
      project: {
        id: project.id,
        name: project.official_name || project.name,
        type: project.type,
      },
      ctas: state.ctas,
      formFields: state.formFields,
      systemMessages: state.systemMessages,
      glossary: state.glossary,
      voiceTones: state.voiceTones,
      variantSets: state.variantSets,
      lengthBudgets: state.lengthBudgets,
      inclusiveChecks: state.inclusiveChecks,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
