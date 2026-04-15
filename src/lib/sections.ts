import type { ProjectType } from "./types";

export type FieldType = "text" | "question" | "choice" | "links" | "score";

export interface SuggestionOption {
  value: string;
  doc?: string;
}

export interface ToolLink {
  label: string;
  url: string;
}

export interface Field {
  key: string;
  type: FieldType;
  label: string;
  hint?: string;
  placeholder?: string;
  options?: string[];
  suggestions?: SuggestionOption[];
  tools?: ToolLink[];
  max?: number;
  dateButton?: boolean;
}

export interface SectionDef {
  key: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  defaultForTypes: ProjectType[];
  fields: Field[];
}

export const DEDICATED_TAB_SECTION_KEYS = ["tech", "resources", "design"] as const;

export type SectionData = Record<string, unknown>;

export function parseSections(
  raw: Record<string, string>
): Record<string, SectionData> {
  const out: Record<string, SectionData> = {};
  for (const [key, content] of Object.entries(raw)) {
    try {
      out[key] = JSON.parse(content);
    } catch {
      out[key] = {};
    }
  }
  return out;
}

export function isFieldFilled(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return value > 0;
  return false;
}

const dedicatedTabKeys = new Set<string>(DEDICATED_TAB_SECTION_KEYS);

export function isSectionEnabled(
  def: SectionDef,
  type: ProjectType,
  overrideKeys: string[] = []
): boolean {
  const isDefault = def.defaultForTypes.includes(type);
  const isOverridden = overrideKeys.includes(def.key);
  return isDefault !== isOverridden;
}

export function getActiveSections(type: ProjectType, overrideKeys: string[] = []): SectionDef[] {
  return SECTIONS.filter(
    (s) => !dedicatedTabKeys.has(s.key) && isSectionEnabled(s, type, overrideKeys)
  );
}

export function getManageableSections(): SectionDef[] {
  return SECTIONS.filter((s) => !dedicatedTabKeys.has(s.key));
}

