"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import CtaLibraryBlock from "./blocks/CtaLibraryBlock";
import FormMicrocopyBlock from "./blocks/FormMicrocopyBlock";
import SystemMessagesBlock from "./blocks/SystemMessagesBlock";
import GlossaryBlock from "./blocks/GlossaryBlock";
import VoiceToneMatrixBlock from "./blocks/VoiceToneMatrixBlock";
import CopyVariantsBlock from "./blocks/CopyVariantsBlock";
import LengthBudgetBlock from "./blocks/LengthBudgetBlock";
import InclusiveLanguageBlock from "./blocks/InclusiveLanguageBlock";
import MicrocopyExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableMicrocopyCard from "./components/PrintableCard";
import {
  MICROCOPY_SECTION_KEY,
  computeMicrocopyCompleteness,
  mergeMicrocopyState,
  parseMicrocopyState,
  type MicrocopyMode,
  type MicrocopyState,
} from "./state";
import { validateMicrocopy } from "./validators";

const LS_MODE = "mindeck:design:microcopy:mode";

export default function MicrocopyChapter({
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

  const [state, setState] = useState<MicrocopyState>(() =>
    parseMicrocopyState(initialSections[MICROCOPY_SECTION_KEY])
  );
  const [mode, setMode] = useState<MicrocopyMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: MicrocopyMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeMicrocopyCompleteness(state);
  const issues = validateMicrocopy(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<MicrocopyState>) {
    setState((prev) => {
      const next = mergeMicrocopyState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: MicrocopyState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: MICROCOPY_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [MICROCOPY_SECTION_KEY]: content,
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
            <h1 className="text-xl md:text-2xl font-bold">✍️ 9. Microcopy</h1>
            <p className="text-xs text-muted mt-0.5">
              Boutons · Champs · Messages système · Glossaire FR. Le copy qui fait vendre (ou fuir).
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
            <span className="font-medium">Couverture microcopy</span>
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
        <strong className="text-foreground">Complément chap. 2 Identité + chap. 8 États.</strong>{" "}
        Le chap. 2 définit le <em>ton général</em>. Ce chapitre applique ce ton au{" "}
        <em>copy concret</em> (CTA, champs, messages). <strong className="text-foreground">Sources</strong> :
        Kinneret Yifrah (Microcopy book), Mailchimp style guide, Shopify Polaris, GOV.UK writing
        for users, Apple HIG.
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <CtaLibraryBlock state={state} onChange={updateState} />
          <FormMicrocopyBlock state={state} onChange={updateState} />
          <SystemMessagesBlock state={state} onChange={updateState} />
          <GlossaryBlock state={state} onChange={updateState} />

          {/* V2 SHOULD */}
          <VoiceToneMatrixBlock state={state} onChange={updateState} />
          <CopyVariantsBlock state={state} onChange={updateState} />
          <LengthBudgetBlock state={state} onChange={updateState} />

          {/* V3 NICE */}
          <InclusiveLanguageBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <MicrocopyExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 50 && (
        <div className="border-t border-border pt-6">
          <PrintableMicrocopyCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
