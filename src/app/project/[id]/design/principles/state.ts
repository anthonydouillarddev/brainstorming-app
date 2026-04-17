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
