"use client";

import { useState } from "react";
import type { InfoNavState, LabelMapping } from "../state";
import { makeLabelId } from "../state";
import { LABEL_DICTIONARY } from "../templates";
import BlockStatus from "../components/BlockStatus";

export default function LabelDictionaryBlock({
  state,
  onChange,
}: {
  state: InfoNavState;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.labels.length > 0);
  const ok = state.labels.length > 0;

  const existingInternal = new Set(state.labels.map((l) => l.internal.toLowerCase()));
  const availableDict = LABEL_DICTIONARY.filter(
    (d) => !existingInternal.has(d.internal.toLowerCase())
  );

  function addFromDict(item: (typeof LABEL_DICTIONARY)[number]) {
    const next: LabelMapping = {
      id: makeLabelId(),
      internal: item.internal,
      userFacing: item.userFacing,
      context: item.context,
    };
    onChange({ labels: [...state.labels, next] });
  }

  function addCustom() {
    const next: LabelMapping = {
      id: makeLabelId(),
      internal: "",
      userFacing: "",
      context: "",
    };
    onChange({ labels: [...state.labels, next] });
  }

  function updateLabel(id: string, patch: Partial<LabelMapping>) {
    onChange({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }

  function removeLabel(id: string) {
    onChange({ labels: state.labels.filter((l) => l.id !== id) });
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
          📝 Dictionnaire labels
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.labels.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Vocabulaire user &gt; vocabulaire dev.</strong>{" "}
            « Dashboard » pour toi, « Accueil » pour l&apos;user. Une map interne/user garantit
            la cohérence dans le code, le copy et le design.
          </div>

          {state.labels.length > 0 && (
            <div className="space-y-1">
              {state.labels.map((label) => (
                <div
                  key={label.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1.5fr_auto] gap-2 items-center p-2 rounded border border-border bg-card"
                >
                  <input
                    type="text"
                    value={label.internal}
                    onChange={(e) => updateLabel(label.id, { internal: e.target.value })}
                    placeholder="Interne (ex: Dashboard)"
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                  />
                  <span className="text-muted text-center">→</span>
                  <input
                    type="text"
                    value={label.userFacing}
                    onChange={(e) => updateLabel(label.id, { userFacing: e.target.value })}
                    placeholder="User (ex: Accueil)"
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-semibold"
                  />
                  <input
                    type="text"
                    value={label.context ?? ""}
                    onChange={(e) => updateLabel(label.id, { context: e.target.value })}
                    placeholder="Contexte (optionnel)"
                    className="h-8 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                  <button
                    onClick={() => removeLabel(label.id)}
                    className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {availableDict.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouts rapides depuis le dictionnaire :</div>
              <div className="flex flex-wrap gap-1">
                {availableDict.slice(0, 12).map((item) => (
                  <button
                    key={item.internal}
                    onClick={() => addFromDict(item)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {item.internal} → {item.userFacing}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter une entrée personnalisée
          </button>
        </>
      )}
    </div>
  );
}
