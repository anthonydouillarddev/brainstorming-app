"use client";

import { useMemo, useState } from "react";
import type { ScreenStateEntry, StatePriority, StatesState } from "../state";
import { makeId } from "../state";
import { validateScreens } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

interface InfoNavScreen {
  id: string;
  title: string;
}

function parseInfoNavScreens(raw: string | undefined): InfoNavScreen[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    const list = Array.isArray(data?.screens) ? data.screens : [];
    return list
      .filter((s: { id?: unknown; title?: unknown }) => typeof s?.id === "string" && typeof s?.title === "string")
      .map((s: { id: string; title: string }) => ({ id: s.id, title: s.title }));
  } catch {
    return [];
  }
}

const PRIORITIES: { key: StatePriority; label: string; color: string }[] = [
  { key: "must", label: "MUST", color: "bg-red-500/10 text-red-600 border-red-500/30" },
  { key: "should", label: "SHOULD", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
  { key: "nice", label: "NICE", color: "bg-green-500/10 text-green-600 border-green-500/30" },
];

export default function ScreenInventoryBlock({
  state,
  onChange,
  infoNavContent,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
  infoNavContent: string | undefined;
}) {
  const [expanded, setExpanded] = useState(state.screens.length > 0);
  const issues = validateScreens(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.screens.length >= 3 && !hasError;

  const infoNavScreens = useMemo(() => parseInfoNavScreens(infoNavContent), [infoNavContent]);
  const linkedIds = new Set(state.screens.map((s) => s.linkedScreenId).filter(Boolean));

  function addCustom() {
    const next: ScreenStateEntry = {
      id: makeId("scr"),
      title: "",
      needsLoading: true,
      needsEmpty: true,
      needsError: true,
      needsSuccess: false,
      priority: "must",
      notes: "",
    };
    onChange({ screens: [...state.screens, next] });
  }

  function importFromInfoNav(screen: InfoNavScreen) {
    const next: ScreenStateEntry = {
      id: makeId("scr"),
      title: screen.title,
      linkedScreenId: screen.id,
      needsLoading: true,
      needsEmpty: true,
      needsError: true,
      needsSuccess: false,
      priority: "must",
      notes: "",
    };
    onChange({ screens: [...state.screens, next] });
  }

  function update(id: string, patch: Partial<ScreenStateEntry>) {
    onChange({
      screens: state.screens.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function remove(id: string) {
    onChange({ screens: state.screens.filter((s) => s.id !== id) });
  }

  const availableInfoNavScreens = infoNavScreens.filter((s) => !linkedIds.has(s.id));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🖥️ Inventaire des écrans
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.screens.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Nielsen — Visibility of system status.</strong> Pour
            chaque écran, liste les états à couvrir (loading / empty / error / success). Les MUST
            doivent en couvrir au moins 2.
          </div>

          {availableInfoNavScreens.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">
                Importer depuis le sitemap (chap. 3 Info &amp; Nav) :
              </div>
              <div className="flex flex-wrap gap-1">
                {availableInfoNavScreens.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => importFromInfoNav(s)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {state.screens.length > 0 && (
            <div className="space-y-2">
              {state.screens.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.title}
                      onChange={(e) => update(s.id, { title: e.target.value })}
                      placeholder="Titre de l'écran (ex: Liste projets)"
                      className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card"
                    />
                    <select
                      value={s.priority}
                      onChange={(e) =>
                        update(s.id, { priority: e.target.value as StatePriority })
                      }
                      className="h-8 px-2 text-xs rounded border border-border bg-card"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(s.id)}
                      className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.needsLoading}
                        onChange={(e) => update(s.id, { needsLoading: e.target.checked })}
                        className="accent-accent"
                      />
                      ⏳ Loading
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.needsEmpty}
                        onChange={(e) => update(s.id, { needsEmpty: e.target.checked })}
                        className="accent-accent"
                      />
                      🌱 Empty
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.needsError}
                        onChange={(e) => update(s.id, { needsError: e.target.checked })}
                        className="accent-accent"
                      />
                      ⚠️ Error
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.needsSuccess}
                        onChange={(e) => update(s.id, { needsSuccess: e.target.checked })}
                        className="accent-accent"
                      />
                      ✅ Success
                    </label>
                    {s.linkedScreenId && (
                      <span className="text-[10px] text-accent ml-auto">🔗 lié au sitemap</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={s.notes}
                    onChange={(e) => update(s.id, { notes: e.target.value })}
                    placeholder="Notes (optionnel)"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter un écran
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
