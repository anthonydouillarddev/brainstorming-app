// Chapitre 12 — Validation (tests users, SUS, heuristiques, PMF).
// Sources : NN/G (heuristiques Nielsen 10), John Brooke (SUS 1986),
// Sean Ellis (PMF 40% rule), Reichheld (NPS), Steve Krug (usability testing).

export type ValidationMode = "beginner" | "intermediate";

export type TestMethod = "moderated" | "unmoderated" | "guerilla" | "remote-async";

export type TestStatus = "planned" | "in-progress" | "completed" | "cancelled";

export type FindingSeverity = "critical" | "serious" | "moderate" | "minor";

export type HeuristicId =
  | "visibility-status"
  | "match-realworld"
  | "user-control"
  | "consistency-standards"
  | "error-prevention"
  | "recognition-recall"
  | "flexibility-efficiency"
  | "aesthetic-minimalist"
  | "error-recovery"
  | "help-documentation";

export type PmfMetricKind =
  | "sean-ellis"
  | "nps"
  | "activation-rate"
  | "retention-d30"
  | "retention-d7"
  | "wow-moment";

export type RoadmapBucket = "now" | "sprint" | "quarter" | "backlog" | "wontfix";

export type RoadmapStatus = "todo" | "doing" | "done";

export interface UserTestFinding {
  id: string;
  description: string;
  severity: FindingSeverity;
  frequency: number; // nb participants ayant rencontré
  fixed: boolean;
}

export interface UserTestSession {
  id: string;
  title: string; // "Test onboarding v1"
  method: TestMethod;
  goal: string; // "Valider la création du premier projet"
  participantCount: number;
  completionRate: number; // 0-100
  timeOnTaskSec: number; // médiane
  status: TestStatus;
  startedAt: string;
  findings: UserTestFinding[];
  notes: string;
}

export interface SusResponse {
  id: string;
  participantLabel: string; // "P1", "Marie", etc.
  answers: number[]; // tableau de 10 notes (1-5) · index 0-9
  notes: string;
}

export interface HeuristicEvalEntry {
  id: string;
  heuristic: HeuristicId;
  severity: FindingSeverity | "none";
  evidence: string; // où c'est cassé / bien respecté
  suggestion: string;
  resolved: boolean;
}

export interface PmfMetricEntry {
  id: string;
  kind: PmfMetricKind;
  value: number; // % ou score selon kind
  target: number; // target bench
  measuredAt: string; // ISO date
  sampleSize: number;
  notes: string;
}

export interface ValidationRoadmapItem {
  id: string;
  title: string;
  source: string; // "Finding X", "Heuristic Y", "Custom"
  severity: FindingSeverity;
  bucket: RoadmapBucket;
  effort: string; // "S" / "M" / "L" / "XL"
  owner: string;
  status: RoadmapStatus;
  notes: string;
}

export interface ValidationState {
  version: 1;

  // MUST
  userTests: UserTestSession[];
  susResponses: SusResponse[];
  heuristicEvals: HeuristicEvalEntry[];
  pmfMetrics: PmfMetricEntry[];

  // NICE
  roadmap: ValidationRoadmapItem[];

  // Meta
  modeUsed: ValidationMode;
  updatedAt: string;
}

export const VALIDATION_SECTION_KEY = "validation";

export const DEFAULT_VALIDATION_STATE: ValidationState = {
  version: 1,
  userTests: [],
  susResponses: [],
  heuristicEvals: [],
  pmfMetrics: [],
  roadmap: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeValidationState(
  partial: Partial<ValidationState> | null | undefined
): ValidationState {
  if (!partial) return DEFAULT_VALIDATION_STATE;
  return {
    ...DEFAULT_VALIDATION_STATE,
    ...partial,
    userTests: partial.userTests ?? [],
    susResponses: partial.susResponses ?? [],
    heuristicEvals: partial.heuristicEvals ?? [],
    pmfMetrics: partial.pmfMetrics ?? [],
    roadmap: partial.roadmap ?? [],
  };
}

export function parseValidationState(
  content: string | undefined | null
): ValidationState {
  if (!content) return DEFAULT_VALIDATION_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeValidationState(raw);
  } catch {
    return DEFAULT_VALIDATION_STATE;
  }
}

