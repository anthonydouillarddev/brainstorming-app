"use client";

import type { ReactElement } from "react";
import type { Project } from "@/lib/types";
import type { InfoNavState, SitemapScreen } from "../state";
import { getChildren } from "../state";

function renderNode(
  state: InfoNavState,
  parentId: string | null,
  depth: number,
  out: ReactElement[]
): void {
  const children = getChildren(state, parentId);
  for (const screen of children) {
    out.push(
      <div
        key={screen.id}
        className="flex items-start gap-2 text-xs leading-snug"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span>{screen.emoji ?? "📄"}</span>
        <span className="font-medium">{screen.title}</span>
        <span className="font-mono text-[10px] text-gray-500">/{screen.slug}</span>
        {screen.isPrimaryNav && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-gray-900 text-white font-semibold">
            NAV
          </span>
        )}
      </div>
    );
    renderNode(state, screen.id, depth + 1, out);
  }
}

export default function PrintableSitemapCard({
  state,
  project,
}: {
  state: InfoNavState;
  project: Project;
}) {
  function handlePrint() {
    window.print();
  }

  const nodes: ReactElement[] = [];
  renderNode(state, null, 0, nodes);
  const navScreens: SitemapScreen[] = state.navItems
    .map((id) => state.screens.find((s) => s.id === id))
    .filter((s): s is SitemapScreen => !!s);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Sitemap imprimable (A4)</h3>
          <p className="text-xs text-muted">
            Arborescence + nav principale + URLs. Clic « Imprimer » → « Enregistrer en PDF ».
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-sitemap-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-5 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
            Architecture &amp; navigation
          </p>
        </header>

        {state.navPattern && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Pattern de navigation
            </h2>
            <div className="text-sm font-semibold">{state.navPattern}</div>
          </section>
        )}

        {navScreens.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Nav principale
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {navScreens.map((s, i) => (
                <span
                  key={s.id}
                  className={`px-2 py-1 rounded border ${
                    i === 0 ? "bg-gray-900 text-white border-gray-900" : "border-gray-300"
                  }`}
                >
                  {s.emoji ?? "📄"} {s.title}
                </span>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            Sitemap complet ({state.screens.length} écran
            {state.screens.length > 1 ? "s" : ""})
          </h2>
          <div className="space-y-0.5">
            {nodes.length > 0 ? (
              nodes
            ) : (
              <div className="text-xs text-gray-400 italic">Aucun écran défini.</div>
            )}
          </div>
        </section>

        {state.entities.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Entités métier
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {state.entities.map((e) => (
                <span
                  key={e.id}
                  className="px-2 py-1 rounded border border-gray-300 font-mono"
                >
                  {e.name || "?"}
                </span>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 3 Info &amp; Navigation
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-sitemap-card,
          .printable-sitemap-card * {
            visibility: visible;
          }
          .printable-sitemap-card {
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
