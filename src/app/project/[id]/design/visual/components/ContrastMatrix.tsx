"use client";

import { useMemo, useState } from "react";
import {
  contrastRatio,
  suggestFiveColors,
  type PaletteShade,
} from "@/lib/design/oklch";
import { Help } from "@/app/design-spike/help";
import CollapsibleSection from "./CollapsibleSection";
import type { FilterMode } from "./shared";

function RowCells({
  fg,
  palette,
  passes,
  cellColor,
}: {
  fg: PaletteShade;
  palette: PaletteShade[];
  passes: (r: number) => boolean;
  cellColor: (r: number) => string;
}) {
  return (
    <>
      <div className="text-[10px] font-mono text-muted flex items-center pr-2 whitespace-nowrap">
        text {fg.name}
      </div>
      {palette.map((bg) => {
        const ratio = contrastRatio(fg.hex, bg.hex);
        const show = passes(ratio);
        return (
          <div
            key={`${fg.name}-${bg.name}`}
            className={`text-center text-[10px] font-mono rounded aspect-square flex flex-col items-center justify-center transition ${
              show ? cellColor(ratio) : "opacity-15"
            }`}
            style={{
              background: show ? bg.hex : undefined,
              color: show ? fg.hex : undefined,
            }}
            title={`text ${fg.name} (${fg.hex}) sur bg ${bg.name} (${bg.hex}) → ratio ${ratio.toFixed(2)}`}
          >
            <span className="font-semibold">Aa</span>
            <span className="text-[9px]">{ratio.toFixed(1)}</span>
          </div>
        );
      })}
    </>
  );
}

export default function ContrastMatrix({
  palette,
  onLoadFiveColors,
}: {
  palette: PaletteShade[];
  onLoadFiveColors: (colors: string[]) => void;
}) {
  const [filter, setFilter] = useState<FilterMode>("all");
  const composition = useMemo(() => suggestFiveColors(palette), [palette]);

  function passes(ratio: number): boolean {
    if (filter === "all") return true;
    if (filter === "aa-large") return ratio >= 3;
    if (filter === "aa") return ratio >= 4.5;
    if (filter === "aaa") return ratio >= 7;
    return true;
  }

  function cellColor(ratio: number): string {
    if (ratio >= 7) return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    if (ratio >= 4.5) return "bg-green-500/15 text-green-700 dark:text-green-400";
    if (ratio >= 3) return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    return "bg-red-500/10 text-red-600/70 dark:text-red-400/70";
  }

  const stats = useMemo(() => {
    const total = palette.length * palette.length;
    let aaa = 0,
      aa = 0,
      aaL = 0;
    for (const fg of palette) {
      for (const bg of palette) {
        const r = contrastRatio(fg.hex, bg.hex);
        if (r >= 7) aaa++;
        if (r >= 4.5) aa++;
        if (r >= 3) aaL++;
      }
    }
    return { total, aaa, aa, aaL };
  }, [palette]);

  return (
    <CollapsibleSection
      headerClassName="text-base font-semibold"
      title={
        <>
          Matrice de contraste
          <Help topic="wcag" />
        </>
      }
      showCountInTitle={`(${palette.length}×${palette.length} paires · text sur bg)`}
      expandButtonLabel={`Afficher la matrice ${palette.length}×${palette.length} + les 5 couleurs recommandées`}
      topRight={
        <div className="flex gap-1 text-[11px]">
          {(["all", "aa-large", "aa", "aaa"] as FilterMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-2 py-1 rounded border transition ${
                filter === m
                  ? "bg-accent text-white border-accent"
                  : "border-border hover:bg-accent/10"
              }`}
            >
              {m === "all"
                ? "Tout"
                : m === "aa-large"
                ? "≥3 (AA-L)"
                : m === "aa"
                ? "≥4.5 (AA)"
                : "≥7 (AAA)"}
            </button>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-3 text-[11px] text-muted flex-wrap items-center">
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500/50 mr-1" />
            AAA : {stats.aaa}/{stats.total}
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500/50 mr-1" />
            AA : {stats.aa}/{stats.total}
          </span>
          <span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500/50 mr-1" />
            AA-Large : {stats.aaL}/{stats.total}
          </span>
        </div>

        {composition && (
          <div className="bg-card/60 border border-accent/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-sm font-semibold">💡 5 couleurs recommandées</h4>
              <button
                onClick={() =>
                  onLoadFiveColors([
                    composition.bgLight.hex,
                    composition.text.hex,
                    composition.accent.hex,
                    composition.bgDark.hex,
                    composition.accentSubtle.hex,
                  ])
                }
                className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
              >
                👁️ Charger les 5 couleurs dans le mariage
              </button>
            </div>
            <p className="text-[11px] text-muted">
              Le spectre utile de ta palette : bg clair + texte + accent + bg sombre + accent
              doux.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "BG Light", shade: composition.bgLight },
                { label: "Text", shade: composition.text },
                { label: "Accent", shade: composition.accent },
                { label: "BG Dark", shade: composition.bgDark },
                { label: "Accent Subtle", shade: composition.accentSubtle },
              ].map((item) => (
                <div key={item.label} className="rounded-lg overflow-hidden border border-border">
                  <div className="h-16" style={{ background: item.shade.hex }} />
                  <div className="p-2 bg-card/50">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      {item.label}
                    </div>
                    <div className="text-[10px] font-mono text-muted">{item.shade.hex}</div>
                    <div className="text-[10px] font-mono text-muted">
                      shade {item.shade.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto -mx-1 pb-2">
          <div
            className="grid gap-0.5 px-1"
            style={{
              gridTemplateColumns: `auto repeat(${palette.length}, minmax(44px, 1fr))`,
              minWidth: `${44 * (palette.length + 1) + 8 * palette.length}px`,
            }}
          >
            <div />
            {palette.map((bg) => (
              <div
                key={`h-${bg.name}`}
                className="text-center text-[10px] font-mono text-muted pb-1"
              >
                bg {bg.name}
              </div>
            ))}
            {palette.map((fg) => (
              <RowCells
                key={fg.name}
                fg={fg}
                palette={palette}
                passes={passes}
                cellColor={cellColor}
              />
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
