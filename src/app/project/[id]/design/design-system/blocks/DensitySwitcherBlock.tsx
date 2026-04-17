"use client";

import { useState } from "react";
import type { DensityKey, DesignSystemState } from "../state";
import BlockStatus from "../components/BlockStatus";

const DENSITIES: {
  key: DensityKey;
  label: string;
  emoji: string;
  description: string;
  multiplier: number;
}[] = [
  {
    key: "compact",
    label: "Compact",
    emoji: "📊",
    description: "×0.85 · Dashboards denses, power users, logiciels métier",
    multiplier: 0.85,
  },
  {
    key: "normal",
    label: "Normal",
    emoji: "⚖️",
    description: "×1 · Défaut équilibré, la plupart des apps",
    multiplier: 1,
  },
  {
    key: "comfortable",
    label: "Comfortable",
    emoji: "🛋️",
    description: "×1.2 · Apps grand public, touch, accessibilité",
    multiplier: 1.2,
  },
];

export default function DensitySwitcherBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.density !== "normal");
  const ok = !!state.density;
  const current = DENSITIES.find((d) => d.key === state.density)!;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎚️ Density preset
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({current.emoji} {current.label})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Multiplicateur global</strong> appliqué aux
            spacings et font-sizes. Un dashboard logiciel (compact) n&apos;a pas les mêmes
            proportions qu&apos;une appli mobile (comfortable).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {DENSITIES.map((d) => {
              const isSelected = state.density === d.key;
              return (
                <button
                  key={d.key}
                  onClick={() => onChange({ density: d.key })}
                  className={`text-left p-4 rounded-xl border-2 transition ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="text-3xl mb-1">{d.emoji}</div>
                  <div className="font-semibold text-sm">{d.label}</div>
                  <div className="text-[11px] text-muted mt-0.5">{d.description}</div>
                  <div className="mt-2 font-mono text-[10px] text-muted">
                    multiplier : {d.multiplier}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
