// Presets breakpoints, schemes, densities, input modalities.

import type {
  BreakpointEntry,
  ColorSchemeEntry,
  ContainerQueryEntry,
  DensityRuleEntry,
  InputModalityEntry,
  LocalizationEntry,
  ViewportRuleEntry,
} from "./state";

export interface BreakpointPreset {
  name: string;
  kind: BreakpointEntry["kind"];
  minPx: number;
  maxPx: number;
  containerMaxPx: number;
  gridCols: number;
  gutterPx: number;
  marginPx: number;
}

// Preset Tailwind v4 par défaut + container-queries compatible
export const BREAKPOINTS_TAILWIND: BreakpointPreset[] = [
  {
    name: "sm",
    kind: "mobile",
    minPx: 0,
    maxPx: 639,
    containerMaxPx: 100,
    gridCols: 4,
    gutterPx: 16,
    marginPx: 16,
  },
  {
    name: "md",
    kind: "tablet",
    minPx: 640,
    maxPx: 1023,
    containerMaxPx: 768,
    gridCols: 8,
    gutterPx: 24,
    marginPx: 24,
  },
  {
    name: "lg",
    kind: "laptop",
    minPx: 1024,
    maxPx: 1279,
    containerMaxPx: 1024,
    gridCols: 12,
    gutterPx: 32,
    marginPx: 32,
  },
  {
    name: "xl",
    kind: "desktop",
    minPx: 1280,
    maxPx: 1535,
    containerMaxPx: 1280,
    gridCols: 12,
    gutterPx: 32,
    marginPx: 40,
  },
  {
    name: "2xl",
    kind: "ultrawide",
    minPx: 1536,
    maxPx: 0,
    containerMaxPx: 1536,
    gridCols: 12,
    gutterPx: 32,
    marginPx: 48,
  },
];

// Preset Material Design 3
export const BREAKPOINTS_MATERIAL: BreakpointPreset[] = [
  {
    name: "compact",
    kind: "mobile",
    minPx: 0,
    maxPx: 599,
    containerMaxPx: 100,
    gridCols: 4,
    gutterPx: 16,
    marginPx: 16,
  },
  {
    name: "medium",
    kind: "tablet",
    minPx: 600,
    maxPx: 839,
    containerMaxPx: 840,
    gridCols: 8,
    gutterPx: 24,
    marginPx: 24,
  },
  {
    name: "expanded",
    kind: "laptop",
    minPx: 840,
    maxPx: 1199,
    containerMaxPx: 1240,
    gridCols: 12,
    gutterPx: 24,
    marginPx: 32,
  },
  {
    name: "large",
    kind: "desktop",
    minPx: 1200,
    maxPx: 1599,
    containerMaxPx: 1440,
    gridCols: 12,
    gutterPx: 32,
    marginPx: 32,
  },
  {
    name: "xlarge",
    kind: "ultrawide",
    minPx: 1600,
    maxPx: 0,
    containerMaxPx: 1640,
    gridCols: 12,
    gutterPx: 32,
    marginPx: 48,
  },
];

export const COLOR_SCHEME_PRESETS: Omit<ColorSchemeEntry, "id">[] = [
  {
    scheme: "light",
    mediaQuery: "@media (prefers-color-scheme: light)",
    enabled: true,
    tokensMapped: 0,
    manualOverride: true,
    notes: "Thème par défaut · fond clair",
  },
  {
    scheme: "dark",
    mediaQuery: "@media (prefers-color-scheme: dark)",
    enabled: true,
    tokensMapped: 0,
    manualOverride: true,
    notes: "Thème sombre · baisse fatigue oculaire nuit",
  },
  {
    scheme: "system",
    mediaQuery: "window.matchMedia('(prefers-color-scheme: dark)')",
    enabled: true,
    tokensMapped: 0,
    manualOverride: false,
    notes: "Suit l'OS · défaut recommandé",
  },
  {
    scheme: "high-contrast",
    mediaQuery: "@media (prefers-contrast: more)",
    enabled: false,
    tokensMapped: 0,
    manualOverride: false,
    notes: "WCAG AAA · bordures et texte renforcés",
  },
];

