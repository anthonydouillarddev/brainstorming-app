"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SectionDef } from "@/lib/sections";
import type { Project, ProjectStatus, ProjectType, Todo, Decision, RoadmapItem, Risk, UserPreferences } from "@/lib/types";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/types";
import { deadlineStatus } from "@/lib/deadline";
import { TAG_PRESETS, countTags, mergeTagSuggestions, uniqueTags } from "@/lib/tags";
import TagFilter from "@/app/components/tag-filter";
import ThemeToggle from "@/app/components/theme-toggle";
import UserSettings from "@/app/components/user-settings";
import Cockpit from "./cockpit";
import BrainstormEditor from "./editor";
import DecisionsPanel from "./decisions";
import SingleSectionPanel from "./resources";
import DesignPanel from "./design";
import TechniquePanel from "./technique";
import TodoList from "@/app/components/todolist";

type Tab = "cockpit" | "brainstorm" | "tasks" | "decisions" | "technique" | "design" | "resources";

const TABS: { value: Tab; label: string; emoji: string }[] = [
  { value: "cockpit", label: "Cockpit", emoji: "📊" },
  { value: "brainstorm", label: "Brainstorm", emoji: "💡" },
  { value: "tasks", label: "Tâches", emoji: "✅" },
  { value: "decisions", label: "Décisions", emoji: "🧭" },
  { value: "technique", label: "Technique", emoji: "⚙️" },
  { value: "design", label: "Design", emoji: "🎨" },
  { value: "resources", label: "Ressources", emoji: "🔗" },
];

const VALID_TABS = new Set<string>(TABS.map((t) => t.value));

