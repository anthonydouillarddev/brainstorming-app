"use client";

import type { Project } from "@/lib/types";
import type { AdaptivityState } from "../state";
import {
  BREAKPOINT_KIND_META,
  COLOR_SCHEME_META,
  CONTAINER_SIZE_META,
  DENSITY_META,
  DIRECTION_META,
  INPUT_KIND_META,
  VIEWPORT_AXIS_META,
  computeAdaptivityCompleteness,
} from "../state";

export default function PrintableAdaptivityCard({
  state,
  project,
}: {
  state: AdaptivityState;
  project: Project;
}) {
  const score = computeAdaptivityCompleteness(state);
  const enabledLocales = state.localizations.filter((l) => l.enabled);
  const respectedViewport = state.viewportRules.filter((v) => v.respected);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Adaptativité Card (A4)</h3>
          <p className="text-xs text-muted">
            Synthèse 1 page : breakpoints · schemes · densités · input · CQ · locales · viewport.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-adaptivity-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-8 space-y-3 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-3 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {project.official_name || project.name}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
              Adaptativité · Responsive · Dark · i18n · A11y
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{score}%</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500">Couverture</div>
          </div>
        </header>

        {/* Breakpoints */}
        {state.breakpoints.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              📐 Breakpoints ({state.breakpoints.length})
            </h2>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {state.breakpoints.slice(0, 6).map((b) => (
                <span
                  key={b.id}
                  className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-50 font-mono"
                >
                  {BREAKPOINT_KIND_META[b.kind].emoji} {b.name} ({b.minPx}
                  {b.maxPx ? `–${b.maxPx}` : "+"})
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Color schemes */}
          {state.colorSchemes.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🌓 Schemes
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.colorSchemes.map((c) => (
                  <li key={c.id} className="flex items-center gap-1">
                    <span>{c.enabled ? "✅" : "⭕"}</span>
                    <span>{COLOR_SCHEME_META[c.scheme].emoji}</span>
                    <span>{COLOR_SCHEME_META[c.scheme].label}</span>
                    {c.tokensMapped > 0 && (
                      <span className="ml-auto text-gray-500 font-mono">
                        {c.tokensMapped}t
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Densities */}
          {state.densities.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                📄 Densités
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.densities.map((d) => (
                  <li key={d.id} className="flex items-center gap-1">
                    <span>{DENSITY_META[d.density].emoji}</span>
                    <span>{DENSITY_META[d.density].label}</span>
                    <span className="ml-auto text-gray-500 font-mono">
                      {d.baseFontPx}px
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Input */}
          {state.inputModalities.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                👆 Input
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.inputModalities
                  .filter((m) => m.supported)
                  .map((m) => (
                    <li key={m.id} className="flex items-center gap-1">
                      <span>{INPUT_KIND_META[m.input].emoji}</span>
                      <span>{INPUT_KIND_META[m.input].label}</span>
                      <span className="ml-auto text-gray-500 font-mono">
                        {m.minTargetPx}px
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          )}

          {/* Container queries */}
          {state.containerQueries.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                📦 Container queries
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.containerQueries.slice(0, 4).map((cq) => (
                  <li key={cq.id} className="flex items-center gap-1">
                    <span className="truncate flex-1">{cq.component}</span>
                    <span className="text-gray-500 font-mono">
                      {CONTAINER_SIZE_META[cq.threshold].label} · {cq.thresholdPx}px
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Localizations */}
        {enabledLocales.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              🌍 Locales actives ({enabledLocales.length})
            </h2>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {enabledLocales.map((l) => (
                <span
                  key={l.id}
                  className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-50 font-mono"
                >
                  {DIRECTION_META[l.direction].emoji} {l.locale}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Viewport rules */}
        {state.viewportRules.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              📐 Viewport rules ({respectedViewport.length}/{state.viewportRules.length})
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {state.viewportRules.slice(0, 6).map((v) => (
                <li key={v.id} className="flex items-center gap-1">
                  <span>{v.respected ? "✅" : "⚠️"}</span>
                  <span>{VIEWPORT_AXIS_META[v.axis].emoji}</span>
                  <span className="truncate">{VIEWPORT_AXIS_META[v.axis].label}</span>
                  {VIEWPORT_AXIS_META[v.axis].wcag !== "—" && (
                    <span className="ml-auto text-gray-500 font-mono">
                      WCAG {VIEWPORT_AXIS_META[v.axis].wcag}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-2 border-t border-gray-200 text-[8px] text-gray-400 uppercase tracking-wider text-center mt-auto">
          Mindeck · Chap. 11 Adaptativité · Généré le{" "}
          {new Date().toLocaleDateString("fr-FR")}
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-adaptivity-card,
          .printable-adaptivity-card * {
            visibility: visible;
          }
          .printable-adaptivity-card {
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
