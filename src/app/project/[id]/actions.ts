"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ToggleResult = { ok: true } | { ok: false; error: string };

export async function toggleProjectModule(
  projectId: string,
  moduleId: string,
  enabled: boolean
): Promise<ToggleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id")
    .eq("id", projectId)
    .maybeSingle();
  if (projectError) return { ok: false, error: projectError.message };
  if (!project || project.user_id !== user.id) {
    return { ok: false, error: "Projet introuvable" };
  }

  const { data: module, error: moduleError } = await supabase
    .from("tab_modules")
    .select("id, is_mandatory")
    .eq("id", moduleId)
    .maybeSingle();
  if (moduleError) return { ok: false, error: moduleError.message };
  if (!module) return { ok: false, error: "Module introuvable" };

  if (module.is_mandatory && !enabled) {
    return { ok: false, error: "Ce module ne peut pas être désactivé" };
  }

  const { data: existing } = await supabase
    .from("project_modules")
    .select("id")
    .eq("project_id", projectId)
    .eq("module_id", moduleId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("project_modules")
      .update({ enabled, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: maxRow } = await supabase
      .from("project_modules")
      .select("display_order")
      .eq("project_id", projectId)
      .order("display_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextOrder = (maxRow?.display_order ?? 0) + 10;
    const { error } = await supabase.from("project_modules").insert({
      project_id: projectId,
      module_id: moduleId,
      enabled,
      display_order: nextOrder,
    });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/project/${projectId}`);
  return { ok: true };
}
