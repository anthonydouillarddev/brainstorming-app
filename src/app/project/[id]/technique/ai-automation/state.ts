export type AiMode = "beginner" | "intermediate";

export type LlmProvider = "anthropic" | "openai" | "mistral" | "gemini" | "openrouter" | "none" | "";
export type LlmModel = string; // libre : "claude-sonnet-4-6", "gpt-5", ...
export type AiSdk = "vercel-ai-sdk" | "langchain" | "mastra" | "direct-sdk" | "none" | "";
export type WorkflowTool = "n8n" | "zapier" | "make" | "pipedream" | "activepieces" | "none" | "";

export interface AiUseCase {
  id: string;
  label: string;
  enabled: boolean;
}

export const DEFAULT_USE_CASES: AiUseCase[] = [
  { id: "brainstorm-coach", label: "Brainstorm Coach (chat guidé)", enabled: false },
  { id: "microcopy-gen", label: "Microcopy Generator (CTAs, labels)", enabled: false },
  { id: "summary", label: "Résumé automatique (cockpit)", enabled: false },
  { id: "risk-analyzer", label: "Risk Analyzer (détecte risques cachés)", enabled: false },
  { id: "vibe-extractor", label: "Vibe Extractor (screenshot → design tokens)", enabled: false },
  { id: "rag", label: "RAG (Retrieval Augmented Gen)", enabled: false },
  { id: "agent-tool-use", label: "Agents + tool use (function calling)", enabled: false },
];

export interface AiState {
  version: 1;
  provider: LlmProvider;
  primaryModel: LlmModel;
  sdk: AiSdk;
  promptCaching: boolean;
  useCases: AiUseCase[];
  streamingUi: boolean;
  evalsTool: string; // libre
  workflowTool: WorkflowTool;
  workflowNotes: string;
  monthlyBudgetUsd: string;
  piiRedactionLlm: boolean;
  notes: string;
  modeUsed: AiMode;
  updatedAt: string;
}

export const AI_SECTION_KEY = "tech-ai-automation";

export const DEFAULT_AI_STATE: AiState = {
  version: 1,
  provider: "",
  primaryModel: "",
  sdk: "",
  promptCaching: true,
  useCases: DEFAULT_USE_CASES,
  streamingUi: true,
  evalsTool: "",
  workflowTool: "",
  workflowNotes: "",
  monthlyBudgetUsd: "",
  piiRedactionLlm: true,
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeAiState(partial: Partial<AiState> | null | undefined): AiState {
  if (!partial) return DEFAULT_AI_STATE;
  const existing = new Map(partial.useCases?.map((u) => [u.id, u]) ?? []);
  const useCases = DEFAULT_USE_CASES.map((u) => existing.get(u.id) ?? u);
  return { ...DEFAULT_AI_STATE, ...partial, useCases };
}

export function parseAiState(content: string | undefined | null): AiState {
  if (!content) return DEFAULT_AI_STATE;
  try { return mergeAiState(JSON.parse(content)); } catch { return DEFAULT_AI_STATE; }
}

export function computeAiCompleteness(state: AiState): number {
  // Si provider = none, considère le chapitre non pertinent → 100% si explicite.
  if (state.provider === "none") return 100;
  let score = 0;
  if (state.provider) score += 15;
  if (state.primaryModel.trim()) score += 10;
  if (state.sdk) score += 15;
  if (state.promptCaching) score += 10;
  const useCaseCount = state.useCases.filter((u) => u.enabled).length;
  if (useCaseCount >= 1) score += 15;
  if (useCaseCount >= 3) score += 5;
  if (state.streamingUi) score += 5;
  if (state.workflowTool) score += 15;
  if (state.monthlyBudgetUsd.trim()) score += 10;
  return Math.min(100, Math.round(score));
}
