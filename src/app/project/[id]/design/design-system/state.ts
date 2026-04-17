import type { MvpPriority } from "./components-catalog";
import type { PatternType } from "./patterns-library";

export type DesignSystemMode = "beginner" | "intermediate";

export type DensityKey = "compact" | "normal" | "comfortable";

export interface SemanticToken {
  id: string;
  name: string; // bg.primary, text.danger, border.muted
  primitiveHex: string; // ex: #7C6A4F
  primitiveRef?: string; // ex: color.moka.500 si dispo
  description: string;
}

export interface ContrastPair {
  id: string;
  name: string; // "Text sur Card"
  fgHex: string;
  bgHex: string;
}

export interface ComponentSelection {
  slug: string;
  priority: MvpPriority;
  notes: string;
}

export interface ComponentVariant {
  id: string;
  componentSlug: string;
  variants: string[]; // ["primary", "secondary", "ghost"]
  sizes: string[]; // ["sm", "md", "lg"]
  states: string[]; // ["default", "hover", "active", "focus", "disabled"]
}

export interface A11yCheck {
  componentSlug: string;
  focusVisible: boolean;
  keyboardNav: boolean;
  ariaLabel: boolean;
  contrastAA: boolean;
  notes: string;
}

export interface PatternSelection {
  patternId: string;
  type: PatternType;
  customMarkdown: string; // édité par l'user si besoin
}

export interface DeprecatedToken {
  name: string;
  replacedBy: string;
  deprecatedAt: string;
}

export interface DesignSystemState {
  version: 1;

  // MUST
  semanticTokens: SemanticToken[];
  contrastPairs: ContrastPair[];
  components: ComponentSelection[];
  patterns: PatternSelection[];

  // SHOULD
  variants: ComponentVariant[];
  a11yChecks: A11yCheck[];
  density: DensityKey;

  // NICE
  deprecatedTokens: DeprecatedToken[];

  // Meta
  modeUsed: DesignSystemMode;
  updatedAt: string;
}

export const DESIGN_SYSTEM_SECTION_KEY = "design-system";

// Presets de semantic tokens par défaut (suggestions)
export const SEMANTIC_PRESETS: Omit<SemanticToken, "id">[] = [
  { name: "bg.primary", primitiveHex: "#7C6A4F", description: "Fond des CTAs primaires" },
  { name: "bg.surface", primitiveHex: "#F2EDE8", description: "Fond des cards / surfaces" },
  { name: "bg.page", primitiveHex: "#E8E0D8", description: "Fond de page" },
  { name: "text.default", primitiveHex: "#2a2a2a", description: "Texte principal" },
  { name: "text.muted", primitiveHex: "#7a7068", description: "Texte secondaire" },
  { name: "text.inverse", primitiveHex: "#ffffff", description: "Texte sur fond sombre/coloré" },
  { name: "border.default", primitiveHex: "#d4cbc0", description: "Bordures standard" },
  { name: "accent.primary", primitiveHex: "#7C6A4F", description: "Accent principal (links, icons)" },
  { name: "feedback.danger", primitiveHex: "#dc2626", description: "Erreurs, destructif" },
  { name: "feedback.success", primitiveHex: "#16a34a", description: "Succès, confirmation" },
];

export const DEFAULT_DESIGN_SYSTEM_STATE: DesignSystemState = {
  version: 1,
  semanticTokens: [],
  contrastPairs: [],
  components: [],
  patterns: [],
  variants: [],
  a11yChecks: [],
  density: "normal",
  deprecatedTokens: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeDesignSystemState(
  partial: Partial<DesignSystemState> | null | undefined
): DesignSystemState {
  if (!partial) return DEFAULT_DESIGN_SYSTEM_STATE;
  return {
    ...DEFAULT_DESIGN_SYSTEM_STATE,
    ...partial,
    semanticTokens: partial.semanticTokens ?? [],
    contrastPairs: partial.contrastPairs ?? [],
    components: partial.components ?? [],
    patterns: partial.patterns ?? [],
    variants: partial.variants ?? [],
    a11yChecks: partial.a11yChecks ?? [],
    deprecatedTokens: partial.deprecatedTokens ?? [],
  };
}

export function parseDesignSystemState(
  content: string | undefined | null
): DesignSystemState {
  if (!content) return DEFAULT_DESIGN_SYSTEM_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeDesignSystemState(raw);
  } catch {
    return DEFAULT_DESIGN_SYSTEM_STATE;
  }
}

export function computeDsCompleteness(state: DesignSystemState): number {
  let score = 0;
  if (state.semanticTokens.length >= 5) score += 25;
  if (state.components.length >= 8) score += 25;
  if (state.patterns.length >= 2) score += 25;
  if (state.contrastPairs.length >= 3) score += 25;
  return score;
}

// WCAG contrast ratio (simplifié)
export function computeContrastRatio(fgHex: string, bgHex: string): number {
  const parse = (h: string) => {
    const hex = h.replace("#", "");
    if (hex.length !== 6) return null;
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  };
  const fg = parse(fgHex);
  const bg = parse(bgHex);
  if (!fg || !bg) return 0;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const lum = (rgb: number[]) =>
    0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);
  const l1 = lum(fg);
  const l2 = lum(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastLevel(ratio: number): "aaa" | "aa" | "aa-large" | "fail" {
  if (ratio >= 7) return "aaa";
  if (ratio >= 4.5) return "aa";
  if (ratio >= 3) return "aa-large";
  return "fail";
}
