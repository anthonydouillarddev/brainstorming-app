import type { Project } from "@/lib/types";
import type { StatesState } from "../state";
import {
  EMPTY_KIND_META,
  ERROR_CATEGORY_META,
  LOADING_KIND_META,
  MACHINE_STATE_META,
  SLO_STATUS_META,
  SUCCESS_KIND_META,
  TOAST_KIND_META,
  TOAST_PLACEMENT_META,
  TONE_META,
  computeSloStatus,
} from "../state";

export function exportStatesMd(state: StatesState, project: Project): string {
  const lines: string[] = [];
  lines.push(`# États — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 8 États (loading · empty · error · micro-interactions)");
  lines.push("");

  // Screens
  if (state.screens.length > 0) {
    lines.push("## 🖥️ Inventaire des écrans");
    lines.push("");
    lines.push("| Écran | Priorité | Loading | Empty | Error | Success |");
    lines.push("|---|---|---|---|---|---|");
    for (const s of state.screens) {
      lines.push(
        `| ${s.title || "(sans titre)"} | ${s.priority.toUpperCase()} | ${s.needsLoading ? "✓" : "–"} | ${s.needsEmpty ? "✓" : "–"} | ${s.needsError ? "✓" : "–"} | ${s.needsSuccess ? "✓" : "–"} |`
      );
    }
    lines.push("");
  }

  // Loading
  if (state.loadingPatterns.length > 0) {
    lines.push("## ⏳ Loading patterns");
    lines.push("");
    for (const l of state.loadingPatterns) {
      const meta = LOADING_KIND_META[l.kind];
      lines.push(`### ${meta.emoji} ${meta.label} — ${l.trigger || "(sans trigger)"}`);
      lines.push("");
      lines.push(`- **Durée min** : ${l.minDurationMs}ms`);
      lines.push(`- **Usage** : ${meta.when}`);
      if (l.kind === "skeleton" && l.skeletonFields) {
        lines.push(`- **Zones skeleton** : ${l.skeletonFields}`);
      }
      if (l.notes) lines.push(`- **Notes** : ${l.notes}`);
      lines.push("");
    }
  }

  // Empty states
  if (state.emptyStates.length > 0) {
    lines.push("## 🌱 Empty states");
    lines.push("");
    for (const e of state.emptyStates) {
      const meta = EMPTY_KIND_META[e.kind];
      lines.push(`### ${meta.emoji} ${meta.label} — ${e.context || "(sans contexte)"}`);
      lines.push("");
      lines.push(`> **${e.headline || "(titre manquant)"}**`);
      lines.push(">");
      if (e.body) {
        lines.push(`> ${e.body}`);
        lines.push(">");
      }
      if (e.primaryCta || e.secondaryCta) {
        const ctas = [e.primaryCta, e.secondaryCta].filter(Boolean).join(" · ");
        lines.push(`> CTA : **${ctas}**`);
      }
      lines.push("");
      if (e.illustration) lines.push(`- **Illustration** : ${e.illustration}`);
      lines.push(`- **Purpose** : ${meta.purpose}`);
      if (e.notes) lines.push(`- **Notes** : ${e.notes}`);
      lines.push("");
    }
  }

  // Errors
  if (state.errorPatterns.length > 0) {
    lines.push("## ⚠️ Error patterns");
    lines.push("");
    for (const err of state.errorPatterns) {
      const meta = ERROR_CATEGORY_META[err.category];
      const tone = TONE_META[err.tone];
      lines.push(`### ${meta.emoji} ${meta.label} — ${err.trigger || "(sans trigger)"}`);
      lines.push("");
      lines.push(`- **Ton** : ${tone.emoji} ${tone.label}`);
      lines.push(`- **Message user** : ${err.message || "(manquant)"}`);
      if (err.action) lines.push(`- **Action recovery** : ${err.action}`);
      if (err.technicalFallback) lines.push(`- **Fallback technique** : ${err.technicalFallback}`);
      lines.push(`- **Tip** : ${meta.tip}`);
      if (err.notes) lines.push(`- **Notes** : ${err.notes}`);
      lines.push("");
    }
  }

  // Success patterns (V2)
  if (state.successPatterns.length > 0) {
    lines.push("## 🎉 Success patterns");
    lines.push("");
    for (const s of state.successPatterns) {
      const meta = SUCCESS_KIND_META[s.kind];
      lines.push(`### ${meta.emoji} ${meta.label} — ${s.trigger || "(sans trigger)"}`);
      lines.push("");
      lines.push(`- **Message** : ${s.message || "(manquant)"}`);
      if (s.ctaNext) lines.push(`- **CTA next** : ${s.ctaNext}`);
      lines.push(`- **Durée** : ${s.durationMs === 0 ? "sticky" : `${s.durationMs}ms`}`);
      if (s.celebrate) lines.push(`- **Célébration** : 🎊 oui`);
      if (s.notes) lines.push(`- **Notes** : ${s.notes}`);
      lines.push("");
    }
  }

  // Toasts (V2)
  if (state.toasts.length > 0) {
    lines.push("## 🍞 Toast library");
    lines.push("");
    lines.push("| Type | Label | Placement | Durée | Action | Dismiss |");
    lines.push("|---|---|---|---|---|---|");
    for (const t of state.toasts) {
      const meta = TOAST_KIND_META[t.kind];
      lines.push(
        `| ${meta.emoji} ${meta.label} | ${t.label} | ${TOAST_PLACEMENT_META[t.placement]} | ${t.durationMs === 0 ? "sticky" : `${t.durationMs}ms`} | ${t.action || "–"} | ${t.dismissible ? "✓" : "–"} |`
      );
    }
    lines.push("");
  }

  // State machines (V2)
  if (state.stateMachines.length > 0) {
    lines.push("## 🔀 State machines");
    lines.push("");
    for (const m of state.stateMachines) {
      lines.push(`### ${m.screenTitle || "(sans titre)"}`);
      lines.push("");
      lines.push(
        `**États** : ${m.states.map((s) => `${MACHINE_STATE_META[s].emoji} ${s}`).join(" · ")}`
      );
      lines.push(`**Initial** : ${MACHINE_STATE_META[m.initial].emoji} ${m.initial}`);
      lines.push("");
      if (m.transitions.length > 0) {
        lines.push("```mermaid");
        lines.push("stateDiagram-v2");
        lines.push(`  [*] --> ${m.initial}`);
        for (const tr of m.transitions) {
          const evt = tr.event.replace(/:/g, "_") || "event";
          lines.push(`  ${tr.from} --> ${tr.to} : ${evt}`);
        }
        lines.push("```");
        lines.push("");
      }
      if (m.notes) {
        lines.push(`> ${m.notes}`);
        lines.push("");
      }
    }
  }

  // Micro-interactions
  if (state.microInteractions.length > 0) {
    lines.push("## ✨ Micro-interactions");
    lines.push("");
    lines.push("| Cible | États | Durée | Easing | Notes |");
    lines.push("|---|---|---|---|---|");
    for (const m of state.microInteractions) {
      const targetLabel = m.target === "custom" ? m.customTarget || "Custom" : m.target;
      lines.push(
        `| ${targetLabel} | ${m.states.join(" · ")} | ${m.durationMs}ms | ${m.easing} | ${m.notes || "–"} |`
      );
    }
    lines.push("");
  }

  // Latency logs (V3)
  if (state.latencyLogs.length > 0) {
    lines.push("## 📏 Latency SLO log");
    lines.push("");
    lines.push("| Trigger | p50 | p95 | SLO cible | Ratio | Status | Échantillon | Mesuré le |");
    lines.push("|---|---|---|---|---|---|---|---|");
    for (const l of state.latencyLogs) {
      const status = computeSloStatus(l);
      const meta = SLO_STATUS_META[status];
      const ratio = l.sloTargetMs === 0 ? 0 : (l.p95Ms / l.sloTargetMs) * 100;
      lines.push(
        `| ${l.trigger || "(sans)"} | ${l.p50Ms}ms | ${l.p95Ms}ms | ${l.sloTargetMs}ms | ${ratio.toFixed(0)}% | ${meta.emoji} ${meta.label} | ${l.sampleSize} | ${l.sampledAt} |`
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il génère les composants React/CSS des états, les specs Storybook, ou le plan de tests.*"
  );
  return lines.join("\n");
}
