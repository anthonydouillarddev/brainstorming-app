import type { HostingState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateHosting(state: HostingState): Issue[] {
  const issues: Issue[] = [];
  if (!state.platform) issues.push({ severity: "error", blockId: "platform", message: "Plateforme d'hébergement obligatoire." });
  if (state.platform === "self-host-coolify") issues.push({ severity: "info", blockId: "platform", message: "Self-host solo = ops à gérer. Vercel/Railway plus simples." });
  if (!state.httpsAuto) issues.push({ severity: "error", blockId: "platform", message: "HTTPS auto désactivé = faille sécu." });
  if (!state.hstsEnabled) issues.push({ severity: "warn", blockId: "platform", message: "HSTS désactivé — force HTTPS 1 an recommandé." });

  if (!state.ciCdTool) issues.push({ severity: "warn", blockId: "cicd", message: "CI/CD non défini — push direct main = risqué." });
  if (!state.runsLint || !state.runsTypeCheck) issues.push({ severity: "warn", blockId: "cicd", message: "Lint ou type-check désactivé en CI — règles Mindeck violées." });

  if (!state.hasPreviewEnv) issues.push({ severity: "info", blockId: "envs", message: "Pas de preview env — regression surprise en prod possible." });
  if (!state.rollback) issues.push({ severity: "warn", blockId: "deploy", message: "Stratégie rollback non définie — panique le jour J." });
  if (state.featureFlags && !state.featureFlagsProvider.trim()) {
    issues.push({ severity: "info", blockId: "deploy", message: "Feature flags activés mais provider non renseigné." });
  }
  return issues;
}
