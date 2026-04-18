// Presets microcopy FR — inspirés de Mailchimp, Shopify Polaris, GOV.UK, Apple HIG.

import type {
  CtaEntry,
  CtaVariant,
  CopyTone,
  FieldKind,
  FormFieldEntry,
  GlossaryEntry,
  GlossaryStatus,
  LengthBudgetRule,
  SystemMessageEntry,
  SystemMessageKind,
  VoiceContext,
  VoiceToneEntry,
} from "./state";
import { PLACEMENT_META } from "./state";

export type CtaPreset = Omit<CtaEntry, "id">;

export const CTA_PRESETS: CtaPreset[] = [
  {
    context: "Submit formulaire login",
    label: "Se connecter",
    variant: "primary",
    tone: "neutral",
    loadingLabel: "Connexion…",
    successLabel: "",
    notes: "Verbe à l'infinitif, pas « Login » anglais",
  },
  {
    context: "Submit formulaire inscription",
    label: "Créer mon compte",
    variant: "primary",
    tone: "friendly",
    loadingLabel: "Création…",
    successLabel: "",
    notes: "Possessif « mon » = engagement",
  },
  {
    context: "Bouton annuler modal",
    label: "Annuler",
    variant: "ghost",
    tone: "neutral",
    loadingLabel: "",
    successLabel: "",
    notes: "Jamais « Non » seul",
  },
  {
    context: "Bouton suppression",
    label: "Supprimer définitivement",
    variant: "destructive",
    tone: "assertive",
    loadingLabel: "Suppression…",
    successLabel: "",
    notes: "« Définitivement » = clarifie l'irréversibilité",
  },
  {
    context: "Bouton nouveau projet",
    label: "+ Nouveau projet",
    variant: "primary",
    tone: "neutral",
    loadingLabel: "",
    successLabel: "",
    notes: "Préfixe « + » = signale la création",
  },
  {
    context: "Bouton sauvegarde",
    label: "Enregistrer",
    variant: "primary",
    tone: "neutral",
    loadingLabel: "Sauvegarde…",
    successLabel: "Sauvé",
    notes: "« Sauver » éviter — trop oral",
  },
  {
    context: "Retour arrière",
    label: "← Retour",
    variant: "ghost",
    tone: "neutral",
    loadingLabel: "",
    successLabel: "",
    notes: "Flèche aide à identifier la nav",
  },
];

export type FormFieldPreset = Omit<FormFieldEntry, "id">;

export const FORM_FIELD_PRESETS: FormFieldPreset[] = [
  {
    fieldName: "email",
    kind: "email",
    label: "Email",
    placeholder: "nom@domaine.fr",
    helperText: "On ne spam jamais, promis.",
    errorRequired: "L'email est requis pour te contacter.",
    errorInvalid: "Format invalide. Exemple : nom@domaine.fr",
    notes: "Placeholder ≠ label — jamais l'un pour l'autre",
  },
  {
    fieldName: "password",
    kind: "password",
    label: "Mot de passe",
    placeholder: "",
    helperText: "Minimum 8 caractères, au moins un chiffre.",
    errorRequired: "Le mot de passe est requis.",
    errorInvalid: "8 caractères minimum, avec au moins un chiffre.",
    notes: "Placeholder vide = ne pas suggérer d'exemple",
  },
  {
    fieldName: "projectName",
    kind: "text",
    label: "Nom du projet",
    placeholder: "Mon super projet",
    helperText: "Tu pourras le modifier plus tard.",
    errorRequired: "Un nom est requis pour créer le projet.",
    errorInvalid: "Le nom doit faire entre 2 et 80 caractères.",
    notes: "Rassurer sur la réversibilité",
  },
  {
    fieldName: "description",
    kind: "textarea",
    label: "Description",
    placeholder: "En quelques phrases, explique ce que fait ce projet…",
    helperText: "Optionnel · visible uniquement par toi.",
    errorRequired: "",
    errorInvalid: "Max 500 caractères.",
    notes: "Préciser la visibilité = réduit la friction",
  },
  {
    fieldName: "search",
    kind: "search",
    label: "Recherche",
    placeholder: "Rechercher un projet, une tâche…",
    helperText: "",
    errorRequired: "",
    errorInvalid: "",
    notes: "Placeholder illustre la syntaxe attendue",
  },
];

export type SystemMessagePreset = Omit<SystemMessageEntry, "id">;

