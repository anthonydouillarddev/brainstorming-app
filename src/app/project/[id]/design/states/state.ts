// Chapitre 8 — États (Loading, Empty, Error, Success + Micro-interactions).
// Source : Nielsen "Visibility of system status", Doherty Threshold (400ms),
// Dan Saffer "Microinteractions", Shopify Polaris "Empty states", NN/G "Error messages".

export type StatesMode = "beginner" | "intermediate";

export type LoadingKind =
  | "skeleton"
  | "spinner"
  | "progress-determinate"
  | "progress-indeterminate"
  | "optimistic"
  | "inline";

export type EmptyKind =
  | "first-use"
  | "no-results"
  | "cleared"
  | "filtered"
  | "error-recovery";

export type ErrorCategory =
  | "validation"
  | "network"
  | "server"
  | "permission"
  | "not-found"
  | "timeout"
  | "rate-limit";

export type ErrorTone = "neutral" | "calm" | "urgent" | "playful";

export type MicroTarget =
  | "button"
  | "input"
  | "card"
  | "row"
  | "link"
  | "modal"
  | "toast"
  | "tab"
  | "toggle"
  | "custom";

export type SuccessKind = "inline" | "toast" | "modal" | "page" | "celebration";

export type ToastKind = "info" | "success" | "warn" | "error";

export type ToastPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type MachineStateKind =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "empty"
  | "partial"
  | "offline";

export type SloStatus = "ok" | "warn" | "fail";

export type ScreenArchetype = "list" | "detail" | "form" | "dashboard" | "auth" | "wizard";

export type EasingKind =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "spring";

export type StatePriority = "must" | "should" | "nice";

export interface ScreenStateEntry {
  id: string;
  title: string; // "Liste projets", "Page cockpit", etc.
  linkedScreenId?: string; // ref info-nav (optionnel)
  needsLoading: boolean;
  needsEmpty: boolean;
  needsError: boolean;
  needsSuccess: boolean;
  priority: StatePriority;
  notes: string;
}

export interface LoadingPatternEntry {
  id: string;
  kind: LoadingKind;
  trigger: string; // "Fetch liste projets", "Submit form login"
  minDurationMs: number; // seuil Doherty 400ms par défaut
  skeletonFields?: string; // pour skeleton : liste des zones (ex: "title, meta, 3 rows")
  notes: string;
}

export interface EmptyStateEntry {
  id: string;
  kind: EmptyKind;
  context: string; // "Liste projets vide", "Aucun résultat recherche"
  headline: string;
  body: string;
  primaryCta: string;
  secondaryCta: string;
  illustration: string; // description ou emoji
  notes: string;
}

export interface ErrorPatternEntry {
  id: string;
  category: ErrorCategory;
  trigger: string; // "POST /api/login échoue", "Connexion perdue"
  tone: ErrorTone;
  message: string; // ce que voit l'user (FR)
  action: string; // label du bouton recovery
  technicalFallback: string; // ex: "code erreur dans console", "Sentry breadcrumb"
  notes: string;
}

export interface MicroInteractionEntry {
  id: string;
  target: MicroTarget;
  customTarget: string; // si target === "custom"
  states: string[]; // hover, focus, active, disabled
  durationMs: number; // 150 par défaut (Doherty)
  easing: EasingKind;
  notes: string;
}

export interface SuccessPatternEntry {
  id: string;
  kind: SuccessKind;
  trigger: string; // "Form login réussi", "Projet créé"
  message: string;
  ctaNext: string; // suite logique (ex: "Aller au dashboard")
  celebrate: boolean; // confetti / emoji / sound
  durationMs: number; // pour toast/inline auto-dismiss
  notes: string;
}

export interface ToastEntry {
  id: string;
  kind: ToastKind;
  label: string; // "Projet sauvé", "Erreur réseau"
  placement: ToastPlacement;
  durationMs: number; // 4000 par défaut, 0 = sticky (action required)
  action: string; // label du bouton action (ex: "Annuler", "Voir")
  dismissible: boolean;
  notes: string;
}

