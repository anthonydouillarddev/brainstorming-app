import type { ObservabilityState } from "../state";

export function exportObservabilityClaudeBrief(state: ObservabilityState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup Observability ${projectName}`);
  l.push("Tu es expert SRE/DevOps. Setup observability selon :");
  l.push("");
  if (state.errorTracker) l.push(`- Error tracker : ${state.errorTracker}${state.piiRedaction ? " + PII redaction" : ""}`);
  if (state.uptimeTool) l.push(`- Uptime : ${state.uptimeTool}`);
  if (state.loggerLib) l.push(`- Logger : ${state.loggerLib}`);
  if (state.unitFramework) l.push(`- Unit tests : ${state.unitFramework}`);
  if (state.e2eFramework) l.push(`- E2E : ${state.e2eFramework}`);
  if (state.metricsTool) l.push(`- Metrics : ${state.metricsTool}`);
  if (state.sloAvailability) l.push(`- SLO : ${state.sloAvailability}% availability, ${state.sloLatencyP95Ms || "?"}ms P95`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Config Sentry/PostHog starter avec init + PII redaction.");
  l.push("2. Endpoint /health + monitoring Better Stack.");
  l.push("3. Config Pino logger + middleware de log requêtes.");
  l.push("4. 3 tests Vitest critical path (auth, create, export).");
  l.push("5. 3 events PostHog prioritaires à tracker.");
  return l.join("\n");
}
