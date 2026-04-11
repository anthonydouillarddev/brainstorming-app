# CLAUDE.md — Brainstorming App

## C'est quoi ce projet

Outil perso de **gestion de projet de bout en bout** : de l'idée brute au lancement. Au départ un form de brainstorming SaaS en 15 sections, l'app a évolué en vrai outil de pilotage avec cockpit, roadmap, risques, décisions (ADR), todolist avancée et scoring ICE.

**Statut** : en prod sur Vercel, usage perso. Auth Supabase pour sécuriser les données d'Anthony (pas de multi-user produit).

**Fonctionnalités actuelles** :
- **Accueil** : liste des projets (avec type, statut, description dérivée du form), todolist globale, corbeille (soft delete)
- **Création** : type de projet obligatoire (outil / saas / appli / logiciel / business)
- **Dashboard projet à 6 onglets** :
  - 📊 **Cockpit** — pilotage en coup d'œil : blocages, prochaine action critique (auto = 1ère tâche P1), synthèse (description/problème/cible), progression & phase, NSM + métriques SaaS, risques top 3, roadmap Q1-Q4, stack chips, activité récente (3 dernières décisions + dernière entrée journal), dates clés, bouton corbeille
  - 💡 **Brainstorm** — form de 13 sections adaptatives par type de projet (identité, problème, solution/MVP, cible, concurrence, business model, GTM, validation, légal, branding, journal, idées en vrac, score final). Auto-collapse des sections 100% remplies. Export markdown pour Claude. Bouton "Synchroniser avec le cockpit" en fin de form (remonte tagline → description, next_action score → next_action projet).
  - ✅ **Tâches** — todolist avec priorités P1-P4, statuts (todo/in_progress/blocked/done), deadline, phase projet liée, scoring ICE optionnel. Form d'ajout avec toutes les options (panneau expansible). Toggle **Liste ⇄ Kanban** (persistant localStorage par projet).
  - 🧭 **Décisions (ADR)** — titre + contexte + options + décision + raison + date. Les 3 dernières apparaissent dans le cockpit.
  - ⚙️ **Technique** — section stack isolée (framework, UI, DB, auth, paiements, email, hosting, monitoring, repos).
  - 🔗 **Ressources** — liens sauvegardés avec tags (TikTok/YouTube/Article/...), **statuts** (pas ouvert / en cours / traité) et **drag & drop** de liens. Inspirations et docs en texte libre.
