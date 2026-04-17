"use client";

import { useState } from "react";
import type { AarrrMetric, FlowsState } from "../state";
import { DEFAULT_AARRR_STAGES, makeAarrrId } from "../state";
import BlockStatus from "../components/BlockStatus";

const STAGE_META: Record<
  AarrrMetric["stage"],
  { label: string; emoji: string; hint: string; sample: string }
> = {
  acquisition: {
    label: "Acquisition",
    emoji: "🎯",
    hint: "Comment les users arrivent",
    sample: "Ex : 100 visites/jour depuis SEO",
  },
  activation: {
    label: "Activation",
    emoji: "✨",
    hint: "Ils atteignent l'aha moment",
    sample: "Ex : 30% créent 1 projet en 24h",
  },
  retention: {
    label: "Retention",
    emoji: "🔁",
    hint: "Ils reviennent",
    sample: "Ex : 40% D7 retention",
  },
  revenue: {
    label: "Revenue",
    emoji: "💰",
    hint: "Ils paient",
    sample: "Ex : MRR 500€",
  },
  referral: {
    label: "Referral",
    emoji: "📣",
    hint: "Ils en parlent",
    sample: "Ex : NPS 50 · 20% invite un pote",
  },
};

export default function AARRRBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.aarrrMetrics.length > 0);
  const ok = state.aarrrMetrics.length >= 3;

  function ensureStage(stage: AarrrMetric["stage"]): AarrrMetric {
    const existing = state.aarrrMetrics.find((m) => m.stage === stage);
    return existing ?? {
      id: makeAarrrId(),
      stage,
      metric: "",
      target: "",
    };
  }

  function loadAll() {
    if (state.aarrrMetrics.length > 0) return;
    const next = DEFAULT_AARRR_STAGES.map((stage) => ({
      id: makeAarrrId(),
      stage,
      metric: "",
      target: "",
    }));
    onChange({ aarrrMetrics: next });
  }

  function updateMetric(stage: AarrrMetric["stage"], patch: Partial<AarrrMetric>) {
    const existing = state.aarrrMetrics.find((m) => m.stage === stage);
    if (!existing) {
      const next: AarrrMetric = { ...ensureStage(stage), ...patch, stage };
      onChange({ aarrrMetrics: [...state.aarrrMetrics, next] });
    } else {
      onChange({
        aarrrMetrics: state.aarrrMetrics.map((m) =>
          m.stage === stage ? { ...m, ...patch } : m
        ),
      });
    }
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📈 AARRR dashboard
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">({state.aarrrMetrics.length}/5)</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Pirate funnel (McClure / Reforge)</strong>. À
            chaque étape, un taux de drop-off. Mesure chaque conversion, attaque le plus faible.
          </div>

          {state.aarrrMetrics.length === 0 && (
            <button
              onClick={loadAll}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les 5 stages AARRR
            </button>
          )}

          <div className="space-y-2">
            {DEFAULT_AARRR_STAGES.map((stage) => {
              const meta = STAGE_META[stage];
              const metric = state.aarrrMetrics.find((m) => m.stage === stage);
              return (
                <div
                  key={stage}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{meta.label}</div>
                      <div className="text-[10px] text-muted">{meta.hint}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={metric?.metric ?? ""}
                      onChange={(e) => updateMetric(stage, { metric: e.target.value })}
                      placeholder={meta.sample}
                      className="h-8 px-2 text-xs rounded border border-border bg-card"
                    />
                    <input
                      type="text"
                      value={metric?.target ?? ""}
                      onChange={(e) => updateMetric(stage, { target: e.target.value })}
                      placeholder="Target (ex: 30%)"
                      className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                    />
                    <input
                      type="text"
                      value={metric?.current ?? ""}
                      onChange={(e) => updateMetric(stage, { current: e.target.value })}
                      placeholder="Current (ex: 22%)"
                      className="h-8 px-2 text-xs rounded border border-border bg-card font-mono text-muted"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
