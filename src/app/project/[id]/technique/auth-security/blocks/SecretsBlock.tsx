"use client";

import type { AuthSecState, PasswordPolicy, SecretsStorage } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const STORAGES: { value: SecretsStorage; label: string; hint: string }[] = [
  { value: "env-vars", label: ".env.local", hint: "Dev local gitignored." },
  { value: "vercel-secrets", label: "Vercel Secrets", hint: "🔥 Prod Vercel, injection auto." },
  { value: "vault", label: "HashiCorp Vault", hint: "Auto-rotation, audit." },
  { value: "doppler", label: "Doppler", hint: "SaaS secret sync multi-env." },
  { value: "secrets-manager", label: "AWS/GCP Secrets Manager", hint: "Cloud enterprise." },
];

const ROTATIONS: { value: AuthSecState["secretsRotation"]; label: string; hint: string }[] = [
  { value: "quarterly", label: "Trimestrielle", hint: "🔥 Recommandé." },
  { value: "yearly", label: "Annuelle", hint: "Minimum viable." },
  { value: "on-leak", label: "Sur leak", hint: "Risqué — rotation réactive seulement." },
  { value: "never", label: "⚠️ Jamais", hint: "Risque leak durable." },
];

const POLICIES: { value: PasswordPolicy; label: string; hint: string }[] = [
  { value: "nist-2024", label: "NIST 800-63B 2024", hint: "🔥 Min 8 chars, blacklist HIBP, pas rotation forcée." },
  { value: "legacy-complex", label: "Complexité forcée", hint: "Maj + chiffre + spécial. NIST a abandonné." },
  { value: "loose", label: "Laxiste (<8 chars)", hint: "⚠️ Trop faible." },
];

export default function SecretsBlock({ state, onChange }: { state: AuthSecState; onChange: (p: Partial<AuthSecState>) => void; }) {
  const filled = (state.secretsStorage ? 1 : 0) + (state.secretsRotation ? 1 : 0) + (state.passwordPolicy ? 1 : 0) + (state.hibpCheckEnabled ? 1 : 0) + (state.auditLogEnabled ? 1 : 0);

  return (
    <CollapsibleSection
      emoji="🔐"
      title="Secrets & Password policy"
      description="Où vivent les secrets + rotation + NIST password policy."
      filled={filled}
      total={5}
      storageKey="mindeck:technique:auth-security:secrets:open"
    >
      <div>
        <div className="text-xs font-semibold mb-2">Storage secrets</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {STORAGES.map((s) => (
            <button key={s.value} type="button" onClick={() => onChange({ secretsStorage: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.secretsStorage === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Rotation</div>
        <div className="grid sm:grid-cols-4 gap-2">
          {ROTATIONS.map((r) => (
            <button key={r.value} type="button" onClick={() => onChange({ secretsRotation: r.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.secretsRotation === r.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{r.label}</div>
              <div className="text-[11px] text-muted">{r.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Password policy</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {POLICIES.map((p) => (
            <button key={p.value} type="button" onClick={() => onChange({ passwordPolicy: p.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.passwordPolicy === p.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{p.label}</div>
              <div className="text-[11px] text-muted">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.hibpCheckEnabled} onChange={(e) => onChange({ hibpCheckEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">HIBP check passwords</div><div className="text-[11px] text-muted">haveibeenpwned.com API — bloque passwords leakés.</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.auditLogEnabled} onChange={(e) => onChange({ auditLogEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Audit log activé</div><div className="text-[11px] text-muted">Log signups, logins, role changes, deletes.</div></div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2}
          placeholder="Ex: Vercel secrets + rotation trimestrielle + audit_logs table Supabase"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
