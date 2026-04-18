import type { StatesState } from "./state";

export type Severity = "ok" | "warn" | "error";

export type IssueBlock =
  | "screens"
  | "loading"
  | "empty"
  | "error"
  | "micro"
  | "success"
  | "toasts"
  | "machine";

export interface StatesIssue {
  id: string;
  severity: Severity;
  block: IssueBlock;
  message: string;
}

export function validateScreens(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const s of state.screens) {
    if (!s.title.trim()) {
      out.push({
        id: `screen-empty-${s.id}`,
        severity: "error",
        block: "screens",
        message: `Écran sans titre — renseigne au moins "Liste projets" ou "Cockpit".`,
      });
    }
    const required = [s.needsLoading, s.needsEmpty, s.needsError].filter(Boolean).length;
    if (s.priority === "must" && required < 2) {
      out.push({
        id: `screen-underspecified-${s.id}`,
        severity: "warn",
        block: "screens",
        message: `« ${s.title || "Écran"} » (MUST) ne couvre que ${required} état(s). En MUST, minimum 2 parmi loading / empty / error.`,
      });
    }
  }
  return out;
}

export function validateLoading(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const l of state.loadingPatterns) {
    if (!l.trigger.trim()) {
      out.push({
        id: `loading-no-trigger-${l.id}`,
        severity: "warn",
        block: "loading",
        message: "Pattern loading sans trigger — précise quelle action déclenche ce loading.",
      });
    }
    if (l.kind === "skeleton" && !l.skeletonFields?.trim()) {
      out.push({
        id: `loading-skeleton-no-fields-${l.id}`,
        severity: "warn",
        block: "loading",
        message: `« ${l.trigger || "Skeleton"} » : précise les zones du skeleton (ex: "titre + 3 lignes + badge").`,
      });
    }
    if (l.kind === "spinner" && l.minDurationMs < 300) {
      out.push({
        id: `loading-spinner-too-fast-${l.id}`,
        severity: "warn",
        block: "loading",
        message: `« ${l.trigger || "Spinner"} » : < 300ms, mieux vaut ne rien afficher (Doherty).`,
      });
    }
    if (
      (l.kind === "spinner" || l.kind === "inline") &&
      l.minDurationMs > 2000
    ) {
      out.push({
        id: `loading-spinner-too-slow-${l.id}`,
        severity: "warn",
        block: "loading",
        message: `« ${l.trigger || "Spinner"} » : > 2s, passe sur skeleton ou progress bar.`,
      });
    }
  }
  return out;
}

export function validateEmpty(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const e of state.emptyStates) {
    if (!e.headline.trim()) {
      out.push({
        id: `empty-no-headline-${e.id}`,
        severity: "error",
        block: "empty",
        message: `Empty state sans titre — l'user atterrit sur du vide.`,
      });
    }
    if (e.kind === "first-use" && !e.primaryCta.trim()) {
      out.push({
        id: `empty-firstuse-no-cta-${e.id}`,
        severity: "error",
        block: "empty",
        message: `« ${e.context || "First-use"} » sans CTA principal — l'user ne sait pas quoi faire.`,
      });
    }
    if (e.kind === "error-recovery" && !e.primaryCta.trim()) {
      out.push({
        id: `empty-recovery-no-cta-${e.id}`,
        severity: "warn",
        block: "empty",
        message: `« ${e.context || "Error"} » : ajoute un bouton "Réessayer".`,
      });
    }
  }
  return out;
}

