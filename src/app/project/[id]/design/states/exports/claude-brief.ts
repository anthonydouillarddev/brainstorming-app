import type { Project } from "@/lib/types";
import type { StatesState } from "../state";
import {
  EMPTY_KIND_META,
  ERROR_CATEGORY_META,
  LOADING_KIND_META,
  MACHINE_STATE_META,
  SUCCESS_KIND_META,
  TOAST_KIND_META,
  TONE_META,
} from "../state";

export function exportStatesClaudeBrief(
  state: StatesState,
  project: Project
): string {
  const lines: string[] = [];

  lines.push(`# Brief états — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas générer les composants React/CSS des états (loading, empty, error) et les micro-"
  );
  lines.push(
    "interactions. Respecte strictement les ton, durées et actions recovery définis ci-dessous."
  );
  lines.push("");

  if (state.screens.length > 0) {
    lines.push("## Écrans à couvrir");
    lines.push("");
    for (const s of state.screens) {
      const needs = [
        s.needsLoading && "loading",
        s.needsEmpty && "empty",
        s.needsError && "error",
        s.needsSuccess && "success",
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `- **${s.title}** [${s.priority.toUpperCase()}] : ${needs || "(aucun état)"}${s.notes ? ` — ${s.notes}` : ""}`
      );
    }
    lines.push("");
  }

  if (state.loadingPatterns.length > 0) {
    lines.push("## Loading patterns (respecter Doherty threshold)");
    lines.push("");
    for (const l of state.loadingPatterns) {
      const meta = LOADING_KIND_META[l.kind];
      lines.push(
        `- **${meta.label}** — trigger « ${l.trigger} » · min ${l.minDurationMs}ms`
      );
      if (l.kind === "skeleton" && l.skeletonFields) {
        lines.push(`  - Structure skeleton : ${l.skeletonFields}`);
      }
    }
    lines.push("");
  }

  if (state.emptyStates.length > 0) {
    lines.push("## Empty states (titre + corps + CTA obligatoires)");
    lines.push("");
    for (const e of state.emptyStates) {
      const meta = EMPTY_KIND_META[e.kind];
      lines.push(`### ${meta.label} — ${e.context}`);
      lines.push(`- **Titre** : ${e.headline}`);
      lines.push(`- **Corps** : ${e.body}`);
      if (e.primaryCta) lines.push(`- **CTA principal** : ${e.primaryCta}`);
      if (e.secondaryCta) lines.push(`- **CTA secondaire** : ${e.secondaryCta}`);
      if (e.illustration) lines.push(`- **Illustration** : ${e.illustration}`);
      lines.push("");
    }
  }

  if (state.errorPatterns.length > 0) {
    lines.push("## Error patterns (ton → message → action)");
    lines.push("");
    for (const err of state.errorPatterns) {
      const meta = ERROR_CATEGORY_META[err.category];
      const tone = TONE_META[err.tone];
      lines.push(`### ${meta.label} — ${err.trigger}`);
      lines.push(`- **Ton** : ${tone.label} (ex: "${tone.example}")`);
      lines.push(`- **Message user** : ${err.message}`);
      if (err.action) lines.push(`- **Action recovery** : ${err.action}`);
      if (err.technicalFallback) {
        lines.push(`- **Fallback technique (devs)** : ${err.technicalFallback}`);
      }
      lines.push("");
    }
  }

  if (state.successPatterns.length > 0) {
    lines.push("## Success patterns (peak moments — soigner)");
    lines.push("");
    for (const s of state.successPatterns) {
      const meta = SUCCESS_KIND_META[s.kind];
      lines.push(`- **${meta.label}** — « ${s.trigger} »`);
      lines.push(`  - Message : ${s.message}`);
      if (s.ctaNext) lines.push(`  - CTA next : ${s.ctaNext}`);
      lines.push(
        `  - Durée : ${s.durationMs === 0 ? "sticky" : `${s.durationMs}ms`}${s.celebrate ? " · 🎊 célébrer" : ""}`
      );
    }
    lines.push("");
  }

  if (state.toasts.length > 0) {
    lines.push("## Toast library (respecter placement + durée + dismiss)");
    lines.push("");
    for (const t of state.toasts) {
      const meta = TOAST_KIND_META[t.kind];
      lines.push(
        `- **${meta.label}** « ${t.label} » · ${t.placement} · ${t.durationMs === 0 ? "sticky" : `${t.durationMs}ms`}${t.action ? ` · action: ${t.action}` : ""}${t.dismissible ? " · dismissible" : ""}`
      );
    }
    lines.push("");
  }

  if (state.stateMachines.length > 0) {
    lines.push("## State machines (implémenter via XState ou reducer)");
    lines.push("");
    for (const m of state.stateMachines) {
      lines.push(`### ${m.screenTitle}`);
      lines.push(
        `- États : ${m.states.map((s) => `${MACHINE_STATE_META[s].emoji} ${s}`).join(", ")}`
      );
      lines.push(`- Initial : ${m.initial}`);
      if (m.transitions.length > 0) {
        lines.push(`- Transitions :`);
        for (const tr of m.transitions) {
          lines.push(`  - \`${tr.from}\` → \`${tr.to}\` (${tr.event || "event"})`);
        }
      }
      lines.push("");
    }
  }

  if (state.microInteractions.length > 0) {
    lines.push("## Micro-interactions (80–400ms · focus visible obligatoire)");
    lines.push("");
    for (const m of state.microInteractions) {
      const targetLabel = m.target === "custom" ? m.customTarget || "custom" : m.target;
      lines.push(
        `- **${targetLabel}** : ${m.states.join(" · ")} · ${m.durationMs}ms · ${m.easing}${m.notes ? ` — ${m.notes}` : ""}`
      );
    }
    lines.push("");
  }

  if (state.latencyLogs.length > 0) {
    lines.push("## Latency SLO (Doherty 400ms)");
    lines.push("");
    for (const l of state.latencyLogs) {
      const ratio = l.sloTargetMs === 0 ? 0 : (l.p95Ms / l.sloTargetMs) * 100;
      lines.push(
        `- **${l.trigger}** : p50 ${l.p50Ms}ms · p95 ${l.p95Ms}ms · SLO ${l.sloTargetMs}ms (${ratio.toFixed(0)}% de la cible)`
      );
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère les 3 composants empty state en TSX »,"
  );
  lines.push(
    "« Écris le CSS des micro-interactions avec transitions Tailwind », « Crée le plan de tests pour ces états », etc.)*"
  );

  return lines.join("\n");
}