export interface MachineTransition {
  from: MachineStateKind;
  to: MachineStateKind;
  event: string; // "fetch success", "retry click"
}

export interface StateMachineEntry {
  id: string;
  screenTitle: string; // peut être copié d'un ScreenStateEntry
  linkedScreenId?: string;
  states: MachineStateKind[]; // états actifs dans cette machine
  initial: MachineStateKind;
  transitions: MachineTransition[];
  notes: string;
}

export interface LatencyLogEntry {
  id: string;
  trigger: string; // "Fetch liste projets", "Submit login"
  p50Ms: number; // mesure réelle médiane
  p95Ms: number; // mesure réelle au 95e centile
  sloTargetMs: number; // objectif (Doherty = 400)
  sampleSize: number;
  sampledAt: string; // ISO date
  notes: string;
}

export interface StatesState {
  version: 1;

  // MUST
  screens: ScreenStateEntry[];
  loadingPatterns: LoadingPatternEntry[];
  emptyStates: EmptyStateEntry[];
  errorPatterns: ErrorPatternEntry[];
  microInteractions: MicroInteractionEntry[];

  // SHOULD
  successPatterns: SuccessPatternEntry[];
  toasts: ToastEntry[];
  stateMachines: StateMachineEntry[];

  // NICE
  latencyLogs: LatencyLogEntry[];

  // Meta
  modeUsed: StatesMode;
  updatedAt: string;
}

export const STATES_SECTION_KEY = "states";

export const DEFAULT_STATES_STATE: StatesState = {
  version: 1,
  screens: [],
  loadingPatterns: [],
  emptyStates: [],
  errorPatterns: [],
  microInteractions: [],
  successPatterns: [],
  toasts: [],
  stateMachines: [],
  latencyLogs: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeStatesState(
  partial: Partial<StatesState> | null | undefined
): StatesState {
  if (!partial) return DEFAULT_STATES_STATE;
  return {
    ...DEFAULT_STATES_STATE,
    ...partial,
    screens: partial.screens ?? [],
    loadingPatterns: partial.loadingPatterns ?? [],
    emptyStates: partial.emptyStates ?? [],
    errorPatterns: partial.errorPatterns ?? [],
    microInteractions: partial.microInteractions ?? [],
    successPatterns: partial.successPatterns ?? [],
    toasts: partial.toasts ?? [],
    stateMachines: partial.stateMachines ?? [],
    latencyLogs: partial.latencyLogs ?? [],
  };
}

export function parseStatesState(
  content: string | undefined | null
): StatesState {
  if (!content) return DEFAULT_STATES_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeStatesState(raw);
  } catch {
    return DEFAULT_STATES_STATE;
  }
}

export function computeStatesCompleteness(state: StatesState): number {
  let score = 0;
  // MUST — 50%
  if (state.screens.length >= 3) score += 10;
  if (state.loadingPatterns.length >= 2) score += 10;
  if (state.emptyStates.length >= 2) score += 10;
  if (state.errorPatterns.length >= 2) score += 10;
  if (state.microInteractions.length >= 2) score += 10;
  // SHOULD — 35%
  if (state.successPatterns.length >= 2) score += 12;
  if (state.toasts.length >= 2) score += 12;
  if (state.stateMachines.length >= 1) score += 11;
  // NICE — 15%
  if (state.latencyLogs.length >= 2) score += 15;
  return score;
}

// SLO compute helpers
export function computeSloStatus(entry: LatencyLogEntry): SloStatus {
  if (entry.p95Ms <= entry.sloTargetMs) return "ok";
  if (entry.p95Ms <= entry.sloTargetMs * 1.5) return "warn";
  return "fail";
}

export const SLO_STATUS_META: Record<
  SloStatus,
  { label: string; emoji: string; color: string }
> = {
  ok: { label: "OK", emoji: "✅", color: "text-green-600" },
  warn: { label: "Dégradé", emoji: "⚠️", color: "text-amber-500" },
  fail: { label: "Hors SLO", emoji: "❌", color: "text-red-500" },
};

