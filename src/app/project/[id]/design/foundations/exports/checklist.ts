import type { Project } from "@/lib/types";
import type { FoundationsState } from "../state";

// Checklist de 10 questions à se poser AVANT chaque décision design future.
// À imprimer / épingler au-dessus du bureau.
export function exportFoundationsChecklist(
  state: FoundationsState,
  project: Project
): string {
  const lines: string[] = [];
  const primary =
    state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];

  const personaName = primary?.name || "[persona principal]";
  const jtbd = state.jtbdCore.trim() || "[JTBD principal]";
  const principle1 =
    state.designPrinciples.find((p) => p.principle.includes(">"))?.principle ||
    "[principe #1]";
  const ahaEvent = state.ahaMomentEvent || "[aha action]";

  lines.push(`# Checklist de décision — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Avant chaque décision design, feature, copy ou UI, passe ces 10 questions. Si tu"
  );
  lines.push(
    "coches moins de 7/10, la décision n'est probablement pas alignée sur ta stratégie."
  );
  lines.push("");

  const questions = [
    `1. Est-ce que ça aide **${personaName}** à accomplir son job *« ${jtbd} »* ?`,
    `2. Est-ce que ça respecte le principe **${principle1}** ?`,
    `3. Est-ce que ça rapproche l'user de l'aha moment (*${ahaEvent}*) ?`,
    state.antiGoals.length > 0
      ? `4. Est-ce que ça viole un de mes **${state.antiGoals.length} anti-goal(s)** ?`
      : `4. Est-ce que ça colle à mon **périmètre produit** (ou ça le dilue) ?`,
    `5. Est-ce que ça ajoute de la **friction** dans un parcours existant ?`,
    `6. Est-ce qu'un **user plus junior** que ${personaName} comprend toujours ?`,
    `7. Est-ce qu'un concurrent le fait déjà **mieux** — et si oui, suis-je différenciant ?`,
    `8. Est-ce que je peux **mesurer** l'impact ? (sinon c'est invérifiable)`,
    `9. Est-ce que ça respecte l'**accessibilité WCAG 2.2 AA** minimum ?`,
    `10. Si je dois **revenir en arrière** dans 3 mois, c'est réversible ?`,
  ];
  for (const q of questions) lines.push(`- [ ] ${q}`);

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(
    "*Généré par Mindeck. Tu peux imprimer ce document en A4 pour l'épingler à ton bureau.*"
  );
  lines.push("");

  // Rappel des fondations
  lines.push("## Rappel des fondations");
  lines.push("");
  lines.push(`**🎯 JTBD** : ${jtbd}`);
  if (primary) {
    lines.push(`**🧑 Persona** : ${primary.avatarEmoji} ${primary.name} — ${primary.context || "(contexte non renseigné)"}`);
  }
  if (state.ahaMomentEvent && state.ahaMomentThreshold) {
    lines.push(`**💡 Aha** : ${state.ahaMomentEvent} ${state.ahaMomentThreshold}`);
  }
  if (state.designPrinciples.length > 0) {
    lines.push("**🧭 Principes** :");
    for (const p of state.designPrinciples) {
      lines.push(`  - ${p.principle}`);
    }
  }

  return lines.join("\n");
}
