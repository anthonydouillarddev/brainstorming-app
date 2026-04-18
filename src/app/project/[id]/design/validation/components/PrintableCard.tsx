"use client";

import type { Project } from "@/lib/types";
import type { ValidationState } from "../state";
import {
  FINDING_SEVERITY_META,
  HEURISTIC_META,
  PMF_METRIC_META,
  ROADMAP_BUCKET_META,
  averageSusScore,
  computeValidationCompleteness,
  susGrade,
} from "../state";

export default function PrintableValidationCard({
  state,
  project,
}: {
  state: ValidationState;
  project: Project;
}) {
  const score = computeValidationCompleteness(state);
  const susAvg = averageSusScore(state.susResponses);
  const susG = susGrade(susAvg);

  const criticalFindings = state.userTests
    .flatMap((t) => t.findings.filter((f) => !f.fixed && f.severity === "critical"))
    .slice(0, 4);

  const failedHeuristics = state.heuristicEvals
    .filter(
      (h) =>
        (h.severity === "critical" || h.severity === "serious") && !h.resolved
    )
    .slice(0, 4);

  const nowRoadmap = state.roadmap
    .filter((r) => r.bucket === "now" && r.status !== "done")
    .slice(0, 4);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Rapport Validation (A4)</h3>
          <p className="text-xs text-muted">
            Synthèse 1 page : SUS score · findings · heuristiques · PMF · roadmap.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-validation-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-8 space-y-3 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-3 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {project.official_name || project.name}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
              Rapport validation · Tests · SUS · Heuristiques · PMF
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{score}%</div>
            <div className="text-[9px] uppercase tracking-wider text-gray-500">Couverture</div>
          </div>
        </header>

        {/* SUS score highlight */}
        {state.susResponses.length > 0 && (
          <section className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
              📊 SUS Score ({state.susResponses.length} répondants)
            </div>
            <div className={`text-3xl font-bold ${susG.color}`}>
              {susAvg}
              <span className="text-sm font-normal text-gray-500">/100</span>
            </div>
            <div className="text-[10px] text-gray-600">
              Grade {susG.grade} · {susG.label} · bench 68
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* User tests */}
          {state.userTests.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🧑‍🔬 Tests
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.userTests.slice(0, 4).map((t) => {
                  const findings = t.findings.filter((f) => !f.fixed).length;
                  return (
                    <li key={t.id} className="flex items-center gap-1">
                      <span>{t.status === "completed" ? "✅" : "🗓️"}</span>
                      <span className="truncate flex-1">{t.title || "?"}</span>
                      {findings > 0 && (
                        <span className="text-red-600 font-mono">{findings} open</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Heuristics summary */}
          {state.heuristicEvals.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🔎 Heuristiques
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.heuristicEvals.slice(0, 5).map((h) => (
                  <li key={h.id} className="flex items-center gap-1">
                    <span>
                      {h.severity === "none"
                        ? "◦"
                        : h.resolved
                          ? "✅"
                          : FINDING_SEVERITY_META[h.severity].emoji}
                    </span>
                    <span className="truncate">{HEURISTIC_META[h.heuristic].label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Critical findings */}
        {criticalFindings.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-red-600 font-bold mb-1">
              🔴 Findings critiques
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {criticalFindings.map((f) => (
                <li key={f.id} className="flex items-start gap-1">
                  <span>{FINDING_SEVERITY_META[f.severity].emoji}</span>
                  <span className="truncate">{f.description}</span>
                  <span className="text-gray-500 font-mono">{f.frequency}×</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Failed heuristics */}
        {failedHeuristics.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-orange-600 font-bold mb-1">
              🟠 Heuristiques en échec
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {failedHeuristics.map((h) => (
                <li key={h.id} className="flex items-start gap-1">
                  <span>
                    {h.severity !== "none" ? FINDING_SEVERITY_META[h.severity].emoji : "◦"}
                  </span>
                  <span className="truncate">{HEURISTIC_META[h.heuristic].label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* PMF metrics */}
        {state.pmfMetrics.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              🎯 PMF metrics
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {state.pmfMetrics.slice(0, 4).map((m) => {
                const meta = PMF_METRIC_META[m.kind];
                const hit = m.sampleSize >= 30 && m.value >= m.target;
                return (
                  <li key={m.id} className="flex items-center gap-1">
                    <span>{hit ? "✅" : "⚠️"}</span>
                    <span>{meta.emoji}</span>
                    <span className="truncate flex-1">{meta.label}</span>
                    <span className="text-gray-500 font-mono">
                      {m.value}
                      {meta.unit} / {m.target}
                      {meta.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Roadmap now */}
        {nowRoadmap.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-red-600 font-bold mb-1">
              {ROADMAP_BUCKET_META.now.emoji} Now · à faire
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {nowRoadmap.map((r) => (
                <li key={r.id} className="flex items-start gap-1">
                  <span>{FINDING_SEVERITY_META[r.severity].emoji}</span>
                  <span className="truncate flex-1">{r.title}</span>
                  <span className="text-gray-500 font-mono">{r.effort}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-2 border-t border-gray-200 text-[8px] text-gray-400 uppercase tracking-wider text-center mt-auto">
          Mindeck · Chap. 12 Validation · Généré le{" "}
          {new Date().toLocaleDateString("fr-FR")}
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-validation-card,
          .printable-validation-card * {
            visibility: visible;
          }
          .printable-validation-card {
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
