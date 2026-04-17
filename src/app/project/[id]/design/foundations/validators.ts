import type { FoundationsState } from "./state";

export type Severity = "ok" | "warn" | "error";

export interface ValidationIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "jtbd" | "personas" | "aha" | "principles" | "jobstories" | "positioning" | "antigoals";
}

// Mots qui indiquent une "solution" plutôt qu'un job (Ulwick — solution-free)
const SOLUTION_KEYWORDS = [
  "bouton",
  "cliquer",
  "clic ",
  "dashboard",
  "interface",
  " ui ",
  "app ",
  "site ",
  "formulaire",
  "menu",
  "modal",
  "popup",
  "widget",
  "checkbox",
  "dropdown",
  "sidebar",
  "navbar",
  "footer",
  "header ",
];

// Verbes d'action acceptés pour l'aha moment (événement mesurable)
const ACTION_VERBS_RE = /\b(créer|cré[eé]|ajouter|ajout[eé]|envoyer|envoy[eé]|inviter|invit[eé]|partager|partag[eé]|publier|publi[eé]|connecter|connect[eé]|importer|import[eé]|atteindre|atteint|terminer|termin[eé]|compléter|complet[eé]|utiliser|utilis[eé]|ouvrir|ouv[ef]r|générer|gén[eé]r[eé]|faire|fait|obtenir|obten|trouver|trouv[eé])\b/i;

// Détection d'un seuil quantifié (chiffre)
const QUANTIFIED_RE = /\d+/;

// Principes génériques trop vagues sans trade-off
const GENERIC_PRINCIPLE_KEYWORDS = [
  "user-friendly",
  "simple",
  "beau",
  "rapide",
  "efficace",
  "intuitif",
  "clair",
];

export function validateJtbd(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const jtbd = state.jtbdCore.trim().toLowerCase();

  if (!jtbd) return out;

  if (jtbd.length < 15) {
    out.push({
      id: "jtbd-too-short",
      severity: "warn",
      message: "Ton JTBD est court. Ajoute un contexte : qui ? dans quelle situation ?",
      block: "jtbd",
    });
  }

  const hit = SOLUTION_KEYWORDS.find((k) => jtbd.includes(k));
  if (hit) {
    out.push({
      id: "jtbd-has-solution",
      severity: "error",
      message: `Ulwick : un JTBD doit être solution-free. Retire « ${hit.trim()} » et concentre-toi sur le progrès recherché par l'user.`,
      block: "jtbd",
    });
  }

  return out;
}

export function validatePersonas(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];

  if (state.personas.length === 0) return out;

  if (state.personas.length > 3) {
    out.push({
      id: "personas-too-many",
      severity: "warn",
      message: `${state.personas.length} personas en MVP. NN/g recommande max 3 en phase initiale.`,
      block: "personas",
    });
  }

  for (const persona of state.personas) {
    if (!persona.name.trim()) continue;
    if (!persona.context.trim() || persona.frustrations.length === 0) {
      out.push({
        id: `persona-incomplete-${persona.id}`,
        severity: "warn",
        message: `« ${persona.name} » : sans contexte + frustration, c'est un stéréotype, pas un persona.`,
        block: "personas",
      });
    }
  }

  return out;
}

export function validateAhaMoment(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const event = state.ahaMomentEvent.trim();
  const threshold = state.ahaMomentThreshold.trim();

  if (!event && !threshold) return out;

  if (event && !ACTION_VERBS_RE.test(event)) {
    out.push({
      id: "aha-no-action",
      severity: "warn",
      message: "L'événement devrait contenir un verbe d'action (créer, envoyer, inviter, etc.).",
      block: "aha",
    });
  }

  if (threshold && !QUANTIFIED_RE.test(threshold)) {
    out.push({
      id: "aha-not-quantified",
      severity: "error",
      message: "Le seuil doit être quantifié (chiffre + délai). Ex : « 7 amis en 10 jours ».",
      block: "aha",
    });
  }

  return out;
}

export function validatePrinciples(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const principles = state.designPrinciples;

  if (principles.length === 0) return out;

  if (principles.length > 5) {
    out.push({
      id: "principles-too-many",
      severity: "warn",
      message: `${principles.length} principes. Objectif 3-5 — au-delà plus personne ne les retient (Airbnb, IBM, Atlassian).`,
      block: "principles",
    });
  }

  for (const p of principles) {
    const text = p.principle.trim();
    if (!text) continue;
    if (!text.includes(">")) {
      out.push({
        id: `principle-not-opposable-${p.id}`,
        severity: "warn",
        message: `« ${text} » : un principe doit trancher un trade-off. Format A > B (ex : Clarté > Richesse).`,
        block: "principles",
      });
      continue;
    }
    const lower = text.toLowerCase();
    const generic = GENERIC_PRINCIPLE_KEYWORDS.find(
      (k) => lower === k || lower.startsWith(`${k} `) || lower.endsWith(` ${k}`)
    );
    if (generic && !text.includes(">")) {
      out.push({
        id: `principle-generic-${p.id}`,
        severity: "warn",
        message: `« ${text} » : trop générique. Tout le monde le dit, ça ne tranche rien.`,
        block: "principles",
      });
    }
  }

  return out;
}

export function validateJobStories(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  for (const js of state.jobStories) {
    if (!js.when.trim() && (js.iWant.trim() || js.soICan.trim())) {
      out.push({
        id: `jobstory-missing-when-${js.id}`,
        severity: "error",
        message: "Une job story sans contexte (When) est refusée. Paul Adams impose le contexte.",
        block: "jobstories",
      });
    }
  }
  return out;
}

export function validatePositioning(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const hasAnyPositioning =
    state.positioningUniqueAttributes.length > 0 ||
    state.positioningValue.length > 0 ||
    state.positioningSegment.trim() ||
    state.positioningCategory.trim();
  if (hasAnyPositioning && state.positioningAlternatives.length === 0) {
    out.push({
      id: "positioning-no-alternatives",
      severity: "error",
      message: "Dunford : commence par lister ce que l'user ferait sans toi (competitive alternatives).",
      block: "positioning",
    });
  }
  return out;
}

export function validateAntiGoals(state: FoundationsState): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const hasCore =
    state.jtbdCore.trim() || state.personas.length > 0 || state.designPrinciples.length > 0;
  if (hasCore && state.antiGoals.length === 0) {
    out.push({
      id: "anti-goals-empty",
      severity: "warn",
      message: "Aucun anti-goal défini. Un produit qui veut servir tout le monde ne sert personne.",
      block: "antigoals",
    });
  }
  return out;
}

export function validateFoundations(state: FoundationsState): ValidationIssue[] {
  return [
    ...validateJtbd(state),
    ...validatePersonas(state),
    ...validateAhaMoment(state),
    ...validatePrinciples(state),
    ...validateJobStories(state),
    ...validatePositioning(state),
    ...validateAntiGoals(state),
  ];
}
