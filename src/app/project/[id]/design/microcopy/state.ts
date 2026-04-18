// Chapitre 9 — Microcopy (boutons, champs, messages système, glossaire).
// Sources : Kinneret Yifrah "Microcopy book", Mailchimp content style guide,
// Shopify Polaris voice & tone, GOV.UK writing for users, Apple HIG.

export type MicrocopyMode = "beginner" | "intermediate";

export type CtaVariant = "primary" | "secondary" | "destructive" | "ghost" | "link";

export type CopyTone = "neutral" | "friendly" | "assertive" | "playful" | "formal";

export type FieldKind =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "search";

export type SystemMessageKind =
  | "confirm-destructive"
  | "confirm-action"
  | "banner-info"
  | "banner-warn"
  | "tooltip"
  | "notification"
  | "inline-help";

export type GlossaryStatus = "do" | "dont" | "neutral";

export type VoiceContext =
  | "onboarding"
  | "success"
  | "error"
  | "idle"
  | "marketing"
  | "billing"
  | "destructive"
  | "empty";

export type InclusiveAxis =
  | "gender"
  | "disability"
  | "plain-language"
  | "jargon"
  | "reading-level"
  | "cultural"
  | "age";

export type CheckStatus = "pass" | "warn" | "fail" | "unknown";

export type PlacementKind =
  | "cta-primary"
  | "cta-secondary"
  | "field-label"
  | "field-placeholder"
  | "field-helper"
  | "field-error"
  | "tooltip"
  | "toast"
  | "banner"
  | "empty-headline"
  | "empty-body"
  | "modal-title"
  | "modal-body";

export interface CtaEntry {
  id: string;
  context: string; // "Submit form login", "Dashboard header"
  label: string; // "Se connecter", "Créer un projet"
  variant: CtaVariant;
  tone: CopyTone;
  loadingLabel: string; // "Connexion…", "" si défaut
  successLabel: string; // "Envoyé", "" si défaut
  notes: string;
}

export interface FormFieldEntry {
  id: string;
  fieldName: string; // "email", "password"
  kind: FieldKind;
  label: string;
  placeholder: string;
  helperText: string;
  errorRequired: string;
  errorInvalid: string;
  notes: string;
}

export interface SystemMessageEntry {
  id: string;
  kind: SystemMessageKind;
  trigger: string; // "Supprimer projet", "Nouvelle version dispo"
  title: string; // pour confirm/banner
  body: string;
  primaryLabel: string;
  secondaryLabel: string;
  tone: CopyTone;
  notes: string;
}

export interface GlossaryEntry {
  id: string;
  term: string; // terme interne / FR officiel
  userFacingFr: string; // ce que voit l'user (FR)
  status: GlossaryStatus; // do / dont / neutral
  alternative: string; // si dont, suggérer ce qu'il faut utiliser
  context: string; // "Dans onboarding", "Page billing"
}

export interface VoiceToneEntry {
  id: string;
  context: VoiceContext;
  tone: CopyTone;
  principle: string; // "Rassurer", "Célébrer", "Clarifier"
  doExample: string;
  dontExample: string;
  notes: string;
}

export interface CopyVariant {
  text: string;
  rationale: string; // "Plus direct", "Plus amical"
}

export interface CopyVariantSet {
  id: string;
  placement: PlacementKind;
  context: string; // "CTA submit login"
  baseline: string; // version canonique (celle qu'on utilise par défaut)
  variants: CopyVariant[]; // 1 à 3 alternatives pour A/B
  hypothesis: string; // "Variante B améliore CTR"
  notes: string;
}

export interface LengthBudgetRule {
  id: string;
  placement: PlacementKind;
  maxChars: number;
  reason: string; // "Mobile 320px = ~20 chars visibles"
  exceptions: string; // "Sauf traductions longues (de, es)"
}

export interface InclusiveCheckEntry {
  id: string;
  axis: InclusiveAxis;
  rule: string; // "Éviter « les utilisateurs » → préférer « tu » ou épicène"
  status: CheckStatus;
  note: string; // remarque spécifique (exemple trouvé, plan d'action)
}

export interface MicrocopyState {
  version: 1;

  // MUST
  ctas: CtaEntry[];
  formFields: FormFieldEntry[];
  systemMessages: SystemMessageEntry[];
  glossary: GlossaryEntry[];

  // SHOULD
  voiceTones: VoiceToneEntry[];
  variantSets: CopyVariantSet[];
  lengthBudgets: LengthBudgetRule[];

  // NICE
  inclusiveChecks: InclusiveCheckEntry[];

  // Meta
  modeUsed: MicrocopyMode;
  updatedAt: string;
}

export const MICROCOPY_SECTION_KEY = "microcopy";

