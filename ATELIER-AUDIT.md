# 📋 Atelier — Audit de nuit (P1 → P3)

> Rapport rédigé à ton réveil. Tout le travail est sur la branche `feat/atelier` (4 commits + 1 fix). Non poussée. 8781 insertions · 637 suppressions · 38 fichiers.

---

## 📦 Ce qui est livré

| Phase | Statut | Livrable |
|---|---|---|
| P1 | ✅ | Squelette fonctionnel (notes markdown + schémas drag&drop + 3 types de liens) |
| P2 | ✅ | 6 templates schémas + tags notes + deep links `?id=` avec flash + badge clickable |
| P3 | ✅ sauf virtualisation (déc : non requis en usage perso) | Éditeur BlockNote riche, auto-layout Dagre, export PNG/SVG, miniatures SVG |

**Branche** : `feat/atelier` (depuis `main`)

```
ab64920 feat(taxonomie): système modulaire dynamique projets + onglets
b6f4a02 feat(atelier): P1 — notes markdown + schémas drag&drop + liaisons
ad69592 feat(atelier): P2 — templates, tags, deep links, badges liens
f09eec8 feat(atelier): P3 — éditeur BlockNote, auto-layout, export, miniatures
7674794 fix(atelier): collisions ids canvas + flush unmount save
```

**Build** : `npm run build` ✅ · `npm run lint` ✅ (0 erreur Atelier, seul warning pré-existant sur layout.tsx).

---

## 🗄️ Migrations SQL à jouer dans Supabase Dashboard

Dans cet ordre :

1. **`023_atelier.sql`** — tables `notes` + `schemas`, RLS, seed `tab_modules.atelier` (universel, **mandatory=true**, position 4), décalage `resources` 4→5, auto-provision sur projets existants.
2. **`024_atelier_notes_tags.sql`** — colonne `notes.tags text[]` + index GIN.
3. **`025_atelier_notes_content_blocks.sql`** — colonne `notes.content_blocks jsonb` (JSON BlockNote, nullable).

Toutes idempotentes. Aucun bucket Storage nécessaire.

---

## 🏛️ Architecture livrée

```
src/app/project/[id]/
├── _shared/
│   └── useDeepLinkScroll.ts           # Scroll + flash pour ?tab=X&id=Y
├── atelier/
│   ├── index.tsx                       # AtelierPanel : toggle notes/schémas + fetch client
│   ├── types.ts                        # Note, SchemaRow, SchemaNode, SchemaEdge, LinkTarget…
│   ├── _shared/
│   │   └── useDebouncedRowSave.ts      # Save debounced 2s + flushOnUnmount
│   ├── notes/
│   │   ├── NotesView.tsx               # Layout 320px + agrégation tags + CRUD
│   │   ├── NotesSidebar.tsx            # Recherche + liste + bloc tags
│   │   ├── NoteEditor.tsx              # 3 modes : Riche (BlockNote) / Markdown / Aperçu
│   │   ├── BlockNoteEditor.tsx         # Chargé dynamic ssr:false, sync thème
│   │   ├── blocknote-overrides.css     # CSS vars Mindeck
│   │   └── LinkPicker.tsx              # Portal #modal-root, 3 onglets
│   └── schemas/
│       ├── SchemasView.tsx             # Toggle gallery ⇄ canvas
│       ├── Gallery.tsx                 # Grid responsive + miniature SVG
│       ├── Canvas.tsx                  # ReactFlow + palette + inspector + auto-layout + export
│       ├── NodeTypes.tsx               # 4 types + NodeNavigateProvider (Context)
│       └── TemplateModal.tsx           # Grid 2 col portal #modal-root
├── decisions.tsx                       # + data-decision-id + scroll focus
└── tasks-tab.tsx                       # + useDeepLinkScroll

src/lib/
├── atelier/
│   ├── templates.ts                    # 6 templates (pieuvre, arbre, mindmap, flow, archi, blank)
│   ├── layout.ts                       # Dagre auto-layout LR
│   └── thumbnail.ts                    # SVG compact viewBox 100×75
└── supabase/migrations/
    ├── 023_atelier.sql
    ├── 024_atelier_notes_tags.sql
    └── 025_atelier_notes_content_blocks.sql
```

