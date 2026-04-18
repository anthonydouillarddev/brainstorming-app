import type { MicrocopyState } from "./state";
import { PLACEMENT_META } from "./state";
import {
  CONTEXT_TONE_EXPECTATIONS,
  FORBIDDEN_ANGLICISMS,
  GENERIC_CTA_LABELS,
  VARIANT_TONE_HINTS,
} from "./microcopy-library";

export type Severity = "ok" | "warn" | "error";

export type IssueBlock =
  | "ctas"
  | "forms"
  | "system"
  | "glossary"
  | "voice"
  | "variants"
  | "budget"
  | "inclusive";

export interface MicrocopyIssue {
  id: string;
  severity: Severity;
  block: IssueBlock;
  message: string;
}

export function validateCtas(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  const labels = new Map<string, number>();

  // Budget max pour CTA primary (si défini)
  const ctaPrimaryBudget = state.lengthBudgets.find((b) => b.placement === "cta-primary");
  const ctaSecondaryBudget = state.lengthBudgets.find((b) => b.placement === "cta-secondary");

  for (const c of state.ctas) {
    const label = c.label.trim();
    if (!label) {
      out.push({
        id: `cta-empty-${c.id}`,
        severity: "error",
        block: "ctas",
        message: "CTA sans label.",
      });
      continue;
    }
    const lower = label.toLowerCase();

    if (GENERIC_CTA_LABELS.has(lower)) {
      out.push({
        id: `cta-generic-${c.id}`,
        severity: "warn",
        block: "ctas",
        message: `« ${label} » : CTA générique. Préfère un verbe d'action précis (ex: « Créer mon projet »).`,
      });
    }

    if (FORBIDDEN_ANGLICISMS.has(lower)) {
      out.push({
        id: `cta-english-${c.id}`,
        severity: "error",
        block: "ctas",
        message: `« ${label} » : terme anglais dans une UI FR. Traduire.`,
      });
    }

    // Budget check
    const budget =
      c.variant === "primary"
        ? ctaPrimaryBudget?.maxChars ?? 30
        : c.variant === "secondary"
          ? ctaSecondaryBudget?.maxChars ?? 30
          : 30;
    if (label.length > budget) {
      out.push({
        id: `cta-budget-${c.id}`,
        severity: "warn",
        block: "ctas",
        message: `« ${label} » : ${label.length} car., budget ${c.variant} = ${budget}.`,
      });
    }

    labels.set(lower, (labels.get(lower) ?? 0) + 1);

    const tonesAllowed = VARIANT_TONE_HINTS[c.variant];
    if (!tonesAllowed.includes(c.tone)) {
      out.push({
        id: `cta-tone-mismatch-${c.id}`,
        severity: "warn",
        block: "ctas",
        message: `« ${label} » : variant ${c.variant} + ton ${c.tone} = incohérent. Conseillé : ${tonesAllowed.join(", ")}.`,
      });
    }

    if (c.variant === "destructive") {
      const destructiveWords = ["supprim", "annul", "retirer", "détruire", "réinitialis"];
      if (!destructiveWords.some((w) => lower.includes(w))) {
        out.push({
          id: `cta-destructive-vague-${c.id}`,
          severity: "warn",
          block: "ctas",
          message: `« ${label} » (destructive) : le label devrait contenir un verbe destructif explicite.`,
        });
      }
    }
  }

  for (const [lbl, count] of labels.entries()) {
    if (count > 1) {
      out.push({
        id: `cta-dup-${lbl}`,
        severity: "warn",
        block: "ctas",
        message: `« ${lbl} » utilisé ${count} fois. Cohérence OK si même action, sinon différencier.`,
      });
    }
  }

  return out;
}

