"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import { generatePalette } from "@/lib/design/oklch";
import TokensBlock, {
  mergeTokens,
  type TokensState,
} from "@/app/design-spike/tokens-block";
import ExportBlock from "@/app/design-spike/export-block";
import ExtraColorsBlock from "@/app/design-spike/extra-colors-block";
import GradientBlock from "@/app/design-spike/gradient-block";
import ValidationBanner from "@/app/design-spike/validation-banner";
import type { DesignSystemSnapshot } from "@/lib/design/export";
import {
  DEFAULT_VISUAL_STATE,
  VISUAL_SECTION_KEY,
  mergeVisualState,
  parseVisualState,
  type VisualState,
  type VisualSelectedShade,
} from "./state";

export default function VisualChapter({
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

  // ─── State chargé depuis sections.content ─────────────────────────────────
  const [state, setState] = useState<VisualState>(() =>
    parseVisualState(initialSections[VISUAL_SECTION_KEY])
  );

  const palette = useMemo(
    () => generatePalette(state.customColor, state.tuning),
    [state.customColor, state.tuning]
  );

  const selectedAsRoles = useMemo(
    () =>
      state.selected.map((s, i) => ({
        role:
          i === 0
            ? "Background"
            : i === 1
            ? "Text"
            : i === 2
            ? "Accent"
            : i === 3
            ? "Secondary"
            : `Color ${i + 1}`,
        hex: s.hex,
      })),
    [state.selected]
  );

  // ─── Save debounced Supabase (800ms) ──────────────────────────────────────
  function updateState(patch: Partial<VisualState>) {
    setState((prev) => {
      const next = mergeVisualState({
        ...prev,
        ...patch,
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function updateTokens(patch: Partial<TokensState>) {
    updateState({ tokens: mergeTokens({ ...state.tokens, ...patch }) });
  }

  function scheduleSave(next: VisualState) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const content = JSON.stringify(next);
      const { error } = await supabase
        .from("sections")
        .upsert(
          { project_id: project.id, section_key: VISUAL_SECTION_KEY, content },
          { onConflict: "project_id,section_key" }
        );
      setSaving(false);
      if (!error) {
        setLastSaved(
          new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
        );
        onSectionsChange?.({
          ...initialSections,
          [VISUAL_SECTION_KEY]: content,
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

  // ─── Snapshot pour l'export ───────────────────────────────────────────────
  const exportSnapshot: DesignSystemSnapshot = {
    primaryHex: state.customColor,
    palette,
    selectedColors: selectedAsRoles,
    typoBaseSize: state.tokens.typoBaseSize,
    typoRatio: state.tokens.typoRatio,
    spacingPreset: state.tokens.spacingPreset,
    spacingDensity: state.tokens.spacingDensity,
    radius: state.tokens.radius,
    shadow: state.tokens.shadow,
  };

  return (
    <div className="space-y-6">
      {/* Bandeau header */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">🎨 6. Design Visuel</h1>
          <p className="text-xs text-muted mt-0.5">
            Palette OKLCH · Neutrals & Semantics · Gradient · Tokens · Export. Sauvegarde
            automatique dans ton projet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-muted">💾 Sauvegarde...</span>}
          {!saving && lastSaved && (
            <span className="text-xs text-green-600">✓ Sauvé à {lastSaved}</span>
          )}
          <a
            href="/design-spike"
            target="_blank"
            rel="noopener"
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
            title="Ouvrir le spike en mode dev"
          >
            🧪 Spike dev
          </a>
        </div>
      </div>

      {/* Bandeau validation */}
      <ValidationBanner
        primaryHex={state.customColor}
        palette={palette}
        selectedColors={selectedAsRoles}
        tokens={state.tokens}
      />

      {/* Éditeur palette simplifié v1 */}
      <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
        <h2 className="text-xl font-bold">1. Éditeur de palette</h2>
        <p className="text-xs text-muted">
          Version migrée simplifiée. Pour l&apos;éditeur complet avec sliders de tuning, matrice
          WCAG 12×12 et dark mode auto-généré, utilise le{" "}
          <a href="/design-spike" className="text-accent underline" target="_blank" rel="noopener">
            spike dev
          </a>
          .
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="color"
            value={state.customColor}
            onChange={(e) => updateState({ customColor: e.target.value })}
            className="h-10 w-16 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={state.customColor}
            onChange={(e) => updateState({ customColor: e.target.value })}
            className="h-10 px-3 font-mono text-sm rounded border border-border bg-card w-36"
          />
        </div>
        <div className="overflow-x-auto -mx-1 pb-2">
          <div className="grid grid-cols-12 gap-1 min-w-[720px] px-1">
            {palette.map((shade) => (
              <div key={shade.name} className="space-y-1">
                <div
                  className="aspect-square rounded border border-border shadow-sm"
                  style={{ background: shade.hex }}
                  title={shade.css}
                />
                <div className="text-[10px] font-mono text-center">{shade.name}</div>
                <div className="text-[9px] font-mono text-center text-muted truncate">
                  {shade.hex}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neutrals & Semantics */}
      <ExtraColorsBlock primaryHex={state.customColor} />

      {/* Gradient */}
      <GradientBlock
        gradient={state.tokens.gradient}
        onChange={(g) => updateTokens({ gradient: g })}
        primaryPalette={palette}
        primaryHex={state.customColor}
        selectedColors={selectedAsRoles}
      />

      {/* Tokens */}
      <TokensBlock
        tokens={state.tokens}
        onChange={updateTokens}
        selectedColors={selectedAsRoles}
      />

      {/* Export */}
      <ExportBlock snapshot={exportSnapshot} />

      <div className="border-t border-border pt-4 text-xs text-muted text-center">
        Migration v1 en cours. Éditeur palette complet (matrice WCAG, dark mode auto, mariage) et{" "}
        <strong>composants avec vrais previews</strong> à venir dans les prochaines itérations. En
        attendant, tous les outils complets sont disponibles dans le{" "}
        <a href="/design-spike" className="text-accent underline" target="_blank" rel="noopener">
          spike dev
        </a>
        .
      </div>
    </div>
  );
}

// Export pour que le DesignPanel puisse l'utiliser
export { DEFAULT_VISUAL_STATE };
export type { VisualState, VisualSelectedShade };
