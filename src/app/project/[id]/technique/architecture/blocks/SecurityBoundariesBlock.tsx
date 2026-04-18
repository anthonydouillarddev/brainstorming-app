"use client";

import type {
  ArchitectureState,
  AuthMethod,
  DataIsolation,
  SecretsMgmt,
  HttpsEnforcement,
} from "../state";
import BlockStatus from "../components/BlockStatus";

const AUTH_METHODS: { value: AuthMethod; label: string }[] = [
  { value: "jwt-session", label: "JWT en cookie (SSR)" },
  { value: "oauth", label: "OAuth 2.1 + PKCE" },
  { value: "magic-link", label: "Magic link email" },
  { value: "passkey", label: "Passkey WebAuthn" },
  { value: "api-key", label: "API key (outil)" },
];

const DATA_ISOLATION: { value: DataIsolation; label: string; hint: string }[] = [
  { value: "rls-db", label: "RLS DB", hint: "Postgres RLS policies (Supabase default)" },
  { value: "app-code", label: "App code", hint: "Vérification en code applicatif" },
  { value: "both", label: "Les deux", hint: "Défense en profondeur (recommandé)" },
];

const SECRETS_MGMT: { value: SecretsMgmt; label: string; hint: string }[] = [
  { value: "env-vars", label: ".env.local", hint: "Dev local (gitignored)" },
  { value: "vercel-secrets", label: "Vercel secrets", hint: "Production Vercel" },
  { value: "vault", label: "HashiCorp Vault", hint: "Auto-rotation, audit trail" },
  { value: "secrets-manager", label: "AWS/GCP Secrets Manager", hint: "Enterprise" },
];

const HTTPS_ENFORCEMENT: { value: HttpsEnforcement; label: string; hint: string }[] = [
  { value: "always", label: "Always", hint: "Recommandé — HSTS + redirect" },
  { value: "production-only", label: "Production only", hint: "HTTP OK en dev local" },
  { value: "optional", label: "⚠️ Optional", hint: "Déconseillé — faille sécu" },
];

export default function SecurityBoundariesBlock({
  state,
  onChange,
}: {
  state: ArchitectureState;
  onChange: (patch: Partial<ArchitectureState>) => void;
}) {
  const filled = [state.authMethod, state.dataIsolation, state.secretsMgmt, state.httpsEnforcement].filter(
    (v) => v !== ""
  ).length;

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🔒 Sécurité & Auth boundaries</h3>
          <p className="text-xs text-muted mt-0.5">
            Définit la surface d&apos;attaque. Détails OWASP complets dans chap 6 Auth & Sécurité.
          </p>
        </div>
        <BlockStatus filled={filled} total={4} />
      </div>

      <SelectGroup
        label="Méthode d'auth"
        value={state.authMethod}
        options={AUTH_METHODS}
        onChange={(v) => onChange({ authMethod: v as AuthMethod })}
      />

      <div>
        <div className="text-xs font-semibold mb-2">Data isolation</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {DATA_ISOLATION.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onChange({ dataIsolation: d.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.dataIsolation === d.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{d.label}</div>
              <div className="text-[11px] text-muted">{d.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Secrets management</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {SECRETS_MGMT.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ secretsMgmt: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.secretsMgmt === s.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">HTTPS enforcement</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {HTTPS_ENFORCEMENT.map((h) => (
            <button
              key={h.value}
              type="button"
              onClick={() => onChange({ httpsEnforcement: h.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.httpsEnforcement === h.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{h.label}</div>
              <div className="text-[11px] text-muted">{h.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SelectGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (v: T | "") => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      >
        <option value="">— Choisir —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
