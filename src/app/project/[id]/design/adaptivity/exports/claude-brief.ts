import type { Project } from "@/lib/types";
import type { AdaptivityState } from "../state";
import {
  COLOR_SCHEME_META,
  DENSITY_META,
  DIRECTION_META,
  INPUT_KIND_META,
  VIEWPORT_AXIS_META,
} from "../state";

export function exportAdaptivityClaudeBrief(
  state: AdaptivityState,
  project: Project
): string {
  const lines: string[] = [];

  lines.push(`# Brief adaptativité — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas implémenter le layout responsive, le dark mode, la densité et le support touch/souris/clavier."
  );
  lines.push(
    "Respecte STRICTEMENT les breakpoints, les schemes activés et les targets min (WCAG 2.5.8)."
  );
  lines.push("");

  if (state.breakpoints.length > 0) {
    lines.push("## Breakpoints CSS");
    lines.push("");
    lines.push("```css");
    for (const b of state.breakpoints) {
      const bpRule =
        b.maxPx === 0
          ? `@media (min-width: ${b.minPx}px)`
          : `@media (min-width: ${b.minPx}px) and (max-width: ${b.maxPx}px)`;
      lines.push(`/* ${b.name} (${b.kind}) · container ${b.containerMaxPx} · ${b.gridCols} cols */`);
      lines.push(`${bpRule} { /* ... */ }`);
    }
    lines.push("```");
    lines.push("");
  }

  if (state.colorSchemes.length > 0) {
    lines.push("## Color schemes");
    lines.push("");
    for (const c of state.colorSchemes) {
      if (!c.enabled) continue;
      const meta = COLOR_SCHEME_META[c.scheme];
      lines.push(
        `- **${meta.label}** · ${c.mediaQuery}${c.manualOverride ? " · forçable user" : ""}${c.tokensMapped > 0 ? ` · ${c.tokensMapped} tokens` : ""}`
      );
    }
    lines.push("");
  }

  if (state.densities.length > 0) {
    lines.push("## Densités (CSS variables)");
    lines.push("");
    lines.push("```css");
    for (const d of state.densities) {
      const meta = DENSITY_META[d.density];
      lines.push(`html.density-${d.density} {`);
      lines.push(`  --font-base: ${d.baseFontPx}px; /* ${meta.label} */`);
      lines.push(`  --line-height: ${d.lineHeight};`);
      lines.push(`  --spacing-scale: ${d.spacingScale};`);
      lines.push(`  --target-min: ${d.targetMinPx}px;`);
      lines.push(`}`);
    }
    lines.push("```");
    lines.push("");
  }

  if (state.inputModalities.length > 0) {
    lines.push("## Input modalities (media queries CSS4)");
    lines.push("");
    lines.push("```css");
    for (const m of state.inputModalities) {
      if (!m.supported) continue;
      const meta = INPUT_KIND_META[m.input];
      lines.push(`/* ${meta.label} · target min ${m.minTargetPx}px */`);
      lines.push(`${m.cssHint} { /* ... */ }`);
    }
    lines.push("```");
    lines.push("");
  }

  if (state.containerQueries.length > 0) {
    lines.push("## Container queries (per-component breakpoints)");
    lines.push("");
    lines.push("```css");
    for (const cq of state.containerQueries) {
      lines.push(`/* ${cq.component} · ${cq.layoutChange} */`);
      lines.push(`.${cq.containerName} { container-type: inline-size; container-name: ${cq.containerName}; }`);
      lines.push(
        `@container ${cq.containerName} (min-width: ${cq.thresholdPx}px) { /* ... */ }`
      );
    }
    lines.push("```");
    lines.push("");
  }

  const enabledLocales = state.localizations.filter((l) => l.enabled);
  if (enabledLocales.length > 0) {
    lines.push("## Localisations actives");
    lines.push("");
    for (const l of enabledLocales) {
      lines.push(
        `- **${l.locale}** (${l.label}) · ${DIRECTION_META[l.direction].emoji} ${l.direction.toUpperCase()} · Date \`${l.dateFormat}\` · Number \`${l.numberFormat}\` · Currency \`${l.currencyFormat}\``
      );
    }
    lines.push("");
    const hasRtl = enabledLocales.some((l) => l.direction === "rtl");
    if (hasRtl) {
      lines.push(
        "⚠️ RTL activé — inverser paddings/margins logiques (`padding-inline-start`), icônes directionnelles, ordre flex."
      );
      lines.push("");
    }
  }

  if (state.viewportRules.length > 0) {
    lines.push("## Viewport rules (WCAG + safe areas)");
    lines.push("");
    for (const v of state.viewportRules) {
      const meta = VIEWPORT_AXIS_META[v.axis];
      lines.push(
        `- **${meta.label}** ${v.respected ? "✓" : "⚠️ TODO"}${meta.wcag !== "—" ? ` (WCAG ${meta.wcag})` : ""} · ${v.implementation || meta.hint}`
      );
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Écris le CSS du dark mode »,"
  );
  lines.push(
    "« Génère les utilitaires Tailwind v4 pour ces breakpoints », « Crée le système de densité complet », etc.)*"
  );

  return lines.join("\n");
}
