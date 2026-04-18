"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import WcagChecklistBlock from "./blocks/WcagChecklistBlock";
import KeyboardFlowBlock from "./blocks/KeyboardFlowBlock";
import AriaPatternsBlock from "./blocks/AriaPatternsBlock";
import IssueLogBlock from "./blocks/IssueLogBlock";
import AssistiveTechMatrixBlock from "./blocks/AssistiveTechMatrixBlock";
import CognitiveAccessibilityBlock from "./blocks/CognitiveAccessibilityBlock";
import MotionSensoryBlock from "./blocks/MotionSensoryBlock";
import RemediationRoadmapBlock from "./blocks/RemediationRoadmapBlock";
import A11yExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableA11yCard from "./components/PrintableCard";
import {
  A11Y_SECTION_KEY,
  computeA11yCompleteness,
  mergeA11yState,
  parseA11yState,
  type A11yMode,
  type A11yState,
} from "./state";
import { validateA11y } from "./validators";

const LS_MODE = "mindeck:design:a11y:mode";

export default function A11yChapter({
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

  const [state, setState] = useState<A11yState>(() =>
    parseA11yState(initialSections[A11Y_SECTION_KEY])
  );
  const [mode, setMode] = useState<A11yMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: A11yMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeA11yCompleteness(state);
  const issues = validateA11y(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<A11yState>) {
    setState((prev) => {
      const next = mergeA11yState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: A11yState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: A11Y_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [A11Y_SECTION_KEY]: content,
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
            <h1 className="text-xl md:text-2xl font-bold">♿ 10. Accessibilité</h1>
            <p className="text-xs text-muted mt-0.5">
              WCAG 2.2 AA · Navigation clavier · ARIA · Issues. Inclusion + conformité légale.
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
            <span className="font-medium">Conformité a11y</span>
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
        <strong className="text-foreground">Complément chap. 7 Design System + chap. 8 États.</strong>{" "}
        Ce chapitre valide la conformité WCAG 2.2 AA au niveau <em>produit</em>, pas
        <em>composant</em>. <strong className="text-foreground">Sources</strong> : W3C WCAG 2.2
        (2024), ARIA Authoring Practices Guide (APG), WebAIM, Deque axe-core, RGAA 4.1. En
        Europe : European Accessibility Act (EAA) applicable <strong>28 juin 2025</strong>.
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <WcagChecklistBlock state={state} onChange={updateState} />
          <KeyboardFlowBlock state={state} onChange={updateState} />
          <AriaPatternsBlock state={state} onChange={updateState} />
          <IssueLogBlock state={state} onChange={updateState} />

          {/* V2 SHOULD */}
          <AssistiveTechMatrixBlock state={state} onChange={updateState} />
          <CognitiveAccessibilityBlock state={state} onChange={updateState} />
          <MotionSensoryBlock state={state} onChange={updateState} />

          {/* V3 NICE */}
          <RemediationRoadmapBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <A11yExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 30 && (
        <div className="border-t border-border pt-6">
          <PrintableA11yCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
