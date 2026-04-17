import type { Project } from "@/lib/types";
import type { DesignSystemState } from "../state";
import { computeContrastRatio, contrastLevel } from "../state";
import {
  CATEGORY_META,
  COMPONENTS_CATALOG,
} from "../components-catalog";
import { PATTERN_TEMPLATES } from "../patterns-library";

export function exportDesignSystemMd(
  state: DesignSystemState,
  project: Project
): string {
  const lines: string[] = [];
  lines.push(`# Design System — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 7 Système de design");
  lines.push("");

  // Semantic tokens
  if (state.semanticTokens.length > 0) {
    lines.push("## 🎯 Semantic tokens");
    lines.push("");
    lines.push("| Token | Hex | Description |");
    lines.push("|---|---|---|");
    for (const t of state.semanticTokens) {
      lines.push(`| \`${t.name}\` | \`${t.primitiveHex}\` | ${t.description} |`);
    }
    lines.push("");
  }

  // Contrast pairs
  if (state.contrastPairs.length > 0) {
    lines.push("## 🎨 Contraste WCAG");
    lines.push("");
    lines.push("| Paire | FG | BG | Ratio | Niveau |");
    lines.push("|---|---|---|---|---|");
    for (const p of state.contrastPairs) {
      const ratio = computeContrastRatio(p.fgHex, p.bgHex);
      const level = contrastLevel(ratio);
      const levelLabel =
        level === "aaa" ? "AAA ✓" : level === "aa" ? "AA ✓" : level === "aa-large" ? "AA-L ⚠" : "FAIL ✗";
      lines.push(
        `| ${p.name} | \`${p.fgHex}\` | \`${p.bgHex}\` | ${ratio.toFixed(2)} | ${levelLabel} |`
      );
    }
    lines.push("");
  }

  // Components
  if (state.components.length > 0) {
    lines.push("## 🧱 Catalogue composants");
    lines.push("");
    for (const category of ["atom", "molecule", "organism"] as const) {
      const items = state.components.filter((c) => {
        const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
        return def?.category === category;
      });
      if (items.length === 0) continue;
      const meta = CATEGORY_META[category];
      lines.push(`### ${meta.emoji} ${meta.label}`);
      lines.push("");
      for (const c of items) {
        const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
        if (!def) continue;
        lines.push(
          `- **${def.name}** [${c.priority.toUpperCase()}] — ${def.description}`
        );
        if (c.notes) lines.push(`  - *${c.notes}*`);
      }
      lines.push("");
    }
  }

  // Patterns
  if (state.patterns.length > 0) {
    lines.push("## 🎨 Patterns activés");
    lines.push("");
    for (const sel of state.patterns) {
      const tpl = PATTERN_TEMPLATES.find((p) => p.id === sel.patternId);
      if (!tpl) continue;
      lines.push(`### ${tpl.emoji} ${tpl.label}`);
      lines.push("");
      lines.push(tpl.structure);
      lines.push("");
      lines.push("**Exemple**");
      lines.push("```");
      lines.push(tpl.example);
      lines.push("```");
      if (sel.customMarkdown.trim()) {
        lines.push("");
        lines.push("**Personnalisation**");
        lines.push(sel.customMarkdown.trim());
      }
      lines.push("");
    }
  }

  // Variants (V2)
  if (state.variants.length > 0) {
    lines.push("## 🎭 Variants par composant");
    lines.push("");
    for (const v of state.variants) {
      const def = COMPONENTS_CATALOG.find((c) => c.slug === v.componentSlug);
      if (!def) continue;
      const combinations = v.variants.length * v.sizes.length * v.states.length;
      lines.push(
        `- **${def.name}** : ${v.variants.length} variants × ${v.sizes.length} sizes × ${v.states.length} states = ${combinations} combinaisons`
      );
      lines.push(`  - Variants : ${v.variants.join(" · ")}`);
      lines.push(`  - Sizes : ${v.sizes.join(" · ")}`);
      lines.push(`  - States : ${v.states.join(" · ")}`);
    }
    lines.push("");
  }

  // A11y (V2)
  if (state.a11yChecks.length > 0) {
    lines.push("## ♿ A11y checklist");
    lines.push("");
    lines.push("| Composant | Focus | Keyboard | aria-label | AA contrast |");
    lines.push("|---|---|---|---|---|");
    for (const a of state.a11yChecks) {
      const def = COMPONENTS_CATALOG.find((c) => c.slug === a.componentSlug);
      lines.push(
        `| ${def?.name ?? a.componentSlug} | ${a.focusVisible ? "✓" : "✗"} | ${a.keyboardNav ? "✓" : "✗"} | ${a.ariaLabel ? "✓" : "✗"} | ${a.contrastAA ? "✓" : "✗"} |`
      );
    }
    lines.push("");
  }

  // Density (V2)
  if (state.density !== "normal") {
    lines.push("## 🎚️ Density");
    lines.push("");
    lines.push(`**${state.density}** — tous les \`space-*\` et \`font-size-*\` sont ajustés selon ce preset.`);
    lines.push("");
  }

  // Deprecated (V3)
  if (state.deprecatedTokens.length > 0) {
    lines.push("## 🗄️ Tokens dépréciés");
    lines.push("");
    for (const d of state.deprecatedTokens) {
      lines.push(
        `- ~~\`${d.name}\`~~ → \`${d.replacedBy}\` (déprécié le ${new Date(d.deprecatedAt).toLocaleDateString("fr-FR")})`
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il génère les composants React/CSS, les specs Storybook, ou les checklists Figma.*"
  );
  return lines.join("\n");
}
