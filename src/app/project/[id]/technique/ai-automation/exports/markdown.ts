import type { AiState } from "../state";

export function exportAiMarkdown(state: AiState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 🤖 IA & Automation — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## LLM provider");
  if (state.provider) l.push(`- Provider : ${state.provider}`);
  if (state.primaryModel) l.push(`- Modèle : ${state.primaryModel}`);
  if (state.sdk) l.push(`- SDK : ${state.sdk}`);
  l.push(`- Prompt caching : ${state.promptCaching ? "✅" : "❌"}`);
  l.push(`- PII redaction : ${state.piiRedactionLlm ? "✅" : "❌"}`);
  if (state.monthlyBudgetUsd) l.push(`- Budget mensuel : $${state.monthlyBudgetUsd}`);
  l.push("");
  l.push("## Use cases IA");
  const enabled = state.useCases.filter((u) => u.enabled);
  if (enabled.length === 0) l.push("_Aucun use case activé._");
  else for (const u of enabled) l.push(`- ${u.label}`);
  l.push(`- Streaming UI : ${state.streamingUi ? "✅" : "❌"}`);
  if (state.evalsTool) l.push(`- Evals : ${state.evalsTool}`);
  l.push("");
  l.push("## Workflow automation");
  if (state.workflowTool) l.push(`- Tool : ${state.workflowTool}`);
  if (state.workflowNotes) l.push(`- Recipes : ${state.workflowNotes}`);
  if (state.notes) l.push(`- Notes : ${state.notes}`);
  return l.join("\n");
}
