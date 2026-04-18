import type { HostingState } from "../state";

export function exportHostingClaudeBrief(state: HostingState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup Hosting & DevOps ${projectName}`);
  l.push("Tu es expert DevOps. Scaffold CI/CD + déploiement selon :");
  l.push("");
  if (state.platform) l.push(`- Plateforme : ${state.platform}`);
  if (state.ciCdTool) l.push(`- CI/CD : ${state.ciCdTool}`);
  l.push(`- Lint/TS/Tests : ${state.runsLint ? "✅" : "❌"}/${state.runsTypeCheck ? "✅" : "❌"}/${state.runsTests ? "✅" : "❌"}`);
  l.push(`- Envs : dev=${state.hasDevEnv} preview=${state.hasPreviewEnv} staging=${state.hasStagingEnv} prod=${state.hasProdEnv}`);
  if (state.rollback) l.push(`- Rollback : ${state.rollback}`);
  if (state.featureFlags) l.push(`- Feature flags : ${state.featureFlagsProvider || "oui"}`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. `.github/workflows/ci.yml` complet.");
  l.push("2. Config `next.config.js` avec HSTS + security headers.");
  l.push("3. Liste env vars à déclarer en prod (Vercel dashboard).");
  l.push("4. Runbook disaster recovery (backup DB + failover hosting).");
  l.push("5. 3 pièges à éviter (push direct main, secrets hardcoded, pas de rollback).");
  return l.join("\n");
}
