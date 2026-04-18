// Chapitre 11 — Adaptativité (responsive, dark mode, densité, input modality).
// Sources : Tailwind CSS v4, Material Design 3, Bootstrap 5, Luke Wroblewski
// (Mobile First), web.dev Responsive patterns, Apple HIG, Material pointer guide.

export type AdaptivityMode = "beginner" | "intermediate";

export type BreakpointKind = "mobile" | "tablet" | "laptop" | "desktop" | "ultrawide";

export type ColorSchemeKey = "light" | "dark" | "system" | "high-contrast";

export type DensityKey = "compact" | "normal" | "comfortable";

export type InputKind = "mouse" | "touch" | "keyboard" | "stylus" | "voice";

export type HoverSupport = "hover" | "none";

export type PointerPrecision = "fine" | "coarse";

export type ContainerSize = "xs" | "sm" | "md" | "lg" | "xl";

export type TextDirection = "ltr" | "rtl";

export type ViewportAxis =
  | "zoom-200"
  | "zoom-400-reflow"
  | "orientation-portrait"
  | "orientation-landscape"
  | "safe-area-ios"
  | "safe-area-android"
  | "print";

export interface BreakpointEntry {
  id: string;
  name: string; // "sm", "md", "lg", "xl", "2xl"
  kind: BreakpointKind;
  minPx: number;
  maxPx: number; // 0 = infini
  containerMaxPx: number; // max-width à ce breakpoint
  gridCols: number; // 4 · 8 · 12 colonnes à ce breakpoint
  gutterPx: number;
  marginPx: number;
  notes: string;
}

export interface ColorSchemeEntry {
  id: string;
  scheme: ColorSchemeKey;
  mediaQuery: string; // "@media (prefers-color-scheme: dark)"
  enabled: boolean;
  tokensMapped: number; // nb de tokens couleur ayant une variante ce scheme
  manualOverride: boolean; // user peut forcer depuis settings ?
  notes: string;
}

export interface DensityRuleEntry {
  id: string;
  density: DensityKey;
  baseFontPx: number; // taille de base
  lineHeight: number; // 1.4, 1.5
  spacingScale: number; // multiplicateur (0.875, 1.0, 1.125)
  targetMinPx: number; // taille mini touch target
  notes: string;
}

export interface InputModalityEntry {
  id: string;
  input: InputKind;
  supported: boolean;
  hoverSupport: HoverSupport;
  pointerPrecision: PointerPrecision;
  minTargetPx: number; // cible tactile mini
  cssHint: string; // media query utilisée
  notes: string;
}

export interface ContainerQueryEntry {
  id: string;
  component: string; // "Card project", "Dashboard panel"
  containerName: string; // "project-card"
  threshold: ContainerSize;
  thresholdPx: number; // ex: 400
  layoutChange: string; // "stack → row, avatar visible"
  notes: string;
}

export interface LocalizationEntry {
  id: string;
  locale: string; // "fr-FR", "en-US", "ar-SA"
  label: string; // "Français (France)"
  direction: TextDirection;
  dateFormat: string; // "DD/MM/YYYY"
  numberFormat: string; // "1 234,56" ou "1,234.56"
  currencyFormat: string; // "1 234,56 €"
  enabled: boolean;
  notes: string;
}

export interface ViewportRuleEntry {
  id: string;
  axis: ViewportAxis;
  respected: boolean;
  implementation: string; // CSS / meta viewport
  notes: string;
}

export interface AdaptivityState {
  version: 1;

  // MUST
  breakpoints: BreakpointEntry[];
  colorSchemes: ColorSchemeEntry[];
  densities: DensityRuleEntry[];
  inputModalities: InputModalityEntry[];

  // SHOULD
  containerQueries: ContainerQueryEntry[];
  localizations: LocalizationEntry[];
  viewportRules: ViewportRuleEntry[];

  // Meta
  modeUsed: AdaptivityMode;
  updatedAt: string;
}

export const ADAPTIVITY_SECTION_KEY = "adaptivity";

