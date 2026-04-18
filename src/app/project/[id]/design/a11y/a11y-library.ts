// Bibliothèque WCAG 2.2 AA + ARIA patterns essentiels.
// Source : W3C WCAG 2.2 (2024), ARIA Authoring Practices Guide.

import type {
  AssistiveTech,
  Browser,
  CognitiveAxis,
  MotionAxis,
  WcagCheckEntry,
  WcagLevel,
  WcagPrinciple,
} from "./state";

export interface WcagCriterionPreset {
  criterionId: string;
  title: string;
  principle: WcagPrinciple;
  level: WcagLevel;
  hint: string;
}

// 30 critères WCAG 2.2 AA les plus impactants (sous-ensemble priorisé)
export const WCAG_CRITERIA: WcagCriterionPreset[] = [
  // ─── Perceivable ───
  {
    criterionId: "1.1.1",
    title: "Contenu non textuel",
    principle: "perceivable",
    level: "A",
    hint: "alt sur toutes les images · alt='' si décoratif",
  },
  {
    criterionId: "1.3.1",
    title: "Info et relations",
    principle: "perceivable",
    level: "A",
    hint: "Structure sémantique · headings h1-h6 · <label> pour inputs",
  },
  {
    criterionId: "1.3.2",
    title: "Ordre séquentiel logique",
    principle: "perceivable",
    level: "A",
    hint: "Lecture DOM = lecture visuelle · pas d'ordre inversé via CSS",
  },
  {
    criterionId: "1.3.5",
    title: "Identification de la finalité des champs",
    principle: "perceivable",
    level: "AA",
    hint: "autocomplete='email' sur les champs email, etc.",
  },
  {
    criterionId: "1.4.1",
    title: "Utilisation de la couleur",
    principle: "perceivable",
    level: "A",
    hint: "Ne pas coder par couleur seule · ajouter icône/texte",
  },
  {
    criterionId: "1.4.3",
    title: "Contraste minimum",
    principle: "perceivable",
    level: "AA",
    hint: "4.5:1 texte normal · 3:1 texte large (≥18pt ou ≥14pt gras)",
  },
  {
    criterionId: "1.4.4",
    title: "Redimensionnement du texte 200%",
    principle: "perceivable",
    level: "AA",
    hint: "Texte doit pouvoir être zoomé 200% sans perte",
  },
  {
    criterionId: "1.4.10",
    title: "Reflow",
    principle: "perceivable",
    level: "AA",
    hint: "Pas de scroll horizontal à 320px / zoom 400%",
  },
  {
    criterionId: "1.4.11",
    title: "Contraste non textuel",
    principle: "perceivable",
    level: "AA",
    hint: "3:1 sur boutons, icônes, bordures d'inputs focus",
  },
  {
    criterionId: "1.4.12",
    title: "Espacement du texte",
    principle: "perceivable",
    level: "AA",
    hint: "Line-height 1.5 · paragraphe 2× · pas de texte coupé",
  },
  // ─── Operable ───
  {
    criterionId: "2.1.1",
    title: "Clavier",
    principle: "operable",
    level: "A",
    hint: "Toutes les fonctions accessibles au clavier · pas de souris requise",
  },
  {
    criterionId: "2.1.2",
    title: "Pas de piège au clavier",
    principle: "operable",
    level: "A",
    hint: "Pouvoir sortir de tout composant au Tab ou Esc",
  },
  {
    criterionId: "2.1.4",
    title: "Raccourcis clavier caractère",
    principle: "operable",
    level: "A",
    hint: "Shortcuts à 1 touche désactivables ou reconfigurables",
  },
  {
    criterionId: "2.4.1",
    title: "Contourner des blocs",
    principle: "operable",
    level: "A",
    hint: "Skip link 'Aller au contenu' visible au focus",
  },
  {
    criterionId: "2.4.2",
    title: "Titre de la page",
    principle: "operable",
    level: "A",
    hint: "<title> unique et descriptif par page",
  },
  {
    criterionId: "2.4.3",
    title: "Ordre du focus",
    principle: "operable",
    level: "A",
    hint: "Ordre Tab logique · ne pas utiliser tabindex positif",
  },
  {
    criterionId: "2.4.4",
    title: "Fonction du lien (in-context)",
    principle: "operable",
    level: "A",
    hint: "Pas de 'cliquez ici' · contexte clair sur la destination",
  },
  {
    criterionId: "2.4.6",
    title: "En-têtes et étiquettes",
    principle: "operable",
    level: "AA",
    hint: "Headings et labels décrivent précisément leur contenu",
  },
  {
    criterionId: "2.4.7",
    title: "Visibilité du focus",
    principle: "operable",
    level: "AA",
    hint: "Focus visible sur TOUT élément interactif · ring ≥ 2px",
  },
  {
    criterionId: "2.4.11",
    title: "Focus non masqué (min)",
    principle: "operable",
    level: "AA",
    hint: "WCAG 2.2 : focus jamais 100% caché (sticky header, overlay)",
  },
  {
    criterionId: "2.5.3",
    title: "Étiquette dans le nom",
    principle: "operable",
    level: "A",
    hint: "aria-label inclut le texte visible (voice control)",
  },
  {
    criterionId: "2.5.7",
    title: "Mouvements de glissement",
    principle: "operable",
    level: "AA",
    hint: "WCAG 2.2 : alternative non-drag (click) pour tout drag",
  },
  {
    criterionId: "2.5.8",
    title: "Cible tactile (min)",
    principle: "operable",
    level: "AA",
    hint: "WCAG 2.2 : cibles tactiles ≥ 24×24 CSS px (ou espacement suffisant)",
  },
  // ─── Understandable ───
  {
    criterionId: "3.1.1",
    title: "Langue de la page",
    principle: "understandable",
    level: "A",
    hint: "<html lang='fr'> · crucial pour screen readers",
  },
  {
    criterionId: "3.2.1",
    title: "Au focus",
    principle: "understandable",
    level: "A",
    hint: "Focus ne change pas le contexte (pas de submit auto)",
  },
  {
    criterionId: "3.2.2",
    title: "À la saisie",
    principle: "understandable",
    level: "A",
    hint: "Changer la valeur d'un input ne change pas le contexte",
  },
  {
    criterionId: "3.3.1",
    title: "Identification des erreurs",
    principle: "understandable",
    level: "A",
    hint: "Erreurs identifiées en texte · champ invalide marqué (aria-invalid)",
  },
  {
    criterionId: "3.3.2",
    title: "Étiquettes ou instructions",
    principle: "understandable",
    level: "A",
    hint: "Label ou instruction claire sur chaque champ",
  },
  {
    criterionId: "3.3.3",
    title: "Suggestion après erreur",
    principle: "understandable",
    level: "AA",
    hint: "Message d'erreur suggère comment corriger",
  },
  {
    criterionId: "3.3.7",
    title: "Saisie redondante",
    principle: "understandable",
    level: "A",
    hint: "WCAG 2.2 : ne pas redemander la même info dans un flow",
  },
  // ─── Robust ───
  {
    criterionId: "4.1.2",
    title: "Nom, rôle, valeur",
    principle: "robust",
    level: "A",
    hint: "Composants custom : role, aria-label/name, state (aria-expanded, aria-checked)",
  },
  {
    criterionId: "4.1.3",
    title: "Messages d'état",
    principle: "robust",
    level: "AA",
    hint: "Status (toast, loading) annoncé via aria-live ou role='status'",
  },
];

