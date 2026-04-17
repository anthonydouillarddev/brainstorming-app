"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { InfoNavState, NavPattern } from "../state";
import { NAV_PATTERN_DEFAULT } from "../templates";
import { validateNavPattern } from "../validators";
import NavPreview from "../components/NavPreview";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

interface PatternInfo {
  key: NavPattern;
  emoji: string;
  label: string;
  description: string;
  bestFor: string;
}

const PATTERNS: PatternInfo[] = [
  {
    key: "sidebar",
    emoji: "📑",
    label: "Sidebar fixe",
    description: "Barre latérale permanente avec labels.",
    bestFor: "SaaS desktop, logiciel métier, ≥ 4 items",
  },
  {
    key: "sidebar-collapsible",
    emoji: "↔️",
    label: "Sidebar repliable",
    description: "Sidebar qui collapse en icons-only.",
    bestFor: "Apps denses avec beaucoup d'items",
  },
  {
    key: "top-tabs",
    emoji: "📂",
    label: "Top tabs",
    description: "Onglets horizontaux en haut.",
    bestFor: "Outils simples, < 6 sections",
  },
  {
    key: "bottom-nav",
    emoji: "📱",
    label: "Bottom nav",
    description: "Barre en bas d'écran, ≤ 5 items.",
    bestFor: "Appli mobile B2C",
  },
  {
    key: "hybrid",
    emoji: "🔄",
    label: "Hybride responsive",
    description: "Sidebar desktop + bottom nav mobile.",
    bestFor: "Apps cross-device",
  },
  {
    key: "command-only",
    emoji: "⌘",
    label: "Command palette",
    description: "Cmd+K uniquement, pas de nav visible.",
    bestFor: "Power users uniquement (Superhuman)",
  },
];

export default function NavPatternBlock({
  state,
  projectType,
  onChange,
}: {
  state: InfoNavState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(!state.navPattern);
  const issues = validateNavPattern(state, state.navPattern);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = !!state.navPattern && !hasError;

  const recommended = projectType ? NAV_PATTERN_DEFAULT[projectType] : null;
  const current = state.navPattern ?? recommended ?? "sidebar";

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧭 Pattern de navigation
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && state.navPattern && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {PATTERNS.find((p) => p.key === state.navPattern)?.emoji}{" "}
          {PATTERNS.find((p) => p.key === state.navPattern)?.label}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Anti-pattern classique</strong> : hamburger sur
            desktop divise par 2 l&apos;engagement (NN/g, Baymard). Réservé à mobile quand la
            place manque vraiment.
            {recommended && !state.navPattern && (
              <>
                <br />
                <strong className="text-foreground">Suggestion pour ton type projet</strong> :{" "}
                {PATTERNS.find((p) => p.key === recommended)?.label}.
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PATTERNS.map((p) => {
              const isSelected = state.navPattern === p.key;
              const isRecommended = p.key === recommended;
              return (
                <button
                  key={p.key}
                  onClick={() => onChange({ navPattern: p.key })}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="font-semibold text-sm">{p.label}</span>
                    {isRecommended && !isSelected && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent">
                        RECO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted mb-1">{p.description}</div>
                  <div className="text-[10px] text-muted/70">
                    <span className="font-semibold">Best for :</span> {p.bestFor}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold">Aperçu live — {PATTERNS.find((p) => p.key === current)?.label}</div>
            <NavPreview pattern={current} state={state} />
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
