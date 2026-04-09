import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TodoList from "./components/todolist";
import ThemeToggle from "./components/theme-toggle";

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
    idea: "bg-gray-600 dark:bg-gray-700",
    validating: "bg-yellow-600 dark:bg-yellow-700",
    building: "bg-blue-600 dark:bg-blue-700",
    launched: "bg-green-600 dark:bg-green-700",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">🧠 Brainstorm</h1>
          <p className="text-muted text-sm mt-1">Tes idées SaaS, structurées</p>
        </div>
        <div className="flex gap-2 items-center">
          <Link
            href="/new"
            className="px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
          >
            + Nouvelle idée
          </Link>
          <ThemeToggle />
          <form action="/auth/signout" method="post">
            <button className="px-3 py-2 text-muted text-sm hover:text-foreground transition-colors">
              Déco
            </button>
          </form>
        </div>
      </div>

      {/* Todolist */}
      <div className="mb-10">
        <TodoList userId={user.id} />
      </div>

      {/* Projets */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">📂 Projets</h2>
        <span className="text-xs text-muted">{projects?.length || 0} projet{(projects?.length || 0) !== 1 ? "s" : ""}</span>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-12 text-center">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-lg font-semibold mb-2">Aucun projet pour l&apos;instant</p>
          <p className="text-muted text-sm mb-6">
            Commence par ajouter ta première idée de SaaS
          </p>
          <Link
            href="/new"
            className="inline-flex px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
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
              className="block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{project.name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full text-white font-medium ${statusColors[project.status] || "bg-gray-600"}`}>
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
