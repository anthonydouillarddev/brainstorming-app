"use client";

import {
  SHADE_NAMES,
  type PaletteShade,
  type PaletteTuning,
} from "@/lib/design/oklch";
import { Help } from "@/app/design-spike/help";
import Slider from "../components/Slider";
import PaletteRow from "../components/PaletteRow";
import ContrastMatrix from "../components/ContrastMatrix";
import DarkPalettePreview from "../components/DarkPalettePreview";
import type { SelectedShade } from "../components/shared";

export default function PaletteBlock({
  customColor,
  onCustomColorChange,
  tuning,
  onTuningChange,
  onResetTuning,
  palette,
  darkPalette,
  selectedKeys,
  onToggleShade,
  onLoadFiveColors,
}: {
  customColor: string;
  onCustomColorChange: (hex: string) => void;
  tuning: PaletteTuning;
  onTuningChange: (patch: Partial<PaletteTuning>) => void;
  onResetTuning: () => void;
  palette: PaletteShade[];
  darkPalette: PaletteShade[];
  selectedKeys: Set<string>;
  onToggleShade: (shade: SelectedShade) => void;
  onLoadFiveColors: (colors: string[]) => void;
}) {
  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold">
          1. Éditeur de palette<Help topic="oklch" />
        </h2>
        <button
          onClick={onResetTuning}
          className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
        >
          Réinitialiser le tuning
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="color"
          value={customColor}
          onChange={(e) => onCustomColorChange(e.target.value)}
          className="h-10 w-16 rounded border border-border cursor-pointer"
        />
        <input
          type="text"
          value={customColor}
          onChange={(e) => onCustomColorChange(e.target.value)}
          className="h-10 px-3 font-mono text-sm rounded border border-border bg-card w-36"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Slider
          label="Intensité du contraste"
          hint="0.5 = plat, 1 = défaut, 1.4 = agressif"
          value={tuning.contrast ?? 1}
          min={0.5}
          max={1.4}
          step={0.05}
          onChange={(v) => onTuningChange({ contrast: v })}
        />
        <Slider
          label="Pic de saturation"
          hint="Shade où la couleur est la plus vive"
          value={tuning.chromaPeakIndex ?? 6}
          min={2}
          max={9}
          step={1}
          onChange={(v) => onTuningChange({ chromaPeakIndex: v })}
          format={(v) => `shade ${SHADE_NAMES[v]}`}
        />
        <Slider
          label="Saturation globale"
          hint="0 = gris, 1 = défaut, 1.5 = très vif"
          value={tuning.chromaAmount ?? 1}
          min={0}
          max={1.5}
          step={0.05}
          onChange={(v) => onTuningChange({ chromaAmount: v })}
        />
      </div>

      <div className="border-t border-border pt-5 space-y-6">
        <PaletteRow
          name="Ta palette"
          hex={customColor}
          tuning={tuning}
          selected={selectedKeys}
          onToggleShade={onToggleShade}
        />
        <ContrastMatrix palette={palette} onLoadFiveColors={onLoadFiveColors} />
        <DarkPalettePreview lightPalette={palette} darkPalette={darkPalette} />
      </div>
    </div>
  );
}
