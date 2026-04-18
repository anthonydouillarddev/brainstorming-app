"use client";

import { useState } from "react";
import type {
  FindingSeverity,
  TestMethod,
  TestStatus,
  UserTestFinding,
  UserTestSession,
  ValidationState,
} from "../state";
import {
  FINDING_SEVERITY_META,
  TEST_METHOD_META,
  TEST_STATUS_META,
  makeId,
} from "../state";
import { validateUserTests } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function UserTestSessionsBlock({
  state,
  onChange,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.userTests.length > 0);
  const issues = validateUserTests(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const completed = state.userTests.filter((t) => t.status === "completed").length;
  const ok = completed >= 1 && !hasError;

  function addTest() {
    const next: UserTestSession = {
      id: makeId("test"),
      title: "",
      method: "moderated",
      goal: "",
      participantCount: 5,
      completionRate: 0,
      timeOnTaskSec: 0,
      status: "planned",
      startedAt: new Date().toISOString().slice(0, 10),
      findings: [],
      notes: "",
    };
    onChange({ userTests: [...state.userTests, next] });
  }

  function update(id: string, patch: Partial<UserTestSession>) {
    onChange({
      userTests: state.userTests.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function remove(id: string) {
    onChange({ userTests: state.userTests.filter((t) => t.id !== id) });
  }

  function addFinding(testId: string) {
    const t = state.userTests.find((x) => x.id === testId);
    if (!t) return;
    const finding: UserTestFinding = {
      id: makeId("find"),
      description: "",
      severity: "moderate",
      frequency: 1,
      fixed: false,
    };
    update(testId, { findings: [...t.findings, finding] });
  }

  function updateFinding(testId: string, findingId: string, patch: Partial<UserTestFinding>) {
    const t = state.userTests.find((x) => x.id === testId);
    if (!t) return;
    update(testId, {
      findings: t.findings.map((f) => (f.id === findingId ? { ...f, ...patch } : f)),
    });
  }

  function removeFinding(testId: string, findingId: string) {
    const t = state.userTests.find((x) => x.id === testId);
    if (!t) return;
    update(testId, { findings: t.findings.filter((f) => f.id !== findingId) });
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
          🧑‍🔬 Tests utilisateurs
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({completed}/{state.userTests.length} terminés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">NN/G : 5 users = 85% des problèmes.</strong>{" "}
            Moderated (think-aloud, 45-60min), unmoderated (Maze/Useberry, scalable), guerilla
            (5min café). Pour chaque test : goal, participants, findings avec severity.
          </div>

          {state.userTests.length > 0 && (
            <div className="space-y-3">
              {state.userTests.map((t) => {
                const mmeta = TEST_METHOD_META[t.method];
                const smeta = TEST_STATUS_META[t.status];
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border space-y-2 ${smeta.color}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) => update(t.id, { title: e.target.value })}
                        placeholder="Titre (ex: Test onboarding v1)"
                        className="flex-1 min-w-[180px] h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <select
                        value={t.method}
                        onChange={(e) =>
                          update(t.id, { method: e.target.value as TestMethod })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(TEST_METHOD_META) as TestMethod[]).map((m) => (
                          <option key={m} value={m}>
                            {TEST_METHOD_META[m].emoji} {TEST_METHOD_META[m].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={t.status}
                        onChange={(e) =>
                          update(t.id, { status: e.target.value as TestStatus })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(TEST_STATUS_META) as TestStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {TEST_STATUS_META[s].emoji} {TEST_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => remove(t.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {mmeta.hint}</div>
                    <input
                      type="text"
                      value={t.goal}
                      onChange={(e) => update(t.id, { goal: e.target.value })}
                      placeholder="Goal (ex: Valider la création du premier projet)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Participants</span>
                        <input
                          type="number"
                          value={t.participantCount}
                          onChange={(e) =>
                            update(t.id, { participantCount: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={1}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Completion %</span>
                        <input
                          type="number"
                          value={t.completionRate}
                          onChange={(e) =>
                            update(t.id, { completionRate: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          max={100}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Time on task (s)</span>
                        <input
                          type="number"
                          value={t.timeOnTaskSec}
                          onChange={(e) =>
                            update(t.id, { timeOnTaskSec: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-medium text-muted">
                          Findings ({t.findings.length})
                        </div>
                        <button
                          onClick={() => addFinding(t.id)}
                          className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-accent/10"
                        >
                          + Finding
                        </button>
                      </div>
                      {t.findings.map((f) => {
                        const fmeta = FINDING_SEVERITY_META[f.severity];
                        return (
                          <div
                            key={f.id}
                            className={`p-2 rounded border ${fmeta.color} space-y-1 ${f.fixed ? "opacity-60" : ""}`}
                          >
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <select
                                value={f.severity}
                                onChange={(e) =>
                                  updateFinding(t.id, f.id, {
                                    severity: e.target.value as FindingSeverity,
                                  })
                                }
                                className="h-6 px-1 text-[11px] rounded border border-border bg-card"
                              >
                                {(Object.keys(FINDING_SEVERITY_META) as FindingSeverity[]).map(
                                  (s) => (
                                    <option key={s} value={s}>
                                      {FINDING_SEVERITY_META[s].emoji}
                                    </option>
                                  )
                                )}
                              </select>
                              <input
                                type="number"
                                value={f.frequency}
                                onChange={(e) =>
                                  updateFinding(t.id, f.id, {
                                    frequency: Number(e.target.value),
                                  })
                                }
                                className="w-12 h-6 px-1 text-[11px] rounded border border-border bg-card font-mono text-center"
                                min={1}
                                title="Nb participants affectés"
                              />
                              <input
                                type="text"
                                value={f.description}
                                onChange={(e) =>
                                  updateFinding(t.id, f.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Description"
                                className={`flex-1 h-6 px-2 text-[11px] rounded border border-border bg-card ${f.fixed ? "line-through" : ""}`}
                              />
                              <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={f.fixed}
                                  onChange={(e) =>
                                    updateFinding(t.id, f.id, { fixed: e.target.checked })
                                  }
                                  className="accent-accent"
                                />
                                fixed
                              </label>
                              <button
                                onClick={() => removeFinding(t.id, f.id)}
                                className="w-5 h-5 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                                aria-label="Supprimer finding"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      value={t.notes}
                      onChange={(e) => update(t.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addTest}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Nouveau test user
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
