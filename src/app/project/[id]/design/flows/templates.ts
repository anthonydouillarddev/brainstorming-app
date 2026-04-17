import type { ProjectType } from "@/lib/types";
import type { FlowStep, JourneyPhase, OnboardingPattern } from "./state";
import { makePhaseId, makeStepId } from "./state";

export interface PatternInfo {
  key: OnboardingPattern;
  emoji: string;
  label: string;
  description: string;
  examples: string[];
  bestFor: string;
}

export const PATTERNS: PatternInfo[] = [
  {
    key: "self-service",
    emoji: "🔍",
    label: "Self-service",
    description: "L'user explore seul, sans guide.",
    examples: ["Notion", "Figma", "Obsidian"],
    bestFor: "Users techniques, outils horizontaux",
  },
  {
    key: "guided-tour",
    emoji: "🎯",
    label: "Guided tour",
    description: "Tooltips séquentiels qui montrent les features.",
    examples: ["Intercom", "Trello"],
    bestFor: "Features non découvrables (pattern à éviter si > 4 étapes)",
  },
  {
    key: "empty-state-teaching",
    emoji: "📭",
    label: "Empty state teaching",
    description: "La page vide explique directement quoi faire.",
    examples: ["Linear", "Superhuman", "Cron"],
    bestFor: "Tout le monde — pattern le plus universel",
  },
  {
    key: "checklist",
    emoji: "✅",
    label: "Checklist",
    description: "Progress bar + quick wins mesurables.",
    examples: ["Asana", "Slack", "Notion"],
    bestFor: "Onboarding avec plusieurs actions à compléter",
  },
  {
    key: "progressive-disclosure",
    emoji: "🎭",
    label: "Progressive disclosure",
    description: "Features révélées au fil de l'usage.",
    examples: ["Apple", "Arc"],
    bestFor: "Apps avec features avancées à protéger du débutant",
  },
  {
    key: "sample-data",
    emoji: "📦",
    label: "Sample data / template",
    description: "User atterrit sur un projet pré-rempli.",
    examples: ["Airtable", "Notion", "Excel"],
    bestFor: "Outils où l'écran vide est effrayant",
  },
];

// Recommandation par type projet
export const PATTERN_DEFAULT: Record<ProjectType, OnboardingPattern> = {
  saas: "empty-state-teaching",
  appli: "progressive-disclosure",
  outil: "sample-data",
  logiciel: "guided-tour",
  business: "checklist",
};

