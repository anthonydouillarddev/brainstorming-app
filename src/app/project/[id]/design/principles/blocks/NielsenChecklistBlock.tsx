"use client";

import { useState } from "react";
import type { HeuristicAnswer, NielsenEntry, PrinciplesState } from "../state";
import { computeNielsenScore } from "../state";
import { NIELSEN_HEURISTICS } from "../nielsen";
import BlockStatus from "../components/BlockStatus";

const ANSWER_LABELS: Record<HeuristicAnswer, { label: string; emoji: string; color: string }> = {
  yes: { label: "Oui", emoji: "✓", color: "text-green-600" },
  no: { label: "Non", emoji: "✗", color: "text-red-500" },
  unknown: { label: "Je sais pas", emoji: "?", color: "text-muted" },
};

export default function NielsenChecklistBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.nielsenAnswers.length > 0);
  const score = computeNielsenScore(state);
  const ok = score.answered >= 8 && score.passed >= 6;

  function answer(slug: string, a: HeuristicAnswer) {
    const existing = state.nielsenAnswers.find((e) => e.heuristicSlug === slug);
    const entry: NielsenEntry = existing
      ? { ...existing, answer: a }
      : { heuristicSlug: slug, answer: a, note: "" };
    const next = existing
      ? state.nielsenAnswers.map((e) => (e.heuristicSlug === slug ? entry : e))
      : [...state.nielsenAnswers, entry];
    onChange({ nielsenAnswers: next });
  }

  function updateNote(slug: string, note: string) {
    const existing = state.nielsenAnswers.find((e) => e.heuristicSlug === slug);
    if (!existing) return;
    onChange({
      nielsenAnswers: state.nielsenAnswers.map((e) =>
        e.heuristicSlug === slug ? { ...e, note } : e
      ),
    });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧪 Audit Nielsen 10 heuristiques
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({score.passed}/{score.total} · {score.answered} répondu
            {score.answered > 1 ? "s" : ""})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Jakob Nielsen 1994 (updated 2024).</strong> Le
            socle non-négociable de l&apos;UX. Réponds honnêtement à chaque heuristique — les
            « non » pointent les zones à fixer en priorité.
          </div>

          <div className="space-y-3">
            {NIELSEN_HEURISTICS.map((h) => {
              const entry = state.nielsenAnswers.find((e) => e.heuristicSlug === h.slug);
              const currentAnswer = entry?.answer;
              return (
                <div
                  key={h.slug}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs text-muted w-6 mt-1">#{h.num}</span>
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-sm"
                        dangerouslySetInnerHTML={{ __html: h.title }}
                      />
                      <p
                        className="text-xs text-muted mt-0.5"
                        dangerouslySetInnerHTML={{ __html: h.question }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-green-500/5 border border-green-500/20 rounded p-2">
                      <span className="font-semibold text-green-600 dark:text-green-400">✓ </span>
                      {h.exampleGood}
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded p-2">
                      <span className="font-semibold text-red-500">✗ </span>
                      {h.exampleBad}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(["yes", "no", "unknown"] as HeuristicAnswer[]).map((a) => (
                      <button
                        key={a}
                        onClick={() => answer(h.slug, a)}
                        className={`text-xs px-3 py-1.5 rounded border transition ${
                          currentAnswer === a
                            ? a === "yes"
                              ? "bg-green-500/20 border-green-500 text-green-600"
                              : a === "no"
                              ? "bg-red-500/20 border-red-500 text-red-500"
                              : "bg-muted/20 border-muted"
                            : "border-border text-muted hover:bg-accent/10"
                        }`}
                      >
                        {ANSWER_LABELS[a].emoji} {ANSWER_LABELS[a].label}
                      </button>
                    ))}
                    {currentAnswer && (
                      <input
                        type="text"
                        value={entry?.note ?? ""}
                        onChange={(e) => updateNote(h.slug, e.target.value)}
                        placeholder="Note (optionnel)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card flex-1 text-muted min-w-[140px]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
