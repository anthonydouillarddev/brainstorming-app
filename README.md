# 🧠 Mindeck — Gestion de projets

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
- **⚙️ Technique** — **outil de cadrage stack complet en 12 chapitres guidés** : stratégie, architecture, frontend, backend, data, auth & sécurité, services tiers (catalogue 30 catégories avec scoring 🔥🌱🪦), hosting & DevOps, observability, IA & automation, coûts & compliance, outillage. Mode Débutant FR (chat guidé) + mode Formulaire. **Cmd+K command palette** pour navigation rapide. **Cost Calculator Live** ($/mois estimé à 100/1k/10k/100k users). Exports Markdown / JSON / Claude brief / Mermaid / CSV / YAML.
- **🎨 Design** — **12 chapitres guidés** (fondations, identité, nav, parcours, principes UX, visuel OKLCH, design system, états, microcopy, accessibilité WCAG 2.2, adaptativité, validation). Mode Débutant + presets + exports (6 formats).
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

1-13. **Core** : `001` à `013` — projets, todos, decisions, roadmap, risks, scoring ICE, dev_items, soft-delete, tags, priorités…
14. `014_design_colors_combos.sql` — saved_colors + custom_color_combos (Design chap 6)
15. `015_design_system_presets.sql` — snapshots DS complets (Design chap 6)
16. `016_design_ui_inspirations.sql` — banque d'inspirations + bucket Storage `inspirations` (Design chap 7)
17. `017_user_experience_level.sql` — colonne experience_level (gating débutant/intermédiaire/expert)
18. `018_technique_stack_presets.sql` — snapshots stack (Technique chap 7)
19. `019_technique_cost_projections.sql` — historique coûts (Technique chap 11)
20. `020_technique_llm_usage.sql` — tracking usage LLM (Technique chap 10)
21. `021_rename_tech_to_legacy_stack.sql` — rename ancienne section `tech` → `legacy-stack`

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
│   │   ├── cockpit.tsx           # 📊 Cockpit (grille Progression 4 cols : Brainstorm + Phase + 🎨 Design + ⚙️ Technique)
│   │   ├── editor.tsx            # 💡 Brainstorm
│   │   ├── decisions.tsx         # 🧭 Décisions (ADR)
│   │   ├── resources.tsx         # 🔗 Ressources
│   │   ├── design/               # 🎨 Onglet Design — 12 chapitres guidés
│   │   ├── technique/            # ⚙️ Onglet Technique — 12 chapitres + Cmd+K + Cost Calculator
│   │   ├── risks.tsx             # Module risks (dans cockpit)
│   │   ├── roadmap.tsx           # Module roadmap (dans cockpit)
│   │   └── field-renderer.tsx    # Rendu partagé des champs de sections
│   └── components/
│       ├── home-tabs.tsx         # Toggle Projets/Dev + blocages/risques
│       ├── dev-workspace.tsx     # 🧪 CRUD dev_items (5 catégories)
│       ├── todolist.tsx          # ✅ Todolist liste/kanban (home/project/global)
│       ├── user-settings.tsx     # Modal Settings (profil, apparence, plan, sécu…)
│       ├── theme-toggle.tsx
│       └── trash-actions.tsx
├── lib/
│   ├── sections.ts               # Définitions des 13 sections + mapping type→sections
│   ├── types.ts                  # Types partagés (Project, Todo, Decision, RoadmapItem, Risk, DevItem)
│   ├── scoring.ts                # Scoring ICE
│   ├── design/                   # Libs Design (OKLCH, tokens, fonts, validators, presets, inspirations)
│   ├── design-completeness.ts    # Agrégateur % par chap Design
│   ├── technique/                # Libs Technique (completeness, gating, services-catalog, cost-estimator, stack-presets, tooling-presets, workflow-automation)
│   └── supabase/
│       ├── client.ts / server.ts
│       ├── schema.sql
│       └── migrations/           # 21 migrations incrémentales idempotentes
└── middleware.ts                 # Refresh session Supabase
```

## Principes

- **Cockpit vs onglet dédié** : info consultée en un coup d'œil → cockpit. Édition longue / vue plein écran → onglet dédié.
- **Source unique** : les todos servent à la fois de liste d'actions et de source pour la "prochaine action critique" du cockpit. Pas de double saisie.
- **Updates optimistes avec rollback** : toutes les mutations mettent à jour le state immédiatement et rollback si Supabase échoue.
- **Filtrage corbeille en cascade** : un projet soft-deleted disparaît de partout (todos, blocages, risques) sur l'accueil.
- **Pas de sur-ingénierie** : pas d'abstractions prématurées, pas de libs qui font gagner 10 lignes pour 100 KB de bundle.
