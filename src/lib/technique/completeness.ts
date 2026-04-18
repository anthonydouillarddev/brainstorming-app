// Agrégateur central des 12 fonctions computeXxxCompleteness de l'onglet Technique.
// Permet au menu technique + au cockpit de calculer un % par chapitre et un % global
// à partir du Record<string, string> sections disponibles côté serveur et client.
//
// En Phase 0, aucun chapitre n'est encore implémenté : les computers retournent 0.
// Au fur et à mesure des phases 1-4, chaque chapitre livrera son `computeXxxCompleteness`
// dans `src/app/project/[id]/technique/{chap}/state.ts` et sera wire ici.

import type { TechniqueChapterKey } from "@/app/project/[id]/technique/chapters";
import {
  computeStrategyCompleteness,
  parseStrategyState,
} from "@/app/project/[id]/technique/strategy/state";
import {
  computeArchitectureCompleteness,
  parseArchitectureState,
} from "@/app/project/[id]/technique/architecture/state";
import {
  computeFrontendCompleteness,
  parseFrontendState,
} from "@/app/project/[id]/technique/frontend/state";
import {
  computeBackendCompleteness,
  parseBackendState,
} from "@/app/project/[id]/technique/backend/state";
import {
  computeDataCompleteness,
  parseDataState,
} from "@/app/project/[id]/technique/data/state";

// Clés canoniques dans la table `sections` (JSON dans `content`).
export const TECHNIQUE_SECTION_KEYS: Record<TechniqueChapterKey, string> = {
  strategy: "tech-strategy",
  architecture: "tech-architecture",
  frontend: "tech-frontend",
  backend: "tech-backend",
  data: "tech-data",
  "auth-security": "tech-auth-security",
  services: "tech-services",
  "hosting-devops": "tech-hosting-devops",
  observability: "tech-observability",
  "ai-automation": "tech-ai-automation",
  "costs-compliance": "tech-costs-compliance",
  tooling: "tech-tooling",
};

type ChapterComputer = (content: string | undefined | null) => number;

// Computer par défaut : un chapitre non implémenté retourne 0%.
// À remplacer chapitre par chapitre quand un `compute{Chap}Completeness` sera livré.
const DEFAULT_COMPUTER: ChapterComputer = () => 0;

const CHAPTER_COMPUTERS: Record<TechniqueChapterKey, ChapterComputer> = {
  strategy: (c) => computeStrategyCompleteness(parseStrategyState(c)),
  architecture: (c) => computeArchitectureCompleteness(parseArchitectureState(c)),
  frontend: (c) => computeFrontendCompleteness(parseFrontendState(c)),
  backend: (c) => computeBackendCompleteness(parseBackendState(c)),
  data: (c) => computeDataCompleteness(parseDataState(c)),
  "auth-security": DEFAULT_COMPUTER,
  services: DEFAULT_COMPUTER,
  "hosting-devops": DEFAULT_COMPUTER,
  observability: DEFAULT_COMPUTER,
  "ai-automation": DEFAULT_COMPUTER,
  "costs-compliance": DEFAULT_COMPUTER,
  tooling: DEFAULT_COMPUTER,
};

export function computeChapterCompleteness(
  chapter: TechniqueChapterKey,
  sections: Record<string, string>
): number {
  const key = TECHNIQUE_SECTION_KEYS[chapter];
  const content = sections[key];
  const raw = CHAPTER_COMPUTERS[chapter](content);
  return clamp(raw);
}

export function computeAllChaptersCompleteness(
  sections: Record<string, string>,
  chapters?: readonly TechniqueChapterKey[]
): Record<TechniqueChapterKey, number> {
  const keys =
    chapters ?? (Object.keys(TECHNIQUE_SECTION_KEYS) as TechniqueChapterKey[]);
  const out = {} as Record<TechniqueChapterKey, number>;
  for (const key of Object.keys(TECHNIQUE_SECTION_KEYS) as TechniqueChapterKey[]) {
    out[key] = keys.includes(key)
      ? computeChapterCompleteness(key, sections)
      : 0;
  }
  return out;
}

export function computeOverallTechniqueCompleteness(
  sections: Record<string, string>,
  chapters?: readonly TechniqueChapterKey[]
): number {
  const keys =
    chapters ?? (Object.keys(TECHNIQUE_SECTION_KEYS) as TechniqueChapterKey[]);
  if (keys.length === 0) return 0;
  const total = keys.reduce(
    (acc, key) => acc + computeChapterCompleteness(key, sections),
    0
  );
  return Math.round(total / keys.length);
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}
