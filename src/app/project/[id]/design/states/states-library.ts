// Presets pour le chap 8 États — loading, empty, error, microinteractions.
// Basés sur les meilleures pratiques Shopify Polaris, Material, Carbon, Atlassian.

import type {
  EmptyKind,
  ErrorCategory,
  ErrorTone,
  EasingKind,
  LoadingKind,
  MachineStateKind,
  MachineTransition,
  MicroTarget,
  SuccessKind,
  ToastKind,
  ToastPlacement,
} from "./state";

export interface LoadingPreset {
  kind: LoadingKind;
  trigger: string;
  minDurationMs: number;
  skeletonFields?: string;
}

export const LOADING_PRESETS: LoadingPreset[] = [
  {
    kind: "skeleton",
    trigger: "Chargement liste (projets, tâches, cards)",
    minDurationMs: 400,
    skeletonFields: "titre + 3 lignes meta + badge",
  },
  {
    kind: "spinner",
    trigger: "Action ponctuelle (clic bouton < 2s)",
    minDurationMs: 300,
  },
  {
    kind: "inline",
    trigger: "Submit formulaire",
    minDurationMs: 200,
  },
  {
    kind: "progress-determinate",
    trigger: "Upload fichier / export PDF",
    minDurationMs: 0,
  },
  {
    kind: "progress-indeterminate",
    trigger: "Opération > 2s sans % connu (ex: generate AI)",
    minDurationMs: 0,
  },
  {
    kind: "optimistic",
    trigger: "Toggle like, done, archive",
    minDurationMs: 0,
  },
];

export interface EmptyPreset {
  kind: EmptyKind;
  context: string;
  headline: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  illustration: string;
}

export const EMPTY_PRESETS: EmptyPreset[] = [
  {
    kind: "first-use",
    context: "Liste vide à la première visite",
    headline: "Crée ton premier élément",
    body: "C'est ici que s'affichera ta liste. Commence par en ajouter un — ça prend 10 secondes.",
    primaryCta: "Créer",
    secondaryCta: "Voir un exemple",
    illustration: "🌱 plante qui germe",
  },
  {
    kind: "no-results",
    context: "Recherche sans match",
    headline: "Aucun résultat pour « {query} »",
    body: "Essaie avec des mots plus larges ou vérifie l'orthographe.",
    primaryCta: "Effacer la recherche",
    secondaryCta: "",
    illustration: "🔍 loupe + point d'interrogation",
  },
  {
    kind: "filtered",
    context: "Filtres trop stricts",
    headline: "Rien ne correspond à tes filtres",
    body: "Les données existent mais tes filtres sont trop restrictifs.",
    primaryCta: "Réinitialiser les filtres",
    secondaryCta: "",
    illustration: "🎚️ sliders",
  },
  {
    kind: "cleared",
    context: "Tâches terminées (inbox zero)",
    headline: "Tout est à jour",
    body: "Aucune tâche en attente. Profites-en pour respirer.",
    primaryCta: "Ajouter une tâche",
    secondaryCta: "",
    illustration: "✅ tasse de café",
  },
  {
    kind: "error-recovery",
    context: "Fetch échoue",
    headline: "Impossible de charger",
    body: "On n'a pas pu récupérer les données. Vérifie ta connexion ou réessaie.",
    primaryCta: "Réessayer",
    secondaryCta: "Retour à l'accueil",
    illustration: "⚠️ nuage barré",
  },
];

export interface ErrorPreset {
  category: ErrorCategory;
  trigger: string;
  tone: ErrorTone;
  message: string;
  action: string;
  technicalFallback: string;
}

