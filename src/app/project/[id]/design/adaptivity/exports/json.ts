import type { Project } from "@/lib/types";
import type { AdaptivityState } from "../state";

export function exportAdaptivityJson(
  state: AdaptivityState,
  project: Project
): string {
  return JSON.stringify(
    {
      $schema: "mindeck/adaptivity/1.0",
      $description: `Adaptativité — ${project.official_name || project.name}`,
      project: {
        id: project.id,
        name: project.official_name || project.name,
        type: project.type,
      },
      breakpoints: state.breakpoints,
      colorSchemes: state.colorSchemes,
      densities: state.densities,
      inputModalities: state.inputModalities,
      containerQueries: state.containerQueries,
      localizations: state.localizations,
      viewportRules: state.viewportRules,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
