import type { PrinciplesState } from "./state";

export type Severity = "ok" | "warn" | "error";

export interface PrinciplesIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "nielsen" | "affordances" | "feedback" | "menus" | "latency" | "principles";
}

export function validateAffordances(state: PrinciplesState): PrinciplesIssue[] {
  const out: PrinciplesIssue[] = [];
  for (const a of state.affordances) {
    if (!a.hover || !a.focus) {
      out.push({
        id: `affordance-missing-${a.id}`,
        severity: "warn",
        block: "affordances",
        message: `« ${a.component || "(sans nom)"} » : manque ${
          !a.hover && !a.focus ? "hover + focus" : !a.hover ? "hover" : "focus"
        } state (Nielsen H1 visibilité, Norman signifiers).`,
      });
    }
    if (!a.accessibleLabel) {
      out.push({
        id: `affordance-no-label-${a.id}`,
        severity: "warn",
        block: "affordances",
        message: `« ${a.component || "(sans nom)"} » : pas de label accessible — invisible aux lecteurs d'écran.`,
      });
    }
  }
  return out;
}

export function validateFeedback(state: PrinciplesState): PrinciplesIssue[] {
  const out: PrinciplesIssue[] = [];
  for (const f of state.feedbackInventory) {
    if (!f.visual && !f.haptic && !f.audio) {
      out.push({
        id: `feedback-missing-${f.id}`,
        severity: "error",
        block: "feedback",
        message: `« ${f.action || "(sans nom)"} » : aucun feedback (ni visuel, ni haptic, ni audio). Nielsen H1 violé.`,
      });
    }
    if (f.latencyMs > 400 && !f.visual) {
      out.push({
        id: `feedback-doherty-${f.id}`,
        severity: "warn",
        block: "feedback",
        message: `« ${f.action || "(sans nom)"} » : ${f.latencyMs}ms sans feedback visuel. Doherty threshold dépassé (400ms).`,
      });
    }
  }
  return out;
}

export function validateMenus(state: PrinciplesState): PrinciplesIssue[] {
  const out: PrinciplesIssue[] = [];
  for (const m of state.menus) {
    if (m.items.length > 7) {
      out.push({
        id: `menu-too-long-${m.id}`,
        severity: "warn",
        block: "menus",
        message: `« ${m.menuName || "(sans nom)"} » : ${m.items.length} items. Hick's Law : au-delà de 7, regroupe ou progressive disclosure.`,
      });
    }
  }
  return out;
}

export function validateLatency(state: PrinciplesState): PrinciplesIssue[] {
  const out: PrinciplesIssue[] = [];
  for (const l of state.latencyLog) {
    if (l.latencyMs > 400 && !l.hasSkeleton) {
      out.push({
        id: `latency-doherty-${l.id}`,
        severity: "warn",
        block: "latency",
        message: `« ${l.action || "(sans nom)"} » : ${l.latencyMs}ms sans skeleton/spinner. Doherty threshold.`,
      });
    }
  }
  return out;
}

export function validatePrinciplesCount(state: PrinciplesState): PrinciplesIssue[] {
  const out: PrinciplesIssue[] = [];
  const count = state.designPrinciples.filter((p) => p.trim()).length;
  if (count > 5) {
    out.push({
      id: "principles-too-many",
      severity: "warn",
      block: "principles",
      message: `${count} principes. Au-delà de 5, plus personne ne les retient. Objectif 3-5 non négociables.`,
    });
  }
  return out;
}

export function validatePrinciples(state: PrinciplesState): PrinciplesIssue[] {
  return [
    ...validateAffordances(state),
    ...validateFeedback(state),
    ...validateMenus(state),
    ...validateLatency(state),
    ...validatePrinciplesCount(state),
  ];
}
