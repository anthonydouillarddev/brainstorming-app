import type { AiState } from "../state";

export function exportAiClaudeBrief(state: AiState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup IA & Automation ${projectName}`);
  l.push("Tu es expert LLM integration. Scaffold selon :");
  l.push("");
  if (state.provider) l.push(`- Provider : ${state.provider}`);
  if (state.primaryModel) l.push(`- Modèle : ${state.primaryModel}`);
  if (state.sdk) l.push(`- SDK : ${state.sdk}`);
  l.push(`- Prompt caching : ${state.promptCaching ? "oui" : "non"}`);
  const enabled = state.useCases.filter((u) => u.enabled).map((u) => u.label);
  if (enabled.length) l.push(`- Use cases : ${enabled.join(", ")}`);
  if (state.workflowTool) l.push(`- Workflow : ${state.workflowTool}`);
  if (state.monthlyBudgetUsd) l.push(`- Budget : $${state.monthlyBudgetUsd}/mo`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Setup SDK + env vars + 1 endpoint API exemple (streamText).");
  l.push("2. Prompt library starter (system prompts templates).");
  l.push("3. Table Supabase `llm_usage` tracking (déjà en Phase 0, vérifier).");
  l.push("4. Workflow n8n JSON exemple (signup onboarding avec Claude brief).");
  l.push("5. 3 pièges (pas de caching, pas de cost tracking, prompt injection).");
  return l.join("\n");
}
