import type { StrategyState } from "../state";

export function exportStrategyJson(state: StrategyState, projectName: string): string {
  const payload = {
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    constraints: {
      budget: state.budget,
      ttm: state.ttm,
      teamSize: state.teamSize,
      operationalBurden: state.operationalBurden,
      lockInTolerance: state.lockInTolerance,
    },
    objectives: {
      coreMetric: state.coreMetric,
      scaleHorizonUsers: state.scaleHorizonUsers,
      scaleHorizonMonths: state.scaleHorizonMonths,
      nonNegotiables: state.nonNegotiables,
      acceptableTradeoffs: state.acceptableTradeoffs,
    },
    drivers: state.drivers.filter((d) => d.reason.trim().length > 0),
    risks: state.risks,
    decision: {
      context: state.decisionContext,
      optionsEvaluated: state.optionsEvaluated,
      stack: {
        frontend: state.stackFrontend,
        backend: state.stackBackend,
        database: state.stackDatabase,
        auth: state.stackAuth,
        hosting: state.stackHosting,
        payments: state.stackPayments,
        email: state.stackEmail,
        ai: state.stackAi,
        monitoring: state.stackMonitoring,
      },
      rationale: state.keyRationale,
      alternativesDismissed: state.alternativesDismissed,
      linkedAdrId: state.linkedAdrId,
    },
  };
  return JSON.stringify(payload, null, 2);
}
