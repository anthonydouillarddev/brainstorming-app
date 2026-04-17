"use client";

import type { Project } from "@/lib/types";
import type { DesignSystemState } from "../state";
import { COMPONENTS_CATALOG } from "../components-catalog";

export default function PrintableDsCard({
  state,
  project,
}: {
  state: DesignSystemState;
  project: Project;
}) {
  const mustComponents = state.components.filter((c) => c.priority === "must");
  const topTokens = state.semanticTokens.slice(0, 8);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Design System Card (A4)</h3>
          <p className="text-xs text-muted">
            Tokens + MUST components + patterns + density. À coller au-dessus du bureau.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-ds-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-5 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
            Design System Card
          </p>
        </header>

        {topTokens.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Semantic tokens (top {topTokens.length})
            </h2>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {topTokens.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ background: t.primitiveHex }}
                  />
                  <span className="font-mono text-xs">{t.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {mustComponents.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Composants MUST ({mustComponents.length})
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {mustComponents.map((c) => {
                const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
                return (
                  <span
                    key={c.slug}
                    className="px-2 py-1 rounded border border-gray-300 bg-gray-50"
                  >
                    {def?.emoji} {def?.name}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {state.patterns.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Patterns activés
            </h2>
            <div className="text-xs">
              {state.patterns.length} / 8 types d&apos;état : empty · loading · error · success
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
            Density
          </h2>
          <div className="text-sm capitalize font-semibold">{state.density}</div>
        </section>

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 7 Design System
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-ds-card,
          .printable-ds-card * {
            visibility: visible;
          }
          .printable-ds-card {
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
            padding: 20mm;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}
