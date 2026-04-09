import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SECTIONS } from "@/lib/sections";
import ProjectEditor from "./editor";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) redirect("/");

  const { data: sections } = await supabase
    .from("sections")
    .select("*")
    .eq("project_id", id);

  const sectionMap: Record<string, string> = {};
  sections?.forEach((s) => {
    sectionMap[s.section_key] = s.content;
  });

  return (
    <ProjectEditor
      project={project}
      initialSections={sectionMap}
      sectionDefs={SECTIONS}
    />
  );
}
