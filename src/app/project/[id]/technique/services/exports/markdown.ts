import { SERVICES_CATALOG, SERVICE_GROUP_META, type ServiceGroup } from "@/lib/technique/services-catalog";
import type { ServicesState } from "../state";

export function exportServicesMarkdown(state: ServicesState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 🔌 Services tiers & Intégrations — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");

  for (const group of Object.keys(SERVICE_GROUP_META) as ServiceGroup[]) {
    const meta = SERVICE_GROUP_META[group];
    const cats = SERVICES_CATALOG.filter((c) => c.group === group);
    const used = cats.filter((c) => {
      const sel = state.selections.find((s) => s.categoryId === c.id);
      return sel?.status === "used";
    });
    if (used.length === 0) continue;

    l.push(`## ${meta.emoji} ${meta.label}`);
    for (const c of used) {
      const sel = state.selections.find((s) => s.categoryId === c.id);
      if (!sel) continue;
      l.push(`- **${c.label}** → ${sel.selectedService || "(à choisir)"}${sel.notes ? ` — ${sel.notes}` : ""}`);
    }
    l.push("");
  }

  // Section "évalués non retenus"
  const evaluated = state.selections.filter((s) => s.status === "evaluated");
  if (evaluated.length > 0) {
    l.push("## 🔎 Évalués (non retenus)");
    for (const s of evaluated) {
      const cat = SERVICES_CATALOG.find((c) => c.id === s.categoryId);
      if (!cat) continue;
      l.push(`- ${cat.label}${s.notes ? ` — ${s.notes}` : ""}`);
    }
  }

  return l.join("\n");
}
