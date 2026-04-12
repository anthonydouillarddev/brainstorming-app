import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import HomeTabs from "./components/home-tabs";
import ThemeToggle from "./components/theme-toggle";
import TrashActions from "./components/trash-actions";
import {
  PROJECT_TYPES,
  riskCriticality,
  type DevItem,
  type Project,
  type Risk,
  type Todo,
} from "@/lib/types";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const showTrash = tab === "trash";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: allProjects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  const typedAll = (allProjects ?? []) as Project[];
  const activeProjects = typedAll.filter((p) => !p.deleted_at);
  const trashedProjects = typedAll.filter((p) => p.deleted_at);
  const activeIds = new Set(activeProjects.map((p) => p.id));

  if (showTrash) {
    const typeMap = new Map(PROJECT_TYPES.map((t) => [t.value, t]));
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight">
              🗑️ Corbeille
            </h1>
            <p className="text-muted text-sm mt-1">
              Projets supprimés — restauration ou suppression définitive
            </p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <ThemeToggle />
            <form action="/auth/signout" method="post">
              <button className="px-3 py-2 text-muted text-sm hover:text-foreground transition-colors">
                Déco
              </button>
            </form>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          ← Retour aux projets
        </Link>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Projets supprimés</h2>
          <span className="text-xs text-muted">
            {trashedProjects.length}{" "}
            projet{trashedProjects.length !== 1 ? "s" : ""} supprimé
            {trashedProjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {trashedProjects.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-12 text-center shadow-sm">
            <p className="text-4xl mb-4">🗑️</p>
            <p className="text-lg font-semibold mb-2">Corbeille vide</p>
            <p className="text-muted text-sm">
              Les projets supprimés apparaîtront ici et pourront être restaurés.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trashedProjects.map((project) => {
              const type =
                typeMap.get(project.type) ?? PROJECT_TYPES[1];
              const hasOfficial = !!(
                project.official_name && project.official_name.trim()
              );
              const primaryTitle = hasOfficial
                ? project.official_name!
                : project.name;
              return (
                <div
                  key={project.id}
                  className="block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 opacity-75"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg truncate leading-[1.25] pb-0.5">
                          {primaryTitle}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted font-medium inline-flex items-center gap-1">
                          <span>{type.emoji}</span>
                          <span>{type.label}</span>
                        </span>
                      </div>
                      {hasOfficial && (
                        <p className="text-xs text-muted mt-0.5">{project.name}</p>
                      )}
                      {project.description && (
                        <p className="text-sm text-foreground/70 mt-1.5 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <p className="text-muted text-xs mt-2">
                        Supprimé le{" "}
                        {project.deleted_at &&
                          new Date(project.deleted_at).toLocaleDateString(
                            "fr-FR",
                            { day: "numeric", month: "short", year: "numeric" }
                          )}
                      </p>
                    </div>
                    <TrashActions
                      projectId={project.id}
                      projectName={project.name}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Main accueil (onglets Projets / Dev)
  const [todosRes, risksRes, devRes] = await Promise.all([
    supabase.from("todos").select("*").order("created_at", { ascending: false }),
    supabase.from("risks").select("*").order("created_at", { ascending: false }),
    supabase
      .from("dev_items")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false }),
  ]);

  const allTodos = (todosRes.data ?? []) as Todo[];
  const allRisks = (risksRes.data ?? []) as Risk[];
  const devItems = (devRes.data ?? []) as DevItem[];

  // Exclure les items rattachés à des projets en corbeille
  const activeTodos = allTodos.filter(
    (t) => t.project_id == null || activeIds.has(t.project_id)
  );
  const activeRisks = allRisks.filter((r) => activeIds.has(r.project_id));

  // Blocages + top risques avec nom du projet
  const projectNameById = new Map<string, string>();
  for (const p of activeProjects) {
    projectNameById.set(p.id, p.official_name?.trim() || p.name);
  }

  const blockingTodos = activeTodos
    .filter((t) => t.status === "blocked")
    .map((t) => ({
      ...t,
      _projectName: t.project_id
        ? projectNameById.get(t.project_id)
        : "Dev",
    }));

  const topRisks = [...activeRisks]
    .sort((a, b) => riskCriticality(b) - riskCriticality(a))
    .map((r) => ({
      ...r,
      _projectName: projectNameById.get(r.project_id),
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex items-start justify-between mb-10 gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-tight">
            🧠 Brainstorm
          </h1>
          <p className="text-muted text-sm mt-1">
            Pilote tes projets de l&apos;idée au lancement
          </p>
        </div>
        <div className="flex gap-2 items-center shrink-0">
          <Link
            href="/new"
            className="px-4 py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm"
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

      <HomeTabs
        userId={user.id}
        activeProjects={activeProjects}
        trashedCount={trashedProjects.length}
        initialTodos={activeTodos}
        initialDevItems={devItems}
        blockingTodos={blockingTodos}
        topRisks={topRisks}
      />
    </div>
  );
}
