# 🧠 Brainstorming App

Outil perso de gestion de projet de bout en bout : de l'idée brute au lancement. Cockpit de pilotage, brainstorming guidé en 15 sections, todolist avec scoring ICE, roadmap trimestrielle, risk matrix, ADR et plus.

> App perso en prod sur Vercel, usage solo (auth Supabase). Pas de multi-user produit.

## Fonctionnalités

- **📊 Cockpit** — pilotage en coup d'œil : blocages actifs, prochaine action critique (auto = 1ère tâche P1), synthèse projet (description/problème/cible), progression & phase, North Star Metric + métriques SaaS, top 3 risques, roadmap Q1-Q4, stack chips, activité récente, dates clés
- **💡 Brainstorm** — 13 sections adaptatives selon le type de projet (outil / saas / appli / logiciel / business). Auto-collapse des sections complètes. Export markdown pour Claude. Bouton "Synchroniser" qui remonte les infos clés dans le cockpit.
- **✅ Tâches** — priorités P1-P4, statuts (todo/in_progress/blocked/done), deadline, phase projet, scoring **ICE** optionnel (Impact × Confiance × Facilité). Vue **Liste** ou **Kanban** (toggle persistant).
- **🧭 Décisions (ADR)** — journal des décisions structurantes (titre, contexte, options, décision, raison, date).
- **⚙️ Technique** — stack isolée avec tous les champs (framework, UI, DB, auth, paiements, email, hosting, monitoring).
- **🔗 Ressources** — liens sauvegardés avec tags, **statuts** (pas ouvert / en cours / traité) et **drag & drop**. Inspirations et docs.
- **Soft delete** — corbeille discrète en bas de l'accueil, restauration ou suppression définitive (avec retape du nom).
- **Thème** clair/sombre persistant.

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
5. `005_update_existing_types.sql` — mapping des types de projets existants (à adapter aux noms réels)
6. `006_simplify_scoring.sql` — migration RICE → none pour anciennes tâches

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
│   ├── page.tsx                  # Accueil : projets + todolist + corbeille
│   ├── new/page.tsx              # Création projet (nom + type obligatoire)
│   ├── project/[id]/
│   │   ├── dashboard.tsx         # Orchestrateur des 6 onglets
│   │   ├── cockpit.tsx           # 📊 Cockpit de pilotage
│   │   ├── editor.tsx            # 💡 Brainstorm
│   │   ├── decisions.tsx         # 🧭 Décisions (ADR)
│   │   ├── resources.tsx         # ⚙️ Technique + 🔗 Ressources
│   │   ├── risks.tsx             # Module risks (dans cockpit)
│   │   ├── roadmap.tsx           # Module roadmap (dans cockpit)
│   │   └── field-renderer.tsx    # Rendu partagé des champs de sections
│   └── components/
│       ├── todolist.tsx          # ✅ Todolist liste/kanban
│       ├── theme-toggle.tsx
│       └── trash-actions.tsx
├── lib/
│   ├── sections.ts               # Définitions des 15 sections + mapping type→sections
│   ├── types.ts                  # Types partagés (Project, Todo, Decision, RoadmapItem, Risk)
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
- **Pas de sur-ingénierie** : pas d'abstractions prématurées, pas de libs qui font gagner 10 lignes pour 100 KB de bundle.
