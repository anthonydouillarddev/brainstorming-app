import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import { getProjectModules } from "@/lib/taxonomy";
import type {
  Project,
  Todo,
  Decision,
  RoadmapItem,
  Risk,
  UserPreferences,
} from "@/lib/types";
import ProjectDashboard from "./dashboard";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) redirect("/");
  if (project.deleted_at) redirect("/?tab=trash");

  const [
    { data: sections },
    { data: todos },
    { data: decisions },
    { data: roadmap },
    { data: risks },
    { data: preferences },
    modules,
  ] = await Promise.all([
    supabase.from("sections").select("*").eq("project_id", id),
    supabase.from("todos").select("*").eq("project_id", id),
    supabase
      .from("decisions")
      .select("*")
      .eq("project_id", id)
      .order("decided_at", { ascending: false }),
    supabase
      .from("roadmap_items")
      .select("*")
      .eq("project_id", id)
      .order("year", { ascending: true })
      .order("quarter", { ascending: true })
      .order("position", { ascending: true }),
    supabase
      .from("risks")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    getProjectModules(supabase, id),
  ]);

  const sectionMap: Record<string, string> = {};
  sections?.forEach((s) => {
    sectionMap[s.section_key] = s.content;
  });

  return (
    <ProjectDashboard
      userId={user.id}
      userEmail={user.email ?? ""}
      initialPreferences={(preferences as UserPreferences) ?? null}
      project={project as Project}
      initialSections={sectionMap}
      sectionDefs={SECTIONS}
      initialTodos={(todos ?? []) as Todo[]}
      initialDecisions={(decisions ?? []) as Decision[]}
      initialRoadmap={(roadmap ?? []) as RoadmapItem[]}
      initialRisks={(risks ?? []) as Risk[]}
      initialModules={modules}
      initialTab={query.tab}
    />
  );
}
