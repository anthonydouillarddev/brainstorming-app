"use client";

import { useState } from "react";
import { validateAhaMoment } from "../validators";
import type { FoundationsState } from "../state";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const EXAMPLES = [
  { event: "Créer son premier projet + ajouter sa 1ère tâche", threshold: "en moins de 3 minutes" },
  { event: "Inviter des amis", threshold: "7 amis en 10 jours (Facebook)" },
  { event: "Envoyer des messages en équipe", threshold: "2000 messages (Slack)" },
  { event: "Importer son premier fichier client", threshold: "dans les 5 premières minutes" },
];

export default function AhaMomentBlock({
  state,
  onChange,
}: {
  state: FoundationsState;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const issues = validateAhaMoment(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok =
    !!state.ahaMomentEvent.trim() && !!state.ahaMomentThreshold.trim() && !hasError;

  const summary =
    state.ahaMomentEvent.trim() && state.ahaMomentThreshold.trim()
      ? `${state.ahaMomentEvent.trim()} — ${state.ahaMomentThreshold.trim()}`
      : null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          💡 Aha moment
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && summary && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {summary}
        </div>
      )}

      {expanded && (
      <>
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Ce n&apos;est pas un ressenti, c&apos;est un événement</strong>
        . Mesurable. Exemple Facebook : <em>&laquo; 7 amis en 10 jours &raquo;</em>. Slack :{" "}
        <em>&laquo; 2000 messages équipe &raquo;</em>. Sans chiffre, ton aha est flou.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Action user (verbe)</label>
          <input
            type="text"
            value={state.ahaMomentEvent}
            onChange={(e) => onChange({ ahaMomentEvent: e.target.value })}
            placeholder="Ex : créer son premier projet"
            className="w-full h-10 px-3 text-sm rounded border border-border bg-card"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Seuil quantifié (chiffre + délai)</label>
          <input
            type="text"
            value={state.ahaMomentThreshold}
            onChange={(e) => onChange({ ahaMomentThreshold: e.target.value })}
            placeholder="Ex : en moins de 3 minutes"
            className="w-full h-10 px-3 text-sm rounded border border-border bg-card"
          />
        </div>
      </div>

      {(state.ahaMomentEvent.trim() || state.ahaMomentThreshold.trim()) && (
        <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-sm">
          <div className="text-[11px] text-muted uppercase tracking-wider mb-1">Aperçu</div>
          <div className="font-medium">
            User a fait <span className="text-accent">{state.ahaMomentEvent || "[action]"}</span>{" "}
            <span className="text-accent">{state.ahaMomentThreshold || "[seuil]"}</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs text-muted">Exemples cliquables :</div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() =>
                onChange({
                  ahaMomentEvent: ex.event,
                  ahaMomentThreshold: ex.threshold,
                })
              }
              className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
            >
              {ex.event} <span className="text-muted">— {ex.threshold}</span>
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
