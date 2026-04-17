// Tokens visuels : typographie, spacing, radius, shadows.
// Fonctions pures + presets.

// ─── TYPOGRAPHY ─────────────────────────────────────────────────────────────

export const TYPO_RATIOS = [
  { value: 1.067, name: "Minor Second", hint: "Très serré, éditorial dense" },
  { value: 1.125, name: "Major Second", hint: "Interfaces denses (GitHub, Linear)" },
  { value: 1.2, name: "Minor Third", hint: "Équilibré (proche défaut Tailwind)" },
  { value: 1.25, name: "Major Third", hint: "Classique (Bootstrap, Material)" },
  { value: 1.333, name: "Perfect Fourth", hint: "Éditorial aéré" },
  { value: 1.414, name: "Augmented Fourth", hint: "√2, design classique" },
  { value: 1.5, name: "Perfect Fifth", hint: "Display-heavy" },
  { value: 1.618, name: "Golden Ratio", hint: "Landing pages expressives" },
] as const;

export const TYPO_NAMES = [
  "xs",
  "sm",
  "base",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "4xl",
  "5xl",
] as const;
export type TypoName = (typeof TYPO_NAMES)[number];

export interface TypoSize {
  name: TypoName;
  px: number;
  rem: number;
  lineHeight: number; // unitless
}

export interface TypoScale {
  baseSize: number;
  ratio: number;
  sizes: TypoSize[];
}

export function generateTypoScale(baseSize = 16, ratio = 1.25): TypoScale {
  const baseIndex = TYPO_NAMES.indexOf("base");
  const sizes: TypoSize[] = TYPO_NAMES.map((name, i) => {
    const exp = i - baseIndex;
    const px = baseSize * Math.pow(ratio, exp);
    // line-height décroît avec la taille (1.6 pour body, 1.1 pour headings)
    const lineHeight = px <= 18 ? 1.6 : px <= 28 ? 1.4 : px <= 48 ? 1.2 : 1.1;
    return {
      name,
      px: Math.round(px * 100) / 100,
      rem: Math.round((px / 16) * 1000) / 1000,
      lineHeight,
    };
  });
  return { baseSize, ratio, sizes };
}

// ─── SPACING ────────────────────────────────────────────────────────────────

export const SPACING_PRESETS = {
  "linear-4": {
    label: "Linéaire base 4",
    hint: "Apple HIG, contrôle fin",
    values: [0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64],
  },
  "linear-8": {
    label: "Linéaire base 8",
    hint: "Material Design, plus aéré",
    values: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160],
  },
  hybrid: {
    label: "Hybride Tailwind",
    hint: "4px micro + 8px macro (recommandé)",
    values: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
  },
  geometric: {
    label: "Géométrique × 2",
    hint: "Rare, éditorial",
    values: [0, 4, 8, 16, 32, 64, 128, 256],
  },
} as const;

export type SpacingPresetKey = keyof typeof SPACING_PRESETS;

export const DENSITY_MULTIPLIERS = {
  compact: 0.85,
  normal: 1,
  comfortable: 1.15,
} as const;

export type DensityKey = keyof typeof DENSITY_MULTIPLIERS;

export interface SpacingScale {
  preset: SpacingPresetKey;
  density: DensityKey;
  values: number[]; // valeurs ajustées par density
}

export function generateSpacingScale(
  preset: SpacingPresetKey = "hybrid",
  density: DensityKey = "normal"
): SpacingScale {
  const base = SPACING_PRESETS[preset].values;
  const mult = DENSITY_MULTIPLIERS[density];
  return {
    preset,
    density,
    values: base.map((v) => Math.round(v * mult)),
  };
}

// ─── RADIUS ─────────────────────────────────────────────────────────────────

export const RADIUS_PRESETS = {
  none: { label: "Aucun", value: 0, hint: "Brutalist, sec" },
  sm: { label: "Subtil", value: 4, hint: "Inputs discrets" },
  md: { label: "Normal", value: 8, hint: "Recommandé moderne" },
  lg: { label: "Doux", value: 12, hint: "Cartes" },
  xl: { label: "Marqué", value: 16, hint: "Cartes premium" },
  "2xl": { label: "Très rond", value: 24, hint: "Playful, friendly" },
  full: { label: "Pilule", value: 9999, hint: "Boutons pilules, avatars" },
} as const;

