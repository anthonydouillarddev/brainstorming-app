"use client";

import { useMemo, useState } from "react";
import type { ScreenArchetype, StatesState } from "../state";
import { ARCHETYPE_REQUIREMENTS, guessArchetype } from "../state";
import BlockStatus from "../components/BlockStatus";

interface AuditRow {
  screenId: string;
  title: string;
  archetype: ScreenArchetype;
  declared: { loading: boolean; empty: boolean; error: boolean; success: boolean };
  required: Array<"loading" | "empty" | "error" | "success">;
  missing: Array<"loading" | "empty" | "error" | "success">;
  extra: Array<"loading" | "empty" | "error" | "success">;
  coverage: number; // 0-100
}

function auditScreens(state: StatesState): AuditRow[] {
  return state.screens.map((s) => {
    const archetype = guessArchetype(s.title);
    const requirement = ARCHETYPE_REQUIREMENTS[archetype];
    const declared = {
      loading: s.needsLoading,
      empty: s.needsEmpty,
      error: s.needsError,
      success: s.needsSuccess,
    };
    const required = requirement.required;
    const missing = required.filter((k) => !declared[k]);
    const declaredKeys: Array<"loading" | "empty" | "error" | "success"> = [];
    (Object.keys(declared) as Array<keyof typeof declared>).forEach((k) => {
      if (declared[k]) declaredKeys.push(k);
    });
    const extra = declaredKeys.filter((k) => !required.includes(k));
    const coverage =
      required.length === 0
        ? 100
        : Math.round(((required.length - missing.length) / required.length) * 100);
    return {
      screenId: s.id,
      title: s.title,
      archetype,
      declared,
      required,
      missing,
      extra,
      coverage,
    };
  });
}

export default function ScreenAuditBlock({ state }: { state: StatesState }) {
  const [expanded, setExpanded] = useState(state.screens.length > 0);
  const rows = useMemo(() => auditScreens(state), [state]);
  const avgCoverage =
    rows.length > 0
      ? Math.round(rows.reduce((acc, r) => acc + r.coverage, 0) / rows.length)
      : 0;
  const missingTotal = rows.reduce((acc, r) => acc + r.missing.length, 0);
  const hasWarn = missingTotal > 0;
  const ok = rows.length > 0 && missingTotal === 0;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🔍 Screen audit
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({rows.length} écran{rows.length > 1 ? "s" : ""} · couverture {avgCoverage}%)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Audit automatique.</strong> Pour chaque écran, on
            détecte l&apos;archétype (liste, formulaire, détail…) et on vérifie que les états
            requis sont bien cochés. L&apos;archétype est deviné d&apos;après le titre.
          </div>

          {rows.length === 0 && (
            <div className="text-xs text-muted italic px-2 py-3 text-center">
              Ajoute des écrans dans le bloc « Inventaire des écrans » pour activer l&apos;audit.
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-1.5">
              {rows.map((r) => {
                const arch = ARCHETYPE_REQUIREMENTS[r.archetype];
                const color =
                  r.coverage === 100
                    ? "border-green-500/30 bg-green-500/5"
                    : r.coverage >= 66
                      ? "border-amber-500/30 bg-amber-500/5"
                      : "border-red-500/30 bg-red-500/5";
                return (
                  <div
                    key={r.screenId}
                    className={`p-2.5 rounded-lg border ${color} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium flex-1">
                        {arch.emoji} {r.title || "(sans titre)"}{" "}
                        <span className="text-muted font-normal">· {arch.label}</span>
                      </span>
                      <span className="text-[11px] font-mono">
                        {r.coverage}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(["loading", "empty", "error", "success"] as const).map((k) => {
                        const isRequired = r.required.includes(k);
                        const isDeclared = r.declared[k];
                        const isMissing = isRequired && !isDeclared;
                        const label =
                          k === "loading"
                            ? "⏳ Loading"
                            : k === "empty"
                              ? "🌱 Empty"
                              : k === "error"
                                ? "⚠️ Error"
                                : "✅ Success";
                        return (
                          <span
                            key={k}
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                              isMissing
                                ? "bg-red-500/10 border-red-500/40 text-red-600"
                                : isDeclared
                                  ? "bg-green-500/10 border-green-500/40 text-green-600"
                                  : "border-border text-muted"
                            }`}
                            title={
                              isMissing
                                ? `Requis pour ${arch.label} mais non coché`
                                : isDeclared
                                  ? "Couvert"
                                  : "Non requis"
                            }
                          >
                            {isMissing ? "⚠ " : isDeclared ? "✓ " : ""}
                            {label}
                          </span>
                        );
                      })}
                    </div>
                    {r.missing.length > 0 && (
                      <div className="text-[10px] text-red-600">
                        Manquant :{" "}
                        {r.missing
                          .map((k) =>
                            k === "loading"
                              ? "loading"
                              : k === "empty"
                                ? "empty"
                                : k === "error"
                                  ? "error"
                                  : "success"
                          )
                          .join(", ")}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {rows.length > 0 && (
            <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted">
              <strong className="text-foreground">Synthèse :</strong>{" "}
              {missingTotal === 0
                ? "tous les écrans couvrent les états requis pour leur archétype."
                : `${missingTotal} état(s) manquant(s) au total. Complète l'inventaire ou ajoute les patterns correspondants.`}
            </div>
          )}
        </>
      )}
    </div>
  );
}
