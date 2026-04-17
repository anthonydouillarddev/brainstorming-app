import type { FlowsState } from "./state";
import { computeFrictionScore } from "./state";

export type Severity = "ok" | "warn" | "error";

export interface FlowsIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "steps" | "aha" | "pattern" | "nsa" | "friction" | "edge-cases";
}

export function validateSteps(state: FlowsState): FlowsIssue[] {
  const out: FlowsIssue[] = [];
  if (state.steps.length === 0) return out;

  if (state.steps.length > 5) {
    out.push({
      id: "steps-too-many",
      severity: "warn",
      block: "steps",
      message: `${state.steps.length} étapes. Au-delà de 5, chute ~10-20% par étape (Baymard). Raccourcis.`,
    });
  }

  // Signup avant valeur : heuristique — si une étape contient "signup"/"inscription" et aucune valeur livrée avant
  const signupIndex = state.steps.findIndex((s) =>
    /signup|inscription|s'inscrire|register/i.test(`${s.label} ${s.action}`)
  );
  if (signupIndex >= 0 && signupIndex <= 1 && state.steps.length > 2) {
    const ahaIndex = state.steps.findIndex((s) => s.id === state.ahaMomentStepId);
    if (ahaIndex > signupIndex) {
      out.push({
        id: "signup-before-value",
        severity: "warn",
        block: "steps",
        message:
          "Signup demandé avant toute livraison de valeur. Envisage try-before-signup / reverse trial (Reforge).",
      });
    }
  }

  // Permissions trop tôt
  const permissionEarly = state.steps
    .slice(0, 2)
    .find((s) => /notif|localisation|camera|permission/i.test(`${s.label} ${s.action}`));
  if (permissionEarly) {
    out.push({
      id: "permissions-early",
      severity: "warn",
      block: "steps",
      message:
        "Permission demandée avant value delivery. Apple HIG : demande APRÈS avoir prouvé la valeur.",
    });
  }

  return out;
}

export function validateAhaMoment(state: FlowsState): FlowsIssue[] {
  const out: FlowsIssue[] = [];
  if (state.steps.length >= 3 && !state.ahaMomentStepId) {
    out.push({
      id: "aha-missing",
      severity: "warn",
      block: "aha",
      message:
        "Aucun aha moment marqué. Tu ne peux pas construire un produit sans savoir quand l'user dit « ouah ».",
    });
  }
  return out;
}

export function validateNSA(state: FlowsState): FlowsIssue[] {
  const out: FlowsIssue[] = [];
  const nsa = state.northStarAction;
  const anyFilled =
    nsa.verb.trim() || nsa.segment.trim() || nsa.timeframe.trim() || nsa.value.trim();
  const allFilled =
    nsa.verb.trim() && nsa.segment.trim() && nsa.timeframe.trim() && nsa.value.trim();
  if (state.steps.length >= 3 && !anyFilled) {
    out.push({
      id: "nsa-missing",
      severity: "warn",
      block: "nsa",
      message:
        "Aucune North Star Action définie. Sans NSA, impossible de mesurer l'activation.",
    });
  }
  if (anyFilled && !allFilled) {
    out.push({
      id: "nsa-incomplete",
      severity: "warn",
      block: "nsa",
      message: "NSA incomplète : il faut verbe + segment + timeframe + valeur pour être mesurable.",
    });
  }
  return out;
}

export function validateFriction(state: FlowsState): FlowsIssue[] {
  const out: FlowsIssue[] = [];
  const score = computeFrictionScore(state);
  if (score.level === "high") {
    out.push({
      id: "friction-high",
      severity: "warn",
      block: "friction",
      message: `Friction élevée (${score.total}). Réduis les champs, les décisions forcées, ou les modals.`,
    });
  }
  // Détection explicite modals > 3
  const totalModals = state.steps.reduce((sum, s) => sum + (s.modals ?? 0), 0);
  if (totalModals > 3) {
    out.push({
      id: "modals-fatigue",
      severity: "warn",
      block: "friction",
      message: `${totalModals} modals/popups avant le premier écran utile. Modal fatigue garantie.`,
    });
  }
  // Fields par étape
  for (const s of state.steps) {
    if ((s.fields ?? 0) > 3) {
      out.push({
        id: `fields-too-many-${s.id}`,
        severity: "warn",
        block: "friction",
        message: `« ${s.label || "(sans nom)"} » : ${s.fields} champs. Chaque champ supplémentaire = ~10% d'abandon (Baymard).`,
      });
    }
  }
  return out;
}

export function validateEdgeCases(state: FlowsState): FlowsIssue[] {
  const out: FlowsIssue[] = [];
  if (state.steps.length === 0) return out;
  const hasNegativeEmotion = state.steps.some((s) => (s.emotion ?? 3) <= 2);
  if (!hasNegativeEmotion && state.steps.length >= 4) {
    out.push({
      id: "no-negative-emotion",
      severity: "warn",
      block: "edge-cases",
      message:
        "Aucune émotion négative mappée. Suspicieux : aucun user n'a un parcours 100% positif. Où sont les moments de doute ?",
    });
  }
  return out;
}

export function validateFlows(state: FlowsState): FlowsIssue[] {
  return [
    ...validateSteps(state),
    ...validateAhaMoment(state),
    ...validateNSA(state),
    ...validateFriction(state),
    ...validateEdgeCases(state),
  ];
}
