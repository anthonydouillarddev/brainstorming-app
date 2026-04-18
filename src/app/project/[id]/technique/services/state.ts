import { SERVICES_CATALOG } from "@/lib/technique/services-catalog";

export type ServicesMode = "beginner" | "intermediate";
export type CategoryStatus = "used" | "evaluated" | "skip" | "todo";

export interface CategorySelection {
  categoryId: string;
  status: CategoryStatus;
  selectedService: string; // nom du service choisi (reco ou alternative ou custom)
  notes: string;
}

export interface ServicesState {
  version: 1;
  selections: CategorySelection[];
  filterByProjectType: boolean;
  modeUsed: ServicesMode;
  updatedAt: string;
}

export const SERVICES_SECTION_KEY = "tech-services";

export const DEFAULT_SERVICES_STATE: ServicesState = {
  version: 1,
  selections: SERVICES_CATALOG.map((c) => ({
    categoryId: c.id,
    status: "todo" as CategoryStatus,
    selectedService: "",
    notes: "",
  })),
  filterByProjectType: true,
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeServicesState(partial: Partial<ServicesState> | null | undefined): ServicesState {
  if (!partial) return DEFAULT_SERVICES_STATE;
  // S'assure que chaque catégorie a une entrée dans selections
  const existing = new Map(partial.selections?.map((s) => [s.categoryId, s]) ?? []);
  const selections = SERVICES_CATALOG.map(
    (c): CategorySelection =>
      existing.get(c.id) ?? {
        categoryId: c.id,
        status: "todo",
        selectedService: "",
        notes: "",
      }
  );
  return { ...DEFAULT_SERVICES_STATE, ...partial, selections };
}

export function parseServicesState(content: string | undefined | null): ServicesState {
  if (!content) return DEFAULT_SERVICES_STATE;
  try { return mergeServicesState(JSON.parse(content)); } catch { return DEFAULT_SERVICES_STATE; }
}

// Complétude : % catégories avec status "used" ou "skip" (décidé).
export function computeServicesCompleteness(state: ServicesState): number {
  const decided = state.selections.filter((s) => s.status === "used" || s.status === "skip").length;
  const total = state.selections.length || 1;
  return Math.round((decided / total) * 100);
}
