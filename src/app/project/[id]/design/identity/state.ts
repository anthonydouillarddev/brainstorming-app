import type { ArchetypeKey } from "./archetypes";

export type IdentityMode = "beginner" | "intermediate";
export type EmotionalDirection = "calm" | "energy" | "trust" | "joy" | "focus";

export interface ToneMatrixRow {
  id: string;
  context: string; // onboarding, error, success, empty state, billing
  contextEmoji: string;
  tone: string;
  exampleDo: string;
  exampleDont: string;
}

export interface BrandReference {
  id: string;
  name: string;
  why: string;
}

export interface KapfererPrism {
  physique: string;
  personality: string;
  relationship: string;
  culture: string;
  reflection: string;
  mentalisation: string;
}

export interface VoiceSliders {
  // 4 axes NN/G
  formalCasual: number; // 0 = formel, 100 = casual
  seriousFunny: number; // 0 = sérieux, 100 = drôle
  respectfulIrreverent: number; // 0 = respectueux, 100 = irrévérencieux
  matterOfFactEnthusiastic: number; // 0 = factuel, 100 = enthousiaste
  // 3 axes complémentaires (V2)
  technicalGeneral: number; // 0 = technique, 100 = grand public
  warmDistant: number; // 0 = chaleureux, 100 = distant
  humbleAmbitious: number; // 0 = humble, 100 = ambitieux
}

export interface VisualAxes {
  minimalExpressive: number; // 0 = minimal, 100 = expressif
  warmCold: number; // 0 = chaud, 100 = froid
  classicExperimental: number; // 0 = classique, 100 = expérimental
}

export interface IdentityState {
  version: 1;

  // MUST
  archetypeKey: ArchetypeKey | null;
  brandAttributes: string[]; // 3-5 mots-clés
  voiceSliders: VoiceSliders;
  doWords: string[];
  dontWords: string[];
  brandPromise: string;
  toneMatrix: ToneMatrixRow[];

  // SHOULD V2
  references: BrandReference[]; // max 3
  antiReferences: BrandReference[]; // max 2
  moodKeywords: string[]; // 3-5 mots
  emotionalDirection: EmotionalDirection | null;
  visualAxes: VisualAxes;

  // NICE V3
  kapfererPrism: KapfererPrism;

  // Meta
  modeUsed: IdentityMode;
  updatedAt: string;
}

export const IDENTITY_SECTION_KEY = "identity";

const DEFAULT_SLIDERS: VoiceSliders = {
  formalCasual: 50,
  seriousFunny: 50,
  respectfulIrreverent: 50,
  matterOfFactEnthusiastic: 50,
  technicalGeneral: 50,
  warmDistant: 30,
  humbleAmbitious: 50,
};

const DEFAULT_VISUAL_AXES: VisualAxes = {
  minimalExpressive: 50,
  warmCold: 50,
  classicExperimental: 50,
};

const DEFAULT_PRISM: KapfererPrism = {
  physique: "",
  personality: "",
  relationship: "",
  culture: "",
  reflection: "",
  mentalisation: "",
};

const DEFAULT_TONE_MATRIX: ToneMatrixRow[] = [
  { id: "onboarding", context: "Onboarding", contextEmoji: "🚀", tone: "", exampleDo: "", exampleDont: "" },
  { id: "error", context: "Erreur", contextEmoji: "❌", tone: "", exampleDo: "", exampleDont: "" },
  { id: "success", context: "Succès", contextEmoji: "✅", tone: "", exampleDo: "", exampleDont: "" },
];

export const TONE_MATRIX_EXTRA: ToneMatrixRow[] = [
  { id: "empty", context: "Empty state", contextEmoji: "📭", tone: "", exampleDo: "", exampleDont: "" },
  { id: "billing", context: "Paiement / facturation", contextEmoji: "💳", tone: "", exampleDo: "", exampleDont: "" },
];

export const DEFAULT_IDENTITY_STATE: IdentityState = {
  version: 1,
  archetypeKey: null,
  brandAttributes: [],
  voiceSliders: DEFAULT_SLIDERS,
  doWords: [],
  dontWords: [],
  brandPromise: "",
  toneMatrix: DEFAULT_TONE_MATRIX,
  references: [],
  antiReferences: [],
  moodKeywords: [],
  emotionalDirection: null,
  visualAxes: DEFAULT_VISUAL_AXES,
  kapfererPrism: DEFAULT_PRISM,
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeRefId(): string {
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeIdentityState(
  partial: Partial<IdentityState> | null | undefined
): IdentityState {
  if (!partial) return DEFAULT_IDENTITY_STATE;
  return {
    ...DEFAULT_IDENTITY_STATE,
    ...partial,
    voiceSliders: { ...DEFAULT_SLIDERS, ...(partial.voiceSliders ?? {}) },
    visualAxes: { ...DEFAULT_VISUAL_AXES, ...(partial.visualAxes ?? {}) },
    kapfererPrism: { ...DEFAULT_PRISM, ...(partial.kapfererPrism ?? {}) },
    brandAttributes: partial.brandAttributes ?? [],
    doWords: partial.doWords ?? [],
    dontWords: partial.dontWords ?? [],
    toneMatrix:
      partial.toneMatrix && partial.toneMatrix.length > 0
        ? partial.toneMatrix
        : DEFAULT_TONE_MATRIX,
    references: partial.references ?? [],
    antiReferences: partial.antiReferences ?? [],
    moodKeywords: partial.moodKeywords ?? [],
  };
}

export function parseIdentityState(content: string | undefined | null): IdentityState {
  if (!content) return DEFAULT_IDENTITY_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeIdentityState(raw);
  } catch {
    return DEFAULT_IDENTITY_STATE;
  }
}

// Score de complétude 0-100 basé sur les MUST (V1)
export function computeIdentityCompleteness(state: IdentityState): number {
  let score = 0;
  if (state.archetypeKey) score += 20;
  if (
    state.voiceSliders.formalCasual !== 50 ||
    state.voiceSliders.seriousFunny !== 50 ||
    state.voiceSliders.respectfulIrreverent !== 50 ||
    state.voiceSliders.matterOfFactEnthusiastic !== 50
  )
    score += 20;
  if (state.doWords.length >= 3 && state.dontWords.length >= 3) score += 20;
  if (state.brandPromise.trim().length >= 10) score += 20;
  const filledMatrix = state.toneMatrix.filter((r) => r.tone.trim() || r.exampleDo.trim()).length;
  if (filledMatrix >= 3) score += 20;
  return score;
}