export function validateError(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const err of state.errorPatterns) {
    if (!err.message.trim()) {
      out.push({
        id: `error-no-message-${err.id}`,
        severity: "error",
        block: "error",
        message: "Pattern error sans message — l'user voit du vide ou un code technique.",
      });
    }
    if (err.message.toLowerCase().includes("error") || err.message.toLowerCase().includes("undefined") || err.message.toLowerCase().includes("null")) {
      out.push({
        id: `error-technical-leak-${err.id}`,
        severity: "warn",
        block: "error",
        message: `« ${err.trigger || "Erreur"} » : le message contient du jargon technique. Reformule côté user.`,
      });
    }
    if ((err.category === "server" || err.category === "network" || err.category === "timeout") && !err.action.trim()) {
      out.push({
        id: `error-no-action-${err.id}`,
        severity: "warn",
        block: "error",
        message: `« ${err.trigger || "Erreur"} » (${err.category}) : sans action de récupération, l'user est bloqué.`,
      });
    }
    if (err.category === "validation" && err.tone === "urgent") {
      out.push({
        id: `error-validation-urgent-${err.id}`,
        severity: "warn",
        block: "error",
        message: `« ${err.trigger || "Validation"} » : ton "urgent" pour une validation, c'est agressif. Préfère "calme" ou "neutre".`,
      });
    }
  }
  return out;
}

export function validateMicro(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const m of state.microInteractions) {
    const targetLabel = m.target === "custom" ? m.customTarget || "Custom" : m.target;
    if (m.durationMs < 80) {
      out.push({
        id: `micro-too-fast-${m.id}`,
        severity: "warn",
        block: "micro",
        message: `« ${targetLabel} » : ${m.durationMs}ms, trop rapide, perçu comme instantané sans feedback.`,
      });
    }
    if (m.durationMs > 400) {
      out.push({
        id: `micro-too-slow-${m.id}`,
        severity: "warn",
        block: "micro",
        message: `« ${targetLabel} » : ${m.durationMs}ms, trop lent, freine l'interaction (Doherty 400ms).`,
      });
    }
    if (m.target === "button" && !m.states.includes("focus")) {
      out.push({
        id: `micro-button-no-focus-${m.id}`,
        severity: "error",
        block: "micro",
        message: `« Button » sans état focus — WCAG 2.4.7 bloquant, users clavier exclus.`,
      });
    }
    if (m.target === "custom" && !m.customTarget.trim()) {
      out.push({
        id: `micro-custom-empty-${m.id}`,
        severity: "warn",
        block: "micro",
        message: "Micro-interaction custom sans nom de cible.",
      });
    }
  }
  return out;
}

export function validateSuccess(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const s of state.successPatterns) {
    if (!s.message.trim()) {
      out.push({
        id: `success-no-message-${s.id}`,
        severity: "error",
        block: "success",
        message: `Success pattern sans message — l'user ne sait pas que ça a réussi.`,
      });
    }
    if ((s.kind === "toast" || s.kind === "inline") && s.durationMs > 0 && s.durationMs < 1500) {
      out.push({
        id: `success-too-short-${s.id}`,
        severity: "warn",
        block: "success",
        message: `« ${s.trigger || "Success"} » : ${s.durationMs}ms, trop court pour être lu (< 1500ms).`,
      });
    }
    if (s.kind === "toast" && s.durationMs > 8000) {
      out.push({
        id: `success-toast-too-long-${s.id}`,
        severity: "warn",
        block: "success",
        message: `« ${s.trigger || "Success"} » : toast > 8s, ça pollue l'écran. Préfère une confirmation page si milestone.`,
      });
    }
    if ((s.kind === "modal" || s.kind === "page") && !s.ctaNext.trim()) {
      out.push({
        id: `success-no-cta-${s.id}`,
        severity: "warn",
        block: "success",
        message: `« ${s.trigger || "Success"} » (${s.kind}) sans CTA next — l'user atterrit sur un cul-de-sac.`,
      });
    }
  }
  return out;
}

