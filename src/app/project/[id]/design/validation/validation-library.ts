// Library chap 12 : SUS 10 questions, Nielsen 10 heuristics, PMF presets.

import type { HeuristicEvalEntry, HeuristicId } from "./state";

// 10 questions SUS officielles (John Brooke, 1986). FR traduit.
export const SUS_QUESTIONS: { index: number; text: string; polarity: "positive" | "negative" }[] = [
  {
    index: 0,
    text: "J'aimerais utiliser ce système fréquemment.",
    polarity: "positive",
  },
  {
    index: 1,
    text: "Ce système m'a semblé inutilement complexe.",
    polarity: "negative",
  },
  {
    index: 2,
    text: "Ce système était facile à utiliser.",
    polarity: "positive",
  },
  {
    index: 3,
    text: "J'aurais eu besoin du support d'un technicien pour utiliser ce système.",
    polarity: "negative",
  },
  {
    index: 4,
    text: "Les différentes fonctionnalités étaient bien intégrées.",
    polarity: "positive",
  },
  {
    index: 5,
    text: "Il y avait trop d'incohérences dans ce système.",
    polarity: "negative",
  },
  {
    index: 6,
    text: "La plupart des gens apprendraient à utiliser ce système rapidement.",
    polarity: "positive",
  },
  {
    index: 7,
    text: "J'ai trouvé le système lourd à utiliser.",
    polarity: "negative",
  },
  {
    index: 8,
    text: "Je me sentais en confiance en utilisant ce système.",
    polarity: "positive",
  },
  {
    index: 9,
    text: "J'ai dû apprendre beaucoup de choses avant de pouvoir commencer.",
    polarity: "negative",
  },
];

// 10 heuristiques Nielsen (comme eval templates)
export const HEURISTIC_EVAL_DEFAULTS: Omit<HeuristicEvalEntry, "id">[] = [
  {
    heuristic: "visibility-status",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "match-realworld",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "user-control",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "consistency-standards",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "error-prevention",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "recognition-recall",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "flexibility-efficiency",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "aesthetic-minimalist",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "error-recovery",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
  {
    heuristic: "help-documentation",
    severity: "none",
    evidence: "",
    suggestion: "",
    resolved: false,
  },
];

export function heuristicIdList(): HeuristicId[] {
  return HEURISTIC_EVAL_DEFAULTS.map((h) => h.heuristic);
}

// Grille note SUS (1 = Pas du tout d'accord, 5 = Totalement d'accord)
export const SUS_LIKERT_LABELS = [
  "Pas du tout d'accord",
  "Plutôt pas d'accord",
  "Neutre",
  "Plutôt d'accord",
  "Totalement d'accord",
];
