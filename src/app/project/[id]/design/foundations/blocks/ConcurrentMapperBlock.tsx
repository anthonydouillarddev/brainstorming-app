"use client";

import { useState } from "react";
import {
  makeCompetitorId,
  type ConcurrentMapperCompetitor,
  type FoundationsState,
} from "../state";

export default function ConcurrentMapperBlock({
  state,
  onChange,
}: {
  state: FoundationsState;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.concurrentMapper.competitors.length > 0);
  const mapper = state.concurrentMapper;

  function update(patch: Partial<typeof mapper>) {
    onChange({ concurrentMapper: { ...mapper, ...patch } });
  }

  function addCompetitor(isMe = false) {
    const next: ConcurrentMapperCompetitor = {
      id: makeCompetitorId(),
      name: isMe ? "Moi" : "",
      x: 50,
      y: 50,
      isMe,
    };
    update({ competitors: [...mapper.competitors, next] });
  }

  function updateCompetitor(id: string, patch: Partial<ConcurrentMapperCompetitor>) {
    update({
      competitors: mapper.competitors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function removeCompetitor(id: string) {
    update({ competitors: mapper.competitors.filter((c) => c.id !== id) });
  }

  const hasMe = mapper.competitors.some((c) => c.isMe);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left w-full"
        aria-expanded={expanded}
      >
        <span aria-hidden>{expanded ? "▼" : "▶"}</span>
        🗺️ Concurrent Mapper 2×2
        <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
          NICE
        </span>
        <span className="text-muted text-sm font-normal">
          ({mapper.competitors.length} concurrent{mapper.competitors.length > 1 ? "s" : ""})
        </span>
      </button>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Grille 2×2 de différenciation.</strong> Choisis 2
            axes qui comptent pour ton segment (ex : prix × complexité, générique × spécialisé) et
            positionne toi vs tes concurrents. Les quadrants vides = ton opportunité.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AxisEditor
              label="Axe X (horizontal)"
              low={mapper.xAxisLow}
              high={mapper.xAxisHigh}
              onLowChange={(xAxisLow) => update({ xAxisLow })}
              onHighChange={(xAxisHigh) => update({ xAxisHigh })}
              placeholderLow="Gratuit"
              placeholderHigh="Cher"
            />
            <AxisEditor
              label="Axe Y (vertical)"
              low={mapper.yAxisLow}
              high={mapper.yAxisHigh}
              onLowChange={(yAxisLow) => update({ yAxisLow })}
              onHighChange={(yAxisHigh) => update({ yAxisHigh })}
              placeholderLow="Simple"
              placeholderHigh="Complet"
            />
          </div>

          <MapperGrid mapper={mapper} />

          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Concurrents</h3>
              <div className="flex gap-2">
                {!hasMe && (
                  <button
                    onClick={() => addCompetitor(true)}
                    className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition"
                  >
                    + Moi
                  </button>
                )}
                <button
                  onClick={() => addCompetitor(false)}
                  className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
                >
                  + Concurrent
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {mapper.competitors.map((c) => (
                <div
                  key={c.id}
                  className={`flex items-center gap-2 p-2 rounded border ${
                    c.isMe ? "bg-accent/10 border-accent/50" : "bg-card border-border"
                  }`}
                >
                  <span className="text-lg" aria-hidden>
                    {c.isMe ? "⭐" : "•"}
                  </span>
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCompetitor(c.id, { name: e.target.value })}
                    placeholder="Nom"
                    className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 min-w-[100px]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted">X:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={c.x}
                      onChange={(e) =>
                        updateCompetitor(c.id, { x: Number(e.target.value) })
                      }
                      className="w-20 md:w-32"
                    />
                    <span className="text-[10px] font-mono w-8 text-muted">{c.x}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted">Y:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={c.y}
                      onChange={(e) =>
                        updateCompetitor(c.id, { y: Number(e.target.value) })
                      }
                      className="w-20 md:w-32"
                    />
                    <span className="text-[10px] font-mono w-8 text-muted">{c.y}%</span>
                  </div>
                  <button
                    onClick={() => removeCompetitor(c.id)}
                    className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
              {mapper.competitors.length === 0 && (
                <div className="text-xs text-muted italic text-center py-3">
                  Ajoute au moins &laquo; Moi &raquo; + 2 concurrents pour voir la grille en
                  action.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AxisEditor({
  label,
  low,
  high,
  onLowChange,
  onHighChange,
  placeholderLow,
  placeholderHigh,
}: {
  label: string;
  low: string;
  high: string;
  onLowChange: (value: string) => void;
  onHighChange: (value: string) => void;
  placeholderLow: string;
  placeholderHigh: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={low}
          onChange={(e) => onLowChange(e.target.value)}
          placeholder={placeholderLow}
          className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
        />
        <span className="text-xs text-muted px-1">→</span>
        <input
          type="text"
          value={high}
          onChange={(e) => onHighChange(e.target.value)}
          placeholder={placeholderHigh}
          className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
        />
      </div>
    </div>
  );
}

function MapperGrid({
  mapper,
}: {
  mapper: FoundationsState["concurrentMapper"];
}) {
  return (
    <div className="relative bg-card/40 border border-border rounded-xl aspect-square max-w-md mx-auto my-4">
      {/* Labels Y */}
      {mapper.yAxisHigh && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-medium text-muted">
          ↑ {mapper.yAxisHigh}
        </div>
      )}
      {mapper.yAxisLow && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[11px] font-medium text-muted">
          ↓ {mapper.yAxisLow}
        </div>
      )}
      {/* Labels X */}
      {mapper.xAxisLow && (
        <div className="absolute top-1/2 -left-2 -translate-x-full -translate-y-1/2 text-[11px] font-medium text-muted whitespace-nowrap">
          ← {mapper.xAxisLow}
        </div>
      )}
      {mapper.xAxisHigh && (
        <div className="absolute top-1/2 -right-2 translate-x-full -translate-y-1/2 text-[11px] font-medium text-muted whitespace-nowrap">
          {mapper.xAxisHigh} →
        </div>
      )}

      {/* Axes */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />

      {/* Grid quadrant hints */}
      <div className="absolute inset-2 grid grid-cols-2 grid-rows-2 gap-2 pointer-events-none">
        <div className="rounded bg-accent/5 flex items-start justify-start p-2 text-[9px] text-muted/50 uppercase tracking-wider">
          ↖
        </div>
        <div className="rounded bg-accent/5 flex items-start justify-end p-2 text-[9px] text-muted/50 uppercase tracking-wider">
          ↗
        </div>
        <div className="rounded bg-accent/5 flex items-end justify-start p-2 text-[9px] text-muted/50 uppercase tracking-wider">
          ↙
        </div>
        <div className="rounded bg-accent/5 flex items-end justify-end p-2 text-[9px] text-muted/50 uppercase tracking-wider">
          ↘
        </div>
      </div>

      {/* Competitors */}
      {mapper.competitors.map((c) => (
        <div
          key={c.id}
          className={`absolute rounded-full flex items-center justify-center text-[10px] font-semibold -translate-x-1/2 -translate-y-1/2 transition shadow-lg ${
            c.isMe
              ? "bg-accent text-white w-10 h-10 ring-4 ring-accent/30 z-10"
              : "bg-card text-foreground border-2 border-border w-8 h-8"
          }`}
          style={{
            left: `${c.x}%`,
            top: `${100 - c.y}%`,
          }}
          title={`${c.name} (${c.x}%, ${c.y}%)`}
        >
          {c.name ? c.name.slice(0, 2).toUpperCase() : "?"}
        </div>
      ))}
    </div>
  );
}
