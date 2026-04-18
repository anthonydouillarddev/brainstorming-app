"use client";

import { makeRiskId, type RiskRow, type StrategyState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const LEVELS: { value: RiskRow["probability"]; label: string; color: string }[] = [
  { value: "low", label: "Faible", color: "text-green-600 dark:text-green-400" },
  { value: "medium", label: "Moyenne", color: "text-amber-600 dark:text-amber-400" },
  { value: "high", label: "Élevée", color: "text-red-600 dark:text-red-400" },
];

const SUGGESTED_RISKS = [
  "La techno X scale assez pour mes prévisions d'usage",
  "Les coûts restent prévisibles et linéaires",
  "Je peux embaucher quelqu'un ayant cette techno",
  "L'adoption community sera stable 2+ ans",
  "Les performances seront acceptables en production",
  "Les données seront portables si je change fournisseur",
];

export default function RisksBlock({
  state,
  onChange,
}: {
  state: StrategyState;
  onChange: (patch: Partial<StrategyState>) => void;
}) {
  const valid = state.risks.filter(
    (r) => r.title.trim() && r.validationTest.trim()
  ).length;

  function addRisk(title: string = "") {
    const newRisk: RiskRow = {
      id: makeRiskId(),
      title,
      probability: "medium",
      impact: "medium",
      validationTest: "",
      deadline: "",
    };
    onChange({ risks: [...state.risks, newRisk] });
  }

  function updateRisk(id: string, patch: Partial<RiskRow>) {
    onChange({
      risks: state.risks.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function removeRisk(id: string) {
    onChange({ risks: state.risks.filter((r) => r.id !== id) });
  }

  return (
    <CollapsibleSection
      emoji="⚠️"
      title="Hypothèses risquées"
      description="Chaque techno porte des risques cachés. Les lister les rend visibles avec un test de validation + deadline."
      filled={valid}
      total={Math.max(valid, 2)}
      storageKey="mindeck:technique:strategy:risks:open"
    >
      {state.risks.length === 0 && (
        <div className="bg-background/60 border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-xs text-muted">Aucune hypothèse documentée. Suggestions :</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_RISKS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addRisk(s)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-card border border-border hover:border-accent hover:text-accent transition"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.risks.length > 0 && (
        <div className="space-y-3">
          {state.risks.map((r) => (
            <div
              key={r.id}
              className="bg-background/60 border border-border rounded-xl p-3 space-y-2"
            >
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={r.title}
                  onChange={(e) => updateRisk(r.id, { title: e.target.value })}
                  placeholder="Titre du risque"
                  className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => removeRisk(r.id)}
                  className="text-xs text-muted hover:text-red-500 px-1.5 py-1"
                  aria-label="Supprimer ce risque"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <label className="block text-[11px]">
                  <span className="text-muted block mb-0.5">Probabilité</span>
                  <select
                    value={r.probability}
                    onChange={(e) =>
                      updateRisk(r.id, { probability: e.target.value as RiskRow["probability"] })
                    }
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-[11px]">
                  <span className="text-muted block mb-0.5">Impact</span>
                  <select
                    value={r.impact}
                    onChange={(e) =>
                      updateRisk(r.id, { impact: e.target.value as RiskRow["impact"] })
                    }
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                  >
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-2">
                <label className="block text-[11px]">
                  <span className="text-muted block mb-0.5">Test de validation</span>
                  <input
                    type="text"
                    value={r.validationTest}
                    onChange={(e) => updateRisk(r.id, { validationTest: e.target.value })}
                    placeholder="Ex: Load test à 10K users"
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                  />
                </label>
                <label className="block text-[11px]">
                  <span className="text-muted block mb-0.5">Deadline</span>
                  <input
                    type="date"
                    value={r.deadline}
                    onChange={(e) => updateRisk(r.id, { deadline: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRisk()}
            className="w-full text-xs py-2 rounded-xl border border-dashed border-border hover:border-accent hover:text-accent transition"
          >
            + Ajouter un risque
          </button>
        </div>
      )}
    </CollapsibleSection>
  );
}
