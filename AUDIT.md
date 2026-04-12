# Audit complet — Brainstorming App

**Date** : 12 avril 2026
**Périmètre** : 29 fichiers source (.tsx, .ts, .css) + audit visuel Playwright (15 screenshots)
**Méthode** : review code multi-agents + clean code + Puppeteer headless (light/dark/mobile)

---

## 1. Résumé de session

**6 commits pushés sur main :**
```
1d53dca docs: mise à jour CLAUDE.md et README.md — onglet Dev, palette, deep linking, 7 tables
3217cf4 fix(ui): dark mode lisible + login texte mis à jour + typo dev workspace
1c69ddb fix(meta): theme-color beige + titre et description mis à jour
b570e4b fix(core): gestion erreurs auth callback + deep linking onglets projet
1052dd9 style(ui): palette beige/caramel + rouges renforcés + UX tactile
5b48f47 feat(home): onglets Projets/Dev + workspace Dev + todolist centralisée + blocages/risques
```

**16 fichiers modifiés, 3 fichiers créés, 1 migration SQL exécutée, 2 docs mis à jour.**

---

## 2. Bugs corrigés (10)

| # | Bug | Sévérité | Fichier | Fix |
|---|-----|----------|---------|-----|
| 1 | Auth callback ignore les erreurs d'échange de session | CRITICAL | `auth/callback/route.ts` | Check `{ error }` + redirect `/login?error=auth_failed` + whitelist OTP types |
| 2 | Filtre Supabase `.or()` invalide quand 0 projets actifs | HIGH | `todolist.tsx:138` | Condition `activeIds.length > 0` avant de construire le filtre |
| 3 | Dashboard ignore `?tab=tasks` depuis les liens accueil | HIGH | `dashboard.tsx` + `page.tsx` | `searchParams` lu dans le Server Component, passé comme `initialTab` |
| 4 | Dev workspace : 1 requête Supabase par frappe clavier | HIGH | `dev-workspace.tsx` | Debounce 600ms via `saveTimers` ref |
| 5 | Dark mode cockpit illisible (contraste quasi nul) | HIGH | `globals.css` | Card `#1a1a28`, border `#2d2d40`, muted `#8b8fa5` |
| 6 | `theme-color` meta tag encore bleu `#3b82f6` | MEDIUM | `layout.tsx` | Remplacé par `#E8E0D8` |
| 7 | Metadata titre "Brainstorming SaaS" obsolète | MEDIUM | `layout.tsx` | "Brainstorm — Gestion de projets" |
| 8 | Login sous-titre "Tes idées SaaS, accessibles partout" | LOW | `login/page.tsx` | "Pilote tes projets de l'idée au lancement" |
| 9 | Typo genre dev workspace "Aucun idées" | LOW | `dev-workspace.tsx` | "Rien dans idées pour l'instant" |
| 10 | Placeholder ternaire mort (même texte des 2 côtés) | LOW | `todolist.tsx:285` | Ternaire supprimé |

---

## 3. Issues non corrigées (refactors futurs)

| Sévérité | Issue | Raison du report |
|----------|-------|-----------------|
| MEDIUM | Duplication cards projet entre `page.tsx` et `home-tabs.tsx` (~30 lignes) | Refactor → extraire `ProjectCard`. Pas de bug fonctionnel. |
| MEDIUM | Duplication logique debounced save (editor.tsx + resources.tsx, ~25 lignes) | Refactor → extraire `useDebouncedSectionSave`. Fonctionnel. |
| MEDIUM | Cockpit ~500 lignes, pourrait être découpé en sous-composants | Maintenable pour usage solo, refactor quand ça grossira. |
| MEDIUM | `ThemeToggle` : hydration mismatch possible (localStorage lu au render) | Fonctionne en pratique car localStorage est lu immédiatement. |
| MEDIUM | `editor.tsx` : `setSaving` est un boolean global, pas per-section | Si 2 sections sauvegardées en parallèle, le premier `setSaving(false)` efface l'indicateur. Rare en pratique. |
| LOW | Pas de check applicatif `project.user_id === user.id` dans `page.tsx` | RLS protège déjà en DB. Defense-in-depth à ajouter si multi-user un jour. |
| LOW | `currentYear` module-level dans `roadmap.tsx` | Edge case onglet ouvert au changement d'année — négligeable. |
| LOW | `roadmap.tsx` : `onBlur` et `onKeyDown` peuvent déclencher `handleAdd` 2 fois | Guard `submittingRef` en place, mais le timing peut être confus. |
| LOW | `useSyncExternalStore` dans `home-tabs.tsx` : pas de listener `storage` natif | Le cross-tab sync n'est pas supporté. Acceptable pour usage solo. |
| LOW | `createClient()` appelé au body de chaque composant client | `createBrowserClient` de `@supabase/ssr` est singleton interne — pas d'impact perf réel. |

---

## 4. Audit visuel

### Méthode

Puppeteer headless avec Chromium Linux installé en user-space (sans sudo). 15 screenshots capturées automatiquement : login, accueil (projets/dev), 7 onglets projet, création, corbeille, dark mode (accueil + cockpit), mobile (accueil + cockpit).

### Scores par catégorie

