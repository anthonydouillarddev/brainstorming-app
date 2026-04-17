import type { Project } from "@/lib/types";
import type { InfoNavState, SitemapScreen } from "../state";
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
    const slug = screen.slug ? ` \`/${screen.slug}\`` : "";
    lines.push(`${indent}- ${screen.emoji ?? "📄"} **${screen.title}**${slug}${nav}`);
    if (screen.description) {
      lines.push(`${indent}  _${screen.description}_`);
    }
    renderTree(state, screen.id, depth + 1, lines);
  }
}

export function exportInfoNavMd(state: InfoNavState, project: Project): string {
  const lines: string[] = [];

  lines.push(`# Architecture Info & Nav — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 3 Information & Navigation");
  lines.push("");

  if (state.navPattern) {
    lines.push(`## 🧭 Pattern de navigation`);
    lines.push("");
    lines.push(`**${state.navPattern}**`);
    lines.push("");
  }

  lines.push("## 🗺️ Sitemap");
  lines.push("");
  if (state.screens.length === 0) {
    lines.push("*Pas encore défini.*");
  } else {
    renderTree(state, null, 0, lines);
  }
  lines.push("");

  const navScreens: SitemapScreen[] = state.navItems
    .map((id) => state.screens.find((s) => s.id === id))
    .filter((s): s is SitemapScreen => !!s);
  if (navScreens.length > 0) {
    lines.push("## 📋 Nav principale (ordre)");
    lines.push("");
    navScreens.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.emoji ?? "📄"} **${s.title}** — \`/${s.slug}\``);
    });
    lines.push("");
  }

  // URL map
  if (state.screens.length > 0) {
    lines.push("## 🔗 URL map");
    lines.push("");
    lines.push("| Écran | URL | Nav ? |");
    lines.push("|---|---|---|");
    for (const s of state.screens) {
      lines.push(`| ${s.emoji ?? "📄"} ${s.title} | \`/${s.slug}\` | ${s.isPrimaryNav ? "✓" : ""} |`);
    }
    lines.push("");
  }

  // Entities (V2)
  if (state.entities.length > 0) {
    lines.push("## 🧱 Entités métier");
    lines.push("");
    for (const entity of state.entities) {
      lines.push(`### ${entity.name}`);
      if (entity.description) lines.push(`${entity.description}`);
      if (entity.attributes.length > 0) {
        lines.push("");
        lines.push("| Attribut | Type | Requis |");
        lines.push("|---|---|---|");
        for (const attr of entity.attributes) {
          lines.push(`| ${attr.name} | ${attr.type} | ${attr.required ? "✓" : ""} |`);
        }
      }
      lines.push("");
    }

    if (state.relations.length > 0) {
      lines.push("### Relations");
      lines.push("");
      for (const rel of state.relations) {
        const from = state.entities.find((e) => e.id === rel.fromEntityId)?.name ?? "?";
        const to = state.entities.find((e) => e.id === rel.toEntityId)?.name ?? "?";
        lines.push(`- **${from}** \`${rel.type}\` **${to}**${rel.label ? ` — ${rel.label}` : ""}`);
      }
      lines.push("");
    }
  }

  // Labels (V2)
  if (state.labels.length > 0) {
    lines.push("## 📝 Dictionnaire labels");
    lines.push("");
    lines.push("| Interne | Affiché user | Contexte |");
    lines.push("|---|---|---|");
    for (const l of state.labels) {
      lines.push(`| \`${l.internal}\` | **${l.userFacing}** | ${l.context ?? ""} |`);
    }
    lines.push("");
  }

  // Command palette (V3)
  if (state.commandPalette.length > 0) {
    lines.push("## ⌘ Command palette");
    lines.push("");
    for (const cmd of state.commandPalette) {
      lines.push(`- \`${cmd.shortcut}\` — ${cmd.label} (${cmd.scope})`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il génère les routes Next.js, la nav component, ou les migrations SQL.*"
  );

  return lines.join("\n");
}
