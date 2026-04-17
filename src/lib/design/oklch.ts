import { converter, clampChroma, formatHex } from "culori";

// 12 shades Tailwind-like pour cohérence (50 → 975)
export const SHADE_NAMES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 975] as const;
export type ShadeName = (typeof SHADE_NAMES)[number];

// Courbe lightness de référence (non-linéaire, inspirée Radix + Tailwind v4)
// Plus de détail dans les darks que les lights (œil humain plus sensible aux darks)
const BASE_LIGHTNESS_CURVE = [
  0.985, 0.965, 0.925, 0.865, 0.780, 0.685, 0.575, 0.475, 0.380, 0.290, 0.205, 0.130,
];
const MIDDLE_LIGHTNESS = 0.55; // valeur pivot pour ajuster le contraste

export interface PaletteTuning {
  contrast?: number; // 0.5 = plat, 1 = défaut Radix, 1.4 = agressif
  chromaPeakIndex?: number; // 0-11 : index du shade où la chroma est maximale (défaut 6 = shade 500)
  chromaAmount?: number; // 0 = gris total, 1 = défaut, 1.5 = très saturé
}

const DEFAULT_TUNING: Required<PaletteTuning> = {
  contrast: 1,
  chromaPeakIndex: 6,
  chromaAmount: 1,
};

function lightnessAt(index: number, contrast: number): number {
  const base = BASE_LIGHTNESS_CURVE[index];
  // Étire la courbe autour de son pivot central pour durcir/adoucir le contraste
  const delta = base - MIDDLE_LIGHTNESS;
  const adjusted = MIDDLE_LIGHTNESS + delta * contrast;
  return Math.max(0.04, Math.min(0.99, adjusted));
}

// Cloche gaussienne : pic de saturation à l'index choisi, extrêmes désaturés
function chromaAt(index: number, peakChroma: number, peakIndex: number): number {
  const sigma = 3.2;
  const factor = Math.exp(-Math.pow(index - peakIndex, 2) / (2 * sigma * sigma));
  return peakChroma * factor;
}

export interface OklchColor {
  l: number;
  c: number;
  h: number;
}

export interface PaletteShade {
  name: ShadeName;
  oklch: OklchColor;
  hex: string;
  css: string;
  ratioVsWhite: number;
  ratioVsBlack: number;
}

const toOklch = converter("oklch");

