import type { FrontendState } from "../state";

const FW_LABEL: Record<string, string> = {
  "nextjs-app": "Next.js 16 (App Router)",
  "nextjs-pages": "Next.js (Pages Router)",
  sveltekit: "SvelteKit",
  remix: "Remix",
  astro: "Astro",
  "vite-react": "Vite + React",
  vanilla: "Vanilla JS",
  other: "Autre",
};

const RENDER_LABEL: Record<string, string> = {
  ssr: "SSR",
  ssg: "SSG",
  isr: "ISR",
  csr: "CSR",
  streaming: "Streaming",
  ppr: "Partial Pre-Rendering",
  hybrid: "Hybride",
};

const STYLE_LABEL: Record<string, string> = {
  "tailwind-v4": "Tailwind v4",
  "tailwind-v3": "Tailwind v3",
  "css-modules": "CSS Modules",
  "styled-components": "Styled-Components",
  shadcn: "shadcn/ui + Tailwind",
  "vanilla-extract": "Vanilla Extract",
  panda: "Panda CSS",
};

export function exportFrontendMarkdown(state: FrontendState, projectName: string): string {
  const lines: string[] = [];
  lines.push(`# 🎨 Frontend — ${projectName}`);
  lines.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  lines.push("");

  lines.push("## 🧭 Framework");
  if (state.framework) {
    lines.push(`- **Framework** : ${FW_LABEL[state.framework] ?? state.framework}${state.frameworkVersion ? ` v${state.frameworkVersion}` : ""}`);
  }
  if (state.frameworkNotes) lines.push(`- **Notes** : ${state.frameworkNotes}`);
  lines.push("");

  lines.push("## ⚡ Rendering");
  if (state.renderingStrategy) lines.push(`- **Stratégie** : ${RENDER_LABEL[state.renderingStrategy] ?? "—"}`);
  if (state.perfTargetLcpMs) lines.push(`- **LCP cible** : ${state.perfTargetLcpMs} ms`);
  if (state.perfTargetBundleKb) lines.push(`- **Bundle cible** : ${state.perfTargetBundleKb} KB gzip`);
  if (state.renderingNotes) lines.push(`- **Notes** : ${state.renderingNotes}`);
  lines.push("");

  lines.push("## 🎨 Styling");
  if (state.styling) lines.push(`- **Approche** : ${STYLE_LABEL[state.styling] ?? state.styling}`);
  lines.push(`- **shadcn/ui** : ${state.useShadcn ? "✅" : "❌"}`);
  if (state.stylingExtras) lines.push(`- **Extras** : ${state.stylingExtras}`);
  lines.push("");

  lines.push("## 📐 TypeScript & Validation");
  lines.push(`- **Strict** : ${state.tsStrict ? "✅" : "❌"}`);
  if (state.validation) lines.push(`- **Validation runtime** : ${state.validation}`);
  lines.push(`- **tRPC** : ${state.useTrpc ? "✅" : "❌"}`);
  if (state.validationNotes) lines.push(`- **Notes** : ${state.validationNotes}`);

  return lines.join("\n");
}
