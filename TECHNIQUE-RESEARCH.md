# TECHNIQUE-RESEARCH.md

> Document décisionnel pour la refonte de l'onglet **Technique** de Mindeck.
> Produit par recherche web (6 agents cadrage + 11 experts deep-dive) entre le 2026-04-18.
> Statut : **recherche — aucun code modifié dans `src/`**.

---

## 1. Executive summary

L'onglet Technique de Mindeck doit évoluer d'un simple formulaire "stack chips" vers un **outil de cadrage + challenge** d'une stack SaaS moderne, aligné sur la vision **SaaS public monétisé avec assistant AI intégré**.

**Recommandation** : **12 chapitres** structurés en 3 axes (Stratégie → Build → Run) + 1 transversal (Outillage) avec le même pattern UX que l'onglet Design (mode Débutant chat + Formulaire, progress bar, exports MD/JSON/Claude brief, carte A4). Le gating par `experience_level` réutilise le hook existant : **6 chaps essentiels** (débutant), **12 chaps** (intermédiaire/expert).

Le **chap 7** devient le **catalogue exhaustif de 25+ catégories de services tiers** (paiement, email, storage, CDN, images, video, search, CMS, forms, scheduling, PDF, support, docs, status page, CRM, analytics, A/B, onboarding, referral, SMS, webhook, i18n, GPU compute, AI gateway) avec scoring **populaire / émergent / legacy** pour chacune. Le **chap 10** intègre **workflow automation** (n8n, Zapier, Make — orchestration LLM + APIs tierces). Le **nouveau chap 12 🛠️ Outillage & Knowledge** cadre les outils personnels du fondateur (IDE+AI, Obsidian, Raycast, Figma, terminal) **variant selon le type de projet** (saas / appli / logiciel / outil / business).

**Différenciateurs vs Notion / Linear / StackShare** :
1. **Pédagogie guidée débutant→expert** (personne ne fait ça actuellement)
2. **Exports Claude brief** prêts à coller pour scaffolder la feature avec un LLM
3. **Intégration native ADR + cockpit + roadmap** (les concurrents sont cloisonnés)
4. **"Challenge" de la stack** via hypothèses risquées + checklist Go/No-Go + matrice de coûts @ N users

**Coût d'implémentation estimé** : 8-12 semaines à raison de 1 chapitre / 5-7 jours, en commençant par les 3 essentiels (Stratégie, Architecture, Coûts).

---

## 2. Vision produit

> **"De la stack subie à la stack choisie."**

Mindeck Technique devient le seul outil qui (a) **oblige** le solopreneur à nommer ses contraintes avant de choisir une stack, (b) **l'aide** à remplir les blocs critiques même s'il est débutant (mode chat FR), (c) **lui donne des exports actionnables** (brief Claude, ADR, Mermaid diagram, OpenAPI, CSV coûts), et (d) **relie** chaque choix à une ADR archivée dans l'onglet Décisions.

Les concurrents sont soit des **catalogues passifs** (StackShare), soit des **templates vides** (Notion), soit des **bases documentaires** (Confluence). Personne n'offre la boucle complète "interroger → cadrer → challenger → exporter → décider → tracker". Mindeck doit devenir cette boucle, pédagogie et export Claude en tête.

---

## 3. Architecture proposée

### 3.1 Menu vertical (12 chapitres — parité exacte avec Design)

```
🎯 1. Stratégie technique        · tech-strategy
🏛️ 2. Architecture & Blueprint    · tech-architecture
🎨 3. Frontend                    · tech-frontend
⚙️ 4. Backend                     · tech-backend
🗄️ 5. Data & Database             · tech-data
🔐 6. Auth & Sécurité             · tech-auth-security
🔌 7. Services tiers & Intégrations · tech-services   (catalogue exhaustif 25+ catégories)
🚀 8. Hosting & DevOps            · tech-hosting-devops
📊 9. Observability & Qualité     · tech-observability
🤖 10. IA & Automation            · tech-ai-automation (inclut workflow automation n8n/Zapier/Make)
💰 11. Coûts & Compliance         · tech-costs-compliance
🛠️ 12. Outillage & Knowledge      · tech-tooling      (variant par type projet)
```

### 3.2 Arbo de fichiers (sur le modèle `src/app/project/[id]/design/`)

```
src/app/project/[id]/technique/
├── index.tsx                      # Menu vertical (filtré par expertise) + badges % + routing
├── chapters.ts                    # Liste des 11 chapitres avec status (ready/wip/planned)
├── chapter-placeholder.tsx        # Fallback "bientôt"
├── strategy/                      # Chap 1 — tech-strategy
│   ├── index.tsx                  # Orchestrator (header + progress + blocs)
│   ├── state.ts                   # Types + merge-safe + compute
│   ├── validators.ts
│   ├── templates.ts
│   ├── blocks/
│   │   ├── constraints.tsx        # V1 — budget/TTM/team/ops/lock-in
│   │   ├── objectives.tsx         # V1 — métrique, scale, non-négociables
│   │   ├── drivers.tsx            # V1 — matrice pondérée (DX/cost/maintenance…)
│   │   ├── risks.tsx              # V1 — hypothèses risquées + validation test
│   │   ├── decision.tsx           # V1 — ADR léger (contexte + choix + alternatives)
│   │   ├── tradeoff-matrix.tsx    # V2 — visualisation 2D
│   │   ├── cost-projection.tsx    # V2 — coûts @ 1k/10k/100k users
│   │   ├── readiness-checklist.tsx# V2 — Go/No-Go 15 items
│   │   ├── printable-card.tsx     # V3 — carte A4
│   │   └── stack-comparator.tsx   # V3 — comparateur interactif
│   ├── components/
│   │   ├── BlockStatus.tsx
│   │   ├── IssueList.tsx
│   │   ├── ModeToggle.tsx
│   │   ├── BeginnerChat.tsx       # 10 questions FR
│   │   └── PrintableCard.tsx
│   └── exports/
│       ├── markdown.ts
│       ├── json.ts
│       ├── claude-brief.ts
│       └── mermaid.ts
├── architecture/                  # Chap 2 — tech-architecture (idem pattern)
├── frontend/                      # Chap 3
├── backend/                       # Chap 4
├── data/                          # Chap 5
├── auth-security/                 # Chap 6
├── api-integrations/              # Chap 7
├── hosting-devops/                # Chap 8
├── observability/                 # Chap 9
├── ai-automation/                 # Chap 10 (inclut workflow automation n8n)
├── costs-compliance/              # Chap 11
└── tooling/                       # Chap 12 (nouveau)
```

### 3.3 Libs Technique réutilisables

```
src/lib/technique/
├── completeness.ts          # computeChapterCompleteness + computeOverallTechniqueCompleteness + TECHNIQUE_SECTION_KEYS
├── gating.ts                # getActiveChapters(level) + BEGINNER_CHAPTERS + DEFAULT_EXPERIENCE_BY_ROLE
├── stack-presets.ts         # 5 presets : T3 / Next+Supabase / Rails / FastAPI+React / Astro static
├── cost-model.ts            # Scaling costs @ N users (Vercel, Supabase, Stripe, LLM)
├── owasp-checklist.ts       # OWASP Top 10 2025 items
├── dora-metrics.ts          # Déf + calc des 4 metrics
├── api-contract.ts          # Templates OpenAPI 3.1, Problem Details RFC 9457
├── ai-prompts.ts            # Library de system prompts (coach, microcopy, analyzer)
├── services-catalog.ts      # Chap 7 : 25+ catégories × services avec scoring populaire/émergent/legacy
├── workflow-automation.ts   # Chap 10 : n8n, Zapier, Make, Pipedream, Activepieces — recipes orchestration LLM
└── tooling-presets.ts       # Chap 12 : outillage variant par type projet (saas/appli/logiciel/outil/business)
```

---

## 4. Pédagogie débutant / intermédiaire / expert

### 4.1 Gating par niveau

**Mode Débutant** (`experience_level = beginner`) — **6 chapitres essentiels** :

| # | Chap | Pourquoi essentiel ? |
|---|---|---|
| 1 | 🎯 Stratégie | Avant toute stack : cadrer contraintes + objectifs |
| 3 | 🎨 Frontend | Tout débutant a un frontend |
| 4 | ⚙️ Backend | Même BaaS = comprendre où va la logique |
| 5 | 🗄️ Data | Modèle de données = fondation, tout le monde le touche |
| 6 | 🔐 Auth & Sécurité | OWASP non-négociable même débutant |
| 8 | 🚀 Hosting & DevOps | "Comment mettre mon app en ligne" = question #1 |

