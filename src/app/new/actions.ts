"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ProjectType } from "@/lib/types";

type CreateInput = {
  name: string;
  typeId: string;
  selectedModuleIds: string[];
};

type CreateResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string };

const LEGACY_TYPE_BY_SLUG: Record<string, ProjectType> = {
  saas: "saas",
  "app-mobile": "appli",
  "outil-autre": "outil",
  "logiciel-metier": "logiciel",
  "autre-tech": "logiciel",
  "marque-ecommerce": "business",
  infopreneur: "business",
  "agence-digitale": "business",
  marketplace: "business",
  "autre-business-online": "business",
  "commerce-local": "business",
  restauration: "business",
  "service-physique": "business",
  "autre-business-physique": "business",
  artiste: "business",
  "createur-contenu": "business",
  "projet-edition": "business",
  "autre-creatif": "business",
};

function legacyTypeFromSlug(slug: string): ProjectType {
  return LEGACY_TYPE_BY_SLUG[slug] ?? "outil";
}

export async function createProjectWithModules(
  input: CreateInput
): Promise<CreateResult> {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) {
    return { ok: false, error: "Le nom doit faire entre 2 et 100 caractères" };
  }
  if (!input.typeId) {
    return { ok: false, error: "Type de projet manquant" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { data: typeRow, error: typeError } = await supabase
    .from("project_types")
    .select("id, slug")
    .eq("id", input.typeId)
    .maybeSingle();
  if (typeError) return { ok: false, error: typeError.message };
  if (!typeRow) return { ok: false, error: "Type de projet introuvable" };

  const { data: presets, error: presetsError } = await supabase
    .from("type_module_presets")
    .select("module_id, display_order, tab_modules (id, is_mandatory)")
    .eq("type_id", typeRow.id);
  if (presetsError) return { ok: false, error: presetsError.message };

  type PresetRow = {
    module_id: string;
    display_order: number;
    tab_modules:
      | { id: string; is_mandatory: boolean }
      | { id: string; is_mandatory: boolean }[]
      | null;
  };

  const presetRows = (presets ?? []) as PresetRow[];
  const mandatoryIds = new Set<string>();
  const presetById = new Map<string, number>();
  for (const row of presetRows) {
    const modRow = Array.isArray(row.tab_modules) ? row.tab_modules[0] : row.tab_modules;
    presetById.set(row.module_id, row.display_order);
    if (modRow?.is_mandatory) mandatoryIds.add(row.module_id);
  }

  const selected = new Set(input.selectedModuleIds);
  for (const id of mandatoryIds) {
    if (!selected.has(id)) selected.add(id);
  }

  const legacyType = legacyTypeFromSlug(typeRow.slug);

  const { data: projectRow, error: insertError } = await supabase
    .from("projects")
    .insert({
      name,
      type: legacyType,
      type_id: typeRow.id,
      user_id: user.id,
    })
    .select("id")
    .single();
  if (insertError || !projectRow) {
    return { ok: false, error: insertError?.message ?? "Création impossible" };
  }

  const moduleRows = Array.from(selected).map((moduleId) => ({
    project_id: projectRow.id,
    module_id: moduleId,
    enabled: true,
    display_order: presetById.get(moduleId) ?? 999,
  }));

  if (moduleRows.length > 0) {
    const { error: modulesError } = await supabase
      .from("project_modules")
      .insert(moduleRows);
    if (modulesError) {
      await supabase.from("projects").delete().eq("id", projectRow.id);
      return { ok: false, error: modulesError.message };
    }
  }

  revalidatePath("/");
  return { ok: true, projectId: projectRow.id };
}
