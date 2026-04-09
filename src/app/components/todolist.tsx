"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

interface Todo {
  id: string;
  text: string;
  done: boolean;
  priority: string;
  created_at: string;
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  urgent: { label: "🔴", color: "text-red-400", bg: "bg-red-900/20 border-red-800" },
  high: { label: "🟠", color: "text-orange-400", bg: "bg-orange-900/20 border-orange-800" },
  normal: { label: "🔵", color: "text-blue-400", bg: "bg-card border-border" },
  low: { label: "⚪", color: "text-gray-400", bg: "bg-card border-border" },
};

export default function TodoList({ userId }: { userId: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newText, setNewText] = useState("");
  const [newPriority, setNewPriority] = useState("normal");
  const [loading, setLoading] = useState(true);
  const [showDone, setShowDone] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    const { data } = await supabase
      .from("todos")
      .select("*")
      .order("done", { ascending: true })
      .order("created_at", { ascending: false });
    setTodos(data || []);
    setLoading(false);
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newText.trim()) return;

    const { data } = await supabase
      .from("todos")
      .insert({ text: newText.trim(), priority: newPriority, user_id: userId })
      .select()
      .single();

    if (data) {
      setTodos((prev) => [data, ...prev]);
      setNewText("");
      setNewPriority("normal");
    }
  }

  async function toggleDone(id: string, done: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !done } : t)));
    await supabase.from("todos").update({ done: !done }).eq("id", id);
  }

  async function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  }

  const activeTodos = todos.filter((t) => !t.done);
  const doneTodos = todos.filter((t) => t.done);

  // Sort: urgent first, then high, normal, low
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  activeTodos.sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) - (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2));

  if (loading) return null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-sm">📋 To-Do</h2>
        <span className="text-xs text-muted">{activeTodos.length} tâche{activeTodos.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Add todo */}
      <form onSubmit={addTodo} className="px-4 py-3 border-b border-border flex gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Ajouter une tâche..."
          className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          className="px-2 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground outline-none"
        >
          <option value="low">⚪ Basse</option>
          <option value="normal">🔵 Normal</option>
          <option value="high">🟠 Haute</option>
          <option value="urgent">🔴 Urgent</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-accent text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          +
        </button>
      </form>

      {/* Active todos */}
      <div className="divide-y divide-border">
        {activeTodos.length === 0 && (
          <p className="px-4 py-6 text-center text-muted text-sm">Aucune tâche en cours</p>
        )}
        {activeTodos.map((todo) => (
          <div key={todo.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5 transition-colors">
            <button
              onClick={() => toggleDone(todo.id, todo.done)}
              className="w-5 h-5 rounded border-2 border-border hover:border-accent flex-shrink-0 transition-colors"
            />
            <span className="text-xs">{priorityConfig[todo.priority]?.label}</span>
            <span className="text-sm flex-1">{todo.text}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-muted hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ opacity: undefined }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.3")}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Done todos */}
      {doneTodos.length > 0 && (
        <>
          <button
            onClick={() => setShowDone(!showDone)}
            className="w-full px-4 py-2 text-xs text-muted hover:text-foreground border-t border-border transition-colors text-left"
          >
            {showDone ? "▾" : "▸"} {doneTodos.length} terminée{doneTodos.length !== 1 ? "s" : ""}
          </button>
          {showDone && (
            <div className="divide-y divide-border">
              {doneTodos.map((todo) => (
                <div key={todo.id} className="px-4 py-2 flex items-center gap-3 opacity-50">
                  <button
                    onClick={() => toggleDone(todo.id, todo.done)}
                    className="w-5 h-5 rounded border-2 border-green-600 bg-green-600/20 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-green-400 text-xs">✓</span>
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
  );
}
