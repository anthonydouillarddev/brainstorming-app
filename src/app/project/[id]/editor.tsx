"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { SectionDef } from "@/lib/sections";
import {
  getActiveSections,
  getManageableSections,
  isSectionEnabled,
  parseSections,
  isFieldFilled,
  type SectionData,
} from "@/lib/sections";
import type { Project } from "@/lib/types";
import { FieldRenderer, type LinkItem } from "./field-renderer";

function syncFromBrainstorm(
  parsed: Record<string, SectionData>
): { patch: Partial<Project>; updates: string[] } {
  const identity = parsed["identity"] ?? {};
  const score = parsed["score"] ?? {};
  const branding = parsed["branding"] ?? {};
  const tagline = typeof identity.tagline === "string" ? identity.tagline.trim() : "";
  const brainstormNextAction =
    typeof score.next_action === "string" ? score.next_action.trim() : "";
  const officialName =
    typeof branding.official_name === "string" ? branding.official_name.trim() : "";

  const patch: Partial<Project> = {};
  const updates: string[] = [];

  if (tagline) {
    patch.description = tagline;
    updates.push("description");
  }
  if (brainstormNextAction) {
    patch.next_action = brainstormNextAction;
    updates.push("prochaine action");
  }
  if (officialName) {
    patch.official_name = officialName;
    updates.push("nom officiel");
  }

  return { patch, updates };
}

function countFilled(def: SectionDef, data: SectionData): number {
  return def.fields.filter((f) => isFieldFilled(data[f.key])).length;
}

