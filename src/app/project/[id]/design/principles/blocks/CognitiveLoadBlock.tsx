"use client";

import { useState } from "react";
import type { CognitiveLoadEntry, PrinciplesState } from "../state";
import { makeId } from "../state";
import BlockStatus from "../components/BlockStatus";

type Level = 1 | 2 | 3 | 4 | 5;

export default function CognitiveLoadBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.cognitiveLoad.length > 0);
  const ok = state.cognitiveLoad.length >= 2;

  function addEntry() {
    const next: CognitiveLoadEntry = {
      id: makeId("cl"),
      screen: "",
      intrinsic: 3,
      extraneous: 3,
      germane: 3,
      notes: "",
    };
    onChange({ cognitiveLoad: [...state.cognitiveLoad, next] });
  }

  function update(id: string, patch: Partial<CognitiveLoadEntry>) {
    onChange({
      cognitiveLoad: state.cognitiveLoad.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function remove(id: string) {
    onChange({ cognitiveLoad: state.cognitiveLoad.filter((c) => c.id !== id) });
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
          🧠 Cognitive load meter
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.cognitiveLoad.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Sweller 1988.</strong> Chaque écran coûte de
            l&apos;effort mental : <em>Intrinsic</em> (complexité du problème réel),{" "}
            <em>Extraneous</em> (surcharge à réduire : trop d&apos;options, jargon, UI en trop),{" "}
            <em>Germane</em> (effort productif qui construit du sens). Objectif : baisser
            l&apos;extraneous.
          </div>

          {state.cognitiveLoad.length > 0 && (
            <div className="space-y-2">
              {state.cognitiveLoad.map((c) => {
                const levelColor = (v: Level) =>
                  v <= 2 ? "bg-green-500/20" : v === 3 ? "bg-amber-500/20" : "bg-red-500/20";
                return (
                  <div
                    key={c.id}
                    className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={c.screen}
                        onChange={(e) => update(c.id, { screen: e.target.value })}
                        placeholder="Écran (ex: Dashboard)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                      />
                      <button
                        onClick={() => remove(c.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["intrinsic", "extraneous", "germane"] as const).map((key) => (
                        <div key={key} className="space-y-1">
                          <label className="text-[10px] text-muted capitalize">{key}</label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((lv) => (
                              <button
                                key={lv}
                                onClick={() =>
                                  update(c.id, { [key]: lv as Level } as Partial<CognitiveLoadEntry>)
                                }
                                className={`w-6 h-6 text-[10px] rounded transition ${
                                  c[key] === lv
                                    ? levelColor(lv as Level) + " font-bold"
                                    : "text-muted hover:bg-accent/10"
                                }`}
                              >
                                {lv}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={c.notes}
                      onChange={(e) => update(c.id, { notes: e.target.value })}
                      placeholder="Notes (ce qu'il faudrait alléger)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addEntry}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Auditer un écran
          </button>
        </>
      )}
    </div>
  );
}
