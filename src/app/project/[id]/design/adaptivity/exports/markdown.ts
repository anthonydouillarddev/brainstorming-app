import type { Project } from "@/lib/types";
import type { AdaptivityState } from "../state";
import {
  BREAKPOINT_KIND_META,
  COLOR_SCHEME_META,
  CONTAINER_SIZE_META,
  DENSITY_META,
  DIRECTION_META,
  HOVER_META,
  INPUT_KIND_META,
  POINTER_META,
  VIEWPORT_AXIS_META,
} from "../state";

export function exportAdaptivityMd(
  state: AdaptivityState,
  project: Project
): string {
  const lines: string[] = [];
  lines.push(`# Adaptativité — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 11 Adaptativité");
  lines.push("");

  if (state.breakpoints.length > 0) {
    lines.push("## 📐 Breakpoints");
    lines.push("");
    lines.push("| Nom | Type | Min | Max | Container | Grid cols | Gutter | Margin |");
    lines.push("|---|---|---|---|---|---|---|---|");
    for (const b of state.breakpoints) {
      lines.push(
        `| \`${b.name}\` | ${BREAKPOINT_KIND_META[b.kind].emoji} ${BREAKPOINT_KIND_META[b.kind].label} | ${b.minPx}px | ${b.maxPx === 0 ? "∞" : `${b.maxPx}px`} | ${b.containerMaxPx}${b.containerMaxPx === 100 ? "%" : "px"} | ${b.gridCols} | ${b.gutterPx}px | ${b.marginPx}px |`
      );
    }
    lines.push("");
  }

  if (state.colorSchemes.length > 0) {
    lines.push("## 🌓 Color schemes");
    lines.push("");
    for (const c of state.colorSchemes) {
      const meta = COLOR_SCHEME_META[c.scheme];
      lines.push(
        `### ${meta.emoji} ${meta.label} ${c.enabled ? "✓ activé" : "✗ désactivé"}`
      );
      lines.push("");
      lines.push(`- **Media query** : \`${c.mediaQuery}\``);
      lines.push(`- **Tokens mappés** : ${c.tokensMapped}`);
      lines.push(`- **Forçable user** : ${c.manualOverride ? "oui" : "non"}`);
      if (c.notes) lines.push(`- **Notes** : ${c.notes}`);
      lines.push("");
    }
  }

  if (state.densities.length > 0) {
    lines.push("## 📄 Densités");
    lines.push("");
    lines.push("| Densité | Font | Line-height | Spacing | Target min |");
    lines.push("|---|---|---|---|---|");
    for (const d of state.densities) {
      lines.push(
        `| ${DENSITY_META[d.density].emoji} ${DENSITY_META[d.density].label} | ${d.baseFontPx}px | ${d.lineHeight} | ${d.spacingScale}× | ${d.targetMinPx}px |`
      );
    }
    lines.push("");
  }

  if (state.inputModalities.length > 0) {
    lines.push("## 👆 Input modalities");
    lines.push("");
    lines.push(
      "| Input | Supporté | Hover | Pointer | Target min | Media query |"
    );
    lines.push("|---|---|---|---|---|---|");
    for (const m of state.inputModalities) {
      lines.push(
        `| ${INPUT_KIND_META[m.input].emoji} ${INPUT_KIND_META[m.input].label} | ${m.supported ? "✓" : "✗"} | ${HOVER_META[m.hoverSupport].label} | ${POINTER_META[m.pointerPrecision].label} | ${m.minTargetPx}px | \`${m.cssHint}\` |`
      );
    }
    lines.push("");
  }

  if (state.containerQueries.length > 0) {
    lines.push("## 📦 Container queries");
    lines.push("");
    lines.push("| Composant | Container | Threshold | Changement |");
    lines.push("|---|---|---|---|");
    for (const cq of state.containerQueries) {
      lines.push(
        `| ${cq.component} | \`${cq.containerName}\` | ${cq.threshold} (${cq.thresholdPx}px · ${CONTAINER_SIZE_META[cq.threshold].label}) | ${cq.layoutChange} |`
      );
    }
    lines.push("");
  }

  if (state.localizations.length > 0) {
    lines.push("## 🌍 Localisations");
    lines.push("");
    lines.push("| Locale | Label | Dir | Date | Number | Currency | Activé |");
    lines.push("|---|---|---|---|---|---|---|");
    for (const l of state.localizations) {
      lines.push(
        `| \`${l.locale}\` | ${l.label} | ${DIRECTION_META[l.direction].emoji} ${l.direction.toUpperCase()} | ${l.dateFormat} | ${l.numberFormat} | ${l.currencyFormat} | ${l.enabled ? "✓" : "–"} |`
      );
    }
    lines.push("");
  }

  if (state.viewportRules.length > 0) {
    lines.push("## 📐 Viewport adaptations");
    lines.push("");
    for (const v of state.viewportRules) {
      const meta = VIEWPORT_AXIS_META[v.axis];
      lines.push(
        `### ${meta.emoji} ${meta.label} ${v.respected ? "✓" : "⚠️"}${meta.wcag !== "—" ? ` · WCAG ${meta.wcag}` : ""}`
      );
      lines.push("");
      lines.push(`- **Règle** : ${meta.hint}`);
      if (v.implementation) {
        lines.push("```");
        lines.push(v.implementation);
        lines.push("```");
      }
      if (v.notes) lines.push(`- **Notes** : ${v.notes}`);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour générer les media queries CSS, les utilitaires Tailwind, ou un guide responsive complet.*"
  );
  return lines.join("\n");
}
