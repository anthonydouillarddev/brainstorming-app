# CLAUDE.md — Brainstorming App

## C'est quoi ce projet

À l'origine : app perso pour structurer les idées SaaS avant de coder (15 sections guidées).

**Vision actuelle** : évoluer vers un **vrai outil de gestion de projets** tout-en-un — brainstorming + structuration d'idées + notes + todos + suivi de projet. L'objectif est de centraliser tout le cycle de vie d'un projet (de l'idée brute au lancement) dans un seul outil.

**Statut** : en prod, usage personnel. Pas de multi-user au sens produit — juste l'auth Supabase pour sécuriser ses données. La base brainstorming existe, le reste est à construire progressivement.

**Fonctionnalités actuelles** :
- Liste de projets avec statut (idée / validation / dev / lancé)
- Éditeur de projet avec 15 sections de brainstorming (voir `src/lib/sections.ts`)
- Todolist globale (indépendante des projets)
- Export markdown pour discuter avec Claude
- Thème clair/sombre

**Direction produit** (à construire) :
- Notes libres par projet
- Todos attachées aux projets (pas seulement globales)
- Suivi d'avancement / milestones
- Tout ce qui rend l'outil utile pour piloter un projet de A à Z

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4** (config via PostCSS, pas de `tailwind.config`)
- **Supabase** — DB Postgres + Auth + RLS (`@supabase/ssr` pour les cookies SSR)
- **Vercel** pour l'hébergement
- Pas d'ORM (queries Supabase direct), pas de shadcn, pas de lib de state — tout est simple et direct

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Dashboard : liste projets + todolist
│   ├── layout.tsx            # Layout racine (thème, fonts)
│   ├── new/page.tsx          # Créer un projet
│   ├── project/[id]/         # Éditeur projet (page + editor.tsx client)
│   ├── login/page.tsx        # Login Supabase
│   ├── auth/                 # callback + signout
│   └── components/           # theme-toggle, todolist
├── lib/
│   ├── sections.ts           # SOURCE DE VÉRITÉ des 15 sections (types, labels, options)
│   └── supabase/
│       ├── client.ts         # createBrowserClient
│       ├── server.ts         # createServerClient (cookies)
│       └── schema.sql        # Schéma DB + RLS policies
└── middleware.ts             # Refresh session Supabase
```

## Modèle de données (Supabase)

3 tables, toutes protégées par RLS (chaque user ne voit que ses données) :

- **`projects`** : `id, user_id, name, status, created_at, updated_at`
  - `status` ∈ `idea | validating | building | launched`
- **`sections`** : `id, project_id, section_key, content, updated_at`
  - Une ligne par section remplie. `content` = texte libre (les champs structurés sont sérialisés dedans par l'éditeur).
  - `unique(project_id, section_key)` pour upsert.
- **`todos`** : `id, user_id, text, done, priority, created_at`
  - `priority` ∈ `low | normal | high | urgent`

Schéma complet dans `src/lib/supabase/schema.sql`. Si tu modifies le schéma, **demander à Anthony avant**.

## Conventions spécifiques à ce projet

- **Sections de brainstorming** : toujours éditer `src/lib/sections.ts` pour ajouter/modifier un champ. L'éditeur se reconstruit automatiquement à partir de cette liste.
- **Types de champs** : `text`, `question`, `choice` (options), `links`, `score` (max) — définis dans `FieldType`.
- **UI française** : tous les labels, placeholders, hints sont en français.
- **Auth** : pages protégées par `supabase.auth.getUser()` + `redirect("/login")` dans les Server Components. Ne pas utiliser `getSession()` côté serveur.
- **Supabase client** : `createClient()` de `@/lib/supabase/server` pour les Server Components, `@/lib/supabase/client` pour les Client Components.
- **Theme** : géré via `ThemeToggle`, classes `dark:` partout. Mode clair par défaut.
- **Style visuel** : beige/warm en clair, dégradés, `bg-card/80 backdrop-blur-sm`, `rounded-2xl`, `border-border`. Tokens CSS custom (`bg-card`, `text-muted`, `bg-accent`) définis dans `globals.css`.

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

## À savoir avant de coder

- **Code senior, 0 erreur** — TypeScript strict, pas de `any`, pas de commentaires inutiles.
- **UI en français**, code en anglais, commits en français (Conventional Commits).
- **Pas de sur-ingénierie** : ce projet est volontairement simple (pas d'ORM, pas de state lib, pas de composants sur-abstraits). Garder cet esprit.
- **Ne pas modifier `schema.sql` sans valider** avec Anthony.
- **Ne pas pusher sur main une feature non testée**. Petits fixes OK en direct, grosses features → branche `feat/nom`.
