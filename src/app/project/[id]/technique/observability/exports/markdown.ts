import type { ObservabilityState } from "../state";

export function exportObservabilityMarkdown(state: ObservabilityState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 📊 Observability & Qualité — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## Error tracking");
  if (state.errorTracker) l.push(`- Tracker : ${state.errorTracker}`);
  l.push(`- PII redaction : ${state.piiRedaction ? "✅" : "❌"}`);
  l.push("");
  l.push("## Uptime & logs");
  if (state.uptimeTool) l.push(`- Uptime : ${state.uptimeTool} (check every ${state.uptimeCheckIntervalMin || "—"}min)`);
  if (state.loggerLib) l.push(`- Logger : ${state.loggerLib}`);
  l.push("");
  l.push("## Tests");
  if (state.unitFramework) l.push(`- Unit : ${state.unitFramework}`);
  if (state.e2eFramework) l.push(`- E2E : ${state.e2eFramework}`);
  if (state.coverageTarget) l.push(`- Coverage cible : ${state.coverageTarget}%`);
  l.push(`- Mutation testing : ${state.mutationTesting ? "✅" : "❌"}`);
  l.push("");
  l.push("## Metrics & SLO");
  if (state.metricsTool) l.push(`- Metrics : ${state.metricsTool}`);
  l.push(`- Session replay : ${state.sessionReplay ? "✅" : "❌"}`);
  if (state.sloAvailability) l.push(`- SLO availability : ${state.sloAvailability}%`);
  if (state.sloLatencyP95Ms) l.push(`- SLO latency P95 : ${state.sloLatencyP95Ms}ms`);
  l.push(`- DORA tracking : ${state.doraTracking ? "✅" : "❌"}`);
  if (state.notes) l.push(`- Notes : ${state.notes}`);
  return l.join("\n");
}