// SUS scoring : ajustement odd (impair, -1) / even (pair, 5-). Résultat *2.5.
export function computeSusScore(answers: number[]): number {
  if (answers.length !== 10) return 0;
  let total = 0;
  for (let i = 0; i < 10; i++) {
    const score = answers[i] || 0;
    if (score === 0) return 0;
    total += i % 2 === 0 ? score - 1 : 5 - score;
  }
  return total * 2.5;
}

export function averageSusScore(responses: SusResponse[]): number {
  if (responses.length === 0) return 0;
  const scores = responses
    .map((r) => computeSusScore(r.answers))
    .filter((s) => s > 0);
  if (scores.length === 0) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

// Bench SUS (Sauro 2011) : 68 = moyen, 72.6 = good, 80.3+ = excellent
export function susGrade(score: number): {
  grade: string;
  color: string;
  label: string;
} {
  if (score >= 85) return { grade: "A", color: "text-green-600", label: "Excellent" };
  if (score >= 72) return { grade: "B", color: "text-green-600", label: "Bon" };
  if (score >= 68) return { grade: "C", color: "text-amber-600", label: "Moyen (bench)" };
  if (score >= 51) return { grade: "D", color: "text-orange-600", label: "Faible" };
  return { grade: "F", color: "text-red-600", label: "À refaire" };
}

export function computeValidationCompleteness(state: ValidationState): number {
  let score = 0;
  // MUST — 85%
  if (state.userTests.filter((t) => t.status === "completed").length >= 1) score += 22;
  if (state.susResponses.length >= 5) score += 22;
  else if (state.susResponses.length >= 1) score += 10;
  if (state.heuristicEvals.length >= 5) score += 21;
  else if (state.heuristicEvals.length >= 3) score += 12;
  if (state.pmfMetrics.length >= 2) score += 20;
  else if (state.pmfMetrics.length >= 1) score += 10;
  // NICE — 15%
  if (state.roadmap.length >= 3) {
    const done = state.roadmap.filter((r) => r.status === "done").length;
    const ratio = state.roadmap.length > 0 ? done / state.roadmap.length : 0;
    score += Math.round(15 * ratio);
  }
  return Math.min(100, score);
}

export const TEST_METHOD_META: Record<
  TestMethod,
  { label: string; emoji: string; hint: string }
> = {
  moderated: {
    label: "Modéré",
    emoji: "🎙️",
    hint: "Session live avec modérateur · think aloud · 45-60min",
  },
  unmoderated: {
    label: "Non modéré",
    emoji: "🤖",
    hint: "Plateforme (Maze, Useberry) · scalable · moins de contexte",
  },
  guerilla: {
    label: "Guérilla",
    emoji: "☕",
    hint: "5 min dans un café · rapide et bon marché",
  },
  "remote-async": {
    label: "Async remote",
    emoji: "📹",
    hint: "Vidéo + questionnaire async · users dispersés",
  },
};

export const TEST_STATUS_META: Record<
  TestStatus,
  { label: string; emoji: string; color: string }
> = {
  planned: {
    label: "Planifié",
    emoji: "📅",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  },
  "in-progress": {
    label: "En cours",
    emoji: "🏃",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  completed: {
    label: "Terminé",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  cancelled: {
    label: "Annulé",
    emoji: "🗑️",
    color: "bg-muted/10 border-border text-muted",
  },
};

export const FINDING_SEVERITY_META: Record<
  FindingSeverity,
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

export const HEURISTIC_META: Record<
  HeuristicId,
  { label: string; emoji: string; hint: string }
> = {
  "visibility-status": {
    label: "1. Visibilité du statut",
    emoji: "👁️",
    hint: "Feedback immédiat · loading · save confirmé",
  },
  "match-realworld": {
    label: "2. Correspondance monde réel",
    emoji: "🌍",
    hint: "Vocabulaire user, pas jargon tech",
  },
  "user-control": {
    label: "3. Contrôle & liberté",
    emoji: "🕹️",
    hint: "Undo · cancel · exit visible",
  },
  "consistency-standards": {
    label: "4. Cohérence & standards",
    emoji: "🔁",
    hint: "Patterns familiers · conventions platform",
  },
  "error-prevention": {
    label: "5. Prévention des erreurs",
    emoji: "🛡️",
    hint: "Confirm destructif · validation live · defaults safe",
  },
  "recognition-recall": {
    label: "6. Reconnaissance > rappel",
    emoji: "🔍",
    hint: "Options visibles · pas mémoriser",
  },
  "flexibility-efficiency": {
    label: "7. Flexibilité & efficacité",
    emoji: "⚡",
    hint: "Shortcuts · accélérateurs · personnalisation",
  },
  "aesthetic-minimalist": {
    label: "8. Esthétique & minimalisme",
    emoji: "✨",
    hint: "Un seul objectif par écran · signal/bruit",
  },
  "error-recovery": {
    label: "9. Récupération d'erreur",
    emoji: "🔧",
    hint: "Message clair · cause · action",
  },
  "help-documentation": {
    label: "10. Aide & documentation",
    emoji: "🆘",
    hint: "Help contextuel · pas besoin de lire un manuel",
  },
};

export const ROADMAP_BUCKET_META: Record<
  RoadmapBucket,
  { label: string; emoji: string; window: string; color: string }
> = {
  now: {
    label: "Now",
    emoji: "🔥",
    window: "< 48h · bloquants",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  sprint: {
    label: "Sprint",
    emoji: "🏃",
    window: "< 2 semaines · critiques",
    color: "bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300",
  },
  quarter: {
    label: "Trimestre",
    emoji: "📆",
    window: "< 90 jours · amélioration",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  backlog: {
    label: "Backlog",
    emoji: "📋",
    window: "à planifier",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
  },
  wontfix: {
    label: "Won't fix",
    emoji: "🗑️",
    window: "acceptés",
    color: "bg-muted/10 border-border text-muted",
  },
};

export const PMF_METRIC_META: Record<
  PmfMetricKind,
  { label: string; emoji: string; unit: string; target: number; hint: string }
> = {
  "sean-ellis": {
    label: "Sean Ellis test",
    emoji: "💔",
    unit: "%",
    target: 40,
    hint: "% users « très déçus » si le produit disparaissait · cible ≥ 40%",
  },
  nps: {
    label: "NPS",
    emoji: "📊",
    unit: "",
    target: 30,
    hint: "Net Promoter Score · (Promoteurs − Détracteurs) × 100 · SaaS cible 30+",
  },
  "activation-rate": {
    label: "Activation rate",
    emoji: "🚀",
    unit: "%",
    target: 40,
    hint: "% users atteignant l'aha moment · cible ≥ 40%",
  },
  "retention-d30": {
    label: "Rétention J30",
    emoji: "🧲",
    unit: "%",
    target: 30,
    hint: "% users actifs à J30 · SaaS B2B cible 30%+, B2C 10%+",
  },
  "retention-d7": {
    label: "Rétention J7",
    emoji: "🎯",
    unit: "%",
    target: 50,
    hint: "% users actifs à J7 · indicateur précoce",
  },
  "wow-moment": {
    label: "Wow moment time",
    emoji: "✨",
    unit: "min",
    target: 10,
    hint: "Temps médian jusqu'à l'aha moment · cible < 10 min",
  },
};
