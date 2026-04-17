import { computeContrastRatio, type DesignSystemState } from "./state";
import { COMPONENTS_CATALOG } from "./components-catalog";

export type Severity = "ok" | "warn" | "error";

export interface DsIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "tokens" | "contrast" | "components" | "patterns" | "variants" | "a11y";
}

export function validateSemanticTokens(state: DesignSystemState): DsIssue[] {
  const out: DsIssue[] = [];
  for (const t of state.semanticTokens) {
    if (!t.name.includes(".")) {
      out.push({
        id: `token-no-namespace-${t.id}`,
        severity: "warn",
        block: "tokens",
        message: `« ${t.name} » : sans namespace (.), il manque la sémantique (ex: bg.primary, text.danger).`,
      });
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(t.primitiveHex)) {
      out.push({
        id: `token-invalid-hex-${t.id}`,
        severity: "error",
        block: "tokens",
        message: `« ${t.name} » : valeur hex invalide (${t.primitiveHex}).`,
      });
    }
  }
  return out;
}

export function validateContrastPairs(state: DesignSystemState): DsIssue[] {
  const out: DsIssue[] = [];
  for (const p of state.contrastPairs) {
    const ratio = computeContrastRatio(p.fgHex, p.bgHex);
    if (ratio < 4.5) {
      out.push({
        id: `contrast-fail-${p.id}`,
        severity: ratio < 3 ? "error" : "warn",
        block: "contrast",
        message: `« ${p.name} » : ratio ${ratio.toFixed(2)} (AA requiert 4.5+). ${ratio < 3 ? "Échec même AA-Large." : ""}`,
      });
    }
  }
  return out;
}

export function validateComponentCoverage(state: DesignSystemState): DsIssue[] {
  const out: DsIssue[] = [];
  const slugs = new Set(state.components.map((c) => c.slug));

  // Empty state requis si Table ou List sélectionné
  if ((slugs.has("table") || slugs.has("list")) && !slugs.has("empty-state")) {
    out.push({
      id: "missing-empty-state",
      severity: "warn",
      block: "patterns",
      message: "Table/List sélectionné sans Empty state. Écran vide = première impression ratée.",
    });
  }

  // Toast/Alert requis si Form sélectionné
  if (slugs.has("form") && !slugs.has("toast") && !slugs.has("alert")) {
    out.push({
      id: "missing-feedback",
      severity: "warn",
      block: "patterns",
      message: "Form sans Toast ni Alert. Comment confirmer succès/erreur ?",
    });
  }

  // Modal sans focus trap
  if (slugs.has("modal")) {
    const modal = state.components.find((c) => c.slug === "modal");
    if (modal?.priority === "must") {
      const a11y = state.a11yChecks.find((a) => a.componentSlug === "modal");
      if (a11y && !a11y.focusVisible) {
        out.push({
          id: "modal-no-focus",
          severity: "error",
          block: "a11y",
          message: "Modal MUST sans focus visible. Bloquant en WCAG 2.4.7.",
        });
      }
    }
  }

  return out;
}

export function validateVariants(state: DesignSystemState): DsIssue[] {
  const out: DsIssue[] = [];
  for (const v of state.variants) {
    const combinations = v.variants.length * v.sizes.length * v.states.length;
    const component = COMPONENTS_CATALOG.find((c) => c.slug === v.componentSlug);
    if (v.variants.length > 6) {
      out.push({
        id: `variants-explosion-${v.id}`,
        severity: "warn",
        block: "variants",
        message: `${component?.name ?? v.componentSlug} : ${v.variants.length} variants. Au-delà de 6, over-engineering (Nathan Curtis).`,
      });
    }
    if (combinations > 60) {
      out.push({
        id: `variants-combinatorial-${v.id}`,
        severity: "warn",
        block: "variants",
        message: `${component?.name ?? v.componentSlug} : ${combinations} combinaisons. Découpe le composant.`,
      });
    }
  }
  return out;
}

export function validateA11y(state: DesignSystemState): DsIssue[] {
  const out: DsIssue[] = [];
  for (const a of state.a11yChecks) {
    const component = COMPONENTS_CATALOG.find((c) => c.slug === a.componentSlug);
    if (!a.focusVisible) {
      out.push({
        id: `a11y-no-focus-${a.componentSlug}`,
        severity: "error",
        block: "a11y",
        message: `${component?.name ?? a.componentSlug} : pas de focus visible. WCAG 2.4.7 bloquant.`,
      });
    }
    if (!a.keyboardNav) {
      out.push({
        id: `a11y-no-keyboard-${a.componentSlug}`,
        severity: "warn",
        block: "a11y",
        message: `${component?.name ?? a.componentSlug} : pas de navigation clavier. Users non-souris exclus.`,
      });
    }
  }
  return out;
}

export function validateDesignSystem(state: DesignSystemState): DsIssue[] {
  return [
    ...validateSemanticTokens(state),
    ...validateContrastPairs(state),
    ...validateComponentCoverage(state),
    ...validateVariants(state),
    ...validateA11y(state),
  ];
}
