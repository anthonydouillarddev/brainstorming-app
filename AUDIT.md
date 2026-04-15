# Audit — 2026-04-15

Audit complet post-refonte todolist (modal → expand), migrations 009/010/011, filtre tags, badges deadline/urgence.

## 1. Résumé de session

**Commits pushés lors de cette phase d'audit :**
```
0f11394 fix(ui): state tab simple, tags live home, theme-color dark, fallbacks
a463502 fix(risks): line-through uniquement sur le titre + mitigation
69f639b fix(auth): typer correctement les OTP via EmailOtpType
e877f46 fix(project): trigger DB pour updated_at, slug export sans accents, exclusion blocages prochaine action
82a029d fix(state): race conditions + rollback + kanban respecte le filtre
f320866 fix(security): defense en profondeur user_id + slice previews home
```

**Total session (depuis stabilisation précédente) :** 21 commits pushés — migrations DB 009/010/011, refonte todolist modal→expand, filtre tags avec compteurs, badges deadline projet + urgence todo, modules brainstorm fermés par défaut, auto-expand form création.

**Fichiers modifiés dans la phase d'audit :** 11
**Fichiers créés durant toute la session :** 3 (`src/lib/tags.ts`, `src/lib/deadline.ts`, `src/app/components/tag-filter.tsx`)

---

## 2. Bugs corrigés

