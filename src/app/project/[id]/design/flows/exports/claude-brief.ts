import type { Project } from "@/lib/types";
import type { FlowsState } from "../state";
import { computeActivationMetric, computeFrictionScore } from "../state";
import { PATTERNS } from "../templates";

const EMOJI_BY_EMOTION: Record<number, string> = {
  1: "😡",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

export function exportFlowsClaudeBrief(state: FlowsState, project: Project): string {
  const lines: string[] = [];
  const pattern = state.onboardingPattern
    ? PATTERNS.find((p) => p.key === state.onboardingPattern)
    : null;
  const nsaPreview = computeActivationMetric(state.northStarAction);
  const friction = computeFrictionScore(state);

  lines.push(`# Brief parcours — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas générer des livrables onboarding (écrans, copies, events analytics, empty states,"
  );
  lines.push("recovery flows) strictement alignés sur ce parcours. Ne propose pas d'étapes en plus —");
  lines.push("chaque étape supplémentaire coûte ~10-20% de completion rate (Baymard).");
  lines.push("");

  if (project.type) lines.push(`- **Type projet** : ${project.type}`);
  lines.push("");

  if (pattern) {
    lines.push("## Pattern d'onboarding");
    lines.push("");
    lines.push(`**${pattern.emoji} ${pattern.label}** — ${pattern.description}`);
    lines.push(`Best for : ${pattern.bestFor}`);
    lines.push("");
  }

  if (nsaPreview) {
    lines.push("## North Star Action (activation metric)");
    lines.push("");
    lines.push(`> ${nsaPreview}`);
    lines.push("");
    lines.push("Chaque décision d'onboarding doit rapprocher l'user de cette action.");
    lines.push("");
  }

  if (state.steps.length > 0) {
    lines.push("## Parcours (happy path)");
    lines.push("");
    state.steps.forEach((s, i) => {
      const aha = s.isAhaMoment ? " ⭐ **AHA**" : "";
      const emoji = s.emotion ? EMOJI_BY_EMOTION[s.emotion] : "";
      lines.push(`${i + 1}. **${s.label || "(sans nom)"}** ${emoji}${aha}`);
      if (s.action) lines.push(`   - Action user : ${s.action}`);
      if (s.screen) lines.push(`   - Écran : \`${s.screen}\``);
    });
    lines.push("");
  }

  if (state.branches.length > 0) {
    lines.push("## Edge cases (branches)");
    lines.push("");
    for (const b of state.branches) {
      const from = state.steps.find((s) => s.id === b.fromStepId);
      const to = state.steps.find((s) => s.id === b.toStepId);
      lines.push(
        `- Depuis « ${from?.label ?? "?"} » : si \`${b.condition}\` → « ${to?.label ?? "fin/recovery"} »`
      );
    }
    lines.push("");
  }

  if (state.emptyStates.length > 0) {
    lines.push("## Empty states à implémenter");
    lines.push("");
    for (const es of state.emptyStates) {
      lines.push(`- **${es.screen}** : copy « ${es.copy} » · CTA « ${es.cta} »`);
    }
    lines.push("");
  }

  lines.push("## Contraintes");
  lines.push("");
  lines.push(`- Friction score actuel : ${friction.total} (${friction.level})`);
  lines.push(`- ≤ 5 étapes avant value delivery`);
  lines.push(`- ≤ 3 champs au signup`);
  lines.push(`- Permissions APRÈS la value (Apple HIG)`);
  lines.push(`- Aucune modal intrusive avant le 1er écran utile`);
  lines.push("");

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère le copy des 5 écrans d'onboarding »,"
  );
  lines.push(
    "« Liste les events analytics à tracker pour mesurer l'activation », « Propose 3 recovery flows pour les edge cases », etc.)*"
  );

  return lines.join("\n");
}
