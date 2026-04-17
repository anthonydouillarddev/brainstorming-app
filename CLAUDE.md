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
  - 🎨 **Design** — menu vertical 12 chapitres (7 prêts, 5 en dev) — voir section Design ci-dessous
  - 🔗 **Ressources** — liens sauvegardés avec tags, statuts et drag & drop. Inspirations et docs en texte libre.
- **Deep linking** : `?tab=tasks` dans l'URL ouvre directement le bon onglet du projet.
- **Soft delete** : corbeille discrète (lien en bas si > 0). Restauration ou suppression définitive (avec retape du nom).
- **Thème** clair/sombre/système avec persistance localStorage + DB.
- **Settings utilisateur** : modal plein écran (style Linear) accessible via avatar dans le header. 6 sections :
  - 👤 Profil — nom d'affichage éditable (user_metadata), email, identifiant
  - 🎨 Apparence — thème (clair/sombre/système), densité d'affichage (compact/normal/confortable), vue tâches par défaut (liste/kanban)
  - 🔔 Notifications — placeholder (bientôt)
  - 📊 Plan — badge "Solo Gratuit", rôle
  - 🔒 Sécurité — changement mot de passe, déconnexion, suppression compte (double confirmation)
  - 📤 Données — placeholder export (bientôt)

## Onglet Design — 12 chapitres

Gros chantier en cours : transformer l'onglet Design en vrai outil de réflexion design (de la stratégie à l'exécution). Menu vertical à gauche, chaque chapitre = section indépendante avec son `state` JSON persisté dans `sections.content` (section_key dédiée).

**7 chapitres prêts sur 12** (V1 MUST + V2 SHOULD + V3 NICE par chapitre) :

| # | Chap | Section key | V1 MUST | V2 SHOULD | V3 NICE |
|---|---|---|---|---|---|
| 1 | 📐 Fondations | `foundations` | JTBD Ulwick + persona + aha moment + principes opposables + export MD | Job stories + Positioning Dunford + anti-goals + templates par type projet + 3 exports | Modes Débutant/Expert + jobs émotionnels/sociaux + Concurrent Mapper 2×2 + carte A4 PDF |
| 2 | 🎭 Identité | `identity` | 8 archétypes FR + sliders NN/G + glossaire DO/DON'T + brand promise + tone matrix | +3 sliders perso + refs/anti-refs + mood + live preview micro-copy + 2 exports (JSON, Claude brief) | Kapferer Prism 6 facettes + mode Débutant chat + carte A4 PDF |
| 3 | 🧭 Info & Nav | `info-nav` | Screen picker + sitemap builder + nav pattern (6 patterns avec live preview) | Labels dict + entités/relations + URL map + 3 exports (JSON, CSV, Claude brief) | Command palette + tree test + mode Débutant + carte A4 PDF |
| 4 | 🛣️ Parcours | `flows` | Flow steps + aha + onboarding pattern + NSA Reforge + friction score | Branches + Journey map AARRR + empty states + exports (Mermaid, JSON, Claude) | Critical path + AARRR dashboard + mode Débutant + carte A4 PDF |
| 5 | 🧠 Principes UX | `principles` | Nielsen 10 + Laws lib 18 lois + affordances + feedback inventory + Design Principles Card | Cognitive Load + Hick menu + Peak-End + Mental Model Canvas + exports (JSON, Claude) | Screen audit par type + Doherty latency log + mode Débutant + carte A4 PDF |
| 6 | 🎨 Visuel | `design_visual` | Palette OKLCH + tokens + mariage + live preview composants + export 6 formats (CSS, Tailwind, shadcn, DTCG, MD, DESIGN.md) | Presets DS Supabase + intégration données projet | — (déjà complet) |
| 7 | 🧱 Design System | `design-system` | Semantic tokens + 31 composants catalogués + 8 patterns + contrast pairs WCAG | Variant matrix + A11y WCAG 2.2 + Density switcher + exports (DTCG 2025.10, Claude) | Token versioning + mode Débutant + carte A4 PDF |

**5 chapitres en dev** (status=bientot) : 8 États · 9 Microcopy · 10 Accessibilité · 11 Adaptativité · 12 Validation.

**Pattern commun à chaque chapitre** :
- Mode Débutant chat (5-10 étapes) + Mode Formulaire (défaut) — toggle persisté en localStorage `mindeck:design:{key}:mode`
- State JSON dans `sections.content` + debounced save 800ms + merge-safe pour évolutions schéma
- Progress bar complétude (computeCompleteness 0-100) + validation live (errors/warnings)
- Exports : toujours 1 Markdown + optionnel JSON structuré + Claude brief + DTCG/Mermaid/CSV selon chap
- Carte A4 imprimable via `@media print` CSS (zéro lib) en V3

