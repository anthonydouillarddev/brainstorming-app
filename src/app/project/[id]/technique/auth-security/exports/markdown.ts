import type { AuthSecState } from "../state";
import { OWASP_ITEMS } from "../state";

export function exportAuthSecMarkdown(state: AuthSecState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 🔐 Auth & Sécurité — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## Authentification");
  if (state.authMethod) l.push(`- Méthode : ${state.authMethod}`);
  if (state.authProvider) l.push(`- Provider : ${state.authProvider}`);
  if (state.sessionStorage) l.push(`- Session : ${state.sessionStorage}`);
  if (state.sessionExpirationHours) l.push(`- Access token : ${state.sessionExpirationHours}h`);
  if (state.refreshTokenDays) l.push(`- Refresh token : ${state.refreshTokenDays}j`);
  l.push(`- MFA : ${state.mfaEnabled ? "✅" : "❌"}`);
  l.push(`- Passkeys : ${state.passkeysEnabled ? "✅" : "❌"}`);
  l.push("");
  l.push("## RBAC");
  if (state.rbacApproach) l.push(`- Approche : ${state.rbacApproach}`);
  if (state.roles.length > 0) l.push(`- Rôles : ${state.roles.join(", ")}`);
  l.push("");
  l.push("## OWASP Top 10:2025");
  for (const item of OWASP_ITEMS) {
    const st = state.owaspStatuses.find((s) => s.id === item.id);
    const icon = st?.status === "compliant" ? "✅" : st?.status === "not-applicable" ? "➖" : "⏳";
    l.push(`- [${icon}] **${item.id}** ${item.label}${st?.evidence ? ` — ${st.evidence}` : ""}`);
  }
  l.push("");
  l.push("## Secrets & Password");
  if (state.secretsStorage) l.push(`- Storage : ${state.secretsStorage}`);
  if (state.secretsRotation) l.push(`- Rotation : ${state.secretsRotation}`);
  if (state.passwordPolicy) l.push(`- Policy : ${state.passwordPolicy}`);
  l.push(`- HIBP check : ${state.hibpCheckEnabled ? "✅" : "❌"}`);
  l.push(`- Audit log : ${state.auditLogEnabled ? "✅" : "❌"}`);
  if (state.notes) l.push(`- Notes : ${state.notes}`);
  return l.join("\n");
}
