"use client";

import { useState } from "react";
import type { MenuOption, PrinciplesState } from "../state";
import { makeId } from "../state";
import { validateMenus } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function HickMenuAnalyzerBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.menus.length > 0);
  const issues = validateMenus(state);
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.menus.length > 0 && !hasWarn;

  function addMenu() {
    const next: MenuOption = { id: makeId("menu"), menuName: "", items: [] };
    onChange({ menus: [...state.menus, next] });
  }

  function update(id: string, patch: Partial<MenuOption>) {
    onChange({
      menus: state.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  }

  function updateItems(id: string, value: string) {
    const items = value
      .split("\n")
      .map((v) => v.trim())
      .filter(Boolean);
    update(id, { items });
  }

  function remove(id: string) {
    onChange({ menus: state.menus.filter((m) => m.id !== id) });
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
          📋 Hick menu analyzer
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.menus.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Hick&apos;s Law.</strong> Plus d&apos;options =
            plus de temps pour décider. Au-delà de 7 items dans un menu plat, regroupe en
            sections ou applique progressive disclosure.{" "}
            <strong className="text-foreground">Nuance</strong> : Amazon a 30+ liens qui marchent,
            parce qu&apos;on <em>lit</em>, on ne <em>mémorise</em> pas. Applique à la décision,
            pas à la navigation.
          </div>

          {state.menus.length > 0 && (
            <div className="space-y-3">
              {state.menus.map((m) => {
                const count = m.items.length;
                const overLimit = count > 7;
                return (
                  <div
                    key={m.id}
                    className={`border rounded-xl p-3 space-y-2 transition ${
                      overLimit
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-border bg-card/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={m.menuName}
                        onChange={(e) => update(m.id, { menuName: e.target.value })}
                        placeholder="Nom du menu (ex: Sidebar principale)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                      />
                      <span
                        className={`text-[11px] font-mono px-2 py-1 rounded ${
                          overLimit
                            ? "bg-amber-500/20 text-amber-600"
                            : "bg-green-500/20 text-green-600"
                        }`}
                      >
                        {count} / 7
                      </span>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      value={m.items.join("\n")}
                      onChange={(e) => updateItems(m.id, e.target.value)}
                      placeholder="Un item par ligne"
                      rows={4}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card font-mono"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addMenu}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Analyser un menu
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
