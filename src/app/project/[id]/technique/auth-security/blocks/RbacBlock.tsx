"use client";

import { useState } from "react";
import type { AuthSecState, RbacApproach } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const APPROACHES: { value: RbacApproach; label: string; hint: string }[] = [
  { value: "app-metadata", label: "app_metadata (JWT)", hint: "🔥 Sûr — non modifiable par user." },
  { value: "user-metadata", label: "user_metadata", hint: "⚠️ Modifiable par user = FAILLE." },
  { value: "db-table", label: "Table roles dédiée", hint: "Custom table user_roles + policies." },
  { value: "none", label: "Aucun RBAC", hint: "App mono-rôle, tous users = pareil." },
];

export default function RbacBlock({ state, onChange }: { state: AuthSecState; onChange: (p: Partial<AuthSecState>) => void; }) {
  const [roleDraft, setRoleDraft] = useState("");
  const filled = (state.rbacApproach ? 1 : 0) + (state.roles.length >= 2 ? 1 : 0);

  function addRole() {
    const r = roleDraft.trim();
    if (!r || state.roles.includes(r)) return;
    onChange({ roles: [...state.roles, r] });
    setRoleDraft("");
  }

  function removeRole(r: string) {
    onChange({ roles: state.roles.filter((x) => x !== r) });
  }

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">👥 RBAC & Authorization</h3>
          <p className="text-xs text-muted mt-0.5">Qui fait quoi. RLS DB vérifie ensuite (voir chap 5).</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {APPROACHES.map((a) => (
          <button key={a.value} type="button" onClick={() => onChange({ rbacApproach: a.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.rbacApproach === a.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="text-xs font-semibold mb-0.5">{a.label}</div>
            <div className="text-[11px] text-muted">{a.hint}</div>
          </button>
        ))}
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Rôles définis</div>
        <div className="flex gap-2 mb-2">
          <input type="text" value={roleDraft} onChange={(e) => setRoleDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRole(); } }}
            placeholder="Ex: admin, user, viewer"
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
          <button type="button" onClick={addRole} disabled={!roleDraft.trim()}
            className="px-3 py-2 bg-accent text-white rounded-xl text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition">
            + Ajouter
          </button>
        </div>
        {state.roles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {state.roles.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5 text-xs bg-card border border-border rounded-full px-2.5 py-1">
                {r}
                <button type="button" onClick={() => removeRole(r)} aria-label={`Supprimer ${r}`} className="text-muted hover:text-red-500">✕</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
