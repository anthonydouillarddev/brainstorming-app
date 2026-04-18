import type { PaletteTuning } from "@/lib/design/oklch";
import {
  DEFAULT_TOKENS,
  mergeTokens,
  type TokensState,
} from "@/app/design-spike/tokens-block";

export interface VisualSelectedShade {
  id: string;
  hex: string;
  source?: string;
}

export interface VisualState {
  version: 1;
  customColor: string;
  tuning: PaletteTuning;
  selected: VisualSelectedShade[];
  tokens: TokensState;
  neutralTintStrength: number;
  updatedAt: string;
}

export const DEFAULT_VISUAL_STATE: VisualState = {
  version: 1,
  customColor: "#7C6A4F",
  tuning: { contrast: 1, chromaPeakIndex: 6, chromaAmount: 1 },
  selected: [],
  tokens: DEFAULT_TOKENS,
  neutralTintStrength: 0.5,
  updatedAt: new Date().toISOString(),
};

// Merge safe pour gérer les évolutions de schéma (vieux JSON en DB)
export function mergeVisualState(partial: Partial<VisualState> | null | undefined): VisualState {
  if (!partial) return DEFAULT_VISUAL_STATE;
  return {
    ...DEFAULT_VISUAL_STATE,
    ...partial,
    tuning: { ...DEFAULT_VISUAL_STATE.tuning, ...(partial.tuning ?? {}) },
    selected: partial.selected ?? [],
    tokens: mergeTokens(partial.tokens),
    neutralTintStrength:
      typeof partial.neutralTintStrength === "number"
        ? partial.neutralTintStrength
        : DEFAULT_VISUAL_STATE.neutralTintStrength,
  };
}

// Parse le JSON stocké dans sections.content (en string)
export function parseVisualState(content: string | undefined | null): VisualState {
  if (!content) return DEFAULT_VISUAL_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeVisualState(raw);
  } catch {
    return DEFAULT_VISUAL_STATE;
  }
}

export const VISUAL_SECTION_KEY = "design_visual";

export function computeVisualCompleteness(state: VisualState): number {
  let score = 0;
  if (
    state.customColor.trim().toLowerCase() !==
    DEFAULT_VISUAL_STATE.customColor.toLowerCase()
  ) {
    score += 25;
  }
  const t = state.tuning;
  const d = DEFAULT_VISUAL_STATE.tuning;
  if (
    t.contrast !== d.contrast ||
    t.chromaPeakIndex !== d.chromaPeakIndex ||
    t.chromaAmount !== d.chromaAmount
  ) {
    score += 25;
  }
  if (state.selected.length >= 3) score += 25;
  else if (state.selected.length >= 1) score += 12;
  const dt = DEFAULT_TOKENS;
  const tokensChanged =
    state.tokens.typoBaseSize !== dt.typoBaseSize ||
    state.tokens.typoRatio !== dt.typoRatio ||
    state.tokens.spacingPreset !== dt.spacingPreset ||
    state.tokens.spacingDensity !== dt.spacingDensity ||
    state.tokens.radius !== dt.radius ||
    state.tokens.shadow !== dt.shadow ||
    state.tokens.fontPairingId !== dt.fontPairingId ||
    state.tokens.fontMode !== dt.fontMode;
  if (tokensChanged) score += 25;
  return Math.min(100, score);
}