| # | Bug | Sévérité | Fichier:ligne | Fix |
|---|-----|----------|---------------|-----|
| 1 | Query projet sans `user_id` (défense en profondeur RLS) | CRITICAL | `project/[id]/page.tsx:21-28` | Ajout `.eq("user_id", user.id)` |
| 2 | `topRisks` / `blockingTodos` transportés en entier dans le payload RSC | CRITICAL | `page.tsx:172-186` | `.slice(0, 5)` côté serveur avant de passer en props |
| 3 | Race `addTodo` : closure stale sur double Enter rapide | HIGH | `todolist.tsx:193-227` | `setTodos((prev) => [data, ...prev])` functional update |
| 4 | Kanban ignorait le filtre par tags | HIGH | `todolist.tsx:573` | Ajout `&& matchesFilter(t)` dans `columnTodos` |
| 5 | Rollback cassé : `previous` capturé après l'optimiste | HIGH | `dev-workspace.tsx:132-149` | `const previous = items` avant `commit(...)` |
| 6 | `onProjectUpdate({updated_at})` manuel écrasait le trigger DB | HIGH | `editor.tsx:95-106` | Ligne supprimée, le trigger `projects_updated_at` gère seul |
| 7 | Slug export markdown cassait les accents ("idée" → "id-e") | MEDIUM | `editor.tsx:217-225` | Normalisation NFD + strip diacritiques |
| 8 | "Prochaine action critique" incluait les tâches bloquées | MEDIUM | `cockpit.tsx:120-121` | Exclusion `status !== "blocked"` |
| 9 | Cast OTP faux (`"signup" \| "email"` alors qu'on accepte magiclink/recovery) | MEDIUM | `auth/callback/route.ts:20` | Type guard `isValidOtpType` via `EmailOtpType` de supabase-js |
| 10 | `line-through` sur toute la card risque résolu (fragile) | MEDIUM | `risks.tsx:250-254` | Line-through uniquement sur le titre + mitigation |
| 11 | Tags du filtre accueil pas live (dérivés de la prop initiale) | MEDIUM | `home-tabs.tsx` | State `todos` local + callback `onTodosChange` |
| 12 | `theme-color` dark manquant (barre mobile beige en mode sombre) | LOW | `layout.tsx:18` | Ajout 2e `<meta theme-color media="(prefers-color-scheme: dark)">` |
| 13 | Fallbacks `PROJECT_TYPES[1]` ("saas") arbitraires | LOW | `home-tabs.tsx`, `page.tsx`, `dashboard.tsx` | Remplacés par `PROJECT_TYPES[0]` ("outil") plus neutre |
| 14 | Non-null assertion `!` sur `DEV_KINDS.find(...)` | LOW | `dev-workspace.tsx:93` | `?? DEV_KINDS[0]` |
| 15 | `useSyncExternalStore` avec snapshot non-cachée (warning React) | LOW | `home-tabs.tsx` | Remplacé par `useState` + `useEffect` d'hydration |

---

## 3. Issues non corrigées (refactors futurs)

| Sévérité | Issue | Raison du report |
|----------|-------|------------------|
| MEDIUM | `updateTodo` non debouncée : chaque `onChange` d'un select déclenche 1 `UPDATE` Supabase | Fonctionnel, juste sub-optimal. Un sélect = 1 action voulue, pas de rafale en pratique. Debouncer propre demande une refonte du pattern parent. |
| MEDIUM | `updateProject` dashboard : rollback full-line (non clé par clé) | Rollback imparfait sur concurrent updates, mais seuls updates en vol sont user-driven séquentiels. Risque concret faible. Refactor = pattern générique (outsized pour le gain). |
| MEDIUM | `persistPositions` (dev-workspace) : N requêtes parallèles sans gestion d'erreur agrégée | Si 1 update sur N échoue, divergence silencieuse. Fix propre = `upsert` batch ou `Promise.all` avec rollback global. |
| LOW | `theme-toggle` cause un layout shift (`if (!mounted) return null`) | Solution propre = lire le cookie côté serveur pour SSR. Gain marginal pour outil perso. |
| LOW | `toggleDone` perd le statut précédent (in_progress → done → todo) | Acceptable : repartir de "todo" est prévisible. "Fix propre" = colonne `previous_status`, overkill. |
| LOW | `login/page.tsx` compare `error.message === "Invalid login credentials"` (string anglais) | Fragile si Supabase change le wording. À basculer sur `error.status` / `error.code`. |

---

## 4. Audit visuel

### Scores par catégorie

| Catégorie | Score /10 | Justification |
|-----------|-----------|---------------|
| **Couleurs** | 8.5 | Palette beige/moka (clair) + navy/caramel (sombre) cohérente et distinctive. Contrastes AA sur le texte principal. Mode sombre particulièrement réussi. Petit bémol : fond beige jaunâtre sous certains écrans. |
| **Design** | 8.0 | Hiérarchie claire, cards `rounded-2xl` cohérentes, typographie nette. Bonne utilisation des chips/badges (priorité, deadline, type, status). Espacement homogène. Cockpit dense mais bien segmenté. |
| **UX** | 8.5 | Parcours limpide (accueil → projet → onglets). Empty states soignés. Auto-expand form création = vrai gain. Filtre tags compact/non intrusif. Badge deadline dans le header = awareness immédiate. |
| **Ergonomie** | 7.0 | Zones cliquables correctes desktop. Mobile : checkboxes 24×24px < 44px recommandé (sous-optimal tactile). Nav claire. Breakpoints `sm:`/`md:` bien placés. |
| **Responsive** | 7.5 | Todolist OK à 390px (break-words propre, badges cachés au bon moment). Toggle Projets/Dev adapté. Cockpit s'empile en colonne mobile. `15-cockpit-mobile` non capturé (échec du clic script, pas un bug UI). |

### Détails par screenshot

**01-login** — Épuré, bon contraste, CTA "Se connecter" visible. ✅ RAS.

**02-home (clair)** — 10 tâches, toggle Projets/Dev, filtre tags, 8 projets. Le projet "Brainstorm" affiche bien son badge "Dépassée de 2j" rouge. ✅ **Petit point** : bordure gauche priorité (4px) peu visible en mode clair.

**03-home-dev** — 5 catégories (Idées/Liens/Docs/Infos/Prefs) avec form compact. ✅

**04-cockpit (clair)** — Tous les blocs présents et lisibles. "Prochaine action critique" : fond gradient très pâle (`from-accent/20 to-accent/10`) — **à renforcer** le contraste du texte italique muted quand vide.

**05-brainstorm** — Modules fermés par défaut ✅, badge "67% rempli" bien visible. Modules "✓ COMPLET" en vert clairs. Module picker `⚙️ Modules ▸` qui invite à la personnalisation. **Excellent**.

**06-tasks** — 2 blocs "Tâches du projet" + "Idées de fonctions". Filtre tags en haut. Row tâches avec bordure priorité (rouge P1, orange P2, bleu P3, gris P4). ✅

**07-decisions** — Empty state parfait avec CTA "+ Ajouter une décision". ✅

**08-technique** — Form dense avec chips de suggestions (Next.js, Remix, Astro...). ✅

**09-resources** — Layout propre, placeholders explicites. ✅

**10-new-project** — Form création avec 5 types radio-like. "SaaS" est pré-sélectionné — **à vérifier** : force-t-on le choix conscient ou c'est voulu ? Reco : aucune pré-sélection.

**11-trash** — Empty state "Corbeille vide". ✅

**12-home-dark** — Tous les éléments restent lisibles en mode sombre. Badges (PITCH, Dépassée, Tests) bien contrastés. Fond navy `#0c0c14`. ✅ **Excellent**.

**13-cockpit-dark** — Cockpit dark très réussi. Badge "EN COURS" accent caramel sur fond navy éclatant. Roadmap Q1-Q4 bien visible. ✅

**14-home-mobile** — Stack vertical correct, todolist dense mais lisible. **Point** : le badge deadline "Dépassée de 2j" sur la card projet n'apparaît pas sur ce screenshot alors qu'il devrait (projet avec deadline dépassée). À investiguer — probablement un problème de wrap dans la `flex flex-wrap` du header card.

**15-cockpit-mobile** — Non capturé (script a échoué sur le clic du lien projet en viewport mobile). Non-bloquant.

---

## 5. Suggestions priorisées

### Quick wins (1-2h chacun)

1. **Checkboxes rondes todolist 32×32 sur mobile** : `w-8 h-8 sm:w-6 sm:h-6` pour se rapprocher des 44px tactile recommandés.
2. **Renforcer contraste "Prochaine action critique"** quand vide : passer `from-accent/20` → `/30` et texte `text-muted` foncé.
3. **Investiguer badge deadline mobile sur cards projet** (screenshot 14) : forcer `flex-wrap gap-1.5` pour que le badge apparaisse sous le titre si overflow.
4. **Pas de pré-sélection type projet dans `/new`** : laisser aucun type coché au départ, forcer le choix conscient.
5. **Bordure priorité todolist plus visible clair** : `border-l-[5px]` ou fond léger `bg-red-500/5` sur toute la row P1.

### Améliorations futures (refactors moyens, 2-6h)

6. **Debounce `updateTodo`** pour éviter les rafales (utile si un jour slider/range ajouté).
7. **`updateProject` clé par clé** pour un rollback parfait en concurrent updates.
8. **`persistPositions` via `upsert` batch** (dev-workspace + roadmap).
9. **Filtre par statut** (todo/in_progress/blocked/done) complémentaire au filtre tags.
10. **Tri colonnes todolist** (priorité / deadline / créé).

### Fonctions à valeur ajoutée

- **Badge deadline proche** sur la liste projets main (< 3j clignotant)
- **Stats hebdo/mensuelles** : tâches complétées, trend, graph SVG pur
- **Export PDF cockpit** : screenshot HTML → PDF serveur
- **Notifs web** (opt-in) pour deadlines imminentes
- **Raccourcis clavier** : `n` nouvelle tâche, `/` rechercher, `b` brainstorm
- **Mode focus** : cacher toutes les cards sauf "Prochaine action critique"
- **Bulk tags** : sélection multi-todos pour ajouter/retirer tags en masse

### Fonctions à surveiller

- **Rollback `updateProject`** : tester 2 onglets du même projet en édition simultanée
- **Deadline timezone Perth ↔ France** : dates date-only décalent d'un jour
- **Growth queries `.select("*")`** sans pagination sur `/` : OK pour usage perso, à paginer si > 100 items
- **Migrations DB** : appliquer 009/010/011 manuellement Supabase Dashboard avant utilisation prod

---

## 6. Estimation de complétion

| Aspect | % | Détail |
|--------|---|--------|
| **Fonctionnalités core** | 88% | Cockpit, brainstorm 13 sections adaptatives, todolist kanban, ICE scoring, décisions ADR, roadmap Q1-Q4, risques édition+résolution, tags, dev workspace, soft delete. Manque : recherche globale, export PDF, stats. |
| **UI/Design** | 85% | Palette cohérente, dark excellent, badges informatifs, typographie nette. À peaufiner : tactile mobile, contrastes "Prochaine action", deadline badge mobile. |
| **Qualité code** | 83% | TS strict OK, RLS + défense en profondeur `user_id`, updates optimistes avec rollback (avec quelques imperfections assumées), debounced saves, peu de `any`/`!`. À améliorer : debounce updateTodo, rollback clé-par-clé. |
| **Robustesse** | 78% | Migrations idempotentes, trigger `updated_at` DB, filtres cascade corbeille, soft-delete. Manque : tests auto (0), error boundaries globales, gestion offline. |
| **UX** | 86% | Parcours clair, empty states soignés, auto-expand form, filtre tags, badge urgence dynamique, deep linking `?tab=`, modules brainstorm fermés. Manque : raccourcis clavier, toasts (alert utilisés). |

**Score global estimé : 84%**

App déjà très utilisable et cohérente pour usage perso. Le restant = polish (tactile, contrastes, features +) et robustesse (tests), pas de bugs bloquants.

**Prochaines étapes recommandées (par priorité) :**

1. **Exécuter migrations 009 + 010 + 011** sur Supabase si pas encore fait (prérequis fonctionnel)
2. **Quick wins visuels** (checkbox 32px mobile, contraste prochaine action, bordure priorité, badge deadline mobile)
3. **Filtre par statut** (complément naturel du filtre tags, 1-2h)
4. **Tests manuels critiques** : concurrent updates 2 onglets, timezone Perth↔France, drag&drop ressources
5. **Feature prioritaire** : recherche globale OU stats hebdo (décider laquelle apporte le plus au quotidien)
