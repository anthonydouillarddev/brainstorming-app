"use client";

import { useState } from "react";
import type {
  CopyTone,
  MicrocopyState,
  SystemMessageEntry,
  SystemMessageKind,
} from "../state";
import { SYSTEM_MESSAGE_META, TONE_META, makeId } from "../state";
import { SYSTEM_MESSAGE_PRESETS } from "../microcopy-library";
import { validateSystemMessages } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function SystemMessagesBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.systemMessages.length > 0);
  const issues = validateSystemMessages(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.systemMessages.length >= 3 && !hasError;

  function addPreset(preset: (typeof SYSTEM_MESSAGE_PRESETS)[number]) {
    const next: SystemMessageEntry = { id: makeId("sys"), ...preset };
    onChange({ systemMessages: [...state.systemMessages, next] });
  }

  function addCustom() {
    const next: SystemMessageEntry = {
      id: makeId("sys"),
      kind: "banner-info",
      trigger: "",
      title: "",
      body: "",
      primaryLabel: "",
      secondaryLabel: "",
      tone: "neutral",
      notes: "",
    };
    onChange({ systemMessages: [...state.systemMessages, next] });
  }

  function update(id: string, patch: Partial<SystemMessageEntry>) {
    onChange({
      systemMessages: state.systemMessages.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function remove(id: string) {
    onChange({
      systemMessages: state.systemMessages.filter((m) => m.id !== id),
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
          💬 System messages
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.systemMessages.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Shopify Polaris.</strong> Confirmations (surtout
            destructives), banners, tooltips, inline help. Règle destructif : nommer l&apos;objet,
            lister l&apos;impact, CTA principal explicitement irréversible.
          </div>

          {state.systemMessages.length > 0 && (
            <div className="space-y-2">
              {state.systemMessages.map((m) => {
                const meta = SYSTEM_MESSAGE_META[m.kind];
                const isDestructive = m.kind === "confirm-destructive";
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.kind}
                        onChange={(e) =>
                          update(m.id, { kind: e.target.value as SystemMessageKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(SYSTEM_MESSAGE_META) as SystemMessageKind[]).map((k) => (
                          <option key={k} value={k}>
                            {SYSTEM_MESSAGE_META[k].emoji} {SYSTEM_MESSAGE_META[k].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={m.tone}
                        onChange={(e) => update(m.id, { tone: e.target.value as CopyTone })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(TONE_META) as CopyTone[]).map((t) => (
                          <option key={t} value={t}>
                            {TONE_META[t].emoji} {TONE_META[t].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={m.trigger}
                        onChange={(e) => update(m.id, { trigger: e.target.value })}
                        placeholder="Trigger (ex: Suppression projet)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.tip}</div>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => update(m.id, { title: e.target.value })}
                      placeholder="Titre (ex: Supprimer ce projet ?)"
                      className="w-full h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />
                    <textarea
                      value={m.body}
                      onChange={(e) => update(m.id, { body: e.target.value })}
                      placeholder="Corps du message"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={m.primaryLabel}
                        onChange={(e) => update(m.id, { primaryLabel: e.target.value })}
                        placeholder={isDestructive ? "CTA destructif" : "CTA principal"}
                        className={`h-7 px-2 text-xs rounded border bg-card ${
                          isDestructive ? "border-red-500/30" : "border-border"
                        }`}
                      />
                      <input
                        type="text"
                        value={m.secondaryLabel}
                        onChange={(e) => update(m.id, { secondaryLabel: e.target.value })}
                        placeholder="CTA secondaire (ex: Annuler)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                    </div>
                    {(m.title || m.body) && (
                      <div
                        className={`rounded-lg p-3 border ${
                          m.kind === "confirm-destructive"
                            ? "bg-red-500/5 border-red-500/30"
                            : m.kind === "banner-warn"
                              ? "bg-amber-500/5 border-amber-500/30"
                              : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span>{meta.emoji}</span>
                          <div className="flex-1 space-y-1">
                            {m.title && <div className="font-semibold text-sm">{m.title}</div>}
                            {m.body && <div className="text-xs text-muted">{m.body}</div>}
                            {(m.primaryLabel || m.secondaryLabel) && (
                              <div className="flex items-center gap-2 pt-1">
                                {m.primaryLabel && (
                                  <span
                                    className={`text-[11px] px-3 py-1 rounded font-medium ${
                                      isDestructive
                                        ? "bg-red-500 text-white"
                                        : "bg-accent text-white"
                                    }`}
                                  >
                                    {m.primaryLabel}
                                  </span>
                                )}
                                {m.secondaryLabel && (
                                  <span className="text-[11px] px-3 py-1 rounded border border-border">
                                    {m.secondaryLabel}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      type="text"
                      value={m.notes}
                      onChange={(e) => update(m.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {SYSTEM_MESSAGE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {SYSTEM_MESSAGE_META[p.kind].emoji} {p.trigger}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Message personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
