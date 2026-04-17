# Chapitre 3 — Architecture de l'information & navigation

> Livrable brut de l'Expert 3 (general-purpose).
> Couvre : entités/relations, sitemap, patterns de navigation, card sort/tree testing, labels (vocabulaire user vs dev), wayfinding, command palette.

## 1. Objectif du chapitre

Ce chapitre sert à répondre à trois questions toutes bêtes : **qu'est-ce qu'il y a dans ton app, comment c'est rangé, et comment on passe d'un endroit à un autre sans se perdre ?** C'est la carte du trésor de ton produit. Si cette carte est claire, l'utilisateur se sent chez lui. Si elle est floue, même le plus beau design ne sauvera rien.

## 2. Questions clés à poser à l'user

| # | Simple (enfant 12 ans) | Expert (designer/PM) |
|---|------------------------|----------------------|
| 1 | C'est quoi les "choses" qu'on peut créer ou voir dans ton app ? (ex : un projet, une tâche, un client) | Quelles sont tes entités métier principales et leurs relations (1-N, N-N) ? |
| 2 | Si tu devais faire un plan de ton app comme un plan de maison, il aurait combien de pièces ? | Quelle est la profondeur cible de ton sitemap (nombre de niveaux) ? |
| 3 | Quelle est la chose que tu veux faire LE PLUS SOUVENT ? | Quel est le primary job-to-be-done qui doit être accessible en ≤1 clic ? |
| 4 | L'app, c'est plutôt un ordi, un téléphone, ou les deux ? | Quelle est la répartition desktop/mobile/tablet de ton audience cible ? |
| 5 | Si l'utilisateur est perdu, comment il fait pour rentrer à la maison ? | Quelle est ta stratégie de wayfinding (breadcrumbs, logo-home, back button) ? |
| 6 | Tu veux une barre à gauche, en haut, ou en bas ? | Sidebar permanente, top tabs, bottom nav ou hybride responsive ? |
| 7 | Il y a des choses cachées qu'on atteint seulement via une autre chose ? | Quelles pages sont accessibles uniquement en drill-down (pas dans la nav globale) ? |
| 8 | Tu veux une barre de recherche magique où on tape n'importe quoi ? | Tu implémentes un command palette (Cmd+K) et/ou une search globale ? |
| 9 | Les mots que tu utilises, c'est les mots de l'utilisateur ou ton jargon à toi ? | Ton vocabulaire suit-il la règle "user's language over system language" (Nielsen #2) ? |
| 10 | Combien d'items max dans le menu principal ? | As-tu validé ton IA par un tree test ou un card sort (open/closed) ? |

## 3. UX du chapitre — 3 modes progressifs

### Mode Débutant — "Les pièces de ta maison"

On part du concret. L'utilisateur coche **les 5-7 choses qu'il veut pouvoir faire**, on en déduit automatiquement les écrans et la nav.

```
┌─────────────────────────────────────────────────┐
│  Quelles sont les 5 choses que tu veux          │
│  pouvoir faire dans ton app ?                   │
│                                                  │
│  [✓] Voir une liste de mes projets              │
│  [✓] Créer un nouveau projet                    │
│  [✓] Voir les détails d'un projet               │
│  [✓] Gérer mes paramètres                       │
│  [✓] Voir les stats                             │
│  [ ] + Ajouter une autre                        │
│                                                  │
│  → Mindeck te propose :                         │
│  ┌──────────────────────────────────────────┐  │
│  │ Sidebar gauche (4 items)                 │  │
│  │ • Accueil  • Projets  • Stats  • Réglages│  │
│  │ + bouton "+" flottant pour créer          │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

Pas de vocabulaire "entité", "taxonomy", "hub-and-spoke". On parle de **pièces**, **portes**, **plan**.

### Mode Intermédiaire — "Le builder de sitemap"

On monte d'un cran : drag & drop des écrans, nav pattern picker avec aperçu live.

```
┌─ Sitemap builder ────────────────────────────────────┐
│                                                       │
│  [Accueil]──┬─[Projets]──┬─[Projet détail]           │
│             │            ├─[Nouveau projet]           │
│             │            └─[Corbeille]                │
│             ├─[Stats]                                 │
│             └─[Réglages]─┬─[Profil]                   │
│                          ├─[Apparence]                │
│                          └─[Compte]                   │
│                                                       │
│  [+ page]  [+ sous-page]  [⚠ profondeur: 3 niveaux]  │
└──────────────────────────────────────────────────────┘

┌─ Nav pattern picker (live preview) ──────────────────┐
│  ( ) Sidebar fixe       ( ) Top tabs                  │
│  (●) Sidebar collapsible ( ) Bottom nav (mobile)     │
│  ( ) Hybrid responsive  ( ) Command palette only     │
│                                                       │
│  Aperçu →  [mini mockup rendu en direct]             │
└──────────────────────────────────────────────────────┘
```

### Mode Expert — "Information Model + Tree Test"

L'utilisateur accède à :
- **Entity-relation mini-editor** : il définit ses entités (Project, Task, User, Resource…), leurs attributs et relations (Project *hasMany* Task, User *owns* Project).
- **Card sort simulator** : il pose des labels sur des cartes virtuelles, les groupe en catégories ouvertes ou fermées, l'outil calcule un score de cohérence.
- **Tree test simulator** : on lui demande "où irais-tu pour faire X ?" sur son propre sitemap. L'outil mesure le taux de réussite direct (NN/g benchmark : viser ≥80%).
- **URL structure validator** : vérifie que les URLs sont hiérarchiques, lisibles, RESTful (`/projects/:id/tasks/:id` et pas `/page.php?p=42`).

## 4. Widgets / générateurs à implémenter

1. **Screen Picker "5 choses"** — checklist débutant qui mappe automatiquement vers des templates d'écrans.
2. **Sitemap Builder drag & drop** — arbre hiérarchique, max 3 niveaux visibles, alerte si dépassé.
3. **Nav Pattern Selector with Live Preview** — 6 patterns avec mockup instantané adapté au type de projet (SaaS desktop → sidebar ; appli mobile → bottom nav ; outil perso → top tabs).
4. **Entity-Relation Mini-Editor** — style Airtable simplifié, produit un schéma JSON.
5. **Label Suggester (jargon → user language)** — dictionnaire : "Dashboard" → "Accueil", "Entities" → "Choses", "Settings" → "Réglages" (choisir UN des deux, pas les deux).
6. **URL Map Generator** — génère la map d'URLs à partir du sitemap, avec validation (kebab-case, pas de verbes, pas d'IDs exposés sauf si REST).
7. **Breadcrumb Auto-generator** — à partir du sitemap, produit les breadcrumbs pour chaque écran profond.
8. **Command Palette Planner** — liste des actions globales atteignables via Cmd+K (pattern Linear/Notion/Raycast).
9. **Tree Test Light** — 5 tâches, taux de succès, heatmap des hésitations.
10. **Device Context Switcher** — bascule desktop/tablet/mobile pour voir si la nav tient la route partout.

## 5. Règles de validation automatique

- **Miller's Law adapté** : plus de **7 items** dans la nav principale → alerte jaune ; plus de 10 → alerte rouge. NN/g note que Miller (7±2) s'applique à la mémoire de travail, pas strictement à la nav, mais au-delà de 7 items visibles d'un coup, la scanabilité chute.
- **Profondeur** : plus de **3 niveaux** de hiérarchie → alerte. Au-delà, envisager une nav plate + recherche.
- **Cohérence vocabulaire** : si le sitemap contient à la fois "Settings" et "Préférences", ou "Projets" et "Dossiers" pour la même entité → erreur.
- **Labels génériques interdits** : "Divers", "Autres", "Misc", "More" → warning (catégorie fourre-tout = signal d'IA mal pensée, Abby Covert).
- **Orphan pages** : tout écran doit être atteignable depuis au moins 1 point d'entrée de la nav ou d'un drill-down. Sinon alerte.
- **Duplicate labels** : deux items de nav avec le même label mais des destinations différentes → erreur bloquante.
- **Bottom nav mobile** : max **5 items** (iOS HIG), sinon warning.
- **Sidebar desktop** : si < 4 items → suggérer top tabs ; si > 10 → suggérer sections avec séparateurs.
- **URL** : présence de majuscules, espaces, underscores, extensions (`.html`, `.php`) → erreur.
- **Primary action** : le bouton "créer" principal doit être accessible en ≤1 clic depuis l'accueil. Sinon warning UX.

## 6. Contenus pédagogiques

- **Mini-leçon "C'est quoi l'IA (pas l'intelligence artificielle)"** : 60 secondes, explique l'architecture de l'information comme le rangement d'une bibliothèque.
- **Tooltip sur "Hub-and-spoke"** : "Un accueil central, plusieurs pages filles. Comme une table ronde avec 5 chaises. Bien pour les apps simples (Instagram début)."
- **Exemple ✓** : Linear → sidebar fixe, 5 sections claires, Cmd+K pour tout le reste. Vocabulaire constant (Issues, Projects, Cycles).
- **Exemple ✓** : Notion → sidebar arborescente, recherche puissante, breadcrumbs partout.
- **Anti-exemple ✗** : menus hamburger sur desktop alors qu'il y a de la place — cache la nav, divise par 2 l'engagement (NN/g research sur hidden nav).
- **Anti-exemple ✗** : labels "Mes trucs", "Autres", "Plus" — l'utilisateur doit deviner.
- **Anti-exemple ✗** : breadcrumbs absents sur un sitemap à 4+ niveaux.
- **Mini-leçon "Vocabulaire utilisateur"** : toujours tester les labels avec 3-5 vrais users. Le mot que TOI tu utilises en interne ("entité", "record", "instance") n'est presque jamais le bon mot pour l'utilisateur.
- **Principe clé à retenir** : "Si un utilisateur doit cliquer pour savoir ce qu'il y a derrière, ton label a échoué." (Jakob Nielsen, Information Scent).

## 7. Outputs générés

- **sitemap.md** : arborescence markdown exportable.
- **information-model.json** : entités, attributs, relations (utilisable ensuite pour le schéma DB).
- **nav-spec.json** : pattern choisi, items, ordres, raccourcis clavier, états (default/active/hover).
- **url-map.csv** : toutes les routes de l'app, une ligne par écran.
- **labels-dictionary.json** : map `{internal_term: user_facing_term}` pour éviter l'incohérence plus tard dans le code.
- **command-palette.json** : liste des actions globales.
- **breadcrumbs-map.json** : chemin complet de chaque écran profond.

## 8. Modèle de données conceptuel (ce qu'on stocke dans Mindeck)

- `ia_entities` : `id, project_id, name, description, attributes (jsonb), created_at`
- `ia_relations` : `id, project_id, from_entity_id, to_entity_id, type (1-1|1-N|N-N), label`
- `ia_screens` : `id, project_id, parent_id (nullable), title, slug, level, position, is_primary_nav (bool)`
- `ia_nav` : `id, project_id, pattern (sidebar|top_tabs|bottom_nav|hybrid|command_only), items (jsonb ordonné), device_context`
- `ia_labels` : `id, project_id, internal_term, user_term, context`
- `ia_url_map` : `id, project_id, screen_id, path, is_dynamic (bool)`
- `ia_tree_tests` : `id, project_id, task, expected_path, success_rate, tested_at`
- `ia_validations` : `id, project_id, rule_key, status (ok|warning|error), message, detected_at`

## 9. Pièges classiques à éviter

1. **Copier la nav d'un gros produit par défaut** (Slack, Notion, Figma) alors que ton app n'a pas la même complexité. La sidebar de Notion est justifiée par des milliers de pages ; pour un outil à 5 écrans, c'est du bruit.
2. **Hamburger sur desktop** : cache la nav sans raison, tue la découvrabilité. Réservé à mobile quand la place manque vraiment. (NN/g, Baymard confirment une baisse d'engagement de 20-50% vs nav visible.)
3. **Mélanger deux modèles mentaux** : nav par feature (Inbox, Projects) + nav par objet (Contacts, Tasks) dans la même barre. Choisis un seul axe structurant.
4. **Labels ambigus ou dev-centric** : "Manager", "Dashboard", "Overview", "Workspace" — ces mots ne veulent rien dire tout seuls. Préférer des labels concrets (Projets, Tâches, Factures).
5. **Profondeur excessive** : 5 niveaux de menus déroulants = cauchemar. Règle de pouce Optimal Workshop : **large et plat > étroit et profond**, tant que chaque niveau reste ≤7 items.
6. **Oublier le wayfinding** : pas de titre de page, pas de breadcrumb, pas de state indicator sur la nav active → utilisateur perdu.
7. **Command palette sans nav visible** : pattern "search-first pur" à la Superhuman fonctionne UNIQUEMENT pour power users. Pour le grand public, garder une nav visible ET ajouter Cmd+K en bonus.

## 10. Références autoritatives

- Nielsen Norman Group — *Information Architecture: Study Guide* : https://www.nngroup.com/articles/ia-study-guide/
- Nielsen Norman Group — *Card Sorting: Uncover Users' Mental Models* : https://www.nngroup.com/articles/card-sorting-definition/
- Nielsen Norman Group — *Tree Testing* : https://www.nngroup.com/articles/tree-testing/
- Abby Covert — *How to Make Sense of Any Mess* : https://www.howtomakesenseofanymess.com/
- Optimal Workshop — *IA guides & Treejack* : https://www.optimalworkshop.com/learn/
- Baymard Institute — *Main Navigation UX* : https://baymard.com/blog/main-navigation-ux
- Material 3 — *Navigation* : https://m3.material.io/foundations/layout/understanding-layout/parts-of-layout (nav rail, bottom bar, drawer)
- Apple Human Interface Guidelines — *Navigation* : https://developer.apple.com/design/human-interface-guidelines/navigation-and-search
- Shopify Polaris — *Navigation* : https://polaris.shopify.com/components/navigation/navigation
- Linear method — *Craft & navigation* : https://linear.app/method
- Notion — exemples concrets de sidebar arborescente + Cmd+K (étude de cas UX Collective).

## 11. Priorité MVP

**Must (MVP v1)**
- Screen Picker "5 choses" (mode Débutant)
- Sitemap Builder drag & drop (mode Intermédiaire)
- Nav Pattern Selector avec live preview (3 patterns min : sidebar, top tabs, bottom nav)
- Validation Miller's Law + profondeur + labels génériques
- Export sitemap.md + url-map.csv
- Tooltips pédagogiques clés (hamburger anti-pattern, hub-and-spoke, Miller's Law)

*Justification : sans ces briques, on ne répond pas à la promesse "de l'enfant 12 ans à l'expert". Le Screen Picker est la porte d'entrée cruciale, le Sitemap Builder le cœur du chapitre.*

**Should (v1.1)**
- Entity-Relation Mini-Editor (mode Expert)
- Label Suggester (dictionnaire jargon → user)
- URL structure validator
- Breadcrumb auto-generator
- Device context switcher (desktop/mobile)

*Justification : nécessaire pour atteindre le niveau "designer expert" et éviter les incohérences qui polluent les codebases plus tard.*

**Nice (v2)**
- Tree Test simulator léger (5 tâches, heatmap)
- Card Sort intégré (ouvert/fermé)
- Command Palette Planner
- Intégration directe avec le schéma DB du projet (entités → migrations SQL proposées)

*Justification : outils de validation empirique — utiles mais avancés. Passage en v2 une fois le core stabilisé.*

## 12. Estimation complexité d'implémentation

| Widget | Taille | Justification |
|---|---|---|
| Screen Picker "5 choses" | **S** | Checklist + mapping statique écrans→templates. 1-2 jours. |
| Sitemap Builder drag & drop | **L** | Arbre interactif, DnD, persistance, validation profondeur. Lib type `dnd-kit`. 5-8 jours. |
| Nav Pattern Selector + Live Preview | **M** | 3-6 patterns, mockups SVG/CSS adaptatifs. 3-4 jours. |
| Entity-Relation Editor | **L** | Création entités/attributs/relations, visualisation graphe (type ERD). Lib `reactflow` possible. 6-10 jours. |
| Label Suggester | **S** | Dictionnaire statique + détection incohérences par règles. 1-2 jours. |
| URL Structure Validator | **S** | Règles regex + linter. 1 jour. |
| Breadcrumb Auto-generator | **S** | Dérivation directe du sitemap. <1 jour. |
| Command Palette Planner | **M** | Liste d'actions + suggestion raccourcis + preview overlay. 2-3 jours. |
| Tree Test Simulator | **XL** | Flow de test multi-étapes, collecte de données, heatmap, rapport. 10-15 jours. |
| Card Sort Simulator | **L** | DnD de cartes en catégories, scoring de cohérence, export. 5-7 jours. |

**Complexité globale du chapitre** : **L à XL**. C'est le chapitre le plus "outillé" du produit : on bâtit un mini-Optimal Workshop intégré. MVP doable en L (2-3 semaines à un dev), version complète en XL (6-8 semaines).

---

**Note sans sycophantie** : beaucoup de produits récents abusent du **command palette-first** (inspirés par Linear/Raycast). C'est un pattern génial pour power users, mais catastrophique pour un enfant de 12 ans ou un business owner non-tech. Mindeck doit refuser la tentation "on copie Linear" et rendre la nav visible par défaut, Cmd+K en bonus. De même, la **sidebar collapsible** est devenue un tic — elle n'est utile que si ton app a >7 sections. Pour un outil simple, une bonne top-nav à 4 items écrase une sidebar mal remplie.