export const DENSITY_PRESETS: Omit<DensityRuleEntry, "id">[] = [
  {
    density: "compact",
    baseFontPx: 14,
    lineHeight: 1.4,
    spacingScale: 0.875,
    targetMinPx: 32,
    notes: "Power users · tableaux, dashboards avec beaucoup d'info",
  },
  {
    density: "normal",
    baseFontPx: 16,
    lineHeight: 1.5,
    spacingScale: 1,
    targetMinPx: 40,
    notes: "Défaut · équilibre lisibilité et densité info",
  },
  {
    density: "comfortable",
    baseFontPx: 17,
    lineHeight: 1.6,
    spacingScale: 1.125,
    targetMinPx: 44,
    notes: "Seniors / accessibilité · touch-friendly",
  },
];

// V2 SHOULD — Container queries presets
export const CONTAINER_QUERY_PRESETS: Omit<ContainerQueryEntry, "id">[] = [
  {
    component: "Card projet",
    containerName: "project-card",
    threshold: "sm",
    thresholdPx: 400,
    layoutChange: "Stack → row · avatar visible · méta alignée droite",
    notes: "@container project-card (min-width: 400px) { ... }",
  },
  {
    component: "Panel dashboard",
    containerName: "dash-panel",
    threshold: "md",
    thresholdPx: 600,
    layoutChange: "1 col → 2 cols · stats inline",
    notes: "Indépendant du viewport · adapte à la colonne parent",
  },
  {
    component: "Sidebar nav",
    containerName: "sidebar",
    threshold: "xs",
    thresholdPx: 200,
    layoutChange: "Label caché → icône + label",
    notes: "Collapse intelligent selon largeur sidebar",
  },
  {
    component: "Table",
    containerName: "data-table",
    threshold: "lg",
    thresholdPx: 800,
    layoutChange: "Cards mobile → table classique",
    notes: "Switch layout si parent < lg",
  },
];

// V2 SHOULD — Localizations
export const LOCALE_PRESETS: Omit<LocalizationEntry, "id">[] = [
  {
    locale: "fr-FR",
    label: "Français (France)",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1 234,56",
    currencyFormat: "1 234,56 €",
    enabled: true,
    notes: "Défaut Mindeck",
  },
  {
    locale: "en-US",
    label: "English (US)",
    direction: "ltr",
    dateFormat: "MM/DD/YYYY",
    numberFormat: "1,234.56",
    currencyFormat: "$1,234.56",
    enabled: false,
    notes: "Marché international",
  },
  {
    locale: "en-GB",
    label: "English (UK)",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    currencyFormat: "£1,234.56",
    enabled: false,
    notes: "UK / Commonwealth",
  },
  {
    locale: "de-DE",
    label: "Deutsch (Deutschland)",
    direction: "ltr",
    dateFormat: "DD.MM.YYYY",
    numberFormat: "1.234,56",
    currencyFormat: "1.234,56 €",
    enabled: false,
    notes: "Traductions souvent 30% plus longues — prévoir layout flexible",
  },
  {
    locale: "es-ES",
    label: "Español (España)",
    direction: "ltr",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1.234,56",
    currencyFormat: "1.234,56 €",
    enabled: false,
    notes: "",
  },
  {
    locale: "ar-SA",
    label: "العربية (Saudi Arabia)",
    direction: "rtl",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1٬234٫56",
    currencyFormat: "1٬234٫56 ر.س.",
    enabled: false,
    notes: "RTL · inverser paddings, margins, icônes directionnelles",
  },
  {
    locale: "he-IL",
    label: "עברית (Israel)",
    direction: "rtl",
    dateFormat: "DD/MM/YYYY",
    numberFormat: "1,234.56",
    currencyFormat: "₪1,234.56",
    enabled: false,
    notes: "RTL · idem AR",
  },
  {
    locale: "ja-JP",
    label: "日本語 (Japan)",
    direction: "ltr",
    dateFormat: "YYYY/MM/DD",
    numberFormat: "1,234.56",
    currencyFormat: "¥1,234",
    enabled: false,
    notes: "CJK · line-height 1.7+ · pas d'espace avant ponctuation",
  },
];

