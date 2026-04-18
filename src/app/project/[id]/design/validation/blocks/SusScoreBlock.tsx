"use client";

import { useMemo, useState } from "react";
import type { SusResponse, ValidationState } from "../state";
import { averageSusScore, computeSusScore, makeId, susGrade } from "../state";
import { SUS_LIKERT_LABELS, SUS_QUESTIONS } from "../validation-library";
import { validateSus } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function SusScoreBlock({
  state,
  onChange,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.susResponses.length > 0);
  const issues = validateSus(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const avg = useMemo(() => averageSusScore(state.susResponses), [state.susResponses]);
  const ok = state.susResponses.length >= 5 && avg >= 68 && !hasError;
  const grade = susGrade(avg);

  function addResponse() {
    const next: SusResponse = {
      id: makeId("sus"),
      participantLabel: `P${state.susResponses.length + 1}`,
      answers: new Array(10).fill(3),
      notes: "",
    };
    onChange({ susResponses: [...state.susResponses, next] });
  }

  function update(id: string, patch: Partial<SusResponse>) {
    onChange({
      susResponses: state.susResponses.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function remove(id: string) {
    onChange({ susResponses: state.susResponses.filter((r) => r.id !== id) });
  }

  function setAnswer(id: string, qIdx: number, value: number) {
    const r = state.susResponses.find((x) => x.id === id);
    if (!r) return;
    const next = [...r.answers];
    next[qIdx] = value;
    update(id, { answers: next });
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
          📊 SUS (System Usability Scale)
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          {state.susResponses.length > 0 && (
            <span className={`font-mono text-sm ${grade.color}`}>
              {avg}/100 · {grade.grade}
            </span>
          )}
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">John Brooke, 1986.</strong> 10 questions Likert
            1-5. Score calculé auto (questions impaires −1, paires 5−, total × 2.5).
            <strong> Bench moyen = 68</strong>, good = 72.6, excellent = 80.3+ (Sauro 2011).
            Score minimum viable : 5 répondants.
          </div>

          {state.susResponses.length > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-center">
              <div className={`text-3xl font-bold ${grade.color}`}>
                {avg}
                <span className="text-sm font-normal text-muted">/100</span>
              </div>
              <div className={`text-xs ${grade.color}`}>
                Grade {grade.grade} · {grade.label}
              </div>
              <div className="text-[10px] text-muted mt-1">
                Moyenne sur {state.susResponses.length} répondant
                {state.susResponses.length > 1 ? "s" : ""}
              </div>
            </div>
          )}

          {state.susResponses.length > 0 && (
            <div className="space-y-3">
              {state.susResponses.map((r) => {
                const score = computeSusScore(r.answers);
                const rGrade = susGrade(score);
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={r.participantLabel}
                        onChange={(e) =>
                          update(r.id, { participantLabel: e.target.value })
                        }
                        placeholder="Participant"
                        className="w-32 h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      />
                      <span className={`text-xs font-mono font-bold ${rGrade.color} ml-auto`}>
                        {score}/100 · {rGrade.grade}
                      </span>
                      <button
                        onClick={() => remove(r.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-1">
                      {SUS_QUESTIONS.map((q) => (
                        <div
                          key={q.index}
                          className="flex items-center gap-2 text-xs py-1 border-b border-border/30 last:border-0"
                        >
                          <span className="text-[10px] font-mono text-muted w-5 text-right">
                            {q.index + 1}.
                          </span>
                          <span className="flex-1 text-[11px]">{q.text}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <button
                                key={v}
                                onClick={() => setAnswer(r.id, q.index, v)}
                                className={`w-7 h-7 rounded border text-[11px] font-mono ${
                                  r.answers[q.index] === v
                                    ? "bg-accent text-white border-accent"
                                    : "border-border hover:bg-accent/10"
                                }`}
                                title={SUS_LIKERT_LABELS[v - 1]}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={r.notes}
                      onChange={(e) => update(r.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addResponse}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter un répondant SUS
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
