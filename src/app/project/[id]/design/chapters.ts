// Les 12 chapitres de l'onglet Design (issus du workflow de recherche Phase 1).
// Ordre : du stratégique à l'opérationnel (Double Diamond compressé).

export type DesignChapterKey =
  | "foundations"
  | "identity"
  | "info-nav"
  | "flows"
  | "principles"
  | "visual"
  | "design-system"
  | "states"
  | "microcopy"
  | "a11y"
  | "adaptivity"
  | "validation";

export interface DesignChapter {
  key: DesignChapterKey;
  num: number;
  emoji: string;
  label: string;
  hint: string;
  status: "ready" | "wip" | "bientot";
}

export const DESIGN_CHAPTERS: DesignChapter[] = [
  { key: "foundations", num: 1, emoji: "📐", label: "Fondations", hint: "JTBD, personas, principes", status: "ready" },
  { key: "identity", num: 2, emoji: "🎭", label: "Identité & Ton", hint: "Archétype, voice & tone", status: "ready" },
  { key: "info-nav", num: 3, emoji: "🧭", label: "Info & Nav", hint: "Sitemap, navigation", status: "ready" },
  { key: "flows", num: 4, emoji: "🛣️", label: "Parcours", hint: "User flows, onboarding", status: "ready" },
  { key: "principles", num: 5, emoji: "🧠", label: "Principes UX", hint: "Lois Nielsen, Norman, Yablonski", status: "bientot" },
  { key: "visual", num: 6, emoji: "🎨", label: "Visuel", hint: "Couleurs, typo, spacing, tokens", status: "ready" },
  { key: "design-system", num: 7, emoji: "🧱", label: "Design System", hint: "Tokens, composants, patterns", status: "bientot" },
  { key: "states", num: 8, emoji: "⚡", label: "États", hint: "Loading, empty, error, micro-interactions", status: "bientot" },
  { key: "microcopy", num: 9, emoji: "✍️", label: "Microcopy", hint: "Boutons, erreurs, messages", status: "bientot" },
  { key: "a11y", num: 10, emoji: "♿", label: "Accessibilité", hint: "WCAG 2.2, inclusion", status: "bientot" },
  { key: "adaptivity", num: 11, emoji: "📱", label: "Adaptativité", hint: "Responsive, dark mode, densité", status: "bientot" },
  { key: "validation", num: 12, emoji: "🧪", label: "Validation", hint: "Tests users, SUS, PMF", status: "bientot" },
];
