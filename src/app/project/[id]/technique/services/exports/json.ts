import { SERVICES_CATALOG } from "@/lib/technique/services-catalog";
import type { ServicesState } from "../state";

export function exportServicesJson(state: ServicesState, projectName: string): string {
  const byStatus = {
    used: [] as Array<{ category: string; service: string; notes: string }>,
    evaluated: [] as Array<{ category: string; service: string; notes: string }>,
    skip: [] as Array<{ category: string; notes: string }>,
  };

  for (const sel of state.selections) {
    const cat = SERVICES_CATALOG.find((c) => c.id === sel.categoryId);
    if (!cat) continue;
    if (sel.status === "used") {
      byStatus.used.push({ category: cat.label, service: sel.selectedService, notes: sel.notes });
    } else if (sel.status === "evaluated") {
      byStatus.evaluated.push({ category: cat.label, service: sel.selectedService, notes: sel.notes });
    } else if (sel.status === "skip") {
      byStatus.skip.push({ category: cat.label, notes: sel.notes });
    }
  }

  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    ...byStatus,
  }, null, 2);
}