export type RadiusKey = keyof typeof RADIUS_PRESETS;

// ─── SHADOWS ────────────────────────────────────────────────────────────────

export const SHADOW_PRESETS = {
  none: { label: "Aucune", value: "none", hint: "Flat design" },
  sm: {
    label: "Subtle",
    value: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    hint: "Boutons, inputs",
  },
  md: {
    label: "Normal",
    value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    hint: "Cards",
  },
  lg: {
    label: "Marqué",
    value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    hint: "Cards élevées",
  },
  xl: {
    label: "Élevé",
    value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    hint: "Modals, dropdowns",
  },
  "2xl": {
    label: "Dramatique",
    value: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
    hint: "Hero, popovers premium",
  },
} as const;

export type ShadowKey = keyof typeof SHADOW_PRESETS;

// ─── GRADIENTS ──────────────────────────────────────────────────────────────

export type GradientType = "linear" | "radial" | "conic";

export interface GradientStop {
  color: string; // hex ou CSS color
  position: number; // 0-100
}

export interface GradientState {
  type: GradientType;
  angle: number; // degrés (linear) ou start angle (conic)
  stops: GradientStop[];
}

export const DEFAULT_GRADIENT: GradientState = {
  type: "linear",
  angle: 135,
  stops: [
    { color: "#7C6A4F", position: 0 },
    { color: "#E8E0D8", position: 100 },
  ],
};

export function gradientToCss(g: GradientState): string {
  const stopsCss = g.stops
    .map((s) => `${s.color} ${s.position.toFixed(0)}%`)
    .join(", ");
  if (g.type === "linear") {
    return `linear-gradient(${g.angle}deg, ${stopsCss})`;
  }
  if (g.type === "radial") {
    return `radial-gradient(circle, ${stopsCss})`;
  }
  // conic
  return `conic-gradient(from ${g.angle}deg, ${stopsCss})`;
}

export const GRADIENT_PRESETS: { id: string; name: string; value: Omit<GradientState, "type"> & { type: GradientType } }[] = [
  {
    id: "sunset",
    name: "Sunset",
    value: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#f97316", position: 0 },
        { color: "#ec4899", position: 50 },
        { color: "#8b5cf6", position: 100 },
      ],
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    value: {
      type: "linear",
      angle: 180,
      stops: [
        { color: "#06b6d4", position: 0 },
        { color: "#0ea5e9", position: 50 },
        { color: "#1e40af", position: 100 },
      ],
    },
  },
  {
    id: "mint",
    name: "Mint Fresh",
    value: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#a7f3d0", position: 0 },
        { color: "#14b8a6", position: 100 },
      ],
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    value: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#ede9fe", position: 0 },
        { color: "#c4b5fd", position: 50 },
        { color: "#7c3aed", position: 100 },
      ],
    },
  },
  {
    id: "mesh-warm",
    name: "Mesh Warm",
    value: {
      type: "radial",
      angle: 0,
      stops: [
        { color: "#fbbf24", position: 0 },
        { color: "#f43f5e", position: 60 },
        { color: "#8b5cf6", position: 100 },
      ],
    },
  },
  {
    id: "subtle-gray",
    name: "Subtle Gray",
    value: {
      type: "linear",
      angle: 180,
      stops: [
        { color: "#f9fafb", position: 0 },
        { color: "#e5e7eb", position: 100 },
      ],
    },
  },
  {
    id: "brand-mindeck",
    name: "Mindeck Warm",
    value: {
      type: "linear",
      angle: 135,
      stops: [
        { color: "#E8E0D8", position: 0 },
        { color: "#7C6A4F", position: 100 },
      ],
    },
  },
  {
    id: "conic-rainbow",
    name: "Conic Rainbow",
    value: {
      type: "conic",
      angle: 0,
      stops: [
        { color: "#ef4444", position: 0 },
        { color: "#f59e0b", position: 16 },
        { color: "#84cc16", position: 33 },
        { color: "#10b981", position: 50 },
        { color: "#06b6d4", position: 66 },
        { color: "#8b5cf6", position: 83 },
        { color: "#ef4444", position: 100 },
      ],
    },
  },
];
