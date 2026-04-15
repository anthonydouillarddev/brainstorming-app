"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type {
  Todo,
  TodoStatus,
  TodoPriority,
  TodoKind,
  ProjectType,
  Phase,
  ScoreMethod,
  Project,
} from "@/lib/types";
import {
  TODO_PRIORITIES,
  TODO_STATUSES,
  TODO_KINDS,
  PHASES,
  PROJECT_TYPES,
} from "@/lib/types";
import { todoScore, ICE_HINTS } from "@/lib/scoring";

type ViewMode = "list" | "kanban";

const KANBAN_COLUMNS: { status: TodoStatus; label: string; emoji: string; accent: string }[] = [
  { status: "todo", label: "À faire", emoji: "⚪", accent: "border-gray-400/40" },
  { status: "in_progress", label: "En cours", emoji: "🔵", accent: "border-blue-500/40" },
  { status: "blocked", label: "Bloqué", emoji: "🚧", accent: "border-red-500/40" },
  { status: "done", label: "Terminé", emoji: "✅", accent: "border-green-500/40" },
];

type Scope =
  | { kind: "global" } // legacy — project_id is null only
  | { kind: "home"; projects: Project[] } // accueil — tous todos actifs + badge origine + sélecteur
  | { kind: "project"; projectId: string; projectType: ProjectType };

type TargetValue = "dev" | string; // "dev" = project_id null, sinon project id

const priorityBg: Record<TodoPriority, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-500",
  normal: "border-l-blue-500",
  low: "border-l-gray-400",
};

const statusIcon: Record<TodoStatus, string> = {
  todo: "⚪",
  in_progress: "🔵",
  blocked: "🚧",
  done: "✅",
};