export function validateFormFields(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  const labelBudget = state.lengthBudgets.find((b) => b.placement === "field-label")?.maxChars;
  const placeholderBudget = state.lengthBudgets.find(
    (b) => b.placement === "field-placeholder"
  )?.maxChars;
  const helperBudget = state.lengthBudgets.find((b) => b.placement === "field-helper")?.maxChars;
  const errorBudget = state.lengthBudgets.find((b) => b.placement === "field-error")?.maxChars;

  for (const f of state.formFields) {
    if (!f.label.trim()) {
      out.push({
        id: `form-no-label-${f.id}`,
        severity: "error",
        block: "forms",
        message: `Champ « ${f.fieldName || "(sans nom)"} » sans label — A11y + UX cassés.`,
      });
    }

    if (
      f.placeholder &&
      f.label &&
      f.placeholder.trim().toLowerCase() === f.label.trim().toLowerCase()
    ) {
      out.push({
        id: `form-placeholder-equals-label-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : placeholder = label. Le placeholder doit illustrer, pas répéter.`,
      });
    }

    if (f.kind === "password" && f.placeholder.trim() !== "") {
      out.push({
        id: `form-password-placeholder-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : password avec placeholder. Laisse-le vide (pas d'exemple de mot de passe).`,
      });
    }

    if (f.errorRequired && !/requis|obligatoire|manquant|renseigne/i.test(f.errorRequired)) {
      out.push({
        id: `form-error-required-weak-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : message errorRequired pas assez clair sur l'obligation.`,
      });
    }

    // Budget checks
    if (labelBudget && f.label.length > labelBudget) {
      out.push({
        id: `form-label-budget-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : label ${f.label.length} car., budget ${labelBudget}.`,
      });
    }
    if (placeholderBudget && f.placeholder.length > placeholderBudget) {
      out.push({
        id: `form-placeholder-budget-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : placeholder ${f.placeholder.length} car., budget ${placeholderBudget}.`,
      });
    }
    if (helperBudget && f.helperText.length > helperBudget) {
      out.push({
        id: `form-helper-budget-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : helper ${f.helperText.length} car., budget ${helperBudget}.`,
      });
    }
    if (errorBudget && f.errorRequired.length > errorBudget) {
      out.push({
        id: `form-error-required-budget-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : errorRequired ${f.errorRequired.length} car., budget ${errorBudget}.`,
      });
    }
    if (errorBudget && f.errorInvalid.length > errorBudget) {
      out.push({
        id: `form-error-invalid-budget-${f.id}`,
        severity: "warn",
        block: "forms",
        message: `« ${f.fieldName} » : errorInvalid ${f.errorInvalid.length} car., budget ${errorBudget}.`,
      });
    }
  }
  return out;
}

export function validateSystemMessages(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  const tooltipBudget = state.lengthBudgets.find((b) => b.placement === "tooltip")?.maxChars ?? 80;

  for (const m of state.systemMessages) {
    if (!m.body.trim()) {
      out.push({
        id: `sys-no-body-${m.id}`,
        severity: "error",
        block: "system",
        message: `${m.trigger || "(sans trigger)"} : message sans body.`,
      });
    }

    if (m.kind === "confirm-destructive") {
      if (!m.primaryLabel.trim()) {
        out.push({
          id: `sys-destructive-no-primary-${m.id}`,
          severity: "error",
          block: "system",
          message: `Confirm destructif « ${m.trigger || "(sans)"} » sans CTA principal.`,
        });
      }
      if (!m.secondaryLabel.trim()) {
        out.push({
          id: `sys-destructive-no-secondary-${m.id}`,
          severity: "warn",
          block: "system",
          message: `Confirm destructif « ${m.trigger || "(sans)"} » sans « Annuler ». L'user doit pouvoir reculer.`,
        });
      }
      const lower = m.primaryLabel.toLowerCase();
      if (!/supprim|annul définit|détruire|effacer|réinitialis/i.test(lower)) {
        out.push({
          id: `sys-destructive-weak-primary-${m.id}`,
          severity: "warn",
          block: "system",
          message: `Confirm destructif « ${m.trigger || "(sans)"} » : CTA « ${m.primaryLabel} » pas assez explicite sur l'irréversibilité.`,
        });
      }
    }

    if (m.kind === "tooltip" && m.body.length > tooltipBudget) {
      out.push({
        id: `sys-tooltip-too-long-${m.id}`,
        severity: "warn",
        block: "system",
        message: `Tooltip « ${m.trigger || "(sans)"} » : ${m.body.length} car., budget ${tooltipBudget}. Préfère un popover.`,
      });
    }

    if (m.kind === "banner-warn" && !m.primaryLabel.trim()) {
      out.push({
        id: `sys-warn-no-action-${m.id}`,
        severity: "warn",
        block: "system",
        message: `Banner warn « ${m.trigger || "(sans)"} » sans action — l'user voit le souci sans pouvoir agir.`,
      });
    }
  }
  return out;
}

