import type { Project } from "@/lib/types";
import type { MicrocopyState } from "../state";
import {
  CHECK_STATUS_META,
  CTA_VARIANT_META,
  FIELD_KIND_META,
  GLOSSARY_STATUS_META,
  INCLUSIVE_AXIS_META,
  PLACEMENT_META,
  SYSTEM_MESSAGE_META,
  TONE_META,
  VOICE_CONTEXT_META,
} from "../state";

export function exportMicrocopyMd(state: MicrocopyState, project: Project): string {
  const lines: string[] = [];
  lines.push(`# Microcopy — ${project.official_name || project.name}`);
  lines.push("");
  lines.push("> Généré par Mindeck · Chap. 9 Microcopy");
  lines.push("");

  // CTA
  if (state.ctas.length > 0) {
    lines.push("## 🎯 CTA library");
    lines.push("");
    lines.push("| Variant | Context | Label | Loading | Success | Ton |");
    lines.push("|---|---|---|---|---|---|");
    for (const c of state.ctas) {
      lines.push(
        `| ${CTA_VARIANT_META[c.variant].emoji} ${c.variant} | ${c.context || "–"} | **${c.label}** | ${c.loadingLabel || "–"} | ${c.successLabel || "–"} | ${TONE_META[c.tone].label} |`
      );
    }
    lines.push("");
  }

  // Form fields
  if (state.formFields.length > 0) {
    lines.push("## 📝 Form microcopy");
    lines.push("");
    for (const f of state.formFields) {
      const meta = FIELD_KIND_META[f.kind];
      lines.push(`### ${meta.emoji} ${f.fieldName || "(sans nom)"} — ${meta.label}`);
      lines.push("");
      lines.push(`- **Label** : ${f.label}`);
      if (f.placeholder) lines.push(`- **Placeholder** : ${f.placeholder}`);
      if (f.helperText) lines.push(`- **Helper** : ${f.helperText}`);
      if (f.errorRequired) lines.push(`- **Error required** : ${f.errorRequired}`);
      if (f.errorInvalid) lines.push(`- **Error invalid** : ${f.errorInvalid}`);
      if (f.notes) lines.push(`- **Notes** : ${f.notes}`);
      lines.push("");
    }
  }

  // System messages
  if (state.systemMessages.length > 0) {
    lines.push("## 💬 System messages");
    lines.push("");
    for (const m of state.systemMessages) {
      const meta = SYSTEM_MESSAGE_META[m.kind];
      lines.push(`### ${meta.emoji} ${meta.label} — ${m.trigger || "(sans trigger)"}`);
      lines.push("");
      if (m.title) lines.push(`> **${m.title}**`);
      if (m.body) {
        lines.push(">");
        lines.push(`> ${m.body}`);
      }
      lines.push("");
      if (m.primaryLabel || m.secondaryLabel) {
        const ctas = [m.primaryLabel, m.secondaryLabel].filter(Boolean).join(" · ");
        lines.push(`- **CTA** : ${ctas}`);
      }
      lines.push(`- **Ton** : ${TONE_META[m.tone].emoji} ${TONE_META[m.tone].label}`);
      lines.push(`- **Règle** : ${meta.tip}`);
      if (m.notes) lines.push(`- **Notes** : ${m.notes}`);
      lines.push("");
    }
  }

  // Glossary
  if (state.glossary.length > 0) {
    lines.push("## 📚 Glossaire FR");
    lines.push("");
    lines.push("| Statut | Terme | FR UI | Alternative | Contexte |");
    lines.push("|---|---|---|---|---|");
    for (const g of state.glossary) {
      const meta = GLOSSARY_STATUS_META[g.status];
      lines.push(
        `| ${meta.emoji} ${meta.label} | \`${g.term}\` | **${g.userFacingFr}** | ${g.alternative || "–"} | ${g.context || "–"} |`
      );
    }
    lines.push("");
  }

  // Voice & Tone matrix (V2)
  if (state.voiceTones.length > 0) {
    lines.push("## 🎭 Voice & Tone matrix");
    lines.push("");
    lines.push("| Contexte | Ton | Principe | ✅ À faire | 🚫 À éviter |");
    lines.push("|---|---|---|---|---|");
    for (const v of state.voiceTones) {
      const cmeta = VOICE_CONTEXT_META[v.context];
      const tmeta = TONE_META[v.tone];
      lines.push(
        `| ${cmeta.emoji} ${cmeta.label} | ${tmeta.emoji} ${tmeta.label} | ${v.principle || "–"} | ${v.doExample || "–"} | ${v.dontExample || "–"} |`
      );
    }
    lines.push("");
  }

  // Copy variants (V2)
  if (state.variantSets.length > 0) {
    lines.push("## 🔀 Copy variants (A/B)");
    lines.push("");
    for (const s of state.variantSets) {
      const pmeta = PLACEMENT_META[s.placement];
      lines.push(`### ${pmeta.emoji} ${pmeta.label} — ${s.context || "(sans contexte)"}`);
      lines.push("");
      lines.push(`- **A (baseline)** : « ${s.baseline} »`);
      s.variants.forEach((v, i) => {
        const key = String.fromCharCode(66 + i);
        lines.push(
          `- **${key}** : « ${v.text} »${v.rationale ? ` — *${v.rationale}*` : ""}`
        );
      });
      if (s.hypothesis) lines.push(`- **Hypothèse** : ${s.hypothesis}`);
      lines.push("");
    }
  }

  // Length budgets (V2)
  if (state.lengthBudgets.length > 0) {
    lines.push("## 📏 Length budgets");
    lines.push("");
    lines.push("| Placement | Max char. | Raison | Exceptions |");
    lines.push("|---|---|---|---|");
    for (const b of state.lengthBudgets) {
      const pmeta = PLACEMENT_META[b.placement];
      lines.push(
        `| ${pmeta.emoji} ${pmeta.label} | ${b.maxChars} | ${b.reason || "–"} | ${b.exceptions || "–"} |`
      );
    }
    lines.push("");
  }

  // Inclusive language (V3)
  if (state.inclusiveChecks.length > 0) {
    lines.push("## 🌈 Inclusive language");
    lines.push("");
    lines.push("| Axe | Règle | Statut | Note |");
    lines.push("|---|---|---|---|");
    for (const c of state.inclusiveChecks) {
      const ameta = INCLUSIVE_AXIS_META[c.axis];
      const smeta = CHECK_STATUS_META[c.status];
      lines.push(
        `| ${ameta.emoji} ${ameta.label} | ${c.rule} | ${smeta.emoji} ${smeta.label} | ${c.note || "–"} |`
      );
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    "*Colle ce document dans Claude/ChatGPT pour générer des variantes de copy, traduire, ou produire un guide de ton complet.*"
  );
  return lines.join("\n");
}