**Structure des fichiers** (exemple chap 1) :
```
src/app/project/[id]/design/foundations/
├── index.tsx                # Orchestrator (header + progress + blocs)
├── state.ts                 # Types + merge-safe + compute
├── validators.ts            # Règles de validation live
├── templates.ts             # Templates par type projet
├── blocks/                  # 1 fichier par bloc (V1 MUST, V2 SHOULD, V3 NICE)
├── components/              # BlockStatus, IssueList, ModeToggle, BeginnerChat, PrintableCard
└── exports/                 # markdown.ts + json.ts + claude-brief.ts + ...
```

**Libs Design réutilisables** (`src/lib/design/`) :
- `oklch.ts` — génération palette OKLCH, contrastRatio WCAG, generateDarkFromLight, findGlobalFix, suggestFiveColors
- `tokens.ts` — TYPO_RATIOS, SPACING/RADIUS/SHADOW presets, generators
- `fonts.ts` — 13 FONT_PAIRINGS + FONTS_LIBRARY Google Fonts
- `export.ts` — 6 formats (CSS, Tailwind v4, shadcn/ui, DTCG, Markdown, DESIGN.md)
- `validator.ts` — 15 règles validation design system
- `colors-api.ts` — CRUD combos/saved colors Supabase (erreurs propagées)
- `presets-api.ts` — CRUD design_system_presets Supabase
- `combos.ts` — 20 combos curés par style

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
│   ├── layout.tsx                # Root layout, fonts, PWA manifest, portal root (#modal-root)
│   ├── loading.tsx
│   ├── new/page.tsx              # Création projet (nom + type obligatoire)
│   ├── project/[id]/
│   │   ├── page.tsx              # Server Component : fetch project + sections + todos + decisions + roadmap + risks + preferences + searchParams(?tab=)
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
│       ├── theme-toggle.tsx      # Toggle clair/sombre + sync via custom event mindeck:theme-changed
│       ├── user-settings.tsx     # Modal settings plein écran (avatar + 6 sections) — rendu via portal #modal-root
│       └── trash-actions.tsx     # Restore + hard delete avec double confirmation
├── lib/
│   ├── sections.ts               # SOURCE DE VÉRITÉ des 15 sections + mapping type→sections + parseSections/isFieldFilled
│   ├── types.ts                  # Types partagés : Project, Todo, Decision, RoadmapItem, Risk, DevItem, UserPreferences + constantes UI
│   ├── scoring.ts                # Scoring ICE (Impact × Confiance × Facilité) + hints
│   ├── design/                   # Libs Design réutilisables (chap 6 + 7)
│   │   ├── oklch.ts              # Palette OKLCH + contrast WCAG + dark mode generator
│   │   ├── tokens.ts             # Typo/spacing/radius/shadow presets
│   │   ├── fonts.ts              # 13 font pairings + Google Fonts library
│   │   ├── export.ts             # 6 formats (CSS, Tailwind, shadcn, DTCG, MD, DESIGN.md)
│   │   ├── validator.ts          # 15 règles validation design system
│   │   ├── colors-api.ts         # CRUD combos/saved colors Supabase
│   │   ├── presets-api.ts        # CRUD design_system_presets Supabase
│   │   └── combos.ts             # 20 combos curés
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
│           ├── 008_dev_workspace.sql
│           ├── 009_todos_kind_description.sql
│           ├── 010_risks_resolved.sql
│           ├── 011_todos_effort_problem_tags.sql
│           ├── 012_user_preferences.sql
│           ├── 013_project_priority_position.sql
│           ├── 014_design_colors_combos.sql       # saved_colors + custom_color_combos
│           └── 015_design_system_presets.sql      # design_system_presets (preset DS complet par user/projet)
└── middleware.ts                 # Refresh session Supabase
```

**Arbo des 12 chapitres Design** (dans `src/app/project/[id]/design/`) :
```
design/
├── index.tsx                    # Menu vertical 12 chaps + routing
├── chapters.ts                  # Liste des 12 chaps avec status
├── chapter-placeholder.tsx      # "Bientôt" pour chaps en dev
├── foundations/                 # Chap 1 ✅
├── identity/                    # Chap 2 ✅
├── info-nav/                    # Chap 3 ✅
├── flows/                       # Chap 4 ✅
├── principles/                  # Chap 5 ✅
├── visual/                      # Chap 6 ✅
├── design-system/               # Chap 7 ✅
└── (states/microcopy/a11y/adaptivity/validation — en dev)
```

## Modèle de données (Supabase)

10 tables, toutes protégées par RLS (chaque user ne voit que ses données).

### `projects`
```
id, user_id, name, official_name, type, description, status, north_star, next_action, deadline,
disabled_sections text[], metric_users, metric_mrr, priority, position, deleted_at, created_at, updated_at
```
- `type` ∈ `outil | saas | appli | logiciel | business`
- `status` ∈ `idea | validating | building | mvp | testing | launched | continuous_improvement | final`
- `priority` ∈ `none | urgent | high | normal | low` (affiché P1/P2/P3/P4 + "—")
- `position` : ordre manuel à l'intérieur d'un niveau de priorité (drag & drop)
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

### `user_preferences`
```
id, user_id (unique), theme, display_density, default_task_view, role, locale, saved_colors jsonb, created_at, updated_at
```
- `theme` ∈ `light | dark | system`
- `display_density` ∈ `compact | normal | comfortable`
- `default_task_view` ∈ `list | kanban`
- `role` ∈ `admin | free | demo | pro | vip`
- `saved_colors` : couleurs favorites de l'user (chap 6 Visuel)
- Une seule ligne par user (upsert). Créée au premier changement de préférence.
- Fallback localStorage pour thème et densité (SSR hydration).

### `custom_color_combos` (migration 014)
```
id, user_id, name, style, colors text[], note, created_at
```
- `style` ∈ `vintage | modern | natural | pastel | corporate | playful | tech | ancient | brand | custom`
- Combos de couleurs personnels créés dans le chap 6 Visuel (bloc Combos).

### `design_system_presets` (migration 015)
```
id, user_id, project_id (nullable), name, snapshot jsonb, created_at, updated_at
```
- Snapshot complet d'un DS (primary + tokens + fonts + gradient + selected shades).
- `project_id` null = preset global (réutilisable sur tous les projets), sinon preset projet-spécifique.
- Créé/chargé depuis le bloc Presets du chap 6 Visuel.

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
- **Theme** : variables CSS custom (`bg-card`, `text-muted`, `bg-accent`, `bg-accent-hover`, etc.) définies dans `globals.css`. Pas de `dark:` prefix Tailwind — les variables CSS changent via `.dark` class. Sync entre ThemeToggle et UserSettings via custom event `mindeck:theme-changed` sur `window`.
- **Densité d'affichage** : classes CSS `html.density-compact` (14px) et `html.density-comfortable` (17px) sur `<html>`. Persisté en localStorage `display_density` + DB `user_preferences`.
- **Portal modal** : `<div id="modal-root" />` dans `layout.tsx`. Les modals utilisent `createPortal` vers ce conteneur pour échapper aux stacking contexts (`backdrop-blur`, `sticky`).
- **Style visuel** : palette beige/moka en clair, navy/caramel en sombre. `bg-card/80 backdrop-blur-sm border border-border rounded-2xl` partout. Max-width `max-w-6xl` pour les pages. Boutons : `bg-accent text-white hover:bg-accent-hover`.
- **Updates optimistes Supabase** : toujours avec rollback en cas d'erreur (`const previous = ...; commit(next); if (error) commit(previous)`).
- **Debounced save** : `Record<key, Timeout>` map pour éviter les collisions entre champs modifiés en parallèle. Utilisé dans editor.tsx, cockpit.tsx, dev-workspace.tsx, user-settings.tsx.
- **Live-sync state** : le dashboard est propriétaire du state (`sections`, `todos`, `decisions`, `roadmap`, `risks`). Les panels appellent des callbacks pour propager les changements et permettre au cockpit de refléter les modifs en temps réel.
- **Todolist 3 scopes** : `home` (centralisée, tous les todos + badge + sélecteur), `project` (filtré par projet), `global` (legacy, project_id null).
- **Filtrage corbeille en cascade** : page.tsx fetch tous les todos/risks du user, puis exclut côté JS ceux rattachés à des projets soft-deleted.
- **Deep linking** : dashboard lit `?tab=` depuis searchParams et initialise l'onglet correspondant.
- **Chapitres Design** : chaque chapitre a sa `section_key` dédiée dans `sections` (JSON dans `content`). Merge-safe pour évolution du schéma. Mode Débutant / Formulaire persisté en localStorage `mindeck:design:{key}:mode`. Libs réutilisables dans `src/lib/design/`.

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

**Migrations à exécuter manuellement dans Supabase Dashboard** si pas encore faites :
- `014_design_colors_combos.sql` — prérequis pour chap 6 Visuel (saved_colors + custom_color_combos)
- `015_design_system_presets.sql` — prérequis pour bloc Presets du chap 6 Visuel

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