export function validateGlossary(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  for (const g of state.glossary) {
    if (!g.term.trim() || !g.userFacingFr.trim()) {
      out.push({
        id: `gloss-empty-${g.id}`,
        severity: "error",
        block: "glossary",
        message: "Entrée glossaire incomplète (terme + traduction requis).",
      });
    }
    if (g.status === "dont" && !g.alternative.trim()) {
      out.push({
        id: `gloss-dont-no-alt-${g.id}`,
        severity: "warn",
        block: "glossary",
        message: `« ${g.userFacingFr || g.term} » marqué « éviter » sans alternative proposée.`,
      });
    }
  }

  const byFr = new Map<string, string[]>();
  for (const g of state.glossary) {
    const key = g.userFacingFr.trim().toLowerCase();
    if (!key) continue;
    const arr = byFr.get(key) ?? [];
    arr.push(g.status);
    byFr.set(key, arr);
  }
  for (const [fr, statuses] of byFr.entries()) {
    if (statuses.includes("do") && statuses.includes("dont")) {
      out.push({
        id: `gloss-contradiction-${fr}`,
        severity: "error",
        block: "glossary",
        message: `« ${fr} » : marqué à la fois « utiliser » et « éviter ». Contradiction.`,
      });
    }
  }

  return out;
}

export function validateVoiceTones(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  const seen = new Set<string>();
  for (const v of state.voiceTones) {
    if (!v.principle.trim()) {
      out.push({
        id: `voice-no-principle-${v.id}`,
        severity: "warn",
        block: "voice",
        message: `« ${v.context} » : principe manquant — décris en un mot ce que le ton doit produire.`,
      });
    }
    if (!v.doExample.trim()) {
      out.push({
        id: `voice-no-do-${v.id}`,
        severity: "warn",
        block: "voice",
        message: `« ${v.context} » : exemple DO manquant.`,
      });
    }

    // Tone vs context cohérence
    const expected = CONTEXT_TONE_EXPECTATIONS[v.context];
    if (!expected.includes(v.tone)) {
      out.push({
        id: `voice-tone-mismatch-${v.id}`,
        severity: "warn",
        block: "voice",
        message: `« ${v.context} » + ton ${v.tone} : inhabituel. Conseillé : ${expected.join(", ")}.`,
      });
    }

    // Duplicate context
    if (seen.has(v.context)) {
      out.push({
        id: `voice-duplicate-${v.context}-${v.id}`,
        severity: "warn",
        block: "voice",
        message: `« ${v.context} » défini plusieurs fois. Un seul ton par contexte recommandé.`,
      });
    }
    seen.add(v.context);
  }
  return out;
}

