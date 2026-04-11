"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SectionDef } from "@/lib/sections";
import type { Project, ProjectStatus, Todo, Decision } from "@/lib/types";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/types";
import ThemeToggle from "@/app/components/theme-toggle";
import Cockpit from "./cockpit";
import BrainstormEditor from "./editor";
import DecisionsPanel from "./decisions";
import TodoList from "@/app/components/todolist";

type Tab = "cockpit" | "brainstorm" | "tasks" | "decisions";

const TABS: { value: Tab; label: string; emoji: string }[] = [
  { value: "cockpit", label: "Cockpit", emoji: "📊" },
  { value: "brainstorm", label: "Brainstorm", emoji: "💡" },
  { value: "tasks", label: "Tâches", emoji: "✅" },
  { value: "decisions", label: "Décisions", emoji: "🧭" },
];

export default function ProjectDashboard({
  userId,
  project: initialProject,
  initialSections,
  sectionDefs,
  initialTodos,
  initialDecisions,
}: {
  userId: string;
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
  initialTodos: Todo[];
  initialDecisions: Decision[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = useState<Project>(initialProject);
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [tab, setTab] = useState<Tab>("cockpit");
  const [name, setName] = useState(project.name);
  const [deleting, setDeleting] = useState(false);

  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type) ?? PROJECT_TYPES[1];

  async function updateProject(patch: Partial<Project>) {
    const previous = project;
    setProject((prev) => ({ ...prev, ...patch }));
    const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
    if (error) {
      setProject(previous);
      alert("Erreur de sauvegarde : " + error.message);
    }
  }

  async function handleNameBlur() {
    if (name.trim() && name !== project.name) {
      await updateProject({ name: name.trim() });
    } else {
      setName(project.name);
    }
  }

  async function handleStatusChange(status: ProjectStatus) {
    await updateProject({ status });
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${project.name}" et tout son contenu ?`)) return;
    setDeleting(true);
    await supabase.from("projects").delete().eq("id", project.id);
    router.push("/");
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 w-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between mb-6 sticky top-0 py-3 z-20 -mx-4 px-4 backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--color-background) 75%, transparent)" }}
      >
        <button
          onClick={() => router.push("/")}
          className="text-muted hover:text-foreground text-sm transition-colors"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>

      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-card border border-border text-muted font-medium inline-flex items-center gap-1">
            <span>{typeInfo.emoji}</span>
            <span>{typeInfo.label}</span>
          </span>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleNameBlur}
          className="text-3xl font-extrabold tracking-tight bg-transparent border-none outline-none w-full focus:ring-0"
        />

        {/* Status picker */}
        <div className="flex gap-1.5 mt-4 flex-wrap">
          {PROJECT_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                project.status === s.value
                  ? `${s.badge} text-white shadow-sm`
                  : "bg-card/60 border border-border text-muted hover:text-foreground hover:border-muted"
              }`}
            >
              {s.emoji} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-1 shadow-sm">
        {TABS.map((t) => {
          const count =
            t.value === "tasks"
              ? todos.filter((todo) => todo.status !== "done").length
              : t.value === "decisions"
              ? decisions.length
              : null;
          return (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.value
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className="mr-1">{t.emoji}</span>
              {t.label}
              {count !== null && count > 0 && (
                <span
                  className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                    tab === t.value ? "bg-white/25" : "bg-accent/15 text-accent"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {tab === "cockpit" && (
        <Cockpit
          project={project}
          sections={initialSections}
          sectionDefs={sectionDefs}
          todos={todos}
          onUpdate={updateProject}
        />
      )}

      {tab === "brainstorm" && (
        <BrainstormEditor
          project={project}
          initialSections={initialSections}
          sectionDefs={sectionDefs}
          onProjectUpdate={updateProject}
        />
      )}

      {tab === "tasks" && (
        <TodoList
          userId={userId}
          scope={{ kind: "project", projectId: project.id, projectType: project.type }}
          initialTodos={todos}
          onTodosChange={setTodos}
        />
      )}

      {tab === "decisions" && (
        <DecisionsPanel
          projectId={project.id}
          initialDecisions={decisions}
          onChange={setDecisions}
        />
      )}

      {/* Footer actions */}
      <div className="mt-12 pt-6 border-t border-border">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-2 text-red-500 text-sm hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {deleting ? "Suppression..." : "🗑️ Supprimer ce projet"}
        </button>
      </div>
    </div>
  );
}
