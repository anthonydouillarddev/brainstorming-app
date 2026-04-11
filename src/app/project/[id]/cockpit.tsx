"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { SectionDef } from "@/lib/sections";
import { getActiveSections } from "@/lib/sections";
import type { Project, Todo, Decision, RoadmapItem, Risk } from "@/lib/types";
import { PROJECT_STATUSES, PHASES, statusIndex, statusPhase } from "@/lib/types";
import RisksPanel from "./risks";
import RoadmapPanel from "./roadmap";

type SectionData = Record<string, unknown>;

function parseSections(raw: Record<string, string>): Record<string, SectionData> {
  const out: Record<string, SectionData> = {};
  for (const [key, content] of Object.entries(raw)) {
    try {
      out[key] = JSON.parse(content);
    } catch {
      out[key] = {};
    }
  }
  return out;
}

function isFieldFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return false;
}

function firstString(data: SectionData, key: string): string | null {
  const v = data[key];
  return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
}

const STACK_FIELDS: { key: string; label: string; color: string }[] = [
  { key: "framework", label: "Framework", color: "bg-blue-500/15 text-blue-500" },
  { key: "ui", label: "UI", color: "bg-pink-500/15 text-pink-500" },
  { key: "database", label: "DB", color: "bg-emerald-500/15 text-emerald-500" },
  { key: "auth", label: "Auth", color: "bg-purple-500/15 text-purple-500" },
  { key: "payments", label: "Paiements", color: "bg-orange-500/15 text-orange-500" },
  { key: "email", label: "Email", color: "bg-cyan-500/15 text-cyan-500" },
  { key: "hosting", label: "Hosting", color: "bg-indigo-500/15 text-indigo-500" },
  { key: "monitoring", label: "Monitoring", color: "bg-rose-500/15 text-rose-500" },
];