export const DEFAULT_ADAPTIVITY_STATE: AdaptivityState = {
  version: 1,
  breakpoints: [],
  colorSchemes: [],
  densities: [],
  inputModalities: [],
  containerQueries: [],
  localizations: [],
  viewportRules: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeAdaptivityState(
  partial: Partial<AdaptivityState> | null | undefined
): AdaptivityState {
  if (!partial) return DEFAULT_ADAPTIVITY_STATE;
  return {
    ...DEFAULT_ADAPTIVITY_STATE,
    ...partial,
    breakpoints: partial.breakpoints ?? [],
    colorSchemes: partial.colorSchemes ?? [],
    densities: partial.densities ?? [],
    inputModalities: partial.inputModalities ?? [],
    containerQueries: partial.containerQueries ?? [],
    localizations: partial.localizations ?? [],
    viewportRules: partial.viewportRules ?? [],
  };
}

export function parseAdaptivityState(
  content: string | undefined | null
): AdaptivityState {
  if (!content) return DEFAULT_ADAPTIVITY_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeAdaptivityState(raw);
  } catch {
    return DEFAULT_ADAPTIVITY_STATE;
  }
}

export function computeAdaptivityCompleteness(state: AdaptivityState): number {
  let score = 0;
  // MUST — 60%
  if (state.breakpoints.length >= 3) score += 15;
  else if (state.breakpoints.length >= 2) score += 8;
  if (state.colorSchemes.length >= 2) score += 15;
  else if (state.colorSchemes.length >= 1) score += 7;
  if (state.densities.length >= 2) score += 15;
  else if (state.densities.length >= 1) score += 7;
  if (state.inputModalities.length >= 2) score += 15;
  else if (state.inputModalities.length >= 1) score += 7;
  // SHOULD — 40%
  if (state.containerQueries.length >= 2) score += 13;
  else if (state.containerQueries.length >= 1) score += 6;
  if (state.localizations.length >= 1) score += 14;
  const respectedVp = state.viewportRules.filter((v) => v.respected).length;
  if (respectedVp >= 3) score += 13;
  else if (respectedVp >= 1) score += 6;
  return Math.min(100, score);
}

export const BREAKPOINT_KIND_META: Record<
  BreakpointKind,
  { label: string; emoji: string; hint: string }
> = {
  mobile: {
    label: "Mobile",
    emoji: "📱",
    hint: "< 640px · portrait smartphone",
  },
  tablet: {
    label: "Tablet",
    emoji: "📱",
    hint: "640–1024px · iPad portrait / grand smartphone",
  },
  laptop: {
    label: "Laptop",
    emoji: "💻",
    hint: "1024–1440px · MacBook / Windows laptop",
  },
  desktop: {
    label: "Desktop",
    emoji: "🖥️",
    hint: "1440–1920px · écran de bureau",
  },
  ultrawide: {
    label: "Ultrawide",
    emoji: "🎬",
    hint: "> 1920px · écran large / 4K",
  },
};

export const COLOR_SCHEME_META: Record<
  ColorSchemeKey,
  { label: string; emoji: string; mediaQuery: string; hint: string }
> = {
  light: {
    label: "Clair",
    emoji: "☀️",
    mediaQuery: "@media (prefers-color-scheme: light)",
    hint: "Défaut · fond clair · texte sombre",
  },
  dark: {
    label: "Sombre",
    emoji: "🌙",
    mediaQuery: "@media (prefers-color-scheme: dark)",
    hint: "Fond sombre · texte clair · réduit fatigue oculaire de nuit",
  },
  system: {
    label: "Système",
    emoji: "⚙️",
    mediaQuery: "window.matchMedia('(prefers-color-scheme: dark)')",
    hint: "Suit l'OS · par défaut recommandé",
  },
  "high-contrast": {
    label: "Contraste élevé",
    emoji: "🔳",
    mediaQuery: "@media (prefers-contrast: more)",
    hint: "WCAG AAA · bordures renforcées, contrastes 7:1+",
  },
};

export const DENSITY_META: Record<
  DensityKey,
  { label: string; emoji: string; hint: string; fontPx: number; lineHeight: number; spacing: number }
> = {
  compact: {
    label: "Compact",
    emoji: "📌",
    hint: "Power user · max info / écran · 14px base",
    fontPx: 14,
    lineHeight: 1.4,
    spacing: 0.875,
  },
  normal: {
    label: "Normal",
    emoji: "📄",
    hint: "Défaut · 16px base · équilibre",
    fontPx: 16,
    lineHeight: 1.5,
    spacing: 1,
  },
  comfortable: {
    label: "Confortable",
    emoji: "🛋️",
    hint: "Lisibilité · 17-18px · seniors, accessibilité",
    fontPx: 17,
    lineHeight: 1.6,
    spacing: 1.125,
  },
};

