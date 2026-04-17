import type { Project } from "@/lib/types";
import type { FoundationsState } from "../state";

// Brief pré-formaté à coller dans Claude/ChatGPT/Cursor pour générer
// user flows, wireframes, copy cohérents avec les fondations.
export function exportClaudeBrief(state: FoundationsState, project: Project): string {
  const lines: string[] = [];
  const primary =
    state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];

  lines.push(`# Brief — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu dois générer des livrables design (user flows, wireframes, copy, code UI) alignés"
  );
  lines.push(
    "STRICTEMENT sur ces fondations stratégiques. Ne jamais dévier, même si je te demande"
  );
  lines.push("un truc qui semble en contradiction — dans ce cas, remets-moi en cause.");
  lines.push("");

  lines.push("## Contexte produit");
  lines.push("");
  if (project.type) lines.push(`- **Type de projet** : ${project.type}`);
  if (project.description) lines.push(`- **Description** : ${project.description}`);
  if (project.north_star) lines.push(`- **North Star Metric** : ${project.north_star}`);
  lines.push("");

  lines.push("## Le job qu'on fait (JTBD Ulwick)");
  lines.push("");
  if (state.jtbdCore) {
    lines.push(`> ${state.jtbdCore}`);
  } else {
    lines.push("*(Pas encore défini.)*");
  }
  lines.push("");

  lines.push("## Persona cible principal");
  lines.push("");
  if (primary) {
    lines.push(
      `**${primary.avatarEmoji} ${primary.name}** (${primary.ageRange}, niveau tech ${primary.techLevel})`
    );
    if (primary.context) lines.push(`- Contexte : ${primary.context}`);
    if (primary.goals.length > 0) {
      lines.push(`- Ses goals : ${primary.goals.join(" · ")}`);
    }
    if (primary.frustrations.length > 0) {
      lines.push(`- Ses frustrations : ${primary.frustrations.join(" · ")}`);
    }
  } else {
    lines.push("*(Pas encore défini.)*");
  }
  lines.push("");

  if (state.jobStories.length > 0) {
    lines.push("## Situations d'usage (job stories Intercom)");
    lines.push("");
    for (const js of state.jobStories) {
      lines.push(`- **When** ${js.when} — **I want** ${js.iWant} — **So I can** ${js.soICan}`);
    }
    lines.push("");
  }

  lines.push("## Aha moment (l'événement qui active)");
  lines.push("");
  if (state.ahaMomentEvent && state.ahaMomentThreshold) {
    lines.push(`User a fait **${state.ahaMomentEvent}** ${state.ahaMomentThreshold}.`);
    lines.push(
      "⚠ Les user flows doivent mener à cet aha le plus vite possible. Optimise pour ça."
    );
  } else {
    lines.push("*(Pas encore défini.)*");
  }
  lines.push("");

  if (state.designPrinciples.length > 0) {
    lines.push("## Principes design (contraintes fortes)");
    lines.push("");
    lines.push(
      "Chaque décision UI/UX que tu proposes doit respecter ces principes. En cas de"
    );
    lines.push("conflit entre deux principes, privilégie celui listé en premier.");
    lines.push("");
    for (const p of state.designPrinciples) {
      lines.push(`- **${p.principle}**${p.rationale ? ` — ${p.rationale}` : ""}`);
    }
    lines.push("");
  }

  if (state.positioningStatement) {
    lines.push("## Positionnement");
    lines.push("");
    lines.push(`> ${state.positioningStatement}`);
    lines.push("");
    if (state.positioningUniqueAttributes.length > 0) {
      lines.push("Attributs uniques à mettre en avant :");
      for (const a of state.positioningUniqueAttributes) lines.push(`- ${a}`);
      lines.push("");
    }
  }

  if (state.antiGoals.length > 0) {
    lines.push("## Anti-goals (ce qu'il ne faut PAS faire)");
    lines.push("");
    for (const a of state.antiGoals) lines.push(`- ✗ ${a}`);
    lines.push("");
  }

  lines.push("## Mon besoin maintenant");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande concrète : « Génère-moi 3 user flows pour l'onboarding »,"
  );
  lines.push(
    "« Propose 5 variantes de copy pour le CTA principal », « Crée les wireframes de la page signup », etc.)*"
  );

  return lines.join("\n");
}