export const DEFAULT_MICROCOPY_STATE: MicrocopyState = {
  version: 1,
  ctas: [],
  formFields: [],
  systemMessages: [],
  glossary: [],
  voiceTones: [],
  variantSets: [],
  lengthBudgets: [],
  inclusiveChecks: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function mergeMicrocopyState(
  partial: Partial<MicrocopyState> | null | undefined
): MicrocopyState {
  if (!partial) return DEFAULT_MICROCOPY_STATE;
  return {
    ...DEFAULT_MICROCOPY_STATE,
    ...partial,
    ctas: partial.ctas ?? [],
    formFields: partial.formFields ?? [],
    systemMessages: partial.systemMessages ?? [],
    glossary: partial.glossary ?? [],
    voiceTones: partial.voiceTones ?? [],
    variantSets: partial.variantSets ?? [],
    lengthBudgets: partial.lengthBudgets ?? [],
    inclusiveChecks: partial.inclusiveChecks ?? [],
  };
}

export function parseMicrocopyState(
  content: string | undefined | null
): MicrocopyState {
  if (!content) return DEFAULT_MICROCOPY_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeMicrocopyState(raw);
  } catch {
    return DEFAULT_MICROCOPY_STATE;
  }
}

export function computeMicrocopyCompleteness(state: MicrocopyState): number {
  let score = 0;
  // MUST — 50%
  if (state.ctas.length >= 4) score += 12;
  if (state.formFields.length >= 3) score += 13;
  if (state.systemMessages.length >= 3) score += 12;
  if (state.glossary.length >= 4) score += 13;
  // SHOULD — 35%
  if (state.voiceTones.length >= 3) score += 12;
  if (state.variantSets.length >= 2) score += 11;
  if (state.lengthBudgets.length >= 3) score += 12;
  // NICE — 15%
  const passedChecks = state.inclusiveChecks.filter((c) => c.status === "pass").length;
  if (passedChecks >= 4) score += 15;
  else if (passedChecks >= 2) score += 8;
  return score;
}

export const CTA_VARIANT_META: Record<
  CtaVariant,
  { label: string; emoji: string; use: string }
> = {
  primary: {
    label: "Primary",
    emoji: "🎯",
    use: "Action principale · 1 par écran max",
  },
  secondary: {
    label: "Secondary",
    emoji: "◻️",
    use: "Action alternative · neutre",
  },
  destructive: {
    label: "Destructive",
    emoji: "🗑️",
    use: "Supprimer, annuler définitif · verbe au présent",
  },
  ghost: {
    label: "Ghost",
    emoji: "👻",
    use: "Action tertiaire · toolbar",
  },
  link: {
    label: "Link",
    emoji: "🔗",
    use: "Navigation · pas d'action",
  },
};

export const TONE_META: Record<
  CopyTone,
  { label: string; emoji: string; example: string }
> = {
  neutral: { label: "Neutre", emoji: "😐", example: "Sauvegarder" },
  friendly: { label: "Amical", emoji: "🙂", example: "On sauvegarde ça pour toi" },
  assertive: { label: "Assertif", emoji: "💪", example: "Sauvegarder maintenant" },
  playful: { label: "Enjoué", emoji: "🎈", example: "Hop, c'est sauvé !" },
  formal: { label: "Formel", emoji: "🎩", example: "Enregistrer les modifications" },
};

export const FIELD_KIND_META: Record<FieldKind, { label: string; emoji: string }> = {
  text: { label: "Text", emoji: "📝" },
  email: { label: "Email", emoji: "📧" },
  password: { label: "Password", emoji: "🔒" },
  number: { label: "Number", emoji: "🔢" },
  textarea: { label: "Textarea", emoji: "📄" },
  select: { label: "Select", emoji: "🔽" },
  checkbox: { label: "Checkbox", emoji: "☑️" },
  radio: { label: "Radio", emoji: "⚪" },
  date: { label: "Date", emoji: "📅" },
  file: { label: "File", emoji: "📎" },
  search: { label: "Search", emoji: "🔍" },
};

export const SYSTEM_MESSAGE_META: Record<
  SystemMessageKind,
  { label: string; emoji: string; tip: string }
> = {
  "confirm-destructive": {
    label: "Confirm destructif",
    emoji: "⚠️",
    tip: "Nommer l'objet · verbe au présent · bouton destructif explicite",
  },
  "confirm-action": {
    label: "Confirm action",
    emoji: "✋",
    tip: "Expliquer l'impact · CTA principal clair",
  },
  "banner-info": {
    label: "Banner info",
    emoji: "💡",
    tip: "Ton neutre · dismissible · lien vers doc",
  },
  "banner-warn": {
    label: "Banner warn",
    emoji: "⚠️",
    tip: "Expliquer pourquoi · action recommandée",
  },
  tooltip: {
    label: "Tooltip",
    emoji: "💬",
    tip: "< 80 caractères · pas d'info critique (hover inaccessible tactile)",
  },
  notification: {
    label: "Notification",
    emoji: "🔔",
    tip: "Message + auteur/source + lien vers action",
  },
  "inline-help": {
    label: "Inline help",
    emoji: "ℹ️",
    tip: "Sous le champ · pourquoi on demande cette info · format attendu",
  },
};

