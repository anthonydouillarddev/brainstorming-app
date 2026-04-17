"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TodoList from "./todolist";
import DevWorkspace from "./dev-workspace";
import TagFilter from "./tag-filter";
import { TAG_PRESETS, countTags, mergeTagSuggestions, uniqueTags } from "@/lib/tags";
import { createClient } from "@/lib/supabase/client";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  healthScoreTone,
  priorityRank,
  projectHealthScore,
  riskColor,
  riskCriticality,
  type DevItem,
  type Project,
  type ProjectHealthInputs,
  type ProjectPriority,
  type Risk,
  type Todo,
} from "@/lib/types";
import { deadlineStatus } from "@/lib/deadline";

type HomeTab = "projects" | "dev";
const STORAGE_KEY = "home_active_tab";
const MAX_PREVIEW = 5;

type HomeTabsProps = {
  userId: string;
  activeProjects: Project[];
  trashedCount: number;
  initialTodos: Todo[];
  initialDevItems: DevItem[];
  blockingTodos: (Todo & { _projectName?: string })[];
  topRisks: (Risk & { _projectName?: string })[];
  healthByProject: Record<string, ProjectHealthInputs>;
};

export default function HomeTabs({
  userId,
  activeProjects,
  trashedCount,
  initialTodos,
  initialDevItems,
  blockingTodos,
  topRisks,
  healthByProject,
}: HomeTabsProps) {
  const [tab, setTab] = useState<HomeTab>("projects");
  const [projects, setProjects] = useState<Project[]>(activeProjects);
  const [dragId, setDragId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<"priority" | "score">("priority");
  const supabase = createClient();

  useEffect(() => {
    setProjects(activeProjects);
  }, [activeProjects]);

  useEffect(() => {
    function close() {
      setMenuId(null);
    }
    if (menuId) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [menuId]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dev" || stored === "projects") {
        setTab(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function switchTab(next: HomeTab) {
    setTab(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
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
  const priorityMap = useMemo(
    () => new Map(PROJECT_PRIORITIES.map((p) => [p.value, p])),
    []
  );

  const previewBlocking = blockingTodos.slice(0, MAX_PREVIEW);
  const previewRisks = topRisks.slice(0, MAX_PREVIEW);

  const scoreByProject = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of projects) {
      const inputs = healthByProject[p.id];
      map[p.id] = inputs ? projectHealthScore(inputs) : 0;
    }
    return map;
  }, [projects, healthByProject]);

  const sortedProjects = useMemo(() => {
    const arr = [...projects];
    if (sortMode === "score") {
      arr.sort((a, b) => {
        const diff = (scoreByProject[b.id] ?? 0) - (scoreByProject[a.id] ?? 0);
        if (diff !== 0) return diff;
        return priorityRank(b.priority) - priorityRank(a.priority);
      });
    } else {
      arr.sort((a, b) => {
        const prDiff = priorityRank(b.priority) - priorityRank(a.priority);
        if (prDiff !== 0) return prDiff;
        if (a.position !== b.position) return a.position - b.position;
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });
    }
    return arr;
  }, [projects, sortMode, scoreByProject]);

  const groupedProjects = useMemo(() => {
    if (sortMode === "score") return null;
    const map = new Map<ProjectPriority, Project[]>();
    for (const def of PROJECT_PRIORITIES) map.set(def.value, []);
    for (const p of sortedProjects) {
      map.get(p.priority)?.push(p);
    }
    return map;
  }, [sortedProjects, sortMode]);

  async function persistPositions(list: Project[]) {
    await Promise.all(
      list.map((p, idx) =>
        supabase.from("projects").update({ position: idx }).eq("id", p.id)
      )
    );
  }

  async function persistPriority(id: string, priority: ProjectPriority) {
    const previous = projects;
    const next = projects.map((p) =>
      p.id === id ? { ...p, priority, position: 0 } : p
    );
    setProjects(next);
    const { error } = await supabase
      .from("projects")
      .update({ priority, position: 0 })
      .eq("id", id);
    if (error) setProjects(previous);
  }

  function handleDragStart(id: string) {
    setDragId(id);
  }

  function handleDragOver(e: React.DragEvent, overId: string) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const draggedProj = projects.find((p) => p.id === dragId);
    const overProj = projects.find((p) => p.id === overId);
    if (!draggedProj || !overProj) return;
    if (draggedProj.priority !== overProj.priority) return;
    const group = projects
      .filter((p) => p.priority === draggedProj.priority)
      .sort((a, b) => a.position - b.position);
    const fromIdx = group.findIndex((p) => p.id === dragId);
    const toIdx = group.findIndex((p) => p.id === overId);
    if (fromIdx < 0 || toIdx < 0) return;
    const reordered = [...group];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const reorderedWithPos = reordered.map((p, idx) => ({ ...p, position: idx }));
    const next = projects.map((p) => {
      const found = reorderedWithPos.find((r) => r.id === p.id);
      return found ?? p;
    });
    setProjects(next);
  }

  function handleDragEnd() {
    if (!dragId) return;
    const draggedProj = projects.find((p) => p.id === dragId);
    setDragId(null);
    if (!draggedProj) return;
    const group = projects
      .filter((p) => p.priority === draggedProj.priority)
      .sort((a, b) => a.position - b.position);
    persistPositions(group);
  }

  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const knownTags = useMemo(() => uniqueTags(todos), [todos]);
  const tagSuggestions = useMemo(
    () => mergeTagSuggestions(TAG_PRESETS, knownTags),
    [knownTags]
  );
  const tagCounts = useMemo(() => countTags(todos), [todos]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* Todolist main — globale, visible dans les 2 onglets */}
      <div>
        <TagFilter
          knownTags={tagSuggestions}
          activeTags={activeTags}
          onChange={setActiveTags}
          tagCounts={tagCounts}
          label="Filtrer mes tâches par tag"
        />
        <TodoList
          userId={userId}
          scope={{ kind: "home", projects: activeProjects }}
          initialTodos={todos}
          onTodosChange={setTodos}
          tagFilter={activeTags}
          tagSuggestions={tagSuggestions}
        />
      </div>

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
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-background/60 border border-border text-[10px] font-medium text-muted max-w-full">
                            <span className="shrink-0">
                              {todo.project_id ? "📂" : "🧪"}
                            </span>
                            <span className="truncate">{todo._projectName}</span>
                          </span>
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
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-background/60 border border-border text-[10px] font-medium text-muted max-w-full">
                              <span className="shrink-0">📂</span>
                              <span className="truncate">
                                {risk._projectName}
                              </span>
                            </span>
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
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">📂 Projets</h2>
                <span className="text-xs text-muted">
                  {projects.length} projet
                  {projects.length !== 1 ? "s" : ""}
                </span>
              </div>
              {projects.length > 1 && (
                <div className="inline-flex gap-1 bg-card/80 border border-border rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setSortMode("priority")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      sortMode === "priority"
                        ? "bg-accent text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Priorité
                  </button>
                  <button
                    onClick={() => setSortMode("score")}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      sortMode === "score"
                        ? "bg-accent text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    Santé
                  </button>
                </div>
              )}
            </div>

            {projects.length === 0 ? (
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
            ) : sortMode === "score" ? (
              <div className="space-y-3">
                {sortedProjects.map((project) =>
                  renderProjectCard(project, {
                    statusMap,
                    typeMap,
                    priorityMap,
                    scoreByProject,
                    menuId,
                    setMenuId,
                    persistPriority,
                    draggable: false,
                    dragId: null,
                    onDragStart: () => {},
                    onDragOver: () => {},
                    onDragEnd: () => {},
                  })
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {PROJECT_PRIORITIES.map((def) => {
                  const group = groupedProjects?.get(def.value) ?? [];
                  if (group.length === 0) return null;
                  return (
                    <div key={def.value} className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${def.color}`}
                        >
                          <span>{def.emoji}</span>
                          <span>{def.label}</span>
                        </span>
                        <span className="text-[10px] text-muted">
                          {group.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {group.map((project) =>
                          renderProjectCard(project, {
                            statusMap,
                            typeMap,
                            priorityMap,
                            scoreByProject,
                            menuId,
                            setMenuId,
                            persistPriority,
                            draggable: group.length > 1,
                            dragId,
                            onDragStart: handleDragStart,
                            onDragOver: handleDragOver,
                            onDragEnd: handleDragEnd,
                          })
                        )}
                      </div>
                    </div>
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

type CardOpts = {
  statusMap: Map<string, (typeof PROJECT_STATUSES)[number]>;
  typeMap: Map<string, (typeof PROJECT_TYPES)[number]>;
  priorityMap: Map<ProjectPriority, (typeof PROJECT_PRIORITIES)[number]>;
  scoreByProject: Record<string, number>;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  persistPriority: (id: string, priority: ProjectPriority) => void;
  draggable: boolean;
  dragId: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
};

function renderProjectCard(project: Project, opts: CardOpts) {
  const status = opts.statusMap.get(project.status) ?? PROJECT_STATUSES[0];
  const type = opts.typeMap.get(project.type) ?? PROJECT_TYPES[0];
  const priorityDef =
    opts.priorityMap.get(project.priority) ??
    PROJECT_PRIORITIES[PROJECT_PRIORITIES.length - 1];
  const hasOfficial = !!(
    project.official_name && project.official_name.trim()
  );
  const primaryTitle = hasOfficial ? project.official_name! : project.name;
  const deadline = deadlineStatus(project.deadline);
  const score = opts.scoreByProject[project.id] ?? 0;
  const tone = healthScoreTone(score);
  const isDragging = opts.dragId === project.id;
  const isMenuOpen = opts.menuId === project.id;

  return (
    <div
      key={project.id}
      draggable={opts.draggable}
      onDragStart={() => opts.draggable && opts.onDragStart(project.id)}
      onDragOver={(e) => opts.draggable && opts.onDragOver(e, project.id)}
      onDragEnd={() => opts.draggable && opts.onDragEnd()}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <Link
        href={`/project/${project.id}`}
        className="block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 pb-12 hover:border-accent/50 hover:shadow-md transition-all"
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
              {score > 0 && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 border ${tone.badge}`}
                  title={`Score santé ${score} — ${tone.label}`}
                >
                  <span>❤️</span>
                  <span>{score}</span>
                </span>
              )}
            </div>
            {hasOfficial && (
              <p className="text-xs text-muted mt-0.5">{project.name}</p>
            )}
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
      <div className="absolute bottom-3 right-3 z-10">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            opts.setMenuId(isMenuOpen ? null : project.id);
          }}
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${priorityDef.color} hover:opacity-80 transition-opacity shadow-sm`}
          title="Changer la priorité"
        >
          <span>{priorityDef.emoji}</span>
          <span>{priorityDef.short}</span>
        </button>
        {isMenuOpen && (
          <div
            className="absolute right-0 bottom-full mb-1 min-w-[160px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {PROJECT_PRIORITIES.map((def) => (
              <button
                key={def.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  opts.persistPriority(project.id, def.value);
                  opts.setMenuId(null);
                }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-background/60 transition-colors ${
                  project.priority === def.value ? "font-semibold" : ""
                }`}
              >
                <span>{def.emoji}</span>
                <span className="flex-1">{def.label}</span>
                {project.priority === def.value && (
                  <span className="text-accent">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
