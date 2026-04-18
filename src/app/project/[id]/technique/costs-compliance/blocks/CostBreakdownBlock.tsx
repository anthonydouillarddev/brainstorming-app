"use client";

import type { CostsState, CostScaleRow } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

export default function CostBreakdownBlock({ state, onChange }: { state: CostsState; onChange: (p: Partial<CostsState>) => void; }) {
  const filled = state.costs.filter((c) => c.service.trim() && c.at1k.trim()).length;

  function update(index: number, patch: Partial<CostScaleRow>) {
    onChange({ costs: state.costs.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  }

  function addRow() {
    onChange({ costs: [...state.costs, { service: "", at1: "", at100: "", at1k: "", at10k: "", at100k: "" }] });
  }

  function removeRow(index: number) {
    onChange({ costs: state.costs.filter((_, i) => i !== index) });
  }

  const totals = {
    at1: state.costs.reduce((sum, c) => sum + (Number(c.at1) || 0), 0),
    at100: state.costs.reduce((sum, c) => sum + (Number(c.at100) || 0), 0),
    at1k: state.costs.reduce((sum, c) => sum + (Number(c.at1k) || 0), 0),
    at10k: state.costs.reduce((sum, c) => sum + (Number(c.at10k) || 0), 0),
    at100k: state.costs.reduce((sum, c) => sum + (Number(c.at100k) || 0), 0),
  };

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">💸 Coûts mensuels @ N users</h3>
          <p className="text-xs text-muted mt-0.5">Matrice USD/mois par service à chaque palier. Pré-rempli 2026.</p>
        </div>
        <BlockStatus filled={filled} total={Math.max(filled, 3)} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-muted">
              <th className="text-left font-semibold py-2 pr-2">Service</th>
              <th className="text-right font-semibold py-2 px-1">@1</th>
              <th className="text-right font-semibold py-2 px-1">@100</th>
              <th className="text-right font-semibold py-2 px-1">@1k</th>
              <th className="text-right font-semibold py-2 px-1">@10k</th>
              <th className="text-right font-semibold py-2 px-1">@100k</th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {state.costs.map((c, i) => (
              <tr key={i} className="border-t border-border">
                <td className="py-1 pr-2">
                  <input type="text" value={c.service} onChange={(e) => update(i, { service: e.target.value })}
                    placeholder="Service" className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs" />
                </td>
                {(["at1", "at100", "at1k", "at10k", "at100k"] as const).map((k) => (
                  <td key={k} className="py-1 px-1">
                    <input type="number" min={0} value={c[k]} onChange={(e) => update(i, { [k]: e.target.value })}
                      className="w-16 bg-background border border-border rounded-lg px-1 py-1 text-xs text-right font-mono" />
                  </td>
                ))}
                <td className="py-1 text-center">
                  <button type="button" onClick={() => removeRow(i)} className="text-muted hover:text-red-500 text-xs" aria-label="Supprimer">✕</button>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-border font-semibold bg-background/40">
              <td className="py-2 pr-2">Total USD/mois</td>
              <td className="py-2 px-1 text-right font-mono">{totals.at1}</td>
              <td className="py-2 px-1 text-right font-mono">{totals.at100}</td>
              <td className="py-2 px-1 text-right font-mono">{totals.at1k}</td>
              <td className="py-2 px-1 text-right font-mono">{totals.at10k}</td>
              <td className="py-2 px-1 text-right font-mono">{totals.at100k}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" onClick={addRow}
        className="w-full text-xs py-2 rounded-xl border border-dashed border-border hover:border-accent hover:text-accent transition">
        + Ajouter service
      </button>
    </section>
  );
}
