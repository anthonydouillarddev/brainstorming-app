"use client";

import { useState } from "react";
import { makeRefId, type BrandReference, type IdentityState } from "../state";
import { validateReferences } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ReferencesBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const hasAny = state.references.length > 0 || state.antiReferences.length > 0;
  const [expanded, setExpanded] = useState(hasAny);
  const issues = validateReferences(state);
  const hasError = issues.some((i) => i.severity === "error");
  const ok = state.references.length > 0 && !hasError;

  function addRef(target: "refs" | "anti") {
    if (target === "refs" && state.references.length >= 3) return;
    if (target === "anti" && state.antiReferences.length >= 2) return;
    const next: BrandReference = { id: makeRefId(), name: "", why: "" };
    if (target === "refs") onChange({ references: [...state.references, next] });
    else onChange({ antiReferences: [...state.antiReferences, next] });
  }

  function updateRef(target: "refs" | "anti", id: string, patch: Partial<BrandReference>) {
    if (target === "refs") {
      onChange({
        references: state.references.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      });
    } else {
      onChange({
        antiReferences: state.antiReferences.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      });
    }
  }

  function removeRef(target: "refs" | "anti", id: string) {
    if (target === "refs") {
      onChange({ references: state.references.filter((r) => r.id !== id) });
    } else {
      onChange({ antiReferences: state.antiReferences.filter((r) => r.id !== id) });
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
          🔖 Références &amp; anti-références
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.references.length}/3 · {state.antiReferences.length}/2)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={false} />
      </div>

      {!expanded && hasAny && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          👍 {state.references.map((r) => r.name).filter(Boolean).join(", ") || "—"}
          {state.antiReferences.length > 0 && (
            <>
              {" "}
              · 👎{" "}
              {state.antiReferences.map((r) => r.name).filter(Boolean).join(", ") || "—"}
            </>
          )}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Dire ce qu&apos;on n&apos;est PAS</strong> est
            souvent plus clair que ce qu&apos;on est. Notion se définit beaucoup comme
            &laquo; pas Microsoft Office &raquo;.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RefList
              title="👍 Marques inspirantes (3 max)"
              titleColor="text-green-600 dark:text-green-400"
              borderColor="border-green-500/30"
              bgColor="bg-green-500/5"
              items={state.references}
              max={3}
              whyPlaceholder="Ce que j'aime (ex : ton direct, pas de bullshit)"
              onAdd={() => addRef("refs")}
              onUpdate={(id, patch) => updateRef("refs", id, patch)}
              onRemove={(id) => removeRef("refs", id)}
            />
            <RefList
              title="👎 Anti-références (2 max)"
              titleColor="text-red-600 dark:text-red-400"
              borderColor="border-red-500/30"
              bgColor="bg-red-500/5"
              items={state.antiReferences}
              max={2}
              whyPlaceholder="Ce que je veux éviter (ex : jargon corporate, exclamations)"
              onAdd={() => addRef("anti")}
              onUpdate={(id, patch) => updateRef("anti", id, patch)}
              onRemove={(id) => removeRef("anti", id)}
            />
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function RefList({
  title,
  titleColor,
  borderColor,
  bgColor,
  items,
  max,
  whyPlaceholder,
  onAdd,
  onUpdate,
  onRemove,
}: {
  title: string;
  titleColor: string;
  borderColor: string;
  bgColor: string;
  items: BrandReference[];
  max: number;
  whyPlaceholder: string;
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<BrandReference>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-3 space-y-2`}>
      <div className={`text-sm font-semibold ${titleColor}`}>{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="space-y-1 bg-card border border-border rounded-lg p-2">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                placeholder="Nom de la marque"
                className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
              />
              <button
                onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                aria-label="Retirer"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={item.why}
              onChange={(e) => onUpdate(item.id, { why: e.target.value })}
              placeholder={whyPlaceholder}
              className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
            />
          </div>
        ))}
        {items.length < max && (
          <button
            onClick={onAdd}
            className="w-full text-xs px-3 py-2 rounded border border-dashed border-border bg-card hover:bg-accent/5 transition"
          >
            + Ajouter
          </button>
        )}
      </div>
    </div>
  );
}
