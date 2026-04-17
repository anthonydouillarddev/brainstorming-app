"use client";

import { useState } from "react";
import type { IdentityState, ToneMatrixRow } from "../state";
import { TONE_MATRIX_EXTRA } from "../state";
import { validateToneMatrix } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const ROW_EXAMPLES: Record<string, { tone: string; exampleDo: string; exampleDont: string }> = {
  onboarding: {
    tone: "Accueillant, rassurant",
    exampleDo: "Bienvenue Paul. On a pré-rempli tes 3 projets pour t'épargner la saisie.",
    exampleDont: "Procédez à l'initialisation de votre espace personnel.",
  },
  error: {
    tone: "Empathique, sans blame",
    exampleDo: "Oups, notre serveur boude. Réessaie dans une minute.",
    exampleDont: "Error 500. An unexpected error occurred.",
  },
  success: {
    tone: "Enthousiaste mais sobre",
    exampleDo: "C'est envoyé. Tu peux fermer cette fenêtre.",
    exampleDont: "Votre opération a été traitée avec succès.",
  },
  empty: {
    tone: "Invitant, pas culpabilisant",
    exampleDo: "Rien ici pour l'instant. Crée ton premier projet ↓",
    exampleDont: "Aucun résultat trouvé.",
  },
  billing: {
    tone: "Transparent, calme",
    exampleDo: "Prochaine facture : 29 € le 12 mai. Rien d'autre à faire.",
    exampleDont: "Échéance due. Procédez au règlement sous 15 jours.",
  },
};

export default function ToneMatrixBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const filledCount = state.toneMatrix.filter((r) => r.tone.trim() || r.exampleDo.trim()).length;
  const [expanded, setExpanded] = useState(filledCount > 0);
  const issues = validateToneMatrix(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = filledCount >= 3 && !hasError;

  const currentRowIds = new Set(state.toneMatrix.map((r) => r.id));
  const availableExtras = TONE_MATRIX_EXTRA.filter((r) => !currentRowIds.has(r.id));

  function updateRow(id: string, patch: Partial<ToneMatrixRow>) {
    onChange({
      toneMatrix: state.toneMatrix.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function addRow(row: ToneMatrixRow) {
    onChange({ toneMatrix: [...state.toneMatrix, row] });
  }

  function removeRow(id: string) {
    // Ne pas pouvoir retirer les 3 contextes par défaut (onboarding, error, success)
    const defaults = new Set(["onboarding", "error", "success"]);
    if (defaults.has(id)) return;
    onChange({ toneMatrix: state.toneMatrix.filter((r) => r.id !== id) });
  }

  function fillExample(row: ToneMatrixRow) {
    const example = ROW_EXAMPLES[row.id];
    if (!example) return;
    updateRow(row.id, example);
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
          💬 Tone matrix
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({filledCount}/{state.toneMatrix.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && filledCount > 0 && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {state.toneMatrix
            .filter((r) => r.tone.trim())
            .slice(0, 3)
            .map((r) => `${r.contextEmoji} ${r.tone}`)
            .join(" · ")}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Voice vs Tone</strong> (Mailchimp) : ta voix est
            constante, ton ton s&apos;adapte au contexte. Tu es toujours toi, mais tu ne parles pas
            pareil à ton pote et à ton banquier.
          </div>

          <div className="space-y-3">
            {state.toneMatrix.map((row) => {
              const canRemove = !["onboarding", "error", "success"].includes(row.id);
              const hasExample = !!ROW_EXAMPLES[row.id];
              return (
                <div
                  key={row.id}
                  className="bg-card/60 border border-border rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{row.contextEmoji}</span>
                      <span className="font-semibold text-sm">{row.context}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasExample && (
                        <button
                          onClick={() => fillExample(row)}
                          className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                        >
                          💡 Remplir avec exemple
                        </button>
                      )}
                      {canRemove && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                          aria-label="Retirer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={row.tone}
                    onChange={(e) => updateRow(row.id, { tone: e.target.value })}
                    placeholder="Ton pour ce contexte (ex : empathique, sans blame)"
                    className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                        ✓ Exemple à écrire
                      </label>
                      <textarea
                        value={row.exampleDo}
                        onChange={(e) => updateRow(row.id, { exampleDo: e.target.value })}
                        placeholder="Une phrase qui reflète le ton"
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs rounded border border-green-500/30 bg-green-500/5"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-red-500">
                        ✗ À éviter
                      </label>
                      <textarea
                        value={row.exampleDont}
                        onChange={(e) => updateRow(row.id, { exampleDont: e.target.value })}
                        placeholder="Contre-exemple"
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs rounded border border-red-500/30 bg-red-500/5"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {availableExtras.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouter des contextes :</div>
              <div className="flex flex-wrap gap-2">
                {availableExtras.map((row) => (
                  <button
                    key={row.id}
                    onClick={() => addRow(row)}
                    className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {row.contextEmoji} {row.context}
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
