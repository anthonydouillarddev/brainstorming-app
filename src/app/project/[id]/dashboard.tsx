"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SectionDef } from "@/lib/sections";
import type {
  Project,
  ProjectStatus,
  ProjectType,
  Todo,
  Decision,
  RoadmapItem,
  Risk,
  UserPreferences,
} from "@/lib/types";
import { PROJECT_STATUSES, PROJECT_TYPES } from "@/lib/types";
import { deadlineStatus } from "@/lib/deadline";
import ThemeToggle from "@/app/components/theme-toggle";
import UserSettings from "@/app/components/user-settings";
import { renderModule, type ModuleContext } from "./module-registry";
import ModulesManager, { type ProjectModuleWithMeta } from "./ModulesManager";

const LEGACY_TAB_ALIASES: Record<string, string> = {
  tech: "technique",
};

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
  initialModules,
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
  initialModules: ProjectModuleWithMeta[];
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
  const [modules, setModules] = useState<ProjectModuleWithMeta[]>(initialModules);

  const enabledModules = useMemo(() => {
    const filtered = modules.filter((m) => m.enabled);
    if (filtered.length > 0) {
      return [...filtered].sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [];
  }, [modules]);

  const tabSlugs = useMemo(() => enabledModules.map((m) => m.module.slug), [enabledModules]);
  const validSlugs = useMemo(() => new Set(tabSlugs), [tabSlugs]);

  const [userTab, setUserTab] = useState<string | null>(() => {
    const raw = initialTab ?? "";
    const normalized = LEGACY_TAB_ALIASES[raw] ?? raw;
    return normalized ? normalized : null;
  });

  const tab =
    userTab && validSlugs.has(userTab) ? userTab : tabSlugs[0] ?? "cockpit";

  const navigateTab = useCallback((next: string) => {
    setUserTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
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

  const updateProject = useCallback(
    async (patch: Partial<Project>) => {
      const previous = project;
      setProject((prev) => ({ ...prev, ...patch }));
      const { error } = await supabase.from("projects").update(patch).eq("id", project.id);
      if (error) {
        setProject(previous);
        alert("Erreur de sauvegarde : " + error.message);
      }
    },
    [project, supabase]
  );

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

  const activeModule = enabledModules.find((m) => m.module.slug === tab) ?? enabledModules[0];

  const ctx = useMemo<ModuleContext>(
    () => ({
      userId,
      project,
      sections,
      sectionDefs,
      tasks,
      ideas,
      decisions,
      roadmap,
      risks,
      onProjectUpdate: updateProject,
      onSectionsChange: setSections,
      onTasksChange: setTasks,
      onIdeasChange: setIdeas,
      onDecisionsChange: setDecisions,
      onRoadmapChange: setRoadmap,
      onRisksChange: setRisks,
      onNavigate: navigateTab,
    }),
    [
      userId,
      project,
      sections,
      sectionDefs,
      tasks,
      ideas,
      decisions,
      roadmap,
      risks,
      updateProject,
      navigateTab,
    ]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full">
      <div className="flex items-center justify-between mb-6 sticky top-0 z-20 -mx-4 px-4 py-2 backdrop-blur-2xl [mask-image:linear-gradient(black_80%,transparent)]">
        <button
          onClick={() => {
            router.push("/");
            router.refresh();
          }}
          className="px-4 py-3 -ml-4 text-muted hover:text-foreground text-sm transition-colors rounded-xl"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModulesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-card/60 border border-border text-muted hover:text-foreground hover:border-muted transition-colors text-sm"
            title="Gérer les modules du projet"
            aria-label="Gérer les modules"
          >
            <span>⚙️</span>
            <span className="hidden sm:inline">Modules</span>
          </button>
          <ThemeToggle />
          <UserSettings
            userEmail={userEmail}
            userId={userId}
            initialPreferences={initialPreferences}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
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

      {enabledModules.length > 0 ? (
        <div className="flex gap-1 mb-6 bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-1 shadow-sm overflow-x-auto">
          {enabledModules.map((m) => {
            const slug = m.module.slug;
            const count =
              slug === "tasks"
                ? tasks.filter((todo) => todo.status !== "done").length +
                  ideas.filter((todo) => todo.status !== "done").length
                : slug === "decisions"
                ? decisions.length
                : null;
            const active = tab === slug;
            return (
              <button
                key={m.id}
                onClick={() => navigateTab(slug)}
                className={`flex-shrink-0 px-2 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all inline-flex items-center justify-center gap-1 ${
                  active
                    ? "bg-accent text-white shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span>{m.module.icon}</span>
                <span className="hidden sm:inline">{m.module.name}</span>
                {count !== null && count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/25" : "bg-accent/15 text-accent"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mb-6 bg-card/60 border border-border rounded-2xl p-4 text-sm text-muted text-center">
          Aucun module activé. Clique sur ⚙️ Modules pour en activer.
        </div>
      )}

      {activeModule
        ? renderModule(
            activeModule.module.componentKey,
            ctx,
            activeModule.module.name,
            activeModule.module.icon
          )
        : null}

      <ModulesManager
        open={modulesOpen}
        projectId={project.id}
        initialModules={modules}
        onClose={() => setModulesOpen(false)}
        onModulesChange={setModules}
      />
    </div>
  );
}
