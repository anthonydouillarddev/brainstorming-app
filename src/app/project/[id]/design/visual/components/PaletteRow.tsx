"use client";

import { useMemo } from "react";
import { generatePalette, type PaletteShade, type PaletteTuning } from "@/lib/design/oklch";
import { badgeClass, type SelectedShade } from "./shared";

function ShadeCard({
  shade,
  isSelected,
  onToggle,
}: {
  shade: PaletteShade;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`text-left space-y-1 transition ${
        isSelected ? "scale-105" : "hover:scale-[1.02]"
      }`}
      title={`${shade.css} — clic pour ajouter/retirer au mariage`}
    >
      <div
        className={`aspect-square rounded shadow-sm ${
          isSelected ? "ring-4 ring-accent ring-offset-2 ring-offset-card" : "border border-border"
        }`}
        style={{ background: shade.hex }}
      />
      <div className="text-[10px] font-mono space-y-0.5 leading-tight">
        <div className="font-semibold text-center">{shade.name}</div>
        <div className="text-muted text-center truncate">{shade.hex}</div>
        <div className="flex justify-between gap-1">
          <span className={badgeClass(shade.ratioVsWhite)}>W {shade.ratioVsWhite.toFixed(1)}</span>
          <span className={badgeClass(shade.ratioVsBlack)}>B {shade.ratioVsBlack.toFixed(1)}</span>
        </div>
      </div>
    </button>
  );
}

export default function PaletteRow({
  name,
  hex,
  tuning,
  selected,
  onToggleShade,
}: {
  name: string;
  hex: string;
  tuning?: PaletteTuning;
  selected: Set<string>;
  onToggleShade: (shade: SelectedShade) => void;
}) {
  const palette = useMemo(() => generatePalette(hex, tuning), [hex, tuning]);
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="text-base font-semibold">
          {name}{" "}
          <span className="text-muted font-normal">
            — <span className="font-mono text-sm">{hex}</span>
          </span>
        </h3>
        <span className="text-[11px] text-muted">Clic = ajouter/retirer au mariage</span>
      </div>
      <div className="overflow-x-auto -mx-1 pb-2">
        <div className="grid grid-cols-12 gap-1 min-w-[720px] px-1">
          {palette.map((shade) => {
            const id = `${hex}-${shade.name}`;
            return (
              <ShadeCard
                key={shade.name}
                shade={shade}
                isSelected={selected.has(id)}
                onToggle={() =>
                  onToggleShade({ id, hex: shade.hex, source: `shade ${shade.name} de ${hex}` })
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
