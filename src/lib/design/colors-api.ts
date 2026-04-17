import { createClient } from "@/lib/supabase/client";

export interface CustomComboRow {
  id: string;
  user_id: string;
  name: string;
  style:
    | "vintage"
    | "modern"
    | "natural"
    | "pastel"
    | "corporate"
    | "playful"
    | "tech"
    | "ancient"
    | "brand"
    | "custom";
  colors: string[];
  note: string | null;
  created_at: string;
}

// ─── Couleurs favorites (stockées dans user_preferences.saved_colors) ──────

export async function fetchSavedColors(): Promise<string[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_preferences")
    .select("saved_colors")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return [];
  const raw = data.saved_colors;
  return Array.isArray(raw) ? (raw as string[]) : [];
}

export async function updateSavedColors(colors: string[]): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("user_preferences")
    .upsert(
      { user_id: user.id, saved_colors: colors, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
}

// ─── Combos personnels ──────────────────────────────────────────────────────

export async function fetchCustomCombos(): Promise<CustomComboRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("custom_color_combos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as CustomComboRow[] | null) ?? [];
}

export async function createCustomCombo(input: {
  name: string;
  colors: string[];
  style?: CustomComboRow["style"];
  note?: string;
}): Promise<CustomComboRow | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("custom_color_combos")
    .insert({
      user_id: user.id,
      name: input.name,
      colors: input.colors,
      style: input.style ?? "custom",
      note: input.note ?? null,
    })
    .select()
    .single();

  return (data as CustomComboRow | null) ?? null;
}

export async function deleteCustomComboById(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("custom_color_combos").delete().eq("id", id);
}