export const GLOSSARY_STATUS_META: Record<
  GlossaryStatus,
  { label: string; emoji: string; color: string }
> = {
  do: {
    label: "Utiliser",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  dont: {
    label: "Éviter",
    emoji: "🚫",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  neutral: {
    label: "Neutre",
    emoji: "◦",
    color: "bg-card border-border text-muted",
  },
};

export const VOICE_CONTEXT_META: Record<
  VoiceContext,
  { label: string; emoji: string; hint: string }
> = {
  onboarding: {
    label: "Onboarding",
    emoji: "🌱",
    hint: "Rassurer · éduquer · réduire la friction · first impression",
  },
  success: {
    label: "Success",
    emoji: "🎉",
    hint: "Célébrer (mesuré) · montrer la suite · peak moment",
  },
  error: {
    label: "Erreur",
    emoji: "⚠️",
    hint: "Calme · expliquer · action recovery · ne pas blâmer",
  },
  idle: {
    label: "Idle / Standard",
    emoji: "😐",
    hint: "Fonctionnel · clair · pas de perso excessive",
  },
  marketing: {
    label: "Marketing / Landing",
    emoji: "📣",
    hint: "Bénéfice > feature · proof social · claim vérifiable",
  },
  billing: {
    label: "Billing / Paiement",
    emoji: "💳",
    hint: "Transparent · précis · pas d'ambiguïté sur les montants",
  },
  destructive: {
    label: "Destructif",
    emoji: "🗑️",
    hint: "Explicite · irréversible · nom de l'objet · escape clair",
  },
  empty: {
    label: "Empty state",
    emoji: "🌿",
    hint: "Éduquer · encourager · CTA clair vers first success",
  },
};

export const INCLUSIVE_AXIS_META: Record<
  InclusiveAxis,
  { label: string; emoji: string; hint: string }
> = {
  gender: {
    label: "Genre",
    emoji: "⚧️",
    hint: "Épicène, éviter le masculin par défaut, « tu » plutôt que « l'utilisateur »",
  },
  disability: {
    label: "Handicap",
    emoji: "♿",
    hint: "Éviter « aveugle/sourd » comme métaphore, personnes-first",
  },
  "plain-language": {
    label: "Langage clair",
    emoji: "📖",
    hint: "Phrases courtes, verbes actifs, pas de négations imbriquées",
  },
  jargon: {
    label: "Jargon",
    emoji: "🎓",
    hint: "Expliquer les termes techniques, éviter les acronymes non définis",
  },
  "reading-level": {
    label: "Niveau de lecture",
    emoji: "📊",
    hint: "Cible niveau 3e (~15 ans) · phrases < 20 mots",
  },
  cultural: {
    label: "Culturel",
    emoji: "🌍",
    hint: "Éviter idiomes locaux, références spécifiques, dates format local",
  },
  age: {
    label: "Âge",
    emoji: "👥",
    hint: "Éviter la sur-familiarité juvénile en B2B, ton adapté au public",
  },
};

export const CHECK_STATUS_META: Record<
  CheckStatus,
  { label: string; emoji: string; color: string }
> = {
  pass: {
    label: "OK",
    emoji: "✅",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  warn: {
    label: "À revoir",
    emoji: "⚠️",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  fail: {
    label: "Échec",
    emoji: "❌",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  unknown: {
    label: "À vérifier",
    emoji: "◦",
    color: "bg-card border-border text-muted",
  },
};

export const PLACEMENT_META: Record<
  PlacementKind,
  { label: string; emoji: string; defaultMax: number }
> = {
  "cta-primary": { label: "CTA primary", emoji: "🎯", defaultMax: 24 },
  "cta-secondary": { label: "CTA secondary", emoji: "◻️", defaultMax: 24 },
  "field-label": { label: "Field label", emoji: "🏷️", defaultMax: 30 },
  "field-placeholder": { label: "Placeholder", emoji: "💭", defaultMax: 40 },
  "field-helper": { label: "Helper text", emoji: "💡", defaultMax: 80 },
  "field-error": { label: "Field error", emoji: "🚫", defaultMax: 80 },
  tooltip: { label: "Tooltip", emoji: "💬", defaultMax: 80 },
  toast: { label: "Toast", emoji: "🍞", defaultMax: 120 },
  banner: { label: "Banner", emoji: "📢", defaultMax: 200 },
  "empty-headline": { label: "Empty headline", emoji: "🏷️", defaultMax: 40 },
  "empty-body": { label: "Empty body", emoji: "📝", defaultMax: 160 },
  "modal-title": { label: "Modal title", emoji: "📌", defaultMax: 60 },
  "modal-body": { label: "Modal body", emoji: "📄", defaultMax: 240 },
};
