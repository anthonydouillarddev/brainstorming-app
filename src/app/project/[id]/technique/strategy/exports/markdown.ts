import type { StrategyState } from "../state";

const BUDGET_LABEL: Record<string, string> = {
  free: "Gratuit uniquement",
  lt50: "< 50€/mois",
  lt200: "< 200€/mois",
  lt1000: "< 1000€/mois",
  unlimited: "Illimité",
};

const TTM_LABEL: Record<string, string> = {
  critical: "Critique (< 3 mois)",
  important: "Important (3-6 mois)",
  normal: "Normal (6-12 mois)",
  flex: "Flexible",
};

const TEAM_LABEL: Record<string, string> = {
  solo: "Solo",
  "2-3": "2-3 devs",
  "4-10": "4-10 devs",
  "10+": "10+ devs",
};

const OPS_LABEL: Record<string, string> = {
  zero: "Zéro (platform-as-service)",
  minimal: "Minimal (managed services)",
  acceptable: "Acceptable (self-service ops)",
  high: "Élevé (complexe OK)",
};

const LOCKIN_LABEL: Record<string, string> = {
  critical: "Critique d'éviter",
  acceptable: "Acceptable avec raison",
  none: "Pas une préoccupation",
};

const SCALE_LABEL: Record<string, string> = {
  "100": "100 users",
  "1k": "1 000 users",
  "10k": "10 000 users",
  "100k": "100 000 users",
  "1m": "1M+ users",
  unknown: "Inconnu",
};

export function exportStrategyMarkdown(
  state: StrategyState,
  projectName: string
): string {
  const lines: string[] = [];
  lines.push(`# 🎯 Stratégie technique — ${projectName}`);
  lines.push("");
  lines.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  lines.push("");

  // Bloc 1 — Contraintes
  lines.push("## 📌 Contraintes");
  lines.push(`- **Budget** : ${BUDGET_LABEL[state.budget] ?? "—"}`);
  lines.push(`- **Time-to-market** : ${TTM_LABEL[state.ttm] ?? "—"}`);
  lines.push(`- **Équipe** : ${TEAM_LABEL[state.teamSize] ?? "—"}`);
  lines.push(`- **Ops burden** : ${OPS_LABEL[state.operationalBurden] ?? "—"}`);
  lines.push(`- **Lock-in tolerance** : ${LOCKIN_LABEL[state.lockInTolerance] ?? "—"}`);
  lines.push("");

  // Bloc 2 — Objectifs
  lines.push("## 🎯 Objectifs métier");
  if (state.coreMetric) lines.push(`- **Métrique de succès** : ${state.coreMetric}`);
  if (state.scaleHorizonUsers) {
    lines.push(
      `- **Scale cible** : ${SCALE_LABEL[state.scaleHorizonUsers] ?? "—"}${
        state.scaleHorizonMonths ? ` dans ${state.scaleHorizonMonths} mois` : ""
      }`
    );
  }
  if (state.nonNegotiables) lines.push(`- **Non-négociables** : ${state.nonNegotiables}`);
  if (state.acceptableTradeoffs) lines.push(`- **Trade-offs acceptés** : ${state.acceptableTradeoffs}`);
  lines.push("");

  // Bloc 3 — Drivers
  const filledDrivers = state.drivers.filter((d) => d.reason.trim().length > 0);
  if (filledDrivers.length > 0) {
    lines.push("## ⚖️ Drivers de décision");
    lines.push("| Critère | Importance | Raison | Impact |");
    lines.push("|---|---|---|---|");
    for (const d of filledDrivers) {
      lines.push(`| ${d.name} | ${d.importance}/5 | ${d.reason} | ${d.impact || "—"} |`);
    }
    lines.push("");
  }

  // Bloc 4 — Risques
  if (state.risks.length > 0) {
    lines.push("## ⚠️ Hypothèses risquées");
    lines.push("| Risque | Proba | Impact | Test de validation | Deadline |");
    lines.push("|---|---|---|---|---|");
    for (const r of state.risks) {
      lines.push(
        `| ${r.title} | ${r.probability} | ${r.impact} | ${r.validationTest} | ${r.deadline || "—"} |`
      );
    }
    lines.push("");
  }

  // Bloc 5 — Décision
  lines.push("## 🧭 Décision (ADR léger)");
  if (state.decisionContext) {
    lines.push(`**Contexte** : ${state.decisionContext}`);
    lines.push("");
  }
  if (state.optionsEvaluated) {
    lines.push(`**Options évaluées** : ${state.optionsEvaluated}`);
    lines.push("");
  }

  const stackEntries: [string, string][] = [
    ["Frontend", state.stackFrontend],
    ["Backend", state.stackBackend],
    ["Database", state.stackDatabase],
    ["Auth", state.stackAuth],
    ["Hosting", state.stackHosting],
    ["Paiements", state.stackPayments],
    ["Email", state.stackEmail],
    ["IA", state.stackAi],
    ["Monitoring", state.stackMonitoring],
  ].filter(([, v]) => v.trim().length > 0) as [string, string][];

  if (stackEntries.length > 0) {
    lines.push("**Stack choisie** :");
    for (const [k, v] of stackEntries) {
      lines.push(`- ${k} : ${v}`);
    }
    lines.push("");
  }

  if (state.keyRationale) {
    lines.push(`**Rationale** : ${state.keyRationale}`);
    lines.push("");
  }
  if (state.alternativesDismissed) {
    lines.push(`**Alternatives écartées** : ${state.alternativesDismissed}`);
    lines.push("");
  }
  if (state.linkedAdrId) {
    lines.push(`_Lié à l'ADR \`${state.linkedAdrId}\` dans l'onglet Décisions._`);
    lines.push("");
  }

  return lines.join("\n");
}
