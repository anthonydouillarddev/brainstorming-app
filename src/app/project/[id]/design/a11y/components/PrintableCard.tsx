"use client";

import type { Project } from "@/lib/types";
import type { A11yState } from "../state";
import {
  AT_META,
  BROWSER_META,
  CHECK_STATUS_META,
  COGNITIVE_AXIS_META,
  MOTION_AXIS_META,
  REMEDIATION_BUCKET_META,
  SEVERITY_META,
  WCAG_PRINCIPLE_META,
  computeA11yCompleteness,
} from "../state";

export default function PrintableA11yCard({
  state,
  project,
}: {
  state: A11yState;
  project: Project;
}) {
  const score = computeA11yCompleteness(state);

  const wcagA = state.wcagChecks.filter((c) => c.level === "A");
  const wcagAA = state.wcagChecks.filter((c) => c.level === "AA");
  const passedA = wcagA.filter((c) => c.status === "pass").length;
  const passedAA = wcagAA.filter((c) => c.status === "pass").length;

  const testedAT = state.assistiveTech.filter((a) => a.tested);
  const passedCog = state.cognitiveChecks.filter((c) => c.status === "pass").length;
  const respectedMotion = state.motionPreferences.filter((m) => m.respected).length;

  const nowItems = state.remediation
    .filter((r) => r.bucket === "now" && r.status !== "done")
    .slice(0, 4);
  const openIssues = state.issues
    .filter((i) => i.status === "open" || i.status === "in-progress")
    .slice(0, 3);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold">🖨️ Rapport a11y (A4 VPAT-like)</h3>
          <p className="text-xs text-muted">
            Synthèse 1 page : conformité WCAG, AT, cognitif, motion, roadmap.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition flex items-center gap-2"
        >
          🖨️ Imprimer / PDF
        </button>
      </div>

      <div className="printable-a11y-card bg-white text-gray-900 rounded-xl shadow-lg border border-border aspect-[1/1.414] max-w-xl mx-auto p-8 space-y-3 overflow-hidden">
        <header className="border-b-2 border-gray-200 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {project.official_name || project.name}
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">
                Rapport accessibilité · WCAG 2.2 AA
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{score}%</div>
              <div className="text-[9px] uppercase tracking-wider text-gray-500">
                Conformité
              </div>
            </div>
          </div>
        </header>

        {/* WCAG summary */}
        <section>
          <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
            WCAG 2.2 · Synthèse
          </h2>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex items-center justify-between px-2 py-1 rounded bg-gray-50 border border-gray-200">
              <span className="font-mono">Level A</span>
              <span className="font-semibold">
                {passedA}/{wcagA.length}
              </span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 rounded bg-gray-50 border border-gray-200">
              <span className="font-mono">Level AA</span>
              <span className="font-semibold">
                {passedAA}/{wcagAA.length}
              </span>
            </div>
            {(["perceivable", "operable", "understandable", "robust"] as const).map(
              (p) => {
                const items = state.wcagChecks.filter((c) => c.principle === p);
                const pass = items.filter((c) => c.status === "pass").length;
                const meta = WCAG_PRINCIPLE_META[p];
                return (
                  <div
                    key={p}
                    className="flex items-center justify-between px-2 py-1 rounded bg-gray-50 border border-gray-200"
                  >
                    <span>
                      {meta.emoji} {meta.label}
                    </span>
                    <span className="font-mono text-gray-600">
                      {pass}/{items.length}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </section>

        {/* AT compatibility */}
        {testedAT.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1.5">
              🔊 Assistive Tech testés
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {testedAT.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-1.5">
                  <span>{CHECK_STATUS_META[a.status].emoji}</span>
                  <span className="font-mono">{AT_META[a.at].label}</span>
                  <span className="text-gray-500">×</span>
                  <span>{BROWSER_META[a.browser].label}</span>
                  {a.version && (
                    <span className="text-gray-500 ml-auto font-mono">{a.version}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Cognitive */}
          {state.cognitiveChecks.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🧠 Cognitif
              </h2>
              <div className="text-[10px] space-y-0.5">
                <div>
                  {passedCog}/{state.cognitiveChecks.length} règles validées
                </div>
                {(Object.keys(COGNITIVE_AXIS_META) as Array<
                  keyof typeof COGNITIVE_AXIS_META
                >).map((axis) => {
                  const count = state.cognitiveChecks.filter((c) => c.axis === axis).length;
                  if (count === 0) return null;
                  const pass = state.cognitiveChecks.filter(
                    (c) => c.axis === axis && c.status === "pass"
                  ).length;
                  return (
                    <div key={axis} className="flex items-center gap-1 text-[9px]">
                      <span>{COGNITIVE_AXIS_META[axis].emoji}</span>
                      <span className="truncate">
                        {COGNITIVE_AXIS_META[axis].label}
                      </span>
                      <span className="ml-auto font-mono text-gray-600">
                        {pass}/{count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Motion */}
          {state.motionPreferences.length > 0 && (
            <section>
              <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                🎬 Motion
              </h2>
              <ul className="text-[10px] space-y-0.5">
                {state.motionPreferences.map((m) => (
                  <li key={m.id} className="flex items-center gap-1">
                    <span>{m.respected ? "✅" : "⚠️"}</span>
                    <span>
                      {MOTION_AXIS_META[m.axis].emoji} {MOTION_AXIS_META[m.axis].label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="text-[9px] text-gray-500 mt-1">
                {respectedMotion}/{state.motionPreferences.length} respectés
              </div>
            </section>
          )}
        </div>

        {/* Roadmap now */}
        {nowItems.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-red-600 font-bold mb-1">
              🔥 À faire maintenant
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {nowItems.map((r) => (
                <li key={r.id} className="flex items-start gap-1">
                  <span>{SEVERITY_META[r.severity].emoji}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                  <span className="text-gray-500 font-mono">{r.effort}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Open issues */}
        {openIssues.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              📋 Issues ouvertes
            </h2>
            <ul className="text-[10px] space-y-0.5">
              {openIssues.map((i) => (
                <li key={i.id} className="flex items-start gap-1">
                  <span>{SEVERITY_META[i.severity].emoji}</span>
                  <span className="flex-1 truncate">{i.description}</span>
                  {i.wcagRef && (
                    <span className="text-gray-500 font-mono">{i.wcagRef}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Roadmap overview */}
        {state.remediation.length > 0 && (
          <section>
            <h2 className="text-[9px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              🗺️ Remediation
            </h2>
            <div className="flex gap-1 text-[9px]">
              {(["now", "week", "month", "quarter"] as const).map((b) => {
                const items = state.remediation.filter((r) => r.bucket === b);
                const done = items.filter((r) => r.status === "done").length;
                return (
                  <div
                    key={b}
                    className="flex-1 p-1.5 rounded border border-gray-200 bg-gray-50 text-center"
                  >
                    <div>{REMEDIATION_BUCKET_META[b].emoji}</div>
                    <div className="font-mono font-semibold">
                      {done}/{items.length}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <footer className="pt-2 border-t border-gray-200 text-[8px] text-gray-400 uppercase tracking-wider text-center mt-auto">
          Mindeck · Chap. 10 Accessibilité · WCAG 2.2 AA · Généré le{" "}
          {new Date().toLocaleDateString("fr-FR")}
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-a11y-card,
          .printable-a11y-card * {
            visibility: visible;
          }
          .printable-a11y-card {
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
