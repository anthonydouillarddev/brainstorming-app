// State du chapitre 3 Frontend — tech-frontend
// 4 blocs V1 MUST : framework, rendering, styling, TypeScript

export type FrontendMode = "beginner" | "intermediate";

export type Framework =
  | "nextjs-app"
  | "nextjs-pages"
  | "sveltekit"
  | "remix"
  | "astro"
  | "vite-react"
  | "vanilla"
  | "other"
  | "";

export type RenderingStrategy = "ssr" | "ssg" | "isr" | "csr" | "streaming" | "ppr" | "hybrid" | "";

export type StylingApproach = "tailwind-v4" | "tailwind-v3" | "css-modules" | "styled-components" | "shadcn" | "vanilla-extract" | "panda" | "";

export type TypeValidation = "none" | "zod" | "valibot" | "yup" | "";

export interface FrontendState {
  version: 1;

  // Bloc 1 — Framework
  framework: Framework;
  frameworkVersion: string;
  frameworkNotes: string;

  // Bloc 2 — Rendering
  renderingStrategy: RenderingStrategy;
  perfTargetLcpMs: string; // "1800"
  perfTargetBundleKb: string; // "60"
  renderingNotes: string;

  // Bloc 3 — Styling
  styling: StylingApproach;
  stylingExtras: string;
  useShadcn: boolean;

  // Bloc 4 — TypeScript + validation
  tsStrict: boolean;
  validation: TypeValidation;
  useTrpc: boolean;
  validationNotes: string;

  // Meta
  modeUsed: FrontendMode;
  updatedAt: string;
}

export const FRONTEND_SECTION_KEY = "tech-frontend";

export const DEFAULT_FRONTEND_STATE: FrontendState = {
  version: 1,
  framework: "",
  frameworkVersion: "",
  frameworkNotes: "",
  renderingStrategy: "",
  perfTargetLcpMs: "",
  perfTargetBundleKb: "",
  renderingNotes: "",
  styling: "",
  stylingExtras: "",
  useShadcn: false,
  tsStrict: true,
  validation: "",
  useTrpc: false,
  validationNotes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeFrontendState(partial: Partial<FrontendState> | null | undefined): FrontendState {
  if (!partial) return DEFAULT_FRONTEND_STATE;
  return { ...DEFAULT_FRONTEND_STATE, ...partial };
}

export function parseFrontendState(content: string | undefined | null): FrontendState {
  if (!content) return DEFAULT_FRONTEND_STATE;
  try {
    return mergeFrontendState(JSON.parse(content));
  } catch {
    return DEFAULT_FRONTEND_STATE;
  }
}

// Complétude 0-100 — 4 blocs × 25pts
export function computeFrontendCompleteness(state: FrontendState): number {
  let score = 0;

  // Bloc 1 Framework (25)
  if (state.framework) score += 18;
  if (state.frameworkVersion.trim()) score += 7;

  // Bloc 2 Rendering (25)
  if (state.renderingStrategy) score += 20;
  if (state.perfTargetLcpMs.trim() || state.perfTargetBundleKb.trim()) score += 5;

  // Bloc 3 Styling (25)
  if (state.styling) score += 25;

  // Bloc 4 TS (25)
  if (state.tsStrict) score += 10;
  if (state.validation) score += 15;

  return Math.min(100, Math.round(score));
}