export const ERROR_PRESETS: ErrorPreset[] = [
  {
    category: "validation",
    trigger: "Champ email invalide",
    tone: "calm",
    message: "Format d'email invalide. Exemple : nom@domaine.fr",
    action: "Corriger",
    technicalFallback: "Regex front + re-check API côté serveur",
  },
  {
    category: "validation",
    trigger: "Champ requis vide",
    tone: "neutral",
    message: "Ce champ est requis.",
    action: "",
    technicalFallback: "HTML5 required + aria-invalid",
  },
  {
    category: "network",
    trigger: "Perte de connexion",
    tone: "calm",
    message: "Connexion instable. On réessaie automatiquement…",
    action: "Réessayer maintenant",
    technicalFallback: "navigator.onLine + retry exponential backoff",
  },
  {
    category: "server",
    trigger: "Erreur 500",
    tone: "calm",
    message: "Un problème est survenu de notre côté. Notre équipe est prévenue.",
    action: "Réessayer",
    technicalFallback: "Sentry alert + fallback UI + support link",
  },
  {
    category: "permission",
    trigger: "Accès refusé (403)",
    tone: "neutral",
    message: "Tu n'as pas accès à cette ressource.",
    action: "Retour",
    technicalFallback: "Redirect /login si non-auth, sinon /billing si plan insuffisant",
  },
  {
    category: "not-found",
    trigger: "Page / ressource introuvable (404)",
    tone: "playful",
    message: "Cette page n'existe pas (ou plus).",
    action: "Retour à l'accueil",
    technicalFallback: "Page 404 custom + recherche + derniers éléments consultés",
  },
  {
    category: "timeout",
    trigger: "Requête > 30s",
    tone: "calm",
    message: "Ça prend plus de temps que prévu. On continue en arrière-plan.",
    action: "Attendre",
    technicalFallback: "AbortController + fallback data cached",
  },
  {
    category: "rate-limit",
    trigger: "Trop de requêtes (429)",
    tone: "neutral",
    message: "Tu as atteint la limite. Réessaie dans {seconds}s.",
    action: "OK",
    technicalFallback: "Header Retry-After + compteur UI",
  },
];

export interface MicroPreset {
  target: MicroTarget;
  customTarget: string;
  states: string[];
  durationMs: number;
  easing: EasingKind;
  notes: string;
}

export const MICRO_PRESETS: MicroPreset[] = [
  {
    target: "button",
    customTarget: "",
    states: ["hover", "focus", "active", "disabled"],
    durationMs: 150,
    easing: "ease-out",
    notes: "Scale 0.98 au active · focus ring toujours visible (WCAG 2.4.7)",
  },
  {
    target: "input",
    customTarget: "",
    states: ["focus", "invalid", "disabled"],
    durationMs: 120,
    easing: "ease-out",
    notes: "Border color + ring au focus · shake horizontal si invalide",
  },
  {
    target: "card",
    customTarget: "",
    states: ["hover"],
    durationMs: 200,
    easing: "ease-out",
    notes: "Subtle lift (translateY -2px) + shadow · évite transform au mobile",
  },
  {
    target: "modal",
    customTarget: "",
    states: ["enter", "exit"],
    durationMs: 200,
    easing: "ease-out",
    notes: "Fade + scale 0.95→1 · backdrop fade simultané · trap focus",
  },
  {
    target: "toast",
    customTarget: "",
    states: ["enter", "auto-dismiss", "swipe-dismiss"],
    durationMs: 250,
    easing: "ease-out",
    notes: "Slide-in + fade · durée visible 4-6s selon longueur",
  },
  {
    target: "tab",
    customTarget: "",
    states: ["active"],
    durationMs: 200,
    easing: "ease-in-out",
    notes: "Underline animé (peer-indicator) + color change",
  },
  {
    target: "toggle",
    customTarget: "",
    states: ["on", "off"],
    durationMs: 180,
    easing: "spring",
    notes: "Spring léger · thumb translate · background color fade",
  },
];

export interface SuccessPreset {
  kind: SuccessKind;
  trigger: string;
  message: string;
  ctaNext: string;
  celebrate: boolean;
  durationMs: number;
}

export const SUCCESS_PRESETS: SuccessPreset[] = [
  {
    kind: "inline",
    trigger: "Champ sauvé (auto-save)",
    message: "Sauvegardé",
    ctaNext: "",
    celebrate: false,
    durationMs: 2000,
  },
  {
    kind: "toast",
    trigger: "Projet créé",
    message: "Projet « {name} » créé",
    ctaNext: "Ouvrir",
    celebrate: false,
    durationMs: 4000,
  },
  {
    kind: "modal",
    trigger: "Paiement validé",
    message: "Abonnement actif. Bienvenue dans Mindeck Pro.",
    ctaNext: "Voir mes features",
    celebrate: true,
    durationMs: 0,
  },
  {
    kind: "page",
    trigger: "Onboarding complété",
    message: "Tout est prêt. Commence par créer ton premier projet.",
    ctaNext: "Créer un projet",
    celebrate: false,
    durationMs: 0,
  },
  {
    kind: "celebration",
    trigger: "Premier projet créé (milestone)",
    message: "Premier projet en route ! 🎉",
    ctaNext: "Continuer",
    celebrate: true,
    durationMs: 5000,
  },
];

