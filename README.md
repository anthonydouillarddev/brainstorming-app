# 🧠 Brainstorm — Gestion de projets

Outil perso de gestion de projet de bout en bout : de l'idée brute au lancement. Cockpit de pilotage, brainstorming guidé en 13 sections, todolist centralisée avec scoring ICE, workspace Dev, roadmap trimestrielle, risk matrix, ADR et plus.

> App perso en prod sur Vercel, usage solo (auth Supabase). Pas de multi-user produit.

## Fonctionnalités

### Accueil
- **📂 Projets** — liste des projets avec type et statut. Blocs "Blocages actifs" + "Risques top" en haut (max 5, cliquables → deep link vers le projet).
- **🧪 Dev** — workspace personnel : idées dev (skills, agents), liens (sites, exemples), docs, infos, prefs (couleurs, styles). Drag & drop, tags, statuts.
- **📋 Todolist centralisée** — toutes les tâches actives (projets + dev) avec badge d'origine. Sélecteur "Rattacher à" pour choisir le projet ou Dev à la création.
- Toggle **Projets ⇄ Dev** persistant en localStorage.

### Dashboard projet (7 onglets)
- **📊 Cockpit** — pilotage en coup d'œil : blocages actifs, prochaine action critique (auto = 1ère tâche P1), synthèse projet, progression & phase, North Star Metric + métriques SaaS, top 3 risques, roadmap Q1-Q4, stack chips, activité récente, dates clés.
- **💡 Brainstorm** — 13 sections adaptatives selon le type de projet. Auto-collapse des sections complètes. Export markdown pour Claude. Bouton "Synchroniser" qui remonte les infos clés dans le cockpit.
- **✅ Tâches** — priorités P1-P4, statuts (todo/in_progress/blocked/done), deadline, phase projet, scoring **ICE** optionnel. Vue **Liste** ou **Kanban** (toggle persistant). Row cliquable pour éditer (tactile-friendly).
- **🧭 Décisions (ADR)** — journal des décisions structurantes (titre, contexte, options, décision, raison, date).
- **⚙️ Technique** — stack isolée avec tous les champs (framework, UI, DB, auth, paiements, email, hosting, monitoring).
- **🎨 Design** — section design du brainstorm en onglet dédié.
- **🔗 Ressources** — liens sauvegardés avec tags, **statuts** (pas ouvert / en cours / traité) et **drag & drop**. Inspirations et docs.

### Autres
- **Deep linking** — `?tab=tasks` dans l'URL ouvre directement le bon onglet.
- **Soft delete** — corbeille discrète en bas de l'accueil, restauration ou suppression définitive (avec retape du nom).
- **Thème** clair/sombre persistant. Palette beige/moka (clair), navy/caramel (sombre).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** strict
- **Tailwind CSS v4** (config via PostCSS)
- **Supabase** — Postgres + Auth + Row Level Security (`@supabase/ssr`)
- **Vercel** pour l'hébergement

Pas d'ORM, pas de state lib, pas de shadcn — queries Supabase direct, state local, volontairement simple et direct.

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

## Base de données

### Nouvelle instance Supabase

Exécuter `src/lib/supabase/schema.sql` une fois dans le SQL Editor de Supabase.

### DB existante (mise à jour)

Exécuter les migrations incrémentales dans l'ordre depuis `src/lib/supabase/migrations/` :

1. `001_project_management.sql` — extension `projects`/`todos` + table `decisions`
2. `002_project_description.sql` — colonne `description`
3. `003_soft_delete.sql` — colonne `deleted_at` (corbeille)
4. `004_roadmap_risks.sql` — tables `roadmap_items` + `risks`
5. `005_update_existing_types.sql` — mapping des types de projets existants
6. `006_simplify_scoring.sql` — migration RICE → none pour anciennes tâches
7. `007_official_name.sql` — colonne `official_name` (nom de marque)
8. `008_dev_workspace.sql` — table `dev_items` (workspace Dev)

Les migrations sont **idempotentes** (`create table if not exists`, `add column if not exists`), sûres à relancer.

## Commandes

```bash
npm run dev     # dev server (localhost:3000)
npm run build   # build production
npm run lint    # ESLint
```

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Accueil : Server Component → HomeTabs client
│   ├── new/page.tsx              # Création projet (nom + type obligatoire)
│   ├── project/[id]/
│   │   ├── dashboard.tsx         # Orchestrateur des 7 onglets + deep linking
│   │   ├── cockpit.tsx           # 📊 Cockpit de pilotage
│   │   ├── editor.tsx            # 💡 Brainstorm
│   │   ├── decisions.tsx         # 🧭 Décisions (ADR)
│   │   ├── resources.tsx         # ⚙️ Technique + 🎨 Design + 🔗 Ressources
│   │   ├── risks.tsx             # Module risks (dans cockpit)
│   │   ├── roadmap.tsx           # Module roadmap (dans cockpit)
│   │   └── field-renderer.tsx    # Rendu partagé des champs de sections
│   └── components/
│       ├── home-tabs.tsx         # Toggle Projets/Dev + blocages/risques
│       ├── dev-workspace.tsx     # 🧪 CRUD dev_items (5 catégories)
│       ├── todolist.tsx          # ✅ Todolist liste/kanban (home/project/global)
│       ├── theme-toggle.tsx
│       └── trash-actions.tsx
├── lib/
│   ├── sections.ts               # Définitions des 13 sections + mapping type→sections
│   ├── types.ts                  # Types partagés (Project, Todo, Decision, RoadmapItem, Risk, DevItem)
│   ├── scoring.ts                # Scoring ICE
│   └── supabase/
│       ├── client.ts / server.ts
│       ├── schema.sql
│       └── migrations/
└── middleware.ts                 # Refresh session Supabase
```

## Principes

- **Cockpit vs onglet dédié** : info consultée en un coup d'œil → cockpit. Édition longue / vue plein écran → onglet dédié.
- **Source unique** : les todos servent à la fois de liste d'actions et de source pour la "prochaine action critique" du cockpit. Pas de double saisie.
- **Updates optimistes avec rollback** : toutes les mutations mettent à jour le state immédiatement et rollback si Supabase échoue.
- **Filtrage corbeille en cascade** : un projet soft-deleted disparaît de partout (todos, blocages, risques) sur l'accueil.
- **Pas de sur-ingénierie** : pas d'abstractions prématurées, pas de libs qui font gagner 10 lignes pour 100 KB de bundle.
