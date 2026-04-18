export type PrinciplesMode = "beginner" | "intermediate";

export type HeuristicAnswer = "yes" | "no" | "unknown";

export interface NielsenEntry {
  heuristicSlug: string;
  answer: HeuristicAnswer;
  note: string;
}

export interface PinnedLaw {
  lawSlug: string;
  priority: "must" | "should" | "nice";
  rationale: string;
}

export interface AffordanceCheck {
  id: string;
  component: string;
  hover: boolean;
  focus: boolean;
  pressed: boolean;
  disabled: boolean;
  accessibleLabel: boolean;
}

export interface FeedbackItem {
  id: string;
  action: string;
  visual: boolean;
  haptic: boolean;
  audio: boolean;
  latencyMs: number;
}

export interface CognitiveLoadEntry {
  id: string;
  screen: string;
  intrinsic: 1 | 2 | 3 | 4 | 5;
  extraneous: 1 | 2 | 3 | 4 | 5;
  germane: 1 | 2 | 3 | 4 | 5;
  notes: string;
}

export interface MenuOption {
  id: string;
  menuName: string;
  items: string[];
}

export type PeakEndEmotion = -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5;

export interface PeakEndStep {
  id: string;
  name: string;
  emotion: PeakEndEmotion;
  isPeak: boolean;
  isEnd: boolean;
}

export interface MentalModel {
  designModel: string;
  systemImage: string;
  userModel: string;
  gulfs: string[];
}

export type ScreenAuditType =
  | "landing"
  | "auth"
  | "dashboard"
  | "form"
  | "list"
  | "detail"
  | "settings"
  | "empty"
  | "error";

export interface ScreenAuditEntry {
  id: string;
  screenType: ScreenAuditType;
  screenName: string;
  passed: string[]; // heuristic slugs passed
  failed: string[];
  notes: string;
}

export interface LatencyEntry {
  id: string;
  action: string;
  latencyMs: number;
  hasSkeleton: boolean;
}

export type ProjectRuleCategory =
  | "forms"
  | "buttons"
  | "navigation"
  | "feedback"
  | "density"
  | "a11y";

export interface ProjectRuleEntry {
  id: string;
  category: ProjectRuleCategory;
  doRule: string;
  dontRule: string;
  why: string;
  source: string;
  enabled: boolean;
}

export interface PrinciplesState {
  version: 1;

  // MUST
  nielsenAnswers: NielsenEntry[];
  pinnedLaws: PinnedLaw[];
  affordances: AffordanceCheck[];
  feedbackInventory: FeedbackItem[];
  designPrinciples: string[]; // 3-5 phrases finales générées/éditées

  // SHOULD
  cognitiveLoad: CognitiveLoadEntry[];
  menus: MenuOption[];
  peakEndSteps: PeakEndStep[];
  mentalModel: MentalModel;

  // NICE
  screenAudits: ScreenAuditEntry[];
  latencyLog: LatencyEntry[];

  // V4 — Règles UI/UX projet-specific
  projectRules: ProjectRuleEntry[];

  // Meta
  modeUsed: PrinciplesMode;
  updatedAt: string;
}

export const PRINCIPLES_SECTION_KEY = "principles";

const DEFAULT_MENTAL: MentalModel = {
  designModel: "",
  systemImage: "",
  userModel: "",
  gulfs: [],
};