**Mode Intermédiaire + Expert** : les 12 chapitres visibles. Architecture (2), Services tiers (7), Observability (9), IA & Automation (10), Coûts (11), Outillage (12) apparaissent.

### 4.2 `DEFAULT_EXPERIENCE_BY_ROLE` (proposition)

Identique à Design :
- `demo / free / vip` → `beginner` (par défaut)
- `pro` → `intermediate`
- `admin` → `expert`

### 4.3 Vocabulaire débutant vs expert (illustration pour 3 concepts)

| Concept | Débutant (BD) | Intermédiaire | Expert |
|---|---|---|---|
| Base de données | "Un conteneur pour ranger tes infos, comme un classeur" | "Postgres avec relations, indexes" | "Postgres 16 + pgvector, IVFFlat, RLS optimisée avec `(select auth.uid())`" |
| Auth | "Comment tes users se connectent" | "JWT en cookie HttpOnly + RLS" | "PKCE flow + passkeys + OIDC + custom claims JWT" |
| Déploiement | "Mettre l'app sur internet" | "Git push → Vercel preview → prod" | "Canary 1% → 10% → 100% + DORA metrics + rollback plan" |

---

## 5. Modèle de données (Supabase)

### 5.1 Tables nouvelles proposées

Les 12 chapitres stockent leur state dans la table existante `sections` (JSON dans `content`, une ligne par `(project_id, section_key)`). En plus, **3 tables dédiées à créer dès la Phase 0** ✅ (décision Q5) :

#### `technique_stack_presets` (MVP — réutiliser une stack entre projets)
```sql
create table if not exists technique_stack_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade, -- nullable = global
  name text not null,
  snapshot jsonb not null, -- dump des 11 sections
  created_at timestamp default now(),
  updated_at timestamp default now()
);
-- RLS : user ne voit que ses presets
```

#### `technique_cost_projections` (MVP — snapshots historiques des coûts)
```sql
create table if not exists technique_cost_projections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  projection_month date not null,
  users_projected int not null,
  breakdown jsonb not null, -- { vercel: 50, supabase: 25, stripe_fees: 300, ... }
  total_usd numeric not null,
  created_at timestamp default now()
);
```

#### `technique_llm_usage` (MVP — tracking conso IA chap 10)
```sql
create table if not exists technique_llm_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  feature text not null, -- 'brainstorm_coach' | 'microcopy_gen' | ...
  model text not null,
  input_tokens int default 0,
  output_tokens int default 0,
  cache_read_tokens int default 0,
  cache_write_tokens int default 0,
  cost_usd numeric default 0,
  created_at timestamp default now()
);
```

### 5.2 Migrations à créer (3 nouvelles, exécution Phase 0)

```
src/lib/supabase/migrations/
├── 018_technique_stack_presets.sql      # MVP
├── 019_technique_cost_projections.sql   # MVP
└── 020_technique_llm_usage.sql          # MVP
```

Chaque migration respecte les conventions Mindeck :
- `create table if not exists` (idempotente)
- `alter table … enable row level security` immédiat
- 4 RLS policies par table (select/insert/update/delete, toutes `auth.uid() = user_id`)
- Index sur `(user_id, created_at desc)` pour tri rapide
- FK `on delete cascade` pour suppression propre en cas de suppression user/projet

**Ces migrations devront être exécutées manuellement dans Supabase Dashboard par Anthony** (règle CLAUDE.md : pas de modif DB sans validation). Les fichiers SQL seront produits lors de la Phase 0 d'implémentation.

---

## 6. Patterns UX réutilisables (du Design vers la Technique)

Tous les patterns UX du Design sont **directement transposables** :

| Pattern Design | Réutilisation Technique |
|---|---|
| Mode Débutant (chat FR 5-10 étapes) + Mode Formulaire | ✅ 1:1 — même structure, même toggle localStorage `mindeck:technique:{key}:mode` |
| State JSON dans `sections.content` + debounced save 800ms + merge-safe | ✅ 1:1 |
| Progress bar complétude `computeXxxCompleteness` 0-100 + validation live | ✅ 1:1 — via `src/lib/technique/completeness.ts` |
| Exports Markdown + JSON + Claude brief | ✅ 1:1 — ajouter Mermaid (archi), OpenAPI YAML (API), CSV (coûts) |
| Carte A4 imprimable via `@media print` CSS | ✅ 1:1 — utile surtout pour Stratégie, Architecture, Coûts |
| Agrégateur `computeOverallTechniqueCompleteness` affiché dans le cockpit | ✅ 1:1 — ajouter une 4ᵉ col à la grille Progression du cockpit (Brainstorm · Phase · 🎨 Design · ⚙️ Technique) |
| Gating via `useExperienceLevel` + custom event `mindeck:experience-changed` | ✅ 1:1 |
| Presets par type projet (`outil/saas/appli/logiciel/business`) | ✅ 1:1 dans `src/lib/technique/stack-presets.ts` |
| Live preview (chap 6 Visual) | ✅ Utile pour **Architecture** (Mermaid diagram live) et **API** (OpenAPI preview) |
| Banque d'inspirations (chap 7) | ⚠️ Pas évident à transposer (stack screenshots ?). **À trancher.** |

---

## 7. Intégrations avec les autres onglets

### 7.1 Onglet Décisions (ADR)
- **Lien fort** : Bloc "Décision" du chap 1 Stratégie → **crée automatiquement une ADR** dans l'onglet Décisions (pré-remplit `title`, `context`, `options`, `decision`, `rationale`).
- Chaque choix majeur dans chaps 3-11 (framework, DB, auth provider, hosting…) propose un bouton "Archiver comme ADR".
- **Éviter le doublon** : l'ADR est la source de vérité long terme, la Technique est la vue "cadrage initial".

### 7.2 Cockpit
- Ajouter une **4ᵉ colonne à la grille Progression** (après Brainstorm, Phase, 🎨 Design) : **⚙️ Technique %**. Cliquable → `navigateTab('technique')`.
- Afficher les **risques technologiques top 3** (Bloc V1 du chap 1) dans le widget Risques existant (déjà dédié aux risques projet — choisir : fusionner ou dédoubler).
- Nouveau widget cockpit optionnel : **"Stack chips"** (5-7 icônes résumant le choix : Next.js + Supabase + Vercel + Stripe + Resend + Anthropic).

### 7.3 Roadmap
- Le bloc "Décision" du chap 1 peut générer **3 stories M0** auto : "Setup Frontend", "Setup Backend", "Setup Auth".
- Les **hypothèses risquées** (chap 1 bloc V1.4) génèrent des **tâches todos** datées avec priorité P1/P2.

### 7.4 Ressources
- L'onglet Ressources existe déjà. Les 11 chapitres peuvent y **pousser des liens** utiles automatiquement (ex: docs Supabase, Anthropic Prompt Caching, OWASP Top 10).
- **Éviter doublon** : la Technique documente les choix, les Ressources stockent les liens externes d'apprentissage.

### 7.5 Onglet Design (Chap 1 Fondations)
- **Cohérence persona ↔ stack** : si persona = "No-code founder", warning si choix technique = Rust + K8s.
- Partage du `DEFAULT_EXPERIENCE_BY_ROLE` et du hook `useExperienceLevel` (déjà en place).

### 7.6 Onglet Brainstorm
- La section Technique existante (`tech`) est actuellement dans `RESOURCES_SECTION_KEYS` et affichée dans un onglet dédié. **À migrer** : garder la section legacy en lecture seule, pointer vers le nouvel onglet Technique.

---

## 8. Questions ouvertes à trancher avec Anthony

Les **10 questions** les plus bloquantes avant de coder (classées par impact) :

### Q1. **Nombre de chapitres : 12** ✅ TRANCHÉ (2026-04-18)
Option A retenue : **12 chapitres** (parité exacte avec Design). Chap 7 devient catalogue exhaustif de services tiers (25+ catégories avec scoring 🔥🌱🪦). Nouveau chap 12 🛠️ Outillage & Knowledge. Workflow automation (n8n/Zapier/Make) intégré dans chap 10.

