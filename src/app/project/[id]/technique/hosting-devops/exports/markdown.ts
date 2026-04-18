import type { HostingState } from "../state";

export function exportHostingMarkdown(state: HostingState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 🚀 Hosting & DevOps — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## Plateforme");
  if (state.platform) l.push(`- Plateforme : ${state.platform}`);
  if (state.domainProvider) l.push(`- Domaine : ${state.domainProvider}`);
  l.push(`- HTTPS auto : ${state.httpsAuto ? "✅" : "❌"}`);
  l.push(`- HSTS : ${state.hstsEnabled ? "✅" : "❌"}`);
  if (state.platformNotes) l.push(`- Notes : ${state.platformNotes}`);
  l.push("");
  l.push("## CI/CD");
  if (state.ciCdTool) l.push(`- Tool : ${state.ciCdTool}`);
  l.push(`- Lint : ${state.runsLint ? "✅" : "❌"} · Type check : ${state.runsTypeCheck ? "✅" : "❌"} · Tests : ${state.runsTests ? "✅" : "❌"}`);
  l.push("");
  l.push("## Environnements");
  l.push(`- Dev : ${state.hasDevEnv ? "✅" : "❌"} · Preview : ${state.hasPreviewEnv ? "✅" : "❌"} · Staging : ${state.hasStagingEnv ? "✅" : "❌"} · Prod : ${state.hasProdEnv ? "✅" : "❌"}`);
  l.push(`- DB branching : ${state.dbBranching ? "✅" : "❌"}`);
  l.push("");
  l.push("## Déploiement");
  if (state.rollback) l.push(`- Rollback : ${state.rollback}`);
  l.push(`- Feature flags : ${state.featureFlags ? (state.featureFlagsProvider || "oui") : "❌"}`);
  l.push(`- Progressive delivery : ${state.progressiveDelivery ? "✅" : "❌"}`);
  if (state.notes) l.push(`- Notes : ${state.notes}`);
  return l.join("\n");
}
