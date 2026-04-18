import type { FrontendState } from "../state";

export function exportFrontendClaudeBrief(state: FrontendState, projectName: string): string {
  const lines: string[] = [];
  lines.push(`# Brief Claude — Scaffold Frontend ${projectName}`);
  lines.push("");
  lines.push("Tu es un expert frontend. Scaffold un projet selon ces choix :");
  lines.push("");

  if (state.framework) lines.push(`- **Framework** : ${state.framework}${state.frameworkVersion ? ` v${state.frameworkVersion}` : ""}`);
  if (state.renderingStrategy) lines.push(`- **Rendering** : ${state.renderingStrategy}`);
  if (state.styling) lines.push(`- **Styling** : ${state.styling}${state.useShadcn ? " + shadcn/ui" : ""}`);
  lines.push(`- **TS strict** : ${state.tsStrict ? "oui" : "non"}`);
  if (state.validation) lines.push(`- **Validation** : ${state.validation}`);
  if (state.useTrpc) lines.push(`- **tRPC** : activé`);
  if (state.perfTargetLcpMs) lines.push(`- **LCP cible** : ${state.perfTargetLcpMs}ms`);
  if (state.perfTargetBundleKb) lines.push(`- **Bundle cible** : ${state.perfTargetBundleKb}KB gzip`);
  lines.push("");

  lines.push("## Ce que je te demande");
  lines.push("1. Génère un `package.json` starter avec les dépendances minimales.");
  lines.push("2. Écris `tsconfig.json` strict + `next.config.js` (ou équivalent).");
  lines.push("3. Montre-moi l'arbo de dossiers recommandée pour cette stack.");
  lines.push("4. Fournis 1 exemple de page avec data fetching (Server Action ou équivalent).");
  lines.push("5. Liste 3 pièges courants avec cette stack.");

  return lines.join("\n");
}
