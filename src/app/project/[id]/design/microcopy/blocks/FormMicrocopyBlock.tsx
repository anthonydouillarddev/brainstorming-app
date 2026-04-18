"use client";

import { useState } from "react";
import type { FieldKind, FormFieldEntry, MicrocopyState } from "../state";
import { FIELD_KIND_META, makeId } from "../state";
import { FIELD_KIND_TIPS, FORM_FIELD_PRESETS } from "../microcopy-library";
import { validateFormFields } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function FormMicrocopyBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.formFields.length > 0);
  const issues = validateFormFields(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.formFields.length >= 3 && !hasError;

  function addPreset(preset: (typeof FORM_FIELD_PRESETS)[number]) {
    const next: FormFieldEntry = { id: makeId("fld"), ...preset };
    onChange({ formFields: [...state.formFields, next] });
  }

  function addCustom() {
    const next: FormFieldEntry = {
      id: makeId("fld"),
      fieldName: "",
      kind: "text",
      label: "",
      placeholder: "",
      helperText: "",
      errorRequired: "",
      errorInvalid: "",
      notes: "",
    };
    onChange({ formFields: [...state.formFields, next] });
  }

  function update(id: string, patch: Partial<FormFieldEntry>) {
    onChange({
      formFields: state.formFields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function remove(id: string) {
    onChange({ formFields: state.formFields.filter((f) => f.id !== id) });
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
          📝 Form microcopy
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.formFields.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">NN/G + GOV.UK.</strong> Par champ :{" "}
            <strong>label</strong> (A11y obligatoire), <strong>placeholder</strong> (illustratif,
            ≠ label), <strong>helper</strong> (pourquoi tu demandes), <strong>errors</strong>{" "}
            (required + invalid). Jamais le placeholder seul — il disparaît à la frappe.
          </div>

          {state.formFields.length > 0 && (
            <div className="space-y-2">
              {state.formFields.map((f) => {
                const meta = FIELD_KIND_META[f.kind];
                const tips = FIELD_KIND_TIPS[f.kind];
                return (
                  <div
                    key={f.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={f.kind}
                        onChange={(e) => update(f.id, { kind: e.target.value as FieldKind })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(FIELD_KIND_META) as FieldKind[]).map((k) => (
                          <option key={k} value={k}>
                            {FIELD_KIND_META[k].emoji} {FIELD_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={f.fieldName}
                        onChange={(e) => update(f.id, { fieldName: e.target.value })}
                        placeholder="Nom technique (ex: email, projectName)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card font-mono text-xs"
                      />
                      <button
                        onClick={() => remove(f.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => update(f.id, { label: e.target.value })}
                        placeholder="Label (ex: Email)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <input
                        type="text"
                        value={f.placeholder}
                        onChange={(e) => update(f.id, { placeholder: e.target.value })}
                        placeholder={`Placeholder (${tips.placeholder || "illustratif"})`}
                        className="h-8 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
                    </div>
                    <input
                      type="text"
                      value={f.helperText}
                      onChange={(e) => update(f.id, { helperText: e.target.value })}
                      placeholder={`Helper (${tips.helper || "pourquoi on demande"})`}
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={f.errorRequired}
                        onChange={(e) => update(f.id, { errorRequired: e.target.value })}
                        placeholder="Erreur « requis »"
                        className="h-7 px-2 text-xs rounded border border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
                      />
                      <input
                        type="text"
                        value={f.errorInvalid}
                        onChange={(e) => update(f.id, { errorInvalid: e.target.value })}
                        placeholder="Erreur « format invalide »"
                        className="h-7 px-2 text-xs rounded border border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
                      />
                    </div>
                    {(f.label || f.placeholder || f.helperText) && (
                      <div className="bg-card/60 border border-dashed border-border rounded-lg p-3 space-y-1">
                        {f.label && (
                          <div className="text-[11px] font-medium">
                            {meta.emoji} {f.label}
                          </div>
                        )}
                        <input
                          type={f.kind === "password" ? "password" : "text"}
                          placeholder={f.placeholder}
                          readOnly
                          className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                        />
                        {f.helperText && (
                          <div className="text-[10px] text-muted">{f.helperText}</div>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      value={f.notes}
                      onChange={(e) => update(f.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {FORM_FIELD_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {FIELD_KIND_META[p.kind].emoji} {p.fieldName}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Champ personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
