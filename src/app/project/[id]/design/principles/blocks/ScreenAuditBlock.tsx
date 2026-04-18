"use client";

import { useState } from "react";
import type {
  PrinciplesState,
  ScreenAuditEntry,
  ScreenAuditType,
} from "../state";
import { makeId } from "../state";
import BlockStatus from "../components/BlockStatus";

const SCREEN_TYPES: {
  key: ScreenAuditType;
  emoji: string;
  label: string;
  heuristics: { slug: string; title: string }[];
}[] = [
  {
    key: "landing",
    emoji: "🏠",
    label: "Landing",
    heuristics: [
      { slug: "aesthetic", title: "Aesthetic-Usability" },
      { slug: "peak-end", title: "Peak-End (hero)" },
      { slug: "jakob", title: "Jakob's Law" },
    ],
  },
  {
    key: "auth",
    emoji: "🔐",
    label: "Auth / Signup",
    heuristics: [
      { slug: "postel", title: "Postel's Law" },
      { slug: "error-prevention", title: "Nielsen H5 error prevention" },
      { slug: "fitts", title: "Fitts (CTA)" },
    ],
  },
  {
    key: "dashboard",
    emoji: "📊",
    label: "Dashboard",
    heuristics: [
      { slug: "miller", title: "Miller (chunking)" },
      { slug: "serial-position", title: "Serial Position" },
      { slug: "hick", title: "Hick (actions)" },
    ],
  },
  {
    key: "form",
    emoji: "📝",
    label: "Formulaire",
    heuristics: [
      { slug: "postel", title: "Postel's Law (tolérance)" },
      { slug: "error-prevention", title: "Nielsen H5" },
      { slug: "goal-gradient", title: "Goal-Gradient" },
    ],
  },
  {
    key: "list",
    emoji: "📋",
    label: "Liste",
    heuristics: [
      { slug: "fitts", title: "Fitts (targets tactiles)" },
      { slug: "proximity", title: "Proximity (Gestalt)" },
      { slug: "zeigarnik", title: "Zeigarnik" },
    ],
  },
  {
    key: "detail",
    emoji: "📄",
    label: "Detail",
    heuristics: [
      { slug: "similarity", title: "Similarity (Gestalt)" },
      { slug: "consistency", title: "Nielsen H4 consistency" },
      { slug: "user-control", title: "Nielsen H3 undo" },
    ],
  },
  {
    key: "settings",
    emoji: "⚙️",
    label: "Settings",
    heuristics: [
      { slug: "hick", title: "Hick (regroupements)" },
      { slug: "recognition", title: "Nielsen H6 recognition" },
    ],
  },
  {
    key: "empty",
    emoji: "📭",
    label: "Empty state",
    heuristics: [
      { slug: "von-restorff", title: "Von Restorff (CTA qui ressort)" },
      { slug: "paradox-active-user", title: "Paradox Active User" },
    ],
  },
  {
    key: "error",
    emoji: "❌",
    label: "Error state",
    heuristics: [
      { slug: "recovery", title: "Nielsen H9 recovery" },
      { slug: "peak-end", title: "Peak-End (ne pas clore sur négatif)" },
    ],
  },
];

export default function ScreenAuditBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.screenAudits.length > 0);
  const [addingType, setAddingType] = useState<ScreenAuditType | null>(null);
  const ok = state.screenAudits.length >= 2;

  function addAudit(type: ScreenAuditType) {
    const next: ScreenAuditEntry = {
      id: makeId("sa"),
      screenType: type,
      screenName: "",
      passed: [],
      failed: [],
      notes: "",
    };
    onChange({ screenAudits: [...state.screenAudits, next] });
    setAddingType(null);
  }

  function update(id: string, patch: Partial<ScreenAuditEntry>) {
    onChange({
      screenAudits: state.screenAudits.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function remove(id: string) {
    onChange({ screenAudits: state.screenAudits.filter((s) => s.id !== id) });
  }

  function togglePass(id: string, slug: string) {
    const entry = state.screenAudits.find((s) => s.id === id);
    if (!entry) return;
    if (entry.passed.includes(slug)) {
      update(id, {
        passed: entry.passed.filter((s) => s !== slug),
        failed: [...entry.failed.filter((s) => s !== slug), slug],
      });
    } else if (entry.failed.includes(slug)) {
      update(id, { failed: entry.failed.filter((s) => s !== slug) });
    } else {
      update(id, { passed: [...entry.passed, slug] });
    }
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
          🔎 Audit par type d&apos;écran
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">({state.screenAudits.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Règles prioritaires par type d&apos;écran.</strong>{" "}
            Chaque écran a ses heuristiques clés — ici on les check en contexte.
          </div>

          <div className="space-y-2">
            {state.screenAudits.map((a) => {
              const meta = SCREEN_TYPES.find((s) => s.key === a.screenType);
              return (
                <div
                  key={a.id}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta?.emoji}</span>
                    <input
                      type="text"
                      value={a.screenName}
                      onChange={(e) => update(a.id, { screenName: e.target.value })}
                      placeholder={`${meta?.label ?? "Écran"} — nom (ex: /dashboard)`}
                      className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
                    />
                    <button
                      onClick={() => remove(a.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-1">
                    {meta?.heuristics.map((h) => {
                      const isPassed = a.passed.includes(h.slug);
                      const isFailed = a.failed.includes(h.slug);
                      return (
                        <button
                          key={h.slug}
                          onClick={() => togglePass(a.id, h.slug)}
                          className={`w-full flex items-center gap-2 text-xs p-2 rounded border transition text-left ${
                            isPassed
                              ? "border-green-500/50 bg-green-500/5 text-green-700 dark:text-green-400"
                              : isFailed
                              ? "border-red-500/50 bg-red-500/5 text-red-500"
                              : "border-border bg-card hover:bg-accent/5"
                          }`}
                        >
                          <span>
                            {isPassed ? "✓" : isFailed ? "✗" : "○"}
                          </span>
                          <span className="flex-1">{h.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={a.notes}
                    onChange={(e) => update(a.id, { notes: e.target.value })}
                    placeholder="Notes / correctifs à faire"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                </div>
              );
            })}
          </div>

          {addingType === null ? (
            <button
              onClick={() => setAddingType(SCREEN_TYPES[0].key)}
              className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
            >
              + Auditer un type d&apos;écran
            </button>
          ) : (
            <div className="bg-card/60 border border-accent/30 rounded-xl p-3 space-y-2">
              <div className="text-xs font-semibold">Choisis le type :</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {SCREEN_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => addAudit(t.key)}
                    className="text-left p-2 rounded border border-border bg-card hover:border-accent hover:bg-accent/5 transition"
                  >
                    <div className="text-base">{t.emoji}</div>
                    <div className="text-xs font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAddingType(null)}
                className="text-xs text-muted hover:text-foreground"
              >
                Annuler
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
