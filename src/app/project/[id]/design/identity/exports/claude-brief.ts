import type { Project } from "@/lib/types";
import type { IdentityState } from "../state";
import { ARCHETYPES } from "../archetypes";

function describeSliders(s: IdentityState["voiceSliders"]): string {
  const parts: string[] = [];
  parts.push(s.formalCasual > 60 ? "casual" : s.formalCasual < 40 ? "formel" : "neutre");
  if (s.seriousFunny > 60) parts.push("humoristique");
  else if (s.seriousFunny < 35) parts.push("sérieux");
  if (s.respectfulIrreverent > 65) parts.push("direct voire irrévérencieux");
  else if (s.respectfulIrreverent < 30) parts.push("très respectueux");
  if (s.matterOfFactEnthusiastic > 65) parts.push("enthousiaste");
  else if (s.matterOfFactEnthusiastic < 35) parts.push("factuel sans fioritures");
  return parts.join(", ");
}

export function exportClaudeBrief(state: IdentityState, project: Project): string {
  const archetype = state.archetypeKey
    ? ARCHETYPES.find((a) => a.key === state.archetypeKey)
    : null;
  const lines: string[] = [];

  lines.push(`# Brief voix & ton — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas écrire du copy (boutons, emails, messages d'erreur, empty states, notifications)"
  );
  lines.push(
    "**strictement dans ce ton**. Ne dévie pas — si je te demande du copy qui contredit ces règles,"
  );
  lines.push("remets-moi en cause.");
  lines.push("");

  lines.push("## Personnalité");
  lines.push("");
  if (archetype) {
    lines.push(`- **Archétype** : ${archetype.emoji} ${archetype.name} — ${archetype.tagline}`);
    lines.push(`- ${archetype.description}`);
  }
  lines.push(`- **Ton** : ${describeSliders(state.voiceSliders)}`);
  lines.push("");

  if (state.doWords.length > 0 || state.dontWords.length > 0) {
    lines.push("## Glossaire");
    lines.push("");
    if (state.doWords.length > 0) {
      lines.push(`**✓ On utilise** : ${state.doWords.join(", ")}`);
    }
    if (state.dontWords.length > 0) {
      lines.push(`**✗ On n'utilise jamais** : ${state.dontWords.join(", ")}`);
    }
    lines.push("");
  }

  if (state.brandPromise.trim()) {
    lines.push("## Promise");
    lines.push("");
    lines.push(`> ${state.brandPromise.trim()}`);
    lines.push("");
  }

  const filledRows = state.toneMatrix.filter((r) => r.tone.trim() || r.exampleDo.trim());
  if (filledRows.length > 0) {
    lines.push("## Ton par contexte (règles d'or)");
    lines.push("");
    for (const r of filledRows) {
      lines.push(`### ${r.contextEmoji} ${r.context}`);
      if (r.tone.trim()) lines.push(`- **Ton** : ${r.tone}`);
      if (r.exampleDo.trim()) lines.push(`- ✓ **Comme ça** : « ${r.exampleDo} »`);
      if (r.exampleDont.trim()) lines.push(`- ✗ **Jamais comme ça** : « ${r.exampleDont} »`);
      lines.push("");
    }
  }

  if (state.references.length > 0) {
    lines.push("## Marques à imiter en voix");
    lines.push("");
    for (const r of state.references) {
      lines.push(`- **${r.name}**${r.why ? ` — ${r.why}` : ""}`);
    }
    lines.push("");
  }
  if (state.antiReferences.length > 0) {
    lines.push("## Marques à NE PAS imiter");
    lines.push("");
    for (const r of state.antiReferences) {
      lines.push(`- **${r.name}**${r.why ? ` — ${r.why}` : ""}`);
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Écris 5 variantes de copy pour le bouton principal »,"
  );
  lines.push(
    "« Rédige le message d'erreur 404 », « Génère un email de bienvenue », « Propose 3 titres pour la homepage », etc.)*"
  );

  return lines.join("\n");
}