---

## 🔒 Audit sécurité RLS

✅ **Propre**. Pattern simple `auth.uid() = user_id` appliqué aux 2 tables (copié de `016_design_ui_inspirations`).

```sql
alter table notes    enable row level security;
alter table schemas  enable row level security;
create policy "Users manage own notes"    on notes    for all using (auth.uid() = user_id);
create policy "Users manage own schemas"  on schemas  for all using (auth.uid() = user_id);
```

Les FK vers `todos`/`decisions`/`dev_items` sont en `on delete set null` — si tu supprimes une tâche liée, la note/nœud la perd mais reste intacte.

**FK `project_id`** : `on delete cascade` — si tu supprimes un projet (hard delete), toutes ses notes et schémas partent avec. Cohérent avec le reste du repo.

**⚠️ Point non bloquant** : le LinkPicker montre tous tes `dev_items` (ils sont user-scoped, pas project-scoped). Une note du projet A peut pointer vers un dev_item "idée skill Claude Code" — c'est intentionnel selon la discussion.

---

## 🐛 Bugs trouvés et fixés pendant l'audit

### 1. Collision d'IDs canvas (fixé · commit `7674794`)

**Symptôme** : on ouvre un schéma, ajoute 2 noeuds (→ ids `-1`, `-2`), ferme, rouvre, rajoute un noeud → celui-ci aurait eu l'id `-1` écrasant le premier.

**Fix** : `idCounterRef` initialisé au max des suffixes numériques existants.

```ts
const idCounterRef = useRef(
  schema.data.nodes.reduce((acc, n) => {
    const match = n.id.match(/-(\d+)$/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0)
);
```

### 2. Perte de données en navigation rapide (fixé · commit `7674794`)

**Symptôme** : l'user tape dans une note/canvas, les changements sont debouncés 2s. S'il ferme l'onglet (navigation, close tab) avant le flush, les 2 dernières secondes sont perdues.

**Fix** : `flushOnUnmount` activé par défaut dans `useDebouncedRowSave`. Au unmount, les pending changes partent directement à Supabase (sans setState, le composant est détruit).

```ts
return () => {
  if (flushOnUnmount && pendingId && Object.keys(pending).length > 0) {
    void supabase.from(table).update(pending).eq("id", pendingId);
  }
};
```

### 3. Lint React 19 strict (fixé dans P1)

4 erreurs initiales :
- `setState in effect` dans `AtelierPanel`, `LinkPicker`, `NoteEditor` → remplacées par lazy `useState(() => ...)` ou suppression (key remount pattern).
- `Date.now()` impure dans `addNode` → remplacée par `useRef` counter.

---

## ⚠️ Limites connues / à surveiller

### 1. Hydration sync localStorage (Atelier toggle)

Le toggle Notes/Schémas utilise `useState(() => readInitialView())`. Le premier paint server-side retourne toujours `"notes"` (SSR `typeof window === undefined`). Si l'user était sur Schémas puis reload, il verra Notes pendant ~80ms avant que React hydrate. Pattern connu du repo (même approche que ThemeToggle).

**Impact** : cosmétique, invisible en prod.

### 2. `useDebouncedRowSave` : `onError` / `onSaved` non memoïzés par les consumers

Ils changent à chaque render → `save` n'est pas stable → les `useEffect` qui en dépendent peuvent se re-déclencher inutilement. En pratique, pas d'impact (le `pendingRef` agrège, le timer fait son job).

**Amélioration P4** : memoïser les callbacks dans Canvas et NoteEditor via useCallback.

### 3. Virtualisation de la galerie (non livrée)

Décision : usage perso, < 50 schémas attendus. À ajouter si tu passes la barre (perf visible à partir de ~150 cards). `@tanstack/react-virtual` suffira, pas besoin de refactor lourd.

### 4. BlockNote i18n en anglais

Les slash commands et menus BlockNote sont en anglais par défaut. Tu peux passer un `dictionary` (locale FR) plus tard si tu veux — pas critique vu que c'est pour ton usage perso.

### 5. BlockNote markdown lossy export