function relativeLuminance(hex: string): number {
  const h = hex.startsWith("#") ? hex.slice(1) : hex;
  const rgb = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface PairSuggestion {
  fg: PaletteShade;
  bg: PaletteShade;
  ratio: number;
  level: "AAA" | "AA" | "AA-L";
  role: string;
}

// Distance perceptuelle OKLCH entre 2 hex (0 = identique, ~1.5 = opposé)
export function oklchDistance(hexA: string, hexB: string): number {
  const a = toOklch(hexA);
  const b = toOklch(hexB);
  if (!a || !b) return Infinity;
  const dL = (a.l ?? 0) - (b.l ?? 0);
  const dC = (a.c ?? 0) - (b.c ?? 0);
  const hA = a.h ?? 0;
  const hB = b.h ?? 0;
  // Diff circulaire sur hue (0-360)
  let dH = Math.abs(hA - hB);
  if (dH > 180) dH = 360 - dH;
  const dHnorm = dH / 360;
  return Math.sqrt(dL * dL + dC * dC + dHnorm * dHnorm);
}

export interface MarriageFixInput {
  bg: string;
  text: string;
  accent?: string;
  secondary?: string;
}

export interface MarriageFixResult {
  bg: string;
  text: string;
  accent: string | null;
  secondary: string | null;
  changes: Array<{ role: "bg" | "text" | "accent" | "secondary"; oldHex: string; newHex: string }>;
  totalDistance: number;
  success: boolean;
}

// Résout une combinaison cohérente qui passe TOUTES les contraintes WCAG en gardant
// la bg FIXE (le fond choisi par l'user) et en cherchant pour text/accent/secondary
// la shade la plus proche de l'originale qui satisfait les contraintes.
// Contraintes : text/bg ≥ 4.5, accent/bg ≥ 3, text/accent ≥ 4.5, secondary/bg ≥ 3.
// Si une couleur passe déjà toutes ses contraintes, elle n'est pas modifiée.
export function findGlobalFix(input: MarriageFixInput): MarriageFixResult {
  const bgHex = input.bg;
  const textShades = generatePalette(input.text);
  const accentShades = input.accent ? generatePalette(input.accent) : null;
  const secondaryShades = input.secondary ? generatePalette(input.secondary) : null;

  // Étape 1 : optimiser text + accent ensemble (couplés par contrainte text/accent)
  let bestText: string = input.text;
  let bestAccent: string | null = input.accent ?? null;
  let bestScore = Infinity;
  let textAccentFound = false;

  for (const text of textShades) {
    if (contrastRatio(text.hex, bgHex) < 4.5) continue;
    const textDist = oklchDistance(text.hex, input.text);

    if (!accentShades) {
      if (textDist < bestScore) {
        bestScore = textDist;
        bestText = text.hex;
        textAccentFound = true;
      }
      continue;
    }

    for (const accent of accentShades) {
      if (contrastRatio(accent.hex, bgHex) < 3) continue;
      if (contrastRatio(text.hex, accent.hex) < 4.5) continue;
      const accentDist = oklchDistance(accent.hex, input.accent ?? accent.hex);
      const total = textDist + accentDist;
      if (total < bestScore) {
        bestScore = total;
        bestText = text.hex;
        bestAccent = accent.hex;
        textAccentFound = true;
      }
    }
  }

  // Étape 2 : secondary indépendant (une seule contrainte vs bg)
  let bestSecondary: string | null = input.secondary ?? null;
  if (secondaryShades && input.secondary) {
    let minDist = Infinity;
    for (const sec of secondaryShades) {
      if (contrastRatio(sec.hex, bgHex) < 3) continue;
      const dist = oklchDistance(sec.hex, input.secondary);
      if (dist < minDist) {
        minDist = dist;
        bestSecondary = sec.hex;
      }
    }
  }

  if (!textAccentFound) {
    return {
      bg: input.bg,
      text: input.text,
      accent: input.accent ?? null,
      secondary: input.secondary ?? null,
      changes: [],
      totalDistance: Infinity,
      success: false,
    };
  }

  const changes: MarriageFixResult["changes"] = [];
  if (bestText.toLowerCase() !== input.text.toLowerCase())
    changes.push({ role: "text", oldHex: input.text, newHex: bestText });
  if (input.accent && bestAccent && bestAccent.toLowerCase() !== input.accent.toLowerCase())
    changes.push({ role: "accent", oldHex: input.accent, newHex: bestAccent });
  if (
    input.secondary &&
    bestSecondary &&
    bestSecondary.toLowerCase() !== input.secondary.toLowerCase()
  )
    changes.push({ role: "secondary", oldHex: input.secondary, newHex: bestSecondary });

  return {
    bg: bgHex,
    text: bestText,
    accent: bestAccent,
    secondary: bestSecondary,
    changes,
    totalDistance: bestScore,
    success: true,
  };
}

// Suggère une composition complète de 5 couleurs (le "spectre utile" de la palette)
// prêtes à charger dans un mariage pour voir le rendu.
export interface FiveColorComposition {
  bgLight: PaletteShade; // fond principal clair
  text: PaletteShade; // texte sur bg light
  accent: PaletteShade; // couleur d'action (CTA)
  bgDark: PaletteShade; // fond sombre (card, dark mode)
  accentSubtle: PaletteShade; // variante douce (bordure, hover léger)
}

export function suggestFiveColors(palette: PaletteShade[]): FiveColorComposition {
  return {
    bgLight: palette[1], // shade 100
    text: palette[9], // shade 900
    accent: palette[6], // shade 500
    bgDark: palette[10], // shade 950
    accentSubtle: palette[2], // shade 200
  };
}

// Cherche une variation du baseHex qui passe `minRatio` contre `againstHex`.
// Retourne null si aucune shade ne satisfait le seuil.
export function findBestAlternative(
  baseHex: string,
  againstHex: string,
  minRatio: number
): PaletteShade | null {
  const palette = generatePalette(baseHex);
  // Trier par proximité de ratio au seuil (le plus juste qui passe),
  // et fallback au meilleur contraste si aucune ne passe
  const scored = palette
    .map((shade) => ({ shade, ratio: contrastRatio(shade.hex, againstHex) }))
    .sort((a, b) => b.ratio - a.ratio);

  const passing = scored.filter((s) => s.ratio >= minRatio);
  if (passing.length === 0) return null;
  // Préfère celle qui passe avec la lightness la plus proche du shade 500 (la couleur "canonique")
  // pour garder l'ambiance de la marque
  const sourceL = palette[6].oklch.l;
  passing.sort((a, b) => Math.abs(a.shade.oklch.l - sourceL) - Math.abs(b.shade.oklch.l - sourceL));
  return passing[0].shade;
}

export function suggestBestPairs(palette: PaletteShade[]): PairSuggestion[] {
  const suggestions: PairSuggestion[] = [];
  const lightBg = palette.slice(0, 3);
  const darkBg = palette.slice(9);
  const darkFg = palette.slice(7);
  const lightFg = palette.slice(0, 3);

  for (const bg of lightBg) {
    for (const fg of darkFg) {
      const r = contrastRatio(fg.hex, bg.hex);
      if (r >= 4.5) {
        suggestions.push({ fg, bg, ratio: r, level: r >= 7 ? "AAA" : "AA", role: "Text sur fond clair" });
        break;
      }
    }
  }
  for (const bg of darkBg) {
    for (const fg of lightFg) {
      const r = contrastRatio(fg.hex, bg.hex);
      if (r >= 4.5) {
        suggestions.push({ fg, bg, ratio: r, level: r >= 7 ? "AAA" : "AA", role: "Text sur fond sombre" });
        break;
      }
    }
  }
  const mid = palette[6];
  for (const bg of lightBg) {
    const r = contrastRatio(mid.hex, bg.hex);
    if (r >= 3) {
      suggestions.push({ fg: mid, bg, ratio: r, level: r >= 4.5 ? "AA" : "AA-L", role: "Accent CTA" });
      break;
    }
  }
  return suggestions.slice(0, 5);
}

// Inverse perceptuellement une palette light en palette dark.
// Asymétrique : les lights deviennent darks et vice versa, mais avec ajustements
// non-linéaires pour lisibilité optimale + réduction de chroma pour éviter la fatigue.
export function generateDarkFromLight(
  lightPalette: PaletteShade[],
  chromaReduction: number = 0.85 // 0 = pas de réduction, 1 = saturation totale conservée
): PaletteShade[] {
  return lightPalette.map((shade, i) => {
    // Inversion asymétrique de la lightness : 50%→62%, 97%→10%, 13%→92% etc.
    // L_dark = 0.10 + (0.97 - 0.10) * (1 - L_light - 0.02)
    // Mais on prend la valeur miroir dans la palette (index inversé) pour cohérence
    const mirrorIdx = lightPalette.length - 1 - i;
    const mirrorL = lightPalette[mirrorIdx].oklch.l;

    // Garde la chroma de la position originale mais réduite
    const C = shade.oklch.c * chromaReduction;
    const hue = shade.oklch.h;
    const raw = { mode: "oklch" as const, l: mirrorL, c: C, h: hue };
    const clamped = clampChroma(raw, "oklch");
    const hex = formatHex(clamped) ?? "#000000";
    const oklch: OklchColor = {
      l: clamped.l ?? mirrorL,
      c: clamped.c ?? C,
      h: clamped.h ?? hue,
    };
    return {
      name: shade.name,
      oklch,
      hex,
      css: `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      ratioVsWhite: contrastRatio(hex, "#ffffff"),
      ratioVsBlack: contrastRatio(hex, "#000000"),
    };
  });
}

// Génère une palette de gris teintés à partir d'une couleur primary.
// La hue de la primary est conservée mais la chroma est très faible (5-2% du max).
// Refactoring UI : "Don't use gray. Use a tinted neutral."
export function generateNeutralPalette(
  primaryHex: string,
  tintStrength: number = 0.5 // 0 = gris pur, 1 = teinte bien visible
): PaletteShade[] {
  const source = toOklch(primaryHex);
  if (!source) throw new Error(`Invalid color: ${primaryHex}`);
  const hue = source.h ?? 0;
  // Chroma cible : courbe exponentielle pour voir un vrai effet à partir de 30-40%
  // 0 = 0 (gris pur), 0.5 = 0.025, 1 = 0.06 (bien visible)
  const peakChroma = 0.06 * Math.pow(tintStrength, 1.5);

  return BASE_LIGHTNESS_CURVE.map((L, i) => {
    // Cloche douce centrée sur le milieu, pour mettre un soupçon de teinte
    const factor = Math.exp(-Math.pow(i - 6, 2) / (2 * 4 * 4));
    const C = peakChroma * factor;
    const raw = { mode: "oklch" as const, l: L, c: C, h: hue };
    const clamped = clampChroma(raw, "oklch");
    const hex = formatHex(clamped) ?? "#000000";
    const oklch: OklchColor = {
      l: clamped.l ?? L,
      c: clamped.c ?? C,
      h: clamped.h ?? hue,
    };
    return {
      name: SHADE_NAMES[i],
      oklch,
      hex,
      css: `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      ratioVsWhite: contrastRatio(hex, "#ffffff"),
      ratioVsBlack: contrastRatio(hex, "#000000"),
    };
  });
}

// Options de hues canoniques par rôle sémantique (inspiré Radix Colors)
export const SEMANTIC_OPTIONS = {
  success: [
    { name: "Emerald", hue: 155 },
    { name: "Green", hue: 145 },
    { name: "Grass", hue: 130 },
    { name: "Mint", hue: 170 },
    { name: "Lime", hue: 120 },
  ],
  warning: [
    { name: "Amber", hue: 70 },
    { name: "Yellow", hue: 90 },
    { name: "Orange", hue: 55 },
    { name: "Gold", hue: 80 },
  ],
  error: [
    { name: "Red", hue: 25 },
    { name: "Crimson", hue: 10 },
    { name: "Ruby", hue: 355 },
    { name: "Tomato", hue: 35 },
    { name: "Rose", hue: 345 },
  ],
  info: [
    { name: "Blue", hue: 245 },
    { name: "Indigo", hue: 265 },
    { name: "Sky", hue: 225 },
    { name: "Cyan", hue: 200 },
    { name: "Violet", hue: 280 },
  ],
} as const;

export type SemanticRole = keyof typeof SEMANTIC_OPTIONS;

// Options par défaut (premier de chaque liste)
export const DEFAULT_SEMANTIC_HUES: Record<SemanticRole, number> = {
  success: 155,
  warning: 70,
  error: 25,
  info: 245,
};

// Génère une palette sémantique à partir d'une hue donnée.
export function generateSemanticPalette(hue: number): PaletteShade[] {
  const peakChroma = 0.18;
  return BASE_LIGHTNESS_CURVE.map((L, i) => {
    const factor = Math.exp(-Math.pow(i - 6, 2) / (2 * 3.2 * 3.2));
    const C = peakChroma * factor;
    const raw = { mode: "oklch" as const, l: L, c: C, h: hue };
    const clamped = clampChroma(raw, "oklch");
    const hex = formatHex(clamped) ?? "#000000";
    const oklch: OklchColor = {
      l: clamped.l ?? L,
      c: clamped.c ?? C,
      h: clamped.h ?? hue,
    };
    return {
      name: SHADE_NAMES[i],
      oklch,
      hex,
      css: `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      ratioVsWhite: contrastRatio(hex, "#ffffff"),
      ratioVsBlack: contrastRatio(hex, "#000000"),
    };
  });
}

// Compat : utilise les hues par défaut
export function generateSemanticPalettes(): Record<SemanticRole, PaletteShade[]> {
  return {
    success: generateSemanticPalette(DEFAULT_SEMANTIC_HUES.success),
    warning: generateSemanticPalette(DEFAULT_SEMANTIC_HUES.warning),
    error: generateSemanticPalette(DEFAULT_SEMANTIC_HUES.error),
    info: generateSemanticPalette(DEFAULT_SEMANTIC_HUES.info),
  };
}

export function generatePalette(
  primaryHex: string,
  tuning: PaletteTuning = {}
): PaletteShade[] {
  const source = toOklch(primaryHex);
  if (!source) throw new Error(`Invalid color: ${primaryHex}`);

  const t = { ...DEFAULT_TUNING, ...tuning };
  const basePeakChroma = Math.min(source.c ?? 0.15, 0.22);
  const peakChroma = basePeakChroma * t.chromaAmount;
  const hue = source.h ?? 0;

  return BASE_LIGHTNESS_CURVE.map((_, i) => {
    const L = lightnessAt(i, t.contrast);
    const C = chromaAt(i, peakChroma, t.chromaPeakIndex);
    const raw = { mode: "oklch" as const, l: L, c: C, h: hue };
    const clamped = clampChroma(raw, "oklch");
    const hex = formatHex(clamped) ?? "#000000";
    const oklch: OklchColor = {
      l: clamped.l ?? L,
      c: clamped.c ?? C,
      h: clamped.h ?? hue,
    };
    return {
      name: SHADE_NAMES[i],
      oklch,
      hex,
      css: `oklch(${(oklch.l * 100).toFixed(1)}% ${oklch.c.toFixed(3)} ${oklch.h.toFixed(1)})`,
      ratioVsWhite: contrastRatio(hex, "#ffffff"),
      ratioVsBlack: contrastRatio(hex, "#000000"),
    };
  });
}