export const SYSTEM_MESSAGE_PRESETS: SystemMessagePreset[] = [
  {
    kind: "confirm-destructive",
    trigger: "Suppression projet",
    title: "Supprimer ce projet ?",
    body: "Cette action est irréversible. Toutes les tâches, décisions et risques liés seront perdus.",
    primaryLabel: "Supprimer définitivement",
    secondaryLabel: "Annuler",
    tone: "assertive",
    notes: "Nommer l'objet · lister l'impact",
  },
  {
    kind: "confirm-action",
    trigger: "Publier / déployer",
    title: "Publier ces changements ?",
    body: "Les modifications seront visibles par tout le monde.",
    primaryLabel: "Publier",
    secondaryLabel: "Revoir avant",
    tone: "neutral",
    notes: "Préciser l'audience",
  },
  {
    kind: "banner-info",
    trigger: "Nouvelle version",
    title: "Nouvelle version disponible",
    body: "On a ajouté l'export PDF et corrigé 3 bugs.",
    primaryLabel: "Recharger",
    secondaryLabel: "Plus tard",
    tone: "friendly",
    notes: "Mentionner ce qui change",
  },
  {
    kind: "banner-warn",
    trigger: "Quota bientôt atteint",
    title: "Tu approches de la limite",
    body: "Il te reste 2 projets sur ton plan gratuit.",
    primaryLabel: "Passer au pro",
    secondaryLabel: "Gérer mes projets",
    tone: "neutral",
    notes: "Donner le chiffre exact · double issue",
  },
  {
    kind: "tooltip",
    trigger: "Hover icon ICE score",
    title: "",
    body: "ICE = Impact × Confiance × Facilité. Score pour prioriser tes idées.",
    primaryLabel: "",
    secondaryLabel: "",
    tone: "neutral",
    notes: "< 80 caractères · expliquer un acronyme",
  },
  {
    kind: "inline-help",
    trigger: "Sous champ email",
    title: "",
    body: "Utilisé pour la récupération de mot de passe uniquement.",
    primaryLabel: "",
    secondaryLabel: "",
    tone: "neutral",
    notes: "Justifier la collecte",
  },
];

export type GlossaryPreset = Omit<GlossaryEntry, "id">;

export const GLOSSARY_PRESETS: GlossaryPreset[] = [
  {
    term: "Sign in",
    userFacingFr: "Se connecter",
    status: "do",
    alternative: "",
    context: "Header, page login",
  },
  {
    term: "Login",
    userFacingFr: "Login",
    status: "dont",
    alternative: "Se connecter",
    context: "Partout — jamais en FR UI",
  },
  {
    term: "Save",
    userFacingFr: "Enregistrer",
    status: "do",
    alternative: "",
    context: "Formulaires, actions",
  },
  {
    term: "Save",
    userFacingFr: "Sauver",
    status: "dont",
    alternative: "Enregistrer",
    context: "Trop oral — éviter",
  },
  {
    term: "User",
    userFacingFr: "Utilisateur",
    status: "neutral",
    alternative: "",
    context: "Mentionner « tu » de préférence en direct",
  },
  {
    term: "Email",
    userFacingFr: "Email",
    status: "do",
    alternative: "",
    context: "« Courriel » = trop FR-FR, pas vivant",
  },
  {
    term: "Submit",
    userFacingFr: "Envoyer",
    status: "do",
    alternative: "",
    context: "Action d'un formulaire",
  },
  {
    term: "Delete forever",
    userFacingFr: "Supprimer définitivement",
    status: "do",
    alternative: "",
    context: "Dialog destructif · clarifie l'irréversibilité",
  },
];

// Règles génériques pour les warnings validators
export const GENERIC_CTA_LABELS = new Set([
  "ok",
  "oui",
  "non",
  "valider",
  "continuer",
  "suivant",
  "cliquer ici",
  "en savoir plus",
  "go",
  "submit",
  "envoyer", // ambigu seul
]);

export const FORBIDDEN_ANGLICISMS = new Set([
  "login",
  "logout",
  "signin",
  "signup",
  "password",
  "email address",
  "username",
  "forgot password",
  "remember me",
]);

// Variants <-> tone cohérence
export const VARIANT_TONE_HINTS: Record<CtaVariant, CopyTone[]> = {
  primary: ["neutral", "friendly", "assertive"],
  secondary: ["neutral"],
  destructive: ["assertive", "neutral"],
  ghost: ["neutral"],
  link: ["neutral"],
};

