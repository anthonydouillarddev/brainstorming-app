"use client";

import { useState } from "react";
import type {
  CopyTone,
  CtaEntry,
  CtaVariant,
  MicrocopyState,
} from "../state";
import { CTA_VARIANT_META, TONE_META, makeId } from "../state";
import { CTA_PRESETS } from "../microcopy-library";
import { validateCtas } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function CtaLibraryBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.ctas.length > 0);
  const issues = validateCtas(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.ctas.length >= 4 && !hasError;

  function addPreset(preset: (typeof CTA_PRESETS)[number]) {
    const next: CtaEntry = { id: makeId("cta"), ...preset };
    onChange({ ctas: [...state.ctas, next] });
  }

  function addCustom() {
    const next: CtaEntry = {
      id: makeId("cta"),
      context: "",
      label: "",
      variant: "primary",
      tone: "neutral",
      loadingLabel: "",
      successLabel: "",
      notes: "",
    };
    onChange({ ctas: [...state.ctas, next] });
  }

  function update(id: string, patch: Partial<CtaEntry>) {
    onChange({
      ctas: state.ctas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function remove(id: string) {
    onChange({ ctas: state.ctas.filter((c) => c.id !== id) });
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
          🎯 CTA library
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.ctas.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Mailchimp / Shopify.</strong> Un CTA = verbe
            d&apos;action + objet précis. Évite les « OK », « Valider », « Continuer ». Le label
            dit ce qui va se passer après le clic.
          </div>

          {state.ctas.length > 0 && (
            <div className="space-y-2">
              {state.ctas.map((c) => {
                const vmeta = CTA_VARIANT_META[c.variant];
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={c.variant}
                        onChange={(e) => update(c.id, { variant: e.target.value as CtaVariant })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(CTA_VARIANT_META) as CtaVariant[]).map((v) => (
                          <option key={v} value={v}>
                            {CTA_VARIANT_META[v].emoji} {CTA_VARIANT_META[v].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={c.tone}
                        onChange={(e) => update(c.id, { tone: e.target.value as CopyTone })}
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
                        value={c.context}
                        onChange={(e) => update(c.id, { context: e.target.value })}
                        placeholder="Contexte (ex: Submit form login)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(c.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {vmeta.use}</div>
                    <input
                      type="text"
                      value={c.label}
                      onChange={(e) => update(c.id, { label: e.target.value })}
                      placeholder="Label du bouton (ex: Se connecter)"
                      className="w-full h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={c.loadingLabel}
                        onChange={(e) => update(c.id, { loadingLabel: e.target.value })}
                        placeholder="Label loading (ex: Connexion…)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
                      <input
                        type="text"
                        value={c.successLabel}
                        onChange={(e) => update(c.id, { successLabel: e.target.value })}
                        placeholder="Label success (ex: Connecté)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
                    </div>
                    {c.label && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted">Preview :</span>
                        <span
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            c.variant === "primary"
                              ? "bg-accent text-white"
                              : c.variant === "destructive"
                                ? "bg-red-500 text-white"
                                : c.variant === "ghost"
                                  ? "bg-transparent border border-border"
                                  : c.variant === "link"
                                    ? "text-accent underline"
                                    : "bg-card border border-border"
                          }`}
                        >
                          {c.label}
                        </span>
                        {c.loadingLabel && (
                          <span className="text-[10px] text-muted">
                            (loading: {c.loadingLabel})
                          </span>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      value={c.notes}
                      onChange={(e) => update(c.id, { notes: e.target.value })}
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
              {CTA_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {CTA_VARIANT_META[p.variant].emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + CTA personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
