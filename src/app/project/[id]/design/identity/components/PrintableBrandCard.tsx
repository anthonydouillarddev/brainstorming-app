"use client";

import type { Project } from "@/lib/types";
import type { IdentityState } from "../state";
import { ARCHETYPES } from "../archetypes";

export default function PrintableBrandCard({
  state,
  project,
}: {
  state: IdentityState;
  project: Project;
}) {
  const archetype = state.archetypeKey
    ? ARCHETYPES.find((a) => a.key === state.archetypeKey)
    : null;
  const top3Do = state.doWords.slice(0, 5);
  const top3Dont = state.dontWords.slice(0, 5);
  const filledRows = state.toneMatrix
    .filter((r) => r.tone.trim() || r.exampleDo.trim())
    .slice(0, 3);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Brand Card imprimable (A4)</h3>
          <p className="text-xs text-muted">
            Aperçu ci-dessous. Clic sur « Imprimer » → dialogue navigateur → « Enregistrer en PDF »
            ou impression directe.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-brand-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-5 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-3xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">Brand card</p>
        </header>

        {archetype && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Archétype
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-3xl" aria-hidden>
                {archetype.emoji}
              </div>
              <div>
                <div className="font-semibold text-base">{archetype.name}</div>
                <div className="text-xs text-gray-600">{archetype.tagline}</div>
              </div>
            </div>
          </section>
        )}

        {state.brandPromise.trim() && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Brand promise
            </h2>
            <p className="text-base font-medium leading-snug italic">
              « {state.brandPromise.trim()} »
            </p>
          </section>
        )}

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            Sliders de voix
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <SliderBar label="Formel ↔ Casual" value={state.voiceSliders.formalCasual} />
            <SliderBar label="Sérieux ↔ Drôle" value={state.voiceSliders.seriousFunny} />
            <SliderBar
              label="Respect ↔ Irrévérenc."
              value={state.voiceSliders.respectfulIrreverent}
            />
            <SliderBar
              label="Factuel ↔ Enthousiaste"
              value={state.voiceSliders.matterOfFactEnthusiastic}
            />
          </div>
        </section>

        {(top3Do.length > 0 || top3Dont.length > 0) && (
          <section className="grid grid-cols-2 gap-4">
            {top3Do.length > 0 && (
              <div>
                <h2 className="text-[10px] uppercase tracking-wider text-green-700 font-bold mb-1">
                  ✓ On dit
                </h2>
                <div className="text-xs text-gray-700 leading-snug">{top3Do.join(" · ")}</div>
              </div>
            )}
            {top3Dont.length > 0 && (
              <div>
                <h2 className="text-[10px] uppercase tracking-wider text-red-600 font-bold mb-1">
                  ✗ On ne dit jamais
                </h2>
                <div className="text-xs text-gray-700 leading-snug">{top3Dont.join(" · ")}</div>
              </div>
            )}
          </section>
        )}

        {filledRows.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Tone matrix
            </h2>
            <div className="space-y-1.5 text-xs">
              {filledRows.map((r) => (
                <div key={r.id}>
                  <span className="font-semibold">
                    {r.contextEmoji} {r.context} —
                  </span>{" "}
                  <span className="text-gray-700">{r.tone}</span>
                  {r.exampleDo && (
                    <div className="text-gray-500 italic ml-6">« {r.exampleDo} »</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 2 Identité de marque
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-brand-card,
          .printable-brand-card * {
            visibility: visible;
          }
          .printable-brand-card {
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

function SliderBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">{label}</span>
        <span className="font-mono text-[10px] text-gray-500">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
        <div
          className="absolute top-0 bottom-0 w-1 bg-gray-900 rounded-full"
          style={{ left: `calc(${value}% - 2px)` }}
        />
      </div>
    </div>
  );
}