export const DEFAULT_PRINCIPLES_STATE: PrinciplesState = {
  version: 1,
  nielsenAnswers: [],
  pinnedLaws: [],
  affordances: [],
  feedbackInventory: [],
  designPrinciples: [],
  cognitiveLoad: [],
  menus: [],
  peakEndSteps: [],
  mentalModel: DEFAULT_MENTAL,
  screenAudits: [],
  latencyLog: [],
  projectRules: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergePrinciplesState(
  partial: Partial<PrinciplesState> | null | undefined
): PrinciplesState {
  if (!partial) return DEFAULT_PRINCIPLES_STATE;
  return {
    ...DEFAULT_PRINCIPLES_STATE,
    ...partial,
    nielsenAnswers: partial.nielsenAnswers ?? [],
    pinnedLaws: partial.pinnedLaws ?? [],
    affordances: partial.affordances ?? [],
    feedbackInventory: partial.feedbackInventory ?? [],
    designPrinciples: partial.designPrinciples ?? [],
    cognitiveLoad: partial.cognitiveLoad ?? [],
    menus: partial.menus ?? [],
    peakEndSteps: partial.peakEndSteps ?? [],
    mentalModel: { ...DEFAULT_MENTAL, ...(partial.mentalModel ?? {}) },
    screenAudits: partial.screenAudits ?? [],
    latencyLog: partial.latencyLog ?? [],
    projectRules: partial.projectRules ?? [],
  };
}

export function parsePrinciplesState(
  content: string | undefined | null
): PrinciplesState {
  if (!content) return DEFAULT_PRINCIPLES_STATE;
  try {
    const raw = JSON.parse(content);
    return mergePrinciplesState(raw);
  } catch {
    return DEFAULT_PRINCIPLES_STATE;
  }
}

export function computePrinciplesCompleteness(state: PrinciplesState): number {
  let score = 0;
  if (state.nielsenAnswers.length >= 5) score += 25;
  if (state.pinnedLaws.length >= 3) score += 25;
  if (state.affordances.length >= 2 || state.feedbackInventory.length >= 2) score += 25;
  if (state.designPrinciples.length >= 3) score += 25;
  return score;
}

export function computeNielsenScore(state: PrinciplesState): {
  answered: number;
  passed: number;
  total: number;
} {
  const answered = state.nielsenAnswers.filter((a) => a.answer !== "unknown").length;
  const passed = state.nielsenAnswers.filter((a) => a.answer === "yes").length;
  return { answered, passed, total: 10 };
}

export const PROJECT_RULE_CATEGORY_META: Record<
  ProjectRuleCategory,
  { label: string; emoji: string; hint: string }
> = {
  forms: {
    label: "Formulaires",
    emoji: "🧮",
    hint: "Label, placeholder, helper, erreurs — champs scannables",
  },
  buttons: {
    label: "Boutons & Actions",
    emoji: "🔘",
    hint: "Verbes d'action · 44px tactile · hiérarchie primary/secondary",
  },
  navigation: {
    label: "Navigation",
    emoji: "🧭",
    hint: "Hick's Law · feedback position · breadcrumb",
  },
  feedback: {
    label: "Feedback & Erreurs",
    emoji: "💬",
    hint: "Confirmation immédiate · Peak-End · error recovery",
  },
  density: {
    label: "Densité & Whitespace",
    emoji: "📐",
    hint: "Espacement cohérent · line-height · Refactoring UI",
  },
  a11y: {
    label: "Accessibilité basique",
    emoji: "♿",
    hint: "Focus visible · contraste AA · alt texts",
  },
};

export const PROJECT_RULES_PRESETS: Omit<ProjectRuleEntry, "id">[] = [
  {
    category: "forms",
    doRule: "Label toujours visible au-dessus du champ, validation au blur + submit.",
    dontRule: "Label en placeholder qui disparaît à la frappe, validation uniquement au submit.",
    why: "A11y (label persistant lu par screen reader) + taux de complétion +25%.",
    source: "Baymard",
    enabled: true,
  },
  {
    category: "forms",
    doRule: "Message d'erreur proche du champ, en rouge, suggérant la correction.",
    dontRule: "Erreur générique en haut du form du genre « Formulaire invalide ».",
    why: "L'user trouve et corrige l'erreur 3× plus vite. WCAG 3.3.3 Error Suggestion.",
    source: "NN/G",
    enabled: true,
  },
  {
    category: "buttons",
    doRule: "Label verbe d'action + objet précis : « Créer mon projet », « Supprimer définitivement ».",
    dontRule: "« OK », « Valider », « Continuer », « Cliquez ici » — génériques sans contexte.",
    why: "Le bouton doit dire ce qui va se passer après le clic (Mailchimp).",
    source: "Mailchimp",
    enabled: true,
  },
  {
    category: "buttons",
    doRule: "Target tactile minimum 24×24 px (WCAG 2.5.8), idéalement 44×44 px (Apple HIG).",
    dontRule: "Liens inline sans zone cliquable étendue, icônes 16px sans padding.",
    why: "Précision doigt · évite les mis-taps · WCAG 2.2 bloquant à 24px.",
    source: "WCAG 2.5.8",
    enabled: true,
  },
  {
    category: "navigation",
    doRule: "Max 7 items dans la nav principale, onglet actif clairement distinct.",
    dontRule: "Menu déroulant complexe à plusieurs niveaux cachés derrière un hover.",
    why: "Hick's Law : temps de décision croît avec le nb d'options. 7±2 = limite mémoire court terme.",
    source: "Hick's Law",
    enabled: true,
  },
  {
    category: "feedback",
    doRule: "Toast/inline confirmation sous 1s après l'action (save, delete, publish).",
    dontRule: "Silence après le clic OU modal OK qui bloque le flow.",
    why: "Nielsen Heuristic #1 · Visibility of system status · rassure l'user.",
    source: "NN/G #1",
    enabled: true,
  },
  {
    category: "density",
    doRule: "Espacement ≥ 16px entre éléments, padding cartes ≥ 20px, line-height 1.5+.",
    dontRule: "Tout collé, padding 8px, line-height 1.2 (texte indigeste).",
    why: "Fatigue visuelle -40%, scannability +20% (Refactoring UI).",
    source: "Refactoring UI",
    enabled: true,
  },
  {
    category: "a11y",
    doRule: "Focus visible partout (ring 2px min), contraste texte ≥ 4.5:1.",
    dontRule: "outline: none · contraste gris clair sur blanc · icônes sans aria-label.",
    why: "WCAG 2.4.7 + 1.4.3 AA · obligatoire légal (EAA 28 juin 2025).",
    source: "WCAG 2.2 AA",
    enabled: true,
  },
];
