import {
  averageSusScore,
  type ValidationState,
} from "./state";

export type Severity = "ok" | "warn" | "error";

export type IssueBlock = "tests" | "sus" | "heuristic" | "pmf";

export interface ValidationIssue {
  id: string;
  severity: Severity;
  block: IssueBlock;
  message: string;
}

export function validateUserTests(state: ValidationState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const completed = state.userTests.filter((t) => t.status === "completed");

  for (const t of state.userTests) {
    if (t.status === "completed" && t.participantCount < 5) {
      out.push({
        id: `test-small-${t.id}`,
        severity: "warn",
        block: "tests",
        message: `« ${t.title || "Test"} » : ${t.participantCount} participants. NN/G recommande minimum 5 pour ~85% des problèmes détectés.`,
      });
    }
    if (t.status === "completed" && t.completionRate < 70) {
      out.push({
        id: `test-low-completion-${t.id}`,
        severity: "warn",
        block: "tests",
        message: `« ${t.title || "Test"} » : completion ${t.completionRate}% < 70% · usability problématique.`,
      });
    }
    const openCritical = t.findings.filter(
      (f) => (f.severity === "critical" || f.severity === "serious") && !f.fixed
    );
    if (openCritical.length > 0) {
      out.push({
        id: `test-open-crit-${t.id}`,
        severity: "error",
        block: "tests",
        message: `« ${t.title || "Test"} » : ${openCritical.length} finding(s) critique/sérieux non corrigé(s).`,
      });
    }
  }

  if (state.userTests.length > 0 && completed.length === 0) {
    out.push({
      id: "test-no-completed",
      severity: "warn",
      block: "tests",
      message: "Aucun test user terminé · validation incomplète.",
    });
  }
  return out;
}

export function validateSus(state: ValidationState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  for (const r of state.susResponses) {
    if (r.answers.length !== 10) {
      out.push({
        id: `sus-bad-answers-${r.id}`,
        severity: "warn",
        block: "sus",
        message: `« ${r.participantLabel || "?"} » : ${r.answers.length} réponses (10 attendues).`,
      });
    }
    if (r.answers.some((a) => a === 0 || a > 5)) {
      out.push({
        id: `sus-invalid-${r.id}`,
        severity: "warn",
        block: "sus",
        message: `« ${r.participantLabel || "?"} » : note invalide (doit être 1-5).`,
      });
    }
  }

  if (state.susResponses.length > 0 && state.susResponses.length < 5) {
    out.push({
      id: "sus-low-sample",
      severity: "warn",
      block: "sus",
      message: `${state.susResponses.length} réponses SUS · minimum 5 recommandé pour fiabilité.`,
    });
  }

  const avg = averageSusScore(state.susResponses);
  if (state.susResponses.length >= 3 && avg < 51) {
    out.push({
      id: "sus-low-score",
      severity: "error",
      block: "sus",
      message: `Score SUS moyen ${avg}/100 · inacceptable (bench 68). Refonte UX nécessaire.`,
    });
  }
  return out;
}

export function validateHeuristic(state: ValidationState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const evaluated = state.heuristicEvals.filter((h) => h.severity !== "none");
  if (state.heuristicEvals.length > 0 && evaluated.length < 5) {
    out.push({
      id: "heur-too-few",
      severity: "warn",
      block: "heuristic",
      message: `Seulement ${evaluated.length}/10 heuristiques évaluées · audit incomplet.`,
    });
  }
  const openCritical = state.heuristicEvals.filter(
    (h) => (h.severity === "critical" || h.severity === "serious") && !h.resolved
  );
  if (openCritical.length > 0) {
    out.push({
      id: "heur-open-crit",
      severity: "error",
      block: "heuristic",
      message: `${openCritical.length} heuristique(s) critique/sérieux non résolue(s).`,
    });
  }
  return out;
}

export function validatePmf(state: ValidationState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  for (const m of state.pmfMetrics) {
    if (m.sampleSize > 0 && m.sampleSize < 30) {
      out.push({
        id: `pmf-low-sample-${m.id}`,
        severity: "warn",
        block: "pmf",
        message: `« ${m.kind} » : échantillon ${m.sampleSize} < 30 · signal faible.`,
      });
    }
    if (m.kind === "sean-ellis" && m.value < 40 && m.sampleSize >= 30) {
      out.push({
        id: `pmf-sean-low-${m.id}`,
        severity: "warn",
        block: "pmf",
        message: `Sean Ellis ${m.value}% < 40% · PMF non atteint (Sean Ellis 40% rule).`,
      });
    }
  }
  return out;
}

export function validateValidation(state: ValidationState): ValidationIssue[] {
  return [
    ...validateUserTests(state),
    ...validateSus(state),
    ...validateHeuristic(state),
    ...validatePmf(state),
  ];
}
