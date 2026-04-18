import type { ServicesState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateServices(state: ServicesState): Issue[] {
  const issues: Issue[] = [];
  const used = state.selections.filter((s) => s.status === "used").length;
  const decided = state.selections.filter((s) => s.status === "used" || s.status === "skip").length;

  if (used > 15) {
    issues.push({
      severity: "warn",
      blockId: "catalog",
      message: `${used} services utilisés — attention à l'explosion des coûts mensuels.`,
    });
  }
  if (decided < 5) {
    issues.push({
      severity: "info",
      blockId: "catalog",
      message: "Moins de 5 catégories décidées — continue à cadrer tes services.",
    });
  }

  return issues;
}
