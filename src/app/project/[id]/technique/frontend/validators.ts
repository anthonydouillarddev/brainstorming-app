import type { FrontendState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue {
  severity: Severity;
  blockId: string;
  message: string;
}

export function validateFrontend(state: FrontendState): Issue[] {
  const issues: Issue[] = [];

  if (!state.framework) {
    issues.push({ severity: "error", blockId: "framework", message: "Framework obligatoire." });
  }
  if (state.framework === "vanilla") {
    issues.push({
      severity: "warn",
      blockId: "framework",
      message:
        "Vanilla JS : +50% TTM. Sûr ? Next.js/SvelteKit couvrent 90% des besoins SaaS solo.",
    });
  }

  if (!state.renderingStrategy) {
    issues.push({
      severity: "warn",
      blockId: "rendering",
      message: "Rendering strategy non définie — SSR + RSC recommandé pour SaaS.",
    });
  }

  if (!state.styling) {
    issues.push({
      severity: "warn",
      blockId: "styling",
      message: "Styling non défini — Tailwind v4 recommandé 2026.",
    });
  }
  if (state.styling === "styled-components") {
    issues.push({
      severity: "info",
      blockId: "styling",
      message: "styled-components = runtime JS overhead. Préfère Tailwind v4 pour un SaaS moderne.",
    });
  }

  if (!state.tsStrict) {
    issues.push({
      severity: "error",
      blockId: "typescript",
      message: "TypeScript strict désactivé — règle Mindeck violée (0 any, senior code).",
    });
  }
  if (!state.validation) {
    issues.push({
      severity: "warn",
      blockId: "typescript",
      message: "Aucune lib de validation runtime — Zod recommandé pour inputs API.",
    });
  }

  return issues;
}
