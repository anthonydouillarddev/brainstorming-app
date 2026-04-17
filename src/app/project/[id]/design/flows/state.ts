export type FlowsMode = "beginner" | "intermediate";

export type EmotionLevel = 1 | 2 | 3 | 4 | 5; // 1 = furieux, 5 = ravi

export type OnboardingPattern =
  | "self-service"
  | "guided-tour"
  | "empty-state-teaching"
  | "checklist"
  | "progressive-disclosure"
  | "sample-data";

export interface FlowStep {
  id: string;
  label: string;
  screen: string; // écran concerné (optionnel)
  action: string; // action du user
  isAhaMoment: boolean;
  isCritical: boolean;
  emotion?: EmotionLevel;
  fields?: number; // nombre de champs sur cette étape
  decisions?: number; // nombre de décisions forcées
  modals?: number;
}

export interface FlowBranch {
  id: string;
  fromStepId: string;
  condition: string;
  toStepId: string | null; // null = fin ou reco/empty
}

export interface JourneyPhase {
  id: string;
  name: string; // Discovery, Acquisition, Activation, Retention, Revenue
  emoji: string;
  actions: string;
  thoughts: string;
  emotion: EmotionLevel;
  touchpoints: string[];
  frictions: string[];
  opportunities: string[];
}

export interface NorthStarAction {
  verb: string;
  segment: string;
  timeframe: string;
  value: string;
}

export interface EmptyStateEntry {
  id: string;
  screen: string;
  copy: string;
  cta: string;
  illustration?: string;
}

export interface AarrrMetric {
  id: string;
  stage: "acquisition" | "activation" | "retention" | "revenue" | "referral";
  metric: string;
  target: string;
  current?: string;
}

export interface FlowsState {
  version: 1;

  // MUST
  steps: FlowStep[];
  ahaMomentStepId: string | null;
  onboardingPattern: OnboardingPattern | null;
  northStarAction: NorthStarAction;
  activationMetric: string; // phrase générée depuis NSA

  // SHOULD
  branches: FlowBranch[];
  journeyPhases: JourneyPhase[];
  emptyStates: EmptyStateEntry[];

  // NICE
  aarrrMetrics: AarrrMetric[];

  // Meta
  modeUsed: FlowsMode;
  updatedAt: string;
}

export const FLOWS_SECTION_KEY = "flows";

const DEFAULT_NSA: NorthStarAction = {
  verb: "",
  segment: "",
  timeframe: "",
  value: "",
};

const DEFAULT_AARRR_STAGES: AarrrMetric["stage"][] = [
  "acquisition",
  "activation",
  "retention",
  "revenue",
  "referral",
];

export const DEFAULT_FLOWS_STATE: FlowsState = {
  version: 1,
  steps: [],
  ahaMomentStepId: null,
  onboardingPattern: null,
  northStarAction: DEFAULT_NSA,
  activationMetric: "",
  branches: [],
  journeyPhases: [],
  emptyStates: [],
  aarrrMetrics: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeStepId(): string {
  return `step-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeBranchId(): string {
  return `br-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makePhaseId(): string {
  return `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeEmptyStateId(): string {
  return `es-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeAarrrId(): string {
  return `aarrr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeFlowsState(
  partial: Partial<FlowsState> | null | undefined
): FlowsState {
  if (!partial) return DEFAULT_FLOWS_STATE;
  return {
    ...DEFAULT_FLOWS_STATE,
    ...partial,
    steps: partial.steps ?? [],
    branches: partial.branches ?? [],
    journeyPhases: partial.journeyPhases ?? [],
    emptyStates: partial.emptyStates ?? [],
    aarrrMetrics: partial.aarrrMetrics ?? [],
    northStarAction: { ...DEFAULT_NSA, ...(partial.northStarAction ?? {}) },
  };
}

export function parseFlowsState(content: string | undefined | null): FlowsState {
  if (!content) return DEFAULT_FLOWS_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeFlowsState(raw);
  } catch {
    return DEFAULT_FLOWS_STATE;
  }
}

export function computeFlowsCompleteness(state: FlowsState): number {
  let score = 0;
  if (state.steps.length >= 3) score += 25;
  if (state.ahaMomentStepId) score += 25;
  if (state.onboardingPattern) score += 25;
  const nsa = state.northStarAction;
  if (nsa.verb.trim() && nsa.segment.trim() && nsa.timeframe.trim() && nsa.value.trim()) {
    score += 25;
  }
  return score;
}

export function computeActivationMetric(nsa: NorthStarAction): string {
  if (!nsa.verb.trim() || !nsa.segment.trim() || !nsa.timeframe.trim() || !nsa.value.trim()) {
    return "";
  }
  return `${nsa.verb.trim()} par ${nsa.segment.trim()} en ${nsa.timeframe.trim()} — ${nsa.value.trim()}`;
}

export function computeFrictionScore(state: FlowsState): {
  total: number;
  breakdown: { steps: number; fields: number; decisions: number; modals: number };
  level: "low" | "medium" | "high";
} {
  const steps = state.steps.length;
  let fields = 0;
  let decisions = 0;
  let modals = 0;
  for (const s of state.steps) {
    fields += s.fields ?? 0;
    decisions += s.decisions ?? 0;
    modals += s.modals ?? 0;
  }
  const total = steps + fields + decisions * 2 + modals * 2;
  const level: "low" | "medium" | "high" = total < 6 ? "low" : total < 10 ? "medium" : "high";
  return { total, breakdown: { steps, fields, decisions, modals }, level };
}

export { DEFAULT_AARRR_STAGES };
