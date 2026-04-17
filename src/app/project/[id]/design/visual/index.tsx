"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/lib/types";
import {
  generatePalette,
  generateDarkFromLight,
  type PaletteTuning,
} from "@/lib/design/oklch";
import type { ColorCombo } from "@/lib/design/combos";
import TokensBlock, {
  mergeTokens,
  type TokensState,
} from "@/app/design-spike/tokens-block";
import ExportBlock from "@/app/design-spike/export-block";
import ExtraColorsBlock from "@/app/design-spike/extra-colors-block";
import GradientBlock from "@/app/design-spike/gradient-block";
import ValidationBanner from "@/app/design-spike/validation-banner";
import type { DesignSystemSnapshot } from "@/lib/design/export";
import PaletteBlock from "./blocks/PaletteBlock";
import PalettesRefBlock from "./blocks/PalettesRefBlock";
import CombosBlock from "./blocks/CombosBlock";
import MarriageBlock from "./blocks/MarriageBlock";
import type { SelectedShade } from "./components/shared";
import {
  DEFAULT_VISUAL_STATE,
  VISUAL_SECTION_KEY,
  mergeVisualState,
  parseVisualState,
  type VisualState,
  type VisualSelectedShade,
} from "./state";

type ViewMode = "simple" | "advanced" | "pro";

const LS_VIEW_MODE = "mindeck:design:visual:view-mode";

const MODE_VISIBILITY: Record<
  ViewMode,
  {
    palettesRef: boolean;
    combos: boolean;
    marriage: boolean;
    extraColors: boolean;
    gradient: boolean;
    tokens: boolean;
    export: boolean;
    validation: boolean;
  }
