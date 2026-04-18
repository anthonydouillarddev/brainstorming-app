"use client";

import { useState } from "react";
import type { FeedbackItem, PrinciplesState } from "../state";
import { makeId } from "../state";
import { validateFeedback } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const ACTION_SUGGESTIONS = [
  "Click bouton primary",
  "Submit formulaire",
  "Supprimer item",
  "Upload fichier",
  "Save (auto ou manuel)",
  "Envoyer message",
  "Charger liste",
  "Recherche en live",
];

export default function FeedbackInventoryBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.feedbackInventory.length > 0);
  const issues = validateFeedback(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.feedbackInventory.length >= 3 && !hasError;

  function addItem(action?: string) {
    const next: FeedbackItem = {
      id: makeId("fb"),
      action: action ?? "",
      visual: true,
      haptic: false,
      audio: false,
      latencyMs: 100,
    };
    onChange({ feedbackInventory: [...state.feedbackInventory, next] });
  }

  function update(id: string, patch: Partial<FeedbackItem>) {
    onChange({
      feedbackInventory: state.feedbackInventory.map((f) =>
        f.id === id ? { ...f, ...patch } : f
      ),
    });
  }

  function remove(id: string) {
    onChange({ feedbackInventory: state.feedbackInventory.filter((f) => f.id !== id) });
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
          📣 Feedback inventory
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.feedbackInventory.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Nielsen H1 + Doherty.</strong> Chaque action user
            doit recevoir un feedback (visuel, haptic, audio) sous 100ms. Au-delà de 400ms,
            skeleton/spinner obligatoire.
          </div>

          {state.feedbackInventory.length > 0 && (
            <div className="space-y-2">
              {state.feedbackInventory.map((f) => (
                <div
                  key={f.id}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={f.action}
                      onChange={(e) => update(f.id, { action: e.target.value })}
                      placeholder="Action (ex: Click bouton publier)"
                      className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                    />
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] text-muted">Latence</label>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={f.latencyMs}
                        onChange={(e) => update(f.id, { latencyMs: Number(e.target.value) })}
                        className="w-20 h-7 px-1 rounded border border-border bg-card text-xs text-center font-mono"
                      />
                      <span className="text-[10px] text-muted">ms</span>
                    </div>
                    <button
                      onClick={() => remove(f.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.visual}
                        onChange={(e) => update(f.id, { visual: e.target.checked })}
                      />
                      <span className={f.visual ? "text-green-600" : "text-muted"}>
                        👁️ Visuel
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.haptic}
                        onChange={(e) => update(f.id, { haptic: e.target.checked })}
                      />
                      <span className={f.haptic ? "text-green-600" : "text-muted"}>
                        📳 Haptic
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={f.audio}
                        onChange={(e) => update(f.id, { audio: e.target.checked })}
                      />
                      <span className={f.audio ? "text-green-600" : "text-muted"}>
                        🔊 Audio
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Ajouts rapides :</div>
            <div className="flex flex-wrap gap-1">
              {ACTION_SUGGESTIONS.map((a) => (
                <button
                  key={a}
                  onClick={() => addItem(a)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {a}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addItem()}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Action personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