export default function ProjectDashboard({
  userId,
  userEmail,
  initialPreferences,
  project: initialProject,
  initialSections,
  sectionDefs,
  initialTodos,
  initialDecisions,
  initialRoadmap,
  initialRisks,
  initialTab,
}: {
  userId: string;
  userEmail: string;
  initialPreferences: UserPreferences | null;
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
  initialTodos: Todo[];
  initialDecisions: Decision[];
  initialRoadmap: RoadmapItem[];
  initialRisks: Risk[];
  initialTab?: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [project, setProject] = useState<Project>(initialProject);
  const [sections, setSections] = useState<Record<string, string>>(initialSections);
  const [tasks, setTasks] = useState<Todo[]>(
    initialTodos.filter((t) => (t.kind ?? "task") === "task")
  );
  const [ideas, setIdeas] = useState<Todo[]>(
    initialTodos.filter((t) => t.kind === "idea")
  );
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(initialRoadmap);
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [tab, setTab] = useState<Tab>(() => {
    // Rétrocompat : ancien ?tab=tech → nouvel onglet technique
    const normalized = initialTab === "tech" ? "technique" : initialTab;
    return normalized && VALID_TABS.has(normalized) ? (normalized as Tab) : "cockpit";
  });
  const navigateTab = useCallback(
    (next: Tab) => {
      setTab(next);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", next);
        window.history.replaceState(window.history.state, "", url.toString());
      }
    },
    []
  );
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const typeInfo = PROJECT_TYPES.find((t) => t.value === project.type) ?? PROJECT_TYPES[0];
  const hasOfficialName = !!(project.official_name && project.official_name.trim());
  const displayTitle = hasOfficialName ? project.official_name! : project.name;
  const deadline = deadlineStatus(project.deadline);

  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setTypeMenuOpen(false);
      }
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setActionsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function updateProject(patch: Partial<Project>) {
    const previous = project;
    setProject((prev) => ({ ...prev, ...patch }));
    const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
    if (error) {
      setProject(previous);
      alert("Erreur de sauvegarde : " + error.message);
    }
  }

  async function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== project.name) {
      await updateProject({ name: trimmed });
    } else {
      setNameDraft(project.name);
    }
    setEditingName(false);
  }

  async function handleTypeChange(type: ProjectType) {
    setTypeMenuOpen(false);
    if (type !== project.type) await updateProject({ type });
  }

  async function handleStatusChange(status: ProjectStatus) {
    await updateProject({ status });
  }

  async function handleDelete() {
    setActionsMenuOpen(false);
    if (
      !confirm(
        `Mettre "${project.name}" à la corbeille ?\n\nTu pourras le restaurer depuis l'onglet Corbeille de l'accueil.`
      )
    )
      return;
    setDeleting(true);
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", project.id);
    if (error) {
      setDeleting(false);
      alert("Erreur : " + error.message);
      return;
    }
    router.push("/?tab=trash");
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between mb-6 sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur-2xl [mask-image:linear-gradient(black_80%,transparent)]"
      >
        <button
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          className="px-4 py-3 -ml-4 text-muted hover:text-foreground text-sm transition-colors rounded-xl"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserSettings userEmail={userEmail} userId={userId} initialPreferences={initialPreferences} />
        </div>
      </div>

      {/* Project header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Primary title — official_name ou name */}
            {hasOfficialName ? (
              <h1
                className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2] pb-1 break-words"
                title="Modifiable via Brainstorm → Branding → Nom officiel"
              >
                {displayTitle}
              </h1>
            ) : editingName ? (
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitName();
                  if (e.key === "Escape") {
                    setNameDraft(project.name);
                    setEditingName(false);
                  }
                }}
                className="text-4xl font-extrabold tracking-tight leading-[1.2] pb-1 bg-transparent border-none outline-none w-full focus:ring-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="group inline-flex items-center gap-2 text-left w-full"
                title="Cliquer pour renommer"
              >
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2] pb-1 break-words">
                  {displayTitle}
                </h1>
                <span className="text-muted text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  ✎
                </span>
              </button>
            )}

            {/* Secondary — nom de travail si official_name existe */}
            {hasOfficialName && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Nom de travail
                </span>
                {editingName ? (
                  <input
                    ref={nameInputRef}
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitName();
                      if (e.key === "Escape") {
                        setNameDraft(project.name);
                        setEditingName(false);
                      }
                    }}
                    className="text-sm text-muted bg-transparent border-none outline-none flex-1 focus:ring-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingName(true)}
                    className="group inline-flex items-center gap-1.5 text-muted hover:text-foreground transition-colors"
                    title="Cliquer pour renommer"
                  >
                    <span className="text-sm">{project.name}</span>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ✎
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Type badge — cliquable */}
            <div className="flex items-center gap-2 mt-2 flex-wrap relative" ref={typeMenuRef}>
              <button
                type="button"
                onClick={() => setTypeMenuOpen((v) => !v)}
                className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted font-medium inline-flex items-center gap-1.5 hover:text-foreground hover:border-muted transition-colors"
                title="Changer le type"
              >
                <span>{typeInfo.emoji}</span>
                <span>{typeInfo.label}</span>
                <span className="text-[9px] opacity-70">▾</span>
              </button>
              {deadline && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center gap-1.5 ${deadline.className}`}
                  title={`Deadline : ${new Date(project.deadline!).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
                >
                  <span>{deadline.emoji}</span>
                  <span>{deadline.label}</span>
                </span>
              )}
              {typeMenuOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[220px]">
                  {PROJECT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeChange(t.value)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-accent/10 transition-colors flex items-center gap-2 ${
                        t.value === project.type ? "bg-accent/15 text-accent font-medium" : ""
                      }`}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span>{t.label}</span>
                      {t.value === project.type && (
                        <span className="ml-auto text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu actions */}
          <div className="relative shrink-0" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => setActionsMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-xl bg-card/60 border border-border text-muted hover:text-foreground hover:border-muted transition-colors inline-flex items-center justify-center"
              aria-label="Actions du projet"
              title="Actions"
            >
              …
            </button>
            {actionsMenuOpen && (
              <div className="absolute top-full right-0 mt-1.5 z-30 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[220px]">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <span>🗑️</span>
                  <span>{deleting ? "Mise à la corbeille..." : "Mettre à la corbeille"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status picker */}
        <div className="flex gap-1.5 mt-5 flex-wrap">
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
              ? tasks.filter((todo) => todo.status !== "done").length +
                ideas.filter((todo) => todo.status !== "done").length
              : t.value === "decisions"
              ? decisions.length
              : null;
          return (
            <button
              key={t.value}
              onClick={() => navigateTab(t.value)}
              className={`flex-1 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all inline-flex items-center justify-center gap-1 ${
                tab === t.value
                  ? "bg-accent text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span>{t.emoji}</span>
              <span className="hidden sm:inline">{t.label}</span>
              {count !== null && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
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
          sections={sections}
          todos={tasks}
          decisions={decisions}
          roadmap={roadmap}
          risks={risks}
          onUpdate={updateProject}
          onRoadmapChange={setRoadmap}
          onRisksChange={setRisks}
          onGoToTasks={() => navigateTab("tasks")}
          onGoToDesign={() => navigateTab("design")}
          onGoToTechnique={() => navigateTab("technique")}
        />
      )}

      {tab === "brainstorm" && (
        <BrainstormEditor
          project={project}
          initialSections={sections}
          sectionDefs={sectionDefs}
          onProjectUpdate={updateProject}
          onSectionsChange={setSections}
        />
      )}

      {tab === "tasks" && (
        <TasksTab
          userId={userId}
          project={project}
          tasks={tasks}
          ideas={ideas}
          onTasksChange={setTasks}
          onIdeasChange={setIdeas}
        />
      )}

      {tab === "decisions" && (
        <DecisionsPanel
          projectId={project.id}
          initialDecisions={decisions}
          onChange={setDecisions}
        />
      )}

      {tab === "technique" && (
        <TechniquePanel
          project={project}
          initialSections={sections}
          onProjectUpdate={updateProject}
          onSectionsChange={setSections}
        />
      )}

      {tab === "design" && (
        <DesignPanel
          project={project}
          initialSections={sections}
          onProjectUpdate={updateProject}
          onSectionsChange={setSections}
        />
      )}

      {tab === "resources" && (
        <SingleSectionPanel
          project={project}
          sectionKey="resources"
          initialSections={sections}
          onProjectUpdate={updateProject}
          onSectionsChange={setSections}
        />
      )}
    </div>
  );
}

