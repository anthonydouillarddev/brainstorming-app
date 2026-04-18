"use client";

import type { AuthMethodValue, AuthSecState, SessionStorage as SessionStorageType } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const METHODS: { value: AuthMethodValue; label: string; hint: string }[] = [
  { value: "email-password", label: "Email + password", hint: "Classique. Ajoute MFA obligatoire." },
  { value: "magic-link", label: "Magic link email", hint: "UX simple, pas de password à gérer." },
  { value: "oauth", label: "OAuth 2.1 + PKCE", hint: "Google/GitHub/Microsoft." },
  { value: "passkey", label: "Passkey (WebAuthn)", hint: "🌱 Tendance 2026. Phishing-proof." },
  { value: "sso-saml", label: "SSO SAML", hint: "B2B enterprise (WorkOS)." },
  { value: "sso-oidc", label: "SSO OIDC", hint: "Kinde, Clerk." },
  { value: "api-key", label: "API key", hint: "Outil CLI / API publique." },
];

const STORAGES: { value: SessionStorageType; label: string; hint: string }[] = [
  { value: "cookie-httponly", label: "Cookie HttpOnly + Secure", hint: "🔥 Recommandé. Défaut Supabase SSR." },
  { value: "memory", label: "Mémoire (SPA)", hint: "Perdu au reload, moins ergonomique." },
  { value: "localstorage", label: "localStorage", hint: "⚠️ XSS fatal pour tokens auth." },
];

export default function AuthMethodBlock({ state, onChange }: { state: AuthSecState; onChange: (p: Partial<AuthSecState>) => void; }) {
  const filled = (state.authMethod ? 1 : 0) + (state.authProvider.trim() ? 1 : 0) + (state.sessionStorage ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🔑"
      title="Auth method & session"
      description="Qui se connecte + comment les sessions sont stockées."
      filled={filled}
      total={3}
      storageKey="mindeck:technique:auth-security:auth:open"
    >
      <div>
        <div className="text-xs font-semibold mb-2">Méthode(s) d&apos;auth</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {METHODS.map((m) => (
            <button key={m.value} type="button" onClick={() => onChange({ authMethod: m.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.authMethod === m.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{m.label}</div>
              <div className="text-[11px] text-muted">{m.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Provider / SDK</span>
        <input type="text" value={state.authProvider} onChange={(e) => onChange({ authProvider: e.target.value })}
          placeholder="Supabase Auth / Clerk / Kinde / Better Auth / Lucia"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>

      <div>
        <div className="text-xs font-semibold mb-2">Storage session</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {STORAGES.map((s) => (
            <button key={s.value} type="button" onClick={() => onChange({ sessionStorage: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.sessionStorage === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Access token (heures)</span>
          <input type="number" min={0.1} max={168} step={0.5} value={state.sessionExpirationHours} onChange={(e) => onChange({ sessionExpirationHours: e.target.value })}
            placeholder="1" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Refresh token (jours)</span>
          <input type="number" min={1} max={90} value={state.refreshTokenDays} onChange={(e) => onChange({ refreshTokenDays: e.target.value })}
            placeholder="7" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.mfaEnabled} onChange={(e) => onChange({ mfaEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">MFA / 2FA activé</div><div className="text-[11px] text-muted">TOTP recommandé, SMS fallback seulement.</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.passkeysEnabled} onChange={(e) => onChange({ passkeysEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Passkeys supportés</div><div className="text-[11px] text-muted">WebAuthn. Tendance 2026.</div></div>
        </label>
      </div>
    </CollapsibleSection>
  );
}