// Field kind -> suggestions placeholder / helper
export const FIELD_KIND_TIPS: Record<
  FieldKind,
  { placeholder: string; helper: string }
> = {
  text: { placeholder: "Exemple concret", helper: "Contexte de l'usage" },
  email: { placeholder: "nom@domaine.fr", helper: "Pourquoi on le demande" },
  password: { placeholder: "", helper: "Règles de format" },
  number: { placeholder: "0", helper: "Unité + fourchette" },
  textarea: { placeholder: "En quelques phrases…", helper: "Ce qu'on attend + longueur" },
  select: { placeholder: "Choisir…", helper: "" },
  checkbox: { placeholder: "", helper: "Conséquence du coché" },
  radio: { placeholder: "", helper: "" },
  date: { placeholder: "JJ/MM/AAAA", helper: "Format attendu" },
  file: { placeholder: "", helper: "Formats acceptés + taille max" },
  search: { placeholder: "Rechercher…", helper: "" },
};

// Re-export pour types helpers
export type { CtaVariant, FieldKind, GlossaryStatus, SystemMessageKind };

// ─────────────────────────────────────────────────────────────
// V2 SHOULD — Voice & Tone + Variants + Length Budget
// ─────────────────────────────────────────────────────────────

export type VoiceTonePreset = Omit<VoiceToneEntry, "id">;

export const VOICE_TONE_PRESETS: VoiceTonePreset[] = [
  {
    context: "onboarding",
    tone: "friendly",
    principle: "Rassurer et guider",
    doExample: "Bienvenue — 3 minutes pour créer ton premier projet.",
    dontExample: "Commencez l'onboarding en suivant les étapes suivantes.",
    notes: "Durée annoncée + tutoiement + focus sur la valeur",
  },
  {
    context: "success",
    tone: "friendly",
    principle: "Célébrer avec mesure",
    doExample: "Projet sauvé · Ouvrir",
    dontExample: "🎉🎉 BRAVO ! Succès incroyable !! 🎊",
    notes: "Une coche discrète > confettis · trop = faux",
  },
  {
    context: "error",
    tone: "neutral",
    principle: "Calme, factuel, actionnable",
    doExample: "On n'a pas pu charger les projets. Réessayer ?",
    dontExample: "ERREUR ! Quelque chose s'est mal passé.",
    notes: "Ne pas crier en MAJ · proposer une action",
  },
  {
    context: "destructive",
    tone: "assertive",
    principle: "Explicite, irréversible",
    doExample: "Supprimer définitivement ce projet ? Tu ne pourras pas revenir.",
    dontExample: "Voulez-vous confirmer cette action ?",
    notes: "Nommer l'objet + verbe clair + escape",
  },
  {
    context: "empty",
    tone: "friendly",
    principle: "Éduquer et inciter",
    doExample: "Aucun projet pour l'instant. Le premier prend 30 secondes.",
    dontExample: "Liste vide.",
    notes: "Temps annoncé + amorce positive",
  },
  {
    context: "billing",
    tone: "formal",
    principle: "Transparent et précis",
    doExample: "12,00 € / mois · facturé le 15 · annulable à tout moment.",
    dontExample: "Juste 12 € !",
    notes: "Montants complets · conditions claires · pas de hype",
  },
  {
    context: "marketing",
    tone: "assertive",
    principle: "Bénéfice > feature · proof",
    doExample: "Design ton produit en 12 chapitres guidés — 2 500+ devs actifs.",
    dontExample: "Une app puissante et intuitive !",
    notes: "Chiffre · bénéfice concret · éviter les superlatifs creux",
  },
  {
    context: "idle",
    tone: "neutral",
    principle: "Fonctionnel sans friction",
    doExample: "Enregistrer",
    dontExample: "Cliquez ici pour enregistrer vos modifications",
    notes: "Label minimum nécessaire",
  },
];

export type LengthBudgetPreset = Omit<LengthBudgetRule, "id">;

