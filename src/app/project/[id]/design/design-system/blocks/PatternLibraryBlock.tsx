"use client";

import { useState } from "react";
import type { DesignSystemState, PatternSelection } from "../state";
import { PATTERN_TEMPLATES, type PatternType } from "../patterns-library";
import BlockStatus from "../components/BlockStatus";

const TYPE_META: Record<PatternType, { label: string; emoji: string }> = {
  empty: { label: "Empty", emoji: "📭" },
  loading: { label: "Loading", emoji: "⏳" },
  error: { label: "Error", emoji: "❌" },
  success: { label: "Success", emoji: "✅" },
};

export default function PatternLibraryBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.patterns.length > 0);
  const [filter, setFilter] = useState<PatternType | "all">("all");
  const ok = state.patterns.length >= 2;

  const filtered =
    filter === "all" ? PATTERN_TEMPLATES : PATTERN_TEMPLATES.filter((p) => p.type === filter);
  const selectedIds = new Set(state.patterns.map((p) => p.patternId));

  function toggle(patternId: string, type: PatternType) {
    if (selectedIds.has(patternId)) {
      onChange({ patterns: state.patterns.filter((p) => p.patternId !== patternId) });
    } else {
      const next: PatternSelection = { patternId, type, customMarkdown: "" };
      onChange({ patterns: [...state.patterns, next] });
    }
  }

  function updateCustom(patternId: string, markdown: string) {
    onChange({
      patterns: state.patterns.map((p) =>
        p.patternId === patternId ? { ...p, customMarkdown: markdown } : p
      ),
    });
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
          🎨 Patterns library
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.patterns.length}/{PATTERN_TEMPLATES.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">4 types d&apos;états à ne jamais oublier</strong>{" "}
            — Empty (0 résultat), Loading (&lt; 400ms sans feedback = échec Doherty), Error
            (actionnable, pas « 422 »), Success (célébrer sans confettis). Sélectionne ceux que
            ton projet doit couvrir.
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-2.5 py-1 rounded transition ${
                filter === "all"
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:bg-accent/10"
              }`}
            >
              Tous ({PATTERN_TEMPLATES.length})
            </button>
            {Object.entries(TYPE_META).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setFilter(key as PatternType)}
                className={`text-xs px-2.5 py-1 rounded transition ${
                  filter === key
                    ? "bg-accent text-white"
                    : "border border-border text-muted hover:bg-accent/10"
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((p) => {
              const selected = selectedIds.has(p.id);
              const selection = state.patterns.find((s) => s.patternId === p.id);
              return (
                <div
                  key={p.id}
                  className={`border-2 rounded-xl p-3 space-y-2 transition ${
                    selected ? "border-accent bg-accent/5" : "border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.emoji}</span>
                        <span className="font-semibold text-sm">{p.label}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(p.id, p.type)}
                      className={`text-xs px-2 py-1 rounded transition shrink-0 ${
                        selected
                          ? "bg-accent text-white"
                          : "border border-border text-muted hover:bg-accent/10"
                      }`}
                    >
                      {selected ? "✓ Activé" : "+ Activer"}
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono bg-card/80 border border-border rounded p-2 whitespace-pre-wrap overflow-x-auto">
                    {p.structure}
                  </pre>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded p-2 text-[11px]">
                    <div className="text-[9px] uppercase text-emerald-600 font-semibold mb-1">
                      Exemple
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[10px]">{p.example}</pre>
                  </div>
                  {selected && (
                    <textarea
                      value={selection?.customMarkdown ?? ""}
                      onChange={(e) => updateCustom(p.id, e.target.value)}
                      placeholder="Personnalisation (optionnel)"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
