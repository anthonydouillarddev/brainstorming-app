// Agrégateur central des 12 fonctions computeXxxCompleteness.
// Permet au menu design + au cockpit de calculer un % par chapitre et un % global
// à partir du Record<string, string> sections disponibles côté serveur et client.

import type { DesignChapterKey } from "@/app/project/[id]/design/chapters";

import {
  FOUNDATIONS_SECTION_KEY,
  computeFoundationsCompleteness,
  parseFoundationsState,
} from "@/app/project/[id]/design/foundations/state";
import {
  IDENTITY_SECTION_KEY,
  computeIdentityCompleteness,
  parseIdentityState,
} from "@/app/project/[id]/design/identity/state";
import {
  INFO_NAV_SECTION_KEY,
  computeInfoNavCompleteness,
  parseInfoNavState,
} from "@/app/project/[id]/design/info-nav/state";
import {
  FLOWS_SECTION_KEY,
  computeFlowsCompleteness,
  parseFlowsState,
} from "@/app/project/[id]/design/flows/state";
import {
  PRINCIPLES_SECTION_KEY,
  computePrinciplesCompleteness,
  parsePrinciplesState,
} from "@/app/project/[id]/design/principles/state";
import {
  VISUAL_SECTION_KEY,
  computeVisualCompleteness,
  parseVisualState,
} from "@/app/project/[id]/design/visual/state";
import {
  DESIGN_SYSTEM_SECTION_KEY,
  computeDesignSystemCompleteness,
  parseDesignSystemState,
} from "@/app/project/[id]/design/design-system/state";
import {
  STATES_SECTION_KEY,
  computeStatesCompleteness,
  parseStatesState,
} from "@/app/project/[id]/design/states/state";
import {
  MICROCOPY_SECTION_KEY,
  computeMicrocopyCompleteness,
  parseMicrocopyState,
} from "@/app/project/[id]/design/microcopy/state";
import {
  A11Y_SECTION_KEY,
  computeA11yCompleteness,
  parseA11yState,
} from "@/app/project/[id]/design/a11y/state";
import {
  ADAPTIVITY_SECTION_KEY,
  computeAdaptivityCompleteness,
  parseAdaptivityState,
} from "@/app/project/[id]/design/adaptivity/state";
import {
  VALIDATION_SECTION_KEY,
  computeValidationCompleteness,
  parseValidationState,
} from "@/app/project/[id]/design/validation/state";

export const DESIGN_SECTION_KEYS: Record<DesignChapterKey, string> = {
  foundations: FOUNDATIONS_SECTION_KEY,
  identity: IDENTITY_SECTION_KEY,
  "info-nav": INFO_NAV_SECTION_KEY,
  flows: FLOWS_SECTION_KEY,
  principles: PRINCIPLES_SECTION_KEY,
  visual: VISUAL_SECTION_KEY,
  "design-system": DESIGN_SYSTEM_SECTION_KEY,
  states: STATES_SECTION_KEY,
  microcopy: MICROCOPY_SECTION_KEY,
  a11y: A11Y_SECTION_KEY,
  adaptivity: ADAPTIVITY_SECTION_KEY,
  validation: VALIDATION_SECTION_KEY,
};

type ChapterComputer = (content: string | undefined | null) => number;

const CHAPTER_COMPUTERS: Record<DesignChapterKey, ChapterComputer> = {
  foundations: (c) => computeFoundationsCompleteness(parseFoundationsState(c)),
  identity: (c) => computeIdentityCompleteness(parseIdentityState(c)),
  "info-nav": (c) => computeInfoNavCompleteness(parseInfoNavState(c)),
  flows: (c) => computeFlowsCompleteness(parseFlowsState(c)),
  principles: (c) => computePrinciplesCompleteness(parsePrinciplesState(c)),
  visual: (c) => computeVisualCompleteness(parseVisualState(c)),
  "design-system": (c) =>
    computeDesignSystemCompleteness(parseDesignSystemState(c)),
  states: (c) => computeStatesCompleteness(parseStatesState(c)),
  microcopy: (c) => computeMicrocopyCompleteness(parseMicrocopyState(c)),
  a11y: (c) => computeA11yCompleteness(parseA11yState(c)),
  adaptivity: (c) => computeAdaptivityCompleteness(parseAdaptivityState(c)),
  validation: (c) => computeValidationCompleteness(parseValidationState(c)),
};

export function computeChapterCompleteness(
  chapter: DesignChapterKey,
  sections: Record<string, string>
): number {
  const key = DESIGN_SECTION_KEYS[chapter];
  const content = sections[key];
  const raw = CHAPTER_COMPUTERS[chapter](content);
  return clamp(raw);
}

export function computeAllChaptersCompleteness(
  sections: Record<string, string>,
  chapters?: readonly DesignChapterKey[]
): Record<DesignChapterKey, number> {
  const keys =
    chapters ?? (Object.keys(DESIGN_SECTION_KEYS) as DesignChapterKey[]);
  const out = {} as Record<DesignChapterKey, number>;
  for (const key of Object.keys(DESIGN_SECTION_KEYS) as DesignChapterKey[]) {
    out[key] = keys.includes(key)
      ? computeChapterCompleteness(key, sections)
      : 0;
  }
  return out;
}

export function computeOverallDesignCompleteness(
  sections: Record<string, string>,
  chapters?: readonly DesignChapterKey[]
): number {
  const keys =
    chapters ?? (Object.keys(DESIGN_SECTION_KEYS) as DesignChapterKey[]);
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
