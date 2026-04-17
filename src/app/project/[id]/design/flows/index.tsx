"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import FlowStepsBlock from "./blocks/FlowStepsBlock";
import OnboardingPatternBlock from "./blocks/OnboardingPatternBlock";
import NorthStarActionBlock from "./blocks/NorthStarActionBlock";
import FrictionCounterBlock from "./blocks/FrictionCounterBlock";
import FlowsExportBlock from "./blocks/ExportBlock";
import {
  FLOWS_SECTION_KEY,
  computeFlowsCompleteness,
  mergeFlowsState,
  parseFlowsState,
  type FlowsState,
} from "./state";
import { validateFlows } from "./validators";

export default function FlowsChapter({
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

  const [state, setState] = useState<FlowsState>(() =>
    parseFlowsState(initialSections[FLOWS_SECTION_KEY])
  );

  const completeness = computeFlowsCompleteness(state);
  const issues = validateFlows(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<FlowsState>) {
    setState((prev) => {
      const next = mergeFlowsState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: FlowsState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: FLOWS_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [FLOWS_SECTION_KEY]: content,
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

  const typeHint: Record<string, string> = {
    saas: "SaaS : signup minimal (email+pwd), empty-state teaching, aha en ≤ 5 min.",
    appli: "Appli : splash 3 écrans max, sample data direct, permissions APRÈS value.",
    outil: "Outil perso : zéro onboarding, direct au canvas, sample workspace.",
    logiciel: "Logiciel B2B : demo gated, training 1-on-1, aha = 1er dossier autonome.",
    business: "Business : landing → lead magnet → email seq → call découverte → closing.",
  };
  const hint = project.type ? typeHint[project.type] : null;

  return (
    <div className="space-y-6">
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🛣️ 4. Parcours utilisateur</h1>
            <p className="text-xs text-muted mt-0.5">
              Flow · Aha moment · Onboarding · North Star Action · Friction score. Le chemin de
              ton user avant de coder.
            </p>
            {hint && (
              <p className="text-[11px] text-muted/80 mt-1.5 flex items-center gap-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold text-[10px] uppercase tracking-wider">
                  {project.type}
                </span>
                <span>{hint}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {saving && <span className="text-xs text-muted">💾 Sauvegarde...</span>}
            {!saving && lastSaved && (
              <span className="text-xs text-green-600">✓ Sauvé à {lastSaved}</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Complétude du parcours</span>
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
        <strong className="text-foreground">Règles d&apos;or</strong> : ≤ 5 étapes avant value
        delivery, signup AVANT value = anti-pattern SaaS 2020+, permissions APRÈS value, ≤ 3
        champs au signup, aha moment quantifié obligatoire.{" "}
        <strong className="text-foreground">Sources</strong> : NN/g, Baymard, Reforge,
        UserOnboard.com.
      </div>

      <FlowStepsBlock
        state={state}
        projectType={project.type ?? null}
        onChange={updateState}
      />
      <OnboardingPatternBlock
        state={state}
        projectType={project.type ?? null}
        onChange={updateState}
      />
      <NorthStarActionBlock state={state} onChange={updateState} />
      <FrictionCounterBlock state={state} />

      <FlowsExportBlock state={state} project={project} />

      <div className="border-t border-border pt-4 text-xs text-muted text-center">
        <strong>V1 MUST</strong> active. V2 : flow builder avec branches, journey map AARRR,
        empty states, exports JSON/mermaid/Claude. V3 : critical path, dashboard AARRR, mode
        Débutant, carte PDF.
      </div>
    </div>
  );
}
