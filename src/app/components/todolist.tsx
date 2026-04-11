"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, useMemo } from "react";
import type { Todo, TodoStatus, TodoPriority, ProjectType, Phase, ScoreMethod } from "@/lib/types";
import { TODO_PRIORITIES, TODO_STATUSES, PHASES } from "@/lib/types";
import { todoScore, RICE_IMPACT_OPTIONS, RICE_CONFIDENCE_OPTIONS } from "@/lib/scoring";

type Scope =
  | { kind: "global" } // default — global todos only
  | { kind: "project"; projectId: string; projectType: ProjectType };

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
  initialTodos,
  onTodosChange,
}: {
  userId: string;
  scope?: Scope;
  initialTodos?: Todo[];
  onTodosChange?: (todos: Todo[]) => void;
}) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos ?? []);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState<TodoPriority>("normal");
  const [loading, setLoading] = useState(initialTodos == null);
  const [showDone, setShowDone] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const supabase = createClient();

  const isProject = scope.kind === "project";

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
    let query = supabase.from("todos").select("*");
    if (scope.kind === "project") {
      query = query.eq("project_id", scope.projectId);
    } else {
      query = query.is("project_id", null);
    }
    const { data } = await query.order("created_at", { ascending: false });
    setTodos((data ?? []) as Todo[]);
    setLoading(false);
  }

  async function addTodo(e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) {
    e?.preventDefault?.();
    if (!newText.trim()) return;
    const payload: Record<string, unknown> = {
      text: newText.trim(),
      priority: newPriority,
      user_id: userId,
      status: "todo",
    };
    if (scope.kind === "project") payload.project_id = scope.projectId;

    const { data, error } = await supabase.from("todos").insert(payload).select().single();
    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (data) {
      commit([data as Todo, ...todos]);
      setNewText("");
      setNewPriority("normal");
    }
  }

  async function updateTodo(id: string, patch: Partial<Todo>) {
    commit(todos.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    await supabase.from("todos").update(patch).eq("id", id);
  }

  async function toggleDone(todo: Todo) {
    const isDone = todo.status === "done";
    await updateTodo(todo.id, {
      status: isDone ? "todo" : "done",
      done: !isDone,
    });
  }

  async function deleteTodo(id: string) {
    commit(todos.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
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

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">
          📋 {isProject ? "Tâches du projet" : "To-Do"}
        </h2>
        <span className="text-xs text-muted">
          {sortedActive.length} tâche{sortedActive.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Add */}
        <div className="px-4 py-3 border-b border-border flex gap-2">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo(e)}
            placeholder="Ajouter une tâche..."
            className="flex-1 px-3 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          />
          <select
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TodoPriority)}
            className="px-2 py-2 bg-background/60 border border-border rounded-lg text-sm text-foreground outline-none"
          >
            {TODO_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.emoji} {p.short}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addTodo}
            className="px-3 py-2 bg-accent text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            +
          </button>
        </div>

        {/* Active todos */}
        <div className="divide-y divide-border">
          {sortedActive.length === 0 && (
            <p className="px-4 py-6 text-center text-muted text-sm">Aucune tâche en cours</p>
          )}
          {sortedActive.map((todo) => {
            const score = todoScore(todo);
            const isOpen = expanded === todo.id;
            return (
              <div key={todo.id} className={`border-l-4 ${priorityBg[todo.priority]}`}>
                <div className="px-4 py-2.5 flex items-center gap-3 group hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <button
                    onClick={() => toggleDone(todo)}
                    className="w-5 h-5 rounded-full border-2 border-border hover:border-accent flex-shrink-0 transition-colors"
                    aria-label="Marquer comme terminé"
                  />
                  <span
                    className="text-sm cursor-default"
                    title={TODO_STATUSES.find((s) => s.value === todo.status)?.label}
                  >
                    {statusIcon[todo.status]}
                  </span>
                  <span className="text-xs font-semibold text-muted shrink-0">
                    {TODO_PRIORITIES.find((p) => p.value === todo.priority)?.short}
                  </span>
                  <span className="text-sm flex-1 truncate">{todo.text}</span>
                  {score != null && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent font-semibold shrink-0">
                      {todo.score_method.toUpperCase()} {score}
                    </span>
                  )}
                  {todo.deadline && (
                    <span className="text-[10px] text-muted shrink-0">
                      📅 {new Date(todo.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                  )}
                  <button
                    onClick={() => setExpanded(isOpen ? null : todo.id)}
                    className="text-muted hover:text-foreground text-xs shrink-0"
                  >
                    {isOpen ? "▾" : "▸"}
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-muted hover:text-red-400 text-xs shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 bg-background/40 border-t border-border space-y-3">
                    {/* Status & priority & deadline */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                          Statut
                        </label>
                        <select
                          value={todo.status}
                          onChange={(e) => {
                            const status = e.target.value as TodoStatus;
                            updateTodo(todo.id, { status, done: status === "done" });
                          }}
                          className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
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
                          onChange={(e) =>
                            updateTodo(todo.id, { priority: e.target.value as TodoPriority })
                          }
                          className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
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
                          onChange={(e) =>
                            updateTodo(todo.id, { deadline: e.target.value || null })
                          }
                          className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
                        />
                      </div>
                      {isProject && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                            Phase liée
                          </label>
                          <select
                            value={todo.phase ?? ""}
                            onChange={(e) =>
                              updateTodo(todo.id, {
                                phase: (e.target.value as Phase) || null,
                              })
                            }
                            className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
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
                          value={todo.score_method}
                          onChange={(e) =>
                            updateTodo(todo.id, { score_method: e.target.value as ScoreMethod })
                          }
                          className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
                        >
                          <option value="none">Aucun</option>
                          <option value="rice">RICE</option>
                          <option value="ice">ICE</option>
                        </select>
                      </div>
                    </div>

                    {/* RICE fields */}
                    {todo.score_method === "rice" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-card/50 border border-border rounded-xl">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                            Reach
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={todo.rice_reach ?? ""}
                            onChange={(e) =>
                              updateTodo(todo.id, {
                                rice_reach: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                            Impact
                          </label>
                          <select
                            value={todo.rice_impact ?? ""}
                            onChange={(e) =>
                              updateTodo(todo.id, {
                                rice_impact: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none"
                          >
                            <option value="">—</option>
                            {RICE_IMPACT_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.value} — {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                            Confiance
                          </label>
                          <select
                            value={todo.rice_confidence ?? ""}
                            onChange={(e) =>
                              updateTodo(todo.id, {
                                rice_confidence: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none"
                          >
                            <option value="">—</option>
                            {RICE_CONFIDENCE_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                            Effort (j)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={todo.rice_effort ?? ""}
                            onChange={(e) =>
                              updateTodo(todo.id, {
                                rice_effort: e.target.value ? Number(e.target.value) : null,
                              })
                            }
                            placeholder="0"
                            className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* ICE fields */}
                    {todo.score_method === "ice" && (
                      <div className="grid grid-cols-3 gap-2 p-3 bg-card/50 border border-border rounded-xl">
                        {(["ice_impact", "ice_confidence", "ice_ease"] as const).map((key) => (
                          <div key={key}>
                            <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                              {key === "ice_impact"
                                ? "Impact"
                                : key === "ice_confidence"
                                ? "Confiance"
                                : "Facilité"}{" "}
                              (1-10)
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={todo[key] ?? ""}
                              onChange={(e) =>
                                updateTodo(todo.id, {
                                  [key]: e.target.value ? Number(e.target.value) : null,
                                })
                              }
                              placeholder="—"
                              className="w-full px-2 py-1.5 bg-background border border-border rounded-lg text-xs outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                    >
                      <span className="text-green-500 text-xs">✓</span>
                    </button>
                    <span className="text-sm flex-1 line-through">{todo.text}</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-muted hover:text-red-400 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
