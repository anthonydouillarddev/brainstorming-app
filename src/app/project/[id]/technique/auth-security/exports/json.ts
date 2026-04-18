import type { AuthSecState } from "../state";

export function exportAuthSecJson(state: AuthSecState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    auth: {
      method: state.authMethod,
      provider: state.authProvider,
      sessionStorage: state.sessionStorage,
      accessTokenHours: state.sessionExpirationHours ? Number(state.sessionExpirationHours) : null,
      refreshTokenDays: state.refreshTokenDays ? Number(state.refreshTokenDays) : null,
      mfa: state.mfaEnabled,
      passkeys: state.passkeysEnabled,
    },
    rbac: { approach: state.rbacApproach, roles: state.roles },
    owasp: state.owaspStatuses,
    secrets: { storage: state.secretsStorage, rotation: state.secretsRotation, passwordPolicy: state.passwordPolicy, hibpCheck: state.hibpCheckEnabled, auditLog: state.auditLogEnabled, notes: state.notes },
  }, null, 2);
}