`blocksToMarkdownLossy()` perd quelques features BlockNote (tables complexes, images uploaded). Le `content` markdown en DB reste une approximation pour fallback/recherche. Les blocks source sont dans `content_blocks`.

### 6. React Flow + Dagre = edges restent parfois au même endroit

Après auto-layout, les edges ne bougent pas d'elles-mêmes (elles sont calculées depuis source/target). OK en pratique : seules les positions de nodes sont update et React Flow redessine les edges automatiquement.

### 7. Export PNG/SVG : background

J'utilise `var(--card)` du thème actif au moment de l'export. Si tu exportes en dark puis ouvres le fichier sur fond clair, les nœuds seront difficiles à lire. Solution : forcer un fond adapté à la palette du schéma — non livré. En pratique on exporte ce qu'on voit, c'est OK.

---

## 🧪 À tester de ton côté (au réveil)

1. **Migrations** : exécuter 023, 024, 025 dans Supabase Dashboard dans l'ordre.
2. **Onglet Atelier** : sur chaque projet existant, un onglet 🧪 Atelier doit apparaître en position 4 (après Décisions).
3. **Note** :
   - Créer, pin, renommer, supprimer, ajouter des tags (Enter ou virgule), filtrer par tag.
   - Tester les 3 modes : Riche (BlockNote avec slash `/` commands), Markdown, Aperçu.
   - Lier à une tâche → pill visible, clic → navigate vers Tâches + scroll + flash.
4. **Schéma** :
   - + Nouveau schéma → modal templates 2×3 → picker pieuvre → canvas ouvre.
   - Drag&drop depuis palette, resizer nœuds, relier via pastilles ambrées.
   - Éditer dans inspector droite, lier à tâche → badge 🔗 cliquable sur le nœud.
   - `✨ Auto-layout` → réorganise horizontal.
   - Export `📥 PNG` / `📥 SVG` → télécharge.
   - Retour gallery → miniature SVG visible.
5. **Theme switch** : le canvas et BlockNote doivent suivre le theme (beige↔navy, moka↔caramel).
6. **Mobile** (< 768px) : palette + inspector du canvas disparaissent, le canvas ReactFlow garde son zoom/pan touch natif.
7. **Perte de données** : saisir dans une note → fermer l'onglet tab → rouvrir projet → la valeur doit être là (flushOnUnmount).

---

## 📊 Métriques P3

| Métrique | Valeur |
|---|---|
| Fichiers ajoutés | 18 |
| Fichiers modifiés | 20 |
| Lignes ajoutées | 8781 |
| Libs ajoutées | `@xyflow/react` v12.10 · `react-markdown` · `remark-gfm` · `@blocknote/{core,react,mantine}` v0.48 · `@dagrejs/dagre` · `html-to-image` |
| Poids bundle (chunk `project/[id]`) | à vérifier en `.next/analyze` · BlockNote + ReactFlow représentent ~350kb gzipped chargés en lazy (dynamic import) |
| Tests | Aucun (pas de test suite dans le repo) |

---

## 🚀 Suggestions pour après

Dans l'ordre d'impact :

1. **Mention @tâche dans BlockNote** (slash command custom) : link natif depuis la prose, plus fluide que le LinkPicker actuel.
2. **Commentaires sur nœuds canvas** (popover attaché) : déjà prévu par React Flow v12.
3. **Templates schémas persistés** : laisser l'user sauver son propre schéma comme template réutilisable (colonne `is_template boolean`).
4. **Recherche globale Atelier** : `/` raccourci cmd+K style sur notes+schemas cross-projets.
5. **Virtualisation galerie** si tu passes 50 schémas.
6. **Export bundle** : compresser notes+schemas d'un projet en `.json` pour import dans un autre (templates partagés entre tes projets).

---

## ✅ Next steps concrets

1. Tu joues les 3 migrations (023 → 024 → 025).
2. Tu testes comme listé ci-dessus.
3. Si tout est OK : `git checkout main && git merge --no-ff feat/atelier` puis `git push`.
4. Vercel rebuild automatiquement et l'Atelier est en prod.

Dors bien. 🌙

_— Claude, 2026-04-21 (nuit)_
