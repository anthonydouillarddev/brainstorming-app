import type { Project } from "@/lib/types";
import type { DesignSystemState } from "../state";
import { COMPONENTS_CATALOG } from "../components-catalog";
import { PATTERN_TEMPLATES } from "../patterns-library";

export function exportDesignSystemClaudeBrief(
  state: DesignSystemState,
  project: Project
): string {
  const lines: string[] = [];

  lines.push(`# Brief design system — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas générer des composants React/CSS, des specs Storybook, ou une checklist Figma"
  );
  lines.push(
    "basée strictement sur ce design system. Respecte les semantic tokens (jamais de hex"
  );
  lines.push("hardcodé), les patterns d'état, et les règles a11y.");
  lines.push("");

  if (state.semanticTokens.length > 0) {
    lines.push("## Semantic tokens (à utiliser partout — JAMAIS de hex hardcodé)");
    lines.push("");
    lines.push("```css");
    for (const t of state.semanticTokens) {
      lines.push(`--${t.name.replace(/\./g, "-")}: ${t.primitiveHex}; /* ${t.description} */`);
    }
    lines.push("```");
    lines.push("");
  }

  const mustComponents = state.components.filter((c) => c.priority === "must");
  const shouldComponents = state.components.filter((c) => c.priority === "should");
  if (mustComponents.length > 0) {
    lines.push("## Composants MUST (à implémenter en priorité)");
    lines.push("");
    for (const c of mustComponents) {
      const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
      if (!def) continue;
      lines.push(`- **${def.name}** (${def.category}) — ${def.description}`);
      if (c.notes) lines.push(`  - Note : ${c.notes}`);
    }
    lines.push("");
  }
  if (shouldComponents.length > 0) {
    lines.push("## Composants SHOULD (seconde vague)");
    lines.push("");
    for (const c of shouldComponents) {
      const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
      if (!def) continue;
      lines.push(`- **${def.name}** — ${def.description}`);
    }
    lines.push("");
  }

  if (state.variants.length > 0) {
    lines.push("## Variants à implémenter");
    lines.push("");
    for (const v of state.variants) {
      const def = COMPONENTS_CATALOG.find((c) => c.slug === v.componentSlug);
      if (!def) continue;
      lines.push(`### ${def.name}`);
      lines.push(`- Variants : ${v.variants.join(", ")}`);
      lines.push(`- Sizes : ${v.sizes.join(", ")}`);
      lines.push(`- States : ${v.states.join(", ")}`);
      lines.push("");
    }
  }

  if (state.patterns.length > 0) {
    lines.push("## Patterns d'état obligatoires");
    lines.push("");
    for (const sel of state.patterns) {
      const tpl = PATTERN_TEMPLATES.find((p) => p.id === sel.patternId);
      if (!tpl) continue;
      lines.push(`### ${tpl.emoji} ${tpl.label}`);
      lines.push(tpl.structure);
      lines.push("");
    }
  }

  if (state.a11yChecks.length > 0) {
    lines.push("## Exigences a11y par composant (WCAG 2.2 AA)");
    lines.push("");
    for (const a of state.a11yChecks) {
      const def = COMPONENTS_CATALOG.find((c) => c.slug === a.componentSlug);
      if (!def) continue;
      const checks: string[] = [];
      if (a.focusVisible) checks.push("focus visible");
      if (a.keyboardNav) checks.push("keyboard nav");
      if (a.ariaLabel) checks.push("aria-label");
      if (a.contrastAA) checks.push("contraste AA");
      lines.push(
        `- **${def.name}** : ${checks.length > 0 ? checks.join(" · ") : "⚠ rien coché — à vérifier"}`
      );
    }
    lines.push("");
  }

  if (state.density !== "normal") {
    lines.push("## Density");
    lines.push("");
    lines.push(
      `Preset **${state.density}** — ajuste spacings et font-sizes selon ce multiplicateur.`
    );
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère le composant Button en TSX avec les 4 variants »,"
  );
  lines.push(
    "« Crée le empty state EmptyProjects avec Tailwind », « Génère la checklist Figma pour ce DS », etc.)*"
  );

  return lines.join("\n");
}