// Archétypes d'écran → patterns recommandés
export const ARCHETYPE_REQUIREMENTS: Record<
  ScreenArchetype,
  { label: string; emoji: string; required: Array<"loading" | "empty" | "error" | "success"> }
> = {
  list: {
    label: "Liste",
    emoji: "📋",
    required: ["loading", "empty", "error"],
  },
  detail: {
    label: "Détail",
    emoji: "📄",
    required: ["loading", "error"],
  },
  form: {
    label: "Formulaire",
    emoji: "📝",
    required: ["error", "success"],
  },
  dashboard: {
    label: "Dashboard",
    emoji: "📊",
    required: ["loading", "empty", "error"],
  },
  auth: {
    label: "Auth",
    emoji: "🔐",
    required: ["error", "success"],
  },
  wizard: {
    label: "Wizard",
    emoji: "🪄",
    required: ["loading", "error", "success"],
  },
};

// Heuristique : détecter l'archétype d'un écran d'après son titre
export function guessArchetype(title: string): ScreenArchetype {
  const t = title.toLowerCase();
  if (t.match(/list|liste|index|projects|tâches|todos|inbox/)) return "list";
  if (t.match(/form|formulaire|création|nouveau|édit/)) return "form";
  if (t.match(/dashboard|cockpit|home|accueil|overview/)) return "dashboard";
  if (t.match(/login|signup|signin|auth|connexion|inscription|password|reset/)) return "auth";
  if (t.match(/wizard|onboarding|setup|étape/)) return "wizard";
  return "detail";
}

export const LOADING_KIND_META: Record<
  LoadingKind,
  { label: string; emoji: string; when: string }
> = {
  skeleton: {
    label: "Skeleton",
    emoji: "🦴",
    when: "Structure prévisible (liste, cards) · réduit perçu de -30%",
  },
  spinner: {
    label: "Spinner",
    emoji: "🔄",
    when: "Action ponctuelle courte (< 2s) · évite si > 400ms",
  },
  "progress-determinate": {
    label: "Progress (déterminé)",
    emoji: "📊",
    when: "Upload, export, batch · tu connais le %",
  },
  "progress-indeterminate": {
    label: "Progress (indéterminé)",
    emoji: "⏳",
    when: "Durée inconnue > 2s · fait patienter",
  },
  optimistic: {
    label: "Optimistic UI",
    emoji: "⚡",
    when: "Toggle like/done · commit immédiat + rollback si erreur",
  },
  inline: {
    label: "Inline (bouton)",
    emoji: "🎯",
    when: "Submit form · spinner dans le bouton",
  },
};

export const EMPTY_KIND_META: Record<
  EmptyKind,
  { label: string; emoji: string; purpose: string }
> = {
  "first-use": {
    label: "Première utilisation",
    emoji: "🌱",
    purpose: "Éducation + CTA pour créer le premier élément",
  },
  "no-results": {
    label: "Aucun résultat",
    emoji: "🔍",
    purpose: "Recherche sans match · suggère d'élargir",
  },
  cleared: {
    label: "Tout terminé",
    emoji: "✅",
    purpose: "Tâches finies / inbox zero · célébrer",
  },
  filtered: {
    label: "Filtres actifs",
    emoji: "🎚️",
    purpose: "Données existent mais filtres trop stricts",
  },
  "error-recovery": {
    label: "Erreur chargement",
    emoji: "⚠️",
    purpose: "Fail fetch · proposer retry",
  },
};

export const ERROR_CATEGORY_META: Record<
  ErrorCategory,
  { label: string; emoji: string; tip: string }
