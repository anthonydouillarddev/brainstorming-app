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

export function exportFlowsMd(state: FlowsState, project: Project): string {
  const lines: string[] = [];
  lines.push(`# Parcours utilisateur — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 4 Parcours utilisateur & flows");
  lines.push("");

  if (state.onboardingPattern) {
    const pat = PATTERNS.find((p) => p.key === state.onboardingPattern);
    lines.push("## 🎯 Pattern d'onboarding");
    lines.push("");
    lines.push(`**${pat?.emoji ?? ""} ${pat?.label ?? state.onboardingPattern}** — ${pat?.description ?? ""}`);
    lines.push("");
  }

  const nsaPreview = computeActivationMetric(state.northStarAction);
  if (nsaPreview) {
    lines.push("## ⭐ North Star Action");
    lines.push("");
    lines.push(`> ${nsaPreview}`);
    lines.push("");
  }

  if (state.steps.length > 0) {
    lines.push("## 🛣️ Étapes du parcours");
    lines.push("");
    state.steps.forEach((s, i) => {
      const aha = s.isAhaMoment ? " ⭐ **AHA MOMENT**" : "";
      const emoji = s.emotion ? EMOJI_BY_EMOTION[s.emotion] : "";
      lines.push(`${i + 1}. **${s.label || "(sans nom)"}** ${emoji}${aha}`);
      if (s.screen) lines.push(`   - Écran : \`${s.screen}\``);
      if (s.action) lines.push(`   - Action : ${s.action}`);
      const frictions: string[] = [];
      if (s.fields) frictions.push(`${s.fields} champs`);
      if (s.decisions) frictions.push(`${s.decisions} décisions`);
      if (s.modals) frictions.push(`${s.modals} modals`);
      if (frictions.length > 0) lines.push(`   - Friction : ${frictions.join(" · ")}`);
    });
    lines.push("");
  }

  const score = computeFrictionScore(state);
  if (state.steps.length > 0) {
    lines.push("## 📊 Friction score");
    lines.push("");
    lines.push(`**${score.total} (${score.level})**`);
    lines.push("");
    lines.push(
      `- Étapes : ${score.breakdown.steps} | Champs : ${score.breakdown.fields} | Décisions : ${score.breakdown.decisions} | Modals : ${score.breakdown.modals}`
    );
    lines.push("");
  }

  if (state.journeyPhases.length > 0) {
    lines.push("## 🗺️ Journey map");
    lines.push("");
    lines.push("| Phase | Actions | Émotion | Frictions |");
    lines.push("|---|---|---|---|");
    for (const p of state.journeyPhases) {
      lines.push(
        `| ${p.emoji} **${p.name}** | ${p.actions || "—"} | ${EMOJI_BY_EMOTION[p.emotion] ?? ""} | ${p.frictions.join(", ") || "—"} |`
      );
    }
    lines.push("");
  }

  if (state.branches.length > 0) {
    lines.push("## 🔀 Branches");
    lines.push("");
    for (const b of state.branches) {
      const from = state.steps.find((s) => s.id === b.fromStepId);
      const to = state.steps.find((s) => s.id === b.toStepId);
      lines.push(`- Depuis « ${from?.label ?? "?"} » si \`${b.condition}\` → « ${to?.label ?? "fin"} »`);
    }
    lines.push("");
  }

  if (state.emptyStates.length > 0) {
    lines.push("## 📭 Empty states");
    lines.push("");
    for (const es of state.emptyStates) {
      lines.push(`### ${es.screen || "Écran vide"}`);
      if (es.copy) lines.push(`Copy : ${es.copy}`);
      if (es.cta) lines.push(`CTA : **${es.cta}**`);
      lines.push("");
    }
  }

  if (state.aarrrMetrics.length > 0) {
    lines.push("## 📈 AARRR metrics");
    lines.push("");
    lines.push("| Stage | Metric | Target | Current |");
    lines.push("|---|---|---|---|");
    for (const m of state.aarrrMetrics) {
      lines.push(`| ${m.stage} | ${m.metric} | ${m.target} | ${m.current ?? "—"} |`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il génère les écrans, les copies d'onboarding, ou les events analytics à tracker.*"
  );
  return lines.join("\n");
}
