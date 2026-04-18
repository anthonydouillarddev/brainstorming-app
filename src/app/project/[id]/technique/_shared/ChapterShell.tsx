"use client";

import type { ReactNode } from "react";
import ModeToggle, { type ChapterMode } from "./ModeToggle";

export interface ShellIssue {
  severity: "error" | "warn" | "info";
  message: string;
}

// Shell générique : header (titre + progress + save state + mode toggle) + content + issues list.
// Chaque chapitre passe son state et son content.
export default function ChapterShell({
  emoji,
  title,
  description,
  contextHint,
  completeness,
  issues,
  saving,
  lastSaved,
  saveError,
  mode,
  onModeChange,
  children,
}: {
  emoji: string;
  title: string;
  description: string;
  contextHint?: string;
  completeness: number;
  issues: ShellIssue[];
  saving: boolean;
  lastSaved: string | null;
  saveError?: string | null;
  mode: ChapterMode;
  onModeChange: (m: ChapterMode) => void;
  children: ReactNode;
}) {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warn").length;

  return (
    <div className="space-y-5">
      <header className="bg-card/60 border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-xl font-bold">
              {emoji} {title}
            </h2>
            <p className="text-sm text-muted mt-1">{description}</p>
          </div>
          <ModeToggle mode={mode} onChange={onModeChange} />
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-muted">Complétude</span>
              <span className="text-sm font-bold">{completeness}%</span>
            </div>
            <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            {errorCount > 0 && (
              <span className="text-red-600 dark:text-red-400 font-medium">
                ❌ {errorCount} erreur{errorCount > 1 ? "s" : ""}
              </span>
            )}
            {warnCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">
                ⚠️ {warnCount} avertissement{warnCount > 1 ? "s" : ""}
              </span>
            )}
            {saveError ? (
              <span className="text-red-600 dark:text-red-400 font-medium" title={saveError}>
                ⚠ Échec sauvegarde
              </span>
            ) : saving ? (
              <span className="text-muted">💾 Sauvegarde…</span>
            ) : lastSaved ? (
              <span className="text-muted">✓ {lastSaved}</span>
            ) : null}
          </div>
        </div>

        {contextHint && (
          <div className="text-[11px] bg-accent/5 border border-accent/20 rounded-xl px-3 py-2 text-muted">
            {contextHint}
          </div>
        )}
      </header>

      {children}

      {issues.length > 0 && mode !== "beginner" && (
        <div className="bg-card/60 border border-border rounded-2xl p-4 space-y-2">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider">
            📋 Validation
          </div>
          <ul className="space-y-1.5">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px]">
                <span
                  className={
                    issue.severity === "error"
                      ? "text-red-600 dark:text-red-400"
                      : issue.severity === "warn"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-muted"
                  }
                >
                  {issue.severity === "error" ? "❌" : issue.severity === "warn" ? "⚠️" : "ℹ️"}
                </span>
                <span className="flex-1">{issue.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
