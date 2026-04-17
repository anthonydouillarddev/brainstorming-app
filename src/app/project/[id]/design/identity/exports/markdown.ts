import type { Project } from "@/lib/types";
import type { IdentityState } from "../state";
import { ARCHETYPES } from "../archetypes";

export function exportIdentityMd(state: IdentityState, project: Project): string {
  const lines: string[] = [];
  const archetype = state.archetypeKey
    ? ARCHETYPES.find((a) => a.key === state.archetypeKey)
    : null;

  lines.push(`# Brand Card — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 2 Identité de marque & ton");
  lines.push("");

  lines.push("## 🎭 Archétype");
  lines.push("");
  if (archetype) {
    lines.push(`**${archetype.emoji} ${archetype.name}** — ${archetype.tagline}`);
    lines.push("");
    lines.push(archetype.description);
    lines.push("");
    lines.push(`*Références inspirantes : ${archetype.examples.join(", ")}*`);
  } else {
    lines.push("*Pas encore choisi.*");
  }
  lines.push("");

  lines.push("## 🎚️ Sliders de voix");
  lines.push("");
  const s = state.voiceSliders;
  lines.push(`| Axe | Position |`);
  lines.push(`|---|---|`);
  lines.push(`| Formel ↔ Casual | ${s.formalCasual}% |`);
  lines.push(`| Sérieux ↔ Drôle | ${s.seriousFunny}% |`);
  lines.push(`| Respectueux ↔ Irrévérencieux | ${s.respectfulIrreverent}% |`);
  lines.push(`| Factuel ↔ Enthousiaste | ${s.matterOfFactEnthusiastic}% |`);
  lines.push(`| Technique ↔ Grand public | ${s.technicalGeneral}% |`);
  lines.push(`| Chaleureux ↔ Distant | ${s.warmDistant}% |`);
  lines.push(`| Humble ↔ Ambitieux | ${s.humbleAmbitious}% |`);
  lines.push("");

  lines.push("## 📝 Glossaire");
  lines.push("");
  if (state.doWords.length > 0) {
    lines.push("**✓ On dit**");
    state.doWords.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }
  if (state.dontWords.length > 0) {
    lines.push("**✗ On ne dit jamais**");
    state.dontWords.forEach((w) => lines.push(`- ${w}`));
    lines.push("");
  }

  lines.push("## 🎁 Brand promise");
  lines.push("");
  if (state.brandPromise.trim()) {
    lines.push(`> ${state.brandPromise.trim()}`);
  } else {
    lines.push("*Pas encore définie.*");
  }
  lines.push("");

  lines.push("## 💬 Tone matrix");
  lines.push("");
  const filledRows = state.toneMatrix.filter((r) => r.tone.trim() || r.exampleDo.trim());
  if (filledRows.length > 0) {
    for (const row of filledRows) {
      lines.push(`### ${row.contextEmoji} ${row.context}`);
      if (row.tone.trim()) lines.push(`**Ton** : ${row.tone}`);
      if (row.exampleDo.trim()) lines.push(`✓ *${row.exampleDo}*`);
      if (row.exampleDont.trim()) lines.push(`✗ ~~${row.exampleDont}~~`);
      lines.push("");
    }
  } else {
    lines.push("*Aucun contexte défini.*");
    lines.push("");
  }

  // V2 refs
  if (state.references.length > 0 || state.antiReferences.length > 0) {
    lines.push("## 🔖 Références");
    lines.push("");
    if (state.references.length > 0) {
      lines.push("**👍 Inspirations**");
      state.references.forEach((r) => {
        lines.push(`- **${r.name}**${r.why ? ` — ${r.why}` : ""}`);
      });
      lines.push("");
    }
    if (state.antiReferences.length > 0) {
      lines.push("**👎 Anti-références**");
      state.antiReferences.forEach((r) => {
        lines.push(`- **${r.name}**${r.why ? ` — ${r.why}` : ""}`);
      });
      lines.push("");
    }
  }

  if (state.moodKeywords.length > 0) {
    lines.push("## 🌿 Mood");
    lines.push("");
    lines.push(state.moodKeywords.join(" · "));
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour qu'il écrive du copy / des emails / des messages d'erreur dans ton ton exact.*"
  );

  return lines.join("\n");
}
