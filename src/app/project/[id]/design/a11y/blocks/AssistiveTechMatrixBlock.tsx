"use client";

import { useState } from "react";
import type {
  A11yState,
  AssistiveTech,
  AssistiveTechEntry,
  Browser,
  CheckStatus,
} from "../state";
import { AT_META, BROWSER_META, CHECK_STATUS_META, makeId } from "../state";
import { AT_COMBOS } from "../a11y-library";
import { validateAssistiveTech } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function AssistiveTechMatrixBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.assistiveTech.length > 0);
  const issues = validateAssistiveTech(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const tested = state.assistiveTech.filter((a) => a.tested).length;
  const ok = tested >= 3 && !hasError;

  function loadRequiredCombos() {
    const next: AssistiveTechEntry[] = AT_COMBOS.filter(
      (c) => c.priority === "required"
    ).map((c) => ({
      id: makeId("at"),
      at: c.at,
      browser: c.browser,
      version: "",
      status: "unknown",
      tested: false,
      notes: c.reason,
    }));
    onChange({ assistiveTech: next });
  }

  function addCombo(combo: (typeof AT_COMBOS)[number]) {
    const next: AssistiveTechEntry = {
      id: makeId("at"),
      at: combo.at,
      browser: combo.browser,
      version: "",
      status: "unknown",
      tested: false,
      notes: combo.reason,
    };
    onChange({ assistiveTech: [...state.assistiveTech, next] });
  }

  function addCustom() {
    const next: AssistiveTechEntry = {
      id: makeId("at"),
      at: "nvda",
      browser: "chrome",
      version: "",
      status: "unknown",
      tested: false,
      notes: "",
    };
    onChange({ assistiveTech: [...state.assistiveTech, next] });
  }

  function update(id: string, patch: Partial<AssistiveTechEntry>) {
    onChange({
      assistiveTech: state.assistiveTech.map((a) =>
        a.id === id ? { ...a, ...patch } : a
      ),
    });
  }

  function remove(id: string) {
    onChange({ assistiveTech: state.assistiveTech.filter((a) => a.id !== id) });
  }

  const existingKeys = new Set(
    state.assistiveTech.map((a) => `${a.at}-${a.browser}`)
  );
  const availableCombos = AT_COMBOS.filter(
    (c) => !existingKeys.has(`${c.at}-${c.browser}`)
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
          🔊 Assistive Tech Matrix
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({tested}/{state.assistiveTech.length} testés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WebAIM Screen Reader Survey 2024.</strong> NVDA +
            Chrome = 36% · JAWS + Chrome = 25% · VoiceOver macOS + Safari = 10%. Tester au moins
            3 combinaisons couvre 80% des users screen reader.
          </div>

          {state.assistiveTech.length === 0 && (
            <button
              onClick={loadRequiredCombos}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {AT_COMBOS.filter((c) => c.priority === "required").length} combos
              requis
            </button>
          )}

          {state.assistiveTech.length > 0 && (
            <div className="space-y-1.5">
              {state.assistiveTech.map((a) => {
                const atMeta = AT_META[a.at];
                const brMeta = BROWSER_META[a.browser];
                const smeta = CHECK_STATUS_META[a.status];
                return (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-lg border ${smeta.color} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={a.at}
                        onChange={(e) =>
                          update(a.id, { at: e.target.value as AssistiveTech })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(AT_META) as AssistiveTech[]).map((t) => (
                          <option key={t} value={t}>
                            {AT_META[t].label}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted text-xs">+</span>
                      <select
                        value={a.browser}
                        onChange={(e) =>
                          update(a.id, { browser: e.target.value as Browser })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(BROWSER_META) as Browser[]).map((b) => (
                          <option key={b} value={b}>
                            {BROWSER_META[b].emoji} {BROWSER_META[b].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={a.version}
                        onChange={(e) => update(a.id, { version: e.target.value })}
                        placeholder="Version (ex: NVDA 2024.4)"
                        className="w-40 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                      />
                      <select
                        value={a.status}
                        onChange={(e) =>
                          update(a.id, { status: e.target.value as CheckStatus })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(CHECK_STATUS_META) as CheckStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {CHECK_STATUS_META[s].emoji} {CHECK_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a.tested}
                          onChange={(e) => update(a.id, { tested: e.target.checked })}
                          className="accent-accent"
                        />
                        Testé
                      </label>
                      <button
                        onClick={() => remove(a.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">
                      {atMeta.platform} · {brMeta.label} · {atMeta.usage}
                    </div>
                    <input
                      type="text"
                      value={a.notes}
                      onChange={(e) => update(a.id, { notes: e.target.value })}
                      placeholder="Notes (bugs trouvés, observations)"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {availableCombos.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Combos recommandés :</div>
              <div className="flex flex-wrap gap-1">
                {availableCombos.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => addCombo(c)}
                    className={`text-[11px] px-2 py-1 rounded border transition ${
                      c.priority === "required"
                        ? "border-accent/40 hover:bg-accent/10"
                        : "border-border hover:bg-accent/10"
                    }`}
                  >
                    + {AT_META[c.at].label} × {BROWSER_META[c.browser].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Combo personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
