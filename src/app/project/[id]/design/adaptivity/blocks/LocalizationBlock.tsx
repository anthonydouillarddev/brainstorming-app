"use client";

import { useState } from "react";
import type {
  AdaptivityState,
  LocalizationEntry,
  TextDirection,
} from "../state";
import { DIRECTION_META, makeId } from "../state";
import { LOCALE_PRESETS } from "../adaptivity-library";
import { validateLocalizations } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function LocalizationBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.localizations.length > 0);
  const issues = validateLocalizations(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const enabled = state.localizations.filter((l) => l.enabled).length;
  const ok = enabled >= 1 && !hasError;

  function addPreset(preset: (typeof LOCALE_PRESETS)[number]) {
    onChange({
      localizations: [...state.localizations, { ...preset, id: makeId("loc") }],
    });
  }

  function addCustom() {
    const next: LocalizationEntry = {
      id: makeId("loc"),
      locale: "",
      label: "",
      direction: "ltr",
      dateFormat: "",
      numberFormat: "",
      currencyFormat: "",
      enabled: false,
      notes: "",
    };
    onChange({ localizations: [...state.localizations, next] });
  }

  function update(id: string, patch: Partial<LocalizationEntry>) {
    onChange({
      localizations: state.localizations.map((l) =>
        l.id === id ? { ...l, ...patch } : l
      ),
    });
  }

  function remove(id: string) {
    onChange({
      localizations: state.localizations.filter((l) => l.id !== id),
    });
  }

  const existing = new Set(state.localizations.map((l) => l.locale));
  const available = LOCALE_PRESETS.filter((p) => !existing.has(p.locale));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🌍 Localisation (i18n + RTL)
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({enabled}/{state.localizations.length} actives)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">BCP 47 + Unicode CLDR.</strong> Locales actives,
            direction (LTR/RTL), formats date/number/currency. RTL (ar, he) demande{" "}
            <code>dir=&quot;rtl&quot;</code> et inversion des paddings/margins/icônes
            directionnelles.
          </div>

          {state.localizations.length > 0 && (
            <div className="space-y-2">
              {state.localizations.map((l) => {
                const dmeta = DIRECTION_META[l.direction];
                return (
                  <div
                    key={l.id}
                    className={`p-3 rounded-lg border space-y-2 ${
                      l.enabled
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-card opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={l.locale}
                        onChange={(e) => update(l.id, { locale: e.target.value })}
                        placeholder="fr-FR"
                        className="w-24 h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                      />
                      <input
                        type="text"
                        value={l.label}
                        onChange={(e) => update(l.id, { label: e.target.value })}
                        placeholder="Label (ex: Français)"
                        className="flex-1 min-w-[140px] h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <select
                        value={l.direction}
                        onChange={(e) =>
                          update(l.id, {
                            direction: e.target.value as TextDirection,
                          })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(DIRECTION_META) as TextDirection[]).map((d) => (
                          <option key={d} value={d}>
                            {DIRECTION_META[d].emoji} {DIRECTION_META[d].label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={l.enabled}
                          onChange={(e) =>
                            update(l.id, { enabled: e.target.checked })
                          }
                          className="accent-accent"
                        />
                        Activé
                      </label>
                      <button
                        onClick={() => remove(l.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {dmeta.attr}</div>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Date</span>
                        <input
                          type="text"
                          value={l.dateFormat}
                          onChange={(e) => update(l.id, { dateFormat: e.target.value })}
                          placeholder="DD/MM/YYYY"
                          className="h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Number</span>
                        <input
                          type="text"
                          value={l.numberFormat}
                          onChange={(e) => update(l.id, { numberFormat: e.target.value })}
                          placeholder="1 234,56"
                          className="h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Currency</span>
                        <input
                          type="text"
                          value={l.currencyFormat}
                          onChange={(e) =>
                            update(l.id, { currencyFormat: e.target.value })
                          }
                          placeholder="1 234,56 €"
                          className="h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                        />
                      </label>
                    </div>
                    {/* RTL preview */}
                    {l.direction === "rtl" && (
                      <div
                        dir="rtl"
                        className="bg-card/40 border border-dashed border-border rounded-lg p-2 text-xs text-right"
                      >
                        ⬅️ Aperçu RTL · bouton principal en fin de ligne
                      </div>
                    )}
                    <input
                      type="text"
                      value={l.notes}
                      onChange={(e) => update(l.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {available.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Presets :</div>
              <div className="flex flex-wrap gap-1">
                {available.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {DIRECTION_META[p.direction].emoji} {p.locale}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Locale personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
