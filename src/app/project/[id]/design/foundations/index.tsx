"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import JtbdBlock from "./blocks/JtbdBlock";
import PersonasBlock from "./blocks/PersonasBlock";
import AhaMomentBlock from "./blocks/AhaMomentBlock";
import PrinciplesBlock from "./blocks/PrinciplesBlock";
import FoundationsExportBlock from "./blocks/ExportBlock";
import {
  FOUNDATIONS_SECTION_KEY,
  computeCompleteness,
  mergeFoundationsState,
  parseFoundationsState,
  type FoundationsState,
} from "./state";
import { validateFoundations } from "./validators";

export default function FoundationsChapter({
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

  const [state, setState] = useState<FoundationsState>(() =>
    parseFoundationsState(initialSections[FOUNDATIONS_SECTION_KEY])
  );

  const completeness = computeCompleteness(state);
  const issues = validateFoundations(state);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<FoundationsState>) {
    setState((prev) => {
      const next = mergeFoundationsState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: FoundationsState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: FOUNDATIONS_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [FOUNDATIONS_SECTION_KEY]: content,
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

  // Hint basé sur le type de projet
  const typeContextHint: Record<string, string> = {
    saas: "SaaS : cible PME/devs/PM. Aha = activation rapide (< 5 min). Principes type Linear/Stripe.",
    appli: "Appli B2C : cible utilisateur final. Aha = 1er moment de valeur social/ludique.",
    outil: "Outil interne : cible toi-même ou équipe restreinte. Principes pragmatiques.",
    logiciel: "Logiciel : cible pro qui paye (comptable, archi). Fiabilité > innovation.",
    business: "Business : cible décideur ou partenaire. Signaux de crédibilité forts.",
  };
  const typeHint = project.type ? typeContextHint[project.type] : null;

  return (
    <div className="space-y-6">
      {/* Bandeau header */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">📐 1. Fondations stratégiques</h1>
            <p className="text-xs text-muted mt-0.5">
              JTBD · Persona · Aha moment · Principes design. Les 4 fondations qui rendent toutes
              tes décisions design tranchables. Sauvegarde automatique.
            </p>
            {typeHint && (
              <p className="text-[11px] text-muted/80 mt-1.5 flex items-center gap-1.5">
                <span className="inline-block px-1.5 py-0.5 rounded bg-accent/10 text-accent font-semibold text-[10px] uppercase tracking-wider">
                  {project.type}
                </span>
                <span>{typeHint}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saving && <span className="text-xs text-muted">💾 Sauvegarde...</span>}
            {!saving && lastSaved && (
              <span className="text-xs text-green-600">✓ Sauvé à {lastSaved}</span>
            )}
          </div>
        </div>

        {/* Barre de progression */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Complétude des fondations</span>
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
              <span className="text-red-500">❌ {errorCount} erreur{errorCount > 1 ? "s" : ""}</span>
            )}
            {warnCount > 0 && (
              <span className="text-amber-500">⚠️ {warnCount} avertissement{warnCount > 1 ? "s" : ""}</span>
            )}
            {errorCount === 0 && warnCount === 0 && completeness > 0 && (
              <span className="text-green-600">✓ Aucun problème détecté</span>
            )}
          </div>
        </div>
      </div>

      {/* Info méthodologique */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Pourquoi commencer par ici ?</strong> Le design
        n&apos;est pas de la décoration. C&apos;est une réponse à une question qu&apos;il faut
        d&apos;abord formuler. Sans JTBD, persona, aha et principes, toutes les décisions qui
        suivent (couleurs, écrans, parcours) tournent dans le vide.{" "}
        <strong className="text-foreground">Sources</strong> : Ulwick (JTBD), Cooper &amp; NN/g
        (personas), Dunford (positioning), Airbnb/Linear (principes).
      </div>

      {/* 4 MUST */}
      <JtbdBlock state={state} onChange={updateState} />
      <PersonasBlock state={state} onChange={updateState} />
      <AhaMomentBlock state={state} onChange={updateState} />
      <PrinciplesBlock state={state} onChange={updateState} />

      {/* Export */}
      <FoundationsExportBlock state={state} project={project} />

      {/* Teaser V2/V3 */}
      <div className="border-t border-border pt-4 text-xs text-muted text-center space-y-1">
        <div>
          <strong>V1 MVP</strong> active. Les blocs <strong>SHOULD</strong> (job stories,
          positioning Dunford, anti-goals) arrivent en V2, les <strong>NICE</strong> (modes
          Débutant/Expert, concurrents 2×2, carte PDF) en V3.
        </div>
      </div>
    </div>
  );
}
