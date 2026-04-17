"use client";

import { useMemo, useState } from "react";
import {
  validateDesignSystem,
  severityIcon,
  severityColorClass,
  type ValidationIssue,
} from "@/lib/design/validator";
import type { PaletteShade } from "@/lib/design/oklch";
import { DEFAULT_TOKENS, type TokensState } from "./tokens-block";

interface ProgressItem {
  key: string;
  label: string;
  done: boolean;
  hint: string;
}

function computeProgress(
  selectedColors: { role: string; hex: string }[],
  tokens: TokensState,
  issues: ValidationIssue[]
): ProgressItem[] {
  const errors = issues.filter((i) => i.level === "error").length;
  return [
    {
      key: "primary",
      label: "Primary color",
      done: true, // toujours (defaut acceptable)
      hint: "Couleur primary définie.",
    },
    {
      key: "tuning",
      label: "Tuning palette personnalisé",
      done: false, // on pourrait passer les valeurs actuelles, mais skip pour simplicité
      hint: "Ajuste contrast / pic saturation / saturation globale si tu veux personnaliser au-delà du défaut.",
    },
    {
      key: "typo",
      label: "Typographie",
      done:
        tokens.typoBaseSize !== DEFAULT_TOKENS.typoBaseSize ||
        tokens.typoRatio !== DEFAULT_TOKENS.typoRatio,
      hint: "Choisis ta base size et ton ratio modulaire.",
    },
    {
      key: "fonts",
      label: "Font pairing",
      done: tokens.fontPairingId !== DEFAULT_TOKENS.fontPairingId,
      hint: "Choisis un pairing de polices (autre que système).",
    },
    {
      key: "spacing",
      label: "Espacement",
      done:
        tokens.spacingPreset !== DEFAULT_TOKENS.spacingPreset ||
        tokens.spacingDensity !== DEFAULT_TOKENS.spacingDensity,
      hint: "Ajuste ton preset de spacing ou la densité.",
    },
    {
      key: "radius",
      label: "Radius",
      done: tokens.radius !== DEFAULT_TOKENS.radius,
      hint: "Choisis un niveau de radius selon ton style.",
    },
    {
      key: "shadow",
      label: "Shadow",
      done: tokens.shadow !== DEFAULT_TOKENS.shadow,
      hint: "Choisis un niveau d'élévation pour tes cards.",
    },
    {
      key: "marriage-min",
      label: "Mariage (bg + text)",
      done: selectedColors.length >= 2,
      hint: "Sélectionne au moins 2 couleurs dans le mariage.",
    },
    {
      key: "marriage-full",
      label: "Mariage complet (4 rôles)",
      done: selectedColors.length >= 4,
      hint: "Sélectionne 4 couleurs : Background + Text + Accent + Secondary.",
    },
    {
      key: "no-errors",
      label: "Aucune erreur WCAG",
      done: errors === 0 && selectedColors.length >= 2,
      hint:
        "Aucune paire WCAG ne fail. Vérifie le rapport de contraste dans le bloc mariage.",
    },
  ];
}

export default function ValidationBanner({
  primaryHex,
  palette,
  selectedColors,
  tokens,
}: {
  primaryHex: string;
  palette: PaletteShade[];
  selectedColors: { role: string; hex: string }[];
  tokens: TokensState;
}) {
  const [open, setOpen] = useState(false);
  const issues = useMemo(
    () =>
      validateDesignSystem({
        primaryHex,
        palette,
        selectedColors,
        typoBaseSize: tokens.typoBaseSize,
        typoRatio: tokens.typoRatio,
        spacingPreset: tokens.spacingPreset,
        spacingDensity: tokens.spacingDensity,
        radius: tokens.radius,
        shadow: tokens.shadow,
      }),
    [primaryHex, palette, selectedColors, tokens]
  );

  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.filter((i) => i.level === "warning").length;
  const infos = issues.filter((i) => i.level === "info").length;

  const progress = useMemo(
    () => computeProgress(selectedColors, tokens, issues),
    [selectedColors, tokens, issues]
  );
  const doneCount = progress.filter((p) => p.done).length;
  const progressPct = Math.round((doneCount / progress.length) * 100);

  // Couleur globale du bandeau
  const borderColor =
    errors > 0
      ? "border-red-500/30"
      : warnings > 0
      ? "border-amber-500/30"
      : progressPct === 100
      ? "border-green-500/30"
      : "border-blue-500/30";
  const bgColor =
    errors > 0
      ? "bg-red-500/5"
      : warnings > 0
      ? "bg-amber-500/5"
      : progressPct === 100
      ? "bg-green-500/5"
      : "bg-blue-500/5";
  const progressBarColor =
    progressPct === 100
      ? "bg-green-500"
      : progressPct >= 70
      ? "bg-accent"
      : progressPct >= 40
      ? "bg-amber-500"
      : "bg-muted";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-3 space-y-3`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 text-sm text-left"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold">
            {progressPct === 100 ? "✅ Design system complet" : `Progression : ${doneCount}/${progress.length}`}
          </span>
          <div className="flex items-center gap-2">
            {errors > 0 && <span className="text-xs">🚨 {errors} erreur{errors > 1 ? "s" : ""}</span>}
            {warnings > 0 && (
              <span className="text-xs">⚠️ {warnings} alerte{warnings > 1 ? "s" : ""}</span>
            )}
            {infos > 0 && <span className="text-xs text-muted">💡 {infos} info{infos > 1 ? "s" : ""}</span>}
          </div>
        </div>
        <span className="text-xs text-muted">{open ? "Replier ▲" : "Détails ▼"}</span>
      </button>

      {/* Barre de progression */}
      <div className="w-full h-2 bg-card/50 rounded-full overflow-hidden border border-border/50">
        <div
          className={`h-full ${progressBarColor} transition-all duration-500`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {open && (
        <div className="space-y-3 pt-1">
          {/* Checklist de progression */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
              Checklist design system ({doneCount}/{progress.length})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
              {progress.map((p) => (
                <div
                  key={p.key}
                  className="flex items-start gap-2 text-xs"
                  title={p.hint}
                >
                  <span className="shrink-0 w-4 h-4 flex items-center justify-center mt-0.5">
                    {p.done ? (
                      <span className="text-green-600 font-bold">✓</span>
                    ) : (
                      <span className="w-3 h-3 rounded-full border border-muted" />
                    )}
                  </span>
                  <span className={p.done ? "text-foreground" : "text-muted"}>{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues détaillées */}
          {issues.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2">
                Issues ({issues.length})
              </div>
              <div className="space-y-2">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IssueCard({ issue }: { issue: ValidationIssue }) {
  return (
    <div className={`rounded-lg border p-3 ${severityColorClass(issue.level)}`}>
      <div className="flex items-start gap-2">
        <span className="text-base shrink-0">{severityIcon(issue.level)}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
            {issue.title}
            <span className="text-[10px] font-mono text-muted uppercase">{issue.category}</span>
          </div>
          <div className="text-xs text-muted mt-0.5">{issue.hint}</div>
        </div>
      </div>
    </div>
  );
}
