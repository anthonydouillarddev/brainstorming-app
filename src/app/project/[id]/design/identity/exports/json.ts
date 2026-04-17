import type { Project } from "@/lib/types";
import type { IdentityState } from "../state";
import { ARCHETYPES } from "../archetypes";

export function exportIdentityJson(state: IdentityState, project: Project): string {
  const archetype = state.archetypeKey
    ? ARCHETYPES.find((a) => a.key === state.archetypeKey)
    : null;

  return JSON.stringify(
    {
      $description: "Mindeck — Identité de marque & ton (chap. 2)",
      $source: "mindeck",
      project: {
        name: project.official_name || project.name,
        type: project.type,
      },
      archetype: archetype
        ? { key: archetype.key, name: archetype.name, tagline: archetype.tagline }
        : null,
      voiceSliders: state.voiceSliders,
      glossary: {
        do: state.doWords,
        dont: state.dontWords,
      },
      brandPromise: state.brandPromise,
      toneMatrix: state.toneMatrix.filter(
        (r) => r.tone.trim() || r.exampleDo.trim() || r.exampleDont.trim()
      ),
      references: state.references,
      antiReferences: state.antiReferences,
      mood: {
        emotionalDirection: state.emotionalDirection,
        keywords: state.moodKeywords,
      },
      visualAxes: state.visualAxes,
      kapfererPrism: state.kapfererPrism,
      meta: {
        modeUsed: state.modeUsed,
        updatedAt: state.updatedAt,
      },
    },
    null,
    2
  );
}
