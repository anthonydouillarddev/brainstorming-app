"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import PatternBlock from "./blocks/PatternBlock";
import LayersBlock from "./blocks/LayersBlock";
import DataFlowBlock from "./blocks/DataFlowBlock";
import EntitiesBlock from "./blocks/EntitiesBlock";
import SecurityBoundariesBlock from "./blocks/SecurityBoundariesBlock";
import ExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import {
  ARCHITECTURE_SECTION_KEY,
  computeArchitectureCompleteness,
  mergeArchitectureState,
  parseArchitectureState,
  type ArchitectureMode,
  type ArchitectureState,
} from "./state";
import { validateArchitecture } from "./validators";
import { getArchitectureContextHint } from "./templates";

const LS_MODE = "mindeck:technique:architecture:mode";

export default function ArchitectureChapter({
  project,
  initialSections,
  onSectionsChange,
}: {
  project: Project;
  initialSections: Record<string, string>;
  onProjectUpdate: (patch: Partial<Project>) => Promise<void>;
  onSectionsChange?: (sections: Record<string, string>) => void;
}) {
  const supabase = createClient();
  const saveTimer = useRef<NodeJS.Timeout | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const [state, setState] = useState<ArchitectureState>(() =>
    parseArchitectureState(initialSections[ARCHITECTURE_SECTION_KEY])
  );
  const [mode, setMode] = useState<ArchitectureMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: ArchitectureMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeArchitectureCompleteness(state);
  const issues = validateArchitecture(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<ArchitectureState>) {
    setState((prev) => {
      const next = mergeArchitectureState({
        ...prev,
        ...patch,
        modeUsed: mode,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: ArchitectureState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: ARCHITECTURE_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [ARCHITECTURE_SECTION_KEY]: content,
        });
      }
    }, 800);
  }

  useEffect(() => {
    const timer = saveTimer.current;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const contextHint = getArchitectureContextHint(project.type);

  return (
    <div className="space-y-5">
      <header className="bg-card/60 border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">🏛️ Architecture & Blueprint</h2>
            <p className="text-sm text-muted mt-1">
              Pattern architectural, couches techniques, flux de données, modèle de données, sécu
              boundaries. Monolith-first, éviter microservices avant 500k€ ARR.
            </p>
          </div>
          <ModeToggle mode={mode} onChange={changeMode} />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-muted">Complétude</span>
              <span className="text-sm font-bold">{completeness}%</span>
            </div>
            <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {errorCount > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                ❌ {errorCount} erreur{errorCount > 1 ? "s" : ""}
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠️ {warnCount} avertissement{warnCount > 1 ? "s" : ""}
              </span>
            )}
            {saving ? (
              <span className="text-muted">💾 Sauvegarde…</span>
            ) : lastSaved ? (
              <span className="text-muted">✓ {lastSaved}</span>
            ) : null}
          </div>
        </div>

        <div className="text-[11px] bg-accent/5 border border-accent/20 rounded-xl px-3 py-2 text-muted">
          <span className="font-semibold text-foreground">Contexte {project.type} :</span>{" "}
          {contextHint}
        </div>
      </header>

      {mode === "beginner" ? (
        <BeginnerChat state={state} onApply={updateState} />
      ) : (
        <>
          <PatternBlock state={state} onChange={updateState} />
          <LayersBlock state={state} onChange={updateState} />
          <DataFlowBlock state={state} onChange={updateState} />
          <EntitiesBlock state={state} onChange={updateState} />
          <SecurityBoundariesBlock state={state} onChange={updateState} />
          <ExportBlock state={state} projectName={project.name} />
        </>
      )}

      {issues.length > 0 && mode !== "beginner" && (
        <div className="bg-card/60 border border-border rounded-2xl p-4 space-y-2">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            📋 Validation
          </div>
          <ul className="space-y-1.5">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <span
                  className={
                    issue.severity === "error"
                      ? "text-red-600 dark:text-red-400"
                      : issue.severity === "warn"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted"
                  }
                >
                  {issue.severity === "error" ? "❌" : issue.severity === "warn" ? "⚠️" : "ℹ️"}
                </span>
                <span className="flex-1">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
