# CLAUDE.md — Mindeck

## C'est quoi ce projet

Outil perso de **gestion de projet de bout en bout** : de l'idée brute au lancement. Au départ un form de brainstorming SaaS en 15 sections, l'app a évolué en vrai outil de pilotage avec cockpit, roadmap, risques, décisions (ADR), todolist avancée et scoring ICE, et un workspace Dev personnel.

**Statut** : en prod sur Vercel, usage perso. Auth Supabase pour sécuriser les données d'Anthony (pas de multi-user produit).

**Fonctionnalités actuelles** :
- **Accueil à 2 onglets** :
  - 📂 **Projets** — liste des projets (type, statut, description), blocs "Blocages actifs" + "Risques top" (max 5 items, cliquables → deep link vers le projet), lien corbeille
  - 🧪 **Dev** — workspace personnel : idées dev (skills, agents), liens (sites, exemples), docs, infos, prefs (couleurs, styles). CRUD complet avec drag & drop et tags. Table `dev_items` en DB.
  - Toggle persistant en localStorage (`home_active_tab`)
- **Todolist main centralisée** — visible au-dessus des onglets, affiche TOUS les todos actifs (projets + dev). Badge d'origine (nom projet ou "Dev"). Sélecteur "Rattacher à" pour choisir projet ou Dev à la création. Exclut les todos de projets en corbeille.
- **Création** : type de projet obligatoire (outil / saas / appli / logiciel / business)
- **Dashboard projet à 7 onglets** :
  - 📊 **Cockpit** — pilotage en coup d'œil : blocages, prochaine action critique (auto = 1ère tâche P1), synthèse (description/problème/cible), progression & phase, NSM + métriques SaaS, risques top 3, roadmap Q1-Q4, stack chips, activité récente (3 dernières décisions + dernière entrée journal), dates clés
  - 💡 **Brainstorm** — form de 13 sections adaptatives par type de projet. Auto-collapse des sections 100% remplies. Export markdown pour Claude. Bouton "Synchroniser avec le cockpit".
  - ✅ **Tâches** — todolist avec priorités P1-P4, statuts (todo/in_progress/blocked/done), deadline, phase projet liée, scoring ICE optionnel. Toggle **Liste ⇄ Kanban** (persistant localStorage). Row entière cliquable pour éditer (tactile-friendly).
  - 🧭 **Décisions (ADR)** — titre + contexte + options + décision + raison + date. Les 3 dernières apparaissent dans le cockpit.
  - ⚙️ **Technique** — section stack isolée (framework, UI, DB, auth, paiements, email, hosting, monitoring, repos).
  - 🎨 **Design** — section design du brainstorm en onglet dédié.
  - 🔗 **Ressources** — liens sauvegardés avec tags, statuts et drag & drop. Inspirations et docs en texte libre.