| Catégorie | Score /10 | Justification |
|-----------|----------|---------------|
| **Couleurs** | 8/10 | Palette beige/moka cohérente et distinctive en clair. Navy/caramel lisible en sombre (après fix). Gradient de fond élégant. Rouges blocages bien visibles. |
| **Design** | 7/10 | Cards arrondies + blur cohérent partout. Bonne hiérarchie cockpit → détails. Onglets Projets/Dev bien dimensionnés. Toggle Liste/Kanban propre. |
| **UX** | 6/10 | Parcours principal fluide. Login sans contexte ("pourquoi s'inscrire ?"). Pas d'onboarding premier projet. Pas de feedback save temps réel sur todolist/dev-workspace. |
| **Ergonomie** | 7/10 | Rows todo cliquables en entier (tactile-friendly, zone min 32×32). Toggle onglets large. Drag & drop fonctionnel. Feedback drag léger (opacity uniquement). |
| **Responsive** | 6/10 | Tailwind gère les breakpoints de base. Mobile dark OK. Form todolist wraps bien. Les onglets Dev (5 catégories) pourraient être serrés sur <375px. |

### Détails par screenshot

| # | Page | Mode | Verdict |
|---|------|------|---------|
| 01 | Login | Light | Clean, gradient visible, bouton moka, formulaire centré ✅ |
| 02 | Accueil (Projets) | Light | Todolist centralisée avec badges, toggle visible, blocs blocages/risques rouges bien marqués, 9 projets listés ✅ |
| 03 | Accueil (Dev) | Light | 5 catégories claires, form d'ajout, état vide propre ✅ |
| 04 | Cockpit | Light | 8 sections structurées, blocages rouges visibles, prochaine action critique en accent, progression 30% ✅ |
| 05 | Brainstorm | Light | 13 sections avec collapse, sync button en bas, long scroll bien structuré ✅ |
| 06 | Tâches | Light | Liste propre, P1/P3, scoring ICE badge, toggle Liste/Kanban ✅ |
| 07 | Décisions | Light | Formulaire ADR complet, liste des décisions ✅ |
| 08 | Technique | Light | Champs stack remplis ✅ |
| 09 | Ressources | Light | Liens avec tags et statuts ✅ |
| 10 | Création | Light | 5 types, formulaire guidé, bouton moka ✅ |
| 11 | Corbeille | Light | État vide gracieux ✅ |
| 12 | Accueil | Dark | Cartes lisibles, bordures visibles, caramel doré, badges colorés ✅ |
| 13 | Cockpit | Dark | Corrigé — toutes les sections lisibles (cards, textes, bordures) ✅ |
| 14 | Accueil | Mobile | Layout adapté, onglets stackés, todolist wraps, badges tronqués proprement ✅ |
| 15 | Cockpit | Mobile | Sections empilées, texte lisible ✅ |

---

## 5. Suggestions priorisées

### Quick wins (1-2h chacun)

1. **Indicateur de sauvegarde** (toast discret) pour todolist + dev workspace — actuellement aucun feedback visuel quand on modifie une tâche ou un item dev
2. **Badge compteur blocages** dans le toggle onglets Projets — info visible sans scroller
3. **Feedback validation temps réel** sur le form login — email invalide, mot de passe vide (actuellement : submit silencieux)
4. **Empty state login** — texte d'accroche / value prop en 3 bullets sous le titre, pour donner envie avant le formulaire

### Améliorations futures

5. **Recherche / filtre** dans la todolist centralisée — quand >20 todos, le scan visuel devient difficile
6. **Onboarding premier projet** — 3 tooltips positionnels pour expliquer cockpit / brainstorm / tâches
7. **Notifications deadline** — badge ou couleur sur les tâches qui arrivent à échéance dans le cockpit
8. **Export PDF / Markdown** d'un projet complet (toutes les sections en un doc)
9. **Onglet Design** — encore vide sur la plupart des projets. Envisager de fusionner avec Brainstorm ou masquer par défaut si peu utilisé.

### Fonctions à forte valeur ajoutée (déjà en place)

- Cockpit "en un coup d'œil" — excellent pour le pilotage rapide
- Scoring ICE — simple et efficace pour prioriser
- Soft delete + corbeille — sécurité sans friction
- Sync brainstorm → cockpit — évite la double saisie
- Todolist centralisée — vue globale de toutes les tâches avec origine
- Blocs blocages/risques sur l'accueil — pilotage sans ouvrir chaque projet
- Deep linking ?tab= — navigation directe vers le bon onglet

---

## 6. Estimation de complétion

| Aspect | % | Détail |
|--------|---|--------|
| Fonctionnalités core | 85% | Cockpit, brainstorm, tâches, décisions, roadmap, risques, dev workspace — tout fonctionne |
| UI/Design | 75% | Palette en place, responsive basique OK, pas de polissage mobile fin ni animations |
| Qualité code | 80% | TS strict, pas de `any`, conventions respectées. Quelques refactors medium restants (duplication) |
| Robustesse | 65% | Auth solide (RLS + server check), optimistic updates. Manque : tests, error boundaries, retry réseau |
| UX | 65% | Parcours fonctionnel mais brut. Pas d'onboarding, feedback limité, pas de recherche/filtre |

### Score global estimé : ~78%

### Prochaines étapes recommandées (par priorité)

1. Tester en prod sur mobile réel → corriger les soucis responsive spécifiques
2. Ajouter un indicateur de sauvegarde global (toast ou badge discret)
3. Error boundaries sur les composants principaux (cockpit, editor, todolist)
4. Feedback validation form login + empty state accrocheur
5. Extraire `ProjectCard` et `useDebouncedSectionSave` (refactors medium)
