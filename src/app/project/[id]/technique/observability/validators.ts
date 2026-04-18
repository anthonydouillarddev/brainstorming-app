import type { ObservabilityState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateObservability(state: ObservabilityState): Issue[] {
  const issues: Issue[] = [];
  if (!state.errorTracker || state.errorTracker === "none") {
    issues.push({ severity: "warn", blockId: "errors", message: "Aucun error tracker — bugs en silence en prod." });
  }
  if (state.errorTracker && !state.piiRedaction) {
    issues.push({ severity: "error", blockId: "errors", message: "PII redaction désactivée — leak emails/tokens dans Sentry." });
  }
  if (!state.uptimeTool || state.uptimeTool === "none") {
    issues.push({ severity: "warn", blockId: "uptime", message: "Aucun monitoring uptime — crash à 3h = silence." });
  }
  if (!state.unitFramework || state.unitFramework === "none") {
    issues.push({ severity: "info", blockId: "tests", message: "Pas de tests unitaires — OK pour MVP solo, à ajouter progressivement." });
  }
  if (state.coverageTarget && Number(state.coverageTarget) > 95) {
    issues.push({ severity: "info", blockId: "tests", message: "100% coverage = obsession. 60-70% + mutation testing plus efficace." });
  }
  if (!state.metricsTool || state.metricsTool === "none") {
    issues.push({ severity: "info", blockId: "metrics", message: "Pas de metrics produit — DAU/MAU/retention non trackés." });
  }
  return issues;
}
