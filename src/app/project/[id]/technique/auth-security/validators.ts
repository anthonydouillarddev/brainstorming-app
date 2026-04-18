import type { AuthSecState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateAuthSec(state: AuthSecState): Issue[] {
  const issues: Issue[] = [];

  if (!state.authMethod) issues.push({ severity: "error", blockId: "auth", message: "Méthode d'auth obligatoire." });
  if (state.sessionStorage === "localstorage") issues.push({ severity: "error", blockId: "auth", message: "localStorage pour tokens = XSS fatal. Cookies HttpOnly." });
  if (state.authMethod === "email-password" && !state.mfaEnabled) issues.push({ severity: "warn", blockId: "auth", message: "Email/password sans MFA = vulnérable brute force. Ajoute TOTP ou passkey." });

  if (state.rbacApproach === "user-metadata") issues.push({ severity: "error", blockId: "rbac", message: "user_metadata modifiable par user = FAILLE RBAC. Utilise app_metadata." });
  if (!state.rbacApproach) issues.push({ severity: "warn", blockId: "rbac", message: "RBAC non défini — OK si app mono-rôle." });

  const todoItems = state.owaspStatuses.filter((s) => s.status === "todo").length;
  if (todoItems > 5) issues.push({ severity: "warn", blockId: "owasp", message: `${todoItems}/10 items OWASP non évalués.` });

  if (!state.secretsStorage) issues.push({ severity: "warn", blockId: "secrets", message: "Secrets storage non défini — env vars minimum." });
  if (state.secretsRotation === "never") issues.push({ severity: "warn", blockId: "secrets", message: "Jamais de rotation = risque leak durable." });
  if (state.passwordPolicy === "legacy-complex") issues.push({ severity: "info", blockId: "secrets", message: "NIST 2024 abandonne la complexité forcée. Préfère passphrases + blacklist HIBP." });
  if (!state.auditLogEnabled) issues.push({ severity: "info", blockId: "secrets", message: "Audit log désactivé — logger signups/logins/role changes recommandé." });

  return issues;
}
