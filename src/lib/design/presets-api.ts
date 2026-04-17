import { createClient } from "@/lib/supabase/client";

export interface DesignPresetRow {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  snapshot: unknown;
  created_at: string;
  updated_at: string;
}

export async function fetchPresets(options?: {
  projectId?: string;
  onlyGlobal?: boolean;
}): Promise<DesignPresetRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("design_system_presets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (options?.onlyGlobal) {
    query = query.is("project_id", null);
  } else if (options?.projectId) {
    query = query.or(`project_id.eq.${options.projectId},project_id.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[presets-api] fetchPresets failed:", error);
    return [];
  }
  return (data as DesignPresetRow[] | null) ?? [];
}

export async function createPreset(input: {
  name: string;
  snapshot: unknown;
  projectId?: string | null;
}): Promise<DesignPresetRow | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("design_system_presets")
    .insert({
      user_id: user.id,
      project_id: input.projectId ?? null,
      name: input.name,
      snapshot: input.snapshot,
    })
    .select()
    .single();

  if (error) {
    console.error("[presets-api] createPreset failed:", error);
    throw error;
  }
  return (data as DesignPresetRow | null) ?? null;
}

export async function updatePresetSnapshot(
  id: string,
  snapshot: unknown
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("design_system_presets")
    .update({ snapshot })
    .eq("id", id);
  if (error) {
    console.error("[presets-api] updatePresetSnapshot failed:", error);
    throw error;
  }
}

export async function renamePreset(id: string, name: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("design_system_presets")
    .update({ name })
    .eq("id", id);
  if (error) {
    console.error("[presets-api] renamePreset failed:", error);
    throw error;
  }
}

export async function deletePreset(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("design_system_presets").delete().eq("id", id);
  if (error) {
    console.error("[presets-api] deletePreset failed:", error);
    throw error;
  }
}
