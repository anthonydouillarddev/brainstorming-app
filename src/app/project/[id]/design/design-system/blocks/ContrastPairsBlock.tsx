"use client";

import { useState } from "react";
import type { ContrastPair, DesignSystemState } from "../state";
import { computeContrastRatio, contrastLevel, makeId } from "../state";
import { validateContrastPairs } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const PAIR_SUGGESTIONS: Omit<ContrastPair, "id">[] = [
  { name: "Text sur Page", fgHex: "#2a2a2a", bgHex: "#E8E0D8" },
  { name: "Text sur Card", fgHex: "#2a2a2a", bgHex: "#F2EDE8" },
  { name: "Text Muted sur Page", fgHex: "#7a7068", bgHex: "#E8E0D8" },
  { name: "Text sur Primary", fgHex: "#ffffff", bgHex: "#7C6A4F" },
  { name: "Text sur Danger", fgHex: "#ffffff", bgHex: "#dc2626" },
  { name: "Text sur Success", fgHex: "#ffffff", bgHex: "#16a34a" },
];

export default function ContrastPairsBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.contrastPairs.length > 0);
  const issues = validateContrastPairs(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.contrastPairs.length >= 3 && !hasError && !hasWarn;

  function addPair(seed?: (typeof PAIR_SUGGESTIONS)[number]) {
    const next: ContrastPair = seed
      ? { ...seed, id: makeId("pair") }
      : { id: makeId("pair"), name: "", fgHex: "#000000", bgHex: "#ffffff" };
    onChange({ contrastPairs: [...state.contrastPairs, next] });
  }

  function update(id: string, patch: Partial<ContrastPair>) {
    onChange({
      contrastPairs: state.contrastPairs.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }

  function remove(id: string) {
    onChange({ contrastPairs: state.contrastPairs.filter((p) => p.id !== id) });
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
          🎨 Contrast pairs (WCAG)
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.contrastPairs.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.2 AA</strong> : ratio ≥ 4.5 pour texte
            normal, ≥ 3 pour texte grand (18pt+) ou UI components. AAA : ≥ 7. Les ratios sont
            calculés automatiquement.
          </div>

          {state.contrastPairs.length > 0 && (
            <div className="space-y-2">
              {state.contrastPairs.map((p) => {
                const ratio = computeContrastRatio(p.fgHex, p.bgHex);
                const level = contrastLevel(ratio);
                const levelColor =
                  level === "aaa"
                    ? "text-emerald-600"
                    : level === "aa"
                    ? "text-green-600"
                    : level === "aa-large"
                    ? "text-amber-600"
                    : "text-red-500";
                const levelLabel =
                  level === "aaa"
                    ? "AAA ✓"
                    : level === "aa"
                    ? "AA ✓"
                    : level === "aa-large"
                    ? "AA-L ⚠"
                    : "FAIL ✗";
                return (
                  <div
                    key={p.id}
                    className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => update(p.id, { name: e.target.value })}
                        placeholder="Nom (ex: Text sur Card)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                      />
                      <span className={`text-sm font-bold ${levelColor}`}>
                        {ratio.toFixed(2)} — {levelLabel}
                      </span>
                      <button
                        onClick={() => remove(p.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted">Foreground (texte)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={p.fgHex}
                            onChange={(e) => update(p.id, { fgHex: e.target.value })}
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={p.fgHex}
                            onChange={(e) => update(p.id, { fgHex: e.target.value })}
                            className="h-8 px-2 text-xs font-mono rounded border border-border bg-card flex-1"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-muted">Background</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={p.bgHex}
                            onChange={(e) => update(p.id, { bgHex: e.target.value })}
                            className="w-8 h-8 rounded border border-border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={p.bgHex}
                            onChange={(e) => update(p.id, { bgHex: e.target.value })}
                            className="h-8 px-2 text-xs font-mono rounded border border-border bg-card flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div
                      className="rounded p-3 text-sm"
                      style={{ color: p.fgHex, background: p.bgHex }}
                    >
                      Aperçu — The quick brown fox jumps over the lazy dog.
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Ajouts rapides :</div>
            <div className="flex flex-wrap gap-1">
              {PAIR_SUGGESTIONS.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addPair(s)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {s.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addPair()}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Paire personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
