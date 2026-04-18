// Les 12 chapitres de l'onglet Technique (issus du workflow de recherche TECHNIQUE-RESEARCH.md).
// Ordre : Stratégie → Build (Architecture, Frontend, Backend, Data, Auth) → Run (Services, Hosting, Observability, IA) → Transversal (Coûts, Outillage).

export type TechniqueChapterKey =
  | "strategy"
  | "architecture"
  | "frontend"
  | "backend"
  | "data"
  | "auth-security"
  | "services"
  | "hosting-devops"
  | "observability"
  | "ai-automation"
  | "costs-compliance"
  | "tooling";

export interface TechniqueChapter {
  key: TechniqueChapterKey;
  num: number;
  emoji: string;
  label: string;
  hint: string;
  status: "ready" | "wip" | "bientot";
}

export const TECHNIQUE_CHAPTERS: TechniqueChapter[] = [
  { key: "strategy", num: 1, emoji: "🎯", label: "Stratégie technique", hint: "Contraintes, objectifs, drivers, risques, ADR léger", status: "ready" },
  { key: "architecture", num: 2, emoji: "🏛️", label: "Architecture & Blueprint", hint: "Pattern, couches, flux, C4 léger, Mermaid", status: "ready" },
  { key: "frontend", num: 3, emoji: "🎨", label: "Frontend", hint: "Framework, rendering, styling, TypeScript", status: "ready" },
  { key: "backend", num: 4, emoji: "⚙️", label: "Backend", hint: "Pattern BaaS/BFF, runtime, API style, jobs", status: "ready" },
  { key: "data", num: 5, emoji: "🗄️", label: "Data & Database", hint: "DB, hosting, schéma, migrations, RLS, backups", status: "ready" },
  { key: "auth-security", num: 6, emoji: "🔐", label: "Auth & Sécurité", hint: "Auth method, OWASP Top 10, secrets, RBAC", status: "ready" },
  { key: "services", num: 7, emoji: "🔌", label: "Services tiers & Intégrations", hint: "Catalogue 26 catégories (paiement, email, storage, CDN, CMS…)", status: "bientot" },
  { key: "hosting-devops", num: 8, emoji: "🚀", label: "Hosting & DevOps", hint: "Hosting, CI/CD, preview envs, rollback, feature flags", status: "bientot" },
  { key: "observability", num: 9, emoji: "📊", label: "Observability & Qualité", hint: "Error tracking, uptime, logs, tests, DORA metrics", status: "bientot" },
  { key: "ai-automation", num: 10, emoji: "🤖", label: "IA & Automation", hint: "Claude, Vercel AI SDK, prompt caching, n8n workflows", status: "bientot" },
  { key: "costs-compliance", num: 11, emoji: "💰", label: "Coûts & Compliance", hint: "Coûts infra+LLM, unit economics, RGPD, mentions légales", status: "bientot" },
  { key: "tooling", num: 12, emoji: "🛠️", label: "Outillage & Knowledge", hint: "IDE+AI, Obsidian, launcher, variant par type projet", status: "bientot" },
];
