export type AuthSecMode = "beginner" | "intermediate";

export type AuthMethodValue =
  | "email-password" | "magic-link" | "oauth" | "passkey" | "sso-saml" | "sso-oidc" | "api-key" | "";

export type SessionStorage = "cookie-httponly" | "localstorage" | "memory" | "";
export type RbacApproach = "app-metadata" | "user-metadata" | "db-table" | "none" | "";
export type SecretsStorage = "env-vars" | "vercel-secrets" | "vault" | "doppler" | "secrets-manager" | "";
export type PasswordPolicy = "nist-2024" | "legacy-complex" | "loose" | "";

export const OWASP_ITEMS = [
  { id: "A01", label: "Broken Access Control", hint: "RLS + auth.uid() strict" },
  { id: "A02", label: "Cryptographic Failures", hint: "HTTPS, bcrypt/argon2, secrets sécurisés" },
  { id: "A03", label: "Injection", hint: "Prepared statements, sanitization" },
  { id: "A04", label: "Insecure Design", hint: "OAuth 2.1 + PKCE, no custom auth" },
  { id: "A05", label: "Security Misconfiguration", hint: "CORS spécifique, debug OFF en prod" },
  { id: "A06", label: "Vulnerable Components", hint: "npm audit, updates mensuels" },
  { id: "A07", label: "Authentication Failures", hint: "Passkeys/MFA, token 1h, NIST 800-63B" },
  { id: "A08", label: "Software Integrity", hint: "Lock npm versions, Vercel auto-builds" },
  { id: "A09", label: "Logging Gaps", hint: "Audit log auth events" },
  { id: "A10", label: "SSRF", hint: "Allowlist URLs, rate limit fetch" },
] as const;

export type OwaspItemId = (typeof OWASP_ITEMS)[number]["id"];

export interface OwaspStatus {
  id: OwaspItemId;
  status: "compliant" | "todo" | "not-applicable";
  evidence: string;
}

export interface AuthSecState {
  version: 1;
  authMethod: AuthMethodValue;
  authProvider: string; // ex: "Supabase Auth", "Clerk", "Kinde"
  sessionStorage: SessionStorage;
  sessionExpirationHours: string; // ex: "1"
  refreshTokenDays: string; // ex: "7"
  mfaEnabled: boolean;
  passkeysEnabled: boolean;
  rbacApproach: RbacApproach;
  roles: string[]; // labels custom
  owaspStatuses: OwaspStatus[];
  secretsStorage: SecretsStorage;
  secretsRotation: "quarterly" | "yearly" | "on-leak" | "never" | "";
  passwordPolicy: PasswordPolicy;
  hibpCheckEnabled: boolean;
  auditLogEnabled: boolean;
  notes: string;
  modeUsed: AuthSecMode;
  updatedAt: string;
}

export const AUTH_SECURITY_SECTION_KEY = "tech-auth-security";

export const DEFAULT_AUTH_SEC_STATE: AuthSecState = {
  version: 1,
  authMethod: "",
  authProvider: "",
  sessionStorage: "",
  sessionExpirationHours: "",
  refreshTokenDays: "",
  mfaEnabled: false,
  passkeysEnabled: false,
  rbacApproach: "",
  roles: [],
  owaspStatuses: OWASP_ITEMS.map((i) => ({ id: i.id, status: "todo", evidence: "" })),
  secretsStorage: "",
  secretsRotation: "",
  passwordPolicy: "",
  hibpCheckEnabled: false,
  auditLogEnabled: false,
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeAuthSecState(partial: Partial<AuthSecState> | null | undefined): AuthSecState {
  if (!partial) return DEFAULT_AUTH_SEC_STATE;
  return {
    ...DEFAULT_AUTH_SEC_STATE,
    ...partial,
    roles: partial.roles ?? [],
    owaspStatuses:
      partial.owaspStatuses && partial.owaspStatuses.length === OWASP_ITEMS.length
        ? partial.owaspStatuses
        : DEFAULT_AUTH_SEC_STATE.owaspStatuses,
  };
}

export function parseAuthSecState(content: string | undefined | null): AuthSecState {
  if (!content) return DEFAULT_AUTH_SEC_STATE;
  try { return mergeAuthSecState(JSON.parse(content)); } catch { return DEFAULT_AUTH_SEC_STATE; }
}

export function computeAuthSecCompleteness(state: AuthSecState): number {
  let score = 0;
  if (state.authMethod) score += 15;
  if (state.sessionStorage === "cookie-httponly") score += 10;
  if (state.rbacApproach) score += 15;
  const compliantCount = state.owaspStatuses.filter((s) => s.status === "compliant" || s.status === "not-applicable").length;
  score += Math.round((compliantCount / OWASP_ITEMS.length) * 30);
  if (state.secretsStorage) score += 10;
  if (state.passwordPolicy === "nist-2024") score += 10;
  if (state.auditLogEnabled) score += 10;
  return Math.min(100, Math.round(score));
}
