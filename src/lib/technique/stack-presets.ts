// Combos stack curés 2026 — chargeables depuis le chap 1 Stratégie (bloc V3).
// Persisté dans la table `technique_stack_presets` quand l'user sauve un preset custom.
// Le scoring suit la taxonomie du chap 7 Services tiers : 🔥 populaire · 🌱 émergent · 🪦 legacy.

export type PresetScore = "populaire" | "emergent" | "legacy";

export interface StackPreset {
  id: string;
  name: string;
  score: PresetScore;
  description: string;
  fitFor: readonly string[]; // types projet compatibles (saas/outil/appli/logiciel/business)
  stack: {
    frontend?: string;
    backend?: string;
    database?: string;
    auth?: string;
    hosting?: string;
    payments?: string;
    email?: string;
    ai?: string;
    monitoring?: string;
  };
}

// Placeholder Phase 0 — liste minimale à enrichir en Phase 1 quand le chap 1 sera implémenté.
// L'expert chap 1 proposera 8-12 combos complets avec rationale.
export const STACK_PRESETS: StackPreset[] = [
  {
    id: "mindeck",
    name: "Next + Supabase + Vercel",
    score: "populaire",
    description: "Stack de Mindeck lui-même. Solo SaaS 2026, type-safe, deploy zéro friction.",
    fitFor: ["saas", "outil"],
    stack: {
      frontend: "Next.js 16 (App Router) + React 19 + Tailwind v4",
      backend: "Server Actions + Supabase (BaaS)",
      database: "Postgres (Supabase) + RLS",
      auth: "Supabase Auth",
      hosting: "Vercel",
      payments: "Stripe (ou Paddle MoR)",
      email: "Resend",
      ai: "Anthropic Claude Sonnet 4.6",
      monitoring: "Sentry + PostHog",
    },
  },
  {
    id: "t3",
    name: "T3 Stack",
    score: "populaire",
    description: "Next.js + tRPC + Prisma + NextAuth + Tailwind. Type-safety end-to-end.",
    fitFor: ["saas"],
    stack: {
      frontend: "Next.js + Tailwind",
      backend: "tRPC + Prisma",
      database: "Postgres",
      auth: "NextAuth.js",
      hosting: "Vercel",
    },
  },
  {
    id: "boring-rails",
    name: "Rails + Postgres + Sidekiq",
    score: "populaire",
    description: "Boring solid. Idéal si équipe Ruby. Render/Heroku friendly.",
    fitFor: ["saas", "business"],
    stack: {
      frontend: "Rails views + Hotwire",
      backend: "Ruby on Rails",
      database: "Postgres",
      auth: "Devise",
      hosting: "Render / Fly.io",
    },
  },
  {
    id: "edge-first",
    name: "Hono + Drizzle + Neon + Clerk",
    score: "emergent",
    description: "Edge-first 2026. Ultra-rapide, Cloudflare Workers compatible.",
    fitFor: ["saas", "appli"],
    stack: {
      frontend: "Next.js ou Astro",
      backend: "Hono (Bun/Deno/Workers)",
      database: "Neon serverless Postgres + Drizzle ORM",
      auth: "Clerk (orgs + RBAC inclus)",
      hosting: "Cloudflare Workers / Vercel",
    },
  },
  {
    id: "astro-content",
    name: "Astro + Sanity + Vercel",
    score: "emergent",
    description: "Sites de contenu / landings / blogs. Zéro JS par défaut.",
    fitFor: ["business"],
    stack: {
      frontend: "Astro + Tailwind",
      backend: "Sanity Studio (headless CMS)",
      hosting: "Vercel / Netlify",
    },
  },
  {
    id: "business-nocode",
    name: "Tally + Airtable + Stripe + Make",
    score: "populaire",
    description: "No-code solopreneur. MVP en 1 week-end, pas de code.",
    fitFor: ["business"],
    stack: {
      frontend: "Tally forms + Softr page",
      backend: "Airtable + Make.com automations",
      payments: "Stripe Payment Links",
      email: "Loops.so",
    },
  },
  {
    id: "mern-legacy",
    name: "MERN (MongoDB + Express + React + Node)",
    score: "legacy",
    description: "Legacy 2026 — éviter pour nouveau projet. Préférer Next.js + Postgres.",
    fitFor: [],
    stack: {
      frontend: "React (CRA legacy)",
      backend: "Express + Node",
      database: "MongoDB",
    },
  },
];
