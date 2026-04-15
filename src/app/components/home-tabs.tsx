"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import TodoList from "./todolist";
import DevWorkspace from "./dev-workspace";
import {
  PROJECT_STATUSES,
  PROJECT_TYPES,
  riskColor,
  riskCriticality,
  type DevItem,
  type Project,
  type Risk,
  type Todo,
} from "@/lib/types";
import { deadlineStatus } from "@/lib/deadline";

type HomeTab = "projects" | "dev";
const STORAGE_KEY = "home_active_tab";
const MAX_PREVIEW = 5;

function subscribeTab(callback: () => void) {
  window.addEventListener("home_tab_change", callback);
  return () => window.removeEventListener("home_tab_change", callback);
}

function getTabSnapshot(): HomeTab {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "dev" ? "dev" : "projects";
  } catch {
    return "projects";
  }
}

function getTabServerSnapshot(): HomeTab {
  return "projects";
}

type HomeTabsProps = {
  userId: string;
  activeProjects: Project[];
  trashedCount: number;
  initialTodos: Todo[];
  initialDevItems: DevItem[];
  blockingTodos: (Todo & { _projectName?: string })[];
  topRisks: (Risk & { _projectName?: string })[];
};

export default function HomeTabs({
  userId,
  activeProjects,
  trashedCount,
  initialTodos,
  initialDevItems,
  blockingTodos,
  topRisks,
}: HomeTabsProps) {
  const tab = useSyncExternalStore(
    subscribeTab,
    getTabSnapshot,
    getTabServerSnapshot
  );

  function switchTab(next: HomeTab) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event("home_tab_change"));
    } catch {
      /* ignore */
    }
  }

  const statusMap = useMemo(
    () => new Map(PROJECT_STATUSES.map((s) => [s.value, s])),
    []
  );
  const typeMap = useMemo(
    () => new Map(PROJECT_TYPES.map((t) => [t.value, t])),
    []
  );

  const previewBlocking = blockingTodos.slice(0, MAX_PREVIEW);
  const previewRisks = topRisks.slice(0, MAX_PREVIEW);

  return (
    <div className="space-y-8">
      {/* Todolist main — globale, visible dans les 2 onglets */}
      <TodoList
        userId={userId}
        scope={{ kind: "home", projects: activeProjects }}
        initialTodos={initialTodos}
      />

      {/* Toggle Projets / Dev */}
      <div className="flex items-center justify-center">
        <div className="inline-flex w-full max-w-md gap-1.5 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-1.5 shadow-sm">
          <button
            onClick={() => switchTab("projects")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-xl transition-all ${
              tab === "projects"
                ? "bg-accent text-white shadow-md"
                : "text-muted hover:text-foreground hover:bg-background/40"
            }`}
          >
            <span className="text-base sm:text-lg">📂</span>
            <span>Projets</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                tab === "projects" ? "bg-white/20" : "bg-background/60"
              }`}
            >
              {activeProjects.length}
            </span>
          </button>
          <button
            onClick={() => switchTab("dev")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-semibold rounded-xl transition-all ${
              tab === "dev"
                ? "bg-accent text-white shadow-md"
                : "text-muted hover:text-foreground hover:bg-background/40"
            }`}
          >
            <span className="text-base sm:text-lg">🧪</span>
            <span>Dev</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                tab === "dev" ? "bg-white/20" : "bg-background/60"
              }`}
            >
              {initialDevItems.length}
            </span>
          </button>
        </div>
      </div>

      {tab === "projects" ? (
        <div className="space-y-6">
          {/* Blocages + Risques */}
          <div className="grid md:grid-cols-2 gap-5">
            <div
              className={`backdrop-blur-sm border rounded-2xl p-5 shadow-sm ${
                previewBlocking.length > 0
                  ? "bg-red-500/15 border-red-500/50"
                  : "bg-card/80 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  🚨 Blocages actifs ({blockingTodos.length})
                </h3>
                {blockingTodos.length > MAX_PREVIEW && (
                  <span className="text-[10px] text-muted">
                    {MAX_PREVIEW} sur {blockingTodos.length}
                  </span>
                )}
              </div>
              {previewBlocking.length === 0 ? (
                <p className="text-sm text-muted">Aucun blocage 🎉</p>
              ) : (
                <div className="space-y-2">
                  {previewBlocking.map((todo) => (
                    <Link
                      key={todo.id}
                      href={
                        todo.project_id
                          ? `/project/${todo.project_id}?tab=tasks`
                          : "#"
                      }
                      className="flex items-start gap-3 px-3 py-2 bg-red-500/15 border border-red-500/40 rounded-xl hover:bg-red-500/25 transition-colors"
                    >
                      <span className="text-red-500 text-sm mt-0.5 shrink-0">
                        🚧
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{todo.text}</p>
                        {todo._projectName && (
                          <p className="text-[10px] text-muted truncate mt-0.5">
                            {todo._projectName}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                  ⚠️ Risques top ({topRisks.length})
                </h3>
                {topRisks.length > MAX_PREVIEW && (
                  <span className="text-[10px] text-muted">
                    {MAX_PREVIEW} sur {topRisks.length}
                  </span>
                )}
              </div>
              {previewRisks.length === 0 ? (
                <p className="text-sm text-muted">Aucun risque identifié.</p>
              ) : (
                <div className="space-y-2">
                  {previewRisks.map((risk) => {
                    const crit = riskCriticality(risk);
                    const color = riskColor(crit);
                    return (
                      <Link
                        key={risk.id}
                        href={`/project/${risk.project_id}`}
                        className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${color.bg} ${color.border} hover:opacity-90 transition-opacity`}
                      >
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color.text} shrink-0 mt-0.5`}
                          title={`Criticité ${crit}/9`}
                        >
                          {crit}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {risk.title}
                          </p>
                          {risk._projectName && (
                            <p className="text-[10px] text-muted truncate mt-0.5">
                              {risk._projectName}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Liste projets */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">📂 Projets</h2>
              <span className="text-xs text-muted">
                {activeProjects.length} projet
                {activeProjects.length !== 1 ? "s" : ""}
              </span>
            </div>

            {activeProjects.length === 0 ? (
              <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-12 text-center shadow-sm">
                <p className="text-4xl mb-4">🚀</p>
                <p className="text-lg font-semibold mb-2">
                  Aucun projet pour l&apos;instant
                </p>
                <p className="text-muted text-sm mb-6">
                  Commence par ajouter ta première idée
                </p>
                <Link
                  href="/new"
                  className="inline-flex px-5 py-2.5 bg-accent text-white font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm"
                >
                  + Nouvelle idée
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => {
                  const status =
                    statusMap.get(project.status) ?? PROJECT_STATUSES[0];
                  const type = typeMap.get(project.type) ?? PROJECT_TYPES[1];
                  const hasOfficial = !!(
                    project.official_name && project.official_name.trim()
                  );
                  const primaryTitle = hasOfficial
                    ? project.official_name!
                    : project.name;
                  const deadline = deadlineStatus(project.deadline);
                  return (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      className="block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 hover:border-accent/50 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg truncate leading-[1.25] pb-0.5">
                              {primaryTitle}
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-background/60 border border-border text-muted font-medium inline-flex items-center gap-1">
                              <span>{type.emoji}</span>
                              <span>{type.label}</span>
                            </span>
                            {deadline && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 ${deadline.className}`}
                                title={`Deadline : ${new Date(project.deadline!).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                              >
                                <span>{deadline.emoji}</span>
                                <span>{deadline.label}</span>
                              </span>
                            )}
                          </div>
                          {hasOfficial && (
                            <p className="text-xs text-muted mt-0.5">
                              {project.name}
                            </p>
                          )}
                          {project.description && (
                            <p className="text-sm text-foreground/80 mt-1.5 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <p className="text-muted text-xs mt-2">
                            Mis à jour le{" "}
                            {new Date(project.updated_at).toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short", year: "numeric" }
                            )}
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

          {/* Lien corbeille */}
          {trashedCount > 0 && (
            <div className="pt-6 border-t border-border flex justify-center">
              <Link
                href="/?tab=trash"
                className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
              >
                🗑️ Corbeille ({trashedCount})
              </Link>
            </div>
          )}
        </div>
      ) : (
        <DevWorkspace userId={userId} initialItems={initialDevItems} />
      )}
    </div>
  );
}