export function validateToasts(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const t of state.toasts) {
    if (!t.label.trim()) {
      out.push({
        id: `toast-no-label-${t.id}`,
        severity: "error",
        block: "toasts",
        message: "Toast sans label.",
      });
    }
    if (t.durationMs > 0 && t.durationMs < 1500) {
      out.push({
        id: `toast-too-short-${t.id}`,
        severity: "warn",
        block: "toasts",
        message: `« ${t.label || "Toast"} » : ${t.durationMs}ms, trop court pour être lu (minimum 1500ms).`,
      });
    }
    if ((t.kind === "error" || t.kind === "warn") && t.durationMs > 0 && t.durationMs < 4000) {
      out.push({
        id: `toast-error-too-short-${t.id}`,
        severity: "warn",
        block: "toasts",
        message: `« ${t.label || "Toast"} » (${t.kind}) : < 4s, l'user n'a pas le temps de lire ni d'agir.`,
      });
    }
    if ((t.kind === "error" || t.kind === "warn") && t.durationMs > 0 && !t.action) {
      out.push({
        id: `toast-no-action-${t.id}`,
        severity: "warn",
        block: "toasts",
        message: `« ${t.label || "Toast"} » (${t.kind}) sans action de récupération — l'user voit le problème mais ne peut rien faire.`,
      });
    }
    if (t.durationMs === 0 && !t.dismissible && !t.action) {
      out.push({
        id: `toast-sticky-no-dismiss-${t.id}`,
        severity: "error",
        block: "toasts",
        message: `« ${t.label || "Toast"} » : sticky (0ms) sans dismiss ni action — l'user est bloqué avec le toast à l'écran.`,
      });
    }
  }
  return out;
}

export function validateMachines(state: StatesState): StatesIssue[] {
  const out: StatesIssue[] = [];
  for (const m of state.stateMachines) {
    const activeStates = new Set(m.states);

    if (!activeStates.has(m.initial)) {
      out.push({
        id: `machine-invalid-initial-${m.id}`,
        severity: "error",
        block: "machine",
        message: `« ${m.screenTitle || "Machine"} » : état initial « ${m.initial} » absent des états actifs.`,
      });
    }

    // Vérif transitions valides
    for (const tr of m.transitions) {
      if (!activeStates.has(tr.from)) {
        out.push({
          id: `machine-transition-invalid-from-${m.id}-${tr.from}-${tr.to}`,
          severity: "warn",
          block: "machine",
          message: `« ${m.screenTitle || "Machine"} » : transition depuis « ${tr.from} » (état non listé).`,
        });
      }
      if (!activeStates.has(tr.to)) {
        out.push({
          id: `machine-transition-invalid-to-${m.id}-${tr.from}-${tr.to}`,
          severity: "warn",
          block: "machine",
          message: `« ${m.screenTitle || "Machine"} » : transition vers « ${tr.to} » (état non listé).`,
        });
      }
    }

    // Orphelins : état sans transition entrante ni sortante
    for (const st of m.states) {
      if (st === m.initial) continue;
      const hasIncoming = m.transitions.some((t) => t.to === st);
      const hasOutgoing = m.transitions.some((t) => t.from === st);
      if (!hasIncoming && !hasOutgoing) {
        out.push({
          id: `machine-orphan-${m.id}-${st}`,
          severity: "warn",
          block: "machine",
          message: `« ${m.screenTitle || "Machine"} » : état « ${st} » sans aucune transition.`,
        });
      }
    }

    // Error sans retry
    if (activeStates.has("error") && activeStates.has("loading")) {
      const hasRetry = m.transitions.some((t) => t.from === "error" && t.to === "loading");
      if (!hasRetry) {
        out.push({
          id: `machine-no-retry-${m.id}`,
          severity: "warn",
          block: "machine",
          message: `« ${m.screenTitle || "Machine"} » : pas de transition error → loading (l'user ne peut pas retry).`,
        });
      }
    }
  }
  return out;
}

export function validateStates(state: StatesState): StatesIssue[] {
  return [
    ...validateScreens(state),
    ...validateLoading(state),
    ...validateEmpty(state),
    ...validateError(state),
    ...validateMicro(state),
    ...validateSuccess(state),
    ...validateToasts(state),
    ...validateMachines(state),
  ];
}