export const INPUT_KIND_META: Record<
  InputKind,
  { label: string; emoji: string; mediaQuery: string; hint: string }
> = {
  mouse: {
    label: "Souris",
    emoji: "🖱️",
    mediaQuery: "@media (hover: hover) and (pointer: fine)",
    hint: "Desktop/laptop · hover, precision clicks",
  },
  touch: {
    label: "Touch",
    emoji: "👆",
    mediaQuery: "@media (hover: none) and (pointer: coarse)",
    hint: "Mobile/tablet · pas de hover, doigts 24-44px mini",
  },
  keyboard: {
    label: "Clavier",
    emoji: "⌨️",
    mediaQuery: "@media (hover: none) · focus-visible",
    hint: "Accessibilité · Tab / Arrow / Esc · focus visible obligatoire",
  },
  stylus: {
    label: "Stylet",
    emoji: "🖊️",
    mediaQuery: "@media (hover: none) and (pointer: fine)",
    hint: "iPad + Apple Pencil · precision mais pas hover",
  },
  voice: {
    label: "Voix",
    emoji: "🎤",
    mediaQuery: "—",
    hint: "Dragon, Voice Control macOS · labels visibles obligatoires (WCAG 2.5.3)",
  },
};

export const HOVER_META: Record<HoverSupport, { label: string; emoji: string }> = {
  hover: { label: "Hover", emoji: "✅" },
  none: { label: "No hover", emoji: "🚫" },
};

export const POINTER_META: Record<PointerPrecision, { label: string; emoji: string }> = {
  fine: { label: "Fine (souris/stylet)", emoji: "🎯" },
  coarse: { label: "Coarse (doigt)", emoji: "👆" },
};

export const CONTAINER_SIZE_META: Record<
  ContainerSize,
  { label: string; defaultPx: number; hint: string }
> = {
  xs: { label: "Extra small", defaultPx: 200, hint: "Widget compact · icône seule" },
  sm: { label: "Small", defaultPx: 400, hint: "Card mobile · 1 colonne" },
  md: { label: "Medium", defaultPx: 600, hint: "Card tablet · 2 colonnes" },
  lg: { label: "Large", defaultPx: 800, hint: "Zone dashboard · 3 colonnes" },
  xl: { label: "Extra large", defaultPx: 1000, hint: "Zone full-width" },
};

export const DIRECTION_META: Record<
  TextDirection,
  { label: string; emoji: string; attr: string }
> = {
  ltr: { label: "Left to Right", emoji: "➡️", attr: 'dir="ltr"' },
  rtl: { label: "Right to Left", emoji: "⬅️", attr: 'dir="rtl"' },
};

export const VIEWPORT_AXIS_META: Record<
  ViewportAxis,
  { label: string; emoji: string; hint: string; wcag: string }
> = {
  "zoom-200": {
    label: "Zoom 200%",
    emoji: "🔍",
    hint: "WCAG 1.4.4 · texte zoom 200% sans perte info",
    wcag: "1.4.4 AA",
  },
  "zoom-400-reflow": {
    label: "Reflow 400%",
    emoji: "🔎",
    hint: "WCAG 1.4.10 · pas de scroll horizontal à 320px (zoom 400%)",
    wcag: "1.4.10 AA",
  },
  "orientation-portrait": {
    label: "Portrait",
    emoji: "📱",
    hint: "Mobile portrait · pas forcer landscape",
    wcag: "1.3.4 AA",
  },
  "orientation-landscape": {
    label: "Landscape",
    emoji: "📟",
    hint: "Tablet/laptop horizontal · layout adapté",
    wcag: "1.3.4 AA",
  },
  "safe-area-ios": {
    label: "Safe area iOS",
    emoji: "🍎",
    hint: "Notch, home indicator · env(safe-area-inset-*)",
    wcag: "—",
  },
  "safe-area-android": {
    label: "Safe area Android",
    emoji: "🤖",
    hint: "Navigation bar, display cutout",
    wcag: "—",
  },
  print: {
    label: "Print",
    emoji: "🖨️",
    hint: "@media print · couleurs converties, links étendus",
    wcag: "—",
  },
};
