"use client";

import { useState } from "react";
import type { DesignSystemState, DeprecatedToken } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function TokenVersioningBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.deprecatedTokens.length > 0);
  const [selectedToken, setSelectedToken] = useState("");
  const [replacedBy, setReplacedBy] = useState("");

  const ok = state.deprecatedTokens.length === 0 || state.deprecatedTokens.every((d) => d.replacedBy);

  const activeTokens = state.semanticTokens
    .filter((t) => !state.deprecatedTokens.some((d) => d.name === t.name))
    .map((t) => t.name);

  function deprecateToken() {
    if (!selectedToken || !replacedBy) return;
    const next: DeprecatedToken = {
      name: selectedToken,
      replacedBy,
      deprecatedAt: new Date().toISOString(),
    };
    onChange({ deprecatedTokens: [...state.deprecatedTokens, next] });
    setSelectedToken("");
    setReplacedBy("");
  }

  function undeprecate(name: string) {
    onChange({ deprecatedTokens: state.deprecatedTokens.filter((d) => d.name !== name) });
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
          🗄️ Token versioning
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.deprecatedTokens.length} dépréciés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Toujours deprecate avant delete.</strong>{" "}
            Renommer un token `color.primary` en `color.accent` sans transition peut casser 3
            apps. Deprecate = marqué pour suppression future + pointe vers le remplaçant.
          </div>

          {activeTokens.length > 0 && (
            <div className="bg-card/60 border border-border rounded-xl p-3 space-y-2">
              <div className="text-xs font-semibold">Déprécier un token</div>
              <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-center">
                <select
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                >
                  <option value="">Token à déprécier…</option>
                  {activeTokens.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-muted text-xs">→</span>
                <input
                  type="text"
                  value={replacedBy}
                  onChange={(e) => setReplacedBy(e.target.value)}
                  placeholder="Remplacé par (ex: color.accent)"
                  className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                />
                <button
                  onClick={deprecateToken}
                  disabled={!selectedToken || !replacedBy}
                  className="h-8 px-3 text-xs rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
                >
                  Déprécier
                </button>
              </div>
            </div>
          )}

          {state.deprecatedTokens.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold">Tokens dépréciés</div>
              {state.deprecatedTokens.map((d) => (
                <div
                  key={d.name}
                  className="flex items-center gap-2 p-2 rounded border border-amber-500/30 bg-amber-500/5"
                >
                  <span className="text-xs font-mono text-muted line-through flex-1">{d.name}</span>
                  <span className="text-xs text-muted">→</span>
                  <span className="text-xs font-mono font-semibold flex-1">{d.replacedBy}</span>
                  <span className="text-[10px] text-muted">
                    {new Date(d.deprecatedAt).toLocaleDateString("fr-FR")}
                  </span>
                  <button
                    onClick={() => undeprecate(d.name)}
                    className="w-6 h-6 rounded text-muted hover:text-accent text-xs"
                    title="Annuler la dépréciation"
                  >
                    ↺
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
