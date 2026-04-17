"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import NielsenChecklistBlock from "./blocks/NielsenChecklistBlock";
import LawsLibraryBlock from "./blocks/LawsLibraryBlock";
import AffordanceCheckerBlock from "./blocks/AffordanceCheckerBlock";
import FeedbackInventoryBlock from "./blocks/FeedbackInventoryBlock";
import DesignPrinciplesBlock from "./blocks/DesignPrinciplesBlock";
import PrinciplesExportBlock from "./blocks/ExportBlock";
import {
  PRINCIPLES_SECTION_KEY,
  computePrinciplesCompleteness,
  mergePrinciplesState,
  parsePrinciplesState,
  type PrinciplesState,
} from "./state";
import { validatePrinciples } from "./validators";

export default function PrinciplesChapter({
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

  const [state, setState] = useState<PrinciplesState>(() =>
    parsePrinciplesState(initialSections[PRINCIPLES_SECTION_KEY])
  );

  const completeness = computePrinciplesCompleteness(state);
  const issues = validatePrinciples(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<PrinciplesState>) {
    setState((prev) => {
      const next = mergePrinciplesState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: PrinciplesState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: PRINCIPLES_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [PRINCIPLES_SECTION_KEY]: content,
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
            <h1 className="text-xl md:text-2xl font-bold">🧠 5. Principes d&apos;interaction</h1>
            <p className="text-xs text-muted mt-0.5">
              Nielsen · Norman · Yablonski · Gestalt. Les règles du cerveau humain traduites en
              règles de design.
            </p>
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
            <span className="font-medium">Complétude des principes</span>
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
        <strong className="text-foreground">Mise au point honnête</strong> : les &laquo; lois UX
        &raquo; sont des <em>heuristiques</em>, pas des règles absolues. Elles orientent, ne
        décident pas à ta place. Toujours valider en test utilisateur.{" "}
        <strong className="text-foreground">Sources</strong> : NN/g (Nielsen), Norman (Design of
        Everyday Things), Yablonski (Laws of UX), Gestalt (Wertheimer), Sweller (Cognitive Load).
      </div>

      <NielsenChecklistBlock state={state} onChange={updateState} />
      <LawsLibraryBlock state={state} onChange={updateState} />
      <AffordanceCheckerBlock state={state} onChange={updateState} />
      <FeedbackInventoryBlock state={state} onChange={updateState} />
      <DesignPrinciplesBlock state={state} onChange={updateState} />

      <PrinciplesExportBlock state={state} project={project} />

      <div className="border-t border-border pt-4 text-xs text-muted text-center">
        <strong>V1 MUST</strong> active. V2 : cognitive load meter, Hick menu analyzer, Peak-End
        journey mapper, mental model canvas, exports JSON/Claude. V3 : audit par type d&apos;écran,
        Doherty latency log, mode Débutant, carte PDF.
      </div>
    </div>
  );
}