> = {
  simple: {
    palettesRef: false,
    combos: true,
    marriage: true,
    extraColors: false,
    gradient: false,
    tokens: true,
    export: true,
    validation: true,
  },
  advanced: {
    palettesRef: true,
    combos: true,
    marriage: true,
    extraColors: true,
    gradient: true,
    tokens: true,
    export: true,
    validation: true,
  },
  pro: {
    palettesRef: true,
    combos: true,
    marriage: true,
    extraColors: true,
    gradient: true,
    tokens: true,
    export: true,
    validation: true,
  },
};

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

  const [state, setState] = useState<VisualState>(() =>
    parseVisualState(initialSections[VISUAL_SECTION_KEY])
  );

  const [viewMode, setViewMode] = useState<ViewMode>("advanced");

  useEffect(() => {
    const saved = window.localStorage.getItem(LS_VIEW_MODE);
    if (saved === "simple" || saved === "advanced" || saved === "pro") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMode(saved);
    }
  }, []);

  function changeViewMode(mode: ViewMode) {
    setViewMode(mode);
    window.localStorage.setItem(LS_VIEW_MODE, mode);
  }

  const palette = useMemo(
    () => generatePalette(state.customColor, state.tuning),
    [state.customColor, state.tuning]
  );

  const darkPalette = useMemo(() => generateDarkFromLight(palette), [palette]);

  const selectedKeys = useMemo(
    () => new Set(state.selected.map((s) => s.id)),
    [state.selected]
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

  function updateSelected(updater: (prev: VisualSelectedShade[]) => VisualSelectedShade[]) {
    setState((prev) => {
      const next = mergeVisualState({
        ...prev,
        selected: updater(prev.selected),
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
  }

  function updateTokens(patch: Partial<TokensState>) {
    setState((prev) => {
      const next = mergeVisualState({
        ...prev,
        tokens: mergeTokens({ ...prev.tokens, ...patch }),
        updatedAt: new Date().toISOString(),
      });
      scheduleSave(next);
      return next;
    });
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

  // ─── Selected shades callbacks ────────────────────────────────────────────
  function toggleShade(shade: SelectedShade) {
    updateSelected((prev) =>
      prev.some((s) => s.id === shade.id)
        ? prev.filter((s) => s.id !== shade.id)
        : [...prev, shade]
    );
  }

  function removeShade(id: string) {
    updateSelected((prev) => prev.filter((s) => s.id !== id));
  }

  function moveShade(from: number, to: number) {
    updateSelected((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  }

  function clearSelected() {
    updateSelected(() => []);
  }

  function updateShadeColor(id: string, newHex: string) {
    updateSelected((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, hex: newHex, source: "édité manuellement" } : s
      )
    );
  }

  function scrollToMarriage() {
    setTimeout(() => {
      document
        .getElementById("marriage-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  function loadFiveColorsIntoMarriage(colors: string[]) {
    const now = Date.now();
    updateSelected(() =>
      colors.map((hex, i) => ({
        id: `comp-${now}-${i}`,
        hex,
        source: "5 couleurs recommandées",
      }))
    );
    scrollToMarriage();
  }

  function pickFromCombo(hex: string, comboId: string, index: number, comboName: string) {
    const id = `${comboId}-${index}`;
    updateSelected((prev) =>
      prev.some((s) => s.id === id)
        ? prev.filter((s) => s.id !== id)
        : [...prev, { id, hex, source: comboName }]
    );
  }

  function loadComboAsMarriage(combo: ColorCombo) {
    updateSelected(() =>
      combo.colors.map((hex, i) => ({
        id: `${combo.id}-${i}`,
        hex,
        source: combo.name,
      }))
    );
    scrollToMarriage();
  }

  function resetTuning() {
    updateState({
      tuning: { contrast: 1, chromaPeakIndex: 6, chromaAmount: 1 },
    });
  }

  function updateTuning(patch: Partial<PaletteTuning>) {
    updateState({ tuning: { ...state.tuning, ...patch } });
  }

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

  const visibility = MODE_VISIBILITY[viewMode];

  return (
    <div className="space-y-6">
      {/* Bandeau header */}
      <div className="bg-card/80 border border-border rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">🎨 6. Design Visuel</h1>
          <p className="text-xs text-muted mt-0.5">
            Palette OKLCH · Matrice WCAG · Dark auto · Combos · Mariage · Tokens · Export.
            Sauvegarde automatique.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {saving && <span className="text-xs text-muted">💾 Sauvegarde...</span>}
          {!saving && lastSaved && (
            <span className="text-xs text-green-600">✓ Sauvé à {lastSaved}</span>
          )}
          <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card">
            {(["simple", "advanced", "pro"] as ViewMode[]).map((m) => (
              <button
                key={m}
                onClick={() => changeViewMode(m)}
                className={`text-xs px-2.5 py-1 rounded transition capitalize ${
                  viewMode === m
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-accent/10 hover:text-foreground"
                }`}
                title={
                  m === "simple"
                    ? "Vue minimale : palette + combos + mariage + tokens + export"
                    : m === "advanced"
                    ? "Vue complète recommandée"
                    : "Vue experte avec tous les outils"
                }
              >
                {m === "simple" ? "Simple" : m === "advanced" ? "Avancé" : "Pro"}
              </button>
            ))}
          </div>
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
      {visibility.validation && (
        <ValidationBanner
          primaryHex={state.customColor}
          palette={palette}
          selectedColors={selectedAsRoles}
          tokens={state.tokens}
        />
      )}

      {/* 1. Éditeur de palette */}
      <PaletteBlock
        customColor={state.customColor}
        onCustomColorChange={(hex) => updateState({ customColor: hex })}
        tuning={state.tuning}
        onTuningChange={updateTuning}
        onResetTuning={resetTuning}
        palette={palette}
        darkPalette={darkPalette}
        selectedKeys={selectedKeys}
        onToggleShade={toggleShade}
        onLoadFiveColors={loadFiveColorsIntoMarriage}
      />

      {/* 2. Palettes de référence */}
      {visibility.palettesRef && (
        <PalettesRefBlock selectedKeys={selectedKeys} onToggleShade={toggleShade} />
      )}

      {/* 3. Combos inspirationnels */}
      {visibility.combos && (
        <CombosBlock onPickColor={pickFromCombo} onLoadCombo={loadComboAsMarriage} />
      )}

      {/* 4. Neutrals & Semantics */}
      {visibility.extraColors && <ExtraColorsBlock primaryHex={state.customColor} />}

      {/* 5. Gradient */}
      {visibility.gradient && (
        <GradientBlock
          gradient={state.tokens.gradient}
          onChange={(g) => updateTokens({ gradient: g })}
          primaryPalette={palette}
          primaryHex={state.customColor}
          selectedColors={selectedAsRoles}
        />
      )}

      {/* 6. Mariage preview */}
      {visibility.marriage && (
        <MarriageBlock
          selected={state.selected}
          tokens={state.tokens}
          onRemove={removeShade}
          onMove={moveShade}
          onClear={clearSelected}
          onChangeColor={updateShadeColor}
        />
      )}

      {/* 7. Tokens (typo, spacing, radius, shadow, fonts, composants) */}
      {visibility.tokens && (
        <TokensBlock
          tokens={state.tokens}
          onChange={updateTokens}
          selectedColors={selectedAsRoles}
        />
      )}

      {/* 8. Export */}
      {visibility.export && <ExportBlock snapshot={exportSnapshot} />}
    </div>
  );
}

export { DEFAULT_VISUAL_STATE };
export type { VisualState, VisualSelectedShade };
