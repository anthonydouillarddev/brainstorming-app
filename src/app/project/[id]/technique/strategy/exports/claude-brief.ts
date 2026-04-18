import type { StrategyState } from "../state";

// Génère un prompt Claude prêt à coller dans une nouvelle session,
// pour implémenter l'architecture décrite dans la stratégie technique.

export function exportStrategyClaudeBrief(
  state: StrategyState,
  projectName: string
): string {
  const lines: string[] = [];

  lines.push(`# Brief Claude — Stratégie technique pour ${projectName}`);
  lines.push("");
  lines.push("Tu es un architecte SaaS senior. Voici la stratégie technique cadrée.");
  lines.push("Aide-moi à (1) valider les choix, (2) identifier les angles morts, (3) proposer une roadmap d'implémentation M0-M3.");
  lines.push("");

  lines.push("## Contraintes");
  if (state.budget) lines.push(`- Budget : ${state.budget}`);
  if (state.ttm) lines.push(`- TTM : ${state.ttm}`);
  if (state.teamSize) lines.push(`- Équipe : ${state.teamSize}`);
  if (state.operationalBurden) lines.push(`- Ops burden : ${state.operationalBurden}`);
  if (state.lockInTolerance) lines.push(`- Lock-in : ${state.lockInTolerance}`);
  lines.push("");

  lines.push("## Objectifs");
  if (state.coreMetric) lines.push(`- Métrique succès : ${state.coreMetric}`);
  if (state.scaleHorizonUsers) {
    lines.push(
      `- Scale : ${state.scaleHorizonUsers}${
        state.scaleHorizonMonths ? ` dans ${state.scaleHorizonMonths} mois` : ""
      }`
    );
  }
  if (state.nonNegotiables) lines.push(`- Non-négociables : ${state.nonNegotiables}`);
  if (state.acceptableTradeoffs) lines.push(`- Trade-offs acceptés : ${state.acceptableTradeoffs}`);
  lines.push("");

  const filledDrivers = state.drivers.filter((d) => d.reason.trim().length > 0);
  if (filledDrivers.length > 0) {
    lines.push("## Drivers prioritaires");
    for (const d of filledDrivers.sort((a, b) => b.importance - a.importance)) {
      lines.push(`- ${d.name} (${d.importance}/5) — ${d.reason}`);
    }
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
    lines.push("## Stack choisie");
    for (const [k, v] of stackEntries) {
      lines.push(`- ${k} : ${v}`);
    }
    lines.push("");
  }

  if (state.keyRationale) {
    lines.push(`**Rationale** : ${state.keyRationale}`);
    lines.push("");
  }

  if (state.risks.length > 0) {
    lines.push("## Hypothèses risquées à valider");
    for (const r of state.risks) {
      lines.push(
        `- ${r.title} (proba: ${r.probability}, impact: ${r.impact}) → test : ${r.validationTest}${
          r.deadline ? ` (deadline ${r.deadline})` : ""
        }`
      );
    }
    lines.push("");
  }

  lines.push("## Ce que je te demande");
  lines.push("1. Valide ou challenge la stack ci-dessus vs les contraintes.");
  lines.push("2. Génère un diagramme Mermaid C4 Containers.");
  lines.push("3. Propose une checklist \"Go live MVP\" (prioritaire vs nice-to-have).");
  lines.push("4. Identifie 3 pièges courants avec cette stack et comment les éviter.");
  lines.push("5. Donne-moi 3 tâches concrètes à attaquer cette semaine.");

  return lines.join("\n");
}
