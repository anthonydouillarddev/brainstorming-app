"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import SemanticTokensBlock from "./blocks/SemanticTokensBlock";
import ComponentChecklistBlock from "./blocks/ComponentChecklistBlock";
import PatternLibraryBlock from "./blocks/PatternLibraryBlock";
import ContrastPairsBlock from "./blocks/ContrastPairsBlock";
import VariantMatrixBlock from "./blocks/VariantMatrixBlock";
import A11yCheckBlock from "./blocks/A11yCheckBlock";
import DensitySwitcherBlock from "./blocks/DensitySwitcherBlock";
import TokenVersioningBlock from "./blocks/TokenVersioningBlock";
import DsExportBlock from "./blocks/ExportBlock";
import ModeToggle from "./components/ModeToggle";
import BeginnerChat from "./components/BeginnerChat";
import PrintableDsCard from "./components/PrintableCard";
import {
  DESIGN_SYSTEM_SECTION_KEY,
  computeDesignSystemCompleteness,
  mergeDesignSystemState,
  parseDesignSystemState,
  type DesignSystemMode,
  type DesignSystemState,
} from "./state";
import { validateDesignSystem } from "./validators";

const LS_MODE = "mindeck:design:design-system:mode";

export default function DesignSystemChapter({
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

  const [state, setState] = useState<DesignSystemState>(() =>
    parseDesignSystemState(initialSections[DESIGN_SYSTEM_SECTION_KEY])
  );
  const [mode, setMode] = useState<DesignSystemMode>("intermediate");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_MODE);
    if (saved === "beginner" || saved === "intermediate") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  function changeMode(m: DesignSystemMode) {
    setMode(m);
    window.localStorage.setItem(LS_MODE, m);
  }

  const completeness = computeDesignSystemCompleteness(state);
  const issues = validateDesignSystem(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<DesignSystemState>) {
    setState((prev) => {
      const next = mergeDesignSystemState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: DesignSystemState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: DESIGN_SYSTEM_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [DESIGN_SYSTEM_SECTION_KEY]: content,
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
            <h1 className="text-xl md:text-2xl font-bold">🧱 7. Design System</h1>
            <p className="text-xs text-muted mt-0.5">
              Tokens semantic · Catalogue composants · Patterns · Contraste. La boîte de briques
              Lego de ton produit.
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
            <span className="font-medium">Complétude du design system</span>
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
        <strong className="text-foreground">Complément chap. 6 Visuel.</strong> Le chap. 6 définit
        les <em>primitives</em> (palette OKLCH, typo scale, spacing). Ce chapitre ajoute les{" "}
        <em>semantic tokens</em> (alias bg.primary, text.danger), le{" "}
        <em>catalogue composants</em>, les <em>patterns d&apos;état</em> et la{" "}
        <em>validation a11y</em>.{" "}
        <strong className="text-foreground">Sources</strong> : W3C DTCG 2025, Nathan Curtis,
        Brad Frost, Radix/shadcn, WCAG 2.2.
      </div>

      {mode === "beginner" ? (
        <BeginnerChat
          state={state}
          projectType={project.type ?? null}
          onChange={updateState}
          onSwitchMode={() => changeMode("intermediate")}
        />
      ) : (
        <>
          <SemanticTokensBlock state={state} onChange={updateState} />
          <ComponentChecklistBlock
            state={state}
            projectType={project.type ?? null}
            onChange={updateState}
          />
          <PatternLibraryBlock state={state} onChange={updateState} />
          <ContrastPairsBlock state={state} onChange={updateState} />

          {/* V2 SHOULD */}
          <VariantMatrixBlock state={state} onChange={updateState} />
          <A11yCheckBlock state={state} onChange={updateState} />
          <DensitySwitcherBlock state={state} onChange={updateState} />

          {/* V3 NICE */}
          <TokenVersioningBlock state={state} onChange={updateState} />
        </>
      )}

      {mode !== "beginner" && <DsExportBlock state={state} project={project} />}

      {mode !== "beginner" && completeness >= 50 && (
        <div className="border-t border-border pt-6">
          <PrintableDsCard state={state} project={project} />
        </div>
      )}
    </div>
  );
}
