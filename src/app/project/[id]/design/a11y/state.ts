// Chapitre 10 — Accessibilité (WCAG 2.2 AA, inclusion).
// Sources : W3C WCAG 2.2 (officiel), ARIA Authoring Practices Guide (APG),
// WebAIM, Deque axe-core, RGAA 4.1 (France).

export type A11yMode = "beginner" | "intermediate";

export type WcagPrinciple = "perceivable" | "operable" | "understandable" | "robust";

export type WcagLevel = "A" | "AA" | "AAA";

export type CheckStatus = "pass" | "fail" | "partial" | "unknown" | "not-applicable";

export type Severity = "critical" | "serious" | "moderate" | "minor";

export type AriaLandmark =
  | "banner"
  | "navigation"
  | "main"
  | "complementary"
  | "contentinfo"
  | "search"
  | "form"
  | "region";

export type LiveRegionPoliteness = "off" | "polite" | "assertive";

export type AssistiveTech =
  | "nvda"
  | "jaws"
  | "voiceover-macos"
  | "voiceover-ios"
  | "talkback"
  | "narrator"
  | "orca"
  | "dragon";

export type Browser = "chrome" | "firefox" | "safari" | "edge";

export type CognitiveAxis =
  | "memory-load"
  | "plain-language"
  | "time-limits"
  | "error-prevention"
  | "attention"
  | "consistency"
  | "help-access";

export type RemediationBucket = "now" | "week" | "month" | "quarter" | "wontfix";

export type MotionAxis =
  | "reduced-motion"
  | "reduced-transparency"
  | "increased-contrast"
  | "flash-safety"
  | "autoplay"
  | "animation-pause";

export type AriaWidgetPattern =
  | "alert"
  | "alertdialog"
  | "breadcrumb"
  | "button"
  | "checkbox"
  | "combobox"
  | "dialog"
  | "disclosure"
  | "feed"
  | "grid"
  | "listbox"
  | "menu"
  | "menubar"
  | "menuitem"
  | "radio-group"
  | "slider"
  | "tabs"
  | "toolbar"
  | "tooltip"
  | "tree"
  | "treegrid";

export interface WcagCheckEntry {
  id: string;
  criterionId: string; // "1.1.1", "2.4.7"
  title: string;
  principle: WcagPrinciple;
  level: WcagLevel;
  status: CheckStatus;
  note: string; // observation, workaround, owner
}

export interface KeyboardFlowStep {
  index: number;
  target: string; // "Input email", "Button submit"
  expectedFocus: boolean; // focus visible ?
  notes: string;
}

export interface KeyboardFlowEntry {
  id: string;
  flowName: string; // "Login", "Create project"
  screenId?: string;
  tabOrder: KeyboardFlowStep[];
  trapFocus: boolean; // dans un modal ?
  escapeHandler: string; // "close modal", "cancel"
  skipLinks: string; // "Skip to content" ?
  notes: string;
}

export interface LandmarkEntry {
  id: string;
  landmark: AriaLandmark;
  present: boolean;
  label: string; // aria-label si multiple landmarks de même type
  notes: string;
}

export interface LiveRegionEntry {
  id: string;
  context: string; // "Toasts", "Chat messages"
  politeness: LiveRegionPoliteness;
  atomic: boolean;
  notes: string;
}

export interface AriaPatternEntry {
  id: string;
  widget: AriaWidgetPattern;
  usage: string; // "Sélection type projet (combobox)"
  keyboardInteractions: string; // "ArrowDown/Up, Home, End, Enter"
  notes: string;
}

export interface AssistiveTechEntry {
  id: string;
  at: AssistiveTech;
  browser: Browser;
  version: string; // "NVDA 2024.4", "Chrome 130"
  status: CheckStatus;
  tested: boolean;
  notes: string; // observations, bugs trouvés
}

export interface CognitiveCheckEntry {
  id: string;
  axis: CognitiveAxis;
  rule: string;
  status: CheckStatus;
  note: string;
}

export interface MotionPreferenceEntry {
  id: string;
  axis: MotionAxis;
  respected: boolean; // media query / setting respecté
  implementation: string; // "@media (prefers-reduced-motion)"
  notes: string;
}

export interface RemediationEntry {
  id: string;
  title: string;
  reference: string; // "WCAG 2.4.7", "AT: NVDA + Chrome"
  severity: Severity;
  bucket: RemediationBucket;
  owner: string;
  effort: string; // "S", "M", "L", "XL" ou estimation perso
  status: "todo" | "doing" | "done";
  notes: string;
}

