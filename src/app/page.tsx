import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const statusLabels: Record<string, string> = {
    idea: "💭 Idée",
    validating: "🔍 Validation",
    building: "🛠️ En dev",
    launched: "🚀 Lancé",
  };

  const statusColors: Record<string, string> = {
    idea: "bg-gray-700",
    validating: "bg-yellow-700",
    building: "bg-blue-700",
    launched: "bg-green-700",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">🧠 Mes Projets</h1>
          <p className="text-muted text-sm mt-1">Brainstorming & idées SaaS</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/new"
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Nouvelle idée
          </Link>
          <form action="/auth/signout" method="post">
            <button className="px-3 py-2 text-muted text-sm hover:text-foreground transition-colors">
              Déco
            </button>
          </form>
        </div>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-lg font-medium mb-2">Aucun projet pour l&apos;instant</p>
          <p className="text-muted text-sm mb-6">
            Commence par ajouter ta première idée de SaaS
          </p>
          <Link
            href="/new"
            className="inline-flex px-5 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Nouvelle idée
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="block bg-card border border-border rounded-xl p-4 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{project.name}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full text-white ${statusColors[project.status] || "bg-gray-700"}`}>
                  {statusLabels[project.status] || project.status}
                </span>
              </div>
              <p className="text-muted text-xs mt-2">
                Mis à jour le {new Date(project.updated_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
