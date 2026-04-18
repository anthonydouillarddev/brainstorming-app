import type { ToolingState } from "../state";

export function exportToolingJson(state: ToolingState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    os: state.os,
    annualBudgetUsd: state.annualBudgetUsd ? Number(state.annualBudgetUsd) : null,
    tools: state.selections.filter((s) => s.enabled).map((s) => ({
      category: s.categoryId,
      tool: s.selectedTool,
      notes: s.notes,
    })),
    notes: state.notes,
  }, null, 2);
}
