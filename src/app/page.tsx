import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TodoList from "./components/todolist";
import ThemeToggle from "./components/theme-toggle";
import { PROJECT_STATUSES, PROJECT_TYPES, type Project } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const typedProjects = (projects ?? []) as Project[];

  const statusMap = new Map(PROJECT_STATUSES.map((s) => [s.value, s]));
  const typeMap = new Map(PROJECT_TYPES.map((t) => [t.value, t]));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">🧠 Brainstorm</h1>
          <p className="text-muted text-sm mt-1">Pilote tes projets de l&apos;idée au lancement</p>
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

      {/* Todolist globale */}
      <div className="mb-10">
        <TodoList userId={user.id} />
      </div>

      {/* Projets */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">📂 Projets</h2>
        <span className="text-xs text-muted">
          {typedProjects.length} projet{typedProjects.length !== 1 ? "s" : ""}
        </span>
      </div>

      {typedProjects.length === 0 ? (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-12 text-center shadow-sm">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-lg font-semibold mb-2">Aucun projet pour l&apos;instant</p>
          <p className="text-muted text-sm mb-6">
            Commence par ajouter ta première idée
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
          {typedProjects.map((project) => {
            const status = statusMap.get(project.status) ?? PROJECT_STATUSES[0];
            const type = typeMap.get(project.type) ?? PROJECT_TYPES[1];
            return (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg truncate">{project.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted font-medium inline-flex items-center gap-1">
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-sm text-foreground/80 mt-1.5 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <p className="text-muted text-xs mt-2">
                      Mis à jour le{" "}
                      {new Date(project.updated_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    {project.next_action && (
                      <p className="text-xs mt-2 text-accent/90 font-medium truncate">
                        → {project.next_action}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full text-white font-medium ${status.badge}`}
                  >
                    {status.emoji} {status.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
