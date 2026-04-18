import type { AuthSecState } from "../state";

export function exportAuthSecClaudeBrief(state: AuthSecState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup Auth & Sécurité ${projectName}`);
  l.push("Tu es un expert Auth et sécurité. Scaffold selon ces choix :");
  l.push("");
  if (state.authMethod) l.push(`- Méthode : ${state.authMethod}`);
  if (state.authProvider) l.push(`- Provider : ${state.authProvider}`);
  if (state.sessionStorage) l.push(`- Session : ${state.sessionStorage}`);
  if (state.rbacApproach) l.push(`- RBAC : ${state.rbacApproach}`);
  if (state.roles.length > 0) l.push(`- Rôles : ${state.roles.join(", ")}`);
  l.push(`- MFA : ${state.mfaEnabled ? "oui" : "non"}, Passkeys : ${state.passkeysEnabled ? "oui" : "non"}`);
  l.push(`- Password policy : ${state.passwordPolicy || "non défini"}${state.hibpCheckEnabled ? " + HIBP check" : ""}`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Setup auth flow complet (signup/login/reset) avec le provider.");
  l.push("2. Middleware auth + refresh token.");
  l.push("3. Exemples RLS policies Postgres (select/insert/update/delete).");
  l.push("4. Migration audit_logs table.");
  l.push("5. 5 pièges à éviter (user_metadata RBAC, localStorage tokens, etc.).");
  return l.join("\n");
}
