import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import type { Project, Todo, Decision } from "@/lib/types";
import ProjectDashboard from "./dashboard";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) redirect("/");

  const [{ data: sections }, { data: todos }, { data: decisions }] = await Promise.all([
    supabase.from("sections").select("*").eq("project_id", id),
    supabase.from("todos").select("*").eq("project_id", id),
    supabase.from("decisions").select("*").eq("project_id", id).order("decided_at", { ascending: false }),
  ]);

  const sectionMap: Record<string, string> = {};
  sections?.forEach((s) => {
    sectionMap[s.section_key] = s.content;
  });

  return (
    <ProjectDashboard
      userId={user.id}
      project={project as Project}
      initialSections={sectionMap}
      sectionDefs={SECTIONS}
      initialTodos={(todos ?? []) as Todo[]}
      initialDecisions={(decisions ?? []) as Decision[]}
    />
  );
}
