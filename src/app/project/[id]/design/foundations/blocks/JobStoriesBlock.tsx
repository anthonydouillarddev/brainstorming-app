"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import { validateJobStories } from "../validators";
import {
  makeJobStoryId,
  type FoundationsJobStory,
  type FoundationsState,
} from "../state";
import { JOB_STORY_TEMPLATES, jobStoryFromTemplate } from "../templates";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function JobStoriesBlock({
  state,
  projectType,
  onChange,
}: {
  state: FoundationsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.jobStories.length > 0);
  const issues = validateJobStories(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.jobStories.length >= 1 && !hasError;

  const templates = projectType ? JOB_STORY_TEMPLATES[projectType] : [];

  function addEmpty() {
    const next: FoundationsJobStory = {
      id: makeJobStoryId(),
      when: "",
      iWant: "",
      soICan: "",
    };
    onChange({ jobStories: [...state.jobStories, next] });
    setExpanded(true);
  }

  function addFromTemplate(index: number) {
    const tpl = templates[index];
    if (!tpl) return;
    onChange({ jobStories: [...state.jobStories, jobStoryFromTemplate(tpl)] });
    setExpanded(true);
  }

  function updateStory(id: string, patch: Partial<FoundationsJobStory>) {
    onChange({
      jobStories: state.jobStories.map((js) => (js.id === id ? { ...js, ...patch } : js)),
    });
  }

  function removeStory(id: string) {
    onChange({ jobStories: state.jobStories.filter((js) => js.id !== id) });
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
          📖 Job stories
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.jobStories.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Paul Adams (Intercom)</strong> : commence toujours
            par le contexte. <em>When</em> (quand ça arrive) · <em>I want</em> (ce qu&apos;il
            veut) · <em>So I can</em> (pourquoi c&apos;est important). Sans &laquo; When &raquo;,
            tu décris une feature, pas un job.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                ✓ Exemple
              </div>
              <div className="text-muted italic">
                When je reçois un paiement sur Stripe, I want une notif sur mon téléphone, so I can
                remercier le client dans les 2 minutes.
              </div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs">
              <div className="font-semibold text-red-500 mb-1">✗ Anti-exemple</div>
              <div className="text-muted italic">
                L&apos;utilisateur veut être notifié. (Pas de contexte, pas d&apos;outcome.)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {state.jobStories.map((js) => (
              <div
                key={js.id}
                className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2">
                    <JobStoryField
                      label="When"
                      value={js.when}
                      placeholder="je reçois un paiement sur Stripe"
                      onChange={(when) => updateStory(js.id, { when })}
                      color="text-accent"
                    />
                    <JobStoryField
                      label="I want"
                      value={js.iWant}
                      placeholder="une notification sur mon téléphone"
                      onChange={(iWant) => updateStory(js.id, { iWant })}
                      color="text-emerald-600 dark:text-emerald-400"
                    />
                    <JobStoryField
                      label="So I can"
                      value={js.soICan}
                      placeholder="remercier le client dans les 2 minutes"
                      onChange={(soICan) => updateStory(js.id, { soICan })}
                      color="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <button
                    onClick={() => removeStory(js.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs shrink-0"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
                {(js.when || js.iWant || js.soICan) && (
                  <div className="text-xs text-muted italic pt-2 border-t border-border">
                    &laquo; When <strong className="text-foreground not-italic">{js.when || "..."}</strong>, I
                    want <strong className="text-foreground not-italic">{js.iWant || "..."}</strong>, so I can{" "}
                    <strong className="text-foreground not-italic">{js.soICan || "..."}</strong>. &raquo;
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addEmpty}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
            >
              + Ajouter une job story
            </button>
          </div>

          {templates.length > 0 && state.jobStories.length < 5 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">
                Templates pour type <strong>{projectType}</strong> — clic pour ajouter :
              </div>
              <div className="space-y-1">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => addFromTemplate(i)}
                    className="w-full text-left text-xs px-3 py-2 rounded border border-border hover:bg-accent/10 transition"
                  >
                    <span className="text-accent">When</span> {tpl.when},{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">I want</span>{" "}
                    {tpl.iWant},{" "}
                    <span className="text-amber-600 dark:text-amber-400">so I can</span>{" "}
                    {tpl.soICan}.
                  </button>
                ))}
              </div>
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function JobStoryField({
  label,
  value,
  placeholder,
  onChange,
  color,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-mono font-semibold w-16 shrink-0 ${color}`}>{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 px-3 text-sm rounded border border-border bg-card flex-1"
      />
    </div>
  );
}