export function wcagPresetsToEntries(
  presets: WcagCriterionPreset[]
): Omit<WcagCheckEntry, "id">[] {
  return presets.map((p) => ({
    criterionId: p.criterionId,
    title: p.title,
    principle: p.principle,
    level: p.level,
    status: "unknown" as const,
    note: p.hint,
  }));
}

// Landmarks obligatoires minimaux (banner, navigation, main, contentinfo)
export const LANDMARK_DEFAULTS = [
  {
    landmark: "banner" as const,
    present: false,
    label: "",
    notes: "Un seul par page · en-tête global",
  },
  {
    landmark: "navigation" as const,
    present: false,
    label: "Navigation principale",
    notes: "Si plusieurs, différencier avec aria-label",
  },
  {
    landmark: "main" as const,
    present: false,
    label: "",
    notes: "Un seul par page · cible du skip link",
  },
  {
    landmark: "contentinfo" as const,
    present: false,
    label: "",
    notes: "Footer global · un seul par page",
  },
];

// Live regions fréquents
export const LIVE_REGION_PRESETS = [
  {
    context: "Toasts success (sauvegarde, confirmation)",
    politeness: "polite" as const,
    atomic: true,
    notes: "aria-live='polite' aria-atomic='true'",
  },
  {
    context: "Erreurs critiques / alertes",
    politeness: "assertive" as const,
    atomic: true,
    notes: "aria-live='assertive' ou role='alert'",
  },
  {
    context: "Résultats de recherche live",
    politeness: "polite" as const,
    atomic: false,
    notes: "Annoncer le nombre de résultats",
  },
];

// ─────────────────────────────────────────────────────────────
// V2 SHOULD — Assistive Tech combos + Cognitive + Motion
// ─────────────────────────────────────────────────────────────

export interface AssistiveTechCombo {
  at: AssistiveTech;
  browser: Browser;
  priority: "required" | "recommended";
  reason: string;
}

// Combos AT × Browser les plus utilisés (WebAIM Screen Reader Survey 2024)
export const AT_COMBOS: AssistiveTechCombo[] = [
  {
    at: "nvda",
    browser: "chrome",
    priority: "required",
    reason: "NVDA + Chrome = 36% des users screen reader (WebAIM 2024)",
  },
  {
    at: "nvda",
    browser: "firefox",
    priority: "required",
    reason: "NVDA + Firefox = combo historique · bien supporté",
  },
  {
    at: "jaws",
    browser: "chrome",
    priority: "required",
    reason: "JAWS + Chrome = dominant entreprise",
  },
  {
    at: "voiceover-macos",
    browser: "safari",
    priority: "required",
    reason: "VO macOS ne fonctionne bien qu'avec Safari",
  },
  {
    at: "voiceover-ios",
    browser: "safari",
    priority: "required",
    reason: "iOS = Safari obligatoire · mobile critique",
  },
  {
    at: "talkback",
    browser: "chrome",
    priority: "recommended",
    reason: "Android · audience mobile",
  },
  {
    at: "narrator",
    browser: "edge",
    priority: "recommended",
    reason: "Windows natif · usage en croissance",
  },
];

