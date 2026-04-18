// State du chapitre 1 Stratégie technique — tech-strategy
// 5 blocs V1 MUST : contraintes, objectifs, drivers, risques, décision ADR

export type StrategyMode = "beginner" | "intermediate";

export type BudgetTier = "free" | "lt50" | "lt200" | "lt1000" | "unlimited";
export type TtmTier = "critical" | "important" | "normal" | "flex";
export type TeamSize = "solo" | "2-3" | "4-10" | "10+";
export type OperationalBurden = "zero" | "minimal" | "acceptable" | "high";
export type LockInTolerance = "critical" | "acceptable" | "none";
export type ScaleUsers = "100" | "1k" | "10k" | "100k" | "1m" | "unknown";

export interface DriverRow {
  id: string;
  name: string; // DX, TTD, Maintenance, Cost, Community, Portability, Security, Hiring
  importance: number; // 1-5
  reason: string;
  impact: string;
}

export interface RiskRow {
  id: string;
  title: string;
  probability: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  validationTest: string;
  deadline: string; // ISO date
}

export interface StrategyState {
  version: 1;

  // Bloc 1 — Contraintes
  budget: BudgetTier | "";
  ttm: TtmTier | "";
  teamSize: TeamSize | "";
  operationalBurden: OperationalBurden | "";
  lockInTolerance: LockInTolerance | "";

  // Bloc 2 — Objectifs
  coreMetric: string;
  scaleHorizonUsers: ScaleUsers | "";
  scaleHorizonMonths: string;
  nonNegotiables: string;
  acceptableTradeoffs: string;

  // Bloc 3 — Drivers de décision
  drivers: DriverRow[];

  // Bloc 4 — Hypothèses risquées
  risks: RiskRow[];

  // Bloc 5 — Décision (ADR léger)
  decisionContext: string;
  optionsEvaluated: string;
  stackFrontend: string;
  stackBackend: string;
  stackDatabase: string;
  stackAuth: string;
  stackHosting: string;
  stackPayments: string;
  stackEmail: string;
  stackAi: string;
  stackMonitoring: string;
  keyRationale: string;
  alternativesDismissed: string;
  linkedAdrId: string | null; // FK optionnelle vers decisions.id

  // Meta
  modeUsed: StrategyMode;
  updatedAt: string;
}

export const STRATEGY_SECTION_KEY = "tech-strategy";

export const DEFAULT_DRIVERS: DriverRow[] = [
  { id: "drv-dx", name: "Developer eXperience (DX)", importance: 4, reason: "", impact: "" },
  { id: "drv-ttd", name: "Time to First Deployment", importance: 4, reason: "", impact: "" },
  { id: "drv-maintenance", name: "Maintenance burden", importance: 3, reason: "", impact: "" },
  { id: "drv-cost", name: "Cost scaling", importance: 3, reason: "", impact: "" },
  { id: "drv-community", name: "Community & docs", importance: 3, reason: "", impact: "" },
  { id: "drv-portability", name: "Portability (vendor lock-in)", importance: 2, reason: "", impact: "" },
  { id: "drv-security", name: "Security baseline", importance: 4, reason: "", impact: "" },
  { id: "drv-hiring", name: "Hiring pool", importance: 2, reason: "", impact: "" },
];

export const DEFAULT_STRATEGY_STATE: StrategyState = {
  version: 1,
  budget: "",
  ttm: "",
  teamSize: "",
  operationalBurden: "",
  lockInTolerance: "",
  coreMetric: "",
  scaleHorizonUsers: "",
  scaleHorizonMonths: "",
  nonNegotiables: "",
  acceptableTradeoffs: "",
  drivers: DEFAULT_DRIVERS,
  risks: [],
  decisionContext: "",
  optionsEvaluated: "",
  stackFrontend: "",
  stackBackend: "",
  stackDatabase: "",
  stackAuth: "",
  stackHosting: "",
  stackPayments: "",
  stackEmail: "",
  stackAi: "",
  stackMonitoring: "",
  keyRationale: "",
  alternativesDismissed: "",
  linkedAdrId: null,
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeRiskId(): string {
  return `risk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makeDriverId(): string {
  return `drv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// Merge safe — complète les champs manquants pour compat évolutions schéma
export function mergeStrategyState(
  partial: Partial<StrategyState> | null | undefined
): StrategyState {
  if (!partial) return DEFAULT_STRATEGY_STATE;
  return {
    ...DEFAULT_STRATEGY_STATE,
    ...partial,
    drivers: partial.drivers && partial.drivers.length > 0 ? partial.drivers : DEFAULT_DRIVERS,
    risks: partial.risks ?? [],
    linkedAdrId: partial.linkedAdrId ?? null,
  };
}

export function parseStrategyState(content: string | undefined | null): StrategyState {
  if (!content) return DEFAULT_STRATEGY_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeStrategyState(raw);
  } catch {
    return DEFAULT_STRATEGY_STATE;
  }
}

// Complétude 0-100 — 5 blocs × 20 points chacun.
// Bloc 1 Contraintes : 5 champs = 4 points chacun
// Bloc 2 Objectifs : core_metric + scale = 20
// Bloc 3 Drivers : au moins 3 drivers avec raison remplie = 20
// Bloc 4 Risques : au moins 1 risque documenté = 20
// Bloc 5 Décision : rationale + 3 choix stack minimum = 20
export function computeStrategyCompleteness(state: StrategyState): number {
  let score = 0;

  // Bloc 1 Contraintes (20 pts)
  const constraintFields = [
    state.budget,
    state.ttm,
    state.teamSize,
    state.operationalBurden,
    state.lockInTolerance,
  ];
  score += constraintFields.filter((f) => f !== "").length * 4;

  // Bloc 2 Objectifs (20 pts)
  if (state.coreMetric.trim().length >= 10) score += 12;
  if (state.scaleHorizonUsers !== "") score += 8;

  // Bloc 3 Drivers (20 pts) — au moins 3 drivers avec raison remplie
  const filledDrivers = state.drivers.filter((d) => d.reason.trim().length > 0).length;
  if (filledDrivers >= 3) score += 20;
  else score += filledDrivers * 6;

  // Bloc 4 Risques (20 pts) — au moins 1 risque avec validation test + deadline
  const validRisks = state.risks.filter(
    (r) => r.title.trim() && r.validationTest.trim()
  ).length;
  if (validRisks >= 2) score += 20;
  else score += validRisks * 10;

  // Bloc 5 Décision (20 pts)
  const stackFields = [
    state.stackFrontend,
    state.stackBackend,
    state.stackDatabase,
    state.stackAuth,
    state.stackHosting,
  ].filter((s) => s.trim().length > 0).length;
  if (stackFields >= 3 && state.keyRationale.trim().length >= 20) score += 20;
  else if (stackFields >= 3) score += 14;
  else if (stackFields >= 1) score += 8;

  return Math.min(100, Math.round(score));
}
