"use client";

import type { Project } from "@/lib/types";
import type { FlowsState } from "../state";
import { computeActivationMetric, computeFrictionScore } from "../state";
import { PATTERNS } from "../templates";

const EMOJI_BY_EMOTION: Record<number, string> = {
  1: "😡",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "🤩",
};

export default function PrintableFlowCard({
  state,
  project,
}: {
  state: FlowsState;
  project: Project;
}) {
  const pattern = state.onboardingPattern
    ? PATTERNS.find((p) => p.key === state.onboardingPattern)
    : null;
  const nsaPreview = computeActivationMetric(state.northStarAction);
  const friction = computeFrictionScore(state);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Carte parcours (A4)</h3>
          <p className="text-xs text-muted">
            Parcours + aha moment + NSA + friction score. Clic « Imprimer » → PDF.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-flow-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-10 space-y-5 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {project.official_name || project.name}
          </h1>
          <p className="text-xs uppercase tracking-widest text-gray-500 mt-1">
            Parcours utilisateur
          </p>
        </header>

        {pattern && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Pattern d&apos;onboarding
            </h2>
            <div className="text-sm">
              <strong>
                {pattern.emoji} {pattern.label}
              </strong>{" "}
              — {pattern.description}
            </div>
          </section>
        )}

        {nsaPreview && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              North Star Action
            </h2>
            <p className="text-base font-medium italic">« {nsaPreview} »</p>
          </section>
        )}

        {state.steps.length > 0 && (
          <section>
            <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
              Parcours ({state.steps.length} étapes)
            </h2>
            <ol className="space-y-1.5 text-sm">
              {state.steps.map((s, i) => (
                <li key={s.id} className="flex items-baseline gap-2">
                  <span className="font-mono text-gray-400 text-xs w-5">#{i + 1}</span>
                  {s.isAhaMoment && <span className="text-amber-500">⭐</span>}
                  <span>{s.emotion ? EMOJI_BY_EMOTION[s.emotion] : ""}</span>
                  <span
                    className={s.isAhaMoment ? "font-semibold" : ""}
                  >
                    {s.label || "(sans nom)"}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section>
          <h2 className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
            Friction score
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{friction.total}</div>
            <div className="text-xs">
              <div className="uppercase font-semibold">
                {friction.level === "low"
                  ? "✓ Low"
                  : friction.level === "medium"
                  ? "⚠ Medium"
                  : "✗ High"}
              </div>
              <div className="text-gray-500">
                {friction.breakdown.steps} steps · {friction.breakdown.fields} fields ·{" "}
                {friction.breakdown.decisions} décisions · {friction.breakdown.modals} modals
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-3 border-t border-gray-200 text-[9px] text-gray-400 uppercase tracking-wider text-center">
          Mindeck · Chap. 4 Parcours utilisateur
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-flow-card,
          .printable-flow-card * {
            visibility: visible;
          }
          .printable-flow-card {
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
