"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import type { SectionDef } from "@/lib/sections";
import { getActiveSections } from "@/lib/sections";
import type { Project, Todo } from "@/lib/types";
import { PROJECT_STATUSES, PHASES, statusIndex, statusPhase } from "@/lib/types";

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

export default function Cockpit({
  project,
  sections,
  todos,
  onUpdate,
}: {
  project: Project;
  sections: Record<string, string>;
  sectionDefs: SectionDef[];
  todos: Todo[];
  onUpdate: (patch: Partial<Project>) => Promise<void>;
}) {
  const parsed = useMemo(() => parseSections(sections), [sections]);

  const [northStar, setNorthStar] = useState(project.north_star ?? "");
  const [nextAction, setNextAction] = useState(project.next_action ?? "");
  const [deadline, setDeadline] = useState(project.deadline ?? "");
  const [metricUsers, setMetricUsers] = useState<string>(
    project.metric_users?.toString() ?? ""
  );
  const [metricMrr, setMetricMrr] = useState<string>(project.metric_mrr?.toString() ?? "");
  const [savingField, setSavingField] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
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

  const blockers = todos.filter((t) => t.status === "blocked");

  const createdDate = new Date(project.created_at);
  const updatedDate = new Date(project.updated_at);

  const currentStatus = PROJECT_STATUSES.find((s) => s.value === project.status) ?? PROJECT_STATUSES[0];

  async function syncFromBrainstorm() {
    const identity = parsed["identity"] ?? {};
    const score = parsed["score"] ?? {};
    const tagline = typeof identity.tagline === "string" ? identity.tagline.trim() : "";
    const brainstormNextAction =
      typeof score.next_action === "string" ? score.next_action.trim() : "";

    const patch: Partial<Project> = {};
    const updates: string[] = [];

    if (tagline) {
      patch.description = tagline;
      updates.push("description");
    }
    if (brainstormNextAction) {
      patch.next_action = brainstormNextAction;
      setNextAction(brainstormNextAction);
      updates.push("prochaine action");
    }

    if (updates.length === 0) {
      setSyncFeedback("Rien à synchroniser — remplis la tagline (Identité) ou la prochaine action (Score)");
      setTimeout(() => setSyncFeedback(null), 3500);
      return;
    }

    await onUpdate(patch);
    setSyncFeedback(`✓ ${updates.join(" + ")} mis à jour`);
    setTimeout(() => setSyncFeedback(null), 2500);
  }

  return (
    <div className="space-y-5">
      {/* Sync depuis brainstorm */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={syncFromBrainstorm}
          className="text-xs px-3.5 py-2 rounded-xl bg-accent/15 border border-accent/40 text-accent font-semibold hover:bg-accent/25 transition-colors inline-flex items-center gap-1.5"
        >
          🔄 Synchroniser depuis le brainstorm
        </button>
        {syncFeedback && (
          <span className="text-xs text-muted">{syncFeedback}</span>
        )}
      </div>

      {/* Description dérivée du brainstorm */}
      {project.description && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">
            ℹ️ Description
          </h3>
          <p className="text-sm leading-relaxed">{project.description}</p>
        </div>
      )}

      {/* Prochaine action critique — UNE SEULE, toujours en haut */}
      <div className="bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm border border-accent/30 rounded-2xl p-5 shadow-sm">
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-accent mb-2">
          <span>⚡ Prochaine action critique</span>
          {savingField === "next_action" && (
            <span className="text-muted normal-case text-[10px]">Sauvegarde...</span>
          )}
        </label>
        <input
          value={nextAction}
          onChange={(e) => {
            setNextAction(e.target.value);
            saveDebounced("next_action", { next_action: e.target.value.trim() || null });
          }}
          placeholder="La seule action qui fera bouger ton projet maintenant"
          className="w-full bg-transparent border-none outline-none text-lg font-semibold placeholder:text-muted/50 placeholder:font-normal"
        />
      </div>

      {/* Grille principale */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Progression */}
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

        {/* Phases */}
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

      {/* North Star */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
        <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-2">
          <span>⭐ North Star Metric</span>
          {savingField === "north_star" && <span className="normal-case text-[10px]">Sauvegarde...</span>}
        </label>
        <p className="text-xs text-muted mb-2">
          La métrique unique qui compte — ce que tu regardes en premier chaque jour.
        </p>
        <input
          value={northStar}
          onChange={(e) => {
            setNorthStar(e.target.value);
            saveDebounced("north_star", { north_star: e.target.value.trim() || null });
          }}
          placeholder="Ex: Nombre d'utilisateurs actifs quotidiens"
          className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-sm text-foreground placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
        />
      </div>

      {/* Blocages actifs */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          🚧 Blocages actifs
        </h3>
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

      {/* Métriques SaaS (conditionnel) */}
      {project.type === "saas" && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
            📊 Métriques SaaS
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Utilisateurs actifs</label>
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
              <label className="block text-xs text-muted mb-1.5">MRR (€)</label>
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

      {/* Dates clés */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
          📅 Dates clés
        </h3>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-muted mb-1">Créé</div>
            <div className="font-semibold">
              {createdDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          </div>
          <div>
            <div className="text-muted mb-1">Dernière activité</div>
            <div className="font-semibold">
              {updatedDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
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

      {/* Status courant rappel */}
      <div className="flex items-center gap-2 text-xs text-muted justify-center">
        <span>Statut :</span>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-medium ${currentStatus.badge}`}>
          {currentStatus.emoji} {currentStatus.label}
        </span>
      </div>
    </div>
  );
}