export interface CognitivePreset {
  axis: CognitiveAxis;
  rule: string;
}

export const COGNITIVE_PRESETS: CognitivePreset[] = [
  {
    axis: "memory-load",
    rule: "Autocomplete sur email, adresse, moyens de paiement (autocomplete='email').",
  },
  {
    axis: "memory-load",
    rule: "Brouillon auto-sauvé · récupération possible après timeout / crash.",
  },
  {
    axis: "plain-language",
    rule: "Phrases < 20 mots · verbes actifs · 1 idée par paragraphe.",
  },
  {
    axis: "plain-language",
    rule: "Définir tout acronyme à sa 1re occurrence (tooltip ou parenthèse).",
  },
  {
    axis: "time-limits",
    rule: "WCAG 2.2.1 : warning 20s avant timeout + bouton 'Prolonger'.",
  },
  {
    axis: "time-limits",
    rule: "Pas de limite temps sur tâches critiques (paiement, formulaire long).",
  },
  {
    axis: "error-prevention",
    rule: "WCAG 3.3.4 : actions destructives = confirmation + undo post-action.",
  },
  {
    axis: "error-prevention",
    rule: "Validation live (blur) avant submit · pas de piège au submit.",
  },
  {
    axis: "attention",
    rule: "Un seul CTA primary par écran · écarts visuels suffisants.",
  },
  {
    axis: "attention",
    rule: "Pas de popup/modal forcé · user initie l'interaction.",
  },
  {
    axis: "consistency",
    rule: "Même labels, même nav, même icônes partout (cohérence transverse).",
  },
  {
    axis: "help-access",
    rule: "Lien support / FAQ accessible en < 3 clics depuis toute page.",
  },
  {
    axis: "help-access",
    rule: "Messages d'erreur incluent comment contacter l'aide si bloquant.",
  },
];

export interface MotionPreset {
  axis: MotionAxis;
  implementation: string;
  notes: string;
}

export const MOTION_PRESETS: MotionPreset[] = [
  {
    axis: "reduced-motion",
    implementation: "@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms; transition-duration: 0.01ms; } }",
    notes: "WCAG 2.3.3 · conserver animations essentielles mais sans parallaxe",
  },
  {
    axis: "reduced-transparency",
    implementation: "@media (prefers-reduced-transparency: reduce) { .backdrop-blur { backdrop-filter: none; background: opaque; } }",
    notes: "Remplacer bg-card/80 backdrop-blur par fond opaque",
  },
  {
    axis: "increased-contrast",
    implementation: "@media (prefers-contrast: more) { :root { --bd: #000; --mt: #333; } }",
    notes: "Renforcer bordures et texte secondaire",
  },
  {
    axis: "flash-safety",
    implementation: "Pas de flash > 3 Hz · pas de grandes zones rouges saturées qui clignotent",
    notes: "WCAG 2.3.1 AA bloquant · risque épilepsie photosensible",
  },
  {
    axis: "autoplay",
    implementation: "<video muted playsinline> + controls · user start l'audio",
    notes: "WCAG 1.4.2 · jamais d'autoplay audio > 3s sans contrôle",
  },
  {
    axis: "animation-pause",
    implementation: "Bouton Pause sur toute animation > 5s qui commence auto",
    notes: "WCAG 2.2.2 · applicable aux carrousels, spinners longs, loaders",
  },
];

// Patterns ARIA fréquents d'une app SaaS
export const ARIA_PATTERN_PRESETS = [
  {
    widget: "dialog" as const,
    usage: "Modals (confirmation, formulaire)",
    keyboardInteractions: "Esc (close), Tab trap focus, focus initial sur premier élément",
    notes: "aria-modal='true' + aria-labelledby + aria-describedby",
  },
  {
    widget: "combobox" as const,
    usage: "Sélection type projet, tags autocomplete",
    keyboardInteractions: "ArrowDown/Up, Home, End, Enter, Esc",
    notes: "Pattern APG combobox 1.2 · avec listbox associée",
  },
  {
    widget: "tabs" as const,
    usage: "Dashboard projet (7 onglets)",
    keyboardInteractions: "ArrowLeft/Right, Home, End · Tab sort hors de la tab list",
    notes: "role='tablist' + role='tab' + aria-selected + role='tabpanel'",
  },
  {
    widget: "disclosure" as const,
    usage: "Sections collapsibles (FAQ, blocks)",
    keyboardInteractions: "Space, Enter",
    notes: "aria-expanded sur le trigger · aria-controls='panel-id'",
  },
  {
    widget: "menu" as const,
    usage: "Dropdown menu (user avatar)",
    keyboardInteractions: "ArrowDown/Up, Esc, Home, End, type-ahead",
    notes: "role='menu' + role='menuitem' · focus management crucial",
  },
];
