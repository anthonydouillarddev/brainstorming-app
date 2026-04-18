import type { StrategyState } from "./state";

export type Severity = "error" | "warn" | "info";

export interface Issue {
  severity: Severity;
  blockId: string;
  message: string;
}

export function validateStrategy(state: StrategyState): Issue[] {
  const issues: Issue[] = [];

  // Bloc 1 Contraintes
  if (state.budget === "") {
    issues.push({
      severity: "error",
      blockId: "constraints",
      message: "Budget mensuel obligatoire — définis au moins une fourchette approximative.",
    });
  }
  if (state.ttm === "") {
    issues.push({
      severity: "warn",
      blockId: "constraints",
      message: "Time-to-market non défini — risque de dérive du scope.",
    });
  }
  if (state.teamSize === "") {
    issues.push({
      severity: "warn",
      blockId: "constraints",
      message: "Taille équipe non définie — impacte la complexité acceptable.",
    });
  }

  // Bloc 2 Objectifs
  if (state.coreMetric.trim().length === 0) {
    issues.push({
      severity: "error",
      blockId: "objectives",
      message: "Core metric obligatoire — sans ça, pas moyen de savoir si tu as gagné.",
    });
  } else if (state.coreMetric.trim().length < 10) {
    issues.push({
      severity: "warn",
      blockId: "objectives",
      message: "Core metric trop court — soit plus précis (ex: ARR 50k, Rétention 40%).",
    });
  }

  if (state.scaleHorizonUsers === "") {
    issues.push({
      severity: "warn",
      blockId: "objectives",
      message: "Scale horizon non défini — 100 users vs 1M change tout.",
    });
  }

  // Bloc 3 Drivers
  const filledDrivers = state.drivers.filter((d) => d.reason.trim().length > 0);
  if (filledDrivers.length === 0) {
    issues.push({
      severity: "warn",
      blockId: "drivers",
      message: "Aucun driver de décision expliqué — remplis au moins 3 raisons.",
    });
  } else if (filledDrivers.length < 3) {
    issues.push({
      severity: "info",
      blockId: "drivers",
      message: `Seulement ${filledDrivers.length} driver(s) expliqué(s). Vise au moins 3 pour une décision robuste.`,
    });
  }

  // Bloc 4 Risques
  const validRisks = state.risks.filter(
    (r) => r.title.trim() && r.validationTest.trim()
  );
  if (validRisks.length === 0) {
    issues.push({
      severity: "warn",
      blockId: "risks",
      message: "Aucune hypothèse risquée documentée — chaque stack a ses risques cachés.",
    });
  }

  // Bloc 5 Décision
  const stackFields = [
    state.stackFrontend,
    state.stackBackend,
    state.stackDatabase,
    state.stackAuth,
    state.stackHosting,
  ].filter((s) => s.trim().length > 0);

  if (stackFields.length === 0) {
    issues.push({
      severity: "error",
      blockId: "decision",
      message: "Stack non renseignée — au moins 3 composants (frontend, backend, DB) requis.",
    });
  } else if (stackFields.length < 3) {
    issues.push({
      severity: "warn",
      blockId: "decision",
      message: `Stack partielle (${stackFields.length}/5 composants). Complète au moins frontend/backend/DB.`,
    });
  }

  if (state.keyRationale.trim().length < 20 && stackFields.length > 0) {
    issues.push({
      severity: "warn",
      blockId: "decision",
      message: "Rationale trop court — explique pourquoi ce choix en 2-3 phrases.",
    });
  }

  return issues;
}
