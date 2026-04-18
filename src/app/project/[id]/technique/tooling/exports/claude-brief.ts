import { COMMON_TOOLS, TOOLS_BY_PROJECT_TYPE } from "@/lib/technique/tooling-presets";
import type { ProjectType as SvcProjectType } from "@/lib/technique/services-catalog";
import type { ToolingState } from "../state";

export function exportToolingClaudeBrief(
  state: ToolingState,
  projectName: string,
  projectType: SvcProjectType
): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup outillage ${projectName}`);
  l.push("Tu es expert dev productivity. Aide-moi à setup ma machine :");
  l.push("");
  if (state.os) l.push(`- OS : ${state.os}`);
  if (state.annualBudgetUsd) l.push(`- Budget annuel : $${state.annualBudgetUsd}`);
  l.push("");

  const categories = [...COMMON_TOOLS, ...TOOLS_BY_PROJECT_TYPE[projectType]];
  const enabled = state.selections.filter((s) => s.enabled && s.selectedTool.trim());
  if (enabled.length) {
    l.push("## Outils à installer");
    for (const sel of enabled) {
      const cat = categories.find((c) => c.id === sel.categoryId);
      if (!cat) continue;
      l.push(`- ${cat.label} → ${sel.selectedTool}`);
    }
    l.push("");
  }
  l.push("## Ce que je te demande");
  l.push("1. Script bash d'install (brew / apt / winget selon l'OS).");
  l.push("2. Config Obsidian recommandée (plugins essentiels + vault structure).");
  l.push("3. Raccourcis clavier Raycast/PowerToys à setup en priorité.");
  l.push("4. Cursor settings JSON (rules, keybindings).");
  l.push("5. Claude Code workflow : quand l'utiliser vs Cursor ?");
  return l.join("\n");
}
