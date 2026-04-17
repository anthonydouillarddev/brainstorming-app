"use client";

import { useState } from "react";
import type { EmotionLevel, FlowsState, JourneyPhase } from "../state";
import { makeAarrrPhases } from "../templates";
import BlockStatus from "../components/BlockStatus";

const EMOTIONS: { level: EmotionLevel; emoji: string }[] = [
  { level: 1, emoji: "😡" },
  { level: 2, emoji: "😕" },
  { level: 3, emoji: "😐" },
  { level: 4, emoji: "🙂" },
  { level: 5, emoji: "🤩" },
];

export default function JourneyMapBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.journeyPhases.length > 0);
  const ok = state.journeyPhases.length >= 3;

  function loadAARRR() {
    onChange({ journeyPhases: makeAarrrPhases() });
  }

  function updatePhase(id: string, patch: Partial<JourneyPhase>) {
    onChange({
      journeyPhases: state.journeyPhases.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function updateList(
    id: string,
    field: "touchpoints" | "frictions" | "opportunities",
    value: string
  ) {
    const list = value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    updatePhase(id, { [field]: list } as Partial<JourneyPhase>);
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
          🗺️ Journey map AARRR
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.journeyPhases.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Dave McClure / Reforge</strong> : Acquisition →
            Activation → Rétention → Revenue → Referral. Mappe les actions, pensées, émotions et
            frictions à chaque phase. À chaque étape, un drop-off à attaquer.
          </div>

          {state.journeyPhases.length === 0 && (
            <button
              onClick={loadAARRR}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les 5 phases AARRR
            </button>
          )}

          {state.journeyPhases.map((p) => (
            <div key={p.id} className="bg-card/60 border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{p.emoji}</span>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updatePhase(p.id, { name: e.target.value })}
                  className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-semibold"
                />
                <div className="flex items-center gap-0.5">
                  {EMOTIONS.map((e) => (
                    <button
                      key={e.level}
                      onClick={() => updatePhase(p.id, { emotion: e.level })}
                      className={`text-base p-0.5 rounded hover:bg-accent/10 transition ${
                        p.emotion === e.level ? "bg-accent/20" : "opacity-60"
                      }`}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted">Actions</label>
                  <input
                    type="text"
                    value={p.actions}
                    onChange={(e) => updatePhase(p.id, { actions: e.target.value })}
                    placeholder="Ex : Google search"
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted">Pensées</label>
                  <input
                    type="text"
                    value={p.thoughts}
                    onChange={(e) => updatePhase(p.id, { thoughts: e.target.value })}
                    placeholder="Ex : « Ça va m'aider ? »"
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted">
                    Touchpoints (virgules)
                  </label>
                  <input
                    type="text"
                    value={p.touchpoints.join(", ")}
                    onChange={(e) => updateList(p.id, "touchpoints", e.target.value)}
                    placeholder="Ex : SEO, X, Email"
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-red-500">
                    Frictions (virgules)
                  </label>
                  <input
                    type="text"
                    value={p.frictions.join(", ")}
                    onChange={(e) => updateList(p.id, "frictions", e.target.value)}
                    placeholder="Ex : popup cookies, chatbot intrusif"
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