export default function TodoList({
  userId,
  scope = { kind: "global" },
  kind = "task",
  initialTodos,
  onTodosChange,
}: {
  userId: string;
  scope?: Scope;
  kind?: TodoKind;
  initialTodos?: Todo[];
  onTodosChange?: (todos: Todo[]) => void;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos ?? []);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<TodoPriority>("normal");
  const [newStatus, setNewStatus] = useState<TodoStatus>("todo");
  const [newDeadline, setNewDeadline] = useState<string>("");
  const [newPhase, setNewPhase] = useState<Phase | "">("");
  const [newScoreMethod, setNewScoreMethod] = useState<ScoreMethod>("none");
  const [newIceImpact, setNewIceImpact] = useState<string>("");
  const [newIceConfidence, setNewIceConfidence] = useState<string>("");
  const [newIceEase, setNewIceEase] = useState<string>("");
  const [newTarget, setNewTarget] = useState<TargetValue>("dev");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(initialTodos == null);
  const [showDone, setShowDone] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("list");
  const supabase = createClient();

  const kindInfo = useMemo(
    () => TODO_KINDS.find((k) => k.value === kind) ?? TODO_KINDS[0],
    [kind]
  );
  const isProject = scope.kind === "project";
  const isHome = scope.kind === "home";
  const homeProjects = useMemo(
    () => (scope.kind === "home" ? scope.projects : []),
    [scope]
  );
  const projectNameById = useMemo(() => {
    const map = new Map<string, { name: string; emoji: string }>();
    for (const p of homeProjects) {
      const emoji =
        PROJECT_TYPES.find((t) => t.value === p.type)?.emoji ?? "📦";
      map.set(p.id, {
        name: (p.official_name?.trim() || p.name).slice(0, 40),
        emoji,
      });
    }
    return map;
  }, [homeProjects]);
  const viewStorageKey = isProject
    ? `todolist:view:${scope.projectId}:${kind}`
    : isHome
      ? `todolist:view:home:${kind}`
      : `todolist:view:global:${kind}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(viewStorageKey);
      if (stored === "list" || stored === "kanban") {
        setView(stored);
      }
    } catch {
      /* ignore */
    }
  }, [viewStorageKey]);

  function changeView(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem(viewStorageKey, next);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (initialTodos != null) return;
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(next: Todo[]) {
    setTodos(next);
    onTodosChange?.(next);
  }

  async function loadTodos() {
    let query = supabase.from("todos").select("*").eq("kind", kind);
    if (scope.kind === "project") {
      query = query.eq("project_id", scope.projectId);
    } else if (scope.kind === "home") {
      const activeIds = homeProjects.map((p) => p.id);
      if (activeIds.length > 0) {
        query = query.or(`project_id.is.null,project_id.in.(${activeIds.join(",")})`);
      } else {
        query = query.is("project_id", null);
      }
    } else {
      query = query.is("project_id", null);
    }
    const { data } = await query.order("created_at", { ascending: false });
    setTodos((data ?? []) as Todo[]);
    setLoading(false);
  }

  function resetNewForm() {
    setNewText("");
    setNewPriority("normal");
    setNewStatus("todo");
    setNewDeadline("");
    setNewPhase("");
    setNewScoreMethod("none");
    setNewIceImpact("");
    setNewIceConfidence("");
    setNewIceEase("");
    setNewTarget("dev");
    setShowAdvanced(false);
  }

  async function addTodo(e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) {
    e?.preventDefault?.();
    if (!newText.trim()) return;
    const payload: Record<string, unknown> = {
      kind,
      text: newText.trim(),
      priority: newPriority,
      user_id: userId,
      status: newStatus,
      done: newStatus === "done",
      deadline: newDeadline || null,
      phase: newPhase || null,
      score_method: newScoreMethod,
      ice_impact: newScoreMethod === "ice" && newIceImpact ? Number(newIceImpact) : null,
      ice_confidence:
        newScoreMethod === "ice" && newIceConfidence ? Number(newIceConfidence) : null,
      ice_ease: newScoreMethod === "ice" && newIceEase ? Number(newIceEase) : null,
    };
    if (scope.kind === "project") {
      payload.project_id = scope.projectId;
    } else if (scope.kind === "home") {
      payload.project_id = newTarget === "dev" ? null : newTarget;
    }

    const { data, error } = await supabase.from("todos").insert(payload).select().single();
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (data) {
      commit([data as Todo, ...todos]);
      resetNewForm();
    }
  }

  async function updateTodo(id: string, patch: Partial<Todo>) {
    const previous = todos;
    commit(previous.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    const { error } = await supabase.from("todos").update(patch).eq("id", id);
    if (error) {
      commit(previous);
      alert("Erreur : " + error.message);
    }
  }

  async function toggleDone(todo: Todo) {
    const isDone = todo.status === "done";
    await updateTodo(todo.id, {
      status: isDone ? "todo" : "done",
      done: !isDone,
    });
  }

  async function deleteTodo(id: string) {
    const previous = todos;
    commit(previous.filter((t) => t.id !== id));
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      commit(previous);
      alert("Erreur : " + error.message);
    }
  }

  const sortedActive = useMemo(() => {
    const order: Record<TodoPriority, number> = { urgent: 0, high: 1, normal: 2, low: 3 };
    return [...todos.filter((t) => t.status !== "done")].sort((a, b) => {
      const sa = todoScore(a);
      const sb = todoScore(b);
      if (sa != null && sb != null) return sb - sa;
      if (sa != null) return -1;
      if (sb != null) return 1;
      return order[a.priority] - order[b.priority];
    });
  }, [todos]);

  const doneTodos = todos.filter((t) => t.status === "done");
  const detailTodo = detailId ? todos.find((t) => t.id === detailId) ?? null : null;

  if (loading) return null;

  const title = isProject
    ? kindInfo.title
    : isHome && kind === "task"
      ? "Toutes mes tâches"
      : kindInfo.label;

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-bold tracking-tight">
          {kindInfo.emoji} {title}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">
            {sortedActive.length} {kind === "idea" ? "idée" : "tâche"}
            {sortedActive.length !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-1 bg-card/60 backdrop-blur-sm border border-border rounded-xl p-0.5">
            <button
              onClick={() => changeView("list")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                view === "list"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label="Vue liste"
            >
              ≡ Liste
            </button>
            <button
              onClick={() => changeView("kanban")}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                view === "kanban"
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              aria-label="Vue kanban"
            >
              ▦ Kanban
            </button>
          </div>
        </div>
      </div>
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Add — form compact + panneau avancé */}
        <div className="px-3 sm:px-4 py-3 border-b border-border">
          <div className="flex gap-2 flex-wrap">
            <input
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo(e)}
              placeholder={kindInfo.addPlaceholder}
              className="flex-1 min-w-[160px] px-3 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
            {isHome && (
              <select
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value as TargetValue)}
                className="px-2 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground outline-none max-w-[180px]"
                aria-label="Rattacher à"
                title="Rattacher à"
              >
                <option value="dev">🧪 Dev</option>
                {homeProjects.map((p) => {
                  const info = projectNameById.get(p.id);
                  return (
                    <option key={p.id} value={p.id}>
                      {info?.emoji} {info?.name}
                    </option>
                  );
                })}
              </select>
            )}
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
              className="px-2 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground outline-none"
              aria-label="Priorité"
            >
              {TODO_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.emoji} {p.short}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAdvanced((v) => !v)}
              className={`px-2.5 py-2 rounded-lg text-sm transition-colors border ${
                showAdvanced
                  ? "bg-accent/15 border-accent/40 text-accent"
                  : "bg-background/60 border-border text-muted hover:text-foreground"
              }`}
              aria-label="Plus d'options"
              title="Plus d'options"
            >
              ⚙️
            </button>
            <button
              type="button"
              onClick={addTodo}
              disabled={!newText.trim()}
              className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {showAdvanced && (
            <div className="mt-3 p-3 bg-background/40 border border-border rounded-xl space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                    Statut initial
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TodoStatus)}
                    className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    {TODO_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.emoji} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
                {isProject && (
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                      Phase liée
                    </label>
                    <select
                      value={newPhase}
                      onChange={(e) => setNewPhase((e.target.value as Phase) || "")}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                    >
                      <option value="">—</option>
                      {PHASES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.emoji} {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={isProject ? "" : "col-span-2 md:col-span-1"}>
                  <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                    Scoring
                  </label>
                  <select
                    value={newScoreMethod}
                    onChange={(e) => setNewScoreMethod(e.target.value as ScoreMethod)}
                    className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="none">Aucun</option>
                    <option value="ice">ICE (prioriser)</option>
                  </select>
                </div>
              </div>

              {newScoreMethod === "ice" && (
                <div className="space-y-2 p-3 bg-card/50 border border-border rounded-xl">
                  <p className="text-[10px] text-muted italic">
                    Note chaque critère de 1 à 10. Le score final = Impact × Confiance × Facilité.
                    Plus le score est haut, plus la tâche est prioritaire.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { key: "impact", value: newIceImpact, setter: setNewIceImpact },
                        {
                          key: "confidence",
                          value: newIceConfidence,
                          setter: setNewIceConfidence,
                        },
                        { key: "ease", value: newIceEase, setter: setNewIceEase },
                      ] as const
                    ).map(({ key, value, setter }) => (
                      <div key={key}>
                        <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                          {ICE_HINTS[key].title}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder="1-10"
                          title={ICE_HINTS[key].hint}
                          className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
                        />
                        <p className="text-[9px] text-muted/80 mt-1 leading-tight">
                          {ICE_HINTS[key].hint}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active todos — LIST VIEW */}
        {view === "list" && (
        <>
        <div className="divide-y divide-border">
          {sortedActive.length === 0 && (
            <p className="px-4 py-6 text-center text-muted text-sm">
              {kind === "idea" ? "Aucune idée pour l'instant" : "Aucune tâche en cours"}
            </p>
          )}
          {sortedActive.map((todo) => {
            const score = todoScore(todo);
            const origin =
              isHome
                ? todo.project_id
                  ? projectNameById.get(todo.project_id) ?? null
                  : { name: "Dev", emoji: "🧪" }
                : null;
            const hasDescription = (todo.description ?? "").trim().length > 0;
            return (
              <div key={todo.id} className={`border-l-4 ${priorityBg[todo.priority]}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailId(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setDetailId(todo.id);
                    }
                  }}
                  className="px-3 sm:px-4 py-3.5 flex items-center gap-2 sm:gap-3 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer select-none"
                  aria-label={`Ouvrir détail : ${todo.text}`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDone(todo);
                    }}
                    className="w-6 h-6 rounded-full border-2 border-border hover:border-accent flex-shrink-0 transition-colors"
                    aria-label="Marquer comme terminé"
                  />
                  <span
                    className="text-base cursor-default shrink-0"
                    title={TODO_STATUSES.find((s) => s.value === todo.status)?.label}
                  >
                    {statusIcon[todo.status]}
                  </span>
                  <span className="text-xs font-semibold text-muted shrink-0">
                    {TODO_PRIORITIES.find((p) => p.value === todo.priority)?.short}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm break-words leading-snug">{todo.text}</div>
                    {hasDescription && (
                      <div className="text-[11px] text-muted mt-0.5 line-clamp-1">
                        {todo.description}
                      </div>
                    )}
                  </div>
                  {origin &&
                    (todo.project_id ? (
                      <Link
                        href={`/project/${todo.project_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium shrink-0 max-w-[140px] truncate hover:bg-accent/20 transition-colors"
                        title={origin.name}
                      >
                        {origin.emoji} {origin.name}
                      </Link>
                    ) : (
                      <span
                        className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-500 font-medium shrink-0"
                        title="Tâche Dev (hors projet)"
                      >
                        {origin.emoji} {origin.name}
                      </span>
                    ))}
                  {score != null && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold shrink-0">
                      {todo.score_method.toUpperCase()} {score}
                    </span>
                  )}
                  {todo.deadline && (
                    <span className="text-[10px] text-muted shrink-0 hidden md:inline">
                      📅 {new Date(todo.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <span
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted text-base group-hover:bg-background/60 group-hover:text-foreground transition-colors"
                    aria-hidden="true"
                  >
                    ✎
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Done */}
        {doneTodos.length > 0 && (
          <>
            <button
              onClick={() => setShowDone(!showDone)}
              className="w-full px-4 py-2 text-xs text-muted hover:text-foreground border-t border-border transition-colors text-left"
            >
              {showDone ? "▾" : "▸"} {doneTodos.length} terminée
              {doneTodos.length !== 1 ? "s" : ""}
            </button>
            {showDone && (
              <div className="divide-y divide-border">
                {doneTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="px-4 py-2 flex items-center gap-3 opacity-50"
                  >
                    <button
                      onClick={() => toggleDone(todo)}
                      className="w-5 h-5 rounded-full border-2 border-green-600 bg-green-600/20 flex items-center justify-center flex-shrink-0"
                      aria-label="Rouvrir"
                    >
                      <span className="text-green-500 text-xs">✓</span>
                    </button>
                    <span className="text-sm flex-1 line-through break-words">{todo.text}</span>
                    <button
                      onClick={() => setDetailId(todo.id)}
                      className="text-muted hover:text-foreground text-xs shrink-0"
                      aria-label="Voir détail"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-muted hover:text-red-400 text-xs shrink-0"
                      aria-label="Supprimer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        </>
        )}
      </div>

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {KANBAN_COLUMNS.map((col) => {
            const columnTodos = todos.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className={`bg-card/80 backdrop-blur-sm border-t-4 ${col.accent} border border-border rounded-2xl p-3 shadow-sm min-h-[160px]`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold tracking-wide">
                    {col.emoji} {col.label}
                  </h3>
                  <span className="text-[10px] text-muted">{columnTodos.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTodos.length === 0 && (
                    <p className="text-[11px] text-muted/60 italic text-center py-2">
                      —
                    </p>
                  )}
                  {columnTodos.map((todo) => {
                    const score = todoScore(todo);
                    const origin =
                      isHome
                        ? todo.project_id
                          ? projectNameById.get(todo.project_id) ?? null
                          : { name: "Dev", emoji: "🧪" }
                        : null;
                    return (
                      <button
                        key={todo.id}
                        type="button"
                        onClick={() => setDetailId(todo.id)}
                        className={`w-full text-left bg-background/60 border border-border border-l-4 ${priorityBg[todo.priority]} rounded-xl p-2.5 group hover:border-accent/40 transition-colors`}
                      >
                        <p
                          className={`text-xs leading-snug break-words ${
                            todo.status === "done" ? "line-through opacity-60" : ""
                          }`}
                        >
                          {todo.text}
                        </p>
                        {origin && (
                          <div className="mt-1">
                            {todo.project_id ? (
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium max-w-full truncate">
                                {origin.emoji} {origin.name}
                              </span>
                            ) : (
                              <span className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-500 font-medium">
                                {origin.emoji} {origin.name}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-[9px] font-bold text-muted">
                            {TODO_PRIORITIES.find((p) => p.value === todo.priority)?.short}
                          </span>
                          {score != null && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-accent/15 text-accent font-semibold">
                              {todo.score_method.toUpperCase()} {score}
                            </span>
                          )}
                          {todo.deadline && (
                            <span className="text-[9px] text-muted">
                              📅{" "}
                              {new Date(todo.deadline).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailTodo && (
        <TodoDetailModal
          key={detailTodo.id}
          todo={detailTodo}
          isProject={isProject}
          onClose={() => setDetailId(null)}
          onUpdate={(patch) => updateTodo(detailTodo.id, patch)}
          onDelete={() => {
            setDetailId(null);
            deleteTodo(detailTodo.id);
          }}
        />
      )}
    </div>
  );
}

function TodoDetailModal({
  todo,
  isProject,
  onClose,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  isProject: boolean;
  onClose: () => void;
  onUpdate: (patch: Partial<Todo>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(todo.text);
  const [description, setDescription] = useState(todo.description ?? "");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function commitName() {
    const trimmed = name.trim();
    if (trimmed && trimmed !== todo.text) onUpdate({ text: trimmed });
    else setName(todo.text);
  }

  function commitDescription() {
    const next = description.trim() ? description : null;
    if (next !== (todo.description ?? null)) onUpdate({ description: next });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-border bg-card/95 backdrop-blur-sm z-10">
          <div className="text-xs uppercase tracking-wider text-muted font-semibold">
            Détail
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-background/60 transition-colors"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
              Nom
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-full px-3 py-2.5 bg-background/60 border border-border rounded-xl text-base font-medium outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commitDescription}
              rows={6}
              placeholder="Ajouter des détails, contexte, liens..."
              className="w-full px-3 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y min-h-[140px] leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Statut
              </label>
              <select
                value={todo.status}
                onChange={(e) => {
                  const status = e.target.value as TodoStatus;
                  onUpdate({ status, done: status === "done" });
                }}
                className="w-full px-2 py-1.5 bg-background/60 border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30"
              >
                {TODO_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Priorité
              </label>
              <select
                value={todo.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as TodoPriority })}
                className="w-full px-2 py-1.5 bg-background/60 border border-border rounded-lg text-xs outline-none"
              >
                {TODO_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.emoji} {p.short}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={todo.deadline ?? ""}
                onChange={(e) => onUpdate({ deadline: e.target.value || null })}
                className="w-full px-2 py-1.5 bg-background/60 border border-border rounded-lg text-xs outline-none"
              />
            </div>
            {isProject && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                  Phase
                </label>
                <select
                  value={todo.phase ?? ""}
                  onChange={(e) =>
                    onUpdate({ phase: (e.target.value as Phase) || null })
                  }
                  className="w-full px-2 py-1.5 bg-background/60 border border-border rounded-lg text-xs outline-none"
                >
                  <option value="">—</option>
                  {PHASES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.emoji} {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className={isProject ? "" : "col-span-2 md:col-span-1"}>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Scoring
              </label>
              <select
                value={todo.score_method === "ice" ? "ice" : "none"}
                onChange={(e) =>
                  onUpdate({ score_method: e.target.value as ScoreMethod })
                }
                className="w-full px-2 py-1.5 bg-background/60 border border-border rounded-lg text-xs outline-none"
              >
                <option value="none">Aucun</option>
                <option value="ice">ICE</option>
              </select>
            </div>
          </div>

          {todo.score_method === "ice" && (
            <div className="space-y-2 p-3 bg-background/40 border border-border rounded-xl">
              <p className="text-[10px] text-muted italic">
                Note chaque critère de 1 à 10. Score = Impact × Confiance × Facilité.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { field: "ice_impact", hintKey: "impact" },
                    { field: "ice_confidence", hintKey: "confidence" },
                    { field: "ice_ease", hintKey: "ease" },
                  ] as const
                ).map(({ field, hintKey }) => (
                  <div key={field}>
                    <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                      {ICE_HINTS[hintKey].title}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={todo[field] ?? ""}
                      onChange={(e) =>
                        onUpdate({
                          [field]: e.target.value ? Number(e.target.value) : null,
                        } as Partial<Todo>)
                      }
                      placeholder="1-10"
                      title={ICE_HINTS[hintKey].hint}
                      className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
                    />
                    <p className="text-[9px] text-muted/80 mt-1 leading-tight">
                      {ICE_HINTS[hintKey].hint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-border bg-card/95 backdrop-blur-sm">
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
          >
            🗑️ Supprimer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
