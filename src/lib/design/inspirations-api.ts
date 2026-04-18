import { createClient } from "@/lib/supabase/client";

export type InspirationCategory =
  | "landing-hero"
  | "pricing-table"
  | "onboarding-flow"
  | "dashboard-layout"
  | "form-login"
  | "micro-interaction"
  | "navigation-pattern"
  | "empty-state";

export type InspirationStatus =
  | "collected"
  | "analyzed"
  | "implemented"
  | "archived";

export interface InspirationRow {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  category: InspirationCategory;
  source_url: string;
  screenshot_url: string;
  note: string;
  tags: string[];
  tools: string[];
  rating: number;
  status: InspirationStatus;
  position: number;
  created_at: string;
  updated_at: string;
}

const BUCKET = "inspirations";

// ─── Storage ───────────────────────────────────────────────────────────────

export async function uploadInspirationScreenshot(
  file: File
): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("[inspirations-api] uploadScreenshot failed:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteInspirationScreenshot(path: string): Promise<void> {
  if (!path) return;
  const supabase = createClient();
  const marker = `/${BUCKET}/`;
  const idx = path.indexOf(marker);
  if (idx < 0) return;
  const relative = path.slice(idx + marker.length);
  const { error } = await supabase.storage.from(BUCKET).remove([relative]);
  if (error) console.error("[inspirations-api] deleteScreenshot failed:", error);
}

// ─── CRUD inspirations ─────────────────────────────────────────────────────

export async function fetchInspirations(
  projectId?: string
): Promise<InspirationRow[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("design_ui_inspirations")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("position", { ascending: true });

  if (projectId) {
    query = query.or(`project_id.eq.${projectId},project_id.is.null`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[inspirations-api] fetchInspirations failed:", error);
    return [];
  }
  return (data as InspirationRow[] | null) ?? [];
}

export async function createInspiration(input: {
  title: string;
  category: InspirationCategory;
  project_id?: string | null;
  source_url?: string;
  screenshot_url?: string;
  note?: string;
  tags?: string[];
  tools?: string[];
  rating?: number;
  status?: InspirationStatus;
  position?: number;
}): Promise<InspirationRow | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("design_ui_inspirations")
    .insert({
      user_id: user.id,
      project_id: input.project_id ?? null,
      title: input.title,
      category: input.category,
      source_url: input.source_url ?? "",
      screenshot_url: input.screenshot_url ?? "",
      note: input.note ?? "",
      tags: input.tags ?? [],
      tools: input.tools ?? [],
      rating: input.rating ?? 3,
      status: input.status ?? "collected",
      position: input.position ?? 0,
    })
    .select()
    .single();

  if (error) {
    console.error("[inspirations-api] createInspiration failed:", error);
    throw error;
  }
  return (data as InspirationRow | null) ?? null;
}

export async function updateInspiration(
  id: string,
  patch: Partial<Omit<InspirationRow, "id" | "user_id" | "created_at">>
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("design_ui_inspirations")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) {
    console.error("[inspirations-api] updateInspiration failed:", error);
    throw error;
  }
}

export async function deleteInspiration(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("design_ui_inspirations")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[inspirations-api] deleteInspiration failed:", error);
    throw error;
  }
}
