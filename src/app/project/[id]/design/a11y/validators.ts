import type { A11yState } from "./state";

export type Severity = "ok" | "warn" | "error";

export type IssueBlock =
  | "wcag"
  | "keyboard"
  | "landmarks"
  | "live"
  | "aria"
  | "issues"
  | "at"
  | "cognitive"
  | "motion";

export interface A11yValidationIssue {
  id: string;
  severity: Severity;
  block: IssueBlock;
  message: string;
}

export function validateWcag(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  const critical = state.wcagChecks.filter((c) => c.level === "A");
  const failed = critical.filter((c) => c.status === "fail");
  if (failed.length > 0) {
    out.push({
      id: "wcag-level-a-fail",
      severity: "error",
      block: "wcag",
      message: `${failed.length} critère(s) Level A en échec — non conforme légalement (RGAA/EAA).`,
    });
  }
  const unknownAA = state.wcagChecks.filter(
    (c) => c.level === "AA" && c.status === "unknown"
  );
  if (state.wcagChecks.length > 0 && unknownAA.length > state.wcagChecks.length * 0.5) {
    out.push({
      id: "wcag-too-many-unknown",
      severity: "warn",
      block: "wcag",
      message: `${unknownAA.length} critères AA non évalués — audit incomplet.`,
    });
  }
  return out;
}

export function validateKeyboard(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  for (const flow of state.keyboardFlows) {
    if (flow.tabOrder.length === 0) {
      out.push({
        id: `kb-empty-${flow.id}`,
        severity: "warn",
        block: "keyboard",
        message: `« ${flow.flowName || "Flow"} » : aucune étape de tab order définie.`,
      });
    }
    const missingFocus = flow.tabOrder.filter((s) => !s.expectedFocus).length;
    if (missingFocus > 0) {
      out.push({
        id: `kb-no-focus-${flow.id}`,
        severity: "error",
        block: "keyboard",
        message: `« ${flow.flowName || "Flow"} » : ${missingFocus} élément(s) sans focus visible — WCAG 2.4.7 bloquant.`,
      });
    }
    // Modal sans trap focus
    if (flow.flowName.toLowerCase().includes("modal") && !flow.trapFocus) {
      out.push({
        id: `kb-modal-no-trap-${flow.id}`,
        severity: "error",
        block: "keyboard",
        message: `« ${flow.flowName} » : modal sans trap focus — le focus s'échappe en arrière-plan.`,
      });
    }
    if (flow.trapFocus && !flow.escapeHandler.trim()) {
      out.push({
        id: `kb-no-escape-${flow.id}`,
        severity: "warn",
        block: "keyboard",
        message: `« ${flow.flowName || "Flow"} » : trap focus activé sans handler Esc défini.`,
      });
    }
  }
  return out;
}

export function validateLandmarks(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  const mainCount = state.landmarks.filter(
    (l) => l.landmark === "main" && l.present
  ).length;
  if (state.landmarks.length > 0 && mainCount === 0) {
    out.push({
      id: "landmarks-no-main",
      severity: "error",
      block: "landmarks",
      message: "Aucun landmark <main> présent — skip link sans cible.",
    });
  }
  if (mainCount > 1) {
    out.push({
      id: "landmarks-multiple-main",
      severity: "error",
      block: "landmarks",
      message: `${mainCount} landmarks <main> — un seul autorisé par page.`,
    });
  }
  // Navigation multiple sans label
  const navs = state.landmarks.filter(
    (l) => l.landmark === "navigation" && l.present
  );
  if (navs.length > 1) {
    const unlabeled = navs.filter((n) => !n.label.trim()).length;
    if (unlabeled > 0) {
      out.push({
        id: "landmarks-navs-unlabeled",
        severity: "warn",
        block: "landmarks",
        message: `${navs.length} navigations · ${unlabeled} sans label · impossible à distinguer au screen reader.`,
      });
    }
  }
  return out;
}

export function validateLiveRegions(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  for (const r of state.liveRegions) {
    if (r.politeness === "assertive") {
      const lower = r.context.toLowerCase();
      const isCritical = /error|critique|alert|urgent|échec/i.test(lower);
      if (!isCritical) {
        out.push({
          id: `live-assertive-noncritical-${r.id}`,
          severity: "warn",
          block: "live",
          message: `« ${r.context || "Live region"} » : assertive réservé aux erreurs critiques, sinon polite.`,
        });
      }
    }
    if (!r.context.trim()) {
      out.push({
        id: `live-no-context-${r.id}`,
        severity: "warn",
        block: "live",
        message: "Live region sans contexte.",
      });
    }
  }
  return out;
}

