"use client";

import type { Project } from "@/lib/types";
import type { MicrocopyState } from "../state";
import {
  CHECK_STATUS_META,
  CTA_VARIANT_META,
  GLOSSARY_STATUS_META,
  INCLUSIVE_AXIS_META,
  PLACEMENT_META,
  TONE_META,
  VOICE_CONTEXT_META,
} from "../state";

export default function PrintableMicrocopyCard({
  state,
  project,
}: {
  state: MicrocopyState;
  project: Project;
}) {
  const topCtas = state.ctas.slice(0, 6);
  const topVoice = state.voiceTones.slice(0, 5);
  const topBudgets = state.lengthBudgets.slice(0, 6);
  const doGloss = state.glossary.filter((g) => g.status === "do").slice(0, 6);
  const dontGloss = state.glossary.filter((g) => g.status === "dont").slice(0, 6);
  const passedChecks = state.inclusiveChecks.filter((c) => c.status === "pass").slice(0, 4);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Microcopy Card (A4)</h3>
          <p className="text-xs text-muted">
            Synthèse 1 page : CTAs, voice & tone, budgets, glossaire, inclusion.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-microcopy-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-8 space-y-4 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-3">
          <h1 className="text-xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
            Microcopy · CTAs · Voice &amp; Tone · Budgets · Glossaire · Inclusion
          </p>
        </header>

        {topCtas.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              🎯 CTAs ({state.ctas.length})
            </h2>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {topCtas.map((c) => (
                <span
                  key={c.id}
                  className="px-1.5 py-0.5 rounded border border-gray-300 bg-gray-50"
                >
                  {CTA_VARIANT_META[c.variant].emoji} {c.label}
                </span>
              ))}
            </div>
          </section>
        )}

        {topVoice.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              🎭 Voice &amp; Tone
            </h2>
            <div className="space-y-0.5 text-[10px]">
              {topVoice.map((v) => (
                <div key={v.id} className="flex items-center gap-2">
                  <span className="font-mono min-w-[70px]">
                    {VOICE_CONTEXT_META[v.context].emoji} {VOICE_CONTEXT_META[v.context].label}
                  </span>
                  <span className="text-gray-500">→</span>
                  <span className="font-medium">{TONE_META[v.tone].label}</span>
                  {v.principle && (
                    <span className="text-gray-500 italic truncate">· {v.principle}</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          {topBudgets.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                📏 Budgets
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {topBudgets.map((b) => (
                  <li key={b.id} className="flex items-center gap-1">
                    <span>{PLACEMENT_META[b.placement].emoji}</span>
                    <span className="truncate">{PLACEMENT_META[b.placement].label}</span>
                    <span className="ml-auto font-mono text-gray-600">{b.maxChars}c</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(doGloss.length > 0 || dontGloss.length > 0) && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                📚 Glossaire (do / don&apos;t)
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {doGloss.map((g) => (
                  <li key={g.id} className="flex items-center gap-1">
                    <span>{GLOSSARY_STATUS_META.do.emoji}</span>
                    <span className="font-medium">{g.userFacingFr}</span>
                  </li>
                ))}
                {dontGloss.map((g) => (
                  <li key={g.id} className="flex items-center gap-1 text-gray-500">
                    <span>{GLOSSARY_STATUS_META.dont.emoji}</span>
                    <span className="line-through">{g.userFacingFr}</span>
                    {g.alternative && (
                      <span className="not-line-through no-underline text-green-700">
                        → {g.alternative}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {passedChecks.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              🌈 Inclusion (validées)
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {passedChecks.map((c) => (
                <li key={c.id} className="flex items-start gap-1">
                  <span>{CHECK_STATUS_META.pass.emoji}</span>
                  <span className="truncate">
                    {INCLUSIVE_AXIS_META[c.axis].emoji} {c.rule}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center mt-auto">
          Mindeck · Chap. 9 Microcopy
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-microcopy-card,
          .printable-microcopy-card * {
            visibility: visible;
          }
          .printable-microcopy-card {
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
