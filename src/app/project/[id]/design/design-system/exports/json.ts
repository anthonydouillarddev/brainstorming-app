import type { Project } from "@/lib/types";
import type { DesignSystemState } from "../state";

// W3C Design Tokens Format Module (DTCG) — format 2025.10
export function exportDesignSystemDtcg(
  state: DesignSystemState,
  project: Project
): string {
  const tokens: Record<string, unknown> = {
    $description: `Design System — ${project.official_name || project.name}`,
    $source: "mindeck",
  };

  // Convertir semantic tokens en DTCG format
  const colorTokens: Record<string, unknown> = {};
  for (const t of state.semanticTokens) {
    const pathParts = t.name.split(".");
    let current = colorTokens;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const key = pathParts[i];
      if (!current[key]) current[key] = {};
      current = current[key] as Record<string, unknown>;
    }
    const leaf = pathParts[pathParts.length - 1];
    current[leaf] = {
      $type: "color",
      $value: t.primitiveHex,
      $description: t.description,
    };
  }
  if (Object.keys(colorTokens).length > 0) {
    tokens.color = colorTokens;
  }

  return JSON.stringify(
    {
      ...tokens,
      $ext: {
        project: {
          name: project.official_name || project.name,
          type: project.type,
        },
        components: state.components,
        patterns: state.patterns,
        contrastPairs: state.contrastPairs,
        variants: state.variants,
        a11yChecks: state.a11yChecks,
        density: state.density,
        deprecatedTokens: state.deprecatedTokens,
        meta: {
          modeUsed: state.modeUsed,
          updatedAt: state.updatedAt,
        },
      },
    },
    null,
    2
  );
}