- **Deep linking** : `?tab=tasks` dans l'URL ouvre directement le bon onglet du projet.
- **Soft delete** : corbeille discrète (lien en bas si > 0). Restauration ou suppression définitive (avec retape du nom).
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
│   ├── page.tsx                  # Accueil : Server Component → fetch all → HomeTabs client
│   ├── layout.tsx                # Root layout, fonts, PWA manifest
│   ├── loading.tsx
│   ├── new/page.tsx              # Création projet (nom + type obligatoire)
│   ├── project/[id]/
│   │   ├── page.tsx              # Server Component : fetch project + sections + todos + decisions + roadmap + risks + searchParams(?tab=)
│   │   ├── dashboard.tsx         # Orchestrateur client : header + tabs + panels + initialTab support
│   │   ├── cockpit.tsx           # Onglet Cockpit (8 blocs pilotage)
│   │   ├── editor.tsx            # Onglet Brainstorm (sections adaptatives + sync button)
│   │   ├── decisions.tsx         # Onglet Décisions (ADR)
│   │   ├── resources.tsx         # Onglet générique pour une section (utilisé par Technique + Design + Ressources)
│   │   ├── risks.tsx             # Module Risques (dans cockpit)
│   │   ├── roadmap.tsx           # Module Roadmap Q1-Q4 (dans cockpit)
│   │   ├── field-renderer.tsx    # FieldRenderer partagé (question/text/choice/links/score)
│   │   └── loading.tsx
│   ├── login/page.tsx            # Auth Supabase
│   ├── auth/
│   │   ├── callback/route.ts     # Auth callback avec gestion erreurs + validation OTP type
│   │   └── signout/route.ts
│   └── components/
│       ├── home-tabs.tsx         # Toggle Projets/Dev + blocs blocages/risques + liste projets
│       ├── dev-workspace.tsx     # CRUD dev_items (5 catégories) + drag & drop
│       ├── todolist.tsx          # Todolist liste/kanban — 3 scopes : home (centralisée) / project / global
│       ├── theme-toggle.tsx
│       └── trash-actions.tsx     # Restore + hard delete avec double confirmation
├── lib/
│   ├── sections.ts               # SOURCE DE VÉRITÉ des 15 sections + mapping type→sections + parseSections/isFieldFilled
│   ├── types.ts                  # Types partagés : Project, Todo, Decision, RoadmapItem, Risk, DevItem + constantes UI
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
│           ├── 006_simplify_scoring.sql
│           ├── 007_official_name.sql
│           └── 008_dev_workspace.sql
└── middleware.ts                 # Refresh session Supabase
```

## Modèle de données (Supabase)

7 tables, toutes protégées par RLS (chaque user ne voit que ses données).

### `projects`
```
id, user_id, name, official_name, type, description, status, north_star, next_action, deadline,
disabled_sections text[], metric_users, metric_mrr, deleted_at, created_at, updated_at
```
- `type` ∈ `outil | saas | appli | logiciel | business`
- `status` ∈ `idea | validating | building | mvp | testing | launched | continuous_improvement | final`
- `deleted_at` : null = actif, timestamp = corbeille
- `disabled_sections` : override manuel des sections désactivées
- `description`, `next_action` : peuvent être synchronisés depuis le brainstorm
- `official_name` : nom de marque (section Branding), synchro cockpit

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
- `project_id` null = todo Dev (hors projet), sinon todo rattachée à un projet

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

### `dev_items`
```
id, user_id, kind, title, content, url, tags text[], status, position, created_at, updated_at
```
- `kind` ∈ `idea | link | doc | info | pref`
- `status` ∈ `not_opened | in_progress | done` (nullable, utilisé pour kind='link')
- `position` : pour le drag & drop au sein d'une catégorie
- Index `(user_id, kind, position)`

**Schéma cible complet** dans `src/lib/supabase/schema.sql`. Migrations incrémentales dans `migrations/`. Ne jamais modifier le schéma sans validation d'Anthony.

## Palette de couleurs

Définie dans `src/app/globals.css` via des variables CSS :

| Token | Clair | Sombre | Usage |
|-------|-------|--------|-------|
| `--bg` | `#E8E0D8` (beige) | `#0c0c14` (navy) | Fond de page |
| `--card` | `#F2EDE8` (beige clair) | `#1a1a28` (navy clair) | Fond des cards |
| `--bd` | `#d4cbc0` (taupe) | `#2d2d40` (gris bleu) | Bordures |
| `--mt` | `#7a7068` (gris warm) | `#8b8fa5` (gris bleu clair) | Texte secondaire |
| `--ac` | `#7C6A4F` (moka) | `#C9956B` (caramel) | Accent (boutons, badges, onglets actifs) |
| `--ac-h` | `#65543C` (moka foncé) | `#B07F55` (caramel foncé) | Hover accent |

Gradient de fond via `body::before` (3 radial-gradients floutés).

## Conventions spécifiques à ce projet

- **Sections de brainstorming** : `src/lib/sections.ts` est la source de vérité. Chaque section a un `defaultForTypes: ProjectType[]` qui détermine si elle apparaît selon le type de projet. `RESOURCES_SECTION_KEYS = ["tech", "resources"]` sont affichées dans leurs onglets dédiés, pas dans l'éditeur brainstorm.
- **Types de champs** (`FieldType`) : `text`, `question`, `choice`, `links`, `score`.
- **UI française** : tous les labels, placeholders, hints en français. Code / variables / fonctions en anglais.
- **Auth** : pages protégées par `supabase.auth.getUser()` + `redirect("/login")` dans les Server Components. Ne pas utiliser `getSession()` côté serveur. Auth callback vérifie les erreurs et valide le type OTP.
- **Supabase client** : `createClient()` de `@/lib/supabase/server` pour les Server Components, `@/lib/supabase/client` pour les Client Components.
- **Theme** : variables CSS custom (`bg-card`, `text-muted`, `bg-accent`, `bg-accent-hover`, etc.) définies dans `globals.css`. Pas de `dark:` prefix Tailwind — les variables CSS changent via `.dark` class.
- **Style visuel** : palette beige/moka en clair, navy/caramel en sombre. `bg-card/80 backdrop-blur-sm border border-border rounded-2xl` partout. Max-width `max-w-6xl` pour les pages. Boutons : `bg-accent text-white hover:bg-accent-hover`.
- **Updates optimistes Supabase** : toujours avec rollback en cas d'erreur (`const previous = ...; commit(next); if (error) commit(previous)`).
- **Debounced save** : `Record<key, Timeout>` map pour éviter les collisions entre champs modifiés en parallèle. Utilisé dans editor.tsx, cockpit.tsx, dev-workspace.tsx.
- **Live-sync state** : le dashboard est propriétaire du state (`sections`, `todos`, `decisions`, `roadmap`, `risks`). Les panels appellent des callbacks pour propager les changements et permettre au cockpit de refléter les modifs en temps réel.
- **Todolist 3 scopes** : `home` (centralisée, tous les todos + badge + sélecteur), `project` (filtré par projet), `global` (legacy, project_id null).
- **Filtrage corbeille en cascade** : page.tsx fetch tous les todos/risks du user, puis exclut côté JS ceux rattachés à des projets soft-deleted.
- **Deep linking** : dashboard lit `?tab=` depuis searchParams et initialise l'onglet correspondant.

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
