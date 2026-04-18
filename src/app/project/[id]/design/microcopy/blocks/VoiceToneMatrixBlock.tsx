"use client";

import { useState } from "react";
import type { CopyTone, MicrocopyState, VoiceContext, VoiceToneEntry } from "../state";
import { TONE_META, VOICE_CONTEXT_META, makeId } from "../state";
import { VOICE_TONE_PRESETS } from "../microcopy-library";
import { validateVoiceTones } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function VoiceToneMatrixBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.voiceTones.length > 0);
  const issues = validateVoiceTones(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.voiceTones.length >= 3 && !hasError;

  function addPreset(preset: (typeof VOICE_TONE_PRESETS)[number]) {
    const next: VoiceToneEntry = { id: makeId("voi"), ...preset };
    onChange({ voiceTones: [...state.voiceTones, next] });
  }

  function loadAllPresets() {
    const next = VOICE_TONE_PRESETS.map((p) => ({ ...p, id: makeId("voi") }));
    onChange({ voiceTones: next });
  }

  function addCustom() {
    const next: VoiceToneEntry = {
      id: makeId("voi"),
      context: "idle",
      tone: "neutral",
      principle: "",
      doExample: "",
      dontExample: "",
      notes: "",
    };
    onChange({ voiceTones: [...state.voiceTones, next] });
  }

  function update(id: string, patch: Partial<VoiceToneEntry>) {
    onChange({
      voiceTones: state.voiceTones.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    });
  }

  function remove(id: string) {
    onChange({ voiceTones: state.voiceTones.filter((v) => v.id !== id) });
  }

  const coveredContexts = new Set(state.voiceTones.map((v) => v.context));
  const uncoveredPresets = VOICE_TONE_PRESETS.filter(
    (p) => !coveredContexts.has(p.context)
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎭 Voice &amp; Tone matrix
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.voiceTones.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">NN/G &amp; Mailchimp.</strong> Le ton varie selon
            le contexte. Même marque, mais <em>assertif</em> en onboarding, <em>calme</em> en
            erreur, <em>formel</em> en billing. Chaque ligne = un contexte avec son ton, son
            principe et des exemples concrets.
          </div>

          {state.voiceTones.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {VOICE_TONE_PRESETS.length} contextes par défaut
            </button>
          )}

          {state.voiceTones.length > 0 && (
            <div className="space-y-2">
              {state.voiceTones.map((v) => {
                const cmeta = VOICE_CONTEXT_META[v.context];
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={v.context}
                        onChange={(e) =>
                          update(v.id, { context: e.target.value as VoiceContext })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(VOICE_CONTEXT_META) as VoiceContext[]).map((c) => (
                          <option key={c} value={c}>
                            {VOICE_CONTEXT_META[c].emoji} {VOICE_CONTEXT_META[c].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={v.tone}
                        onChange={(e) => update(v.id, { tone: e.target.value as CopyTone })}
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
                        value={v.principle}
                        onChange={(e) => update(v.id, { principle: e.target.value })}
                        placeholder="Principe (ex: Rassurer et guider)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <button
                        onClick={() => remove(v.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {cmeta.hint}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-green-600 font-semibold">
                          ✅ À faire
                        </label>
                        <textarea
                          value={v.doExample}
                          onChange={(e) => update(v.id, { doExample: e.target.value })}
                          placeholder="Exemple copy DO"
                          rows={2}
                          className="w-full px-2 py-1.5 text-xs rounded border border-green-500/30 bg-green-500/5 resize-y"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-red-600 font-semibold">
                          🚫 À éviter
                        </label>
                        <textarea
                          value={v.dontExample}
                          onChange={(e) => update(v.id, { dontExample: e.target.value })}
                          placeholder="Exemple copy DON'T"
                          rows={2}
                          className="w-full px-2 py-1.5 text-xs rounded border border-red-500/30 bg-red-500/5 resize-y"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={v.notes}
                      onChange={(e) => update(v.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {uncoveredPresets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Contextes non couverts :</div>
              <div className="flex flex-wrap gap-1">
                {uncoveredPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {VOICE_CONTEXT_META[p.context].emoji}{" "}
                    {VOICE_CONTEXT_META[p.context].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Contexte personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
