import type { HostingState } from "../state";

// Export d'un starter GitHub Actions YAML selon la config du chapitre.
export function exportHostingGithubActions(state: HostingState): string {
  if (state.ciCdTool !== "github-actions") {
    return "# CI/CD tool non GitHub Actions — sélectionne 'GitHub Actions' pour générer ce fichier.\n";
  }

  const steps: string[] = [];
  if (state.runsLint) {
    steps.push("      - run: npm run lint");
  }
  if (state.runsTypeCheck) {
    steps.push("      - run: npx tsc --noEmit");
  }
  if (state.runsTests) {
    steps.push("      - run: npm test");
  }
  steps.push("      - run: npm run build");

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
${steps.join("\n")}
`;
}
