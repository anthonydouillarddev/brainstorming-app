// Outillage & Knowledge du fondateur (chap 12).
// Variant par type de projet : saas / appli / logiciel / outil / business.
// Phase 0 : squelette minimal. Phase 4 enrichira chaque entrée avec pros/cons, pricing, use cases.

import type { ProjectType } from "@/lib/technique/services-catalog";

export type ToolScore = "populaire" | "emergent" | "legacy";
export type OS = "macos" | "windows" | "linux" | "wsl" | "universal";

export interface Tool {
  name: string;
  score: ToolScore;
  url?: string;
  os: readonly OS[];
  price: string; // "gratuit" | "$X/mo" | "$X/an"
  note?: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  hint: string;
  fitFor: readonly ProjectType[]; // vide = tous types
  recommended: Tool;
  alternatives: readonly Tool[];
}

// Outils communs (tous types de projet)
export const COMMON_TOOLS: ToolCategory[] = [
  {
    id: "ide-ai",
    label: "IDE + AI integration",
    hint: "Ton éditeur de code avec assistance IA intégrée",
    fitFor: [],
    recommended: {
      name: "Cursor",
      score: "populaire",
      os: ["universal"],
      price: "$20/mo",
      note: "Claude 4.x intégré, cmd+k inline",
      url: "https://cursor.com",
    },
    alternatives: [
      { name: "VS Code + Copilot", score: "populaire", os: ["universal"], price: "$10/mo" },
      { name: "Windsurf (Codeium)", score: "emergent", os: ["universal"], price: "free tier" },
    ],
  },
  {
    id: "ai-terminal",
    label: "AI dev assistant terminal",
    hint: "Agent IA autonome en ligne de commande",
    fitFor: [],
    recommended: {
      name: "Claude Code",
      score: "populaire",
      os: ["universal"],
      price: "pay-per-use",
      note: "Opus 4.7 agentic, 2026",
      url: "https://www.anthropic.com/claude-code",
    },
    alternatives: [
      { name: "Aider", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
      { name: "Continue.dev", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
    ],
  },
  {
    id: "knowledge",
    label: "Knowledge management perso",
    hint: "Ton 'second cerveau' pour notes, docs, décisions",
    fitFor: [],
    recommended: {
      name: "Obsidian",
      score: "populaire",
      os: ["universal"],
      price: "gratuit perso",
      note: "Local, markdown, plugins, pas de vendor lock",
      url: "https://obsidian.md",
    },
    alternatives: [
      { name: "Notion", score: "populaire", os: ["universal"], price: "free tier" },
      { name: "Logseq", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
      { name: "Anytype", score: "emergent", os: ["universal"], price: "gratuit" },
    ],
  },
  {
    id: "terminal",
    label: "Terminal",
    hint: "Shell moderne avec AI built-in",
    fitFor: [],
    recommended: {
      name: "Warp",
      score: "populaire",
      os: ["macos", "linux"],
      price: "gratuit",
      note: "AI command suggestions",
    },
    alternatives: [
      { name: "iTerm2", score: "populaire", os: ["macos"], price: "gratuit" },
      { name: "Ghostty", score: "emergent", os: ["macos", "linux"], price: "gratuit (OSS)" },
      { name: "Windows Terminal + WSL", score: "populaire", os: ["windows", "wsl"], price: "gratuit" },
    ],
  },
  {
    id: "launcher",
    label: "Launcher productivité",
    hint: "Spotlight boosté avec commandes custom + extensions",
    fitFor: [],
    recommended: {
      name: "Raycast",
      score: "populaire",
      os: ["macos"],
      price: "gratuit base, $8/mo Pro",
      note: "AI commands + extensions",
    },
    alternatives: [
      { name: "PowerToys Run", score: "populaire", os: ["windows", "wsl"], price: "gratuit" },
      { name: "Flow Launcher", score: "populaire", os: ["windows"], price: "gratuit (OSS)" },
      { name: "Alfred", score: "populaire", os: ["macos"], price: "£34 powerpack" },
      { name: "KRunner", score: "populaire", os: ["linux"], price: "gratuit (OSS)" },
    ],
  },
  {
    id: "git-gui",
    label: "Git GUI (optionnel)",
    hint: "Interface graphique pour Git — ou CLI pur",
    fitFor: [],
    recommended: {
      name: "Fork",
      score: "populaire",
      os: ["macos", "windows"],
      price: "$50 one-time",
    },
    alternatives: [
      { name: "GitKraken", score: "populaire", os: ["universal"], price: "$5/mo" },
      { name: "GitHub Desktop", score: "populaire", os: ["macos", "windows"], price: "gratuit" },
      { name: "CLI pure", score: "populaire", os: ["universal"], price: "gratuit" },
    ],
  },
];

// Outils spécifiques par type de projet
export const TOOLS_BY_PROJECT_TYPE: Record<ProjectType, ToolCategory[]> = {
  saas: [
    {
      id: "design",
      label: "Design collaboratif",
      hint: "Maquettes UI, design system",
      fitFor: ["saas"],
      recommended: { name: "Figma", score: "populaire", os: ["universal"], price: "free tier, $12/mo Pro" },
      alternatives: [
        { name: "Penpot", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
        { name: "Framer", score: "populaire", os: ["universal"], price: "$15/mo" },
      ],
    },
    {
      id: "api-testing",
      label: "API testing",
      hint: "Tester endpoints, collections partageables",
      fitFor: ["saas"],
      recommended: { name: "Postman", score: "populaire", os: ["universal"], price: "free tier" },
      alternatives: [
        { name: "Insomnia", score: "populaire", os: ["universal"], price: "free tier" },
        { name: "Bruno", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
      ],
    },
  ],
  appli: [
    {
      id: "xcode",
      label: "Xcode (iOS)",
      hint: "IDE Apple obligatoire pour iOS",
      fitFor: ["appli"],
      recommended: { name: "Xcode", score: "populaire", os: ["macos"], price: "gratuit" },
      alternatives: [],
    },
    {
      id: "android-studio",
      label: "Android Studio",
      hint: "IDE Google pour Android",
      fitFor: ["appli"],
      recommended: { name: "Android Studio", score: "populaire", os: ["universal"], price: "gratuit" },
      alternatives: [],
    },
    {
      id: "expo",
      label: "Expo CLI",
      hint: "React Native cross-platform",
      fitFor: ["appli"],
      recommended: { name: "Expo", score: "populaire", os: ["universal"], price: "free tier" },
      alternatives: [],
    },
    {
      id: "charles-proxy",
      label: "Charles Proxy",
      hint: "Debug network mobile",
      fitFor: ["appli"],
      recommended: { name: "Charles Proxy", score: "populaire", os: ["universal"], price: "$50 one-time" },
      alternatives: [{ name: "Proxyman", score: "emergent", os: ["macos"], price: "$49 one-time" }],
    },
  ],
  logiciel: [
    {
      id: "desktop-framework",
      label: "Desktop framework",
      hint: "Tauri (Rust) ou Electron (JS)",
      fitFor: ["logiciel"],
      recommended: { name: "Tauri CLI", score: "populaire", os: ["universal"], price: "gratuit" },
      alternatives: [
        { name: "Electron Forge", score: "populaire", os: ["universal"], price: "gratuit" },
      ],
    },
    {
      id: "code-signing",
      label: "Code signing certificates",
      hint: "Obligatoire pour distribution (Apple/Windows)",
      fitFor: ["logiciel"],
      recommended: { name: "Apple Developer", score: "populaire", os: ["macos"], price: "$99/an" },
      alternatives: [
        { name: "EV Code Signing (Windows)", score: "populaire", os: ["windows"], price: "$200+/an" },
      ],
    },
  ],
  outil: [
    {
      id: "releaser",
      label: "Release automation",
      hint: "Génération binaries + changelog",
      fitFor: ["outil"],
      recommended: { name: "goreleaser", score: "populaire", os: ["universal"], price: "gratuit (OSS)" },
      alternatives: [{ name: "npm publish workflow", score: "populaire", os: ["universal"], price: "gratuit" }],
    },
    {
      id: "homebrew",
      label: "Homebrew formula",
      hint: "Distribution macOS/Linux",
      fitFor: ["outil"],
      recommended: { name: "Homebrew", score: "populaire", os: ["macos", "linux"], price: "gratuit" },
      alternatives: [],
    },
  ],
  business: [
    {
      id: "no-code-db",
      label: "No-code database",
      hint: "Base de données no-code",
      fitFor: ["business"],
      recommended: { name: "Airtable", score: "populaire", os: ["universal"], price: "free tier" },
      alternatives: [{ name: "Notion", score: "populaire", os: ["universal"], price: "free tier" }],
    },
    {
      id: "no-code-automation",
      label: "No-code automation",
      hint: "Zapier / Make / n8n",
      fitFor: ["business"],
      recommended: { name: "Make.com", score: "populaire", os: ["universal"], price: "free tier" },
      alternatives: [
        { name: "Zapier", score: "populaire", os: ["universal"], price: "free tier" },
        { name: "n8n (self-host)", score: "emergent", os: ["universal"], price: "gratuit (OSS)" },
      ],
    },
  ],
};

export function getToolsForProject(type: ProjectType): ToolCategory[] {
  return [...COMMON_TOOLS, ...TOOLS_BY_PROJECT_TYPE[type]];
}
