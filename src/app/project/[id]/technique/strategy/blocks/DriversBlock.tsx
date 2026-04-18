"use client";

import type { DriverRow, StrategyState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

export default function DriversBlock({
  state,
  onChange,
}: {
  state: StrategyState;
  onChange: (patch: Partial<StrategyState>) => void;
}) {
  const filled = state.drivers.filter((d) => d.reason.trim().length > 0).length;

  function updateDriver(id: string, patch: Partial<DriverRow>) {
    onChange({
      drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  }

  return (
    <CollapsibleSection
      emoji="⚖️"
      title="Drivers de décision"
      description="Pondère les critères selon ton projet. Remplis au moins 3 raisons — ça structure ton ADR."
      filled={filled}
      total={state.drivers.length}
      storageKey="mindeck:technique:strategy:drivers:open"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-muted">
              <th className="text-left font-semibold py-2 pr-3">Critère</th>
              <th className="text-left font-semibold py-2 px-2 w-32">Importance</th>
              <th className="text-left font-semibold py-2 px-2">Raison</th>
              <th className="text-left font-semibold py-2 pl-2">Impact sur choix</th>
            </tr>
          </thead>
          <tbody>
            {state.drivers.map((d) => (
              <tr key={d.id} className="border-t border-border align-top">
                <td className="py-2 pr-3 text-xs font-medium">{d.name}</td>
                <td className="py-2 px-2">
                  <select
                    value={d.importance}
                    onChange={(e) => updateDriver(d.id, { importance: Number(e.target.value) })}
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs"
                    aria-label={`Importance de ${d.name}`}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}/5
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={d.reason}
                    onChange={(e) => updateDriver(d.id, { reason: e.target.value })}
                    placeholder="Pourquoi c'est important ?"
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </td>
                <td className="py-2 pl-2">
                  <input
                    type="text"
                    value={d.impact}
                    onChange={(e) => updateDriver(d.id, { impact: e.target.value })}
                    placeholder="Impact sur ta stack"
                    className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CollapsibleSection>
  );
}
