import { getChildren, getMaxDepth, type InfoNavState, type NavPattern } from "./state";

export type Severity = "ok" | "warn" | "error";

export interface InfoNavIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "screens" | "nav" | "labels" | "entities" | "url";
}

const GENERIC_LABELS = [
  "divers",
  "autres",
  "misc",
  "more",
  "other",
  "général",
  "plus",
  "manager",
  "workspace",
  "overview",
];

const URL_INVALID_CHARS = /[A-Z\s_]|\.(html|php|aspx)$/;

export function validateScreens(state: InfoNavState): InfoNavIssue[] {
  const out: InfoNavIssue[] = [];
  if (state.screens.length === 0) return out;

  const roots = getChildren(state, null);
  if (roots.length > 10) {
    out.push({
      id: "screens-too-many-roots",
      severity: "error",
      block: "screens",
      message: `${roots.length} pages racines. Au-delà de 10, la scanabilité s'effondre (NN/g).`,
    });
  } else if (roots.length > 7) {
    out.push({
      id: "screens-too-many-roots-warn",
      severity: "warn",
      block: "screens",
      message: `${roots.length} pages racines. Miller's Law : tu risques la surcharge à > 7 items.`,
    });
  }

  const maxDepth = getMaxDepth(state);
  if (maxDepth > 3) {
    out.push({
      id: "screens-too-deep",
      severity: "warn",
      block: "screens",
      message: `Profondeur ${maxDepth + 1} niveaux. Au-delà de 3, envisage une nav plate + recherche.`,
    });
  }

  // Labels génériques
  for (const screen of state.screens) {
    const label = screen.title.toLowerCase().trim();
    if (GENERIC_LABELS.some((g) => label === g || label.includes(` ${g}`))) {
      out.push({
        id: `screen-generic-label-${screen.id}`,
        severity: "warn",
        block: "labels",
        message: `« ${screen.title} » est un label fourre-tout. Un utilisateur doit deviner ce qu'il y a derrière (Covert).`,
      });
    }
  }

  // Duplicate labels
  const byLabel = new Map<string, string[]>();
  for (const screen of state.screens) {
    const key = screen.title.toLowerCase().trim();
    if (!key) continue;
    const list = byLabel.get(key) ?? [];
    list.push(screen.id);
    byLabel.set(key, list);
  }
  for (const [label, ids] of byLabel.entries()) {
    if (ids.length > 1) {
      out.push({
        id: `screen-duplicate-${label}`,
        severity: "error",
        block: "labels",
        message: `« ${label} » apparaît ${ids.length} fois. Deux destinations différentes avec le même label = piège.`,
      });
    }
  }

  // URL slug validation
  for (const screen of state.screens) {
    if (screen.slug && URL_INVALID_CHARS.test(screen.slug)) {
      out.push({
        id: `screen-slug-invalid-${screen.id}`,
        severity: "warn",
        block: "url",
        message: `URL « ${screen.slug} » : évite majuscules, espaces, underscores, extensions (.html).`,
      });
    }
  }

  return out;
}

export function validateNavPattern(
  state: InfoNavState,
  navPattern: NavPattern | null
): InfoNavIssue[] {
  const out: InfoNavIssue[] = [];
  const primary = state.screens.filter((s) => s.isPrimaryNav);

  if (navPattern === "bottom-nav" && primary.length > 5) {
    out.push({
      id: "nav-bottom-too-many",
      severity: "warn",
      block: "nav",
      message: `Bottom nav mobile : max 5 items (iOS HIG). Tu en as ${primary.length}.`,
    });
  }

  if (navPattern === "sidebar" && primary.length < 4 && state.screens.length > 0) {
    out.push({
      id: "nav-sidebar-too-few",
      severity: "warn",
      block: "nav",
      message: `${primary.length} items en sidebar : une top-nav serait plus naturelle (< 4 items).`,
    });
  }

  if (navPattern === "sidebar" && primary.length > 10) {
    out.push({
      id: "nav-sidebar-too-many",
      severity: "warn",
      block: "nav",
      message: `${primary.length} items en sidebar : ajoute des séparateurs ou regroupe en sections.`,
    });
  }

  if (navPattern === "command-only") {
    out.push({
      id: "nav-command-only",
      severity: "warn",
      block: "nav",
      message: `Command palette seul fonctionne pour power users uniquement. Garde une nav visible pour le grand public.`,
    });
  }

  return out;
}

export function validateOrphanPages(state: InfoNavState): InfoNavIssue[] {
  const out: InfoNavIssue[] = [];
  if (state.screens.length === 0) return out;
  // Un écran est orphan s'il n'est ni primaryNav ni enfant d'un écran
  for (const screen of state.screens) {
    if (screen.isPrimaryNav) continue;
    if (screen.parentId) {
      const parent = state.screens.find((s) => s.id === screen.parentId);
      if (parent) continue;
    }
    out.push({
      id: `screen-orphan-${screen.id}`,
      severity: "warn",
      block: "nav",
      message: `« ${screen.title} » est orphan : ni dans la nav principale, ni enfant d'une page.`,
    });
  }
  return out;
}

export function validateLabels(state: InfoNavState): InfoNavIssue[] {
  const out: InfoNavIssue[] = [];
  // Vocabulaire incohérent : "Settings" et "Réglages" dans le même sitemap
  const labels = state.screens.map((s) => s.title.toLowerCase().trim());
  const hasEnglish = labels.some((l) => l === "settings" || l === "dashboard");
  const hasFrench = labels.some((l) => l === "réglages" || l === "accueil");
  if (hasEnglish && hasFrench) {
    out.push({
      id: "labels-mixed-languages",
      severity: "warn",
      block: "labels",
      message: "Tu mixes français et anglais dans tes labels (Settings / Réglages). Choisis une langue.",
    });
  }
  return out;
}

export function validateInfoNav(
  state: InfoNavState,
  navPattern: NavPattern | null
): InfoNavIssue[] {
  return [
    ...validateScreens(state),
    ...validateNavPattern(state, navPattern),
    ...validateOrphanPages(state),
    ...validateLabels(state),
  ];
}
