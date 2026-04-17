"use client";

import { useState } from "react";
import type { PaletteShade } from "@/lib/design/oklch";
import { Help } from "@/app/design-spike/help";

export default function DarkPalettePreview({
  lightPalette,
  darkPalette,
}: {
  lightPalette: PaletteShade[];
  darkPalette: PaletteShade[];
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="text-base font-semibold flex items-center gap-2 hover:text-accent transition cursor-pointer text-left"
          aria-label={collapsed ? "Déplier" : "Replier"}
        >
          {collapsed ? "▶" : "▼"}
          🌙 Dark mode auto-généré
          <Help topic="darkPerceptual" />
        </button>
        <span className="text-[11px] text-muted">Inversion OKLCH perceptuelle (chroma -15%)</span>
      </div>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/5 transition flex items-center justify-center gap-2"
        >
          ▼ Voir la palette dark générée automatiquement
        </button>
      ) : (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Comment ça marche ?</strong> Au lieu d&apos;inverser
            bêtement les couleurs en RGB (qui produit des darks moches et sursaturés), on inverse la{" "}
            <strong>lightness OKLCH de manière asymétrique</strong>, avec une <strong>réduction de
            chroma de 15%</strong> pour éviter la fatigue oculaire.
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-muted">Light :</div>
            <div className="overflow-x-auto -mx-1 pb-1">
              <div className="grid grid-cols-12 gap-0.5 min-w-[600px] px-1">
                {lightPalette.map((s) => (
                  <div
                    key={`l-${s.name}`}
                    className="aspect-square rounded border border-border/50"
                    style={{ background: s.hex }}
                    title={`${s.name} · ${s.hex}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-[10px] font-mono text-muted mt-2">Dark (auto) :</div>
            <div className="overflow-x-auto -mx-1 pb-1">
              <div className="grid grid-cols-12 gap-0.5 min-w-[600px] px-1">
                {darkPalette.map((s) => (
                  <div
                    key={`d-${s.name}`}
                    className="aspect-square rounded border border-border/50"
                    style={{ background: s.hex }}
                    title={`${s.name} · ${s.hex}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