export interface A11yIssueEntry {
  id: string;
  wcagRef: string; // "2.4.7"
  description: string;
  severity: Severity;
  component: string; // "Button primary", "Modal"
  status: "open" | "in-progress" | "fixed" | "wontfix";
  owner: string;
  foundAt: string; // ISO date
  fixNotes: string;
}

export interface A11yState {
  version: 1;

  // MUST
  wcagChecks: WcagCheckEntry[];
  keyboardFlows: KeyboardFlowEntry[];
  landmarks: LandmarkEntry[];
  liveRegions: LiveRegionEntry[];
  ariaPatterns: AriaPatternEntry[];
  issues: A11yIssueEntry[];

  // SHOULD
  assistiveTech: AssistiveTechEntry[];
  cognitiveChecks: CognitiveCheckEntry[];
  motionPreferences: MotionPreferenceEntry[];

  // NICE
  remediation: RemediationEntry[];

  // Meta
  modeUsed: A11yMode;
  updatedAt: string;
}

export const A11Y_SECTION_KEY = "a11y";

export const DEFAULT_A11Y_STATE: A11yState = {
  version: 1,
  wcagChecks: [],
  keyboardFlows: [],
  landmarks: [],
  liveRegions: [],
  ariaPatterns: [],
  issues: [],
  assistiveTech: [],
  cognitiveChecks: [],
  motionPreferences: [],
  remediation: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeA11yState(
  partial: Partial<A11yState> | null | undefined
): A11yState {
  if (!partial) return DEFAULT_A11Y_STATE;
  return {
    ...DEFAULT_A11Y_STATE,
    ...partial,
    wcagChecks: partial.wcagChecks ?? [],
    keyboardFlows: partial.keyboardFlows ?? [],
    landmarks: partial.landmarks ?? [],
    liveRegions: partial.liveRegions ?? [],
    ariaPatterns: partial.ariaPatterns ?? [],
    issues: partial.issues ?? [],
    assistiveTech: partial.assistiveTech ?? [],
    cognitiveChecks: partial.cognitiveChecks ?? [],
    motionPreferences: partial.motionPreferences ?? [],
    remediation: partial.remediation ?? [],
  };
}

export function parseA11yState(content: string | undefined | null): A11yState {
  if (!content) return DEFAULT_A11Y_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeA11yState(raw);
  } catch {
    return DEFAULT_A11Y_STATE;
  }
}

export function computeA11yCompleteness(state: A11yState): number {
  let score = 0;
  const passedA = state.wcagChecks.filter(
    (c) => c.level === "A" && c.status === "pass"
  ).length;
  const passedAA = state.wcagChecks.filter(
    (c) => c.level === "AA" && c.status === "pass"
  ).length;
  // MUST — 50%
  if (passedA >= 10) score += 13;
  else if (passedA >= 5) score += 7;
  if (passedAA >= 5) score += 12;
  else if (passedAA >= 2) score += 6;
  if (state.keyboardFlows.length >= 2) score += 8;
  if (state.landmarks.length >= 3) score += 9;
  if (state.ariaPatterns.length >= 2) score += 8;
  // SHOULD — 35%
  const testedAT = state.assistiveTech.filter((a) => a.tested).length;
  if (testedAT >= 3) score += 13;
  else if (testedAT >= 1) score += 7;
  const passedCog = state.cognitiveChecks.filter((c) => c.status === "pass").length;
  if (passedCog >= 4) score += 11;
  else if (passedCog >= 2) score += 5;
  const respectedMotion = state.motionPreferences.filter((m) => m.respected).length;
  if (respectedMotion >= 3) score += 11;
  else if (respectedMotion >= 1) score += 5;
  // NICE — 15%
  const donePrc =
    state.remediation.length > 0
      ? state.remediation.filter((r) => r.status === "done").length /
        state.remediation.length
      : 0;
  if (state.remediation.length >= 3) {
    score += Math.round(15 * donePrc);
  }
  return Math.min(100, score);
}

export const WCAG_PRINCIPLE_META: Record<
  WcagPrinciple,
  { label: string; emoji: string; hint: string }
> = {
  perceivable: {
    label: "Perceptible",
    emoji: "👁️",
    hint: "Info perceptible par tous les sens (vue, ouïe, toucher)",
  },
  operable: {
    label: "Utilisable",
    emoji: "⌨️",
    hint: "Interface opérable au clavier, pas de piège",
  },
  understandable: {
    label: "Compréhensible",
    emoji: "🧠",
    hint: "Texte lisible, interface prévisible, aide à l'erreur",
  },
  robust: {
    label: "Robuste",
    emoji: "🤖",
    hint: "Compatible assistive tech (screen readers, etc.)",
  },
};

export const CHECK_STATUS_META: Record<
  CheckStatus,
  { label: string; emoji: string; color: string }