export const SECTIONS: SectionDef[] = [
  // ────────────────────────────
  // 1. IDENTITÉ
  // ────────────────────────────
  {
    key: "identity",
    title: "Identité du Projet",
    emoji: "🏷️",
    color: "border-blue-500",
    description: "Les infos de base de ton projet",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      { key: "tagline", type: "question", label: "Tagline — 1 phrase qui résume le produit", placeholder: "[Produit] permet à [qui] de [quoi]" },
      { key: "market_type", type: "choice", label: "Type de marché", options: ["B2C", "B2B", "B2B2C", "Marketplace", "Outil interne", "Autre"] },
      { key: "geo", type: "choice", label: "Zone géographique visée", options: ["France", "Europe", "Monde", "US/Anglophone", "Autre"] },
    ],
  },

  // ────────────────────────────
  // 2. LE PROBLÈME
  // ────────────────────────────
  {
    key: "problem",
    title: "Le Problème",
    emoji: "🔴",
    color: "border-red-500",
    description: "42% des SaaS échouent car ils résolvent un problème qui n'existe pas",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "problem_statement", type: "question", label: "Quel problème concret est résolu ?", hint: "Format : [Qui] a du mal à [quoi] parce que [pourquoi]", placeholder: "Ex: Les freelances perdent 3h/semaine à relancer leurs factures impayées car ils n'ont pas d'outil automatisé" },
      { key: "frequency", type: "choice", label: "Fréquence du problème", options: ["Plusieurs fois/jour", "Quotidien", "Hebdomadaire", "Mensuel", "Occasionnel"] },
      { key: "current_solutions", type: "question", label: "Comment les gens le résolvent AUJOURD'HUI sans ton produit ?", placeholder: "Excel, processus manuel, concurrent X, ils ne le résolvent pas..." },
      { key: "cost_of_problem", type: "question", label: "Combien ce problème coûte à l'utilisateur ?", hint: "En temps, argent, stress, opportunités ratées", placeholder: "Ex: 3h/semaine perdues = 150€/mois de temps gaspillé" },
      { key: "why_insufficient", type: "question", label: "Pourquoi les solutions actuelles sont insuffisantes ?", placeholder: "Trop cher, trop complexe, pas adapté à cette niche..." },
      { key: "interviewed", type: "choice", label: "As-tu parlé à de vraies personnes qui ont ce problème ?", options: ["Pas encore", "1-3 personnes", "4-9 personnes", "10+ personnes (idéal)"] },
      { key: "problem_notes", type: "text", label: "Notes libres sur le problème", placeholder: "Tout ce que tu as observé, entendu, lu sur ce problème..." },
    ],
  },

  // ────────────────────────────
  // 3. LA SOLUTION
  // ────────────────────────────
  {
    key: "solution",
    title: "La Solution & MVP",
    emoji: "💡",
    color: "border-yellow-500",
    description: "Ce qu'on construit — et surtout ce qu'on ne construit PAS",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      { key: "solution_desc", type: "question", label: "Comment ton produit résout le problème ? (2-3 phrases)", placeholder: "Description claire de la solution" },
      { key: "unique_value", type: "question", label: "Pourquoi choisir TON produit plutôt qu'un autre ?", hint: "C'est ta valeur unique — ce qui te différencie", placeholder: "Plus simple, moins cher, spécialisé pour [niche], IA intégrée..." },
      { key: "mvp_features", type: "question", label: "Les 3-5 fonctionnalités du MVP (version minimum)", hint: "Seulement ce qui est INDISPENSABLE pour que ça ait de la valeur", placeholder: "1. ...\n2. ...\n3. ...\n4. ...\n5. ..." },
      { key: "core_feature", type: "question", label: "Si tu ne gardais QU'UNE seule fonctionnalité, laquelle ?", hint: "C'est ton core value — tout le reste peut attendre", placeholder: "La feature sans laquelle le produit n'a aucune valeur" },
      { key: "not_building", type: "question", label: "Ce qu'on ne construit PAS en V1", hint: "Très important pour éviter le scope creep", placeholder: "Feature A → V2\nFeature B → jamais\nFeature C → si demandé par les clients" },
      { key: "validation_method", type: "choice", label: "Comment valider AVANT de coder ?", options: ["Landing page + waitlist", "Interviews utilisateurs", "Prototype/maquette", "MVP payant dès le départ", "Démo manuelle (concierge)", "Pas encore décidé"] },
    ],
  },

  // ────────────────────────────
  // 4. CIBLE
  // ────────────────────────────
  {
    key: "target",
    title: "Cible & Marché",
    emoji: "🎯",
    color: "border-blue-500",
    description: "À qui tu vends — être précis ici change tout",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "persona_who", type: "question", label: "Qui est ton client idéal ?", placeholder: "Ex: Freelance développeur web, 25-35 ans, 2-5 ans d'expérience" },
      { key: "persona_pain", type: "question", label: "Quelle est sa douleur principale ?", placeholder: "Ce qui l'énerve au quotidien par rapport à ce problème" },
      { key: "persona_goal", type: "question", label: "Quel est son objectif ?", placeholder: "Ce qu'il veut accomplir / le résultat désiré" },
      { key: "persona_budget", type: "question", label: "Combien est-il prêt à payer par mois ?", placeholder: "Ex: 10-30€/mois, ou 'ne paierait pas', ou '100€+ si ça lui fait gagner du temps'" },
      { key: "tam", type: "question", label: "Taille du marché (TAM) — estimation", hint: "Nb total de clients potentiels × prix moyen/an", placeholder: "Ex: 500 000 freelances en France × 20€/mois × 12 = 120M€/an" },
      { key: "why_now", type: "question", label: "Pourquoi ce produit est pertinent MAINTENANT ?", hint: "Nouvelle techno, réglementation, changement de comportement...", placeholder: "Ce qui fait que ce produit n'existait pas il y a 3 ans mais est possible aujourd'hui" },
    ],
  },

  // ────────────────────────────
  // 5. CONCURRENCE
  // ────────────────────────────
  {
    key: "competition",
    title: "Concurrence",
    emoji: "⚔️",
    color: "border-purple-500",
    description: "'Pas de concurrent' = le marché n'existe peut-être pas",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "competitors", type: "question", label: "Concurrents directs (nom, URL, prix, faiblesse)", placeholder: "1. [Nom] — [url] — [prix] — Faiblesse: ...\n2. [Nom] — [url] — [prix] — Faiblesse: ...\n3. [Nom] — [url] — [prix] — Faiblesse: ..." },
      { key: "indirect", type: "question", label: "Concurrents indirects (solutions de contournement)", placeholder: "Excel, processus manuels, outils gratuits, ne rien faire..." },
      { key: "advantage", type: "question", label: "Ton avantage compétitif — pourquoi tu gagnes ?", placeholder: "Prix, simplicité, niche spécifique, intégrations, support..." },
      { key: "advantage_type", type: "choice", label: "Type d'avantage (coche les vrais, pas les aspirationnels)", options: ["Expertise domaine unique", "Accès privilégié clients/partenaires", "Technologie propriétaire", "Effet réseau", "Données exclusives", "Coût inférieur", "Niche ignorée par les grands", "Intégration écosystème existant"] },
      { key: "weakness", type: "question", label: "Ta faiblesse principale vs les concurrents ?", hint: "Honnêteté requise ici", placeholder: "Moins connu, moins de features, pas de financement..." },
    ],
  },

  // ────────────────────────────
  // 6. BUSINESS MODEL
  // ────────────────────────────
  {
    key: "business",
    title: "Business Model",
    emoji: "💰",
    color: "border-orange-500",
    description: "Comment tu gagnes de l'argent — décider avant de coder",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "revenue_model", type: "choice", label: "Modèle de revenus", options: ["Abonnement mensuel/annuel", "Usage-based (pay per use)", "One-time payment", "Freemium → conversion payante", "Marketplace / commission", "Autre"] },
      { key: "pricing_free", type: "question", label: "Plan Gratuit — limites et ce qui est inclus", placeholder: "Ex: 3 projets, 100 requêtes/mois, pas de support" },
      { key: "pricing_pro", type: "question", label: "Plan Pro — prix et ce qui est inclus", placeholder: "Ex: 19€/mois — projets illimités, support email, exports" },
      { key: "pricing_business", type: "question", label: "Plan Business/Enterprise (optionnel)", placeholder: "Ex: 49€/mois — SSO, API, support prioritaire, custom" },
      { key: "mrr_6m", type: "question", label: "Objectif MRR à 6 mois", placeholder: "Ex: 500€/mois (25 clients × 20€)" },
      { key: "mrr_12m", type: "question", label: "Objectif MRR à 12 mois", placeholder: "Ex: 2 000€/mois (100 clients × 20€)" },
      { key: "breakeven", type: "question", label: "Combien de clients pour couvrir les coûts ?", hint: "Coûts fixes mensuels ÷ prix moyen = clients nécessaires", placeholder: "Ex: 150€/mois de coûts ÷ 20€ = 8 clients pour être rentable" },
    ],
  },

  // ────────────────────────────
  // 7. GO-TO-MARKET
  // ────────────────────────────
  {
    key: "gtm",
    title: "Go-to-Market",
    emoji: "🚀",
    color: "border-cyan-500",
    description: "Comment atteindre les 10 premiers clients payants",
    defaultForTypes: ["saas", "appli", "business"],
    fields: [
      { key: "channels", type: "choice", label: "Canaux d'acquisition envisagés (coche les prioritaires)", options: ["SEO / Blog / Content", "Publicités (Google, Meta)", "Cold outreach (emails, LinkedIn)", "Communautés (Reddit, Discord, Slack)", "Bouche à oreille / Referral", "Partenariats / Intégrations", "Product Hunt / AppSumo", "TikTok / YouTube / Réseaux sociaux", "Conférences / Networking"] },
      { key: "first_10", type: "question", label: "Comment obtenir tes 10 premiers clients ? Plan concret.", hint: "Sois très précis — 'LinkedIn' n'est pas suffisant", placeholder: "1. Lister 50 prospects sur LinkedIn qui matchent le persona\n2. Message personnalisé avec démo\n3. Offre early-adopter à -50%" },
      { key: "headline", type: "question", label: "Headline landing page — ce que tu fais pour qui", hint: "Doit être compris en 3 secondes par un inconnu", placeholder: "Ex: Automatise tes relances de factures. Sois payé en 2x moins de temps." },
      { key: "cta", type: "question", label: "Call-to-action principal", placeholder: "Ex: Essai gratuit 14 jours / Rejoindre la waitlist / Voir la démo" },
    ],
  },

  // ────────────────────────────
  // 8. VALIDATION & PMF
  // ────────────────────────────
  {
    key: "validation",
    title: "Validation & Product-Market Fit",
    emoji: "✅",
    color: "border-emerald-500",
    description: "Les signaux qui prouvent que tu es sur la bonne voie",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "hypotheses", type: "question", label: "Hypothèses à valider AVANT de coder", placeholder: "1. Les freelances perdent vraiment du temps sur les relances\n2. Ils sont prêts à payer 20€/mois\n3. L'automatisation email suffit (pas besoin de téléphone)" },
      { key: "pre_signals", type: "choice", label: "Signaux pré-lancement obtenus", options: ["Des gens ont demandé à acheter avant que je propose", "Des gens proposent de payer pour un accès anticipé", "50+ inscrits waitlist de manière organique", "Les prospects posent des questions détaillées", "Quelqu'un a dit 'je cherchais exactement ça'", "Aucun signal pour l'instant"] },
      { key: "post_signals", type: "choice", label: "Signaux post-lancement (si lancé)", options: ["40%+ diraient 'très déçu' sans le produit", "Croissance organique > 50% des nouveaux users", "Les clients restent malgré les bugs", "Le cycle de vente raccourcit", "Des referrals spontanés", "Pas encore lancé"] },
      { key: "pivot_signal", type: "question", label: "À quel moment tu pivotes ? Quel signal d'échec ?", placeholder: "Ex: Si après 3 mois et 50 essais gratuits, moins de 5 conversions payantes" },
      { key: "validation_notes", type: "text", label: "Notes de validation (interviews, feedback, données)", placeholder: "Retours d'interviews, métriques, commentaires utilisateurs..." },
    ],
  },

  // ────────────────────────────
  // 9. STACK TECHNIQUE
  // ────────────────────────────
  {
    key: "tech",
    title: "Stack Technique",
    emoji: "⚙️",
    color: "border-slate-500",
    description: "Décisions techniques avant de coder",
    defaultForTypes: ["outil", "saas", "appli", "logiciel"],
    fields: [
      {
        key: "framework",
        type: "question",
        label: "Framework frontend",
        placeholder: "Ex: Next.js 16 App Router",
        suggestions: [
          { value: "Next.js", doc: "https://nextjs.org/docs" },
          { value: "Remix", doc: "https://remix.run/docs" },
          { value: "Astro", doc: "https://docs.astro.build" },
          { value: "Vite + React", doc: "https://vite.dev/guide/" },
          { value: "SvelteKit", doc: "https://svelte.dev/docs/kit" },
        ],
      },
      {
        key: "ui",
        type: "question",
        label: "UI / Styles",
        placeholder: "Ex: Tailwind CSS v4 + shadcn/ui",
        suggestions: [
          { value: "Tailwind CSS v4", doc: "https://tailwindcss.com/docs" },
          { value: "shadcn/ui", doc: "https://ui.shadcn.com/docs" },
          { value: "Radix UI", doc: "https://www.radix-ui.com/primitives" },
          { value: "Mantine", doc: "https://mantine.dev/getting-started/" },
        ],
      },
      {
        key: "database",
        type: "question",
        label: "Base de données",
        placeholder: "Ex: Postgres via Supabase",
        suggestions: [
          { value: "Supabase (Postgres)", doc: "https://supabase.com/docs" },
          { value: "Neon (Postgres)", doc: "https://neon.tech/docs" },
          { value: "PlanetScale (MySQL)", doc: "https://planetscale.com/docs" },
          { value: "Prisma ORM", doc: "https://www.prisma.io/docs" },
          { value: "Drizzle ORM", doc: "https://orm.drizzle.team/docs/overview" },
        ],
      },
      {
        key: "auth",
        type: "question",
        label: "Authentification",
        placeholder: "Ex: Supabase Auth",
        suggestions: [
          { value: "Supabase Auth", doc: "https://supabase.com/docs/guides/auth" },
          { value: "Better Auth", doc: "https://www.better-auth.com/docs" },
          { value: "Clerk", doc: "https://clerk.com/docs" },
          { value: "Auth.js (NextAuth)", doc: "https://authjs.dev" },
        ],
      },
      {
        key: "payments",
        type: "question",
        label: "Paiements",
        placeholder: "Ex: Stripe",
        suggestions: [
          { value: "Stripe", doc: "https://docs.stripe.com" },
          { value: "Paddle", doc: "https://developer.paddle.com" },
          { value: "LemonSqueezy", doc: "https://docs.lemonsqueezy.com" },
        ],
      },
      {
        key: "email",
        type: "question",
        label: "Emails",
        placeholder: "Ex: Resend + React Email",
        suggestions: [
          { value: "Resend", doc: "https://resend.com/docs" },
          { value: "Postmark", doc: "https://postmarkapp.com/developer" },
          { value: "React Email", doc: "https://react.email/docs/introduction" },
          { value: "Loops", doc: "https://loops.so/docs" },
        ],
      },
      {
        key: "hosting",
        type: "question",
        label: "Hébergement",
        placeholder: "Ex: Vercel",
        suggestions: [
          { value: "Vercel", doc: "https://vercel.com/docs" },
          { value: "Netlify", doc: "https://docs.netlify.com" },
          { value: "Railway", doc: "https://docs.railway.com" },
          { value: "Fly.io", doc: "https://fly.io/docs" },
          { value: "Cloudflare Pages", doc: "https://developers.cloudflare.com/pages" },
        ],
      },
      {
        key: "monitoring",
        type: "question",
        label: "Monitoring",
        placeholder: "Ex: Sentry + PostHog",
        suggestions: [
          { value: "Sentry", doc: "https://docs.sentry.io" },
          { value: "PostHog", doc: "https://posthog.com/docs" },
          { value: "Axiom", doc: "https://axiom.co/docs" },
          { value: "Plausible", doc: "https://plausible.io/docs" },
        ],
      },
      { key: "repo_url", type: "question", label: "URL du repo GitHub", placeholder: "https://github.com/..." },
      { key: "prod_url", type: "question", label: "URL production", placeholder: "https://..." },
      { key: "tech_notes", type: "text", label: "Notes techniques", placeholder: "Architecture, contraintes, choix à faire..." },
    ],
  },

  // ────────────────────────────
  // 10. LÉGAL & RGPD
  // ────────────────────────────
  {
    key: "legal",
    title: "Légal & RGPD",
    emoji: "📜",
    color: "border-red-400",
    description: "Amendes RGPD : jusqu'à 20M€ — à penser dès le départ",
    defaultForTypes: ["saas", "logiciel", "business"],
    fields: [
      { key: "structure", type: "choice", label: "Structure juridique", options: ["Auto-entrepreneur", "SASU", "SAS", "EURL/SARL", "Pas encore décidé", "Autre"] },
      { key: "legal_docs", type: "choice", label: "Documents légaux nécessaires", options: ["CGU (Conditions Générales d'Utilisation)", "Politique de confidentialité", "Mentions légales", "Politique de cookies", "CGV (si facturation)", "Contrat traitement données (DPA)"] },
      { key: "data_collected", type: "question", label: "Quelles données personnelles tu collectes ?", placeholder: "Email, nom, IP, données d'usage, données de paiement..." },
      { key: "gdpr_rights", type: "choice", label: "Droits RGPD à implémenter", options: ["Droit d'accès (télécharger ses données)", "Droit à l'effacement (supprimer son compte)", "Droit de rectification (modifier ses infos)", "Droit à la portabilité (export)", "Notification de violation (72h max)"] },
      { key: "legal_notes", type: "text", label: "Notes légales", placeholder: "Questions, points à vérifier, contacts avocat..." },
    ],
  },

  // ────────────────────────────
  // 11. BRANDING
  // ────────────────────────────
  {
    key: "branding",
    title: "Nom & Branding",
    emoji: "🎨",
    color: "border-pink-500",
    description: "L'identité visuelle de ton produit",
    defaultForTypes: ["saas", "appli", "business"],
    fields: [
      { key: "official_name", type: "question", label: "Nom officiel du produit", hint: "Le nom de marque définitif (différent du nom de travail). Synchronisé avec l'en-tête du projet.", placeholder: "Ex: Brainwave, Linear, Notion..." },
      { key: "domain", type: "question", label: "Nom de domaine retenu", placeholder: "Ex: monoutil.com, monoutil.fr, monoutil.io" },
      { key: "domain_backup", type: "question", label: "Noms de domaine alternatifs", placeholder: "Ex: getmonoutil.com, trymonoutil.com" },
      { key: "colors", type: "question", label: "Couleurs principales", placeholder: "Ex: #1E3A5F (navy) / #2E86AB (bleu) / #FFFFFF (blanc)" },
      { key: "font", type: "question", label: "Police", placeholder: "Ex: Inter, Geist, Cal Sans" },
      { key: "logo_status", type: "choice", label: "Statut du logo", options: ["Pas encore", "En cours", "Fait", "Pas prioritaire"] },
      { key: "tone", type: "question", label: "Ton / voix de la marque", placeholder: "Ex: Pro mais accessible, pas de jargon, tutoiement, emojis OK" },
    ],
  },

  // ────────────────────────────
  // 11 bis. UI / UX / DESIGN (onglet dédié)
  // ────────────────────────────
  {
    key: "design",
    title: "UI / UX / Design",
    emoji: "🎨",
    color: "border-fuchsia-500",
    description: "Direction artistique, système de design et parcours utilisateur",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      {
        key: "moodboard",
        type: "links",
        label: "Moodboard — inspirations visuelles",
        hint: "Sites, apps, dribbble, captures d'écran, affiches... tout ce qui t'inspire",
      },
      {
        key: "color_palette",
        type: "question",
        label: "Palette de couleurs",
        hint: "Primaire, secondaire, accent, neutres. Penser contraste (WCAG AA = 4.5:1).",
        placeholder: "Ex:\nPrimary #1E3A5F\nAccent #2E86AB\nBackground #FAFAF7\nMuted #8A8A8A",
        tools: [
          { label: "Coolors", url: "https://coolors.co" },
          { label: "Realtime Colors", url: "https://www.realtimecolors.com" },
          { label: "UI Colors", url: "https://uicolors.app" },
          { label: "Contrast Checker", url: "https://webaim.org/resources/contrastchecker" },
        ],
      },
      {
        key: "typography",
        type: "question",
        label: "Typographie",
        hint: "Famille(s), graisses, échelle modulaire. 2 polices max suffisent.",
        placeholder: "Ex:\nHeadings : Geist Sans (700)\nBody : Inter (400/500)\nMono : JetBrains Mono",
        tools: [
          { label: "Type Scale", url: "https://typescale.com" },
          { label: "Font Pair", url: "https://www.fontpair.co" },
          { label: "Modern Font Stacks", url: "https://modernfontstacks.com" },
          { label: "Google Fonts", url: "https://fonts.google.com" },
        ],
      },
      {
        key: "design_tokens",
        type: "question",
        label: "Tokens & espacement",
        hint: "Radius, shadows, spacing scale, breakpoints. Définir une fois, réutiliser partout.",
        placeholder: "Ex:\nRadius : 8 / 12 / 16 / 24\nShadow : sm, md, lg\nSpacing : 4 / 8 / 12 / 16 / 24 / 32",
        tools: [
          { label: "Tailwind Tokens", url: "https://tailwindcss.com/docs/theme" },
          { label: "Design Tokens W3C", url: "https://www.designtokens.org" },
        ],
      },
      {
        key: "ui_components",
        type: "text",
        label: "Composants clés",
        hint: "Boutons, cards, inputs, modals, toasts... Lister les patterns réutilisables.",
        placeholder: "Ex:\n- Button : primary / secondary / ghost / danger\n- Card : bordered, padded, avec header optionnel\n- Input : label flottant, erreur en rouge sous le champ",
      },
      {
        key: "ux_principles",
        type: "text",
        label: "Principes UX",
        hint: "3-5 règles non négociables qui guident toutes les décisions d'interface.",
        placeholder: "Ex:\n1. Action primaire toujours visible sans scroll\n2. Feedback immédiat sur toute action\n3. Pas de modal qui bloque sans raison\n4. Formulaires courts, un champ par question",
        tools: [
          { label: "Refactoring UI", url: "https://www.refactoringui.com" },
          { label: "Laws of UX", url: "https://lawsofux.com" },
          { label: "NN Group — 10 Heuristics", url: "https://www.nngroup.com/articles/ten-usability-heuristics" },
        ],
      },
      {
        key: "user_journey",
        type: "text",
        label: "Parcours utilisateur clé",
        hint: "De l'arrivée sur la landing au premier 'aha moment'. Viser le chemin le plus court.",
        placeholder: "Ex:\n1. Landing → clic CTA\n2. Signup (email uniquement)\n3. Onboarding 2 étapes\n4. Premier succès en < 2 min",
      },
      {
        key: "accessibility",
        type: "choice",
        label: "Accessibilité — checklist WCAG AA",
        hint: "Les bases à couvrir dès le MVP. Un site accessible est meilleur pour tout le monde.",
        options: [
          "Contrastes AA (4.5:1 texte, 3:1 gros texte)",
          "Navigation clavier complète",
          "Focus visible sur tous les éléments interactifs",
          "Labels explicites sur les formulaires",
          "Attributs alt sur les images",
          "aria-* sur les composants custom",
          "Respect de prefers-reduced-motion",
          "Responsive mobile (< 375px)",
        ],
      },
      {
        key: "design_notes",
        type: "text",
        label: "Notes libres",
        placeholder: "Idées, doutes, références, retours d'utilisateurs sur le design...",
      },
    ],
  },

  // ────────────────────────────
  // 12. LIENS & RESSOURCES
  // ────────────────────────────
  {
    key: "resources",
    title: "Liens & Ressources",
    emoji: "🔗",
    color: "border-indigo-500",
    description: "TikTok, YouTube, articles, inspirations — tout centraliser ici",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      { key: "links", type: "links", label: "Liens sauvegardés", hint: "Ajoute tes liens TikTok, YouTube, articles, inspirations..." },
      { key: "inspirations", type: "text", label: "Inspirations (produits, designs)", placeholder: "Produits similaires qui t'inspirent, captures d'écran, designs..." },
      { key: "docs", type: "text", label: "Documentation utile", placeholder: "Liens vers docs techniques, API, tutoriels..." },
    ],
  },

  // ────────────────────────────
  // 13. JOURNAL DE BORD
  // ────────────────────────────
  {
    key: "journal",
    title: "Journal de Bord",
    emoji: "📓",
    color: "border-amber-500",
    description: "Décisions importantes, pivots, apprentissages",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      {
        key: "journal_entries",
        type: "text",
        label: "Journal",
        dateButton: true,
        placeholder: "[09/04/2026] Création du projet\n[10/04/2026] Première interview client → ...\n[15/04/2026] Pivot : changé la cible de ... à ...",
      },
    ],
  },

  // ────────────────────────────
  // 14. IDÉES EN VRAC
  // ────────────────────────────
  {
    key: "dump",
    title: "Idées en vrac",
    emoji: "🧠",
    color: "border-violet-500",
    description: "Toutes les idées sans filtre — à trier plus tard",
    defaultForTypes: ["outil", "saas", "appli", "logiciel", "business"],
    fields: [
      { key: "ideas", type: "text", label: "Dump d'idées", placeholder: "Toutes tes idées, fonctionnalités, pivots possibles, noms, tout ce qui te passe par la tête..." },
    ],
  },

  // ────────────────────────────
  // 15. SCORE FINAL
  // ────────────────────────────
  {
    key: "score",
    title: "Score — Prêt à coder ?",
    emoji: "📊",
    color: "border-green-500",
    description: "Auto-évaluation avant de lancer le développement",
    defaultForTypes: ["saas", "appli", "logiciel", "business"],
    fields: [
      { key: "score_problem", type: "score", label: "Problème validé (interviews faites)", max: 10 },
      { key: "score_market", type: "score", label: "Marché quantifié", max: 10 },
      { key: "score_competition", type: "score", label: "Concurrence analysée", max: 10 },
      { key: "score_mvp", type: "score", label: "MVP clairement défini", max: 10 },
      { key: "score_business", type: "score", label: "Business model viable", max: 10 },
      { key: "score_gtm", type: "score", label: "Plan go-to-market concret", max: 10 },
      { key: "score_demand", type: "score", label: "Signaux de demande réels", max: 10 },
      { key: "score_stack", type: "score", label: "Stack choisie et maîtrisée", max: 10 },
      { key: "score_legal", type: "score", label: "Légal/RGPD adressé", max: 10 },
      { key: "score_motivation", type: "score", label: "Motivation personnelle", max: 10 },
      { key: "decision", type: "choice", label: "Décision finale", options: ["🟢 GO — Lancer le développement", "🟡 WAIT — Continuer la validation", "🔴 PIVOT — Repenser le projet", "Pas encore décidé"] },
      { key: "next_action", type: "question", label: "Prochaine action concrète dans les 48h ?", placeholder: "Ex: Faire 3 interviews, créer la landing page, coder le MVP..." },
    ],
  },
];
