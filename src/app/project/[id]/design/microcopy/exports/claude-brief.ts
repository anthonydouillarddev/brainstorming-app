import type { Project } from "@/lib/types";
import type { MicrocopyState } from "../state";
import {
  CTA_VARIANT_META,
  FIELD_KIND_META,
  PLACEMENT_META,
  SYSTEM_MESSAGE_META,
  TONE_META,
  VOICE_CONTEXT_META,
} from "../state";

export function exportMicrocopyClaudeBrief(
  state: MicrocopyState,
  project: Project
): string {
  const lines: string[] = [];

  lines.push(`# Brief microcopy — ${project.official_name || project.name}`);
  lines.push("");
  lines.push(
    "Tu vas produire du copy UI en FR. Respecte STRICTEMENT le glossaire (do/don't),"
  );
  lines.push(
    "le ton par contexte, et les règles par type de composant. Jamais d'anglicisme interdit."
  );
  lines.push("");

  if (state.glossary.length > 0) {
    const dos = state.glossary.filter((g) => g.status === "do");
    const donts = state.glossary.filter((g) => g.status === "dont");

    if (dos.length > 0) {
      lines.push("## Glossaire — À utiliser");
      lines.push("");
      for (const g of dos) {
        lines.push(`- « ${g.userFacingFr} »${g.context ? ` — ${g.context}` : ""}`);
      }
      lines.push("");
    }

    if (donts.length > 0) {
      lines.push("## Glossaire — À éviter");
      lines.push("");
      for (const g of donts) {
        lines.push(
          `- ~~« ${g.userFacingFr} »~~${g.alternative ? ` → préférer « ${g.alternative} »` : ""}`
        );
      }
      lines.push("");
    }
  }

  if (state.ctas.length > 0) {
    lines.push("## CTA library (respecter variant + ton)");
    lines.push("");
    for (const c of state.ctas) {
      const vmeta = CTA_VARIANT_META[c.variant];
      const tmeta = TONE_META[c.tone];
      lines.push(
        `- **${vmeta.label}** [${tmeta.label}] — « ${c.label} »${c.context ? ` · ${c.context}` : ""}`
      );
      if (c.loadingLabel) lines.push(`  - Loading : « ${c.loadingLabel} »`);
      if (c.successLabel) lines.push(`  - Success : « ${c.successLabel} »`);
    }
    lines.push("");
  }

  if (state.formFields.length > 0) {
    lines.push("## Form microcopy");
    lines.push("");
    for (const f of state.formFields) {
      const meta = FIELD_KIND_META[f.kind];
      lines.push(`### ${meta.label} — \`${f.fieldName}\``);
      lines.push(`- Label : « ${f.label} »`);
      if (f.placeholder) lines.push(`- Placeholder : « ${f.placeholder} »`);
      if (f.helperText) lines.push(`- Helper : « ${f.helperText} »`);
      if (f.errorRequired) lines.push(`- Error required : « ${f.errorRequired} »`);
      if (f.errorInvalid) lines.push(`- Error invalid : « ${f.errorInvalid} »`);
      lines.push("");
    }
  }

  if (state.systemMessages.length > 0) {
    lines.push("## System messages");
    lines.push("");
    for (const m of state.systemMessages) {
      const meta = SYSTEM_MESSAGE_META[m.kind];
      lines.push(`### ${meta.label} — ${m.trigger}`);
      lines.push(`- Ton : ${TONE_META[m.tone].label}`);
      if (m.title) lines.push(`- Titre : « ${m.title} »`);
      if (m.body) lines.push(`- Body : « ${m.body} »`);
      if (m.primaryLabel) lines.push(`- CTA primaire : « ${m.primaryLabel} »`);
      if (m.secondaryLabel) lines.push(`- CTA secondaire : « ${m.secondaryLabel} »`);
      lines.push(`- Règle : ${meta.tip}`);
      lines.push("");
    }
  }

  if (state.voiceTones.length > 0) {
    lines.push("## Voice & Tone matrix (respecter le ton par contexte)");
    lines.push("");
    for (const v of state.voiceTones) {
      const cmeta = VOICE_CONTEXT_META[v.context];
      const tmeta = TONE_META[v.tone];
      lines.push(
        `### ${cmeta.label} — ton ${tmeta.label}${v.principle ? ` (${v.principle})` : ""}`
      );
      if (v.doExample) lines.push(`- ✅ « ${v.doExample} »`);
      if (v.dontExample) lines.push(`- 🚫 « ${v.dontExample} »`);
      lines.push("");
    }
  }

  if (state.lengthBudgets.length > 0) {
    lines.push("## Length budgets (ne pas dépasser)");
    lines.push("");
    for (const b of state.lengthBudgets) {
      const pmeta = PLACEMENT_META[b.placement];
      lines.push(
        `- **${pmeta.label}** : max ${b.maxChars} caractères${b.reason ? ` — ${b.reason}` : ""}`
      );
    }
    lines.push("");
  }

  if (state.variantSets.length > 0) {
    lines.push("## Copy variants (A/B — inspiration)");
    lines.push("");
    for (const s of state.variantSets) {
      const pmeta = PLACEMENT_META[s.placement];
      lines.push(`### ${pmeta.label} — ${s.context}`);
      lines.push(`- A (baseline) : « ${s.baseline} »`);
      s.variants.forEach((v, i) => {
        const key = String.fromCharCode(66 + i);
        lines.push(`- ${key} : « ${v.text} »${v.rationale ? ` — ${v.rationale}` : ""}`);
      });
      if (s.hypothesis) lines.push(`- Hypothèse : ${s.hypothesis}`);
      lines.push("");
    }
  }

  if (state.glossary.length > 0) {
    lines.push("## Cohérence");
    lines.push("");
    lines.push(
      "Même action → même mot partout. Si tu proposes plusieurs variantes, indique clairement celle qui reste canonique."
    );
    lines.push("");
  }

  if (state.inclusiveChecks.length > 0) {
    lines.push("## Inclusive language (règles validées à respecter)");
    lines.push("");
    for (const c of state.inclusiveChecks) {
      if (c.status === "pass" || c.status === "warn") {
        lines.push(`- ${c.rule}${c.note ? ` · ${c.note}` : ""}`);
      }
    }
    lines.push("");
  }

  lines.push("## Ma demande");
  lines.push("");
  lines.push(
    "*(Remplace cette ligne par ta demande : « Génère 5 variantes de CTA pour un formulaire signup »,"
  );
  lines.push(
    "« Écris le microcopy du wizard d'onboarding en 3 étapes », « Liste 10 tooltips pour expliquer ICE scoring », etc.)*"
  );

  return lines.join("\n");
}