### Q2. **Section `tech` legacy du Brainstorm** ✅ TRANCHÉ (2026-04-18)
Option (b) : **lecture seule + bouton "Migrer vers Technique"**. La section legacy reste consultable mais non éditable, avec un CTA qui copie/fusionne son contenu dans les chaps 3-5-6-8 du nouvel onglet Technique, puis marque la section legacy comme "migrée" (badge + lien). Pas de suppression forcée.

### Q3. **Gating Débutant : 6 chapitres** ✅ TRANCHÉ (2026-04-18)
`BEGINNER_CHAPTERS = ['tech-strategy', 'tech-frontend', 'tech-backend', 'tech-data', 'tech-auth-security', 'tech-hosting-devops']`. Les autres (2, 7, 9, 10, 11, 12) apparaissent en intermediate/expert.

### Q4. **Renommer `tech` legacy → `legacy-stack`** ✅ TRANCHÉ (2026-04-18)
Migration SQL one-shot : `update sections set section_key = 'legacy-stack' where section_key = 'tech'`. Mettre à jour `RESOURCES_SECTION_KEYS` dans `src/lib/sections.ts` et les références frontend. Les nouvelles `tech-*` n'entrent plus en conflit UX.

### Q5. **Créer les 3 tables Supabase dès le MVP** ✅ TRANCHÉ (2026-04-18)
`technique_stack_presets` + `technique_cost_projections` + `technique_llm_usage` créées en Phase 0. Migrations SQL 018/019/020 à valider + exécuter manuellement dans Supabase Dashboard.

### Q6. **Intégration ADR** ✅ TRANCHÉ (2026-04-18)
**Option (b) enrichie** : une seule source de vérité = table `decisions`.
- Le chap 1 Stratégie, bloc "Décision", affiche un **dropdown "Sélectionner une ADR existante"** (liste `decisions` du projet) qui pré-remplit le bloc en lecture-seule si une ADR est liée.
- Bouton **📌 "Archiver comme nouvelle ADR"** : pousse la saisie courante du bloc vers `decisions` (insert) + stocke l'`adr_id` dans le JSON `sections.content.tech-strategy.linked_adr_id`.
- **Pas de sync auto bidirectionnelle** (fragile). L'user pousse explicitement quand il veut archiver.
- Même pattern applicable à tous les blocs "Décision" importants (chap 3 framework, chap 5 DB, chap 6 auth provider…).

### Q7. **Banque de combos stack** ✅ TRANCHÉ (2026-04-18)
Oui — **bloc V3 "Combos stack curés"** dans chap 1 Stratégie. Liste de 8-12 combos populaires 2026 :
- 🔥 **Next + Supabase + Vercel + Resend + Anthropic** (Mindeck lui-même)
- 🔥 **T3 Stack** (Next + tRPC + Prisma + NextAuth + Tailwind)
- 🔥 **Rails + Postgres + Sidekiq + Render** (boring, solid)
- 🌱 **Hono + Drizzle + Neon + Clerk + Cloudflare** (edge-first 2026)
- 🌱 **Astro + Sanity + Vercel** (content sites)
- 🪦 **MERN** (legacy, éviter 2026)
- **Business no-code** (Tally + Airtable + Stripe + Make)
- etc.
Cliquer un combo → pré-remplit les chaps 3-4-5-6-7-8 + ouvre les blocs Décision pour validation. Persisté dans la table `technique_stack_presets`.

### Q8. **Scanner de stack existante** ✅ TRANCHÉ (2026-04-18) — V3
Upload `package.json` (JS), `requirements.txt` (Python), `Cargo.toml` (Rust), `Gemfile` (Ruby) → parser détecte :
- Framework (Next, Svelte, Django…)
- UI lib (Tailwind, shadcn, Mantine…)
- ORM (Drizzle, Prisma, SQLAlchemy…)
- Auth lib (NextAuth, Clerk, Lucia…)
- Services SDK (`stripe`, `@anthropic-ai/sdk`, `posthog-js`…)
→ pré-remplit les chaps 3-4-5-6-7. **Gros effort parsing mais killer feature** — à livrer en Phase 6 V3 NICE.

### Q9. **Exports** ✅ TRANCHÉ (2026-04-18)

| Export | Chapitres | Phase |
|---|---|---|
| **Markdown** | tous les 12 chaps | **MVP** (non négociable, pattern Design) |
| **Claude brief** (prompt LLM prêt à coller) | tous les 12 chaps | **MVP** (killer feature) |
| **JSON** (state versionné) | tous les 12 chaps | **MVP** (export/import projets) |
| **Mermaid diagram** | chap 2 Architecture (C4 Containers) + chap 5 Data (ER) | **MVP** (natif, zero dep) |
| **CSV** (coûts @ N users) | chap 11 Coûts | **MVP** (léger, utile comptable) |
| **GitHub Actions YAML starter** | chap 8 Hosting & DevOps | **MVP** (copy-paste prêt) |
| **OWASP Top 10 audit template** | chap 6 Auth & Sécurité | **MVP** |
| **OpenAPI 3.1 YAML** | chap 7 Services tiers | **V2** (seulement si API publique) |
| **n8n workflow JSON** | chap 10 IA & Automation | **V2** |
| **Carte A4 imprimable** | tous les chaps | **V3** |

### Q10. **Ordre d'implémentation : séquentiel 1 → 12** ✅ TRANCHÉ (2026-04-18)
Pas de réordonnancement. Phase 0 socle, puis Phase 1 (chaps 1-3), Phase 2 (4-6), Phase 3 (7-9), Phase 4 (10-12). Voir section 9 Roadmap détaillée.

---

## 9. Roadmap d'implémentation

**Ordre choisi** ✅ : **séquentiel 1 → 12** (pas de réordonnancement par priorité). Avantages : cohérence narrative (Stratégie avant Build avant Run), pattern libs/composants dupliqué d'un chap à l'autre = vélocité croissante.

### Phase 0 — Socle technique (1 semaine)
- Créer arborescence `src/app/project/[id]/technique/` (12 dossiers chaps + placeholders)
- Créer libs `src/lib/technique/` (completeness, gating, stack-presets, services-catalog, tooling-presets, workflow-automation)
- Router menu vertical + gating via `useExperienceLevel` (réutilisé de Design)
- Ajouter 4ᵉ colonne % Technique dans cockpit (grille Progression)
- Migration section `tech` legacy du Brainstorm (décision Q2 à trancher)
- **Migrations SQL à pousser sur Supabase Dashboard manuellement** :
  - `018_technique_stack_presets.sql`
  - `019_technique_cost_projections.sql`
  - `020_technique_llm_usage.sql`
- **Livrable** : onglet Technique navigable avec 12 placeholders + DB prête

### Phase 1 — Chaps 1 à 3 (2-3 semaines)
1. **Chap 1 🎯 Stratégie technique** (pilote — établit le pattern) — 5 blocs V1 MUST (contraintes, objectifs, drivers, risques, décision ADR) + mode Débutant 10 questions + exports MD/JSON/Claude brief
2. **Chap 2 🏛️ Architecture & Blueprint** — 5 blocs V1 + Mermaid diagram + C4 léger
3. **Chap 3 🎨 Frontend** — 4 blocs V1 (framework, rendering, styling, TypeScript) + presets T3/Next+Supabase/Astro

### Phase 2 — Chaps 4 à 6 (2-3 semaines)
4. **Chap 4 ⚙️ Backend** — 5 blocs V1 (pattern BaaS/BFF, runtime, API style, jobs, validation)
5. **Chap 5 🗄️ Data & Database** — 4 blocs V1 (DB, hosting, schéma, migrations) + Mermaid ER
6. **Chap 6 🔐 Auth & Sécurité** — 5 blocs V1 (auth, session, RBAC, OWASP Top 10 2025, secrets) + export audit OWASP

**→ Gating Débutant est couvert à la fin de Phase 2** (chaps 1, 3, 4, 5, 6, 8 = 6 chaps essentiels — reste à faire 8).

### Phase 3 — Chaps 7 à 9 (3-4 semaines)
7. **Chap 7 🔌 Services tiers & Intégrations** (gros morceau) — **catalogue exhaustif 26 catégories** avec scoring 🔥🌱🪦, filtrage par type projet, toggle "utilisé ?", coût estimé. Killer feature.
8. **Chap 8 🚀 Hosting & DevOps** — 5 blocs V1 (hosting, CI/CD, envs, domaine+SSL, déploiement) + GitHub Actions YAML starter
9. **Chap 9 📊 Observability & Qualité** — 5 blocs V1 (error tracking, uptime, logs, tests, metrics produit) + config Sentry starter