// V2 SHOULD — Viewport rules
export const VIEWPORT_PRESETS: Omit<ViewportRuleEntry, "id">[] = [
  {
    axis: "zoom-200",
    respected: false,
    implementation: "Pas de font-size en px fixe · utiliser rem/em · tester browser zoom 200%",
    notes: "WCAG 1.4.4 AA · aucune perte d'info ni de fonctionnalité",
  },
  {
    axis: "zoom-400-reflow",
    respected: false,
    implementation: "Layout fluide à 320px · pas de scroll horizontal",
    notes: "WCAG 1.4.10 AA · zoom jusqu'à 400% sans scroll-H (sauf data tabulaires)",
  },
  {
    axis: "orientation-portrait",
    respected: false,
    implementation: "Pas de rotate forcé · @media (orientation: portrait) { ... }",
    notes: "WCAG 1.3.4 AA · user choisit son orientation",
  },
  {
    axis: "orientation-landscape",
    respected: false,
    implementation: "@media (orientation: landscape) { ... }",
    notes: "Adapter layout si paysage utile (tablette, carrousels)",
  },
  {
    axis: "safe-area-ios",
    respected: false,
    implementation:
      "padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);",
    notes: "iPhone notch + home indicator · viewport-fit=cover meta tag",
  },
  {
    axis: "safe-area-android",
    respected: false,
    implementation: "window.setFlags(FLAG_LAYOUT_NO_LIMITS) côté natif · CSS env() partiel",
    notes: "Display cutout · navigation bar 3-boutons ou gestuelle",
  },
  {
    axis: "print",
    respected: false,
    implementation:
      "@media print { body { background: white; color: black; } a::after { content: ' (' attr(href) ')'; } }",
    notes: "Couleurs convertibles · URLs visibles · page-break-inside: avoid",
  },
];

export const INPUT_MODALITY_PRESETS: Omit<InputModalityEntry, "id">[] = [
  {
    input: "mouse",
    supported: true,
    hoverSupport: "hover",
    pointerPrecision: "fine",
    minTargetPx: 24,
    cssHint: "@media (hover: hover) and (pointer: fine)",
    notes: "Desktop · hover + click precision",
  },
  {
    input: "touch",
    supported: true,
    hoverSupport: "none",
    pointerPrecision: "coarse",
    minTargetPx: 44,
    cssHint: "@media (hover: none) and (pointer: coarse)",
    notes: "Mobile · WCAG 2.5.8 = 24×24 min, Apple HIG = 44×44",
  },
  {
    input: "keyboard",
    supported: true,
    hoverSupport: "none",
    pointerPrecision: "fine",
    minTargetPx: 24,
    cssHint: ":focus-visible { outline: 2px solid var(--accent); }",
    notes: "A11y obligatoire · WCAG 2.1.1 + 2.4.7",
  },
  {
    input: "stylus",
    supported: false,
    hoverSupport: "none",
    pointerPrecision: "fine",
    minTargetPx: 32,
    cssHint: "@media (hover: none) and (pointer: fine)",
    notes: "iPad + Apple Pencil · précis mais pas hover",
  },
  {
    input: "voice",
    supported: false,
    hoverSupport: "none",
    pointerPrecision: "fine",
    minTargetPx: 24,
    cssHint: "—",
    notes: "Dragon / macOS Voice Control · WCAG 2.5.3 labels visibles",
  },
];
