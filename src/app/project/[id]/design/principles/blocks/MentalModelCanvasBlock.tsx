"use client";

import { useState } from "react";
import type { MentalModel, PrinciplesState } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function MentalModelCanvasBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const mm = state.mentalModel;
  const [expanded, setExpanded] = useState(
    !!mm.designModel.trim() || !!mm.systemImage.trim() || !!mm.userModel.trim()
  );
  const ok =
    mm.designModel.trim().length > 10 &&
    mm.systemImage.trim().length > 10 &&
    mm.userModel.trim().length > 10;

  function update(patch: Partial<MentalModel>) {
    onChange({ mentalModel: { ...mm, ...patch } });
  }

  function addGulf(text: string) {
    const trimmed = text.trim();
    if (!trimmed || mm.gulfs.includes(trimmed)) return;
    update({ gulfs: [...mm.gulfs, trimmed] });
  }

  function removeGulf(i: number) {
    update({ gulfs: mm.gulfs.filter((_, idx) => idx !== i) });
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
          🧠 Mental Model Canvas
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Norman.</strong> 3 modèles qui devraient
            s&apos;aligner : <em>Design model</em> (ce que tu as en tête), <em>System image</em>{" "}
            (ce que l&apos;UI montre), <em>User model</em> (ce que l&apos;user en déduit). Les
            écarts = <strong>gulfs</strong> = bugs UX.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-accent">
                🧑‍💻 Design model (toi)
              </label>
              <div className="text-[10px] text-muted">
                Ce que tu as en tête quand tu conçois.
              </div>
              <textarea
                value={mm.designModel}
                onChange={(e) => update({ designModel: e.target.value })}
                placeholder="Ex: L'user gère plusieurs projets en parallèle, le dashboard doit montrer tous les projets en un coup d'œil"
                rows={5}
                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-amber-600">
                🖥️ System image (UI)
              </label>
              <div className="text-[10px] text-muted">
                Ce que l&apos;interface communique.
              </div>
              <textarea
                value={mm.systemImage}
                onChange={(e) => update({ systemImage: e.target.value })}
                placeholder="Ex: Sidebar liste les projets, cockpit central montre la progression, tabs sous-sections"
                rows={5}
                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-green-600">
                👤 User model (user)
              </label>
              <div className="text-[10px] text-muted">
                Ce que l&apos;user en déduit (interview / test).
              </div>
              <textarea
                value={mm.userModel}
                onChange={(e) => update({ userModel: e.target.value })}
                placeholder="Ex: « Je vois une liste en haut et je clique dessus, mais je ne comprends pas la différence entre sidebar et cockpit »"
                rows={5}
                className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold">Gulfs identifiés (écarts)</label>
            <div className="space-y-1">
              {mm.gulfs.map((g, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="text-red-500 shrink-0">⚠</span>
                  <input
                    type="text"
                    value={g}
                    onChange={(e) =>
                      update({
                        gulfs: mm.gulfs.map((x, idx) => (idx === i ? e.target.value : x)),
                      })
                    }
                    className="h-8 px-2 text-xs rounded border border-border bg-card flex-1"
                  />
                  <button
                    onClick={() => removeGulf(i)}
                    className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder="Nouveau gulf (Enter) : ex « User ne comprend pas la différence sidebar/cockpit »"
                className="w-full h-8 px-2 text-xs rounded border border-dashed border-border bg-card"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target as HTMLInputElement;
                    addGulf(input.value);
                    input.value = "";
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