> = {
  pass: {
    label: "Conforme",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  fail: {
    label: "Non conforme",
    emoji: "❌",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  partial: {
    label: "Partiel",
    emoji: "◐",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  unknown: {
    label: "À vérifier",
    emoji: "◦",
    color: "bg-card border-border text-muted",
  },
  "not-applicable": {
    label: "Non applicable",
    emoji: "—",
    color: "bg-card border-border text-muted italic",
  },
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; emoji: string; color: string }
> = {
  critical: {
    label: "Critique",
    emoji: "🔴",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  serious: {
    label: "Sérieux",
    emoji: "🟠",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
  },
  moderate: {
    label: "Modéré",
    emoji: "🟡",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  minor: {
    label: "Mineur",
    emoji: "🔵",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  },
};

export const LANDMARK_META: Record<
  AriaLandmark,
  { label: string; tag: string; hint: string }
> = {
  banner: {
    label: "Banner",
    tag: "<header>",
    hint: "En-tête principal de la page (logo, nav globale)",
  },
  navigation: {
    label: "Navigation",
    tag: "<nav>",
    hint: "Liens de navigation · peut y avoir plusieurs (différencier via aria-label)",
  },
  main: {
    label: "Main",
    tag: "<main>",
    hint: "Contenu principal · 1 seul par page · skip link cible",
  },
  complementary: {
    label: "Complementary",
    tag: "<aside>",
    hint: "Sidebar, contenu secondaire lié au principal",
  },
  contentinfo: {
    label: "Contentinfo",
    tag: "<footer>",
    hint: "Footer · copyright, liens légaux",
  },
  search: {
    label: "Search",
    tag: 'role="search"',
    hint: "Zone de recherche · autour du champ search",
  },
  form: {
    label: "Form",
    tag: "<form>",
    hint: "Formulaire · uniquement si labeled (aria-label)",
  },
  region: {
    label: "Region",
    tag: 'role="region"',
    hint: "Zone personnalisée importante · requiert aria-label",
  },
};

export const POLITENESS_META: Record<
  LiveRegionPoliteness,
  { label: string; hint: string }
> = {
  off: { label: "Off (aria-live=off)", hint: "Pas d'annonce" },
  polite: {
    label: "Polite (aria-live=polite)",
    hint: "Annonce quand l'user est idle · toasts success, sauvegarde auto",
  },
  assertive: {
    label: "Assertive (aria-live=assertive)",
    hint: "Interrompt immédiatement · erreurs critiques, alertes",
  },
};

export const AT_META: Record<
  AssistiveTech,
  { label: string; platform: string; usage: string }
> = {
  nvda: {
    label: "NVDA",
    platform: "Windows",
    usage: "65% · gratuit · dominant sur Windows",
  },
  jaws: {
    label: "JAWS",
    platform: "Windows",
    usage: "25% · payant · entreprise",
  },
  "voiceover-macos": {
    label: "VoiceOver (macOS)",
    platform: "macOS",
    usage: "intégré · Cmd+F5",
  },
  "voiceover-ios": {
    label: "VoiceOver (iOS)",
    platform: "iOS",
    usage: "intégré · Settings > Accessibility",
  },
  talkback: {
    label: "TalkBack",
    platform: "Android",
    usage: "intégré · Settings > Accessibility",
  },
  narrator: {
    label: "Narrator",
    platform: "Windows",
    usage: "intégré · Win+Ctrl+Enter · usage limité",
  },
  orca: {
    label: "Orca",
    platform: "Linux",
    usage: "intégré GNOME · niche",
  },
  dragon: {
    label: "Dragon",
    platform: "Windows/macOS",
    usage: "voice control · commandes vocales",
  },
};

export const BROWSER_META: Record<Browser, { label: string; emoji: string }> = {
  chrome: { label: "Chrome", emoji: "🟢" },
  firefox: { label: "Firefox", emoji: "🟠" },
  safari: { label: "Safari", emoji: "🔵" },
  edge: { label: "Edge", emoji: "🟦" },
};

export const COGNITIVE_AXIS_META: Record<
  CognitiveAxis,
  { label: string; emoji: string; hint: string }
> = {
  "memory-load": {
    label: "Mémoire",
    emoji: "🧠",
    hint: "Ne pas demander de mémoriser · session recovery · autocomplete",
  },
  "plain-language": {
    label: "Langage simple",
    emoji: "📖",
    hint: "Phrases < 20 mots · verbes actifs · acronymes définis",
  },
  "time-limits": {
    label: "Délais",
    emoji: "⏱️",
    hint: "Warning avant timeout · possibilité d'étendre · pause",
  },
  "error-prevention": {
    label: "Prévention d'erreurs",
    emoji: "🛡️",
    hint: "Confirmation irréversible · undo · validation live",
  },
  attention: {
    label: "Attention",
    emoji: "🎯",
    hint: "Un seul objectif par écran · distractions minimales",
  },
  consistency: {
    label: "Cohérence",
    emoji: "🔁",
    hint: "Même nav, même labels, même patterns partout",
  },
  "help-access": {
    label: "Aide accessible",
    emoji: "🆘",
    hint: "Help contextuel · contact support facile · FAQ",
  },
};

export const REMEDIATION_BUCKET_META: Record<
  RemediationBucket,
  { label: string; emoji: string; window: string; color: string }
> = {
  now: {
    label: "À faire maintenant",
    emoji: "🔥",
    window: "< 48h · bloquants",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  week: {
    label: "Cette semaine",
    emoji: "📅",
    window: "< 7 jours · critiques",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
  },
  month: {
    label: "Ce mois",
    emoji: "🗓️",
    window: "< 30 jours · sérieux",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  quarter: {
    label: "Prochain trimestre",
    emoji: "📆",
    window: "< 90 jours · amélioration",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  },
  wontfix: {
    label: "Won't fix",
    emoji: "🗑️",
    window: "acceptés / wontfix",
    color: "bg-muted/10 border-border text-muted",
  },
};

export const MOTION_AXIS_META: Record<
  MotionAxis,
  { label: string; emoji: string; hint: string; css: string }
> = {
  "reduced-motion": {
    label: "Reduced motion",
    emoji: "🎬",
    hint: "Désactiver/raccourcir animations si user préfère",
    css: "@media (prefers-reduced-motion: reduce)",
  },
  "reduced-transparency": {
    label: "Reduced transparency",
    emoji: "🪟",
    hint: "Remplacer blur/transparency par fonds opaques",
    css: "@media (prefers-reduced-transparency: reduce)",
  },
  "increased-contrast": {
    label: "Increased contrast",
    emoji: "🔳",
    hint: "Augmenter contraste bordures/texte si user préfère",
    css: "@media (prefers-contrast: more)",
  },
  "flash-safety": {
    label: "Flash safety",
    emoji: "⚡",
    hint: "WCAG 2.3.1 : pas de flash > 3 fois/s (épilepsie photosensible)",
    css: "—",
  },
  autoplay: {
    label: "No autoplay",
    emoji: "🔇",
    hint: "Vidéo/audio ne démarrent pas auto · son muted par défaut",
    css: "<video muted>",
  },
  "animation-pause": {
    label: "Pause animations",
    emoji: "⏸️",
    hint: "WCAG 2.2.2 : bouton pause sur anim > 5s",
    css: "—",
  },
};

export const ARIA_WIDGET_META: Record<
  AriaWidgetPattern,
  { label: string; keys: string }
> = {
  alert: { label: "Alert", keys: "—" },
  alertdialog: { label: "Alert Dialog", keys: "Esc (close), Tab (trap)" },
  breadcrumb: { label: "Breadcrumb", keys: "Tab" },
  button: { label: "Button", keys: "Space, Enter" },
  checkbox: { label: "Checkbox", keys: "Space" },
  combobox: { label: "Combobox", keys: "ArrowDown/Up, Home, End, Enter, Esc" },
  dialog: { label: "Dialog (modal)", keys: "Esc (close), Tab (trap focus)" },
  disclosure: { label: "Disclosure", keys: "Space, Enter" },
  feed: { label: "Feed", keys: "PageUp/Down, Ctrl+Home/End" },
  grid: { label: "Grid", keys: "Arrow keys, Tab" },
  listbox: { label: "Listbox", keys: "ArrowDown/Up, Home, End, Type-ahead" },
  menu: { label: "Menu", keys: "ArrowDown/Up, Esc, Type-ahead" },
  menubar: { label: "Menu Bar", keys: "ArrowLeft/Right, Enter" },
  menuitem: { label: "Menu Item", keys: "Space, Enter" },
  "radio-group": { label: "Radio Group", keys: "ArrowDown/Up/Left/Right" },
  slider: { label: "Slider", keys: "Arrow keys, Home, End, PageUp/Down" },
  tabs: { label: "Tabs", keys: "ArrowLeft/Right, Home, End" },
  toolbar: { label: "Toolbar", keys: "ArrowLeft/Right, Home, End" },
  tooltip: { label: "Tooltip", keys: "Esc (hide)" },
  tree: { label: "Tree", keys: "Arrow keys, Type-ahead" },
  treegrid: { label: "Tree Grid", keys: "Arrow keys" },
};