### Phase 4 — Chaps 10 à 12 (3-4 semaines)
10. **Chap 10 🤖 IA & Automation** — 6 blocs V1 (LLM, SDK, use cases, prompts, coût+caching, **workflow automation n8n/Zapier/Make**)
11. **Chap 11 💰 Coûts & Compliance** — 5 blocs V1 (coûts infra, coûts LLM, unit economics, RGPD, mentions légales) + CSV coûts @ N users
12. **Chap 12 🛠️ Outillage & Knowledge** — 6 blocs V1 variables par type projet (IDE+AI, knowledge mgmt, launcher, terminal, git GUI, …)

### Phase 5 — V2 SHOULD (5-7 semaines)
- Ajouter les blocs V2 à chaque chapitre (presets, matrices avancées, DORA, MFA, passkeys, RAG pgvector, streaming AI, n8n orchestration avancée…)
- Enrichir exports : OpenAPI 3.1 (chap 7), Mermaid C4 (chap 2), Claude brief avancé (tous)
- Hook Brainstorm Coach (chap 10) dans mode Débutant du chap Fondations (Design)

### Phase 6 — V3 NICE (évolutif, par opportunité)
- Cartes A4 imprimables tous chaps (réutilise `@media print` CSS de Design)
- Comparateur stacks interactif (chap 1)
- Scanner `package.json` / `requirements.txt` / `Cargo.toml` (chaps 3-5) — auto-remplissage
- Vibe extractor depuis screenshot (chap 10) — killer feature design+tech
- DORA metrics dashboard live (chap 9)
- GPU compute integration (Modal/Replicate — chap 10)
- Marketplace presets Mindeck (tech stacks curés communautaires)

**Total estimé** : MVP complet (12 chaps V1) en **12-15 semaines** solo, en séquentiel.

---

# 📚 DEEP DIVE PAR CHAPITRE

> Synthèse condensée des 11 recherches expertes. Pour les détails complets (exemples de code, prompts, sources), voir les transcripts dans `/tmp/claude-1000/.../tasks/`.

---

## Chapitre 1 — 🎯 Stratégie technique · `tech-strategy`

### Vision en 1 phrase
Cadrer les contraintes réelles (coût, délai, team) et les objectifs métier avant de choisir une techno, pour éviter les tech-driven decisions.

### V1 MUST (5 blocs)
1. **Contraintes du projet** — budget (choice: 0 / <50 / <200 / <1000 / ∞ €/mo), TTM (<3/3-6/6-12/flex mois), team_size, operational_burden, vendor_lock_in_tolerance
2. **Objectifs métier** — core_metric (question), scale_horizon_users, scale_horizon_months, non_negotiables, acceptable_tradeoffs
3. **Drivers de décision** — matrice pondérée (DX, TTD, Maintenance, Cost, Community, Portability, Security) × importance 1-5
4. **Hypothèses risquées** — tableau Risque × Probabilité × Impact × Test de validation × Deadline
5. **Décision préalable (ADR léger)** — contexte, options évaluées, stack choisie 7 domaines, key_rationale, alternatives_dismissed_why

### V2 SHOULD (3 blocs)
6. Matrice de trade-offs visuelle (2 axes)
7. Coûts marginaux estimés @ 1K/10K/100K users
8. Checklist readiness Go/No-Go (15 items)

### V3 NICE (2 blocs)
9. Carte A4 imprimable synthétique
10. Comparateur de stacks (5 presets curés)

### Mode Débutant (10 questions FR)
1. "Combien de temps avant tes premiers clients ?" · 2. "Combien à coder ?" · 3. "Budget mensuel max ?" · 4. "Changer de DB dans 2 ans = problème ?" · 5. "Ta métrique de succès ?" · 6. "Users concurrents à M6/M12 ?" · 7. "Techno déjà maîtrisée ?" · 8. "Ta plus grande peur ?" · 9. "Pivotable à M3 ?" · 10. "Récap choix + pourquoi ?"

### Exports
Markdown (décision + rationale), JSON (structure versionnée), Claude brief (prompt architecture), Mermaid (diagramme stack).

### Pièges
Choix techno avant problème · Sous-estimer ops solo · Ignorer coûts marginaux · Lock-in inconscient · Apprendre une techno critique · Dépendances non auditées · Zéro réévaluation.

### Sources
Martin Fowler (Architecture Conversationally), ADRs (adr.github.io), 12factor.net, T3 Stack, AWS Well-Architected 6 pillars, DORA, ThoughtWorks Radar.

---

## Chapitre 2 — 🏛️ Architecture & Blueprint · `tech-architecture`

### Vision en 1 phrase
Dessiner les couches, flux et services de ton SaaS maintenant pour éviter une refonte coûteuse plus tard (monolithe-first, limites claires, scalabilité progressive).

### V1 MUST (5 blocs)
1. **Pattern architectural** — Modular Monolith / Serverless / Edge / Microservices / Hybrid + rationale + when_revisit
2. **Couches techniques** — Frontend / API / Storage / Jobs / Cache / Integrations (liens services tiers)
3. **Flux de données** — happy path, error path, concurrency (optimistic/pessimistic), state management
4. **Modèle de données (entities)** — liste tables, PK strategy (uuid recommandé), relations, soft delete policy
5. **Sécurité & Auth boundaries** — auth_method, data_isolation (RLS vs app-code), secrets management, HTTPS enforcement

### V2 SHOULD (3 blocs)
6. C4 Model léger (Context + Containers via Mermaid)
7. Bounded Contexts DDD
8. Stratégie déploiement & observabilité

### V3 NICE (3 blocs)
9. Carte A4 blueprint imprimable
10. Export Mermaid/PlantUML/Structurizr
11. Matrice de dépendances (Component Dependency Graph)

### Mode Débutant (7 questions)
"Où vivent tes données ?" · "Qui peut lire/écrire dans ta DB ?" · "Plus grosse peur ops ?" · "Users isolés ?" · "Images/fichiers volumineux ?" · "Jobs async ?" · "Combien à coder ?"

### Exports
Markdown, Mermaid (C4 Containers), Claude brief archi.

