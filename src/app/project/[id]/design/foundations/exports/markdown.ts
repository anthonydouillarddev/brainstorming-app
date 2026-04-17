import type { Project } from "@/lib/types";
import type { FoundationsState } from "../state";

export function exportFoundationsMd(
  state: FoundationsState,
  project: Project
): string {
  const lines: string[] = [];
  lines.push(`# Fondations — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 1 Fondations stratégiques");
  lines.push("");

  // Contexte projet
  lines.push("## Contexte projet");
  lines.push("");
  if (project.type) lines.push(`- **Type** : ${project.type}`);
  if (project.description) lines.push(`- **Description** : ${project.description}`);
  if (project.north_star) lines.push(`- **North Star** : ${project.north_star}`);
  lines.push("");

  // JTBD
  lines.push("## 🎯 Job-to-be-Done");
  lines.push("");
  if (state.jtbdCore.trim()) {
    lines.push(`> ${state.jtbdCore.trim()}`);
  } else {
    lines.push("*Pas encore défini.*");
  }
  if (state.jtbdEmotional.length > 0) {
    lines.push("");
    lines.push("### Jobs émotionnels");
    state.jtbdEmotional.forEach((j) => lines.push(`- ${j}`));
  }
  if (state.jtbdSocial.length > 0) {
    lines.push("");
    lines.push("### Jobs sociaux");
    state.jtbdSocial.forEach((j) => lines.push(`- ${j}`));
  }
  lines.push("");

  // Persona
  lines.push("## 🧑 Persona principal");
  lines.push("");
  const primary =
    state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];
  if (primary) {
    lines.push(
      `**${primary.avatarEmoji} ${primary.name || "(sans nom)"}** — ${
        primary.ageRange || "âge non renseigné"
      } · niveau tech ${primary.techLevel}`
    );
    if (primary.context) {
      lines.push("");
      lines.push(`*Contexte :* ${primary.context}`);
    }
    if (primary.goals.length > 0) {
      lines.push("");
      lines.push("**🎯 Goals**");
      primary.goals.forEach((g) => lines.push(`- ${g}`));
    }
    if (primary.frustrations.length > 0) {
      lines.push("");
      lines.push("**😤 Frustrations**");
      primary.frustrations.forEach((f) => lines.push(`- ${f}`));
    }
    if (state.personas.length > 1) {
      lines.push("");
      lines.push(
        `*Personas secondaires : ${state.personas
          .filter((p) => p.id !== primary.id)
          .map((p) => `${p.avatarEmoji} ${p.name || "(sans nom)"}`)
          .join(", ")}*`
      );
    }
  } else {
    lines.push("*Pas encore défini.*");
  }
  lines.push("");

  // Aha moment
  lines.push("## 💡 Aha moment");
  lines.push("");
  if (state.ahaMomentEvent.trim() || state.ahaMomentThreshold.trim()) {
    lines.push(
      `User a fait **${state.ahaMomentEvent || "[action]"}** ${
        state.ahaMomentThreshold || "[seuil]"
      }.`
    );
  } else {
    lines.push("*Pas encore défini.*");
  }
  lines.push("");

  // Principes
  lines.push("## 🧭 Principes design");
  lines.push("");
  if (state.designPrinciples.length > 0) {
    state.designPrinciples.forEach((p, i) => {
      lines.push(
        `${i + 1}. **${p.principle || "[principe]"}**${
          p.rationale ? ` — ${p.rationale}` : ""
        }`
      );
    });
  } else {
    lines.push("*Pas encore défini.*");
  }
  lines.push("");

  // Job stories (si V2)
  if (state.jobStories.length > 0) {
    lines.push("## 📖 Job stories");
    lines.push("");
    state.jobStories.forEach((js) => {
      lines.push(`- **When** ${js.when} — **I want** ${js.iWant} — **So I can** ${js.soICan}`);
    });
    lines.push("");
  }

  // Positioning (si V2)
  if (state.positioningStatement.trim()) {
    lines.push("## 🎯 Positionnement (Dunford)");
    lines.push("");
    lines.push(`> ${state.positioningStatement.trim()}`);
    if (state.positioningAlternatives.length > 0) {
      lines.push("");
      lines.push("**Alternatives concurrentielles**");
      state.positioningAlternatives.forEach((a) => lines.push(`- ${a}`));
    }
    if (state.positioningUniqueAttributes.length > 0) {
      lines.push("");
      lines.push("**Attributs uniques**");
      state.positioningUniqueAttributes.forEach((a) => lines.push(`- ${a}`));
    }
    lines.push("");
  }

  // Anti-goals (si V2)
  if (state.antiGoals.length > 0) {
    lines.push("## 🚫 Anti-goals");
    lines.push("");
    state.antiGoals.forEach((a) => lines.push(`- ${a}`));
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il génère des user flows, wireframes ou copy cohérents avec ces fondations.*"
  );

  return lines.join("\n");
}
