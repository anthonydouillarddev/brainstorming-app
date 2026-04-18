"use client";

import type { AuthSecState, OwaspStatus } from "../state";
import { OWASP_ITEMS } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

export default function OwaspBlock({ state, onChange }: { state: AuthSecState; onChange: (p: Partial<AuthSecState>) => void; }) {
  const compliant = state.owaspStatuses.filter((s) => s.status === "compliant" || s.status === "not-applicable").length;

  function updateItem(id: string, patch: Partial<OwaspStatus>) {
    onChange({
      owaspStatuses: state.owaspStatuses.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🛡️ OWASP Top 10:2025</h3>
          <p className="text-xs text-muted mt-0.5">Référence absolue sécurité applicative. Coche ce qui est traité.</p>
        </div>
        <BlockStatus filled={compliant} total={OWASP_ITEMS.length} />
      </div>

      <div className="space-y-2">
        {OWASP_ITEMS.map((item) => {
          const st = state.owaspStatuses.find((s) => s.id === item.id);
          if (!st) return null;
          return (
            <div key={item.id} className="bg-background/60 border border-border rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold">
                    <span className="font-mono text-[10px] text-muted mr-1.5">{item.id}</span>
                    {item.label}
                  </div>
                  <div className="text-[11px] text-muted">{item.hint}</div>
                </div>
                <select value={st.status} onChange={(e) => updateItem(item.id, { status: e.target.value as OwaspStatus["status"] })}
                  className="bg-background border border-border rounded-lg px-2 py-1 text-xs">
                  <option value="todo">⏳ À faire</option>
                  <option value="compliant">✅ Conforme</option>
                  <option value="not-applicable">➖ N/A</option>
                </select>
              </div>
              {(st.status === "compliant" || st.status === "not-applicable") && (
                <input type="text" value={st.evidence} onChange={(e) => updateItem(item.id, { evidence: e.target.value })}
                  placeholder={st.status === "compliant" ? "Evidence (ex: RLS policies actives sur toutes les tables)" : "Pourquoi non-applicable ?"}
                  className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
