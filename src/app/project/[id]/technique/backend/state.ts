export type BackendMode = "beginner" | "intermediate";

export type BackendPattern = "baas" | "bff" | "api-only" | "serverless-functions" | "hybrid" | "";
export type Runtime = "node" | "bun" | "deno" | "python" | "go" | "rust" | "ruby" | "php" | "elixir" | "other" | "";
export type ApiStyle = "server-actions" | "trpc" | "rest" | "graphql" | "grpc" | "mixed" | "";
export type JobsSolution = "none" | "vercel-cron" | "inngest" | "trigger-dev" | "bullmq" | "sidekiq" | "temporal" | "";

export interface BackendState {
  version: 1;

  // Bloc 1 — Pattern
  pattern: BackendPattern;
  patternRationale: string;

  // Bloc 2 — Runtime
  runtime: Runtime;
  runtimeVersion: string;
  runtimeFramework: string;

  // Bloc 3 — API style
  apiStyle: ApiStyle;
  apiVersioning: string;
  useServerValidation: boolean;

  // Bloc 4 — Jobs
  jobs: JobsSolution;
  jobsNotes: string;

  modeUsed: BackendMode;
  updatedAt: string;
}

export const BACKEND_SECTION_KEY = "tech-backend";

export const DEFAULT_BACKEND_STATE: BackendState = {
  version: 1,
  pattern: "",
  patternRationale: "",
  runtime: "",
  runtimeVersion: "",
  runtimeFramework: "",
  apiStyle: "",
  apiVersioning: "",
  useServerValidation: true,
  jobs: "",
  jobsNotes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeBackendState(partial: Partial<BackendState> | null | undefined): BackendState {
  if (!partial) return DEFAULT_BACKEND_STATE;
  return { ...DEFAULT_BACKEND_STATE, ...partial };
}

export function parseBackendState(content: string | undefined | null): BackendState {
  if (!content) return DEFAULT_BACKEND_STATE;
  try {
    return mergeBackendState(JSON.parse(content));
  } catch {
    return DEFAULT_BACKEND_STATE;
  }
}

export function computeBackendCompleteness(state: BackendState): number {
  let score = 0;
  if (state.pattern) score += 15;
  if (state.patternRationale.trim().length >= 20) score += 10;
  if (state.runtime) score += 15;
  if (state.runtimeFramework.trim()) score += 10;
  if (state.apiStyle) score += 20;
  if (state.useServerValidation) score += 10;
  if (state.jobs) score += 20;
  return Math.min(100, Math.round(score));
}
