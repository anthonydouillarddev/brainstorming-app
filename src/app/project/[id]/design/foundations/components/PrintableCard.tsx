"use client";

import type { Project } from "@/lib/types";
import type { FoundationsState } from "../state";

// Carte d'identité A4 imprimable — positioning + persona + 3 principes + aha.
// Utilise CSS @media print pour rendu navigateur (zéro lib externe).
export default function PrintableCard({
  state,
  project,
}: {
  state: FoundationsState;
  project: Project;
}) {
  const primary =
    state.personas.find((p) => p.id === state.primaryPersonaId) ?? state.personas[0];
  const top3Principles = state.designPrinciples
    .filter((p) => p.principle.includes(">"))
    .slice(0, 3);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Carte d&apos;identité produit (A4)</h3>
          <p className="text-xs text-muted">
            Aperçu ci-dessous. Clic sur &laquo; Imprimer &raquo; → dialogue navigateur → &laquo;
            Enregistrer en PDF &raquo; ou imprimer directement.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      {/* Carte — s'affiche normale à l'écran, pleine page en print */}
      <div className="printable-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-6 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-gray-600 mt-2">{project.description}</p>
          )}
          {project.type && (
            <div className="mt-3">
              <span className="inline-block text-[10px] uppercase tracking-wider bg-gray-900 text-white px-2 py-1 rounded">
                {project.type}
              </span>
            </div>
          )}
        </header>

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
            Positionnement
          </h2>
          <p className="text-base font-medium leading-snug">
            {state.positioningStatement || "À définir dans le bloc Positionnement Dunford."}
          </p>
        </section>

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
            Job-to-be-Done
          </h2>
          <p className="text-sm leading-snug italic">
            {state.jtbdCore || "À définir dans le bloc JTBD."}
          </p>
        </section>

        {primary && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Persona principal
            </h2>
            <div className="flex items-start gap-3">
              <div className="text-3xl" aria-hidden>
                {primary.avatarEmoji}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base">
                  {primary.name || "(sans nom)"}
                  {primary.ageRange && (
                    <span className="text-gray-500 font-normal text-sm"> · {primary.ageRange}</span>
                  )}
                </div>
                {primary.context && (
                  <p className="text-xs text-gray-600 leading-relaxed mt-0.5">{primary.context}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {state.ahaMomentEvent && state.ahaMomentThreshold && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Aha moment (activation)
            </h2>
            <p className="text-sm">
              User a fait <strong>{state.ahaMomentEvent}</strong> {state.ahaMomentThreshold}
            </p>
          </section>
        )}

        {top3Principles.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              3 principes design non négociables
            </h2>
            <ol className="space-y-1.5">
              {top3Principles.map((p, i) => (
                <li key={p.id} className="flex items-baseline gap-2 text-sm">
                  <span className="font-mono text-gray-400">#{i + 1}</span>
                  <div>
                    <div className="font-semibold">{p.principle}</div>
                    {p.rationale && (
                      <div className="text-xs text-gray-500 italic">— {p.rationale}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <footer className="pt-4 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 1 Fondations · À épingler au-dessus du bureau
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-card,
          .printable-card * {
            visibility: visible;
          }
          .printable-card {
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
