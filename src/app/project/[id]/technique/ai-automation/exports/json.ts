import type { AiState } from "../state";

export function exportAiJson(state: AiState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    llm: { provider: state.provider, model: state.primaryModel, sdk: state.sdk, promptCaching: state.promptCaching, piiRedaction: state.piiRedactionLlm, monthlyBudgetUsd: state.monthlyBudgetUsd ? Number(state.monthlyBudgetUsd) : null },
    useCases: state.useCases.filter((u) => u.enabled).map((u) => u.label),
    streamingUi: state.streamingUi,
    evalsTool: state.evalsTool,
    workflow: { tool: state.workflowTool, recipes: state.workflowNotes },
    notes: state.notes,
  }, null, 2);
}
