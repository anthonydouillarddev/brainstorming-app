import type { ObservabilityState } from "../state";

export function exportObservabilityJson(state: ObservabilityState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    errorTracking: { tool: state.errorTracker, piiRedaction: state.piiRedaction },
    uptime: { tool: state.uptimeTool, intervalMin: state.uptimeCheckIntervalMin ? Number(state.uptimeCheckIntervalMin) : null, logger: state.loggerLib },
    tests: { unit: state.unitFramework, e2e: state.e2eFramework, coverageTarget: state.coverageTarget ? Number(state.coverageTarget) : null, mutation: state.mutationTesting },
    metrics: { tool: state.metricsTool, sessionReplay: state.sessionReplay, sloAvailability: state.sloAvailability ? Number(state.sloAvailability) : null, sloLatencyP95Ms: state.sloLatencyP95Ms ? Number(state.sloLatencyP95Ms) : null, doraTracking: state.doraTracking, notes: state.notes },
  }, null, 2);
}
