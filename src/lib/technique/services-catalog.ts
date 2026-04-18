// Catalogue exhaustif de services tiers 2026 pour le chap 7.
// Taxonomie : 4 groupes × 26 catégories. Pour chaque catégorie : 1 reco 🔥 + 2 alternatives 🌱/🪦.
//
// Phase 0 : squelette minimal. Phase 3 enrichira chaque entrée avec pricing, docs, pros/cons.

export type ServiceScore = "populaire" | "emergent" | "legacy";
export type ServiceGroup = "monetisation" | "communications" | "contenu-medias" | "growth-support" | "ai-dev";
export type ProjectType = "saas" | "outil" | "appli" | "logiciel" | "business";

export interface ServiceOption {
  name: string;
  score: ServiceScore;
  url?: string;
  note?: string;
}

export interface ServiceCategory {
  id: string;
  group: ServiceGroup;
  label: string;
  hint: string;
  fitFor: readonly ProjectType[];
  recommended: ServiceOption;
  alternatives: readonly ServiceOption[];
}

// Ordre = celui du TECHNIQUE-RESEARCH.md (chap 7).
export const SERVICES_CATALOG: ServiceCategory[] = [
  // ═══ 💰 MONÉTISATION ═══
  {
    id: "api-style",
    group: "monetisation",
    label: "Style API interne",
    hint: "Comment ton frontend parle à ton backend",
    fitFor: ["saas", "outil", "appli", "logiciel"],
    recommended: { name: "Server Actions (Next 16)", score: "populaire" },
    alternatives: [
      { name: "tRPC", score: "populaire", note: "TS monorepo" },
      { name: "REST / GraphQL", score: "populaire", note: "Si API publique" },
    ],
  },
  {
    id: "payments",
    group: "monetisation",
    label: "Paiement",
    hint: "Processus Stripe vs Merchant of Record (MoR = gère TVA)",
    fitFor: ["saas", "appli", "business"],
    recommended: { name: "Stripe", score: "populaire", url: "https://stripe.com" },
    alternatives: [
      { name: "Paddle", score: "populaire", note: "MoR 5% — gère TVA EU" },
      { name: "LemonSqueezy", score: "emergent", note: "MoR 3.5% — indie-friendly" },
      { name: "Polar.sh", score: "emergent", note: "🌱 Dev-first MoR 4% + $0.40, 120+ pays, open-source" },
    ],
  },
  {
    id: "invoicing",
    group: "monetisation",
    label: "Facturation / Invoicing",
    hint: "Générer factures légales",
    fitFor: ["saas", "business"],
    recommended: { name: "Stripe Invoicing", score: "populaire" },
    alternatives: [
      { name: "Paddle (inclus)", score: "populaire" },
      { name: "Chargebee", score: "legacy" },
    ],
  },
  {
    id: "referral",
    group: "monetisation",
    label: "Referral / Affiliate",
    hint: "Programme de parrainage",
    fitFor: ["saas"],
    recommended: { name: "Rewardful", score: "populaire" },
    alternatives: [
      { name: "Tolt", score: "emergent" },
      { name: "Partnerstack", score: "populaire", note: "B2B" },
    ],
  },

  // ═══ 📬 COMMUNICATIONS ═══
  {
    id: "email-transactional",
    group: "communications",
    label: "Email transactional",
    hint: "Confirmations, resets, notifications code-first",
    fitFor: ["saas", "outil", "appli", "business"],
    recommended: { name: "Resend", score: "populaire", note: "Dev FR friendly, React Email" },
    alternatives: [
      { name: "Postmark", score: "populaire" },
      { name: "SendGrid", score: "legacy" },
    ],
  },
  {
    id: "email-marketing",
    group: "communications",
    label: "Email marketing",
    hint: "Newsletters, campagnes, drips",
    fitFor: ["saas", "business"],
    recommended: { name: "Loops", score: "populaire" },
    alternatives: [
      { name: "ConvertKit", score: "populaire" },
      { name: "Beehiiv", score: "emergent", note: "Newsletter-first" },
      { name: "Mailchimp", score: "legacy" },
    ],
  },
  {
    id: "sms-whatsapp",
    group: "communications",
    label: "SMS / WhatsApp",
    hint: "OTP, notifications critiques",
    fitFor: ["saas", "appli"],
    recommended: { name: "Twilio", score: "populaire" },
    alternatives: [
      { name: "MessageBird", score: "populaire" },
      { name: "Vonage", score: "populaire" },
    ],
  },
  {
    id: "push-notifications",
    group: "communications",
    label: "Push notifications",
    hint: "Mobile + web push",
    fitFor: ["appli"],
    recommended: { name: "OneSignal", score: "populaire" },
    alternatives: [
      { name: "Knock", score: "emergent", note: "Orchestration multi-channel" },
      { name: "Firebase Cloud Messaging", score: "legacy" },
    ],
  },
  {
    id: "chat-support",
    group: "communications",
    label: "Chat / Support client",
    hint: "Widget de chat in-app",
    fitFor: ["saas", "appli", "business"],
    recommended: { name: "Crisp", score: "populaire", note: "FR, free tier généreux" },
    alternatives: [
      { name: "Plain", score: "emergent", note: "Dev-first" },
      { name: "Chatwoot", score: "emergent", note: "OSS self-host" },
      { name: "Intercom", score: "legacy", note: "Cher" },
    ],
  },
  {
    id: "crm",
    group: "communications",
    label: "CRM",
    hint: "Gestion prospects / clients B2B",
    fitFor: ["saas", "business"],
    recommended: { name: "Attio", score: "emergent", note: "B2B moderne" },
    alternatives: [
      { name: "Folk", score: "emergent" },
      { name: "HubSpot Free", score: "populaire" },
      { name: "Salesforce", score: "legacy", note: "Overkill solo" },
    ],
  },

  // ═══ 🗃️ CONTENU & MÉDIAS ═══
  {
    id: "file-storage",
    group: "contenu-medias",
    label: "Storage fichiers",
    hint: "Upload user-generated / assets",
    fitFor: ["saas", "appli", "outil"],
    recommended: { name: "Supabase Storage", score: "populaire", note: "Défaut Mindeck" },
    alternatives: [
      { name: "Cloudflare R2", score: "populaire", note: "S3-compat, 0$ egress" },
      { name: "UploadThing", score: "emergent", note: "TS-first DX" },
    ],
  },
  {
    id: "cdn-edge",
    group: "contenu-medias",
    label: "CDN & Edge",
    hint: "Distribution globale assets",
    fitFor: ["saas", "appli", "logiciel", "business"],
    recommended: { name: "Vercel Edge Network", score: "populaire", note: "Inclus Vercel" },
    alternatives: [
      { name: "Cloudflare", score: "populaire" },
      { name: "Bunny CDN", score: "emergent" },
    ],
  },
  {
    id: "images-processing",
    group: "contenu-medias",
    label: "Images processing",
    hint: "Resize, optim, formats auto",
    fitFor: ["saas", "appli"],
    recommended: { name: "Cloudflare Images", score: "populaire" },
    alternatives: [
      { name: "Cloudinary", score: "populaire" },
      { name: "imgix", score: "populaire" },
    ],
  },
  {
    id: "video-audio",
    group: "contenu-medias",
    label: "Video / audio streaming",
    hint: "Upload + encoding + playback",
    fitFor: ["saas", "appli"],
    recommended: { name: "Mux", score: "populaire" },
    alternatives: [
      { name: "Cloudflare Stream", score: "populaire" },
      { name: "Daily.co", score: "populaire", note: "WebRTC temps réel" },
    ],
  },
  {
    id: "cms-headless",
    group: "contenu-medias",
    label: "CMS headless",
    hint: "Contenu éditorial / marketing",
    fitFor: ["saas", "business"],
    recommended: { name: "Sanity", score: "populaire" },
    alternatives: [
      { name: "Payload", score: "emergent", note: "Self-host TS" },
      { name: "Directus", score: "emergent", note: "OSS" },
      { name: "Strapi v3", score: "legacy" },
    ],
  },
  {
    id: "forms",
    group: "contenu-medias",
    label: "Forms",
    hint: "Formulaires embed no-code",
    fitFor: ["saas", "business"],
    recommended: { name: "Tally", score: "populaire", note: "FR, free" },
    alternatives: [
      { name: "Typeform", score: "populaire" },
      { name: "Formspree", score: "populaire" },
    ],
  },
  {
    id: "scheduling",
    group: "contenu-medias",
    label: "Scheduling / Booking",
    hint: "Prise de RDV",
    fitFor: ["saas", "business"],
    recommended: { name: "Cal.com", score: "populaire", note: "OSS" },
    alternatives: [
      { name: "Calendly", score: "populaire" },
      { name: "SavvyCal", score: "emergent" },
    ],
  },
  {
    id: "pdf-generation",
    group: "contenu-medias",
    label: "PDF generation",
    hint: "Factures, contrats, exports",
    fitFor: ["saas", "business"],
    recommended: { name: "react-pdf", score: "populaire" },
    alternatives: [
      { name: "Puppeteer", score: "populaire" },
      { name: "DocRaptor", score: "emergent" },
    ],
  },
  {
    id: "search",
    group: "contenu-medias",
    label: "Search",
    hint: "Recherche full-text performante",
    fitFor: ["saas", "appli"],
    recommended: { name: "Meilisearch", score: "populaire", note: "Self-host OSS" },
    alternatives: [
      { name: "Algolia", score: "populaire", note: "Cher mais top" },
      { name: "Typesense", score: "emergent" },
      { name: "Postgres FTS", score: "populaire", note: "OK pour débuter" },
    ],
  },
  {
    id: "i18n-translation",
    group: "contenu-medias",
    label: "i18n / Translation",
    hint: "Gestion multi-langues",
    fitFor: ["saas", "appli"],
    recommended: { name: "Tolgee", score: "emergent" },
    alternatives: [
      { name: "Lokalise", score: "populaire" },
      { name: "Crowdin", score: "populaire" },
    ],
  },

  // ═══ 🤝 GROWTH & SUPPORT ═══
  {
    id: "analytics-web",
    group: "growth-support",
    label: "Analytics web",
    hint: "Pageviews, sources, conversions",
    fitFor: ["saas", "business"],
    recommended: { name: "Plausible", score: "populaire", note: "Privacy-first FR" },
    alternatives: [
      { name: "Fathom", score: "populaire" },
      { name: "Simple Analytics", score: "populaire" },
      { name: "Google Analytics 4", score: "legacy", note: "Cookies RGPD" },
    ],
  },
  {
    id: "ab-testing-flags",
    group: "growth-support",
    label: "A/B testing & Feature flags",
    hint: "Rollouts progressifs, experiments",
    fitFor: ["saas", "appli"],
    recommended: { name: "PostHog", score: "populaire", note: "Inclus avec analytics produit" },
    alternatives: [
      { name: "GrowthBook", score: "emergent", note: "OSS" },
      { name: "Statsig", score: "populaire" },
    ],
  },
  {
    id: "onboarding",
    group: "growth-support",
    label: "Onboarding users",
    hint: "Tours guidés, tooltips produit",
    fitFor: ["saas"],
    recommended: { name: "Userflow", score: "populaire" },
    alternatives: [
      { name: "Appcues", score: "populaire" },
      { name: "Chameleon", score: "populaire" },
    ],
  },
  {
    id: "help-center",
    group: "growth-support",
    label: "Help center / Docs",
    hint: "Documentation publique",
    fitFor: ["saas", "outil"],
    recommended: { name: "Mintlify", score: "populaire", note: "Docs tech modernes" },
    alternatives: [
      { name: "GitBook", score: "populaire" },
      { name: "Docusaurus", score: "populaire", note: "OSS" },
    ],
  },
  {
    id: "status-page",
    group: "growth-support",
    label: "Status page",
    hint: "Page publique d'état des services",
    fitFor: ["saas"],
    recommended: { name: "Instatus", score: "populaire" },
    alternatives: [
      { name: "Better Stack Status", score: "populaire" },
      { name: "Statuspage.io", score: "populaire" },
    ],
  },
  {
    id: "webhook-management",
    group: "growth-support",
    label: "Webhook management",
    hint: "Envoi fiable + retries vers users",
    fitFor: ["saas"],
    recommended: { name: "Svix", score: "populaire" },
    alternatives: [
      { name: "Hookdeck", score: "emergent" },
      { name: "DIY retry logic", score: "legacy" },
    ],
  },
  {
    id: "feature-flags",
    group: "growth-support",
    label: "Feature Flags (dédié)",
    hint: "Toggle features runtime, rollouts progressifs, A/B cohort — standalone vs full analytics",
    fitFor: ["saas", "appli"],
    recommended: { name: "PostHog Feature Flags", score: "populaire", note: "🔥 Inclus dans PostHog free tier, combo avec analytics" },
    alternatives: [
      { name: "DevCycle", score: "emergent", note: "🌱 Acquis Dynatrace 2026, replace LaunchDarkly" },
      { name: "Statsig", score: "populaire", note: "Gratuit jusqu'à 1M events/mois" },
      { name: "LaunchDarkly", score: "legacy", note: "🪦 Leader historique, cher" },
    ],
  },
  {
    id: "compliance-automation",
    group: "growth-support",
    label: "Compliance automation",
    hint: "SOC 2, ISO, GDPR — automation audits et questionnaires",
    fitFor: ["saas"],
    recommended: { name: "Vanta", score: "emergent", note: "🌱 AI agent policies, 400+ intégrations, mainstream 2026" },
    alternatives: [
      { name: "Drata", score: "emergent", note: "Per-framework pricing, deep customization" },
      { name: "Delve", score: "emergent", note: "Newcomer, lean pour startups" },
    ],
  },

  // ═══ 🤖 AI-DEV (nouveau groupe 2026) ═══
  {
    id: "ai-eval-observability",
    group: "ai-dev",
    label: "AI Eval & Observability",
    hint: "Tracer + évaluer les LLM calls, détecter hallucinations, régressions quality",
    fitFor: ["saas", "outil", "appli"],
    recommended: { name: "Braintrust", score: "populaire", note: "🔥 Evals + observability, 1M spans/mois free" },
    alternatives: [
      { name: "Langfuse", score: "populaire", note: "🔥 Acquis ClickHouse jan 2026, 19/63 Fortune 50/500" },
      { name: "Pydantic Logfire", score: "emergent", note: "🌱 Full-stack observability AI-native" },
      { name: "Helicone", score: "emergent", note: "🌱 OSS, setup minimal" },
      { name: "LangSmith", score: "populaire", note: "LangChain-first" },
    ],
  },
  {
    id: "ai-gateway",
    group: "ai-dev",
    label: "AI Gateway & Routing",
    hint: "Multi-model routing, fallback, guardrails, rate limit, governance",
    fitFor: ["saas", "appli"],
    recommended: { name: "Portkey", score: "populaire", note: "🔥 2T tokens/jour, OSS, routing + guardrails" },
    alternatives: [
      { name: "OpenRouter", score: "populaire", note: "🔥 200+ LLMs unified API, routing stateless" },
      { name: "LiteLLM", score: "emergent", note: "🌱 OSS proxy, 100+ providers, self-host" },
      { name: "Vercel AI Gateway", score: "populaire", note: "Claude Opus 4.7, Qwen 3.6, team privacy controls" },
    ],
  },
  {
    id: "ai-coding-assistant",
    group: "ai-dev",
    label: "AI Coding Assistant",
    hint: "IDE/terminal AI-native pour le dev solo — choisir l'outil(s) quotidien",
    fitFor: ["saas", "outil", "appli", "logiciel"],
    recommended: { name: "Cursor 3", score: "populaire", note: "🔥 Composer 2, 61.3 CursorBench, 200+ tokens/sec" },
    alternatives: [
      { name: "Claude Code", score: "populaire", note: "🔥 1M context gratuit, prompt caching, batch API, terminal agentic" },
      { name: "Windsurf", score: "populaire", note: "🔥 Wave 13, Plan Mode, Parallel Multi-Agent (acquis Cognition)" },
      { name: "Zed", score: "emergent", note: "🌱 Rust-native, AI inline, ultra-rapide" },
      { name: "GitHub Copilot", score: "populaire", note: "Inline completions, 29% adoption (déclinant)" },
      { name: "GitHub Copilot Workspace", score: "legacy", note: "🪦 Dépassé par Cursor + Claude Code" },
    ],
  },
];

// Helpers
export function getCategoriesForProject(type: ProjectType): ServiceCategory[] {
  return SERVICES_CATALOG.filter((c) => c.fitFor.includes(type));
}

export function getCategoriesByGroup(group: ServiceGroup): ServiceCategory[] {
  return SERVICES_CATALOG.filter((c) => c.group === group);
}

export const SERVICE_GROUP_META: Record<ServiceGroup, { emoji: string; label: string }> = {
  monetisation: { emoji: "💰", label: "Monétisation" },
  communications: { emoji: "📬", label: "Communications" },
  "contenu-medias": { emoji: "🗃️", label: "Contenu & Médias" },
  "ai-dev": { emoji: "🤖", label: "AI & Dev Tools" },
  "growth-support": { emoji: "🤝", label: "Growth & Support" },
};

export const SERVICE_SCORE_META: Record<ServiceScore, { emoji: string; label: string; hint: string }> = {
  populaire: { emoji: "🔥", label: "Populaire", hint: "Marché dominant 2026 — choix safe" },
  emergent: { emoji: "🌱", label: "Émergent", hint: "À surveiller — potentiel fort" },
  legacy: { emoji: "🪦", label: "Legacy", hint: "Éviter pour un nouveau projet" },
};
