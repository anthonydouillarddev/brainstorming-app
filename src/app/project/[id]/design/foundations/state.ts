export type TechLevel = "débutant" | "intermédiaire" | "expert";
export type FoundationsMode = "beginner" | "intermediate" | "expert";

export interface FoundationsPersona {
  id: string;
  name: string;
  avatarEmoji: string;
  ageRange: string;
  context: string;
  goals: string[];
  frustrations: string[];
  techLevel: TechLevel;
}

export interface FoundationsPrinciple {
  id: string;
  principle: string; // format "A > B"
  rationale: string;
}

export interface FoundationsJobStory {
  id: string;
  when: string;
  iWant: string;
  soICan: string;
}

export interface ConcurrentMapperCompetitor {
  id: string;
  name: string;
  x: number; // 0-100
  y: number; // 0-100
  isMe?: boolean;
}

export interface ConcurrentMapper {
  xAxisLow: string;
  xAxisHigh: string;
  yAxisLow: string;
  yAxisHigh: string;
  competitors: ConcurrentMapperCompetitor[];
}

export interface FoundationsState {
  version: 1;

  // JTBD — MUST
  jtbdCore: string;
  jtbdEmotional: string[];
  jtbdSocial: string[];

  // Job stories — SHOULD (V2)
  jobStories: FoundationsJobStory[];

  // Personas — MUST V1 (1 persona), V2 (2-3)
  personas: FoundationsPersona[];
  primaryPersonaId: string | null;

  // Positioning Dunford — SHOULD V2
  positioningAlternatives: string[];
  positioningUniqueAttributes: string[];
  positioningValue: string[];
  positioningSegment: string;
  positioningCategory: string;
  positioningStatement: string;

  // Aha moment — MUST
  ahaMomentEvent: string;
  ahaMomentThreshold: string;

  // Principes design — MUST
  designPrinciples: FoundationsPrinciple[];

  // Anti-goals — SHOULD V2
  antiGoals: string[];

  // Concurrent Mapper — NICE V3
  concurrentMapper: ConcurrentMapper;

  // Meta
  modeUsed: FoundationsMode;
  updatedAt: string;
}

export const FOUNDATIONS_SECTION_KEY = "foundations";

export const DEFAULT_FOUNDATIONS_STATE: FoundationsState = {
  version: 1,
  jtbdCore: "",
  jtbdEmotional: [],
  jtbdSocial: [],
  jobStories: [],
  personas: [],
  primaryPersonaId: null,
  positioningAlternatives: [],
  positioningUniqueAttributes: [],
  positioningValue: [],
  positioningSegment: "",
  positioningCategory: "",
  positioningStatement: "",
  ahaMomentEvent: "",
  ahaMomentThreshold: "",
  designPrinciples: [],
  antiGoals: [],
  concurrentMapper: {
    xAxisLow: "",
    xAxisHigh: "",
    yAxisLow: "",
    yAxisHigh: "",
    competitors: [],
  },
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeCompetitorId(): string {
  return `cpt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makePersonaId(): string {
  return `persona-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makePrincipleId(): string {
  return `principle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makeJobStoryId(): string {
  return `jobstory-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Merge safe — complète les champs manquants pour compat évolutions schéma
export function mergeFoundationsState(
  partial: Partial<FoundationsState> | null | undefined
): FoundationsState {
  if (!partial) return DEFAULT_FOUNDATIONS_STATE;
  return {
    ...DEFAULT_FOUNDATIONS_STATE,
    ...partial,
    jtbdEmotional: partial.jtbdEmotional ?? [],
    jtbdSocial: partial.jtbdSocial ?? [],
    jobStories: partial.jobStories ?? [],
    personas: partial.personas ?? [],
    positioningAlternatives: partial.positioningAlternatives ?? [],
    positioningUniqueAttributes: partial.positioningUniqueAttributes ?? [],
    positioningValue: partial.positioningValue ?? [],
    designPrinciples: partial.designPrinciples ?? [],
    antiGoals: partial.antiGoals ?? [],
    concurrentMapper: partial.concurrentMapper
      ? {
          xAxisLow: partial.concurrentMapper.xAxisLow ?? "",
          xAxisHigh: partial.concurrentMapper.xAxisHigh ?? "",
          yAxisLow: partial.concurrentMapper.yAxisLow ?? "",
          yAxisHigh: partial.concurrentMapper.yAxisHigh ?? "",
          competitors: partial.concurrentMapper.competitors ?? [],
        }
      : DEFAULT_FOUNDATIONS_STATE.concurrentMapper,
  };
}

export function parseFoundationsState(content: string | undefined | null): FoundationsState {
  if (!content) return DEFAULT_FOUNDATIONS_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeFoundationsState(raw);
  } catch {
    return DEFAULT_FOUNDATIONS_STATE;
  }
}

// Score de complétude 0-100 basé sur les 4 MUST (V1)
// JTBD: 25, persona: 25, aha: 25, principes: 25
export function computeFoundationsCompleteness(state: FoundationsState): number {
  let score = 0;
  if (state.jtbdCore.trim().length >= 20) score += 25;
  const primary = state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];
  if (primary && primary.name.trim() && primary.context.trim() && primary.goals.length > 0) {
    score += 25;
  }
  if (state.ahaMomentEvent.trim() && state.ahaMomentThreshold.trim()) {
    score += 25;
  }
  if (state.designPrinciples.filter((p) => p.principle.includes(">")).length >= 3) {
    score += 25;
  }
  return score;
}
