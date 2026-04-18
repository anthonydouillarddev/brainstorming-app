"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import BreakpointsBlock from "./blocks/BreakpointsBlock";
import ColorSchemeBlock from "./blocks/ColorSchemeBlock";
import DensityBlock from "./blocks/DensityBlock";
import InputModalityBlock from "./blocks/InputModalityBlock";
import ContainerQueriesBlock from "./blocks/ContainerQueriesBlock";
import LocalizationBlock from "./blocks/LocalizationBlock";
import ViewportAdaptationsBlock from "./blocks/ViewportAdaptationsBlock";
import AdaptivityExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableAdaptivityCard from "./components/PrintableCard";
import {
  ADAPTIVITY_SECTION_KEY,
  computeAdaptivityCompleteness,
  mergeAdaptivityState,
  parseAdaptivityState,
  type AdaptivityMode,
  type AdaptivityState,
} from "./state";
import { validateAdaptivity } from "./validators";

const LS_MODE = "mindeck:design:adaptivity:mode";

export default function AdaptivityChapter({
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

  const [state, setState] = useState<AdaptivityState>(() =>
    parseAdaptivityState(initialSections[ADAPTIVITY_SECTION_KEY])
  );
  const [mode, setMode] = useState<AdaptivityMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: AdaptivityMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeAdaptivityCompleteness(state);
  const issues = validateAdaptivity(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<AdaptivityState>) {
    setState((prev) => {
      const next = mergeAdaptivityState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: AdaptivityState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: ADAPTIVITY_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [ADAPTIVITY_SECTION_KEY]: content,
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
            <h1 className="text-xl md:text-2xl font-bold">📐 11. Adaptativité</h1>
            <p className="text-xs text-muted mt-0.5">
              Responsive · Dark mode · Densité · Input modality. L&apos;app s&apos;adapte au
              context.
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
            <span className="font-medium">Couverture adaptativité</span>
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
        <strong className="text-foreground">Complément chap. 6 Visuel + chap. 7 DS + chap. 10 A11y.</strong>{" "}
        Ce chapitre définit <em>comment</em> l&apos;app s&apos;adapte au device, à l&apos;OS, aux
        préférences user. <strong className="text-foreground">Sources</strong> : Tailwind v4,
        Material Design 3, web.dev Responsive, Luke Wroblewski (Mobile First), Apple HIG,
        WCAG 2.5.8 Target Size.
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <BreakpointsBlock state={state} onChange={updateState} />
          <ColorSchemeBlock state={state} onChange={updateState} />
          <DensityBlock state={state} onChange={updateState} />
          <InputModalityBlock state={state} onChange={updateState} />

          {/* V2 SHOULD */}
          <ContainerQueriesBlock state={state} onChange={updateState} />
          <LocalizationBlock state={state} onChange={updateState} />
          <ViewportAdaptationsBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <AdaptivityExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 40 && (
        <div className="border-t border-border pt-6">
          <PrintableAdaptivityCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
