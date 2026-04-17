"use client";

import { useState } from "react";
import type { FlowsState, NorthStarAction } from "../state";
import { computeActivationMetric } from "../state";
import { validateNSA } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const EXAMPLES = [
  {
    verb: "créer 3 projets",
    segment: "l'user",
    timeframe: "7 jours",
    value: "il est accro à la structure",
  },
  {
    verb: "inviter 7 amis",
    segment: "l'user",
    timeframe: "10 jours",
    value: "le network effect démarre (Facebook)",
  },
  {
    verb: "envoyer 2000 messages",
    segment: "l'équipe",
    timeframe: "1 mois",
    value: "Slack devient indispensable",
  },
];

export default function NorthStarActionBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(
    !!state.northStarAction.verb || !!state.northStarAction.value
  );
  const issues = validateNSA(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const nsa = state.northStarAction;
  const filled = nsa.verb.trim() && nsa.segment.trim() && nsa.timeframe.trim() && nsa.value.trim();
  const ok = !!filled && !hasError;
  const preview = computeActivationMetric(nsa);

  function update(patch: Partial<NorthStarAction>) {
    const next = { ...nsa, ...patch };
    onChange({
      northStarAction: next,
      activationMetric: computeActivationMetric(next),
    });
  }

  function fillExample(ex: (typeof EXAMPLES)[number]) {
    onChange({
      northStarAction: ex,
      activationMetric: computeActivationMetric(ex),
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
          ⭐ North Star Action
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && preview && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">« {preview} »</div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Formule Reforge / Amplitude</strong> :{" "}
            <em>« l&apos;action [VERBE] par [SEGMENT] dans [TIMEFRAME] qui prouve [VALEUR] ».</em>
            Sans NSA, impossible de mesurer l&apos;activation.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Verbe + quantité</label>
              <input
                type="text"
                value={nsa.verb}
                onChange={(e) => update({ verb: e.target.value })}
                placeholder="Ex : créer 3 projets"
                className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Segment</label>
              <input
                type="text"
                value={nsa.segment}
                onChange={(e) => update({ segment: e.target.value })}
                placeholder="Ex : l'user, l'équipe"
                className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Timeframe</label>
              <input
                type="text"
                value={nsa.timeframe}
                onChange={(e) => update({ timeframe: e.target.value })}
                placeholder="Ex : 7 jours"
                className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Valeur prouvée</label>
              <input
                type="text"
                value={nsa.value}
                onChange={(e) => update({ value: e.target.value })}
                placeholder="Ex : il est accro"
                className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
              />
            </div>
          </div>

          {preview && (
            <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm">
              <div className="text-[10px] uppercase tracking-wider text-accent font-semibold mb-1">
                Activation metric
              </div>
              <div className="font-medium">{preview}</div>
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Exemples cliquables :</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => fillExample(ex)}
                  className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition text-left max-w-md"
                >
                  {ex.verb} {ex.segment} en {ex.timeframe}
                </button>
              ))}
            </div>
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
