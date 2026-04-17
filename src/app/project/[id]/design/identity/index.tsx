"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import ArchetypeBlock from "./blocks/ArchetypeBlock";
import VoiceSlidersBlock from "./blocks/VoiceSlidersBlock";
import GlossaryBlock from "./blocks/GlossaryBlock";
import BrandPromiseBlock from "./blocks/BrandPromiseBlock";
import ToneMatrixBlock from "./blocks/ToneMatrixBlock";
import IdentityExportBlock from "./blocks/ExportBlock";
import {
  IDENTITY_SECTION_KEY,
  computeIdentityCompleteness,
  mergeIdentityState,
  parseIdentityState,
  type IdentityState,
} from "./state";
import { validateIdentity } from "./validators";

export default function IdentityChapter({
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

  const [state, setState] = useState<IdentityState>(() =>
    parseIdentityState(initialSections[IDENTITY_SECTION_KEY])
  );

  const completeness = computeIdentityCompleteness(state);
  const issues = validateIdentity(state, project.type ?? null);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  function updateState(patch: Partial<IdentityState>) {
    setState((prev) => {
      const next = mergeIdentityState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function scheduleSave(next: IdentityState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: IDENTITY_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [IDENTITY_SECTION_KEY]: content,
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
    saas: "SaaS B2B : souvent ton pragmatique, empathique sans familiarité excessive (Stripe, Linear).",
    appli: "Appli B2C : ton plus chaleureux, familier, souvent tutoyer (Duolingo, Headspace).",
    outil: "Outil interne : ton efficace, direct, zéro cérémonie (Raycast, Obsidian).",
    logiciel: "Logiciel pro : ton fiable, rigoureux, sobre. L'humour est risqué.",
    business: "Business : ton assertif mais mesuré. Crédibilité avant tout.",
  };
  const hint = project.type ? typeHint[project.type] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🎭 2. Identité de marque &amp; ton</h1>
            <p className="text-xs text-muted mt-0.5">
              Archétype · Sliders de voix · Glossaire · Brand promise · Tone matrix. Le système
              opérationnel qui remplace les &laquo; moderne et épuré &raquo; vagues.
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
            <span className="font-medium">Complétude de l&apos;identité</span>
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

      {/* Info méthodo */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Brainstorm → Design</strong> : ici on passe de
        l&apos;intuition floue (&laquo; moderne et épuré &raquo;) à un <strong>système de
        décisions</strong>. Archétype + sliders quantifiés + tone matrix = une brand card qu&apos;un
        freelance ou un LLM peut exécuter sans poser de question.{" "}
        <strong className="text-foreground">Sources</strong> : Mailchimp &amp; Polaris (voice),
        NN/G (4 axes), Neumeier (promise), Frontify (verbal identity).
      </div>

      <ArchetypeBlock state={state} onChange={updateState} />
      <VoiceSlidersBlock
        state={state}
        projectType={project.type ?? null}
        onChange={updateState}
        showExtraSliders={false}
      />
      <GlossaryBlock state={state} onChange={updateState} />
      <BrandPromiseBlock state={state} onChange={updateState} />
      <ToneMatrixBlock state={state} onChange={updateState} />

      <IdentityExportBlock state={state} project={project} />

      <div className="border-t border-border pt-4 text-xs text-muted text-center">
        <strong>V1 MUST</strong> active. V2 ajoutera : 3 sliders complémentaires, références
        (👍 / 👎), live preview, mood keywords, 2 exports (JSON + Claude brief).
      </div>
    </div>
  );
}
