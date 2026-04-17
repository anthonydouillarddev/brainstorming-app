"use client";

import type { Project } from "@/lib/types";
import type { PrinciplesState } from "../state";
import { computeNielsenScore } from "../state";
import { UX_LAWS } from "../laws-library";

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
}

export default function PrintablePrinciplesCard({
  state,
  project,
}: {
  state: PrinciplesState;
  project: Project;
}) {
  const score = computeNielsenScore(state);
  const principlesFilled = state.designPrinciples.filter((p) => p.trim()).slice(0, 5);
  const topLaws = state.pinnedLaws
    .filter((p) => p.priority === "must")
    .slice(0, 4)
    .map((p) => UX_LAWS.find((l) => l.slug === p.lawSlug))
    .filter((l): l is (typeof UX_LAWS)[number] => !!l);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Design Principles Card (A4)</h3>
          <p className="text-xs text-muted">
            Principes + heuristiques + lois épinglées. À coller au-dessus du bureau.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-principles-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-5 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
            Design Principles Card
          </p>
        </header>

        {principlesFilled.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Principes non négociables
            </h2>
            <ol className="space-y-2 text-sm">
              {principlesFilled.map((p, i) => (
                <li key={i} className="flex items-baseline gap-2">
                  <span className="font-mono text-gray-400 text-xs w-5">#{i + 1}</span>
                  <span className="font-medium">{p.trim()}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {score.answered > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Score Nielsen
            </h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {score.passed}/{score.total}
              </span>
              <span className="text-xs text-gray-500">
                ({score.answered} heuristiques répondues)
              </span>
            </div>
          </section>
        )}

        {topLaws.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Lois UX critiques (MUST)
            </h2>
            <ul className="space-y-1 text-xs">
              {topLaws.map((l) => (
                <li key={l.slug}>
                  <strong>{stripHtml(l.name)}</strong> — {l.summary}
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 5 Principes d&apos;interaction
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-principles-card,
          .printable-principles-card * {
            visibility: visible;
          }
          .printable-principles-card {
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
