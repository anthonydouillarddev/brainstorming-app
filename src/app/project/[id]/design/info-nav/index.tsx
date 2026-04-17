"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ScreenPickerBlock from "./blocks/ScreenPickerBlock";
import SitemapBuilderBlock from "./blocks/SitemapBuilderBlock";
import NavPatternBlock from "./blocks/NavPatternBlock";
import InfoNavExportBlock from "./blocks/ExportBlock";
import {
  INFO_NAV_SECTION_KEY,
  computeInfoNavCompleteness,
  mergeInfoNavState,
  parseInfoNavState,
  type InfoNavState,
} from "./state";
import { validateInfoNav } from "./validators";

export default function InfoNavChapter({
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

  const [state, setState] = useState<InfoNavState>(() =>
    parseInfoNavState(initialSections[INFO_NAV_SECTION_KEY])
  );

  const completeness = computeInfoNavCompleteness(state);
  const issues = validateInfoNav(state, state.navPattern);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<InfoNavState>) {
    setState((prev) => {
      const next = mergeInfoNavState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: InfoNavState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: INFO_NAV_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [INFO_NAV_SECTION_KEY]: content,
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
    saas: "SaaS : sidebar fixe 4-8 items, Cmd+K en bonus pour power users.",
    appli: "Appli mobile : bottom nav ≤ 5 items, top header minimal.",
    outil: "Outil perso : top tabs 3-5 sections ou sidebar collapsible.",
    logiciel: "Logiciel métier : sidebar dense avec groupes + sections.",
    business: "Business : sidebar pro avec sections claires (pipeline, clients, admin).",
  };
  const hint = project.type ? typeHint[project.type] : null;

  return (
    <div className="space-y-6">
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🧭 3. Architecture Info &amp; Nav</h1>
            <p className="text-xs text-muted mt-0.5">
              Écrans · Sitemap · Pattern de navigation. La carte du trésor de ton app : si elle
              est claire, l&apos;user se sent chez lui.
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
            <span className="font-medium">Complétude de l&apos;architecture</span>
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
        <strong className="text-foreground">Règles d&apos;or</strong> : max 7 items racines
        (Miller), max 3 niveaux de profondeur, labels concrets (Projets &gt; Workspace), éviter
        hamburger sur desktop (-50% engagement NN/g), vocabulaire user &gt; vocabulaire dev.
        <strong className="text-foreground"> Sources</strong> : NN/g, Covert (How to Make Sense),
        Baymard, Optimal Workshop.
      </div>

      <ScreenPickerBlock
        state={state}
        projectType={project.type ?? null}
        onChange={updateState}
      />
      <SitemapBuilderBlock state={state} onChange={updateState} />
      <NavPatternBlock
        state={state}
        projectType={project.type ?? null}
        onChange={updateState}
      />

      <InfoNavExportBlock state={state} project={project} />

      <div className="border-t border-border pt-4 text-xs text-muted text-center">
        <strong>V1 MUST</strong> active. V2 ajoutera : dictionnaire labels, entités/relations,
        URL map validator, breadcrumbs auto. V3 : command palette, tree test, mode Débutant.
      </div>
    </div>
  );
}