export interface ToastPreset {
  kind: ToastKind;
  label: string;
  placement: ToastPlacement;
  durationMs: number;
  action: string;
  dismissible: boolean;
}

export const TOAST_PRESETS: ToastPreset[] = [
  {
    kind: "success",
    label: "Projet sauvé",
    placement: "bottom-right",
    durationMs: 3000,
    action: "",
    dismissible: true,
  },
  {
    kind: "success",
    label: "Élément supprimé",
    placement: "bottom-right",
    durationMs: 5000,
    action: "Annuler",
    dismissible: true,
  },
  {
    kind: "info",
    label: "Nouvelle version disponible",
    placement: "top-right",
    durationMs: 0,
    action: "Recharger",
    dismissible: true,
  },
  {
    kind: "warn",
    label: "Connexion instable",
    placement: "top-center",
    durationMs: 0,
    action: "Réessayer",
    dismissible: false,
  },
  {
    kind: "error",
    label: "Échec de la sauvegarde",
    placement: "bottom-right",
    durationMs: 6000,
    action: "Réessayer",
    dismissible: true,
  },
];

// Templates de state machines par type d'écran
export interface MachineTemplate {
  id: string;
  label: string;
  description: string;
  states: MachineStateKind[];
  initial: MachineStateKind;
  transitions: MachineTransition[];
}

export const MACHINE_TEMPLATES: MachineTemplate[] = [
  {
    id: "list-fetch",
    label: "Liste (fetch API)",
    description: "Liste chargée depuis une API avec états loading/error/empty/success",
    states: ["idle", "loading", "success", "error", "empty"],
    initial: "idle",
    transitions: [
      { from: "idle", to: "loading", event: "mount / refresh" },
      { from: "loading", to: "success", event: "fetch success + data" },
      { from: "loading", to: "empty", event: "fetch success + no data" },
      { from: "loading", to: "error", event: "fetch error" },
      { from: "error", to: "loading", event: "retry click" },
      { from: "success", to: "loading", event: "refresh" },
      { from: "empty", to: "loading", event: "refresh" },
    ],
  },
  {
    id: "form-submit",
    label: "Formulaire (submit)",
    description: "Formulaire avec validation et submission async",
    states: ["idle", "loading", "success", "error"],
    initial: "idle",
    transitions: [
      { from: "idle", to: "loading", event: "submit click + valid" },
      { from: "loading", to: "success", event: "API success" },
      { from: "loading", to: "error", event: "API error" },
      { from: "error", to: "loading", event: "resubmit" },
      { from: "success", to: "idle", event: "reset / next" },
    ],
  },
  {
    id: "detail-optimistic",
    label: "Détail (optimistic update)",
    description: "Page détail avec mise à jour optimiste + rollback",
    states: ["idle", "loading", "success", "error", "partial"],
    initial: "loading",
    transitions: [
      { from: "loading", to: "success", event: "fetch complete" },
      { from: "success", to: "partial", event: "user edit (optimistic)" },
      { from: "partial", to: "success", event: "API confirm" },
      { from: "partial", to: "error", event: "API fail (rollback)" },
      { from: "error", to: "success", event: "retry success" },
    ],
  },
  {
    id: "offline-aware",
    label: "Offline-aware",
    description: "Machine tenant compte de la connectivité",
    states: ["idle", "loading", "success", "error", "offline"],
    initial: "idle",
    transitions: [
      { from: "idle", to: "loading", event: "action user" },
      { from: "loading", to: "offline", event: "navigator offline" },
      { from: "loading", to: "success", event: "fetch success" },
      { from: "loading", to: "error", event: "fetch error" },
      { from: "offline", to: "loading", event: "reconnect" },
    ],
  },
];

// Recommandations de contexte loading (quel pattern selon la durée)
export const LOADING_DURATION_GUIDE = [
  { maxMs: 100, recommend: "Rien · l'user ne perçoit pas le délai", emoji: "⚡" },
  { maxMs: 400, recommend: "Rien ou inline discret (Doherty threshold)", emoji: "🎯" },
  { maxMs: 1000, recommend: "Spinner ou skeleton si structure prévisible", emoji: "🔄" },
  { maxMs: 2000, recommend: "Skeleton recommandé (perçu -30%)", emoji: "🦴" },
  { maxMs: 10000, recommend: "Progress bar + message explicatif", emoji: "📊" },
  { maxMs: 999999, recommend: "Job async en background + notif fin", emoji: "📬" },
];