export function validateVariants(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  for (const s of state.variantSets) {
    if (!s.baseline.trim()) {
      out.push({
        id: `var-no-baseline-${s.id}`,
        severity: "error",
        block: "variants",
        message: `« ${s.context || s.placement} » : baseline manquante.`,
      });
    }
    if (s.variants.length === 0) {
      out.push({
        id: `var-no-variants-${s.id}`,
        severity: "warn",
        block: "variants",
        message: `« ${s.context || s.placement} » : aucune variante — ajoute-en au moins 1 pour A/B.`,
      });
    }
    for (const [idx, v] of s.variants.entries()) {
      if (v.text.trim() === s.baseline.trim()) {
        out.push({
          id: `var-equals-baseline-${s.id}-${idx}`,
          severity: "warn",
          block: "variants",
          message: `« ${s.context || s.placement} » variante ${idx + 1} = baseline. Pas d'A/B utile.`,
        });
      }
    }
    // Budget check
    const budget = state.lengthBudgets.find((b) => b.placement === s.placement)?.maxChars;
    if (budget) {
      if (s.baseline.length > budget) {
        out.push({
          id: `var-baseline-budget-${s.id}`,
          severity: "warn",
          block: "variants",
          message: `« ${s.context || s.placement} » baseline ${s.baseline.length} car., budget ${budget}.`,
        });
      }
      for (const [idx, v] of s.variants.entries()) {
        if (v.text.length > budget) {
          out.push({
            id: `var-budget-${s.id}-${idx}`,
            severity: "warn",
            block: "variants",
            message: `« ${s.context || s.placement} » variante ${idx + 1} ${v.text.length} car., budget ${budget}.`,
          });
        }
      }
    }
  }
  return out;
}

export function validateBudgets(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  const seen = new Set<string>();
  for (const b of state.lengthBudgets) {
    if (b.maxChars <= 0) {
      out.push({
        id: `budget-invalid-${b.id}`,
        severity: "error",
        block: "budget",
        message: `Budget « ${b.placement} » : max invalide (${b.maxChars}).`,
      });
    }
    const defaultMax = PLACEMENT_META[b.placement]?.defaultMax;
    if (defaultMax && b.maxChars > defaultMax * 2) {
      out.push({
        id: `budget-too-loose-${b.id}`,
        severity: "warn",
        block: "budget",
        message: `Budget « ${b.placement} » : ${b.maxChars} car. — très au-dessus du défaut (${defaultMax}). Justifié ?`,
      });
    }
    if (seen.has(b.placement)) {
      out.push({
        id: `budget-duplicate-${b.id}`,
        severity: "warn",
        block: "budget",
        message: `Budget « ${b.placement} » dupliqué. Un seul par placement.`,
      });
    }
    seen.add(b.placement);
  }
  return out;
}

export function validateInclusive(state: MicrocopyState): MicrocopyIssue[] {
  const out: MicrocopyIssue[] = [];
  for (const c of state.inclusiveChecks) {
    if (c.status === "fail") {
      out.push({
        id: `incl-fail-${c.id}`,
        severity: "error",
        block: "inclusive",
        message: `${c.rule.slice(0, 100)}${c.rule.length > 100 ? "…" : ""} — ${c.note || "non conforme"}`,
      });
    } else if (c.status === "warn") {
      out.push({
        id: `incl-warn-${c.id}`,
        severity: "warn",
        block: "inclusive",
        message: `${c.rule.slice(0, 100)}${c.rule.length > 100 ? "…" : ""} — ${c.note || "à revoir"}`,
      });
    }
  }

  // Heuristique auto : détecter « l'utilisateur » dans glossaire do-list
  const userFacingTexts: string[] = [
    ...state.ctas.map((c) => c.label),
    ...state.formFields.flatMap((f) => [f.label, f.helperText, f.errorRequired, f.errorInvalid]),
    ...state.systemMessages.flatMap((m) => [m.title, m.body]),
  ];
  const allCopy = userFacingTexts.join(" ").toLowerCase();
  const userMasculinHits = (allCopy.match(/l['']utilisateur[^·s]|les utilisateurs/g) ?? []).length;
  if (userMasculinHits >= 2) {
    out.push({
      id: "incl-auto-utilisateur",
      severity: "warn",
      block: "inclusive",
      message: `« utilisateur(s) » détecté ${userMasculinHits} fois dans le copy. Préférer « tu » ou reformuler.`,
    });
  }

  return out;
}

export function validateMicrocopy(state: MicrocopyState): MicrocopyIssue[] {
  return [
    ...validateCtas(state),
    ...validateFormFields(state),
    ...validateSystemMessages(state),
    ...validateGlossary(state),
    ...validateVoiceTones(state),
    ...validateVariants(state),
    ...validateBudgets(state),
    ...validateInclusive(state),
  ];
}
