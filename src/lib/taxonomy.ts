import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ProjectTypeDef,
  ProjectWorld,
  ProjectModule,
  TabModule,
} from "./types";

type DbWorld = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  display_order: number;
};

type DbType = {
  id: string;
  world_id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  keywords: string[];
  display_order: number;
};

type DbModule = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  is_universal: boolean;
  is_mandatory: boolean;
  component_key: string;
};

type DbProjectModule = {
  id: string;
  project_id: string;
  module_id: string;
  enabled: boolean;
  display_order: number;
};

type DbPresetRow = {
  module_id: string;
  display_order: number;
  is_recommended: boolean;
  tab_modules: DbModule | DbModule[] | null;
};

function mapWorld(row: DbWorld): ProjectWorld {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    displayOrder: row.display_order,
  };
}

function mapType(row: DbType): ProjectTypeDef {
  return {
    id: row.id,
    worldId: row.world_id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    description: row.description,
    keywords: row.keywords ?? [],
    displayOrder: row.display_order,
  };
}

function mapModule(row: DbModule): TabModule {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    icon: row.icon,
    isUniversal: row.is_universal,
    isMandatory: row.is_mandatory,
    componentKey: row.component_key,
  };
}

function mapProjectModule(row: DbProjectModule): ProjectModule {
  return {
    id: row.id,
    projectId: row.project_id,
    moduleId: row.module_id,
    enabled: row.enabled,
    displayOrder: row.display_order,
  };
}

export async function getWorlds(supabase: SupabaseClient): Promise<ProjectWorld[]> {
  const { data, error } = await supabase
    .from("project_worlds")
    .select("id, slug, name, icon, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapWorld(row as DbWorld));
}

export async function getTypesByWorld(
  supabase: SupabaseClient,
  worldSlug: string
): Promise<ProjectTypeDef[]> {
  const { data: world, error: worldError } = await supabase
    .from("project_worlds")
    .select("id")
    .eq("slug", worldSlug)
    .maybeSingle();
  if (worldError) throw worldError;
  if (!world) return [];

  const { data, error } = await supabase
    .from("project_types")
    .select("id, world_id, slug, name, icon, description, keywords, display_order")
    .eq("world_id", world.id)
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapType(row as DbType));
}

export async function getAllTypes(supabase: SupabaseClient): Promise<ProjectTypeDef[]> {
  const { data, error } = await supabase
    .from("project_types")
    .select("id, world_id, slug, name, icon, description, keywords, display_order")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((row) => mapType(row as DbType));
}

export async function getModulePresetsForType(
  supabase: SupabaseClient,
  typeId: string
): Promise<(TabModule & { isRecommended: boolean; displayOrder: number })[]> {
  const { data, error } = await supabase
    .from("type_module_presets")
    .select(
      "module_id, display_order, is_recommended, tab_modules (id, slug, name, icon, is_universal, is_mandatory, component_key)"
    )
    .eq("type_id", typeId)
    .order("display_order", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as DbPresetRow[];
  return rows
    .map((row) => {
      const moduleRow = Array.isArray(row.tab_modules) ? row.tab_modules[0] : row.tab_modules;
      if (!moduleRow) return null;
      return {
        ...mapModule(moduleRow),
        isRecommended: row.is_recommended,
        displayOrder: row.display_order,
      };
    })
    .filter((m): m is TabModule & { isRecommended: boolean; displayOrder: number } => m !== null);
}

export async function getProjectModules(
  supabase: SupabaseClient,
  projectId: string
): Promise<(ProjectModule & { module: TabModule })[]> {
  const { data, error } = await supabase
    .from("project_modules")
    .select(
      "id, project_id, module_id, enabled, display_order, tab_modules (id, slug, name, icon, is_universal, is_mandatory, component_key)"
    )
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });
  if (error) throw error;

  const rows = (data ?? []) as (DbProjectModule & {
    tab_modules: DbModule | DbModule[] | null;
  })[];
  return rows
    .map((row) => {
      const moduleRow = Array.isArray(row.tab_modules) ? row.tab_modules[0] : row.tab_modules;
      if (!moduleRow) return null;
      return {
        ...mapProjectModule(row),
        module: mapModule(moduleRow),
      };
    })
    .filter((m): m is ProjectModule & { module: TabModule } => m !== null);
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function suggestTypeFromTitle(
  title: string,
  types: ProjectTypeDef[]
): { type: ProjectTypeDef | null; score: number; matches: string[] } {
  const normalizedTitle = normalize(title);
  if (!normalizedTitle) return { type: null, score: 0, matches: [] };

  let best: { type: ProjectTypeDef; score: number; matches: string[] } | null = null;

  for (const type of types) {
    const seen = new Set<string>();
    for (const kw of type.keywords) {
      const normalizedKw = normalize(kw);
      if (!normalizedKw || seen.has(normalizedKw)) continue;
      const pattern = new RegExp(`\\b${normalizedKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`);
      if (pattern.test(normalizedTitle)) {
        seen.add(normalizedKw);
      }
    }
    const matches = Array.from(seen);
    const score = matches.length;
    if (score < 1) continue;
    if (
      !best ||
      score > best.score ||
      (score === best.score && type.displayOrder < best.type.displayOrder)
    ) {
      best = { type, score, matches };
    }
  }

  return best ?? { type: null, score: 0, matches: [] };
}

export async function diffModulesBetweenTypes(
  supabase: SupabaseClient,
  fromTypeId: string,
  toTypeId: string
): Promise<{ common: TabModule[]; onlyInFrom: TabModule[]; onlyInTo: TabModule[] }> {
  const [fromModules, toModules] = await Promise.all([
    getModulePresetsForType(supabase, fromTypeId),
    getModulePresetsForType(supabase, toTypeId),
  ]);

  const fromIds = new Set(fromModules.map((m) => m.id));
  const toIds = new Set(toModules.map((m) => m.id));

  const stripMeta = (m: TabModule & { isRecommended: boolean; displayOrder: number }): TabModule => ({
    id: m.id,
    slug: m.slug,
    name: m.name,
    icon: m.icon,
    isUniversal: m.isUniversal,
    isMandatory: m.isMandatory,
    componentKey: m.componentKey,
  });

  const common = fromModules.filter((m) => toIds.has(m.id)).map(stripMeta);
  const onlyInFrom = fromModules.filter((m) => !toIds.has(m.id)).map(stripMeta);
  const onlyInTo = toModules.filter((m) => !fromIds.has(m.id)).map(stripMeta);

  return { common, onlyInFrom, onlyInTo };
}
