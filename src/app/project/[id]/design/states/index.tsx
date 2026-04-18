"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ScreenInventoryBlock from "./blocks/ScreenInventoryBlock";
import LoadingPatternsBlock from "./blocks/LoadingPatternsBlock";
import EmptyStatesBlock from "./blocks/EmptyStatesBlock";
import ErrorPatternsBlock from "./blocks/ErrorPatternsBlock";
import MicroInteractionsBlock from "./blocks/MicroInteractionsBlock";
import SuccessPatternsBlock from "./blocks/SuccessPatternsBlock";
import ToastLibraryBlock from "./blocks/ToastLibraryBlock";
import StateMachineBlock from "./blocks/StateMachineBlock";
import ScreenAuditBlock from "./blocks/ScreenAuditBlock";
import LatencySloBlock from "./blocks/LatencySloBlock";
import StatesExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableStatesCard from "./components/PrintableCard";
import {
  STATES_SECTION_KEY,
  computeStatesCompleteness,
  mergeStatesState,
  parseStatesState,
  type StatesMode,
  type StatesState,
} from "./state";
import { validateStates } from "./validators";

const LS_MODE = "mindeck:design:states:mode";
const INFO_NAV_SECTION_KEY = "info-nav";

export default function StatesChapter({
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

  const [state, setState] = useState<StatesState>(() =>
    parseStatesState(initialSections[STATES_SECTION_KEY])
  );
  const [mode, setMode] = useState<StatesMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: StatesMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeStatesCompleteness(state);
  const issues = validateStates(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<StatesState>) {
    setState((prev) => {
      const next = mergeStatesState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: StatesState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: STATES_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [STATES_SECTION_KEY]: content,
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

  const infoNavContent = initialSections[INFO_NAV_SECTION_KEY];

  return (
    <div className="space-y-6">
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">⚡ 8. États</h1>
            <p className="text-xs text-muted mt-0.5">
              Loading · Empty · Error · Success · Micro-interactions. Ce qui rend ton app vivante.
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
            <span className="font-medium">Couverture des états</span>
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
        <strong className="text-foreground">Complément chap. 3 Info &amp; Nav + chap. 5 Principes UX.</strong>{" "}
        Ce chapitre rend concrets les états de chaque écran défini dans l&apos;info-nav, avec les
        durées optimales (Doherty 400ms) et les règles WCAG 2.4.7. <strong className="text-foreground">Sources</strong> : Nielsen
        (Visibility), Shopify Polaris (Empty states), NN/G (Error messages), Dan Saffer
        (Microinteractions), Material / Carbon / Atlassian.
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <ScreenInventoryBlock
            state={state}
            onChange={updateState}
            infoNavContent={infoNavContent}
          />
          <LoadingPatternsBlock state={state} onChange={updateState} />
          <EmptyStatesBlock state={state} onChange={updateState} />
          <ErrorPatternsBlock state={state} onChange={updateState} />
          <MicroInteractionsBlock state={state} onChange={updateState} />

          {/* V2 SHOULD */}
          <SuccessPatternsBlock state={state} onChange={updateState} />
          <ToastLibraryBlock state={state} onChange={updateState} />
          <StateMachineBlock state={state} onChange={updateState} />

          {/* V3 NICE */}
          <ScreenAuditBlock state={state} />
          <LatencySloBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <StatesExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 50 && (
        <div className="border-t border-border pt-6">
          <PrintableStatesCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
