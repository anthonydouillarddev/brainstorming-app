import type { Project } from "@/lib/types";
import type { InfoNavState } from "../state";
import { getChildren } from "../state";

function renderTree(
  state: InfoNavState,
  parentId: string | null,
  depth: number,
  lines: string[]
): void {
  const children = getChildren(state, parentId);
  for (const screen of children) {
    const indent = "  ".repeat(depth);
    const nav = screen.isPrimaryNav ? " [NAV]" : "";
    lines.push(`${indent}- ${screen.title} (/${screen.slug})${nav}`);
    renderTree(state, screen.id, depth + 1, lines);
  }
}

export function exportClaudeBrief(state: InfoNavState, project: Project): string {
  const lines: string[] = [];

  lines.push(`# Brief architecture — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu dois générer du code (routes Next.js App Router, composant de navigation, migrations SQL)"
  );
  lines.push("aligné strictement sur cette architecture. Pas de route supplémentaire, pas de pattern");
  lines.push("différent. Si tu vois une incohérence, signale-la.");
  lines.push("");

  if (project.type) lines.push(`- **Type projet** : ${project.type}`);
  if (project.description) lines.push(`- **Description** : ${project.description}`);
  lines.push("");

  lines.push("## Sitemap (à implémenter en routes Next.js)");
  lines.push("");
  lines.push("```");
  renderTree(state, null, 0, lines);
  lines.push("```");
  lines.push("");

  if (state.navPattern) {
    lines.push("## Pattern de navigation");
    lines.push("");
    lines.push(`- **Pattern** : ${state.navPattern}`);
    const navScreens = state.navItems
      .map((id) => state.screens.find((s) => s.id === id))
      .filter(Boolean);
    if (navScreens.length > 0) {
      lines.push("- **Items (ordre)** :");
      navScreens.forEach((s) => {
        if (s) lines.push(`  - ${s.emoji ?? "📄"} ${s.title} (/${s.slug})`);
      });
    }
    lines.push("");
  }

  if (state.entities.length > 0) {
    lines.push("## Modèle de données");
    lines.push("");
    for (const entity of state.entities) {
      lines.push(`### ${entity.name}`);
      if (entity.description) lines.push(`${entity.description}`);
      lines.push("");
      lines.push("Attributs :");
      for (const attr of entity.attributes) {
        lines.push(
          `- \`${attr.name}\` : ${attr.type}${attr.required ? " (requis)" : ""}`
        );
      }
      lines.push("");
    }
    if (state.relations.length > 0) {
      lines.push("Relations :");
      for (const rel of state.relations) {
        const from = state.entities.find((e) => e.id === rel.fromEntityId)?.name ?? "?";
        const to = state.entities.find((e) => e.id === rel.toEntityId)?.name ?? "?";
        lines.push(
          `- **${from}** ${rel.type} **${to}**${rel.label ? ` — ${rel.label}` : ""}`
        );
      }
      lines.push("");
    }
  }

  if (state.labels.length > 0) {
    lines.push("## Vocabulaire (interne → user)");
    lines.push("");
    lines.push("Utilise le terme user-facing dans le copy, jamais l'interne :");
    for (const l of state.labels) {
      lines.push(`- \`${l.internal}\` → **${l.userFacing}**`);
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère les routes Next.js App Router »,"
  );
  lines.push(
    "« Crée le composant de nav sidebar », « Génère la migration SQL pour les entités », etc.)*"
  );

  return lines.join("\n");
}
