"use client";

import type { PaletteShade } from "@/lib/design/oklch";
import { Help } from "@/app/design-spike/help";
import CollapsibleSection from "./CollapsibleSection";

export default function DarkPalettePreview({
  lightPalette,
  darkPalette,
}: {
  lightPalette: PaletteShade[];
  darkPalette: PaletteShade[];
}) {
  return (
    <CollapsibleSection
      headerClassName="text-base font-semibold"
      title={
        <>
          🌙 Dark mode auto-généré
          <Help topic="darkPerceptual" />
        </>
      }
      topRight={
        <span className="text-[11px] text-muted">Inversion OKLCH perceptuelle (chroma -15%)</span>
      }
      expandButtonLabel="Voir la palette dark générée automatiquement"
    >
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Comment ça marche ?</strong> Au lieu d&apos;inverser
        bêtement les couleurs en RGB (qui produit des darks moches et sursaturés), on inverse la{" "}
        <strong>lightness OKLCH de manière asymétrique</strong>, avec une <strong>réduction de
        chroma de 15%</strong> pour éviter la fatigue oculaire.
      </div>
      <div className="space-y-1 mt-3">
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
    </CollapsibleSection>
  );
}