function TasksTab({
  userId,
  project,
  tasks,
  ideas,
  onTasksChange,
  onIdeasChange,
}: {
  userId: string;
  project: Project;
  tasks: Todo[];
  ideas: Todo[];
  onTasksChange: (todos: Todo[]) => void;
  onIdeasChange: (todos: Todo[]) => void;
}) {
  const allTodos = useMemo(() => [...tasks, ...ideas], [tasks, ideas]);
  const knownTags = useMemo(() => uniqueTags(allTodos), [allTodos]);
  const tagSuggestions = useMemo(
    () => mergeTagSuggestions(TAG_PRESETS, knownTags),
    [knownTags]
  );
  const tagCounts = useMemo(() => countTags(allTodos), [allTodos]);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      <TagFilter
        knownTags={tagSuggestions}
        activeTags={activeTags}
        onChange={setActiveTags}
        tagCounts={tagCounts}
        label="Filtrer tâches + idées par tag"
      />
      <TodoList
        userId={userId}
        scope={{ kind: "project", projectId: project.id, projectType: project.type }}
        kind="task"
        initialTodos={tasks}
        onTodosChange={onTasksChange}
        tagFilter={activeTags}
        tagSuggestions={tagSuggestions}
      />
      <TodoList
        userId={userId}
        scope={{ kind: "project", projectId: project.id, projectType: project.type }}
        kind="idea"
        initialTodos={ideas}
        onTodosChange={onIdeasChange}
        tagFilter={activeTags}
        tagSuggestions={tagSuggestions}
      />
    </div>
  );
}
