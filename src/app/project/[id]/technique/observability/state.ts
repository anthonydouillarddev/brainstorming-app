export type ObservabilityMode = "beginner" | "intermediate";

export type ErrorTracker = "sentry" | "posthog-errors" | "highlight" | "axiom" | "none" | "";
export type UptimeTool = "better-stack" | "checkly" | "uptime-robot" | "none" | "";
export type LoggerLib = "pino" | "winston" | "console" | "bunyan" | "";
export type TestFramework = "vitest" | "jest" | "playwright" | "cypress" | "none" | "";
export type MetricsTool = "posthog" | "mixpanel" | "amplitude" | "custom" | "none" | "";

export interface ObservabilityState {
  version: 1;
  // Bloc 1 — Error tracking
  errorTracker: ErrorTracker;
  piiRedaction: boolean;
  // Bloc 2 — Uptime & logs
  uptimeTool: UptimeTool;
  uptimeCheckIntervalMin: string;
  loggerLib: LoggerLib;
  // Bloc 3 — Tests
  unitFramework: TestFramework;
  e2eFramework: TestFramework;
  coverageTarget: string; // "60"
  mutationTesting: boolean;
  // Bloc 4 — Metrics & SLO
  metricsTool: MetricsTool;
  sessionReplay: boolean;
  sloAvailability: string; // "99.5"
  sloLatencyP95Ms: string; // "500"
  doraTracking: boolean;
  notes: string;
  modeUsed: ObservabilityMode;
  updatedAt: string;
}

export const OBSERVABILITY_SECTION_KEY = "tech-observability";

export const DEFAULT_OBSERVABILITY_STATE: ObservabilityState = {
  version: 1,
  errorTracker: "",
  piiRedaction: true,
  uptimeTool: "",
  uptimeCheckIntervalMin: "3",
  loggerLib: "",
  unitFramework: "",
  e2eFramework: "",
  coverageTarget: "",
  mutationTesting: false,
  metricsTool: "",
  sessionReplay: false,
  sloAvailability: "",
  sloLatencyP95Ms: "",
  doraTracking: false,
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeObservabilityState(partial: Partial<ObservabilityState> | null | undefined): ObservabilityState {
  if (!partial) return DEFAULT_OBSERVABILITY_STATE;
  return { ...DEFAULT_OBSERVABILITY_STATE, ...partial };
}

export function parseObservabilityState(content: string | undefined | null): ObservabilityState {
  if (!content) return DEFAULT_OBSERVABILITY_STATE;
  try { return mergeObservabilityState(JSON.parse(content)); } catch { return DEFAULT_OBSERVABILITY_STATE; }
}

export function computeObservabilityCompleteness(state: ObservabilityState): number {
  let score = 0;
  if (state.errorTracker && state.errorTracker !== "none") score += 20;
  if (state.piiRedaction) score += 5;
  if (state.uptimeTool && state.uptimeTool !== "none") score += 15;
  if (state.loggerLib) score += 10;
  if (state.unitFramework && state.unitFramework !== "none") score += 15;
  if (state.e2eFramework && state.e2eFramework !== "none") score += 10;
  if (state.metricsTool && state.metricsTool !== "none") score += 15;
  if (state.sloAvailability.trim()) score += 5;
  if (state.doraTracking) score += 5;
  return Math.min(100, Math.round(score));
}
