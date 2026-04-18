// State du chapitre 2 Architecture & Blueprint — tech-architecture
// 5 blocs V1 MUST : pattern, couches, flux, entities, sécu boundaries

export type ArchitectureMode = "beginner" | "intermediate";

export type ArchPattern =
  | "modular-monolith"
  | "serverless"
  | "edge"
  | "microservices"
  | "hybrid"
  | "";

export type PkStrategy = "uuid" | "serial" | "nanoid" | "snowflake" | "";
export type Concurrency = "optimistic" | "pessimistic" | "event-sourced" | "none" | "";
export type AuthMethod = "jwt-session" | "oauth" | "magic-link" | "api-key" | "passkey" | "";
export type DataIsolation = "rls-db" | "app-code" | "both" | "";
export type SecretsMgmt = "env-vars" | "vercel-secrets" | "vault" | "secrets-manager" | "";
export type HttpsEnforcement = "always" | "production-only" | "optional" | "";

export interface Entity {
  id: string;
  name: string;
  description: string;
}

export interface Integration {
  id: string;
  label: string;
  url: string;
}

export interface ArchitectureState {
  version: 1;

  // Bloc 1 — Pattern architectural
  pattern: ArchPattern;
  patternRationale: string;
  whenRevisit: string;

  // Bloc 2 — Couches techniques
  frontendLayer: string;
  apiLayer: string;
  dataLayer: string;
  jobsLayer: string;
  cacheLayer: string;
  integrations: Integration[];

  // Bloc 3 — Flux de données
  happyPath: string;
  errorPath: string;
  concurrency: Concurrency;
  stateManagement: string;

  // Bloc 4 — Modèle de données
  entities: Entity[];
  pkStrategy: PkStrategy;
  softDelete: "yes" | "no" | "per-entity" | "";
  erDiagramUrl: string;

  // Bloc 5 — Sécurité & Auth boundaries
  authMethod: AuthMethod;
  dataIsolation: DataIsolation;
  secretsMgmt: SecretsMgmt;
  httpsEnforcement: HttpsEnforcement;

  // Meta
  modeUsed: ArchitectureMode;
  updatedAt: string;
}

export const ARCHITECTURE_SECTION_KEY = "tech-architecture";

export const DEFAULT_ARCHITECTURE_STATE: ArchitectureState = {
  version: 1,
  pattern: "",
  patternRationale: "",
  whenRevisit: "",
  frontendLayer: "",
  apiLayer: "",
  dataLayer: "",
  jobsLayer: "",
  cacheLayer: "",
  integrations: [],
  happyPath: "",
  errorPath: "",
  concurrency: "",
  stateManagement: "",
  entities: [],
  pkStrategy: "",
  softDelete: "",
  erDiagramUrl: "",
  authMethod: "",
  dataIsolation: "",
  secretsMgmt: "",
  httpsEnforcement: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeEntityId(): string {
  return `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function makeIntegrationId(): string {
  return `int-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeArchitectureState(
  partial: Partial<ArchitectureState> | null | undefined
): ArchitectureState {
  if (!partial) return DEFAULT_ARCHITECTURE_STATE;
  return {
    ...DEFAULT_ARCHITECTURE_STATE,
    ...partial,
    integrations: partial.integrations ?? [],
    entities: partial.entities ?? [],
  };
}

export function parseArchitectureState(
  content: string | undefined | null
): ArchitectureState {
  if (!content) return DEFAULT_ARCHITECTURE_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeArchitectureState(raw);
  } catch {
    return DEFAULT_ARCHITECTURE_STATE;
  }
}

// Complétude 0-100 — 5 blocs × 20pts
export function computeArchitectureCompleteness(state: ArchitectureState): number {
  let score = 0;

  // Bloc 1 Pattern (20pts)
  if (state.pattern !== "") score += 10;
  if (state.patternRationale.trim().length >= 20) score += 10;

  // Bloc 2 Couches (20pts) — 4/5 couches minimum
  const layerFields = [
    state.frontendLayer,
    state.apiLayer,
    state.dataLayer,
    state.jobsLayer,
    state.cacheLayer,
  ];
  const filledLayers = layerFields.filter((l) => l.trim().length > 0).length;
  score += filledLayers * 4;

  // Bloc 3 Flux (20pts)
  if (state.happyPath.trim().length >= 20) score += 10;
  if (state.concurrency !== "") score += 5;
  if (state.stateManagement.trim().length > 0) score += 5;

  // Bloc 4 Entities (20pts)
  if (state.entities.filter((e) => e.name.trim().length > 0).length >= 3) score += 12;
  else if (state.entities.filter((e) => e.name.trim().length > 0).length >= 1) score += 6;
  if (state.pkStrategy !== "") score += 4;
  if (state.softDelete !== "") score += 4;

  // Bloc 5 Sécu (20pts) — 4 champs
  const securityFields = [
    state.authMethod,
    state.dataIsolation,
    state.secretsMgmt,
    state.httpsEnforcement,
  ].filter((v) => v !== "").length;
  score += securityFields * 5;

  return Math.min(100, Math.round(score));
}