export function validateAriaPatterns(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  for (const p of state.ariaPatterns) {
    if (!p.keyboardInteractions.trim()) {
      out.push({
        id: `aria-no-keyboard-${p.id}`,
        severity: "warn",
        block: "aria",
        message: `« ${p.widget} » : interactions clavier non documentées.`,
      });
    }
    if (p.widget === "dialog" && !p.keyboardInteractions.toLowerCase().includes("esc")) {
      out.push({
        id: `aria-dialog-no-esc-${p.id}`,
        severity: "error",
        block: "aria",
        message: `Dialog « ${p.usage || "?"} » sans Esc dans les interactions — WCAG 2.1.1/2.1.2 bloquant.`,
      });
    }
  }
  return out;
}

export function validateIssues(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  const openCritical = state.issues.filter(
    (i) => i.severity === "critical" && i.status === "open"
  );
  if (openCritical.length > 0) {
    out.push({
      id: "issues-critical-open",
      severity: "error",
      block: "issues",
      message: `${openCritical.length} issue(s) critique(s) ouverte(s) — non conforme.`,
    });
  }
  return out;
}

export function validateAssistiveTech(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  if (state.assistiveTech.length === 0) return out;
  const tested = state.assistiveTech.filter((a) => a.tested);
  if (tested.length === 0) {
    out.push({
      id: "at-none-tested",
      severity: "warn",
      block: "at",
      message: "Aucun assistive tech testé — matrice présente mais pas d'évidence d'audit.",
    });
  }
  const failed = state.assistiveTech.filter(
    (a) => a.tested && a.status === "fail"
  );
  if (failed.length > 0) {
    out.push({
      id: "at-fail",
      severity: "error",
      block: "at",
      message: `${failed.length} combinaison(s) AT × Browser en échec.`,
    });
  }
  // Manque VO iOS / TalkBack si on a des AT testés
  const hasMobile = tested.some(
    (a) => a.at === "voiceover-ios" || a.at === "talkback"
  );
  if (tested.length >= 2 && !hasMobile) {
    out.push({
      id: "at-no-mobile",
      severity: "warn",
      block: "at",
      message: "Aucun AT mobile testé (VoiceOver iOS / TalkBack). Couverture incomplète.",
    });
  }
  return out;
}

export function validateCognitive(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  const failed = state.cognitiveChecks.filter((c) => c.status === "fail");
  if (failed.length > 0) {
    out.push({
      id: "cog-fail",
      severity: "warn",
      block: "cognitive",
      message: `${failed.length} règle(s) cognitive(s) en échec.`,
    });
  }
  return out;
}

export function validateMotion(state: A11yState): A11yValidationIssue[] {
  const out: A11yValidationIssue[] = [];
  // Règles critiques : reduced-motion + flash-safety
  const reducedMotion = state.motionPreferences.find(
    (m) => m.axis === "reduced-motion"
  );
  if (reducedMotion && !reducedMotion.respected) {
    out.push({
      id: "motion-no-reduced",
      severity: "error",
      block: "motion",
      message:
        "prefers-reduced-motion non respecté — WCAG 2.3.3 · risque pour users avec troubles vestibulaires.",
    });
  }
  const flashSafety = state.motionPreferences.find((m) => m.axis === "flash-safety");
  if (flashSafety && !flashSafety.respected) {
    out.push({
      id: "motion-flash",
      severity: "error",
      block: "motion",
      message:
        "Flash safety non validé — WCAG 2.3.1 AA bloquant · risque épilepsie photosensible.",
    });
  }
  return out;
}

export function validateA11y(state: A11yState): A11yValidationIssue[] {
  return [
    ...validateWcag(state),
    ...validateKeyboard(state),
    ...validateLandmarks(state),
    ...validateLiveRegions(state),
    ...validateAriaPatterns(state),
    ...validateIssues(state),
    ...validateAssistiveTech(state),
    ...validateCognitive(state),
    ...validateMotion(state),
  ];
}