// Templates de flow (5 étapes) par type projet
export const FLOW_TEMPLATES: Record<ProjectType, FlowStep[]> = {
  saas: [
    {
      id: "",
      label: "Arrive sur la landing page",
      screen: "/",
      action: "Lit la value prop + clique sur CTA",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Signup minimal",
      screen: "/signup",
      action: "Email + mot de passe (2 champs)",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
      fields: 2,
    },
    {
      id: "",
      label: "Empty state pédagogique",
      screen: "/dashboard",
      action: "Voit un écran qui explique « Crée ton 1er projet »",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
    },
    {
      id: "",
      label: "Crée son premier projet",
      screen: "/new",
      action: "Nom + type (2 champs)",
      isAhaMoment: true,
      isCritical: true,
      emotion: 5,
      fields: 2,
    },
    {
      id: "",
      label: "Ajoute sa première tâche",
      screen: "/project/1",
      action: "Habit loop amorcé",
      isAhaMoment: false,
      isCritical: false,
      emotion: 5,
    },
  ],
  appli: [
    {
      id: "",
      label: "Télécharge l'app",
      screen: "App Store",
      action: "Install + lance",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Splash + valeur en 3 écrans",
      screen: "Welcome",
      action: "Swipe les 3 écrans (pas 10)",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
    },
    {
      id: "",
      label: "Entre direct dans l'app (sample data)",
      screen: "/feed",
      action: "Voit du contenu pré-rempli qui illustre la valeur",
      isAhaMoment: true,
      isCritical: true,
      emotion: 5,
    },
    {
      id: "",
      label: "Interagit (like, swipe, tap)",
      screen: "/feed",
      action: "1er engagement concret",
      isAhaMoment: false,
      isCritical: false,
      emotion: 5,
    },
    {
      id: "",
      label: "Demande permission notifs APRÈS value",
      screen: "/settings",
      action: "Accept / skip",
      isAhaMoment: false,
      isCritical: false,
      emotion: 4,
      decisions: 1,
    },
  ],
  outil: [
    {
      id: "",
      label: "Ouvre l'app",
      screen: "/",
      action: "Pas d'onboarding — direct au canvas",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
    },
    {
      id: "",
      label: "Voit sample workspace",
      screen: "/",
      action: "Comprend la valeur en 5 sec",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
    },
    {
      id: "",
      label: "Crée son 1er item",
      screen: "/",
      action: "Action de base (note, task, brick…)",
      isAhaMoment: true,
      isCritical: true,
      emotion: 5,
    },
    {
      id: "",
      label: "Découvre un raccourci",
      screen: "/",
      action: "Cmd+K ou tooltip discret",
      isAhaMoment: false,
      isCritical: false,
      emotion: 5,
    },
    {
      id: "",
      label: "Ferme + revient le lendemain",
      screen: "/",
      action: "Habit loop",
      isAhaMoment: false,
      isCritical: false,
      emotion: 4,
    },
  ],
  logiciel: [
    {
      id: "",
      label: "Formulaire demo",
      screen: "/demo",
      action: "Prospect rempli nom + entreprise + taille",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
      fields: 3,
    },
    {
      id: "",
      label: "Call de qualification",
      screen: "Hors app",
      action: "Sales valide le fit + créé l'account",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Provisioning compte",
      screen: "/admin",
      action: "Admin reçoit credentials + config initial",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Training 1-on-1",
      screen: "Hors app",
      action: "Customer success fait une session de 30min",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
    },
    {
      id: "",
      label: "1er dossier traité sans aide",
      screen: "/dossiers",
      action: "Autonomie = aha moment pour user B2B",
      isAhaMoment: true,
      isCritical: true,
      emotion: 5,
    },
  ],
  business: [
    {
      id: "",
      label: "Landing page",
      screen: "/",
      action: "Lit la proposition + clique CTA lead magnet",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Lead magnet (pdf, outil gratuit)",
      screen: "/free",
      action: "Rentre email pour recevoir",
      isAhaMoment: false,
      isCritical: true,
      emotion: 4,
      fields: 1,
    },
    {
      id: "",
      label: "Email sequence nurturing",
      screen: "Email",
      action: "3-5 emails avec valeur progressive",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    },
    {
      id: "",
      label: "Call de découverte",
      screen: "Calendly",
      action: "Book un créneau 30min",
      isAhaMoment: true,
      isCritical: true,
      emotion: 5,
    },
    {
      id: "",
      label: "Closing + onboarding payant",
      screen: "Hors app",
      action: "Signature + paiement",
      isAhaMoment: false,
      isCritical: false,
      emotion: 4,
    },
  ],
};

// Journey map AARRR (5 phases) — structure de base
export const AARRR_PHASES_TEMPLATE: Omit<JourneyPhase, "id">[] = [
  {
    name: "Discovery",
    emoji: "🔍",
    actions: "",
    thoughts: "",
    emotion: 3,
    touchpoints: [],
    frictions: [],
    opportunities: [],
  },
  {
    name: "Acquisition",
    emoji: "🎯",
    actions: "",
    thoughts: "",
    emotion: 3,
    touchpoints: [],
    frictions: [],
    opportunities: [],
  },
  {
    name: "Activation",
    emoji: "✨",
    actions: "",
    thoughts: "",
    emotion: 4,
    touchpoints: [],
    frictions: [],
    opportunities: [],
  },
  {
    name: "Retention",
    emoji: "🔁",
    actions: "",
    thoughts: "",
    emotion: 4,
    touchpoints: [],
    frictions: [],
    opportunities: [],
  },
  {
    name: "Revenue",
    emoji: "💰",
    actions: "",
    thoughts: "",
    emotion: 4,
    touchpoints: [],
    frictions: [],
    opportunities: [],
  },
];

export function stepFromTemplate(template: FlowStep): FlowStep {
  return { ...template, id: makeStepId() };
}

export function makeAarrrPhases(): JourneyPhase[] {
  return AARRR_PHASES_TEMPLATE.map((p) => ({ ...p, id: makePhaseId() }));
}
