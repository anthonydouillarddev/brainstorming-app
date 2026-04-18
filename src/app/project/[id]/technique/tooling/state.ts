import type { OS } from "@/lib/technique/tooling-presets";

export type ToolingMode = "beginner" | "intermediate";

export interface ToolSelection {
  categoryId: string;
  selectedTool: string; // nom du tool choisi
  enabled: boolean;
  notes: string;
}

export interface ToolingState {
  version: 1;
  os: OS | "";
  annualBudgetUsd: string;
  selections: ToolSelection[]; // commun + par type projet
  notes: string;
  modeUsed: ToolingMode;
  updatedAt: string;
}

export const TOOLING_SECTION_KEY = "tech-tooling";

export const DEFAULT_TOOLING_STATE: ToolingState = {
  version: 1,
  os: "",
  annualBudgetUsd: "",
  selections: [],
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeToolingState(partial: Partial<ToolingState> | null | undefined): ToolingState {
  if (!partial) return DEFAULT_TOOLING_STATE;
  return { ...DEFAULT_TOOLING_STATE, ...partial, selections: partial.selections ?? [] };
}

export function parseToolingState(content: string | undefined | null): ToolingState {
  if (!content) return DEFAULT_TOOLING_STATE;
  try { return mergeToolingState(JSON.parse(content)); } catch { return DEFAULT_TOOLING_STATE; }
}

export function computeToolingCompleteness(state: ToolingState, totalCategories: number): number {
  let score = 0;
  if (state.os) score += 10;
  if (state.annualBudgetUsd.trim()) score += 10;
  if (totalCategories === 0) return Math.min(100, score);
  const enabled = state.selections.filter((s) => s.enabled && s.selectedTool.trim()).length;
  score += Math.round((enabled / totalCategories) * 80);
  return Math.min(100, Math.round(score));
}