export const LENGTH_BUDGET_PRESETS: LengthBudgetPreset[] = [
  {
    placement: "cta-primary",
    maxChars: PLACEMENT_META["cta-primary"].defaultMax,
    reason: "Mobile 320px : ~20-24 caractères visibles avant wrap",
    exceptions: "OK si 2-3 mots composés (ex: Créer mon projet)",
  },
  {
    placement: "cta-secondary",
    maxChars: PLACEMENT_META["cta-secondary"].defaultMax,
    reason: "Cohérence avec CTA primary",
    exceptions: "",
  },
  {
    placement: "field-label",
    maxChars: PLACEMENT_META["field-label"].defaultMax,
    reason: "Un label court = form scannable",
    exceptions: "Labels techniques peuvent dépasser si indispensable",
  },
  {
    placement: "field-placeholder",
    maxChars: PLACEMENT_META["field-placeholder"].defaultMax,
    reason: "Le placeholder disparaît à la frappe, pas d'info critique",
    exceptions: "",
  },
  {
    placement: "field-helper",
    maxChars: PLACEMENT_META["field-helper"].defaultMax,
    reason: "Lisible sans effort · 1-2 lignes max",
    exceptions: "Si réglementaire (RGPD, PCI), dépasser OK",
  },
  {
    placement: "field-error",
    maxChars: PLACEMENT_META["field-error"].defaultMax,
    reason: "Message concis et actionnable",
    exceptions: "",
  },
  {
    placement: "tooltip",
    maxChars: PLACEMENT_META.tooltip.defaultMax,
    reason: "Tooltip = hint, pas doc. Au-delà, passe à popover.",
    exceptions: "Remplacer par inline-help si plus long",
  },
  {
    placement: "toast",
    maxChars: PLACEMENT_META.toast.defaultMax,
    reason: "Lecture rapide avant dismiss auto",
    exceptions: "Erreur critique : sticky + jusqu'à 200 caractères",
  },
  {
    placement: "empty-headline",
    maxChars: PLACEMENT_META["empty-headline"].defaultMax,
    reason: "Scan rapide — action claire",
    exceptions: "",
  },
];

// V3 NICE — Inclusive language presets
export interface InclusivePreset {
  axis:
    | "gender"
    | "disability"
    | "plain-language"
    | "jargon"
    | "reading-level"
    | "cultural"
    | "age";
  rule: string;
}

export const INCLUSIVE_PRESETS: InclusivePreset[] = [
  {
    axis: "gender",
    rule: "Tutoyer l'user (« tu ») plutôt que « l'utilisateur » / « les utilisateurs ».",
  },
  {
    axis: "gender",
    rule: "Préférer les formulations épicènes : « personne », « équipe », « collaboration ».",
  },
  {
    axis: "gender",
    rule: "Éviter le point médian (utilisateur·rice) : préférer reformuler (« Tu peux »).",
  },
  {
    axis: "plain-language",
    rule: "Phrases < 20 mots. Verbes actifs. Éviter les doubles négations.",
  },
  {
    axis: "plain-language",
    rule: "Un seul message par phrase. Une seule action par CTA.",
  },
  {
    axis: "jargon",
    rule: "Définir tout acronyme à sa première occurrence (ICE, ADR, NSM…).",
  },
  {
    axis: "jargon",
    rule: "Remplacer les termes techniques inutiles (« authentifier » → « te connecter »).",
  },
  {
    axis: "reading-level",
    rule: "Cible niveau 3e (~15 ans). Pas de vocabulaire littéraire.",
  },
  {
    axis: "cultural",
    rule: "Éviter les idiomes locaux (« tirer son épingle du jeu », « cerise sur le gâteau »).",
  },
  {
    axis: "cultural",
    rule: "Format date ISO ou français complet (« 15 janvier », pas « 1/15 »).",
  },
  {
    axis: "disability",
    rule: "Ne pas utiliser « aveugle », « sourd » comme métaphore négative.",
  },
  {
    axis: "disability",
    rule: "Person-first : « personne en situation de handicap » plutôt que « handicapé ».",
  },
  {
    axis: "age",
    rule: "Adapter le ton au public (B2B pro ≠ app ado). Éviter la sur-familiarité.",
  },
];

// Cohérence contexte → ton canonique (warnings si mismatch)
export const CONTEXT_TONE_EXPECTATIONS: Record<VoiceContext, CopyTone[]> = {
  onboarding: ["friendly", "neutral"],
  success: ["friendly", "neutral", "playful"],
  error: ["neutral", "assertive"],
  idle: ["neutral"],
  marketing: ["assertive", "friendly", "playful"],
  billing: ["formal", "neutral"],
  destructive: ["assertive", "neutral"],
  empty: ["friendly", "neutral"],
};
