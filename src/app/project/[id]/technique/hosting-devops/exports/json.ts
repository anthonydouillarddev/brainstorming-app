import type { HostingState } from "../state";

export function exportHostingJson(state: HostingState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    platform: { name: state.platform, domainProvider: state.domainProvider, httpsAuto: state.httpsAuto, hstsEnabled: state.hstsEnabled, notes: state.platformNotes },
    cicd: { tool: state.ciCdTool, lint: state.runsLint, typeCheck: state.runsTypeCheck, tests: state.runsTests },
    environments: { dev: state.hasDevEnv, preview: state.hasPreviewEnv, staging: state.hasStagingEnv, prod: state.hasProdEnv, dbBranching: state.dbBranching },
    deployment: { rollback: state.rollback, featureFlags: state.featureFlags, featureFlagsProvider: state.featureFlagsProvider, progressiveDelivery: state.progressiveDelivery, notes: state.notes },
  }, null, 2);
}
