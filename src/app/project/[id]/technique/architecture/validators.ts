import type { ArchitectureState } from "./state";

export type Severity = "error" | "warn" | "info";

export interface Issue {
  severity: Severity;
  blockId: string;
  message: string;
}

export function validateArchitecture(state: ArchitectureState): Issue[] {
  const issues: Issue[] = [];

  // Bloc 1 Pattern
  if (!state.pattern) {
    issues.push({
      severity: "error",
      blockId: "pattern",
      message: "Pattern architectural obligatoire — détermine coût, vélocité, ops.",
    });
  }
  if (state.pattern && state.patternRationale.trim().length < 20) {
    issues.push({
      severity: "warn",
      blockId: "pattern",
      message: "Rationale du pattern trop court — explique ton choix en 2-3 phrases.",
    });
  }
  if (state.pattern === "microservices") {
    issues.push({
      severity: "warn",
      blockId: "pattern",
      message:
        "Microservices = regret #1 des solopreneurs (Indie Hackers). Sûr ? Évite-les avant 500k€ ARR.",
    });
  }

  // Bloc 2 Couches
  if (!state.frontendLayer.trim() || !state.apiLayer.trim() || !state.dataLayer.trim()) {
    issues.push({
      severity: "warn",
      blockId: "layers",
      message: "Couches frontend/API/data non toutes définies. Les 3 sont la base.",
    });
  }

  // Bloc 3 Flux
  if (state.happyPath.trim().length < 20) {
    issues.push({
      severity: "warn",
      blockId: "dataflow",
      message: "Happy path non documenté — décris le parcours user → frontend → API → DB.",
    });
  }
  if (!state.concurrency) {
    issues.push({
      severity: "info",
      blockId: "dataflow",
      message: "Concurrency non définie — optimistic recommandé pour UX rapide.",
    });
  }

  // Bloc 4 Entities
  const validEntities = state.entities.filter((e) => e.name.trim().length > 0);
  if (validEntities.length === 0) {
    issues.push({
      severity: "warn",
      blockId: "entities",
      message: "Aucune entité définie — liste au moins 3 tables/ressources principales.",
    });
  } else if (validEntities.length < 3) {
    issues.push({
      severity: "info",
      blockId: "entities",
      message: `Seulement ${validEntities.length} entité(s). Un SaaS a généralement 5-10 entités.`,
    });
  }
  if (!state.pkStrategy) {
    issues.push({
      severity: "info",
      blockId: "entities",
      message: "PK strategy non définie — uuid recommandé (pas de leak d'ID).",
    });
  }

  // Bloc 5 Sécu
  if (!state.authMethod) {
    issues.push({
      severity: "error",
      blockId: "security",
      message: "Méthode d'auth obligatoire — ne pas coder sans ça.",
    });
  }
  if (!state.dataIsolation) {
    issues.push({
      severity: "warn",
      blockId: "security",
      message: "Data isolation non définie — RLS DB recommandé (Supabase default).",
    });
  }
  if (state.httpsEnforcement === "optional") {
    issues.push({
      severity: "error",
      blockId: "security",
      message: "HTTPS optionnel = faille sécu. Mets 'always'.",
    });
  }

  return issues;
}