- **Soft delete** : tous les projets vont dans une corbeille discrète (lien en bas de la liste, affiché seulement si > 0). Restauration ou suppression définitive (avec retape du nom).
- **Thème** clair/sombre avec persistance localStorage.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript strict
- **Tailwind CSS v4** (config via PostCSS, pas de `tailwind.config`)
- **Supabase** — Postgres + Auth + RLS (`@supabase/ssr` pour cookies SSR)
- **Vercel** pour l'hébergement
- **Pas d'ORM, pas de lib de state, pas de shadcn** — queries Supabase direct, state local, tout est simple et direct

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Accueil : projets + todolist + lien corbeille
│   ├── layout.tsx                # Root layout, fonts, PWA manifest
│   ├── loading.tsx
│   ├── new/page.tsx              # Création projet (nom + type obligatoire)
│   ├── project/[id]/
│   │   ├── page.tsx              # Server Component : fetch project + sections + todos + decisions + roadmap + risks
│   │   ├── dashboard.tsx         # Orchestrateur client : header + tabs + panels
│   │   ├── cockpit.tsx           # Onglet Cockpit (8 blocs pilotage)
│   │   ├── editor.tsx            # Onglet Brainstorm (sections adaptatives + sync button)
│   │   ├── decisions.tsx         # Onglet Décisions (ADR)
│   │   ├── resources.tsx         # Onglet générique pour une section (utilisé par Technique + Ressources)
│   │   ├── risks.tsx             # Module Risques (dans cockpit)
│   │   ├── roadmap.tsx           # Module Roadmap Q1-Q4 (dans cockpit)
│   │   ├── field-renderer.tsx    # FieldRenderer partagé (question/text/choice/links/score)
│   │   └── loading.tsx
│   ├── login/page.tsx            # Auth Supabase
│   ├── auth/                     # callback + signout
│   └── components/
│       ├── theme-toggle.tsx
│       ├── todolist.tsx          # Todolist liste/kanban (global ou projet)
│       └── trash-actions.tsx     # Restore + hard delete avec double confirmation
├── lib/
│   ├── sections.ts               # SOURCE DE VÉRITÉ des 15 sections + mapping type→sections + parseSections/isFieldFilled
│   ├── types.ts                  # Types partagés : Project, Todo, Decision, RoadmapItem, Risk + constantes UI
│   ├── scoring.ts                # Scoring ICE (Impact × Confiance × Facilité) + hints
│   └── supabase/
│       ├── client.ts             # createBrowserClient
│       ├── server.ts             # createServerClient (cookies SSR)
│       ├── schema.sql            # Schéma cible complet (référence)
│       └── migrations/
│           ├── 001_project_management.sql
│           ├── 002_project_description.sql
│           ├── 003_soft_delete.sql
│           ├── 004_roadmap_risks.sql
│           ├── 005_update_existing_types.sql
│           └── 006_simplify_scoring.sql
└── middleware.ts                 # Refresh session Supabase
```

## Modèle de données (Supabase)

6 tables, toutes protégées par RLS (chaque user ne voit que ses données).

### `projects`
```
id, user_id, name, type, description, status, north_star, next_action, deadline,
disabled_sections text[], metric_users, metric_mrr, deleted_at, created_at, updated_at
```
- `type` ∈ `outil | saas | appli | logiciel | business`
- `status` ∈ `idea | validating | building | mvp | testing | launched | continuous_improvement | final`
- `deleted_at` : null = actif, timestamp = corbeille
- `disabled_sections` : override manuel des sections désactivées
- `description`, `next_action` : peuvent être synchronisés depuis le brainstorm

### `sections`
Une ligne par section remplie. `content` = JSON texte (les champs structurés sont sérialisés).
`unique(project_id, section_key)` pour upsert.

### `todos`
```
id, user_id, project_id (nullable), text, done, status, priority, deadline, phase,
score_method, ice_impact, ice_confidence, ice_ease,
rice_reach, rice_impact, rice_confidence, rice_effort,  -- legacy, plus utilisés
created_at
```
- `priority` ∈ `urgent | high | normal | low` (affiché P1/P2/P3/P4)
- `status` ∈ `todo | in_progress | blocked | done`
- `phase` ∈ `discovery | build | test | launch` (nullable)
- `score_method` ∈ `none | ice` (RICE retiré de l'UI, colonnes legacy gardées en DB)
- `project_id` null = todo globale, sinon todo rattachée à un projet

### `decisions` (ADR)
```
id, project_id, title, context, options, decision, rationale, decided_at, created_at
```

### `roadmap_items`
```
id, project_id, quarter (Q1-Q4), year, objective, achieved, position, created_at
```
Index composite `(project_id, year, quarter, position)`.

### `risks`
```
id, project_id, title, probability (low/medium/high), impact (low/medium/high), mitigation, created_at
```
Criticité = `probability × impact` (échelle 1-9), affichée avec couleur (vert → jaune → orange → rouge).

**Schéma cible complet** dans `src/lib/supabase/schema.sql`. Migrations incrémentales dans `migrations/`. Ne jamais modifier le schéma sans validation d'Anthony.

## Conventions spécifiques à ce projet

- **Sections de brainstorming** : `src/lib/sections.ts` est la source de vérité. Chaque section a un `defaultForTypes: ProjectType[]` qui détermine si elle apparaît selon le type de projet. `RESOURCES_SECTION_KEYS = ["tech", "resources"]` sont affichées dans leurs onglets dédiés, pas dans l'éditeur brainstorm.
- **Types de champs** (`FieldType`) : `text`, `question`, `choice`, `links`, `score`.
- **UI française** : tous les labels, placeholders, hints en français. Code / variables / fonctions en anglais.
- **Auth** : pages protégées par `supabase.auth.getUser()` + `redirect("/login")` dans les Server Components. Ne pas utiliser `getSession()` côté serveur.
- **Supabase client** : `createClient()` de `@/lib/supabase/server` pour les Server Components, `@/lib/supabase/client` pour les Client Components.
- **Theme** : classes `dark:` partout. Tokens CSS custom (`bg-card`, `text-muted`, `bg-accent`, etc.) définis dans `globals.css`.
- **Style visuel** : palette beige/warm en clair, dark bleu en sombre. `bg-card/80 backdrop-blur-sm border border-border rounded-2xl` partout. Max-width `max-w-6xl` pour les pages.
- **Updates optimistes Supabase** : toujours avec rollback en cas d'erreur (`const previous = ...; commit(next); if (error) commit(previous)`).
- **Debounced save** : `Record<sectionKey, Timeout>` map pour éviter les collisions entre sections modifiées en parallèle.
- **Live-sync state** : le dashboard est propriétaire du state (`sections`, `todos`, `decisions`, `roadmap`, `risks`). Les panels appellent des callbacks pour propager les changements et permettre au cockpit de refléter les modifs en temps réel.

## Commandes

```bash
npm run dev     # dev server (localhost:3000)
npm run build   # build prod
npm run lint    # ESLint
```

Pas de tests pour l'instant.

## Variables d'environnement

`.env.local` (non commité) :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Workflow migration SQL

Les migrations sont **incrémentales et idempotentes** (`create table if not exists`, `add column if not exists`, `drop policy if exists`). Pour une nouvelle instance Supabase, exécuter `schema.sql` une fois. Pour une DB existante, exécuter uniquement les nouvelles migrations dans l'ordre.

## À savoir avant de coder

- **Code senior, 0 erreur** — TypeScript strict, pas de `any`, pas de commentaires inutiles.
- **UI en français**, code en anglais, commits en français (Conventional Commits).
- **Pas de sur-ingénierie** : pas d'ORM, pas de state lib, pas de composants sur-abstraits. Garder cet esprit.
- **Règle "cockpit vs onglet dédié"** :
  - Cockpit = info consultée en un coup d'œil, read-mostly, widgets compacts
  - Onglet dédié = édition longue, vue plein écran, tableau dense
- **Ne pas modifier `schema.sql` ou le modèle de données sans valider** avec Anthony.
- **Ne pas pusher sur `main` une feature non testée**. Petits fixes OK en direct, grosses features → branche `feat/nom`.
- **Ne pas dupliquer un bouton** entre onglets (règle design stricte).