export default function Cockpit({
  project,
  sections,
  todos,
  decisions,
  roadmap,
  risks,
  onUpdate,
  onRoadmapChange,
  onRisksChange,
  onDelete,
  deleting,
  onGoToTasks,
}: {
  project: Project;
  sections: Record<string, string>;
  sectionDefs: SectionDef[];
  todos: Todo[];
  decisions: Decision[];
  roadmap: RoadmapItem[];
  risks: Risk[];
  onUpdate: (patch: Partial<Project>) => Promise<void>;
  onRoadmapChange: (items: RoadmapItem[]) => void;
  onRisksChange: (items: Risk[]) => void;
  onDelete: () => void;
  deleting: boolean;
  onGoToTasks: () => void;
}) {
  const parsed = useMemo(() => parseSections(sections), [sections]);

  const [northStar, setNorthStar] = useState(project.north_star ?? "");
  const [metricUsers, setMetricUsers] = useState<string>(
    project.metric_users?.toString() ?? ""
  );
  const [metricMrr, setMetricMrr] = useState<string>(project.metric_mrr?.toString() ?? "");
  const [deadline, setDeadline] = useState(project.deadline ?? "");
  const [savingField, setSavingField] = useState<string | null>(null);
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const saveDebounced = useCallback(
    (key: string, patch: Partial<Project>) => {
      if (saveTimers.current[key]) clearTimeout(saveTimers.current[key]);
      setSavingField(key);
      saveTimers.current[key] = setTimeout(async () => {
        await onUpdate(patch);
        setSavingField(null);
      }, 600);
    },
    [onUpdate]
  );

  // Derived progress
  const activeSections = useMemo(
    () => getActiveSections(project.type, project.disabled_sections),
    [project.type, project.disabled_sections]
  );

  const sectionProgress = useMemo(() => {
    if (activeSections.length === 0) return 0;
    let complete = 0;
    for (const def of activeSections) {
      const data = parsed[def.key] ?? {};
      const filled = def.fields.filter((f) => isFieldFilled(data[f.key])).length;
      if (filled === def.fields.length) complete++;
    }
    return Math.round((complete / activeSections.length) * 100);
  }, [activeSections, parsed]);

  const statusProgress = Math.round(
    (statusIndex(project.status) / (PROJECT_STATUSES.length - 1)) * 100
  );

  const globalProgress =
    activeSections.length === 0
      ? statusProgress
      : Math.round((sectionProgress + statusProgress) / 2);

  const currentPhase = statusPhase(project.status);
  const phaseIndex = PHASES.findIndex((p) => p.value === currentPhase);
  const currentStatus =
    PROJECT_STATUSES.find((s) => s.value === project.status) ?? PROJECT_STATUSES[0];

  // Derived content from brainstorm
  const identityData = parsed["identity"] ?? {};
  const problemData = parsed["problem"] ?? {};
  const targetData = parsed["target"] ?? {};
  const techData = parsed["tech"] ?? {};
  const journalData = parsed["journal"] ?? {};

  const problemStatement = firstString(problemData, "problem_statement");
  const persona = firstString(targetData, "persona_who");
  const tagline = firstString(identityData, "tagline");

  // Next action critique = 1ère todo P1 (urgent) non-done
  const nextActionTask = useMemo(
    () => todos.find((t) => t.priority === "urgent" && t.status !== "done") ?? null,
    [todos]
  );

  // Blocages = todos avec status=blocked
  const blockers = useMemo(() => todos.filter((t) => t.status === "blocked"), [todos]);

  // Stack chips (depuis section tech)
  const stackChips = useMemo(
    () =>
      STACK_FIELDS.map((field) => ({
        ...field,
        value: firstString(techData, field.key),
      })).filter((c) => c.value != null),
    [techData]
  );

  // Dernière entrée journal (premières lignes non-vides)
  const journalLastLine = useMemo(() => {
    const entries = firstString(journalData, "journal_entries");
    if (!entries) return null;
    const lines = entries
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines[lines.length - 1] ?? null;
  }, [journalData]);

  // 3 dernières décisions
  const recentDecisions = decisions.slice(0, 3);

  const createdDate = new Date(project.created_at);
  const updatedDate = new Date(project.updated_at);

  const sectionSynthesis = [
    { icon: "💡", label: "Pitch", value: tagline ?? project.description },
    { icon: "🔴", label: "Problème", value: problemStatement },
    { icon: "🎯", label: "Cible", value: persona },
  ].filter((s) => s.value);

  return (
    <div className="space-y-5">
      {/* 1. BLOCAGES ACTIFS — top priorité */}
      <div
        className={`backdrop-blur-sm border rounded-2xl p-5 shadow-sm ${
          blockers.length > 0
            ? "bg-red-500/5 border-red-500/40"
            : "bg-card/80 border-border"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            🚧 Blocages actifs ({blockers.length})
          </h3>
          <p className="text-[10px] text-muted">
            Tâches marquées 🚧 Bloqué dans l&apos;onglet Tâches
          </p>
        </div>
        {blockers.length === 0 ? (
          <p className="text-sm text-muted">Aucun blocage — tout avance bien 👌</p>
        ) : (
          <div className="space-y-2">
            {blockers.map((todo) => (
              <div
                key={todo.id}
                className="flex items-start gap-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl"
              >
                <span className="text-red-500 text-sm mt-0.5">🚧</span>
                <span className="text-sm flex-1">{todo.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. PROCHAINE ACTION CRITIQUE — auto = 1ère P1 non-done */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm border border-accent/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
            ⚡ Prochaine action critique
          </h3>
          <span className="text-[10px] text-muted">Auto = 1ère tâche P1</span>
        </div>
        {nextActionTask ? (
          <button
            onClick={onGoToTasks}
            className="w-full text-left"
          >
            <p className="text-lg font-semibold hover:text-accent transition-colors">
              {nextActionTask.text}
            </p>
            <p className="text-xs text-muted mt-1">
              → Cliquer pour ouvrir la todolist
            </p>
          </button>
        ) : (
          <button
            onClick={onGoToTasks}
            className="w-full text-left py-2"
          >
            <p className="text-sm text-muted italic">
              Aucune tâche P1 définie.
            </p>
            <p className="text-xs text-accent font-medium mt-1">
              → Crée une tâche prioritaire dans l&apos;onglet Tâches
            </p>
          </button>
        )}
      </div>

      {/* 3. SYNTHÈSE PROJET — pitch + problème + cible */}
      {sectionSynthesis.length > 0 && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            ℹ️ Synthèse projet
          </h3>
          <div className="space-y-2">
            {sectionSynthesis.map((s) => (
              <div key={s.label} className="flex items-start gap-3 text-sm">
                <span className="shrink-0 w-20 text-xs text-muted uppercase tracking-wider pt-0.5">
                  {s.icon} {s.label}
                </span>
                <span className="flex-1 leading-snug">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROGRESSION + PHASE */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            📈 Progression
          </h3>
          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm text-muted">Global</span>
              <span className="text-2xl font-extrabold">{globalProgress}%</span>
            </div>
            <div className="h-2 bg-background/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${globalProgress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-muted mb-1">Brainstorm</div>
              <div className="font-semibold">{sectionProgress}%</div>
              <div className="h-1 bg-background/60 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${sectionProgress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Phase</div>
              <div className="font-semibold">{statusProgress}%</div>
              <div className="h-1 bg-background/60 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${statusProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            🧭 Phase actuelle
          </h3>
          <div className="space-y-2">
            {PHASES.map((p, i) => {
              const isCurrent = p.value === currentPhase;
              const isPast = i < phaseIndex;
              return (
                <div
                  key={p.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    isCurrent
                      ? "bg-accent/15 border border-accent/40"
                      : isPast
                      ? "opacity-50"
                      : "opacity-40"
                  }`}
                >
                  <span className="text-lg">{p.emoji}</span>
                  <span className={`text-sm font-medium flex-1 ${isCurrent ? "text-accent" : ""}`}>
                    {p.label}
                  </span>
                  {isPast && <span className="text-green-500 text-sm">✓</span>}
                  {isCurrent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-white font-semibold">
                      EN COURS
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. NSM + MÉTRIQUES + RISQUES */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-2">
              <span>⭐ North Star</span>
              {savingField === "north_star" && (
                <span className="normal-case text-[10px]">Sauvegarde...</span>
              )}
            </label>
            <input
              value={northStar}
              onChange={(e) => {
                setNorthStar(e.target.value);
                saveDebounced("north_star", { north_star: e.target.value.trim() || null });
              }}
              placeholder="La métrique unique qui compte"
              className="w-full px-3 py-2 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          {project.type === "saas" && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                📊 Métriques SaaS
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-muted mb-1">Users actifs</label>
                  <input
                    type="number"
                    min={0}
                    value={metricUsers}
                    onChange={(e) => {
                      setMetricUsers(e.target.value);
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      saveDebounced("metric_users", { metric_users: val });
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-muted mb-1">MRR (€)</label>
                  <input
                    type="number"
                    min={0}
                    value={metricMrr}
                    onChange={(e) => {
                      setMetricMrr(e.target.value);
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      saveDebounced("metric_mrr", { metric_mrr: val });
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <RisksPanel projectId={project.id} risks={risks} onChange={onRisksChange} />
      </div>

      {/* 6. ROADMAP Q1-Q4 */}
      <RoadmapPanel projectId={project.id} roadmap={roadmap} onChange={onRoadmapChange} />

      {/* 7. STACK (chips) + ACTIVITÉ RÉCENTE */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Stack chips */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            ⚙️ Stack
          </h3>
          {stackChips.length === 0 ? (
            <p className="text-xs text-muted">
              Renseigne la section <span className="font-semibold">Stack Technique</span> du
              brainstorm pour voir tes outils ici.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {stackChips.map((chip) => (
                <span
                  key={chip.key}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium ${chip.color}`}
                  title={chip.label}
                >
                  {chip.value}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Activité récente : décisions + journal */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
            🧭 Activité récente
          </h3>
          {recentDecisions.length === 0 && !journalLastLine ? (
            <p className="text-xs text-muted">
              Aucune décision ni entrée de journal pour l&apos;instant.
            </p>
          ) : (
            <div className="space-y-2.5 text-sm">
              {recentDecisions.map((d) => (
                <div key={d.id} className="flex items-start gap-2">
                  <span className="text-xs text-muted shrink-0 pt-0.5">🧭</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{d.title}</div>
                    <div className="text-[10px] text-muted">
                      {new Date(d.decided_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {journalLastLine && (
                <div className="flex items-start gap-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted shrink-0 pt-0.5">📓</span>
                  <span className="text-xs text-muted line-clamp-2 flex-1">
                    {journalLastLine}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 8. DATES CLÉS */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
          📅 Dates clés
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-muted mb-1">Créé</div>
            <div className="font-semibold">
              {createdDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <div className="text-muted mb-1">Dernière activité</div>
            <div className="font-semibold">
              {updatedDate.toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div>
            <label className="block text-muted mb-1">Deadline cible</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => {
                setDeadline(e.target.value);
                saveDebounced("deadline", { deadline: e.target.value || null });
              }}
              className="w-full px-2 py-1 bg-background/60 border border-border rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
            />
          </div>
        </div>
      </div>

      {/* Statut courant rappel */}
      <div className="flex items-center gap-2 text-xs text-muted justify-center">
        <span>Statut :</span>
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-medium ${currentStatus.badge}`}
        >
          {currentStatus.emoji} {currentStatus.label}
        </span>
      </div>

      {/* Action destructrice centralisée */}
      <div className="pt-6 border-t border-border flex justify-center">
        <button
          onClick={onDelete}
          disabled={deleting}
          className="px-4 py-2 text-red-500 text-sm hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {deleting ? "Mise à la corbeille..." : "🗑️ Mettre à la corbeille"}
        </button>
      </div>
    </div>
  );
}
