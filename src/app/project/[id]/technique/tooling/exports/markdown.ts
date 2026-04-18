import { COMMON_TOOLS, TOOLS_BY_PROJECT_TYPE } from "@/lib/technique/tooling-presets";
import type { ProjectType as SvcProjectType } from "@/lib/technique/services-catalog";
import type { ToolingState } from "../state";

export function exportToolingMarkdown(
  state: ToolingState,
  projectName: string,
  projectType: SvcProjectType
): string {
  const l: string[] = [];
  l.push(`# 🛠️ Outillage & Knowledge — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  if (state.os) l.push(`- **OS** : ${state.os}`);
  if (state.annualBudgetUsd) l.push(`- **Budget annuel** : $${state.annualBudgetUsd}`);
  l.push("");

  const categories = [...COMMON_TOOLS, ...TOOLS_BY_PROJECT_TYPE[projectType]];
  const enabled = state.selections.filter((s) => s.enabled && s.selectedTool.trim());
  if (enabled.length > 0) {
    l.push("## Outils utilisés");
    for (const sel of enabled) {
      const cat = categories.find((c) => c.id === sel.categoryId);
      if (!cat) continue;
      l.push(`- **${cat.label}** → ${sel.selectedTool}${sel.notes ? ` — ${sel.notes}` : ""}`);
    }
    l.push("");
  }

  if (state.notes) {
    l.push("## Notes");
    l.push(state.notes);
  }
  return l.join("\n");
}