### Pièges
Microservices trop tôt (regret #1 Indie Hackers) · Distributed Monolith · Leaky Abstractions · Premature Optimization · No Observability · Single Database (N+1).

### Sources
C4 Model (Simon Brown), Martin Fowler Monolith First, Milan Jovanovic Modular Monolith, Strategic Monoliths O'Reilly.

---

## Chapitre 3 — 🎨 Frontend · `tech-frontend`

### Vision en 1 phrase
Code minimal, itération rapide, déploiement fréquent — choisir des outils qui laissent se concentrer sur logique métier et UX.

### V1 MUST (4 blocs)
1. **Framework** — Next.js 16 App Router (défaut Mindeck) / SvelteKit / Remix / Astro — + version + routing strategy
2. **Rendering strategy** — SSR + RSC + Streaming + ISR + Client minimal — performance targets (LCP <1.8s, FID <100ms, CLS <0.1, JS bundle <60KB gzip)
3. **Styling** — Tailwind v4 CSS-first (défaut Mindeck) / CSS Modules / Styled-Components / shadcn custom
4. **TypeScript strict + runtime validation** — tsconfig strict, Zod ou Valibot

### V2 SHOULD (4 blocs)
5. State (zero lib / Zustand / Jotai / TanStack Query)
6. Data fetching (Server Actions / fetch / SWR)
7. Forms (HTML natif / React Hook Form / Conform)
8. Routing (App Router / TanStack)

### V3 NICE (4 blocs)
9. i18n (next-intl par défaut)
10. a11y tooling (jsx-a11y + axe DevTools)
11. PWA / offline
12. Error tracking client

### Mode Débutant (5 questions)
Appareil users · Contenu change souvent · Perf critique · Forms complexes · Seul/équipe

### Exports
Markdown, `package.json` starter, Claude brief scaffold.

### Pièges
Redux en solo · shadcn sans comprendre · Client Components partout · State lib prématurée · CSS-in-JS runtime.

### Sources
State of JS 2024, Next.js 16 blog (Turbopack), Tailwind v4 CSS-first config, React 19, t3.gg.

---

## Chapitre 4 — ⚙️ Backend · `tech-backend`

### Vision en 1 phrase
Pour solopreneur SaaS : abandonner l'idée d'un backend Node séparé — Server Components Next.js + Supabase suffisent à 95% des cas.

### V1 MUST (5 blocs)
1. **Pattern backend** — BaaS pur (Supabase, défaut Mindeck) / BFF (Server Actions, tRPC) / API-only server / Serverless Functions
2. **Runtime & langage** — Node 22+ (défaut), Bun 1.2+ (upgrade futur), Deno, Python, Go, Rust + matrix perf/stabilité/écosystème/hiring
3. **API style** — Server Actions (recommandé solo 1 client) / tRPC / REST / GraphQL — **pas de mix**
4. **Background jobs** — Vercel Cron → Inngest (50k runs free) → Trigger.dev (si workflows 4h+)
5. **Validation input** — Zod (défaut) ou Valibot (4KB vs 26KB)

### V2 SHOULD (4 blocs)
6. Caching (HTTP / ISR / Redis Upstash / Edge CDN)
7. Rate limiting (Upstash Ratelimit)
8. File upload (Supabase Storage suffit, R2/UploadThing plus tard)
9. Error handling (RFC 9457 Problem Details + error boundaries)

### V3 NICE (3 blocs)
10. Event-driven (Inngest events)
11. Feature flags (PostHog/Statsig/Unleash)
12. Search (Postgres FTS → Meilisearch/Algolia)

### Mode Débutant (5 questions)
Lire/écrire surtout · Tâches longues · API publique · Recherche 10k+ items · Stress 100k req/jour

### Exports
Markdown, Claude brief scaffold, OpenAPI template (si REST).

### Pièges
Backend séparé en solo · Mix REST+GraphQL+tRPC · Écrire sa job queue · Rate limit ignoré · Redis self-host · GraphQL pour SaaS solo.

### Sources
Bun vs Node 2026, Hono benchmarks, Next.js Server Actions vs tRPC, Inngest vs Trigger.dev, Supabase BaaS.

---

## Chapitre 5 — 🗄️ Data & Database · `tech-data`

### Vision en 1 phrase
Une DB boring, bien pensée et sécurisée (RLS + backups testés) scale mieux qu'une base fancy — PostgreSQL + Supabase = 80% des bonnes réponses en 2026.

### V1 MUST (4 blocs)
1. **DB principale** — PostgreSQL (défaut Mindeck) / MySQL / SQLite / Mongo + matrix (relations, RLS, JSON, vector, scaling)
2. **Hosting DB** — Supabase (défaut) / Neon (usage-based) / Turso (edge SQLite) / PlanetScale Postgres / Railway
3. **Schéma & modèle de données** — entities, PK strategy (uuid), relations, indexes
4. **Migrations** — SQL incrémentales idempotentes dans `src/lib/supabase/migrations/` (workflow actuel Mindeck ✅)

### V2 SHOULD (4 blocs)
5. ORM / Query Builder (pas d'ORM = défaut, Drizzle si besoin type-safety)
6. RLS & sécurité data (indexer `user_id`, wrapper `(select auth.uid())`)
7. Caching data (ISR, TanStack Query, Redis)
8. Backups & recovery (Supabase PITR 7j, test restore annuel)

### V3 NICE (5 blocs)
9. Vector DB pour IA (pgvector natif Supabase — pour RAG)
10. Full-text search (Postgres FTS → Meilisearch)
11. Data warehouse / analytics (DuckDB, Tinybird)
12. Multi-tenancy strategy (single DB + RLS `team_id` recommandé)
13. Seed & fixtures dev

### Mode Débutant (4 questions)
"Données ressemblent à tableur ou post-it ?" · "Relations ?" · "Combien d'users dans 1 an ?" · "Besoin sauvegarde ?"

### Exports
Markdown, schéma SQL starter, Mermaid ER diagram, Claude brief migrations.

### Pièges
Mongo pour relations (regret #1) · Prisma edge deployment · RLS oubliée · Backup jamais testé · Multi-tenant schema-per-tenant trop tôt · Sur-indexation · Oubli GDPR.

### Sources
State of DB 2024, Supabase RLS best practices, Neon vs Turso vs PlanetScale, Drizzle vs Prisma, pgvector docs.

---

## Chapitre 6 — 🔐 Auth & Sécurité · `tech-auth-security`

### Vision en 1 phrase
Sécuriser qui peut accéder (auth) et quoi faire (authorization) via mécanismes modernes (passkeys, MFA, OAuth 2.1) + audit OWASP 2025.

### V1 MUST (5 blocs)
1. **Authentification method** — email/password, magic link, OAuth 2.1+PKCE, passkeys WebAuthn (tendance 2026), SSO SAML/OIDC
2. **Session management** — JWT en cookie HttpOnly+Secure+SameSite, `@supabase/ssr` middleware (défaut Mindeck), refresh auto
3. **Authorization & rôles (RBAC)** — via `app_metadata` (PAS `user_metadata` modifiable), JWT claims + RLS DB
4. **OWASP Top 10:2025 checklist** — A01 Broken Access Control → A10 SSRF, checkbox par risque + evidence
5. **Secrets management** — env vars Vercel, rotation quarterly, pas de hardcode, audit

### V2 SHOULD (5 blocs)
6. MFA / 2FA (TOTP > Passkeys > SMS fallback)
7. HTTPS/TLS/HSTS/CSP/COOP-COEP headers
8. Rate limiting & brute force (multi-couches : velocity + behavioral)
9. GDPR foundations (consentement explicit, data minimization)
10. Password policy NIST 800-63B 2024 (min 8 chars, pas de rotation forcée, blacklist HIBP)

### V3 NICE (4 blocs)
11. Audit log (signups, logins, role changes, deletes)
12. Passwordless-first strategy 2026 (passkeys par défaut)
13. Threat modeling STRIDE
14. Security headers scanner (securityheaders.com)

### Mode Débutant (7 questions)
Qui se connecte · Comment · Contenu sensible · Rôles différents · 2FA · Pays cible · DB hosting

### Exports
Markdown (OWASP checklist), JSON audit template, Claude brief Supabase Auth setup.

### Pièges
Secrets en code · Rouler son auth · localStorage tokens · user_metadata RBAC · No CSRF · Password reset enumeration · SMS MFA · Audit log zéro.

### Sources
OWASP Top 10:2025, NIST 800-63B 2024, Supabase Auth SSR docs, Clerk/Kinde/WorkOS 2026, WebAuthn/Passkeys, HIBP API.

---

## Chapitre 7 — 🔌 Services tiers & Intégrations · `tech-services`

### Vision en 1 phrase
**Catalogue exhaustif** de toutes les briques SaaS disponibles en 2026 — pour chaque besoin (paiement, email, storage, CMS, support, GPU…), 1 service **recommandé** + 2 alternatives avec **scoring 🔥 populaire / 🌱 émergent / 🪦 legacy**.

### Principe UX
- Taxonomie pliable à 4 groupes : **💰 Monétisation** · **📬 Communications** · **🗃️ Contenu & Médias** · **🤝 Growth & Support**.
- Pour chaque catégorie : toggle **"utilisé ? oui/non/évalué"** + sélection service + coût estimé + lien ADR.
- Badge scoring visuel par service (🔥 populaire = marché dominant, 🌱 émergent = à surveiller, 🪦 legacy = éviter pour nouveau projet).
- Filtre par **type de projet** (saas / appli / logiciel / outil / business) — masque les catégories non pertinentes.

### V1 MUST — Catalogue complet (25 catégories)

#### 💰 Monétisation
| # | Catégorie | 🔥 Recommandé | 🌱 Alternative | 🪦 Legacy |
|---|---|---|---|---|
| 1 | **API interne style** | Server Actions (Next 16) | tRPC (TS monorepo) | GraphQL (overkill solo) |
| 2 | **Paiement** | Stripe (B2C scale) / Paddle (MoR EU) | LemonSqueezy, Polar | PayPal seul |
| 3 | **Facturation / Invoicing** | Stripe Invoicing | Paddle (inclus) | Chargebee, Zuora |
| 4 | **Referral / Affiliate** | Rewardful | Tolt, Partnerstack | FirstPromoter |

#### 📬 Communications
| # | Catégorie | 🔥 Recommandé | 🌱 Alternative | 🪦 Legacy |
|---|---|---|---|---|
| 5 | **Email transactional** | Resend (dev FR) | Postmark, Loops | SendGrid, Mailgun |
| 6 | **Email marketing** | Loops | ConvertKit, Beehiiv | Mailchimp |
| 7 | **SMS / WhatsApp** | Twilio | MessageBird, Vonage | Nexmo |
| 8 | **Push notifications** | OneSignal | Knock, Pushwoosh | Firebase Cloud Messaging (legacy) |
| 9 | **In-app chat / Support** | Crisp (FR, free tier) | Plain (dev-first), Chatwoot (OSS) | Intercom (cher) |
| 10 | **CRM** | Attio (B2B modern) | Folk, HubSpot Free | Salesforce (overkill) |

#### 🗃️ Contenu & Médias
| # | Catégorie | 🔥 Recommandé | 🌱 Alternative | 🪦 Legacy |
|---|---|---|---|---|
| 11 | **Storage fichiers** | Supabase Storage (défaut Mindeck) | Cloudflare R2, UploadThing | S3 direct |
| 12 | **CDN & Edge** | Vercel Edge Network (inclus) | Cloudflare, Bunny CDN | Fastly |
| 13 | **Images processing** | Cloudflare Images | Cloudinary, imgix | manual ImageMagick |
| 14 | **Video/audio streaming** | Mux | Cloudflare Stream, Daily.co | Vimeo Pro |
| 15 | **CMS headless** | Sanity (studio) | Payload (self-host), Directus | Strapi v3 (legacy), WordPress |
| 16 | **Forms** | Tally (FR, gratuit) | Typeform, Formspree | Google Forms |
| 17 | **Scheduling / Booking** | Cal.com (OSS) | Calendly, SavvyCal | Doodle |
| 18 | **PDF generation** | react-pdf | Puppeteer, PDFmonkey | DocRaptor |
| 19 | **Search** | Meilisearch (self-host) | Algolia (cher), Typesense | Postgres FTS (basique mais OK) |
| 20 | **i18n / Translation** | Tolgee | Lokalise, Crowdin | Custom JSON files |

#### 🤝 Growth & Support
| # | Catégorie | 🔥 Recommandé | 🌱 Alternative | 🪦 Legacy |
|---|---|---|---|---|
| 21 | **Analytics web** | Plausible (privacy FR) | Fathom, Simple Analytics | Google Analytics 4 (cookies) |
| 22 | **A/B testing & Feature flags** | PostHog (inclus) | GrowthBook, Statsig | Optimizely (cher) |
| 23 | **Onboarding users** | Userflow | Appcues, Chameleon | Intro.js (legacy) |
| 24 | **Help center / Docs** | Mintlify | GitBook, Docusaurus | ReadMe (cher) |
| 25 | **Status page** | Instatus | Better Stack Status, Statuspage.io | Cachet |
| 26 | **Webhook management** | Svix | Hookdeck | DIY retry logic |

### V2 SHOULD (6 blocs)
27. **API publique** (si futur) — OpenAPI 3.1, API keys, rate limit par clé
28. **SDK / clients** — TS SDK généré via OpenAPI, Postman collection
29. **Error handling RFC 9457 Problem Details** — standard 2026 pour errors API
30. **Idempotency keys** sur POST (Stripe, paiements)
31. **Vendor adapter pattern** — éviter lock-in (ex: swap Stripe → Paddle sans refactor)
32. **Budget alerts par service** — seuils Vercel/Supabase/Resend/Anthropic

### V3 NICE (3 blocs)
33. **Scanner stack existante** (upload `package.json` → auto-détection services intégrés)
34. **Générateur de contrats DPA** (auto-remplit RGPD chap 11 avec les sous-traitants)
35. **Marketplace Mindeck** (futur) — presets de services pour type projet

### Mode Débutant (8 questions par type projet)
**SaaS** : "Accepter paiements ?" · "Emails auto ?" · "Utiliser IA ?" · "Chat support users ?" · "Analytics ?" · "Forms d'inscription ?" · "Images user-generated ?" · "Docs publiques ?"
**Appli mobile** : remplace "docs publiques" par "push notifications"
**Logiciel desktop** : enlève chat/forms, garde auto-update + licensing
**Business no-code** : focus sur CRM + forms + email

### Exports
Markdown (liste services sélectionnés + coût total estimé), JSON (shape structurée), Claude brief (scaffold intégrations), CSV (budget mensuel par service).

### Pièges
Sélectionner 20 services (coût explose) · Pas de vendor adapter · Mixer REST+GraphQL+tRPC · Pas d'idempotency POST · API key en URL · Pas de webhook signature · Pas de retry+circuit breaker · Logs leakent PII · Oublier DPA (chaque service tiers = subprocessor RGPD).

### Sources
Stripe/Paddle/LemonSqueezy 2026, Resend vs Loops, Plausible vs GA4, PostHog, Svix webhooks, CNCF Landscape, StackShare taxonomies, RFC 9457.

---

## Chapitre 8 — 🚀 Hosting & DevOps · `tech-hosting-devops`

### Vision en 1 phrase
Où vit ton app (Vercel) + comment on la livre sans casser (CI/CD, preview envs, feature flags, rollback rapide).

### V1 MUST (5 blocs)
1. **Plateforme hosting** — Vercel (défaut Mindeck, Fluid Compute 2025) / Railway / Render / Fly.io / Cloudflare Workers / Self-host Coolify
2. **CI/CD pipeline** — GitHub Actions (lint + type-check + build + test + deploy) — YAML starter fourni
3. **Environnements** — dev / preview (PR) / staging / prod + variables env par env + secrets
4. **Domaine & SSL** — Vercel auto Let's Encrypt + HSTS + security headers
5. **Déploiement strategy** — auto-deploy main, preview PR, instant rollback 30s

### V2 SHOULD (5 blocs)
6. Preview environments (Vercel PR previews + Supabase branching)
7. Feature flags (PostHog, Vercel Flags) progressive delivery
8. Caching & CDN (ISR, edge cache, stale-while-revalidate)
9. Migrations DB dans CI/CD (Supabase branching GA)
10. Monorepo vs polyrepo (Turborepo si multi-app)

### V3 NICE (5 blocs)
11. DORA metrics tracking (Deployment Frequency, Lead Time, CFR, MTTR)
12. Infrastructure as Code (Terraform, Pulumi, OpenTofu)
13. Disaster recovery (RPO/RTO, Railway fallback)
14. Cost budget alerts (Vercel, Supabase)
15. Progressive delivery (canary, blue-green)

### Mode Débutant (7 questions)
Hébergeur · Tests auto avant deploy · Preview URL · Rollback · Feature flags · Backup DB · DORA metrics

### Exports
Markdown (CI/CD checklist, DR runbook), GitHub Actions YAML starter, Claude brief setup.

### Pièges
Push direct main sans tests · Secrets hardcodés · Pas de preview · Pas de rollback · Vercel pour tout (SPOF) · Over-engineering K8s/Terraform solo · Pas d'env staging · Migrations sans plan.

### Sources
Vercel Fluid Compute, GitHub Actions 2026, Supabase Branching, DORA metrics 2024 report, PostHog Feature Flags.

---

## Chapitre 9 — 📊 Observability & Qualité · `tech-observability`

### Vision en 1 phrase
Savoir ce qui se passe en prod, détecter les bugs avant tes users, et garantir que ton code fonctionne comme prévu.

### V1 MUST (5 blocs)
1. **Error tracking** — Sentry (5k events free) / PostHog Errors (100k free) / Highlight — config redact PII, breadcrumbs
2. **Uptime monitoring** — Better Stack (10 monitors free + alertes ∞) / Checkly / UptimeRobot — heartbeats `/health`
3. **Structured logging** — Pino JSON en prod + `pino-pretty` dev → Axiom/Better Stack
4. **Test strategy minimale** — Vitest (business-critical path), Playwright (e2e auth/create/export), coverage 60-70%
5. **Metrics produit** — DAU, MAU, retention (PostHog free 1M events)

### V2 SHOULD (5 blocs)
6. OpenTelemetry basics (traces/metrics/logs)
7. SLO/SLI framework (99.5% uptime, 95% requests <500ms)
8. Error budgets (Google SRE)
9. Session replay (PostHog 5k/mois free)
10. Coverage & mutation testing (Stryker)

### V3 NICE (6 blocs)
11. DORA metrics dashboard
12. Chaos engineering léger
13. RUM vs Synthetic
14. APM (Datadog/New Relic scaling)
15. Synthetic monitoring Playwright programmé
16. Observability as code (dashboards versionnés)

### Mode Débutant (8 étapes)
Crash 3h du matin → error tracking · Apprendre crash · DB down → uptime · Users actifs · Déboguer → logs+replay · Tester fiabilité → tests · Outil prioritaire

### Exports
Markdown plan + checklist, Sentry config starter, Vitest config, Claude brief observability.

### Pièges
Zero monitoring · Logs verbeux · PII/secrets dans logs · Monitoring sans alertes · Snapshots tests · 100% coverage obsession · Ignorer DORA · N outils différents (data fragmentation).

### Sources
Google SRE book, DORA 2024 report, OpenTelemetry 2026, Sentry/PostHog/Better Stack docs, Vitest/Playwright, Stryker mutation testing.

---

## Chapitre 10 — 🤖 IA & Automation · `tech-ai-automation`

### Vision en 1 phrase
**Deux axes** : (a) intégrer l'IA dans le produit (Claude Sonnet + RAG + agents) ET (b) orchestrer des workflows (n8n/Zapier/Make) qui connectent services tiers + LLM sans coder chaque glue.

### V1 MUST (6 blocs)
1. **Provider LLM** — Anthropic Claude Sonnet 4.6 (défaut) / Opus 4.7 (reasoning) / Haiku 4.5 (fast) / OpenAI / Mistral / OpenRouter — matrix prix/qualité/latency
2. **SDK / Framework** — Vercel AI SDK v6 (recommandé 2026) / Anthropic SDK direct / Mastra / LangChain (legacy)
3. **Use cases user-facing** — Brainstorm Coach (killer feature), Microcopy Generator, Résumé cockpit, Vibe Extractor, Task Prioritizer, Risk Analyzer, Docs Extractor
4. **Prompt engineering** — system prompts templating, few-shot, structured outputs (Zod schema)
5. **Cost & rate limit** — **prompt caching Anthropic 90% savings** (critique), batch API 50% off, token tracking
6. **Workflow automation (no-code/low-code)** — **n8n (self-host OSS, recommandé)** / Zapier (cher, populaire) / Make.com / Pipedream / Activepieces. Matrix coût/lock-in/limit executions. Cas d'usage : signup → email + Slack + CRM + onboarding LLM.

### V2 SHOULD (6 blocs)
7. RAG avec pgvector (Supabase) + OpenAI text-embedding-3-small
8. Streaming UI (Vercel AI SDK `streamText`, `useObject`)
9. Agents & tool use (function calling, MCP — Model Context Protocol Anthropic)
10. Evals/tests LLM (Braintrust free 100/mo, Promptfoo OSS)
11. **Workflow orchestration avancée** — n8n + LLM nodes (Claude, OpenAI built-in) pour orchestrer agents multi-step. Ex : cron → fetch data → Claude analyse → Supabase write → Slack notif.
12. AI dev tools (Claude Code + Cursor pour dev Mindeck — 30-60% faster)

### V3 NICE (6 blocs)
13. Multi-modal (vision Opus 4.7, audio)
14. Fine-tuning (rare, skip solo)
15. Guardrails & safety (prompt injection mitigation, PII redaction)
16. AI analytics (PostHog LLM)
17. Vibe extractor (screenshot → design tokens)
18. **GPU / ML compute** (si besoin custom model inference) — **Modal** (serverless GPU recommandé) / Replicate (API-first models) / RunPod (pod-based) / Fal.ai (specialized). Ex-Banana.dev fermé 2024.

### Mode Débutant (6 questions)
App génère texte · IA lit docs · Speed vs qualité · Budget LLM · Développeur (Claude Code) · **Workflows automatisés entre services (n8n) ?**

### Exports
Markdown checklist impl, Prompt library (`src/lib/technique/ai-prompts.ts`), Claude brief feature (Brainstorm Coach scaffold), **n8n workflow JSON starter** (template signup → Resend + Loops + Slack).

### Pièges
No cost tracking (bill spike) · Trusting outputs sans validation · No streaming (UX 5-10s) · No fallback provider · Prompt injection non mitigée · Prompts hardcodés · No evals (régression silencieuse) · Over-engineering LangChain · Caching non utilisé · **n8n self-host sans backup DB (workflows perdus)** · **Zapier lock-in ($$ à scale)**.

### Sources
Anthropic docs (claude.ai/docs), Prompt Caching 90%, MCP spec, Vercel AI SDK v6, Mastra, pgvector, Braintrust, Promptfoo, **n8n.io docs, Zapier vs Make vs Pipedream 2026, Modal vs Replicate GPU comparison**.

---

## Chapitre 11 — 💰 Coûts & Compliance · `tech-costs-compliance`

### Vision en 1 phrase
Viabilité financière + conformité légale minimale : modéliser coûts opérationnels (infra, LLM, paiements), unit economics, et respecter RGPD/cookies pour lancer sans risque légal en UE.

### V1 MUST (5 blocs)
1. **Coûts infra** — matrice @ 1/100/1k/10k/100k users (Vercel $20-500+, Supabase $25-300+, Stripe 2.9%+0.30, Paddle 5%+0.50, Resend $0-500, LLM variable)
2. **Coûts LLM/AI** — **sans caching = $200/mois @ 100 users, AVEC caching = $20/mois** (90% savings obligatoire)
3. **Unit economics** — ARPU, Gross Margin (>50%), CAC, LTV, LTV:CAC (>3), Payback (<12mo), Burn rate
4. **RGPD/GDPR minimal viable** — data locality EU, consentement, Art. 15 (accès) / 17 (oubli) / 20 (portabilité), cookies opt-in
5. **Mentions légales** — Privacy Policy + CGU + Cookies banner (templates CNIL)

### V2 SHOULD (5 blocs)
6. Coûts dev tools perso (Cursor $200/an, GitHub Copilot, Figma, domaine)
7. TCO 1/3/5 ans (incl temps solo dev)
8. DPA subprocessors (Supabase/Stripe/Vercel auto-signés)
9. Cookies & tracking ePrivacy (banner + localStorage prefs)
10. Suppression & portabilité données (soft-delete J30 → hard-delete, export JSON)

### V3 NICE (5 blocs)
11. ISO 27001 / SOC 2 readiness
12. Contrats subprocessors (liste publique)
13. Break-even calculator
14. Disaster recovery cost (RPO/RTO)
15. Pricing strategy (freemium / trial / tiered / usage-based)

### Mode Débutant (7 questions)
ARPU · Marché EU · Use IA · Tracker users · Launch timeline · Budget compliance · B2B plus tard

### Exports
Markdown coûts + checklist RGPD, CSV modèle coûts @ N users, Claude brief (générer Privacy Policy FR CNIL).

### Pièges
Oublier budget LLM · Pas de RGPD (amende CNIL 4% CA) · Cookies sans consentement · Data US si users EU (Schrems II) · Pas de DPA · Gross margin négative · Prix trop bas · Pas d'alerte cost.

### Sources
Vercel/Supabase/Stripe/Paddle pricing 2026, CNIL cookie guidelines 2026, Anthropic prompt caching, Paddle vs Stripe MoR, Schrems II GDPR.

---

## Chapitre 12 — 🛠️ Outillage & Knowledge · `tech-tooling`

### Vision en 1 phrase
Cadrer les outils **personnels du fondateur** qui ne sont pas dans l'app mais qui **déterminent ta vélocité** : IDE+AI, knowledge management, launcher, design, terminal — **variables selon le type de projet**.

### Principe UX
- **Filtrage automatique par type de projet** (saas / appli / logiciel / outil / business) — masque les catégories non pertinentes.
- Pour chaque outil : toggle "utilisé ? oui/non/évalué" + coût annuel + note libre.
- Bloc "Ton setup résumé" en sortie (carte imprimable + exportable en brief pour onboarding équipe future).

### V1 MUST — par type de projet

#### Commun (tous types)
1. **IDE + AI integration** — 🔥 **Cursor** ($20/mo, Claude 4.x intégré) / Claude Code (terminal-first, 2026) / Windsurf / VS Code + Copilot. Matrix DX / coût / learning curve.
2. **AI dev assistant terminal** — 🔥 **Claude Code** (Opus 4.7 agentic) / Aider / Continue.dev
3. **Knowledge management perso** — 🔥 **Obsidian** (local, markdown, plugins) / Notion (cloud, collab) / Logseq (OSS outliner) / Anytype (privacy-first). Pour Anthony : **Obsidian** recommandé (offline, pas de vendor lock, plugins sync Git).
4. **Terminal** — 🔥 **Warp** (AI built-in, macOS/Linux) / iTerm2 / Ghostty (2025 new) / Windows Terminal + WSL
5. **Git GUI (optionnel)** — Fork / GitKraken / GitHub Desktop / CLI pure
6. **Launcher productivité** — 🔥 **Raycast** (macOS) / **Flow Launcher** ou **PowerToys Run** (Windows/WSL — ton cas) / Alfred

#### Variation par type projet

| Type projet | Outils critiques additionnels |
|---|---|
| **🚀 SaaS** | Figma (design) · Linear/Shortcut (project mgmt alt à Mindeck) · Sentry CLI · Supabase CLI · Vercel CLI · Postman/Insomnia (API testing) |
| **📱 Appli mobile** | Xcode (iOS mandatory) · Android Studio · Expo CLI · Figma mobile kit · TestFlight / Play Console · Charles Proxy (debug network) |
| **🖥️ Logiciel desktop** | Tauri CLI / Electron Forge · Code signing certificates · Notarization tools · Icon generators (icons8, iconjar) · Virtualbox/Parallels (multi-OS testing) |
| **🔧 Outil CLI** | goreleaser / clap-rs (Rust) · Homebrew formula · npm publish workflow · GitHub releases automation |
| **💼 Business no-code** | Airtable / Notion · Zapier / n8n / Make · Figma Slides · Loom · Calendly · Tally forms |

### V2 SHOULD (6 blocs)
7. **Design collaboration** — Figma (standard) / Penpot (OSS) / Framer (no-code sites) / Sketch (legacy)
8. **Screencast / demo videos** — Loom / Tella / Screen Studio (macOS polished) / OBS Studio (OSS)
9. **Password manager** — 1Password (team-friendly) / Bitwarden (OSS) / KeePassXC (offline)
10. **Note-taking secondaire** — Apple Notes / Google Keep (lightweight capture avant Obsidian)
11. **Hardware essentials** — écran externe, clavier mécanique, souris ergonomique, casque noise-cancelling (impact prod mesurable)
12. **Domain registrar** — Cloudflare (recommandé, gratuit + DNS rapide) / Namecheap / Porkbun. NE PAS utiliser GoDaddy (upsells agressifs).

### V3 NICE (4 blocs)
13. **Automation perso** — scripts bash, GitHub Actions perso (check PRs, RSS→Obsidian), Raycast extensions custom
14. **Reading / curation** — Readwise (highlights books+articles) / Matter / Omnivore (OSS) → pipe vers Obsidian
15. **Focus / deep work** — Cold Turkey / Freedom / RescueTime (tracking)
16. **Mindeck presets "tooling"** — save ton setup complet comme preset réutilisable par projet

### Mode Débutant (6 questions)
1. "Tu dev sur quel OS principal ?" (macOS / Windows+WSL / Linux) → filtre Raycast vs PowerToys
2. "Tu prends des notes pendant que tu code ?" → Obsidian vs Notion vs rien
3. "Tu as un budget outils annuel ?" (&lt; 300 / 300-800 / 800+ €)
4. "Tu fais surtout du solo ou parfois de la pair programming ?" → Cursor collab mode, Live Share
5. "Ton projet = quel type ?" (saas/appli/logiciel/outil/business) → filtre V1
6. "T'utilises des workflows automatisés pour toi-même (scripts, Raycast, n8n perso) ?" → V3

### Exports
- **Markdown** : "Mon setup dev 2026" — liste outils + coût annuel + justification (pour onboarding ou portfolio)
- **JSON** : shape versionné
- **Claude brief** : "Voici mon stack d'outils. Génère-moi un script bash qui installe tout sur une nouvelle machine." (killer feature)
- **Carte A4 imprimable** : setup complet visuel

### Templates par type projet (présélection V1)

**SaaS solo (Mindeck)** :
Cursor + Claude Code + Obsidian + Warp + PowerToys Run (WSL) + Figma + Supabase CLI + Vercel CLI + 1Password + Cloudflare registrar = **~$400/an** ($200 Cursor, $96 Figma Pro optionnel, $60 1Password, $44 domaines)

**Appli mobile** :
+ Xcode/Android Studio (gratuit) + Expo Pro + TestFlight + Charles Proxy = **+$100/an**

**Logiciel desktop** :
+ Code signing cert ($99 Apple Developer, $200 EV cert Windows) + VirtualBox gratuit = **+$300/an**

### Pièges
Stack outils bloated (overload, jamais utilisés) · Lock-in éditeur (ex: Cursor→VS Code migration painful) · Oublier backup Obsidian (vault local = perdu si disk dies) · Pas de password manager (secrets en plain text) · Self-host n8n sans monitoring (workflows silently broken) · Sous-estimer coût Apple Developer / code signing pour desktop · Ignorer l'ergonomie hardware (burnout physique).

### Sources
State of Developer Tools 2024, Cursor vs Claude Code 2026, Obsidian vs Notion comparison, Raycast features, Warp terminal, Tauri vs Electron 2026, n8n self-host guides.

### Intégrations cross-chapitres
- **Chap 1 Stratégie** : contraintes budget → budget outils
- **Chap 10 IA & Automation** : Cursor + Claude Code + workflows n8n (overlap volontaire)
- **Chap 11 Coûts** : outils dev = partie du TCO solo

---

## 🔗 Annexe A — Dimensions techniques candidates (étape 1 cadrage)

Les 21 dimensions identifiées lors de la recherche macro, classées par fréquence :

1. **Critères de décision** (tous les frameworks)
2. **Frontend** (omniprésent)
3. **Backend** (omniprésent)
4. **Data/DB** (omniprésent)
5. **Auth/Sécurité** (OWASP, NIST, CIS)
6. **API/Intégrations** (CNCF, StackShare)
7. **Hosting/Infra** (AWS Well-Architected, 12-Factor)
8. **Observability** (OpenTelemetry, DORA, SRE)
9. **CI/CD & DevOps** (DORA, 12-Factor)
10. **Testing & Qualité** (DORA Change Failure Rate)
11. **Performance** (Web Vitals, AWS Performance pillar)
12. **Coûts/TCO** (AWS Cost Optimization)
13. **Compliance/Legal** (GDPR, SOC 2, ISO 27001)
14. **IA/LLM** (émergent 2025-2026)
15. **Architecture patterns** (C4, DDD, 12-Factor)
16. **Tech debt & Maintenance** (Fowler)
17. **Vendor lock-in & Portabilité** (12-Factor)
18. **Équipe & Hiring** (Pragmatic Engineer)
19. **Feature flags & Progressive delivery** (CNCF, DORA)
20. **Documentation & Onboarding** (ADR, Engineering Handbooks)
21. **Chaos engineering & Resilience** (CNCF, SRE)

Les **11 chapitres retenus** fusionnent logiquement ces dimensions (ex: CI/CD + Hosting = chap 8, Testing + Observability = chap 9, Perf couvert dans chap 3 et 9, Tech debt/Vendor lock couverts dans chap 1).

## 🔗 Annexe B — Benchmark concurrents (étape 1 cadrage)

| Outil | Force | Angle mort |
|---|---|---|
| Notion templates | Flexibilité | Pas de mode Débutant, pas de scoring |
| StackShare.io | Catalogue + stats communauté | Pas de pédagogie d'équipe |
| Linear specs | Minimaliste | Pas de section technique dédiée |
| Confluence ADR | Enterprise-grade | Trop lourd pour solo |
| Shape Up | Risques capturés bien | One-off pitches, pas de stack récurrente |
| Airtable | Custom tables | Pas de structure tech |
| Builder.io | Design→code pédagogique | Pas de décisions archi |
| Miro C4 | Diagrammes | Pas d'intégration gestion |

**Gap marché confirmé** : aucun outil n'offre (Pédagogie débutant→expert) × (ADR archivage) × (Export Claude brief) × (Progress tracking) × (Intégration cockpit/roadmap/décisions).

---

*Document généré le 2026-04-18 · basé sur 6 recherches macro + 11 deep dives experts · sources > 50 liens externes vérifiables ·*
*Aucun fichier modifié dans `src/`.*
