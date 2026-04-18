export type HostingMode = "beginner" | "intermediate";

export type HostingPlatform = "vercel" | "netlify" | "cloudflare-pages" | "railway" | "render" | "fly" | "aws-amplify" | "self-host-coolify" | "other" | "";
export type CiCdTool = "github-actions" | "vercel-ci" | "gitlab-ci" | "circleci" | "none" | "";
export type RollbackStrategy = "instant-vercel" | "git-revert" | "feature-flag" | "blue-green" | "manual" | "";

export interface HostingState {
  version: 1;
  // Bloc 1 — Plateforme
  platform: HostingPlatform;
  platformNotes: string;
  domainProvider: string;
  httpsAuto: boolean;
  hstsEnabled: boolean;

  // Bloc 2 — CI/CD
  ciCdTool: CiCdTool;
  runsLint: boolean;
  runsTypeCheck: boolean;
  runsTests: boolean;

  // Bloc 3 — Environnements
  hasDevEnv: boolean;
  hasPreviewEnv: boolean;
  hasStagingEnv: boolean;
  hasProdEnv: boolean;
  dbBranching: boolean;

  // Bloc 4 — Déploiement
  rollback: RollbackStrategy;
  featureFlags: boolean;
  featureFlagsProvider: string; // ex: "PostHog"
  progressiveDelivery: boolean;

  notes: string;
  modeUsed: HostingMode;
  updatedAt: string;
}

export const HOSTING_SECTION_KEY = "tech-hosting-devops";

export const DEFAULT_HOSTING_STATE: HostingState = {
  version: 1,
  platform: "",
  platformNotes: "",
  domainProvider: "",
  httpsAuto: true,
  hstsEnabled: false,
  ciCdTool: "",
  runsLint: true,
  runsTypeCheck: true,
  runsTests: false,
  hasDevEnv: true,
  hasPreviewEnv: false,
  hasStagingEnv: false,
  hasProdEnv: true,
  dbBranching: false,
  rollback: "",
  featureFlags: false,
  featureFlagsProvider: "",
  progressiveDelivery: false,
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeHostingState(partial: Partial<HostingState> | null | undefined): HostingState {
  if (!partial) return DEFAULT_HOSTING_STATE;
  return { ...DEFAULT_HOSTING_STATE, ...partial };
}

export function parseHostingState(content: string | undefined | null): HostingState {
  if (!content) return DEFAULT_HOSTING_STATE;
  try { return mergeHostingState(JSON.parse(content)); } catch { return DEFAULT_HOSTING_STATE; }
}

export function computeHostingCompleteness(state: HostingState): number {
  let score = 0;
  if (state.platform) score += 15;
  if (state.httpsAuto) score += 5;
  if (state.hstsEnabled) score += 5;
  if (state.ciCdTool) score += 15;
  if (state.runsLint && state.runsTypeCheck) score += 10;
  const envs = [state.hasDevEnv, state.hasPreviewEnv, state.hasStagingEnv, state.hasProdEnv].filter(Boolean).length;
  score += envs * 5;
  if (state.rollback) score += 15;
  if (state.featureFlags) score += 10;
  return Math.min(100, Math.round(score));
}