> = {
  validation: {
    label: "Validation",
    emoji: "📝",
    tip: "Inline près du champ · ton calme · action claire",
  },
  network: {
    label: "Réseau",
    emoji: "📡",
    tip: "Offline banner · retry auto · ne pas blâmer l'user",
  },
  server: {
    label: "Serveur (5xx)",
    emoji: "🔥",
    tip: "Plein page ou toast · assume la faute · contact support",
  },
  permission: {
    label: "Permission (403)",
    emoji: "🔒",
    tip: "Expliquer pourquoi · proposer login ou upgrade",
  },
  "not-found": {
    label: "Introuvable (404)",
    emoji: "🕳️",
    tip: "Plein page · lien retour · recherche",
  },
  timeout: {
    label: "Timeout",
    emoji: "⏱️",
    tip: "Retry avec backoff · explique la lenteur",
  },
  "rate-limit": {
    label: "Rate limit (429)",
    emoji: "🚦",
    tip: "Indiquer le délai d'attente · bouton désactivé temporairement",
  },
};

export const TONE_META: Record<ErrorTone, { label: string; emoji: string; example: string }> = {
  neutral: { label: "Neutre", emoji: "😐", example: "Ce champ est requis." },
  calm: { label: "Calme", emoji: "🧘", example: "Un instant, on réessaie." },
  urgent: { label: "Urgent", emoji: "🚨", example: "Action requise : vérifie ta connexion." },
  playful: { label: "Enjoué", emoji: "🎈", example: "Oups, on a perdu le fil." },
};

export const EASING_META: Record<EasingKind, string> = {
  linear: "Mécanique · pour loading",
  ease: "Défaut CSS · transitions discrètes",
  "ease-in": "Sortie · éléments qui disparaissent",
  "ease-out": "Entrée · éléments qui apparaissent",
  "ease-in-out": "Transition symétrique · toggles",
  spring: "Rebond naturel · interactions tactiles",
};

export const SUCCESS_KIND_META: Record<
  SuccessKind,
  { label: string; emoji: string; when: string }
> = {
  inline: {
    label: "Inline",
    emoji: "✔️",
    when: "Micro-action · coche verte dans le champ / près du bouton",
  },
  toast: {
    label: "Toast",
    emoji: "🍞",
    when: "Action passive · sauvegarde auto · confirmation discrète",
  },
  modal: {
    label: "Modal",
    emoji: "🪟",
    when: "Action critique · paiement réussi · requiert ack",
  },
  page: {
    label: "Page plein écran",
    emoji: "🏁",
    when: "Milestone · signup complété · onboarding terminé",
  },
  celebration: {
    label: "Célébration",
    emoji: "🎉",
    when: "Première fois · confetti + copy joyeuse",
  },
};

export const TOAST_KIND_META: Record<
  ToastKind,
  { label: string; emoji: string; color: string; use: string }
> = {
  info: {
    label: "Info",
    emoji: "ℹ️",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
    use: "Neutre · info passive · tip",
  },
  success: {
    label: "Success",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
    use: "Confirmation · action réussie",
  },
  warn: {
    label: "Warning",
    emoji: "⚠️",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
    use: "Attention · action destructive · connexion instable",
  },
  error: {
    label: "Error",
    emoji: "❌",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
    use: "Échec · action impossible",
  },
};

export const TOAST_PLACEMENT_META: Record<ToastPlacement, string> = {
  "top-left": "Haut gauche",
  "top-center": "Haut centre (mobile notif)",
  "top-right": "Haut droit (classique)",
  "bottom-left": "Bas gauche",
  "bottom-center": "Bas centre (iOS-like)",
  "bottom-right": "Bas droit (app desktop)",
};

export const MACHINE_STATE_META: Record<
  MachineStateKind,
  { label: string; emoji: string; color: string }
> = {
  idle: { label: "Idle", emoji: "💤", color: "bg-muted/10 border-muted/30" },
  loading: { label: "Loading", emoji: "⏳", color: "bg-blue-500/10 border-blue-500/30" },
  success: { label: "Success", emoji: "✅", color: "bg-green-500/10 border-green-500/30" },
  error: { label: "Error", emoji: "❌", color: "bg-red-500/10 border-red-500/30" },
  empty: { label: "Empty", emoji: "🌱", color: "bg-amber-500/10 border-amber-500/30" },
  partial: { label: "Partial", emoji: "◐", color: "bg-purple-500/10 border-purple-500/30" },
  offline: { label: "Offline", emoji: "📡", color: "bg-gray-500/10 border-gray-500/30" },
};
