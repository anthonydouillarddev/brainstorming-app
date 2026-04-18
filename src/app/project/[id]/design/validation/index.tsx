"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import UserTestSessionsBlock from "./blocks/UserTestSessionsBlock";
import SusScoreBlock from "./blocks/SusScoreBlock";
import HeuristicEvalBlock from "./blocks/HeuristicEvalBlock";
import PmfMetricsBlock from "./blocks/PmfMetricsBlock";
import ValidationRoadmapBlock from "./blocks/ValidationRoadmapBlock";
import ValidationExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableValidationCard from "./components/PrintableCard";
import {
  VALIDATION_SECTION_KEY,
  computeValidationCompleteness,
  mergeValidationState,
  parseValidationState,
  type ValidationMode,
  type ValidationState,
} from "./state";
import { validateValidation } from "./validators";

const LS_MODE = "mindeck:design:validation:mode";

export default function ValidationChapter({
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

  const [state, setState] = useState<ValidationState>(() =>
    parseValidationState(initialSections[VALIDATION_SECTION_KEY])
  );
  const [mode, setMode] = useState<ValidationMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: ValidationMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeValidationCompleteness(state);
  const issues = validateValidation(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<ValidationState>) {
    setState((prev) => {
      const next = mergeValidationState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: ValidationState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: VALIDATION_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [VALIDATION_SECTION_KEY]: content,
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

  return (
    <div className="space-y-6">
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🧪 12. Validation</h1>
            <p className="text-xs text-muted mt-0.5">
              Tests users · SUS · Heuristiques Nielsen · PMF. Mesurer si ça fonctionne vraiment.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {saving && <span className="text-xs text-muted">💾 Sauvegarde...</span>}
            {!saving && lastSaved && (
              <span className="text-xs text-green-600">✓ Sauvé à {lastSaved}</span>
            )}
            <ModeToggle mode={mode} onChange={changeMode} />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Couverture validation</span>
            <span className="font-mono text-muted">{completeness}%</span>
          </div>
          <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            {errorCount > 0 && (
              <span className="text-red-500">
                ❌ {errorCount} erreur{errorCount > 1 ? "s" : ""}
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-amber-500">
                ⚠️ {warnCount} avertissement{warnCount > 1 ? "s" : ""}
              </span>
            )}
            {errorCount === 0 && warnCount === 0 && completeness > 0 && (
              <span className="text-green-600">✓ Aucun problème détecté</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Le juge de paix des 11 chapitres précédents.</strong>{" "}
        Qualitatif (tests users, heuristiques) + quantitatif (SUS, PMF). La seule vérité c&apos;est
        celle du terrain. <strong className="text-foreground">Sources</strong> : NN/G (Nielsen 10
        heuristics, 5 users rule), John Brooke (SUS 1986), Sauro (bench 68), Sean Ellis (PMF 40%
        rule), Reichheld (NPS).
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <UserTestSessionsBlock state={state} onChange={updateState} />
          <SusScoreBlock state={state} onChange={updateState} />
          <HeuristicEvalBlock state={state} onChange={updateState} />
          <PmfMetricsBlock state={state} onChange={updateState} />

          {/* V3 NICE */}
          <ValidationRoadmapBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <ValidationExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 30 && (
        <div className="border-t border-border pt-6">
          <PrintableValidationCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
