import type { AiState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateAi(state: AiState): Issue[] {
  const issues: Issue[] = [];
  if (state.provider === "") {
    issues.push({ severity: "info", blockId: "provider", message: "Provider LLM non défini — OK si pas d'IA dans l'app." });
  }
  if (state.provider && state.provider !== "none" && !state.promptCaching) {
    issues.push({ severity: "warn", blockId: "provider", message: "Prompt caching désactivé — facture LLM peut exploser (90% savings possible)." });
  }
  if (state.provider && state.provider !== "none" && !state.monthlyBudgetUsd.trim()) {
    issues.push({ severity: "warn", blockId: "provider", message: "Budget mensuel LLM non défini — risque de bill spike sans alerte." });
  }
  if (state.sdk === "langchain") {
    issues.push({ severity: "info", blockId: "sdk", message: "LangChain = souvent over-engineered pour SaaS solo. Vercel AI SDK plus léger." });
  }
  if (state.provider && !state.piiRedactionLlm) {
    issues.push({ severity: "warn", blockId: "provider", message: "PII redaction off — user data envoyé aux LLM providers." });
  }
  return issues;
}
