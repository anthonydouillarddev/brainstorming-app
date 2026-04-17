export type InfoNavMode = "beginner" | "intermediate";

export type NavPattern =
  | "sidebar"
  | "sidebar-collapsible"
  | "top-tabs"
  | "bottom-nav"
  | "hybrid"
  | "command-only";

export interface SitemapScreen {
  id: string;
  title: string;
  slug: string; // kebab-case
  emoji?: string;
  parentId: string | null;
  position: number;
  isPrimaryNav: boolean;
  description?: string;
}

export interface EntityAttribute {
  name: string;
  type: "text" | "number" | "boolean" | "date" | "enum" | "ref";
  required: boolean;
}

export interface InfoEntity {
  id: string;
  name: string;
  description: string;
  attributes: EntityAttribute[];
}

export type RelationType = "1-1" | "1-N" | "N-N";

export interface InfoRelation {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  type: RelationType;
  label: string;
}

export interface LabelMapping {
  id: string;
  internal: string;
  userFacing: string;
  context?: string;
}

export interface CommandAction {
  id: string;
  label: string;
  shortcut: string;
  scope: "global" | "contextual";
}

export interface TreeTestTask {
  id: string;
  task: string;
  expectedScreenId: string | null;
  success?: boolean;
  note?: string;
}

export interface InfoNavState {
  version: 1;

  // MUST — screens & nav
  screens: SitemapScreen[];
  navPattern: NavPattern | null;
  navItems: string[]; // screen IDs dans l'ordre de la nav principale

  // SHOULD — model & labels
  entities: InfoEntity[];
  relations: InfoRelation[];
  labels: LabelMapping[];

  // NICE — power features
  commandPalette: CommandAction[];
  treeTests: TreeTestTask[];

  // Meta
  modeUsed: InfoNavMode;
  updatedAt: string;
}

export const INFO_NAV_SECTION_KEY = "info-nav";

export const DEFAULT_INFO_NAV_STATE: InfoNavState = {
  version: 1,
  screens: [],
  navPattern: null,
  navItems: [],
  entities: [],
  relations: [],
  labels: [],
  commandPalette: [],
  treeTests: [],
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function makeScreenId(): string {
  return `scr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeEntityId(): string {
  return `ent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeRelationId(): string {
  return `rel-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeLabelId(): string {
  return `lbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeCommandId(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
export function makeTreeTaskId(): string {
  return `tt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function mergeInfoNavState(
  partial: Partial<InfoNavState> | null | undefined
): InfoNavState {
  if (!partial) return DEFAULT_INFO_NAV_STATE;
  return {
    ...DEFAULT_INFO_NAV_STATE,
    ...partial,
    screens: partial.screens ?? [],
    navItems: partial.navItems ?? [],
    entities: partial.entities ?? [],
    relations: partial.relations ?? [],
    labels: partial.labels ?? [],
    commandPalette: partial.commandPalette ?? [],
    treeTests: partial.treeTests ?? [],
  };
}

export function parseInfoNavState(content: string | undefined | null): InfoNavState {
  if (!content) return DEFAULT_INFO_NAV_STATE;
  try {
    const raw = JSON.parse(content);
    return mergeInfoNavState(raw);
  } catch {
    return DEFAULT_INFO_NAV_STATE;
  }
}

export function computeInfoNavCompleteness(state: InfoNavState): number {
  let score = 0;
  if (state.screens.length >= 3) score += 25;
  if (state.navPattern) score += 25;
  if (state.navItems.length >= 3) score += 25;
  if (state.labels.length > 0 || state.entities.length > 0) score += 25;
  return score;
}

// Helpers structurels sitemap

export function getChildren(state: InfoNavState, parentId: string | null): SitemapScreen[] {
  return state.screens
    .filter((s) => s.parentId === parentId)
    .sort((a, b) => a.position - b.position);
}

export function getScreenDepth(state: InfoNavState, screenId: string): number {
  let depth = 0;
  let current = state.screens.find((s) => s.id === screenId);
  while (current && current.parentId) {
    depth++;
    current = state.screens.find((s) => s.id === current?.parentId);
    if (depth > 10) break; // safety
  }
  return depth;
}

export function getMaxDepth(state: InfoNavState): number {
  return state.screens.reduce((max, s) => {
    const d = getScreenDepth(state, s.id);
    return d > max ? d : max;
  }, 0);
}

export function getScreenPath(state: InfoNavState, screenId: string): SitemapScreen[] {
  const chain: SitemapScreen[] = [];
  let current = state.screens.find((s) => s.id === screenId);
  let safety = 0;
  while (current && safety < 20) {
    chain.unshift(current);
    if (!current.parentId) break;
    current = state.screens.find((s) => s.id === current?.parentId);
    safety++;
  }
  return chain;
}
