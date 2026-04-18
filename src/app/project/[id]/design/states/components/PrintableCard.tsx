"use client";

import type { Project } from "@/lib/types";
import type { StatesState } from "../state";
import {
  EMPTY_KIND_META,
  ERROR_CATEGORY_META,
  LOADING_KIND_META,
  SLO_STATUS_META,
  SUCCESS_KIND_META,
  TOAST_KIND_META,
  computeSloStatus,
} from "../state";

export default function PrintableStatesCard({
  state,
  project,
}: {
  state: StatesState;
  project: Project;
}) {
  const topScreens = state.screens.slice(0, 6);
  const topLoading = state.loadingPatterns.slice(0, 4);
  const topEmpty = state.emptyStates.slice(0, 3);
  const topErrors = state.errorPatterns.slice(0, 4);
  const topToasts = state.toasts.slice(0, 4);
  const topSuccess = state.successPatterns.slice(0, 3);
  const topMachines = state.stateMachines.slice(0, 2);
  const topLatency = state.latencyLogs.slice(0, 3);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ États Card (A4)</h3>
          <p className="text-xs text-muted">
            Synthèse 1 page : écrans, loading, empty, error, toasts, machines. À coller au-dessus
            du bureau.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-states-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-8 space-y-4 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-3">
          <h1 className="text-xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
            États · Loading · Empty · Error · Toasts · Machines
          </p>
        </header>

        {topScreens.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              Écrans ({state.screens.length})
            </h2>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {topScreens.map((s) => (
                <span
                  key={s.id}
                  className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-50"
                >
                  {s.title || "(sans titre)"}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          {topLoading.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                ⏳ Loading
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topLoading.map((l) => (
                  <li key={l.id} className="truncate">
                    {LOADING_KIND_META[l.kind].emoji} {l.trigger} ·{" "}
                    <span className="font-mono text-gray-500">{l.minDurationMs}ms</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topEmpty.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🌱 Empty
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topEmpty.map((e) => (
                  <li key={e.id} className="truncate">
                    {EMPTY_KIND_META[e.kind].emoji} {e.headline || e.context}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topErrors.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                ⚠️ Errors
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topErrors.map((err) => (
                  <li key={err.id} className="truncate">
                    {ERROR_CATEGORY_META[err.category].emoji} {err.trigger || err.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topToasts.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🍞 Toasts
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topToasts.map((t) => (
                  <li key={t.id} className="truncate">
                    {TOAST_KIND_META[t.kind].emoji} {t.label} ·{" "}
                    <span className="font-mono text-gray-500">
                      {t.durationMs === 0 ? "sticky" : `${t.durationMs}ms`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topSuccess.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🎉 Success
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topSuccess.map((s) => (
                  <li key={s.id} className="truncate">
                    {SUCCESS_KIND_META[s.kind].emoji} {s.trigger}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {topMachines.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🔀 Machines
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topMachines.map((m) => (
                  <li key={m.id} className="truncate">
                    {m.screenTitle || "(sans titre)"} · {m.states.length} états,{" "}
                    {m.transitions.length} transitions
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {topLatency.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              📏 Latency SLO (p95 vs Doherty)
            </h2>
            <div className="space-y-1 text-[10px]">
              {topLatency.map((l) => {
                const status = computeSloStatus(l);
                const meta = SLO_STATUS_META[status];
                return (
                  <div key={l.id} className="flex items-center gap-2">
                    <span>{meta.emoji}</span>
                    <span className="flex-1 truncate">{l.trigger}</span>
                    <span className="font-mono text-gray-600">
                      p95 {l.p95Ms}ms / SLO {l.sloTargetMs}ms
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center mt-auto">
          Mindeck · Chap. 8 États
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-states-card,
          .printable-states-card * {
            visibility: visible;
          }
          .printable-states-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            height: 297mm;
            max-width: none;
            aspect-ratio: auto;
            border: none;
            box-shadow: none;
            border-radius: 0;
            background: white;
            padding: 18mm;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