export default function BrainstormEditor({
  project,
  initialSections,
  sectionDefs,
  onProjectUpdate,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  sectionDefs: SectionDef[];
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const parsedInitial = useMemo(() => parseSections(initialSections), [initialSections]);
  const [sections, setSections] = useState<Record<string, SectionData>>(parsedInitial);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [collapseOverride, setCollapseOverride] = useState<Record<string, "open" | "closed">>({});
  const [showModulePicker, setShowModulePicker] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const saveTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const supabase = createClient();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`brainstorm:collapse:${project.id}`);
      if (stored) {
        // Sync from external store (localStorage) after mount to avoid hydration mismatch
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapseOverride(JSON.parse(stored) as Record<string, "open" | "closed">);
      }
    } catch {
      /* ignore */
    }
  }, [project.id]);

  const saveSection = useCallback(
    async (sectionKey: string, data: SectionData) => {
      await supabase.from("sections").upsert(
        { project_id: project.id, section_key: sectionKey, content: JSON.stringify(data) },
        { onConflict: "project_id,section_key" }
      );
    },
    [project.id, supabase]
  );

  function updateField(sectionKey: string, fieldKey: string, value: unknown) {
    setSections((prev) => {
      const updated = {
        ...prev,
        [sectionKey]: { ...(prev[sectionKey] || {}), [fieldKey]: value },
      };
      if (saveTimers.current[sectionKey]) clearTimeout(saveTimers.current[sectionKey]);
      saveTimers.current[sectionKey] = setTimeout(async () => {
        setSaving(true);
        await saveSection(sectionKey, updated[sectionKey]);
        await onProjectUpdate({ updated_at: new Date().toISOString() });
        onSectionsChange?.(
          Object.fromEntries(
            Object.entries(updated).map(([k, v]) => [k, JSON.stringify(v)])
          )
        );
        setSaving(false);
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
      }, 800);
      return updated;
    });
  }

  useEffect(() => {
    const timers = saveTimers.current;
    return () => {
      for (const id of Object.values(timers)) clearTimeout(id);
    };
  }, []);

  const activeSections = useMemo(
    () => getActiveSections(project.type, project.disabled_sections),
    [project.type, project.disabled_sections]
  );
  const manageableSections = useMemo(() => getManageableSections(), []);

  function toggleManual(key: string, currentlyOpen: boolean) {
    setCollapseOverride((prev) => {
      const next = { ...prev, [key]: currentlyOpen ? ("closed" as const) : ("open" as const) };
      if (typeof window !== "undefined") {
        localStorage.setItem(`brainstorm:collapse:${project.id}`, JSON.stringify(next));
      }
      return next;
    });
  }

  async function toggleSectionDisabled(sectionKey: string) {
    const disabled = project.disabled_sections.includes(sectionKey)
      ? project.disabled_sections.filter((k) => k !== sectionKey)
      : [...project.disabled_sections, sectionKey];
    await onProjectUpdate({ disabled_sections: disabled });
  }

  const scoreDef = sectionDefs.find((s) => s.key === "score");
  const scoreData = sections["score"] || {};
  const scoreFields = scoreDef?.fields.filter((f) => f.type === "score") ?? [];
  const totalScore = scoreFields.reduce((sum, f) => sum + (Number(scoreData[f.key]) || 0), 0);
  const maxScore = scoreFields.length * 10;

  function exportForClaude() {
    const lines: string[] = [];
    const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    lines.push(`# ${project.name}`);
    lines.push(`> Exporté le ${date} — Statut : ${project.status}`);
    lines.push("");

    for (const def of activeSections) {
      const data = sections[def.key] || {};
      if (!def.fields.some((f) => isFieldFilled(data[f.key]))) continue;

      lines.push("---");
      lines.push(`## ${def.emoji} ${def.title}`);
      lines.push("");

      for (const field of def.fields) {
        const val = data[field.key];
        if (!isFieldFilled(val)) continue;

        if (field.type === "question" || field.type === "text") {
          lines.push(`### ${field.label}`);
          if (field.hint) lines.push(`_${field.hint}_`);
          lines.push("");
          lines.push((val as string).trim());
          lines.push("");
        }
        if (field.type === "choice") {
          const selected = val as string[];
          lines.push(`### ${field.label}`);
          for (const s of selected) lines.push(`- [x] ${s}`);
          for (const u of (field.options ?? []).filter((o) => !selected.includes(o))) {
            lines.push(`- [ ] ${u}`);
          }
          lines.push("");
        }
        if (field.type === "links") {
          const links = val as LinkItem[];
          lines.push(`### ${field.label}`);
          for (const link of links) lines.push(`- [${link.tag}] [${link.title}](${link.url})`);
          lines.push("");
        }
        if (field.type === "score") {
          lines.push(`- **${field.label}** : ${val}/${field.max ?? 10}`);
        }
      }
      lines.push("");
    }

    if (totalScore > 0) {
      lines.push("---");
      lines.push(`## Score total : ${totalScore}/${maxScore}`);
      lines.push("");
    }

    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brainstorming.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* Save indicator + modules picker toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowModulePicker((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-xl bg-card border border-border text-muted hover:text-foreground hover:border-muted transition-colors"
        >
          ⚙️ Modules {showModulePicker ? "▾" : "▸"}
        </button>
        <div className="flex items-center gap-3 text-xs">
          {saving && <span className="text-muted">Sauvegarde...</span>}
          {lastSaved && !saving && <span className="text-green-500">✓ {lastSaved}</span>}
          {maxScore > 0 && (
            <span
              className={`font-bold ${
                totalScore >= maxScore * 0.7
                  ? "text-green-500"
                  : totalScore >= maxScore * 0.4
                  ? "text-yellow-500"
                  : "text-red-400"
              }`}
            >
              {totalScore}/{maxScore}
            </span>
          )}
        </div>
      </div>

      {/* Module picker */}
      {showModulePicker && (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-baseline justify-between mb-3 gap-2 flex-wrap">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
              Activer / désactiver les modules
            </h3>
            <span className="text-[11px] text-muted">
              {activeSections.length}/{manageableSections.length} modules actifs
            </span>
          </div>
          <p className="text-xs text-muted mb-4">
            Par défaut, seules les sections pertinentes pour un projet de type{" "}
            <span className="font-semibold text-foreground">{project.type}</span> sont affichées.
            Tu peux ajouter ou retirer des modules manuellement.
          </p>
          <div className="grid sm:grid-cols-2 gap-2">
            {manageableSections.map((def) => {
              const isDefault = def.defaultForTypes.includes(project.type);
              const isActive = isSectionEnabled(def, project.type, project.disabled_sections);
              return (
                <label
                  key={def.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? "bg-accent/10 border-accent/40"
                      : "bg-background/60 border-border hover:border-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => toggleSectionDisabled(def.key)}
                    className="accent-accent"
                  />
                  <span className="text-base">{def.emoji}</span>
                  <span className="text-sm flex-1 truncate">{def.title}</span>
                  {!isDefault && (
                    <span className="text-[9px] uppercase tracking-wider text-muted">override</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {activeSections.map((def) => {
          const data = sections[def.key] || {};
          const filledCount = countFilled(def, data);
          const isComplete = filledCount === def.fields.length && def.fields.length > 0;
          const override = collapseOverride[def.key];
          const isOpen = override ? override === "open" : !isComplete;

          return (
            <div
              key={def.key}
              className={`bg-card/80 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-sm transition-all ${
                isComplete ? "border-green-500/40" : "border-border"
              }`}
            >
              <button
                onClick={() => toggleManual(def.key, isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{def.emoji}</span>
                    <h2 className="font-bold text-base">{def.title}</h2>
                    {isComplete && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/15 text-green-500 font-semibold uppercase tracking-wider">
                        ✓ complet
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 ml-8">{def.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {filledCount > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        isComplete
                          ? "bg-green-500/15 text-green-500"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {filledCount}/{def.fields.length}
                    </span>
                  )}
                  <span className="text-muted text-sm">{isOpen ? "▾" : "▸"}</span>
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 space-y-5 border-t border-border">
                  {def.fields.map((field) => (
                    <FieldRenderer
                      key={field.key}
                      field={field}
                      value={sections[def.key]?.[field.key]}
                      onChange={(val) => updateField(def.key, field.key, val)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sync + Export (fin du form) */}
      <div className="pt-4 space-y-3">
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-accent">🔄 Synchroniser avec le cockpit</h3>
              <p className="text-xs text-muted mt-0.5">
                Remonte la tagline (Identité) et la prochaine action (Score) dans le cockpit.
              </p>
            </div>
            {syncFeedback && (
              <span className="text-xs text-muted shrink-0">{syncFeedback}</span>
            )}
          </div>
          <button
            onClick={async () => {
              const { patch, updates } = syncFromBrainstorm(sections);
              if (updates.length === 0) {
                setSyncFeedback(
                  "Rien à synchroniser — remplis la tagline (Identité) ou la prochaine action (Score)"
                );
                setTimeout(() => setSyncFeedback(null), 4000);
                return;
              }
              setSyncing(true);
              await onProjectUpdate(patch);
              setSyncing(false);
              setSyncFeedback(`✓ ${updates.join(" + ")} mis à jour`);
              setTimeout(() => setSyncFeedback(null), 2500);
            }}
            disabled={syncing}
            className="w-full py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {syncing ? "Synchronisation..." : "🔄 Synchroniser avec le cockpit"}
          </button>
        </div>

        <button
          onClick={exportForClaude}
          className="w-full py-3 bg-card border border-border text-foreground text-sm font-semibold rounded-xl hover:border-accent/50 transition-colors shadow-sm"
        >
          📥 Exporter pour Claude
        </button>
      </div>
    </div>
  );
}
